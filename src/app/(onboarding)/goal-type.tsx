import * as z from "zod";

import { OnboardingOptionSelection } from "@/components/onboarding/OnboardingOptionSelection";
import { useTranslation } from "@/constants/i18n";
import { goalOptions } from "@/constants/onboarding";

const goalTypeSchema = z.object({
  goalType: z.enum(["lose_weight", "maintain_weight", "gain_weight"]),
});

export default function GoalTypeScreen() {
  const t = useTranslation();
  return (
    <OnboardingOptionSelection
      stepName="GoalType"
      fieldName="goalType"
      schema={goalTypeSchema}
      options={goalOptions}
      question={t.onboarding.questions.GoalType}
      getIcon={(value) => (value === "lose_weight" ? "↘" : value === "maintain_weight" ? "◎" : "↗")}
    />
  );
}
