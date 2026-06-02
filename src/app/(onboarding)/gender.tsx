import { useMemo } from "react";
import * as z from "zod";

import { OnboardingOptionSelection } from "@/components/onboarding/OnboardingOptionSelection";
import { useTranslation } from "@/constants/i18n";
import { genderOptions } from "@/constants/onboarding";

export default function GenderScreen() {
  const t = useTranslation();

  const genderSchema = useMemo(() => {
    return z.object({
      gender: z.enum(["male", "female"]),
    });
  }, []);

  return (
    <OnboardingOptionSelection
      stepName="Gender"
      fieldName="gender"
      schema={genderSchema}
      options={genderOptions}
      question={t.onboarding.questions.Gender}
      getIcon={(value) => (value === "female" ? "♀" : "♂")}
    />
  );
}
