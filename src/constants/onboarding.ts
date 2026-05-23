import {
  ActivityLevel,
  GoalType,
  OnboardingRouteName,
  OnboardingRoutePath,
  OptionItem,
  PublicFlowStep,
} from "@/types/contracts";
import { t } from "@/constants/i18n";

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
  { value: "female", title: t.onboarding.genderOptions.female.title, accent: "#FF8FD1" },
  { value: "male", title: t.onboarding.genderOptions.male.title, accent: "#72A4FF" },
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
