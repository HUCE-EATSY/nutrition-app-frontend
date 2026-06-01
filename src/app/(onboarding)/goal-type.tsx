import { useMemo } from "react";
import * as z from "zod";

import { OnboardingOptionSelection } from "@/components/onboarding/OnboardingOptionSelection";
import { useTranslation } from "@/constants/i18n";
import { goalOptions } from "@/constants/onboarding";

export default function GoalTypeScreen() {
  const t = useTranslation();

  const goalTypeSchema = useMemo(() => {
    return z.object({
      goalType: z.enum(["lose_weight", "maintain_weight", "gain_weight"]),
    });
  }, []);

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
