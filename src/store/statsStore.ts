import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ActivityPeriod, NutritionPeriod, StepsPeriod, WeightPeriod } from "@/constants/stats";
import { DailySummaryResponse, WeightLogEntry, StepLogEntry } from "@/types/contracts";
import { getDailySummary } from "@/services/nutritionLogService";
import { getWeightTimeline, getUserGoal } from "@/services/weightLogService";
import { getTodayDateISO, getDateRangeForPeriod } from "@/utils/date";
import { AppState, Platform } from "react-native";
import { pedometerService } from "@/services/pedometerService";
import { secureStorage } from "./secureStorage";
import { getStepsTimeline, saveStepLog } from "@/services/stepLogService";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

let syncTimeout: NodeJS.Timeout | null = null;
const debounceSyncSteps = (steps: number, goal: number, dateISO: string, provider: number, calories: number) => {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(async () => {
    try {
      await saveStepLog(steps, goal, dateISO, provider, calories);
    } catch (err) {
      console.warn("Lỗi đồng bộ số bước chân lên backend:", err);
    }
  }, 3000);
};

let pedometerSubscription: { remove: () => void } | null = null;
let lastPedometerSteps = 0;

interface NutritionState {
  period: NutritionPeriod;
  setPeriod: (period: NutritionPeriod) => void;

  selectedDate: string;
  summaryCache: Record<string, DailySummaryResponse>;
  isLoading: boolean;
  error: string | null;

  setSelectedDate: (date: string) => void;
  fetchSummary: (date: string) => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  period: NutritionPeriod.DAY,
  setPeriod: (period) => set({ period }),

  selectedDate: getTodayDateISO(),
  summaryCache: {},
  isLoading: false,
  error: null,

  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchSummary: async (date) => {
    const state = get();
    // If data for this date is already cached, don't fetch
    if (state.summaryCache[date]) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await getDailySummary(date);
      set((prev) => ({
        summaryCache: {
          ...prev.summaryCache,
          [date]: data,
        },
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Không thể tải dữ liệu",
        isLoading: false
      });
    }
  },
}));

interface ActivityState {
  period: ActivityPeriod;
  setPeriod: (period: ActivityPeriod) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  period: ActivityPeriod.WEEK,
  setPeriod: (period) => set({ period }),
}));

interface StepsState {
  period: StepsPeriod;
  offset: number;
  setPeriod: (period: StepsPeriod) => void;
  setOffset: (offset: number) => void;

  isSupported: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;

  todaySteps: number;
  stepGoal: number;
  averageSteps: number;
  previousAverageSteps: number;
  historyData: { label: string; value: number; goal: number }[];
  historicalGoals: Record<string, number>;
  stepRecords: Record<string, number>;

  checkConnection: () => Promise<boolean>;
  connectAndSync: () => Promise<void>;
  fetchTodaySteps: () => Promise<void>;
  fetchHistory: (period: StepsPeriod, offset?: number) => Promise<void>;
  setStepGoal: (goal: number) => void;
  startStepTracking: () => void;
  stopStepTracking: () => void;
  setHydrated: (value: boolean) => void;
}

// Helper to get calendar aligned dates
const getPeriodRange = (period: StepsPeriod, offset: number) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (period === StepsPeriod.WEEK) {
    // Tìm ngày Thứ 2 của tuần hiện tại
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
    
    // Áp dụng offset theo tuần
    monday.setDate(monday.getDate() + offset * 7);
    
    startDate = new Date(monday);
    
    endDate = new Date(monday);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === StepsPeriod.MONTH) {
    // Đầu tháng với offset
    const firstDay = new Date(now.getFullYear(), now.getMonth() + offset, 1, 0, 0, 0, 0);
    startDate = firstDay;

    // Cuối tháng
    const lastDay = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59, 999);
    endDate = lastDay;
  } else if (period === StepsPeriod.SIX_MONTHS) {
    // Chu kỳ 6 tháng kết thúc ở tháng hiện tại + offset * 6
    const endMonth = now.getMonth() + offset * 6;
    const startMonth = endMonth - 5;

    startDate = new Date(now.getFullYear(), startMonth, 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), endMonth + 1, 0, 23, 59, 59, 999);
  }

  return { startDate, endDate };
};

