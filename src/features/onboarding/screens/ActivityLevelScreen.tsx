import { router } from "expo-router";
import { View } from "react-native";

import { OnboardingStepScaffold } from "@/src/components/onboarding/OnboardingStepScaffold";
import { OptionCard } from "@/src/components/onboarding/OptionCard";
import { t } from "@/src/i18n";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { activityOptions, getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/src/utils/onboarding";

export function ActivityLevelScreen() {
  const activityLevel = useOnboardingStore((state) => state.draft.activityLevel);
  const setActivityLevel = useOnboardingStore((state) => state.setActivityLevel);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("ActivityLevel");

  return (
    <OnboardingStepScaffold
      continueDisabled={!activityLevel}
      onBack={() => router.replace(getPreviousOnboardingPath("ActivityLevel"))}
      onContinue={() => {
        if (!activityLevel) {
          return;
        }
        markStepCompleted("ActivityLevel");
        router.replace(getNextOnboardingPath("ActivityLevel"));
      }}
      question={t.onboarding.questions.ActivityLevel}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <View style={{ gap: 16 }}>
        {activityOptions.map((option) => (
          <OptionCard
            key={option.value}
            accent={option.accent}
            icon="⚑"
            onPress={() => setActivityLevel(option.value)}
            selected={activityLevel === option.value}
            subtitle={option.subtitle}
            title={option.title}
          />
        ))}
      </View>
    </OnboardingStepScaffold>
  );
}
