import { create } from "zustand";
import { ActivityPeriod, NutritionPeriod, StepsPeriod, WeightPeriod } from "@/constants/stats";
import { DailySummaryResponse, WeightLogEntry } from "@/constants/types/contracts";
import { getDailySummary } from "@/services/nutritionLogService";
import { getWeightTimeline, getUserGoal } from "@/services/weightLogService";
import { getTodayDateISO, getDateRangeForPeriod } from "@/hooks/utils/date";

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
}

export const useStepsStore = create<StepsState>((set) => ({
  period: StepsPeriod.WEEK,
  setPeriod: (period) => set({ period }),
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
        targetWeightKg: goal?.goal_weight_kg ?? null,
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
