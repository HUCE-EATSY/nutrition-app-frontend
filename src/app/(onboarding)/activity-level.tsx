import { useMemo } from "react";
import * as z from "zod";

import { OnboardingOptionSelection } from "@/components/onboarding/OnboardingOptionSelection";
import { useTranslation } from "@/constants/i18n";
import { activityOptions } from "@/constants/onboarding";

export default function ActivityLevelScreen() {
  const t = useTranslation();

  const activityLevelSchema = useMemo(() => {
    return z.object({
      activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
    });
  }, []);

  return (
    <OnboardingOptionSelection
      stepName="ActivityLevel"
      fieldName="activityLevel"
      schema={activityLevelSchema}
      options={activityOptions}
      question={t.onboarding.questions.ActivityLevel}
      getIcon={() => "⚑"}
    />
  );
}
