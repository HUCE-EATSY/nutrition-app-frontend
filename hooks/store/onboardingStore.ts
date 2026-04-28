import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  ActivityLevel,
  Gender,
  GoalType,
  OnboardingDraft,
  OnboardingRouteName,
  PublicFlowStep,
} from "@/constants/types/contracts";
import { getTodayISO } from "@/hooks/utils/date";
import { getDefaultWeeklyGoal } from "@/hooks/utils/onboarding";

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
  setHydrated: (value: boolean) => void;
  setPublicFlowStep: (step: PublicFlowStep) => void;
  setNickname: (nickname: string) => void;
  setGender: (gender: Gender) => void;
  setBirthDateISO: (birthDateISO: string) => void;
  setHeightCm: (heightCm: number) => void;
  setGoalType: (goalType: GoalType) => void;
  setCurrentWeightKg: (currentWeightKg: number) => void;
  setTargetWeightKg: (targetWeightKg: number) => void;
  setActivityLevel: (activityLevel: ActivityLevel) => void;
  setWeeklyGoalKg: (weeklyGoalKg: number) => void;
  markStepCompleted: (step: OnboardingRouteName) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

function updateDraft(draft: OnboardingDraft, patch: Partial<OnboardingDraft>): OnboardingDraft {
  return {
    ...draft,
    ...patch,
    updatedAt: getTodayISO(),
  };
}

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist(
    (set: (fn: (state: OnboardingStoreState) => Partial<OnboardingStoreState>) => void) => ({
      hydrated: false,
      publicFlowStep: "welcome",
      hasCompletedOnboarding: false,
      draft: createInitialDraft(),
      setHydrated: (value: boolean) => set(() => ({ hydrated: value })),
      setPublicFlowStep: (step: PublicFlowStep) => set(() => ({ publicFlowStep: step })),
      setNickname: (nickname) => set((state) => ({ draft: updateDraft(state.draft, { nickname }) })),
      setGender: (gender) => set((state) => ({ draft: updateDraft(state.draft, { gender }) })),
      setBirthDateISO: (birthDateISO) => set((state) => ({ draft: updateDraft(state.draft, { birthDateISO }) })),
      setHeightCm: (heightCm) => set((state) => ({ draft: updateDraft(state.draft, { heightCm }) })),
      setGoalType: (goalType) =>
        set((state) => ({
          draft: updateDraft(state.draft, {
            goalType,
            weeklyGoalKg:
              state.draft.weeklyGoalKg === null ? getDefaultWeeklyGoal(goalType) : state.draft.weeklyGoalKg,
          }),
        })),
      setCurrentWeightKg: (currentWeightKg) => set((state) => ({ draft: updateDraft(state.draft, { currentWeightKg }) })),
      setTargetWeightKg: (targetWeightKg) => set((state) => ({ draft: updateDraft(state.draft, { targetWeightKg }) })),
      setActivityLevel: (activityLevel) => set((state) => ({ draft: updateDraft(state.draft, { activityLevel }) })),
      setWeeklyGoalKg: (weeklyGoalKg) => set((state) => ({ draft: updateDraft(state.draft, { weeklyGoalKg }) })),
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
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: OnboardingStoreState) => ({
        publicFlowStep: state.publicFlowStep,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        draft: state.draft,
      }),
      onRehydrateStorage: () => (state: OnboardingStoreState | undefined) => {
        state?.setHydrated(true);
      },
    },
  ),
);
