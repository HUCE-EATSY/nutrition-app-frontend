import { Controller } from "react-hook-form";
import * as z from "zod";

import { HorizontalRulerPicker } from "@/components/onboarding/HorizontalRulerPicker";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { useTranslation } from "@/constants/i18n";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import { DEFAULT_HEIGHT_CM } from "@/constants/onboarding";

const heightSchema = z.object({
  heightCm: z.number().min(140).max(220),
});

export default function HeightScreen() {
  const t = useTranslation();
  const { control, isValid, meta, onContinue, onBack } = useOnboardingForm(
    "Height",
    "heightCm",
    heightSchema,
    DEFAULT_HEIGHT_CM
  );

  return (
    <OnboardingStepScaffold
      scrollable={false}
      contentStyle={{ flex: 1, justifyContent: "center" }}
      continueDisabled={!isValid}
      onBack={onBack}
      onContinue={onContinue}
      question={t.onboarding.questions.Height}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <Controller
        control={control}
        name="heightCm"
        render={({ field: { onChange, value } }) => (
          <HorizontalRulerPicker
            majorTickEvery={10}
            max={220}
            min={140}
            onChange={onChange}
            step={1}
            unit="cm"
            value={value}
          />
        )}
      />
    </OnboardingStepScaffold>
  );
}

