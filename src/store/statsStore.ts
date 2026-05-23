import { create } from "zustand";
import { ActivityPeriod, NutritionPeriod, StepsPeriod, WeightPeriod } from "@/constants/stats";
import { DailySummaryResponse, WeightLogEntry } from "@/types/contracts";
import { getDailySummary } from "@/services/nutritionLogService";
import { getWeightTimeline, getUserGoal } from "@/services/weightLogService";
import { getTodayDateISO, getDateRangeForPeriod } from "@/utils/date";
import { healthConnectService } from "@/services/healthConnectService";

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
  setPeriod: (period: StepsPeriod) => void;

  isSupported: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  todaySteps: number;
  stepGoal: number;
  averageSteps: number;
  previousAverageSteps: number;
  historyData: { label: string; value: number }[];

  checkConnection: () => Promise<boolean>;
  connectAndSync: () => Promise<void>;
  fetchTodaySteps: () => Promise<void>;
  fetchHistory: (period: StepsPeriod) => Promise<void>;
}

export const useStepsStore = create<StepsState>((set, get) => ({
  period: StepsPeriod.WEEK,
  setPeriod: (period) => {
    set({ period });
    get().fetchHistory(period);
  },

  isSupported: false,
  isConnected: false,
  isLoading: false,
  error: null,

  todaySteps: 0,
  stepGoal: 5000, // Mục tiêu mặc định
  averageSteps: 0,
  previousAverageSteps: 0,
  historyData: [],

  checkConnection: async () => {
    const isSupported = await healthConnectService.isAvailable();
    let isConnected = false;
    if (isSupported) {
      isConnected = await healthConnectService.checkStepsPermission();
    }
    set({ isSupported, isConnected });
    return isConnected;
  },

  connectAndSync: async () => {
    set({ isLoading: true, error: null });
    try {
      const isSupported = await healthConnectService.isAvailable();
      if (!isSupported) {
        set({
          isSupported: false,
          isConnected: false,
          isLoading: false,
          error: "Health Connect không khả dụng trên thiết bị này",
        });
        return;
      }

      const granted = await healthConnectService.requestStepsPermission();
      if (granted) {
        set({ isSupported: true, isConnected: true });
        await get().fetchTodaySteps();
        await get().fetchHistory(get().period);
      } else {
        set({ isConnected: false, error: "Quyền truy cập bước chân bị từ chối" });
      }
    } catch (err: any) {
      set({ error: err.message || "Lỗi kết nối Health Connect" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodaySteps: async () => {
    set({ isLoading: true, error: null });
    try {
      const steps = await healthConnectService.fetchTodaySteps();
      set({ todaySteps: steps });
    } catch (err: any) {
      set({ error: err.message || "Lỗi tải số bước hôm nay" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHistory: async (period) => {
    set({ isLoading: true, error: null });
    try {
      const endDate = new Date();
      const startDate = new Date();

      let daysCount = 7;
      if (period === StepsPeriod.WEEK) {
        daysCount = 7;
      } else if (period === StepsPeriod.MONTH) {
        daysCount = 30;
      } else if (period === StepsPeriod.SIX_MONTHS) {
        daysCount = 180;
      }

      // Lấy gấp đôi số ngày để tính trung bình chu kỳ trước đó
      startDate.setDate(endDate.getDate() - (daysCount * 2 - 1));

      const rawHistory = await healthConnectService.fetchStepsHistory(startDate, endDate);

      // Tách thành 2 chu kỳ: chu kỳ hiện tại và chu kỳ trước
      const currentPeriodData = rawHistory.slice(-daysCount);
      const previousPeriodData = rawHistory.slice(0, -daysCount);

      // Định dạng nhãn và dữ liệu cho BarChart (chỉ vẽ chu kỳ hiện tại)
      const mapped = currentPeriodData.map((item) => {
        let label = "";
        const dateObj = new Date(item.dateISO);
        if (period === StepsPeriod.WEEK) {
          const weekdayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
          label = weekdayLabels[dateObj.getDay()];
        } else {
          const day = dateObj.getDate().toString().padStart(2, "0");
          const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
          label = `${day}/${month}`;
        }
        return {
          label,
          value: item.steps,
        };
      });

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
}));

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
      } catch (e) {
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
