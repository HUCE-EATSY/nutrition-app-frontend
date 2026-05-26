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

export const ONBOARDING_STEPS = new Proxy(new Array(12).fill(null) as unknown as {
  name: OnboardingRouteName;
  path: OnboardingRoutePath;
  question: string;
}[], {
  get(target, prop, receiver) {
    const list = [
      { name: "Nickname" as const, path: "/(onboarding)/nickname" as const, question: t.onboarding.questions.Nickname },
      { name: "Gender" as const, path: "/(onboarding)/gender" as const, question: t.onboarding.questions.Gender },
      { name: "BirthDate" as const, path: "/(onboarding)/birth-date" as const, question: t.onboarding.questions.BirthDate },
      { name: "Height" as const, path: "/(onboarding)/height" as const, question: t.onboarding.questions.Height },
      { name: "GoalType" as const, path: "/(onboarding)/goal-type" as const, question: t.onboarding.questions.GoalType },
      { name: "CurrentWeight" as const, path: "/(onboarding)/current-weight" as const, question: t.onboarding.questions.CurrentWeight },
      { name: "TargetWeight" as const, path: "/(onboarding)/target-weight" as const, question: t.onboarding.questions.TargetWeight },
      { name: "ActivityLevel" as const, path: "/(onboarding)/activity-level" as const, question: t.onboarding.questions.ActivityLevel },
      { name: "WeeklyGoal" as const, path: "/(onboarding)/weekly-goal" as const, question: t.onboarding.questions.WeeklyGoal },
      { name: "ReviewSummary" as const, path: "/(onboarding)/review-summary" as const, question: t.onboarding.questions.ReviewSummary },
      { name: "Calculating" as const, path: "/(onboarding)/calculating" as const, question: t.onboarding.questions.Calculating },
      { name: "PlanResult" as const, path: "/(onboarding)/plan-result" as const, question: t.onboarding.questions.PlanResult },
    ];
    return Reflect.get(list, prop, receiver);
  }
});

export const PUBLIC_FLOW_PATHS: Record<PublicFlowStep, OnboardingRoutePath | "/(tabs)/home"> = {
  welcome: "/(public)/welcome",
  "social-login": "/(public)/social-login",
  "mascot-intro": "/(public)/mascot-intro",
  done: "/(onboarding)/nickname",
};

export const genderOptions = new Proxy([null, null] as unknown as OptionItem<"female" | "male">[], {
  get(target, prop, receiver) {
    const list = [
      { value: "female" as const, title: t.onboarding.genderOptions.female.title, accent: "#FF8FD1" },
      { value: "male" as const, title: t.onboarding.genderOptions.male.title, accent: "#72A4FF" },
    ];
    return Reflect.get(list, prop, receiver);
  }
});

export const goalOptions = new Proxy([null, null, null] as unknown as OptionItem<GoalType>[], {
  get(target, prop, receiver) {
    const list = [
      { value: "lose_weight" as const, title: t.onboarding.goalOptions.lose_weight.title, subtitle: t.onboarding.goalOptions.lose_weight.subtitle, accent: "#FF8A8A" },
      { value: "maintain_weight" as const, title: t.onboarding.goalOptions.maintain_weight.title, subtitle: t.onboarding.goalOptions.maintain_weight.subtitle, accent: "#70D9A4" },
      { value: "gain_weight" as const, title: t.onboarding.goalOptions.gain_weight.title, subtitle: t.onboarding.goalOptions.gain_weight.subtitle, accent: "#F7C567" },
    ];
    return Reflect.get(list, prop, receiver);
  }
});

export const activityOptions = new Proxy([null, null, null, null, null] as unknown as OptionItem<ActivityLevel>[], {
  get(target, prop, receiver) {
    const list = [
      { value: "sedentary" as const, title: t.onboarding.activityOptions.sedentary.title, subtitle: t.onboarding.activityOptions.sedentary.subtitle, accent: "#8E89A6" },
      { value: "light" as const, title: t.onboarding.activityOptions.light.title, subtitle: t.onboarding.activityOptions.light.subtitle, accent: "#77C5FF" },
      { value: "moderate" as const, title: t.onboarding.activityOptions.moderate.title, subtitle: t.onboarding.activityOptions.moderate.subtitle, accent: "#8FE18B" },
      { value: "active" as const, title: t.onboarding.activityOptions.active.title, subtitle: t.onboarding.activityOptions.active.subtitle, accent: "#D6A0FF" },
      { value: "very_active" as const, title: t.onboarding.activityOptions.very_active.title, subtitle: t.onboarding.activityOptions.very_active.subtitle, accent: "#FFAF7B" },
    ];
    return Reflect.get(list, prop, receiver);
  }
});


