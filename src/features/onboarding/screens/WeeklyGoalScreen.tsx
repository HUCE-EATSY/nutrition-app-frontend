import { router } from "expo-router";

import { OnboardingStepScaffold } from "@/src/components/onboarding/OnboardingStepScaffold";
import { WeeklyGoalSlider } from "@/src/components/onboarding/WeeklyGoalSlider";
import { getWeeklyGoalBounds, sanitizeWeeklyGoal, validateWeeklyGoal } from "@/src/domain/validators/onboarding";
import { t } from "@/src/i18n";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/src/utils/onboarding";

export function WeeklyGoalScreen() {
  const goalType = useOnboardingStore((state) => state.draft.goalType);
  const weeklyGoalKg = useOnboardingStore((state) => state.draft.weeklyGoalKg ?? getWeeklyGoalBounds(goalType).recommended);
  const setWeeklyGoalKg = useOnboardingStore((state) => state.setWeeklyGoalKg);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("WeeklyGoal");
  const bounds = getWeeklyGoalBounds(goalType);
  const error = validateWeeklyGoal(goalType, weeklyGoalKg);
  const estimatedDailyCalories = Math.round((weeklyGoalKg * 7700) / 7);

  return (
    <OnboardingStepScaffold
      continueDisabled={Boolean(error)}
      hint={error ?? t.onboarding.weeklyGoalHint}
      onBack={() => router.replace(getPreviousOnboardingPath("WeeklyGoal"))}
      onContinue={() => {
        if (error) {
          return;
        }
        setWeeklyGoalKg(weeklyGoalKg);
        markStepCompleted("WeeklyGoal");
        router.replace(getNextOnboardingPath("WeeklyGoal"));
      }}
      question={t.onboarding.questions.WeeklyGoal}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <WeeklyGoalSlider
        estimatedDailyCalories={estimatedDailyCalories}
        max={bounds.max}
        min={bounds.min}
        onChange={(value) => setWeeklyGoalKg(sanitizeWeeklyGoal(goalType, value))}
        recommendedValue={bounds.recommended}
        step={0.1}
        value={weeklyGoalKg}
      />
    </OnboardingStepScaffold>
  );
}
