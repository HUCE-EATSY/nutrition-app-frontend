import {
  ActivityLevel,
  GoalType,
  OnboardingDraft,
  OnboardingRouteName,
  OnboardingRoutePath,
  OptionItem,
  PublicFlowStep,
} from "@/src/types/contracts";
import { t } from "@/src/i18n";
import { getAgeFromBirthDate } from "@/src/utils/date";

export const DEFAULT_HEIGHT_CM = 168;
export const DEFAULT_CURRENT_WEIGHT_KG = 62;
export const DEFAULT_TARGET_WEIGHT_KG = 58;

export const ONBOARDING_STEPS: {
  name: OnboardingRouteName;
  path: OnboardingRoutePath;
  question: string;
}[] = [
  { name: "Nickname", path: "/(onboarding)/nickname", question: t.onboarding.questions.Nickname },
  { name: "Gender", path: "/(onboarding)/gender", question: t.onboarding.questions.Gender },
  { name: "BirthDate", path: "/(onboarding)/birth-date", question: t.onboarding.questions.BirthDate },
  { name: "Height", path: "/(onboarding)/height", question: t.onboarding.questions.Height },
  { name: "GoalType", path: "/(onboarding)/goal-type", question: t.onboarding.questions.GoalType },
  { name: "CurrentWeight", path: "/(onboarding)/current-weight", question: t.onboarding.questions.CurrentWeight },
  { name: "TargetWeight", path: "/(onboarding)/target-weight", question: t.onboarding.questions.TargetWeight },
  { name: "ActivityLevel", path: "/(onboarding)/activity-level", question: t.onboarding.questions.ActivityLevel },
  { name: "WeeklyGoal", path: "/(onboarding)/weekly-goal", question: t.onboarding.questions.WeeklyGoal },
  { name: "ReviewSummary", path: "/(onboarding)/review-summary", question: t.onboarding.questions.ReviewSummary },
  { name: "Calculating", path: "/(onboarding)/calculating", question: t.onboarding.questions.Calculating },
  { name: "PlanResult", path: "/(onboarding)/plan-result", question: t.onboarding.questions.PlanResult },
];

export const PUBLIC_FLOW_PATHS: Record<PublicFlowStep, OnboardingRoutePath | "/(tabs)/home"> = {
  welcome: "/(public)/welcome",
  "social-login": "/(public)/social-login",
  "mascot-intro": "/(public)/mascot-intro",
  done: "/(onboarding)/nickname",
};

export const genderOptions: OptionItem<"female" | "male">[] = [
  { value: "female", title: t.onboarding.genderOptions.female.title, subtitle: t.onboarding.genderOptions.female.subtitle, accent: "#FF8FD1" },
  { value: "male", title: t.onboarding.genderOptions.male.title, subtitle: t.onboarding.genderOptions.male.subtitle, accent: "#72A4FF" },
];

export const goalOptions: OptionItem<GoalType>[] = [
  { value: "lose_weight", title: t.onboarding.goalOptions.lose_weight.title, subtitle: t.onboarding.goalOptions.lose_weight.subtitle, accent: "#FF8A8A" },
  { value: "maintain_weight", title: t.onboarding.goalOptions.maintain_weight.title, subtitle: t.onboarding.goalOptions.maintain_weight.subtitle, accent: "#70D9A4" },
  { value: "gain_weight", title: t.onboarding.goalOptions.gain_weight.title, subtitle: t.onboarding.goalOptions.gain_weight.subtitle, accent: "#F7C567" },
];

export const activityOptions: OptionItem<ActivityLevel>[] = [
  { value: "sedentary", title: t.onboarding.activityOptions.sedentary.title, subtitle: t.onboarding.activityOptions.sedentary.subtitle, accent: "#8E89A6" },
  { value: "light", title: t.onboarding.activityOptions.light.title, subtitle: t.onboarding.activityOptions.light.subtitle, accent: "#77C5FF" },
  { value: "moderate", title: t.onboarding.activityOptions.moderate.title, subtitle: t.onboarding.activityOptions.moderate.subtitle, accent: "#8FE18B" },
  { value: "active", title: t.onboarding.activityOptions.active.title, subtitle: t.onboarding.activityOptions.active.subtitle, accent: "#D6A0FF" },
  { value: "very_active", title: t.onboarding.activityOptions.very_active.title, subtitle: t.onboarding.activityOptions.very_active.subtitle, accent: "#FFAF7B" },
];

export function getOnboardingMeta(routeName: OnboardingRouteName) {
  const index = ONBOARDING_STEPS.findIndex((step) => step.name === routeName);
  return {
    step: Math.max(index + 1, 1),
    totalSteps: 9,
  };
}

export function getNextOnboardingPath(routeName: OnboardingRouteName): OnboardingRoutePath {
  const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.name === routeName);
  return ONBOARDING_STEPS[Math.min(currentIndex + 1, ONBOARDING_STEPS.length - 1)].path;
}

export function getPreviousOnboardingPath(routeName: OnboardingRouteName): OnboardingRoutePath {
  const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.name === routeName);
  return ONBOARDING_STEPS[Math.max(currentIndex - 1, 0)].path;
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
  if (!draft.nickname) {
    return "/(onboarding)/nickname";
  }
  if (!draft.gender) {
    return "/(onboarding)/gender";
  }
  if (!draft.birthDateISO) {
    return "/(onboarding)/birth-date";
  }
  if (!draft.heightCm) {
    return "/(onboarding)/height";
  }
  if (!draft.goalType) {
    return "/(onboarding)/goal-type";
  }
  if (!draft.currentWeightKg) {
    return "/(onboarding)/current-weight";
  }
  if (!draft.targetWeightKg) {
    return "/(onboarding)/target-weight";
  }
  if (!draft.activityLevel) {
    return "/(onboarding)/activity-level";
  }
  if (draft.weeklyGoalKg === null) {
    return "/(onboarding)/weekly-goal";
  }
  return "/(onboarding)/review-summary";
}

export function isOnboardingReady(draft: OnboardingDraft) {
  return Boolean(
    draft.nickname &&
      draft.gender &&
      draft.birthDateISO &&
      draft.heightCm &&
      draft.goalType &&
      draft.currentWeightKg &&
      draft.targetWeightKg &&
      draft.activityLevel &&
      draft.weeklyGoalKg !== null,
  );
}
