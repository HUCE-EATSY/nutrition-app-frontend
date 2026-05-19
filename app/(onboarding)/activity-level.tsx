import { router } from "expo-router";
import { View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { activityOptions, getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/domain/onboarding";

const activityLevelSchema = z.object({
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});

type ActivityLevelFormData = z.infer<typeof activityLevelSchema>;

export default function ActivityLevelScreen() {
  const activityLevel = useOnboardingStore((state) => state.draft.activityLevel);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("ActivityLevel");

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ActivityLevelFormData>({
    resolver: zodResolver(activityLevelSchema),
    defaultValues: {
      activityLevel: activityLevel || undefined,
    },
    mode: "onChange",
  });

  const onSubmit = (data: ActivityLevelFormData) => {
    updateDraft({ activityLevel: data.activityLevel });
    markStepCompleted("ActivityLevel");
    router.replace(getNextOnboardingPath("ActivityLevel"));
  };

  return (
    <OnboardingStepScaffold
      continueDisabled={!isValid}
      onBack={() => router.replace(getPreviousOnboardingPath("ActivityLevel"))}
      onContinue={handleSubmit(onSubmit)}
      question={t.onboarding.questions.ActivityLevel}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <Controller
        control={control}
        name="activityLevel"
        render={({ field: { onChange, value } }) => (
          <View style={{ gap: 16 }}>
            {activityOptions.map((option) => (
              <OptionCard
                key={option.value}
                accent={option.accent}
                icon="⚑"
                onPress={() => onChange(option.value)}
                selected={value === option.value}
                subtitle={option.subtitle}
                title={option.title}
              />
            ))}
          </View>
        )}
      />
    </OnboardingStepScaffold>
  );
}
