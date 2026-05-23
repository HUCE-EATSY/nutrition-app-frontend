import { useMemo } from "react";
import { Controller } from "react-hook-form";
import * as z from "zod";

import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { WeeklyGoalSlider } from "@/components/onboarding/WeeklyGoalSlider";
import {
  getWeeklyGoalBounds,
  sanitizeWeeklyGoal,
} from "@/utils/onboarding";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import { GoalType } from "@/types/contracts";

const createWeeklyGoalSchema = (goalType: GoalType | null) => {
  const bounds = getWeeklyGoalBounds(goalType);
  return z.object({
    weeklyGoalKg: z
      .number()
      .min(bounds.min, t.validators.weeklyGoalRange(bounds.min, bounds.max))
      .max(bounds.max, t.validators.weeklyGoalRange(bounds.min, bounds.max)),
  });
};

export default function WeeklyGoalScreen() {
  const goalType = useOnboardingStore((state) => state.draft.goalType);
  const bounds = getWeeklyGoalBounds(goalType);
  const weeklyGoalSchema = useMemo(() => createWeeklyGoalSchema(goalType), [goalType]);

  const { control, error, isValid, meta, onContinue, onBack } = useOnboardingForm(
    "WeeklyGoal",
    "weeklyGoalKg",
    weeklyGoalSchema,
    bounds.recommended
  );

  return (
    <OnboardingStepScaffold
      continueDisabled={!isValid}
      hint={error ?? t.onboarding.weeklyGoalHint}
      onBack={onBack}
      onContinue={onContinue}
      question={t.onboarding.questions.WeeklyGoal}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <Controller
        control={control}
        name="weeklyGoalKg"
        render={({ field: { onChange, value } }) => (
          <WeeklyGoalSlider
            max={bounds.max}
            min={bounds.min}
            onChange={(val) => onChange(sanitizeWeeklyGoal(goalType, val))}
            step={0.1}
            value={value}
          />
        )}
      />
    </OnboardingStepScaffold>
  );
}

