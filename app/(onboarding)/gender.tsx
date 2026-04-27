import { router } from "expo-router";
import { View } from "react-native";

import { OptionCard } from "@/components/onboarding/OptionCard";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { genderOptions, getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/hooks/utils/onboarding";

export default function GenderScreen() {
  const selected = useOnboardingStore((state) => state.draft.gender);
  const setGender = useOnboardingStore((state) => state.setGender);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("Gender");

  return (
    <OnboardingStepScaffold
      continueDisabled={!selected}
      onBack={() => router.replace(getPreviousOnboardingPath("Gender"))}
      onContinue={() => {
        if (!selected) {
          return;
        }
        markStepCompleted("Gender");
        router.replace(getNextOnboardingPath("Gender"));
      }}
      question={t.onboarding.questions.Gender}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <View style={{ gap: 16 }}>
        {genderOptions.map((option) => (
          <OptionCard
            key={option.value}
            accent={option.accent}
            icon={option.value === "female" ? "♀" : "♂"}
            onPress={() => setGender(option.value)}
            selected={selected === option.value}
            subtitle={option.subtitle}
            title={option.title}
          />
        ))}
      </View>
    </OnboardingStepScaffold>
  );
}
