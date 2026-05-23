import * as z from "zod";

import { OnboardingOptionSelection } from "@/components/onboarding/OnboardingOptionSelection";
import { t } from "@/constants/i18n";
import { activityOptions } from "@/constants/onboarding";

const activityLevelSchema = z.object({
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});

export default function ActivityLevelScreen() {
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
