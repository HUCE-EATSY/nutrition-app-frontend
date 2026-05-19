import { router } from "expo-router";
import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { WheelDatePicker } from "@/components/onboarding/WheelDatePicker";
import {
  getNextOnboardingPath,
  getOnboardingMeta,
  getPreviousOnboardingPath,
} from "@/domain/onboarding";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { createBirthDateISO, getDateParts, getAgeFromBirthDate } from "@/hooks/utils/date";

const fallbackDate = { day: 15, month: 8, year: 2000 };

const birthDateSchema = z.object({
  birthDateISO: z.string().refine(
    (iso) => {
      const age = getAgeFromBirthDate(iso);
      return age >= 18;
    },
    {
      message: t.validators.adultOnly,
    }
  ),
});

type BirthDateFormData = z.infer<typeof birthDateSchema>;

export default function BirthDateScreen() {
  const savedBirthDate = useOnboardingStore((state) => state.draft.birthDateISO);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("BirthDate");

  const initialISO = savedBirthDate || createBirthDateISO(fallbackDate.day, fallbackDate.month, fallbackDate.year);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<BirthDateFormData>({
    resolver: zodResolver(birthDateSchema),
    defaultValues: {
      birthDateISO: initialISO,
    },
    mode: "onChange",
  });

  const birthDateISO = watch("birthDateISO");
  const picker = useMemo(() => getDateParts(birthDateISO), [birthDateISO]);

  const onSubmit = (data: BirthDateFormData) => {
    updateDraft({ birthDateISO: data.birthDateISO });
    markStepCompleted("BirthDate");
    router.replace(getNextOnboardingPath("BirthDate"));
  };

  return (
    <OnboardingStepScaffold
      continueDisabled={!isValid}
      hint={errors.birthDateISO?.message ?? t.onboarding.birthDateHint}
      onBack={() => router.replace(getPreviousOnboardingPath("BirthDate"))}
      onContinue={handleSubmit(onSubmit)}
      question={t.onboarding.questions.BirthDate}
      scrollable={false}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <Controller
        control={control}
        name="birthDateISO"
        render={({ field: { onChange } }) => (
          <WheelDatePicker
            day={picker.day}
            maxYear={new Date().getFullYear()}
            minYear={1930}
            month={picker.month}
            onChange={(parts) => {
              onChange(createBirthDateISO(parts.day, parts.month, parts.year));
            }}
            year={picker.year}
          />
        )}
      />
    </OnboardingStepScaffold>
  );
}
