import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { HorizontalRulerPicker } from "@/components/onboarding/HorizontalRulerPicker";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { DEFAULT_HEIGHT_CM, getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/domain/onboarding";

const heightSchema = z.object({
  heightCm: z.number().min(140).max(220),
});

type HeightFormData = z.infer<typeof heightSchema>;

export default function HeightScreen() {
  const heightCm = useOnboardingStore((state) => state.draft.heightCm ?? DEFAULT_HEIGHT_CM);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("Height");

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<HeightFormData>({
    resolver: zodResolver(heightSchema),
    defaultValues: {
      heightCm,
    },
    mode: "onChange",
  });

  const onSubmit = (data: HeightFormData) => {
    updateDraft({ heightCm: data.heightCm });
    markStepCompleted("Height");
    router.replace(getNextOnboardingPath("Height"));
  };

  return (
    <OnboardingStepScaffold
      scrollable={false}
      contentStyle={{ flex: 1, justifyContent: "center" }}
      continueDisabled={!isValid}
      onBack={() => router.replace(getPreviousOnboardingPath("Height"))}

      onContinue={handleSubmit(onSubmit)}
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
