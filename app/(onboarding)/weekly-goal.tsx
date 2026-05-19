import { router } from "expo-router";
import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { WeeklyGoalSlider } from "@/components/onboarding/WeeklyGoalSlider";
import {
  getNextOnboardingPath,
  getOnboardingMeta,
  getPreviousOnboardingPath,
  getWeeklyGoalBounds,
  sanitizeWeeklyGoal,
} from "@/domain/onboarding";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { GoalType } from "@/constants/types/contracts";

const createWeeklyGoalSchema = (goalType: GoalType | null) => {
  const bounds = getWeeklyGoalBounds(goalType);
  return z.object({
    weeklyGoalKg: z
      .number()
      .min(bounds.min, t.validators.weeklyGoalRange(bounds.min, bounds.max))
      .max(bounds.max, t.validators.weeklyGoalRange(bounds.min, bounds.max)),
  });
};

type WeeklyGoalFormData = {
  weeklyGoalKg: number;
};

export default function WeeklyGoalScreen() {
  const goalType = useOnboardingStore((state) => state.draft.goalType);
  const weeklyGoalKg = useOnboardingStore((state) => state.draft.weeklyGoalKg ?? getWeeklyGoalBounds(goalType).recommended);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("WeeklyGoal");
  const bounds = getWeeklyGoalBounds(goalType);

  const weeklyGoalSchema = useMemo(() => createWeeklyGoalSchema(goalType), [goalType]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<WeeklyGoalFormData>({
    resolver: zodResolver(weeklyGoalSchema),
    defaultValues: {
      weeklyGoalKg,
    },
    mode: "onChange",
  });

  const currentWeeklyGoalKg = watch("weeklyGoalKg");
  const estimatedDailyCalories = Math.round((currentWeeklyGoalKg * 7700) / 7);
  const error = errors.weeklyGoalKg?.message;

  const onSubmit = (data: WeeklyGoalFormData) => {
    updateDraft({ weeklyGoalKg: data.weeklyGoalKg });
    markStepCompleted("WeeklyGoal");
    router.replace(getNextOnboardingPath("WeeklyGoal"));
  };

  return (
    <OnboardingStepScaffold
      continueDisabled={!isValid}
      hint={error ?? t.onboarding.weeklyGoalHint}
      onBack={() => router.replace(getPreviousOnboardingPath("WeeklyGoal"))}
      onContinue={handleSubmit(onSubmit)}
      question={t.onboarding.questions.WeeklyGoal}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <Controller
        control={control}
        name="weeklyGoalKg"
        render={({ field: { onChange, value } }) => (
          <WeeklyGoalSlider
            estimatedDailyCalories={estimatedDailyCalories}
            max={bounds.max}
            min={bounds.min}
            onChange={(val) => onChange(sanitizeWeeklyGoal(goalType, val))}
            recommendedValue={bounds.recommended}
            step={0.1}
            value={value}
          />
        )}
      />
    </OnboardingStepScaffold>
  );
}
