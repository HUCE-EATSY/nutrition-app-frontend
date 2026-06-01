import { Alert } from "react-native";
import {
  BMIStatus,
  GoalType,
  OnboardingDraft,
  OnboardingRouteName,
  OnboardingRoutePath,
  PublicFlowStep,
} from "@/types/contracts";
import { t } from "@/constants/i18n";
import { clamp, getAgeFromBirthDate } from "@/utils/date";
import {
  ONBOARDING_STEPS,
  PUBLIC_FLOW_PATHS,
} from "@/constants/onboarding";

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getOnboardingSteps(goalType?: GoalType | null) {
  let resolvedGoal = goalType;
  if (resolvedGoal === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useOnboardingStore } = require("@/store/onboardingStore");
    resolvedGoal = useOnboardingStore.getState().draft.goalType;
  }
  return ONBOARDING_STEPS.filter((step) => {
    if (resolvedGoal === "maintain_weight") {
      return step.name !== "TargetWeight" && step.name !== "WeeklyGoal";
    }
    return true;
  });
}

export function getOnboardingMeta(routeName: OnboardingRouteName, goalType?: GoalType | null) {
  const steps = getOnboardingSteps(goalType);
  const index = steps.findIndex((step) => step.name === routeName);
  const reviewSummaryIndex = steps.findIndex((step) => step.name === "ReviewSummary");
  const totalSteps = reviewSummaryIndex !== -1 ? reviewSummaryIndex + 1 : steps.length;
  
  return {
    step: index !== -1 ? index + 1 : 1,
    totalSteps,
  };
}

export function getNextOnboardingPath(routeName: OnboardingRouteName, goalType?: GoalType | null): OnboardingRoutePath {
  const steps = getOnboardingSteps(goalType);
  const currentIndex = steps.findIndex((step) => step.name === routeName);
  if (currentIndex === -1) {
    const originalIndex = ONBOARDING_STEPS.findIndex((step) => step.name === routeName);
    return ONBOARDING_STEPS[Math.min(originalIndex + 1, ONBOARDING_STEPS.length - 1)].path;
  }
  return steps[Math.min(currentIndex + 1, steps.length - 1)].path;
}

export function getPreviousOnboardingPath(routeName: OnboardingRouteName, goalType?: GoalType | null): OnboardingRoutePath {
  const steps = getOnboardingSteps(goalType);
  const currentIndex = steps.findIndex((step) => step.name === routeName);
  if (currentIndex === -1) {
    const originalIndex = ONBOARDING_STEPS.findIndex((step) => step.name === routeName);
    return ONBOARDING_STEPS[Math.max(originalIndex - 1, 0)].path;
  }
  return steps[Math.max(currentIndex - 1, 0)].path;
}

export function getDefaultWeeklyGoal(goalType: GoalType | null) {
  if (goalType === "maintain_weight") {
    return 0;
  }
  if (goalType === "gain_weight") {
    return 0.3;
  }
  return 0.4;
}

export function getPublicResumePath(step: PublicFlowStep) {
  return PUBLIC_FLOW_PATHS[step];
}

export function getDraftResumePath(draft: OnboardingDraft): OnboardingRoutePath {
  if (!draft.nickname) return "/(onboarding)/nickname";
  if (!draft.gender) return "/(onboarding)/gender";
  if (!draft.birthDateISO) return "/(onboarding)/birth-date";
  if (!draft.heightCm) return "/(onboarding)/height";
  if (!draft.goalType) return "/(onboarding)/goal-type";
  if (!draft.currentWeightKg) return "/(onboarding)/current-weight";
  
  if (draft.goalType !== "maintain_weight") {
    if (!draft.targetWeightKg) return "/(onboarding)/target-weight";
  }
  
  if (!draft.activityLevel) return "/(onboarding)/activity-level";
  
  if (draft.goalType !== "maintain_weight") {
    if (draft.weeklyGoalKg === null) return "/(onboarding)/weekly-goal";
  }
  
  return "/(onboarding)/review-summary";
}

