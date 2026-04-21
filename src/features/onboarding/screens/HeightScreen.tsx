import { router } from "expo-router";

import { HorizontalRulerPicker } from "@/src/components/onboarding/HorizontalRulerPicker";
import { OnboardingStepScaffold } from "@/src/components/onboarding/OnboardingStepScaffold";
import { t } from "@/src/i18n";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { DEFAULT_HEIGHT_CM, getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/src/utils/onboarding";

export function HeightScreen() {
  const heightCm = useOnboardingStore((state) => state.draft.heightCm ?? DEFAULT_HEIGHT_CM);
  const setHeightCm = useOnboardingStore((state) => state.setHeightCm);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("Height");

  return (
    <OnboardingStepScaffold
      onBack={() => router.replace(getPreviousOnboardingPath("Height"))}
      onContinue={() => {
        setHeightCm(heightCm);
        markStepCompleted("Height");
        router.replace(getNextOnboardingPath("Height"));
      }}
      question={t.onboarding.questions.Height}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <HorizontalRulerPicker majorTickEvery={5} max={220} min={140} onChange={setHeightCm} step={1} unit="cm" value={heightCm} />
    </OnboardingStepScaffold>
  );
}
