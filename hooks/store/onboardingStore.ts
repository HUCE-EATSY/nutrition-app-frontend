import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  ActivityLevel,
  Gender,
  GoalType,
  NutritionPlan,
  OnboardingDraft,
  OnboardingRouteName,
  PublicFlowStep,
} from "@/constants/types/contracts";
import { getTodayISO } from "@/hooks/utils/date";
import { getDefaultWeeklyGoal } from "@/domain/onboarding";

import { secureStorage } from "./secureStorage";

const createInitialDraft = (): OnboardingDraft => ({
  nickname: null,
  gender: null,
  birthDateISO: null,
  heightCm: null,
  goalType: null,
  currentWeightKg: null,
  targetWeightKg: null,
  activityLevel: null,
  weeklyGoalKg: null,
  completedSteps: [],
  updatedAt: getTodayISO(),
});

type OnboardingStoreState = {
  hydrated: boolean;
  publicFlowStep: PublicFlowStep;
  hasCompletedOnboarding: boolean;
  draft: OnboardingDraft;
  serverPlan: NutritionPlan | null;
  setHydrated: (value: boolean) => void;
  setPublicFlowStep: (step: PublicFlowStep) => void;
  setServerPlan: (plan: NutritionPlan) => void;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
  markStepCompleted: (step: OnboardingRouteName) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

function updateDraft(draft: OnboardingDraft, patch: Partial<OnboardingDraft>): OnboardingDraft {
  const merged = {
    ...draft,
    ...patch,
    updatedAt: getTodayISO(),
  };
  if (patch.goalType !== undefined && merged.weeklyGoalKg === null) {
    merged.weeklyGoalKg = getDefaultWeeklyGoal(patch.goalType);
  }
  return merged;
}

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist(
    (set: (fn: (state: OnboardingStoreState) => Partial<OnboardingStoreState>) => void) => ({
      hydrated: false,
      publicFlowStep: "welcome",
      hasCompletedOnboarding: false,
      draft: createInitialDraft(),
      serverPlan: null,
      setHydrated: (value: boolean) => set(() => ({ hydrated: value })),
      setPublicFlowStep: (step: PublicFlowStep) => set(() => ({ publicFlowStep: step })),
      setServerPlan: (plan: NutritionPlan) => set(() => ({ serverPlan: plan })),
      updateDraft: (patch) => set((state) => ({ draft: updateDraft(state.draft, patch) })),
      markStepCompleted: (step) =>
        set((state) => ({
          draft: updateDraft(state.draft, {
            completedSteps: state.draft.completedSteps.includes(step)
              ? state.draft.completedSteps
              : [...state.draft.completedSteps, step],
          }),
        })),
      completeOnboarding: () => set(() => ({ hasCompletedOnboarding: true })),
      reset: () =>
        set(() => ({
          publicFlowStep: "welcome",
          hasCompletedOnboarding: false,
          draft: createInitialDraft(),
        })),
    }),
    {
      name: "dnt-onboarding-store",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state: OnboardingStoreState) => ({
        publicFlowStep: state.publicFlowStep,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        draft: state.draft,
        serverPlan: state.serverPlan,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