export function isOnboardingReady(draft: OnboardingDraft) {
  if (draft.goalType === "maintain_weight") {
    return Boolean(
      draft.nickname &&
        draft.gender &&
        draft.birthDateISO &&
        draft.heightCm &&
        draft.goalType &&
        draft.currentWeightKg &&
        draft.activityLevel
    );
  }
  return Boolean(
    draft.nickname &&
      draft.gender &&
      draft.birthDateISO &&
      draft.heightCm &&
      draft.goalType &&
      draft.currentWeightKg &&
      draft.targetWeightKg &&
      draft.activityLevel &&
      draft.weeklyGoalKg !== null
  );
}

// ── Validators ───────────────────────────────────────────────────────────────

export function validateNickname(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 2) return t.validators.nicknameMin;
  if (trimmed.length > 24) return t.validators.nicknameMax;
  return null;
}

export function validateAdultBirthDate(dateISO: string) {
  const birthDate = new Date(dateISO);
  if (Number.isNaN(birthDate.getTime())) return t.validators.invalidBirthDate;

  const age = getAgeFromBirthDate(dateISO);
  if (age < 18) return t.validators.adultOnly;
  return null;
}

export function validateTargetWeight(goalType: GoalType | null, currentWeightKg: number | null, targetWeightKg: number | null) {
  if (!goalType || !currentWeightKg || !targetWeightKg) return t.validators.targetWeightMissing;

  if (goalType === "lose_weight" && targetWeightKg >= currentWeightKg) return t.validators.loseWeightInvalid;
  if (goalType === "gain_weight" && targetWeightKg <= currentWeightKg) return t.validators.gainWeightInvalid;
  if (goalType === "maintain_weight" && Math.abs(targetWeightKg - currentWeightKg) > 1) return t.validators.maintainWeightInvalid;

  return null;
}

export function getWeeklyGoalBounds(goalType: GoalType | null) {
  if (goalType === "maintain_weight") return { min: 0, max: 0.2, recommended: 0 };
  return { min: 0.1, max: 2, recommended: goalType === "gain_weight" ? 0.3 : 0.4 };
}

export function sanitizeWeeklyGoal(goalType: GoalType | null, value: number) {
  const bounds = getWeeklyGoalBounds(goalType);
  return Number(clamp(value, bounds.min, bounds.max).toFixed(1));
}

export function validateWeeklyGoal(goalType: GoalType | null, value: number | null) {
  if (value === null) return t.validators.weeklyGoalRequired;

  const bounds = getWeeklyGoalBounds(goalType);
  if (value < bounds.min || value > bounds.max) return t.validators.weeklyGoalRange(bounds.min, bounds.max);
  return null;
}

// ── BMI Helpers ──────────────────────────────────────────────────────────────

export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBmiStatus(bmiValue: number): BMIStatus {
  if (bmiValue < 18.5) return "underweight";
  if (bmiValue < 23) return "normal";
  if (bmiValue < 25) return "overweight";
  return "obese";
}

export function getBmiStatusColors(status: BMIStatus) {
  switch (status) {
    case "underweight":
      return {
        badgeBg: "rgba(61, 139, 255, 0.2)",
        badgeText: "#3D8BFF",
        valueColor: "#3D8BFF",
      };
    case "normal":
      return {
        badgeBg: "rgba(92, 214, 122, 0.2)",
        badgeText: "#5CD67A",
        valueColor: "#5CD67A",
      };
    case "overweight":
      return {
        badgeBg: "#F5B323",
        badgeText: "#111020",
        valueColor: "#F5B323",
      };
    case "obese":
      return {
        badgeBg: "rgba(255, 90, 95, 0.2)",
        badgeText: "#FF5A5F",
        valueColor: "#FF5A5F",
      };
  }
}

export function getTargetBmiDesc(status: BMIStatus): string {
  return t.nutrition.targetBmiDescriptions[status];
}

export function showBmiReferencesAlert() {
  Alert.alert(
    t.nutrition.bmiSource,
    t.nutrition.bmiSourceDetail,
    [{ text: t.common.close, style: "cancel" }]
  );
}
