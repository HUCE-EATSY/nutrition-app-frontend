import { router } from "expo-router";
import { View } from "react-native";

import { BMIInfoCard } from "@/components/onboarding/BMIInfoCard";
import { HorizontalRulerPicker } from "@/components/onboarding/HorizontalRulerPicker";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { calculateBMI } from "@/constants/domain/calculators/nutrition";
import { validateTargetWeight } from "@/constants/domain/validators/onboarding";
import { getBmiStatusLabel, t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import {
  DEFAULT_CURRENT_WEIGHT_KG,
  DEFAULT_HEIGHT_CM,
  DEFAULT_TARGET_WEIGHT_KG,
  getNextOnboardingPath,
  getOnboardingMeta,
  getPreviousOnboardingPath,
} from "@/hooks/utils/onboarding";

export default function TargetWeightScreen() {
  const currentWeightKg = useOnboardingStore((state) => state.draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG);
  const targetWeightKg = useOnboardingStore((state) => state.draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG);
  const goalType = useOnboardingStore((state) => state.draft.goalType);
  const heightCm = useOnboardingStore((state) => state.draft.heightCm ?? DEFAULT_HEIGHT_CM);
  const setCurrentWeightKg = useOnboardingStore((state) => state.setCurrentWeightKg);
  const setTargetWeightKg = useOnboardingStore((state) => state.setTargetWeightKg);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("TargetWeight");
  const error = validateTargetWeight(goalType, currentWeightKg, targetWeightKg);
  const bmi = calculateBMI(targetWeightKg, heightCm);

  return (
    <OnboardingStepScaffold
      continueDisabled={Boolean(error)}
      hint={error ?? t.onboarding.targetWeightHint}
      onBack={() => router.replace(getPreviousOnboardingPath("TargetWeight"))}
      onContinue={() => {
        if (error) {
          return;
        }
        setCurrentWeightKg(currentWeightKg);
        setTargetWeightKg(targetWeightKg);
        markStepCompleted("TargetWeight");
        router.replace(getNextOnboardingPath("TargetWeight"));
      }}
      question={t.onboarding.questions.TargetWeight}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <View style={{ gap: 16 }}>
        <HorizontalRulerPicker decimalPlaces={1} majorTickEvery={10} max={160} min={35} onChange={setTargetWeightKg} step={0.5} unit="kg" value={targetWeightKg} />
        <BMIInfoCard bmi={bmi.value} description={bmi.description} sourceLabel={bmi.sourceLabel} statusLabel={getBmiStatusLabel(bmi.status)} />
      </View>
    </OnboardingStepScaffold>
  );
}
