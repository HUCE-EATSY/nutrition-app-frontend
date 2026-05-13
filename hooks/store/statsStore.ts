import { create } from "zustand";
import { ActivityPeriod, NutritionPeriod, StepsPeriod, WeightPeriod } from "@/constants/stats";

interface NutritionState {
  period: NutritionPeriod;
  setPeriod: (period: NutritionPeriod) => void;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  period: NutritionPeriod.DAY,
  setPeriod: (period) => set({ period }),
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
}

export const useWeightStore = create<WeightState>((set) => ({
  period: WeightPeriod.ONE_MONTH,
  setPeriod: (period) => set({ period }),
}));
