import * as z from "zod";

import { OnboardingOptionSelection } from "@/components/onboarding/OnboardingOptionSelection";
import { t } from "@/constants/i18n";
import { genderOptions } from "@/constants/onboarding";

const genderSchema = z.object({
  gender: z.enum(["male", "female"]),
});

export default function GenderScreen() {
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
