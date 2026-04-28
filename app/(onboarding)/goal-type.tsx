import { router } from "expo-router";
import { View } from "react-native";

import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath, goalOptions } from "@/hooks/utils/onboarding";

export default function GoalTypeScreen() {
  const goalType = useOnboardingStore((state) => state.draft.goalType);
  const setGoalType = useOnboardingStore((state) => state.setGoalType);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("GoalType");

  return (
    <OnboardingStepScaffold
      continueDisabled={!goalType}
      onBack={() => router.replace(getPreviousOnboardingPath("GoalType"))}
      onContinue={() => {
        if (!goalType) {
          return;
        }
        markStepCompleted("GoalType");
        router.replace(getNextOnboardingPath("GoalType"));
      }}
      question={t.onboarding.questions.GoalType}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <View style={{ gap: 16 }}>
        {goalOptions.map((option) => (
          <OptionCard
            key={option.value}
            accent={option.accent}
            icon={option.value === "lose_weight" ? "↘" : option.value === "maintain_weight" ? "◎" : "↗"}
            onPress={() => setGoalType(option.value)}
            selected={goalType === option.value}
            subtitle={option.subtitle}
            title={option.title}
          />
        ))}
      </View>
    </OnboardingStepScaffold>
  );
}
