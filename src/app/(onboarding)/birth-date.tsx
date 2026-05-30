import { useMemo } from "react";
import { Controller } from "react-hook-form";
import * as z from "zod";

import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { WheelDatePicker } from "@/components/onboarding/WheelDatePicker";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import { t, useTranslation } from "@/constants/i18n";
import { createBirthDateISO, getDateParts, getAgeFromBirthDate } from "@/utils/date";

const fallbackDate = { day: 15, month: 8, year: 2000 };
const fallbackISO = createBirthDateISO(fallbackDate.day, fallbackDate.month, fallbackDate.year);

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

export default function BirthDateScreen() {
  const t = useTranslation();
  const { control, error, isValid, meta, onContinue, onBack, watch } = useOnboardingForm(
    "BirthDate",
    "birthDateISO",
    birthDateSchema,
    fallbackISO
  );

  const birthDateISO = watch("birthDateISO") || fallbackISO;
  const picker = useMemo(() => getDateParts(birthDateISO), [birthDateISO]);

  return (
    <OnboardingStepScaffold
      continueDisabled={!isValid}
      hint={error ?? t.onboarding.birthDateHint}
      onBack={onBack}
      onContinue={onContinue}
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

