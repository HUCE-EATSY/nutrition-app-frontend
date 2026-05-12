import { router } from "expo-router";
import { View } from "react-native";

import { HorizontalRulerPicker } from "@/components/onboarding/HorizontalRulerPicker";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import {
  DEFAULT_CURRENT_WEIGHT_KG,
  DEFAULT_TARGET_WEIGHT_KG,
  getNextOnboardingPath,
  getOnboardingMeta,
  getPreviousOnboardingPath,
  validateTargetWeight,
} from "@/domain/onboarding";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";


export default function TargetWeightScreen() {
  const currentWeightKg = useOnboardingStore((state) => state.draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG);
  const targetWeightKg = useOnboardingStore((state) => state.draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG);
  const goalType = useOnboardingStore((state) => state.draft.goalType);
  const setCurrentWeightKg = useOnboardingStore((state) => state.setCurrentWeightKg);
  const setTargetWeightKg = useOnboardingStore((state) => state.setTargetWeightKg);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("TargetWeight");
  const error = validateTargetWeight(goalType, currentWeightKg, targetWeightKg);

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
      </View>
    </OnboardingStepScaffold>
  );
}
