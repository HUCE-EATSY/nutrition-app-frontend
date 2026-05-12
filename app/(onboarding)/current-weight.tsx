import { router } from "expo-router";
import { View } from "react-native";

import { HorizontalRulerPicker } from "@/components/onboarding/HorizontalRulerPicker";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { DEFAULT_CURRENT_WEIGHT_KG, getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/domain/onboarding";

export default function CurrentWeightScreen() {
  const currentWeightKg = useOnboardingStore((state) => state.draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG);
  const setCurrentWeightKg = useOnboardingStore((state) => state.setCurrentWeightKg);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("CurrentWeight");

  return (
    <OnboardingStepScaffold
      onBack={() => router.replace(getPreviousOnboardingPath("CurrentWeight"))}
      onContinue={() => {
        setCurrentWeightKg(currentWeightKg);
        markStepCompleted("CurrentWeight");
        router.replace(getNextOnboardingPath("CurrentWeight"));
      }}
      question={t.onboarding.questions.CurrentWeight}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <View style={{ gap: 16 }}>
        <HorizontalRulerPicker decimalPlaces={1} majorTickEvery={10} max={160} min={35} onChange={setCurrentWeightKg} step={0.5} unit="kg" value={currentWeightKg} />
      </View>
    </OnboardingStepScaffold>
  );
}
