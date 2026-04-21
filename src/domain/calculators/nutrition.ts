import { BMIResult, BMIStatus, MacroSplit, NutritionPlan, OnboardingDraft } from "@/src/types/contracts";
import { t } from "@/src/i18n";
import { addDays } from "@/src/utils/date";

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

function getBMIStatus(value: number): BMIStatus {
  if (value < 18.5) {
    return "underweight";
  }
  if (value < 23) {
    return "normal";
  }
  if (value < 25) {
    return "overweight";
  }
  return "obese";
}

function getMacroRatio(goalType: OnboardingDraft["goalType"]): Pick<MacroSplit, "proteinPct" | "carbPct" | "fatPct"> {
  switch (goalType) {
    case "lose_weight":
      return { proteinPct: 35, carbPct: 35, fatPct: 30 };
    case "gain_weight":
      return { proteinPct: 25, carbPct: 45, fatPct: 30 };
    default:
      return { proteinPct: 30, carbPct: 40, fatPct: 30 };
  }
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  const value = weightKg / ((heightCm / 100) * (heightCm / 100));
  const rounded = Number(value.toFixed(1));
  const status = getBMIStatus(rounded);
  const description = t.nutrition.bmiDescriptions[status];

  return {
    value: rounded,
    status,
    description,
    sourceLabel: t.nutrition.bmiSource,
  };
}

export function calculateBMR(draft: OnboardingDraft, age: number) {
  if (!draft.gender || !draft.heightCm || !draft.currentWeightKg) {
    return 0;
  }

  const base = 10 * draft.currentWeightKg + 6.25 * draft.heightCm - 5 * age;
  return Math.round(draft.gender === "male" ? base + 5 : base - 161);
}

export function calculateNutritionPlan(draft: OnboardingDraft, age: number): NutritionPlan {
  if (
    !draft.heightCm ||
    !draft.currentWeightKg ||
    !draft.targetWeightKg ||
    !draft.goalType ||
    !draft.activityLevel ||
    draft.weeklyGoalKg === null
  ) {
    throw new Error(t.nutrition.incompleteDraft);
  }

  const bmi = calculateBMI(draft.currentWeightKg, draft.heightCm);
  const bmr = calculateBMR(draft, age);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[draft.activityLevel]);
  const deltaPerDay = Math.round(((draft.weeklyGoalKg ?? 0) * 7700) / 7);
  const signedDelta =
    draft.goalType === "lose_weight"
      ? -deltaPerDay
      : draft.goalType === "gain_weight"
        ? deltaPerDay
        : 0;
  const minimumSafe = draft.gender === "male" ? 1500 : 1200;
  const dailyTarget = Math.max(minimumSafe, tdee + signedDelta);
  const weeklyTarget = dailyTarget * 7;
  const macroRatio = getMacroRatio(draft.goalType);
  const macroSplit: MacroSplit = {
    ...macroRatio,
    proteinGram: Math.round((dailyTarget * (macroRatio.proteinPct / 100)) / 4),
    carbGram: Math.round((dailyTarget * (macroRatio.carbPct / 100)) / 4),
    fatGram: Math.round((dailyTarget * (macroRatio.fatPct / 100)) / 9),
  };
  const weightDelta = Math.abs(draft.targetWeightKg - draft.currentWeightKg);
  const weeksNeeded = draft.weeklyGoalKg > 0 ? Math.max(Math.ceil(weightDelta / draft.weeklyGoalKg), 1) : 6;

  return {
    bmi: bmi.value,
    bmiStatus: bmi.status,
    bmrKcal: bmr,
    tdeeKcal: tdee,
    dailyTargetKcal: dailyTarget,
    weeklyTargetKcal: weeklyTarget,
    dailyDeficitOrSurplusKcal: Math.abs(signedDelta),
    targetDateISO: addDays(new Date().toISOString(), weeksNeeded * 7),
    macroSplit,
  };
}
