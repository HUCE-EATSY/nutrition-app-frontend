import { Alert } from "react-native";
import {
  ActivityLevel,
  BMIStatus,
  GoalType,
  OnboardingDraft,
  OnboardingRouteName,
  OnboardingRoutePath,
  OptionItem,
  PublicFlowStep,
} from "@/constants/types/contracts";
import { t } from "@/constants/i18n";
import { clamp, getAgeFromBirthDate } from "@/hooks/utils/date";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";


// ── Constants ────────────────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getOnboardingSteps(goalType?: GoalType | null) {
  const resolvedGoal = goalType !== undefined ? goalType : useOnboardingStore.getState().draft.goalType;
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
  return { min: 0.1, max: 1, recommended: goalType === "gain_weight" ? 0.3 : 0.4 };
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
  switch (status) {
    case "underweight":
      return "Mục tiêu dưới vùng cân bằng. Bạn nên ưu tiên tăng cơ và bổ sung dinh dưỡng hợp lý.";
    case "normal":
      return "Mục tiêu nằm trong vùng cân bằng, cực kỳ lý tưởng để duy trì vóc dáng và sức khỏe lâu dài.";
    case "overweight":
      return "Mục tiêu vẫn ở vùng thừa cân. Bạn có thể cân nhắc đặt mục tiêu thấp hơn để cơ thể khỏe mạnh hơn.";
    case "obese":
      return "Mục tiêu ở vùng cao. Bạn nên chọn mốc cân nặng thấp hơn để giảm tải cho xương khớp và tim mạch.";
  }
}

export function showBmiReferencesAlert() {
  Alert.alert(
    "Nguồn tham khảo",
    "Chỉ số BMI được tính toán dựa trên tiêu chuẩn của Tổ chức Y tế Thế giới (WHO) dành cho người Châu Á:\n\n• Dưới 18.5: Thiếu cân\n• 18.5 - 22.9: Bình thường (Cân bằng)\n• 23.0 - 24.9: Thừa cân\n• Từ 25.0 trở lên: Béo phì",
    [{ text: "Đóng", style: "cancel" }]
  );
}
