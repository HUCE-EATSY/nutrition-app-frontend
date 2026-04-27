import { GoalType } from "@/constants/types/contracts";
import { t } from "@/constants/i18n";
import { clamp, getAgeFromBirthDate } from "@/hooks/utils/date";

export function validateNickname(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return t.validators.nicknameMin;
  }
  if (trimmed.length > 24) {
    return t.validators.nicknameMax;
  }
  return null;
}

export function validateAdultBirthDate(dateISO: string) {
  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) {
    return t.validators.invalidBirthDate;
  }
  return null;
}

export function validateTargetWeight(goalType: GoalType | null, currentWeightKg: number | null, targetWeightKg: number | null) {
  if (!goalType || !currentWeightKg || !targetWeightKg) {
    return t.validators.targetWeightMissing;
  }

  if (goalType === "lose_weight" && targetWeightKg >= currentWeightKg) {
    return t.validators.loseWeightInvalid;
  }

  if (goalType === "gain_weight" && targetWeightKg <= currentWeightKg) {
    return t.validators.gainWeightInvalid;
  }

  if (goalType === "maintain_weight" && Math.abs(targetWeightKg - currentWeightKg) > 1) {
    return t.validators.maintainWeightInvalid;
  }

  return null;
}

export function getWeeklyGoalBounds(goalType: GoalType | null) {
  if (goalType === "maintain_weight") {
    return { min: 0, max: 0.2, recommended: 0 };
  }

  return { min: 0.1, max: 1, recommended: goalType === "gain_weight" ? 0.3 : 0.4 };
}

export function sanitizeWeeklyGoal(goalType: GoalType | null, value: number) {
  const bounds = getWeeklyGoalBounds(goalType);
  return Number(clamp(value, bounds.min, bounds.max).toFixed(1));
}

export function validateWeeklyGoal(goalType: GoalType | null, value: number | null) {
  if (value === null) {
    return t.validators.weeklyGoalRequired;
  }

  const bounds = getWeeklyGoalBounds(goalType);
  if (value < bounds.min || value > bounds.max) {
    return t.validators.weeklyGoalRange(bounds.min, bounds.max);
  }
  return null;
}