export const useStepsStore = create<StepsState>()(
  persist(
    (set, get) => ({
      period: StepsPeriod.WEEK,
      offset: 0,
      setPeriod: (period) => {
        set({ period, offset: 0 });
        get().fetchHistory(period, 0);
      },
      setOffset: (offset) => {
        set({ offset });
        get().fetchHistory(get().period, offset);
      },

      isSupported: false,
      isConnected: false,
      isLoading: false,
      error: null,
      hydrated: false,

      todaySteps: 0,
      stepGoal: 8000, // Mục tiêu mặc định là 8,000 bước như mockup
      averageSteps: 0,
      previousAverageSteps: 0,
      historyData: [],
      historicalGoals: {},
      stepRecords: {},

      setHydrated: (value) => set({ hydrated: value }),

      checkConnection: async () => {
        const isSupported = await pedometerService.isAvailable();
        let isConnected = false;
        if (isSupported) {
          isConnected = await pedometerService.checkStepsPermission();
        }
        set({ isSupported, isConnected });
        return isConnected;
      },

      connectAndSync: async () => {
        set({ isLoading: true, error: null });
        try {
          const isSupported = await pedometerService.isAvailable();
          if (!isSupported) {
            set({
              isSupported: false,
              isConnected: false,
              isLoading: false,
              error: "Cảm biến bước chân không khả dụng trên thiết bị này",
            });
            return;
          }

          const granted = await pedometerService.requestStepsPermission();
          if (granted) {
            set({ isSupported: true, isConnected: true });
            await get().fetchTodaySteps();
            get().startStepTracking();
            await get().fetchHistory(get().period, get().offset);
          } else {
            set({ isConnected: false, error: "Quyền truy cập bước chân bị từ chối" });
          }
        } catch (err: any) {
          set({ error: err.message || "Lỗi kết nối cảm biến bước chân" });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchTodaySteps: async () => {
        set({ isLoading: true, error: null });
        try {
          const steps = await pedometerService.fetchTodaySteps();
          const todayStr = getTodayDateISO();
          const persistedSteps = (get().stepRecords || {})[todayStr] || 0;
          let finalSteps = Math.max(steps, persistedSteps);
          
          if (!USE_MOCK) {
            try {
              const backendTimeline = await getStepsTimeline(todayStr, todayStr);
              if (backendTimeline && backendTimeline.length > 0) {
                const backendToday = backendTimeline[0];
                finalSteps = Math.max(finalSteps, backendToday.steps);
                
                if (backendToday.step_goal && backendToday.step_goal !== get().stepGoal) {
                  set({ stepGoal: backendToday.step_goal });
                }
              }
            } catch (err) {
              console.warn("Lỗi tải thông tin bước chân hôm nay từ backend:", err);
            }
          }

          const updatedRecords = { ...(get().stepRecords || {}) };
          updatedRecords[todayStr] = finalSteps;

          set({ 
            todaySteps: finalSteps,
            stepRecords: updatedRecords
          });

          if (!USE_MOCK) {
            const provider = Platform.OS === "ios" ? 1 : 2;
            const calories = finalSteps * 0.04;
            await saveStepLog(finalSteps, get().stepGoal, todayStr, provider, calories);
          }
        } catch (err: any) {
          set({ error: err.message || "Lỗi tải số bước hôm nay" });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchHistory: async (period, offset = 0) => {
        set({ isLoading: true, error: null });
        try {
          const { startDate, endDate } = getPeriodRange(period, offset);
          const { startDate: prevStartDate } = getPeriodRange(period, offset - 1);

          // Lấy dữ liệu gộp cả chu kỳ hiện tại và trước đó để tính trung bình
          const rawHistory = await pedometerService.fetchStepsHistory(prevStartDate, endDate);

          // Sắp xếp tăng dần theo thời gian
          const sortedHistory = [...rawHistory].sort(
            (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
          );

          // Lấy lịch sử từ backend nếu không phải mock
          let apiHistory: StepLogEntry[] = [];
          if (!USE_MOCK) {
            try {
              const fromStr = prevStartDate.toISOString().slice(0, 10);
              const toStr = endDate.toISOString().slice(0, 10);
              apiHistory = await getStepsTimeline(fromStr, toStr);
            } catch (err) {
              console.warn("Lỗi tải lịch sử bước chân từ backend:", err);
            }
          }

          // Gộp dữ liệu từ pedometerService, backend và local
          const mergedHistory = sortedHistory.map((item) => {
            const persistedSteps = (get().stepRecords || {})[item.dateISO] || 0;
            const apiDay = apiHistory.find(h => h.log_date === item.dateISO);
            const apiSteps = apiDay ? apiDay.steps : 0;
            const maxSteps = Math.max(item.steps, persistedSteps, apiSteps);

            // Tự động đồng bộ lên backend nếu dữ liệu local lớn hơn backend
            if (!USE_MOCK && maxSteps > apiSteps) {
              const provider = Platform.OS === "ios" ? 1 : 2;
              const calories = maxSteps * 0.04;
              const dayGoal = apiDay?.step_goal ?? get().stepGoal;
              saveStepLog(maxSteps, dayGoal, item.dateISO, provider, calories).catch(err => {
                console.warn(`Lỗi đồng bộ bước chân ngày ${item.dateISO} lên backend:`, err);
              });
            }

            // Đồng bộ ngược lại step goal từ API nếu có khác biệt
            if (apiDay && apiDay.step_goal && apiDay.step_goal !== (get().historicalGoals || {})[item.dateISO]) {
              const updatedGoals = { ...(get().historicalGoals || {}) };
              updatedGoals[item.dateISO] = apiDay.step_goal;
              set({ historicalGoals: updatedGoals });
            }

            return {
              ...item,
              steps: maxSteps,
            };
          });

          // Xác định số ngày trong chu kỳ hiện tại
          const currentDaysCount = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          // Chia làm 2 phần
          const currentPeriodData = mergedHistory.slice(-currentDaysCount);
          const previousPeriodData = mergedHistory.slice(0, -currentDaysCount);

          let mapped: { label: string; value: number; goal: number }[] = [];

          if (period === StepsPeriod.SIX_MONTHS) {
            // Generate the list of 6 months in the period
            const monthList: { year: number; month: number; label: string }[] = [];
            const temp = new Date(startDate);
            temp.setDate(1); // avoid DST shift issues
            while (temp <= endDate) {
              const y = temp.getFullYear();
              const m = temp.getMonth();
              const label = `Th${String(m + 1).padStart(2, "0")}`;
              monthList.push({ year: y, month: m, label });
              temp.setMonth(temp.getMonth() + 1);
            }

            mapped = monthList.map((m) => {
              const monthDays = currentPeriodData.filter((d) => {
                const dDate = new Date(d.dateISO);
                return dDate.getFullYear() === m.year && dDate.getMonth() === m.month;
              });

              const avgSteps = monthDays.length > 0
                ? Math.round(monthDays.reduce((sum, item) => sum + item.steps, 0) / monthDays.length)
                : 0;

              const lastDayStr = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(new Date(m.year, m.month + 1, 0).getDate()).padStart(2, "0")}`;
              const monthGoal = (get().historicalGoals || {})[lastDayStr] || get().stepGoal;

              return {
                label: m.label,
                value: avgSteps,
                goal: monthGoal,
              };
            });
          } else {
            // Tạo danh sách đầy đủ các ngày trong chu kỳ hiện tại (cho TUẦN và THÁNG)
            const dayList: { dateISO: string; label: string }[] = [];
            const cur = new Date(startDate);
            while (cur <= endDate) {
              const year = cur.getFullYear();
              const month = String(cur.getMonth() + 1).padStart(2, "0");
              const day = String(cur.getDate()).padStart(2, "0");
              const dateStr = `${year}-${month}-${day}`;

              let label = "";
              if (period === StepsPeriod.WEEK) {
                const weekdayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                label = weekdayLabels[cur.getDay()];
              } else {
                label = `${day}/${month}`;
              }

              dayList.push({
                dateISO: dateStr,
                label,
              });

              cur.setDate(cur.getDate() + 1);
            }

            mapped = dayList.map((d) => {
              const found = currentPeriodData.find((item) => item.dateISO === d.dateISO);
              const dayGoal = (get().historicalGoals || {})[d.dateISO] || get().stepGoal;
              return {
                label: d.label,
                value: found ? found.steps : 0,
                goal: dayGoal,
              };
            });
          }

          // Tính trung bình số bước
          const currentAvg = currentPeriodData.length > 0
            ? Math.round(currentPeriodData.reduce((sum, item) => sum + item.steps, 0) / currentPeriodData.length)
            : 0;

          const previousAvg = previousPeriodData.length > 0
            ? Math.round(previousPeriodData.reduce((sum, item) => sum + item.steps, 0) / previousPeriodData.length)
            : 0;

          set({
            historyData: mapped,
            averageSteps: currentAvg,
            previousAverageSteps: previousAvg,
          });
        } catch (err: any) {
          set({ error: err.message || "Lỗi tải lịch sử bước chân" });
        } finally {
          set({ isLoading: false });
        }
      },

      setStepGoal: (goal) => {
        const todayStr = getTodayDateISO();
        const prevGoal = get().stepGoal;
        const currentHistorical = get().historicalGoals || {};
        
        const updatedGoals = { ...currentHistorical };
        
        // Fill goals for the last 180 days to prevent them from changing when the global goal changes
        const now = new Date();
        for (let i = 1; i <= 180; i++) {
          const pastDate = new Date();
          pastDate.setDate(now.getDate() - i);
          const y = pastDate.getFullYear();
          const m = String(pastDate.getMonth() + 1).padStart(2, "0");
          const d = String(pastDate.getDate()).padStart(2, "0");
          const pastDateStr = `${y}-${m}-${d}`;
          
          if (updatedGoals[pastDateStr] === undefined) {
            updatedGoals[pastDateStr] = prevGoal;
          }
        }
        
        // Set goal for today
        updatedGoals[todayStr] = goal;
        
        set({
          stepGoal: goal,
          historicalGoals: updatedGoals,
        });

        // Đồng bộ mục tiêu bước chân lên backend cho ngày hôm nay
        if (!USE_MOCK) {
          const provider = Platform.OS === "ios" ? 1 : 2;
          const currentSteps = get().todaySteps || 0;
          const calories = currentSteps * 0.04;
          saveStepLog(currentSteps, goal, todayStr, provider, calories).catch(err => {
            console.warn("Lỗi đồng bộ mục tiêu bước chân lên backend:", err);
          });
        }
      },

      startStepTracking: () => {
        if (pedometerSubscription) {
          return;
        }

        lastPedometerSteps = 0;

        pedometerSubscription = pedometerService.watchSteps((stepsCount) => {
          const delta = stepsCount - lastPedometerSteps;
          lastPedometerSteps = stepsCount;

          if (delta > 0) {
            const todayStr = getTodayDateISO();
            const currentTodaySteps = get().todaySteps || 0;
            const updatedSteps = currentTodaySteps + delta;

            const updatedRecords = { ...(get().stepRecords || {}) };
            updatedRecords[todayStr] = updatedSteps;

            set({
              todaySteps: updatedSteps,
              stepRecords: updatedRecords,
            });

            // Cập nhật lại biểu đồ lịch sử
            get().fetchHistory(get().period, get().offset);

            // Đồng bộ số bước với debounce
            if (!USE_MOCK) {
              const provider = Platform.OS === "ios" ? 1 : 2;
              const calories = updatedSteps * 0.04;
              debounceSyncSteps(updatedSteps, get().stepGoal, todayStr, provider, calories);
            }
          }
        });
      },

      stopStepTracking: () => {
        if (pedometerSubscription) {
          pedometerSubscription.remove();
          pedometerSubscription = null;
        }
        lastPedometerSteps = 0;
      },
    }),
    {
      name: "dnt-steps-store",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ 
        isConnected: state.isConnected,
        stepGoal: state.stepGoal,
        historicalGoals: state.historicalGoals || {},
        stepRecords: state.stepRecords || {},
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state?.isConnected) {
          state.fetchTodaySteps();
          state.startStepTracking();
        }
      },
    }
  )
);

// Tự động theo dõi AppState để start/stop đếm bước chân thời gian thực
AppState.addEventListener("change", (nextAppState) => {
  try {
    const state = useStepsStore.getState();
    if (nextAppState === "active") {
      if (state.isConnected) {
        state.fetchTodaySteps();
        state.startStepTracking();
      }
    } else {
      state.stopStepTracking();
    }
  } catch (error) {
    console.error("Lỗi khi xử lý AppState change trong statsStore:", error);
  }
});

interface WeightState {
  period: WeightPeriod;
  setPeriod: (period: WeightPeriod) => void;

  weightLogs: WeightLogEntry[];
  targetWeightKg: number | null;
  isLoading: boolean;
  error: string | null;

  fetchWeightData: (period: WeightPeriod) => Promise<void>;
}

export const useWeightStore = create<WeightState>((set) => ({
  period: WeightPeriod.ONE_MONTH,
  setPeriod: (period) => set({ period }),

  weightLogs: [],
  targetWeightKg: null,
  isLoading: false,
  error: null,

  fetchWeightData: async (period) => {
    set({ isLoading: true, error: null });
    try {
      const { from, to } = getDateRangeForPeriod(period);

      const logs = await getWeightTimeline(from, to);
      let goal = null;
      try {
        goal = await getUserGoal();
      } catch {
        // Ignore goal fetch errors
      }

      set({
        weightLogs: logs,
        targetWeightKg: goal?.goalWeightKg ?? null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Không thể tải dữ liệu",
        isLoading: false,
      });
    }
  },
}));
