import { router } from "expo-router";
import { View } from "react-native";

import { BMIInfoCard } from "@/components/onboarding/BMIInfoCard";
import { HorizontalRulerPicker } from "@/components/onboarding/HorizontalRulerPicker";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { calculateBMI } from "@/constants/domain/calculators/nutrition";
import { getBmiStatusLabel, t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { DEFAULT_CURRENT_WEIGHT_KG, DEFAULT_HEIGHT_CM, getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/hooks/utils/onboarding";

export default function CurrentWeightScreen() {
  const currentWeightKg = useOnboardingStore((state) => state.draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG);
  const heightCm = useOnboardingStore((state) => state.draft.heightCm ?? DEFAULT_HEIGHT_CM);
  const setCurrentWeightKg = useOnboardingStore((state) => state.setCurrentWeightKg);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const bmi = calculateBMI(currentWeightKg, heightCm);
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
        <BMIInfoCard bmi={bmi.value} description={bmi.description} sourceLabel={bmi.sourceLabel} statusLabel={getBmiStatusLabel(bmi.status)} />
      </View>
    </OnboardingStepScaffold>
  );
}
