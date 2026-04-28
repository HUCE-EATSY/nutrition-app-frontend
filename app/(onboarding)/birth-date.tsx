import { router } from "expo-router";
import { useMemo, useState } from "react";

import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { WheelDatePicker } from "@/components/onboarding/WheelDatePicker";
import { validateAdultBirthDate } from "@/constants/domain/validators/onboarding";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { createBirthDateISO, getDateParts } from "@/hooks/utils/date";
import { getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/hooks/utils/onboarding";

const fallbackDate = { day: 15, month: 8, year: 2000 };

export default function BirthDateScreen() {
  const savedBirthDate = useOnboardingStore((state) => state.draft.birthDateISO);
  const setBirthDateISO = useOnboardingStore((state) => state.setBirthDateISO);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const initial = savedBirthDate ? getDateParts(savedBirthDate) : fallbackDate;
  const [picker, setPicker] = useState(initial);
  const meta = getOnboardingMeta("BirthDate");

  const nextISO = useMemo(() => createBirthDateISO(picker.day, picker.month, picker.year), [picker.day, picker.month, picker.year]);
  const error = validateAdultBirthDate(nextISO);

  return (
    <OnboardingStepScaffold
      continueDisabled={Boolean(error)}
      hint={error ?? t.onboarding.birthDateHint}
      onBack={() => router.replace(getPreviousOnboardingPath("BirthDate"))}
      onContinue={() => {
        if (error) {
          return;
        }
        setBirthDateISO(nextISO);
        markStepCompleted("BirthDate");
        router.replace(getNextOnboardingPath("BirthDate"));
      }}
      question={t.onboarding.questions.BirthDate}
      scrollable={false}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <WheelDatePicker
        day={picker.day}
        maxYear={new Date().getFullYear()}
        minYear={1930}
        month={picker.month}
        onChange={setPicker}
        year={picker.year}
      />
    </OnboardingStepScaffold>
  );
}
