import { router } from "expo-router";
import { View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath, goalOptions } from "@/domain/onboarding";

const goalTypeSchema = z.object({
  goalType: z.enum(["lose_weight", "maintain_weight", "gain_weight"]),
});

type GoalTypeFormData = z.infer<typeof goalTypeSchema>;

export default function GoalTypeScreen() {
  const goalType = useOnboardingStore((state) => state.draft.goalType);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("GoalType");

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<GoalTypeFormData>({
    resolver: zodResolver(goalTypeSchema),
    defaultValues: {
      goalType: goalType || undefined,
    },
    mode: "onChange",
  });

  const onSubmit = (data: GoalTypeFormData) => {
    updateDraft({ goalType: data.goalType });
    markStepCompleted("GoalType");
    router.replace(getNextOnboardingPath("GoalType"));
  };

  return (
    <OnboardingStepScaffold
      continueDisabled={!isValid}
      onBack={() => router.replace(getPreviousOnboardingPath("GoalType"))}
      onContinue={handleSubmit(onSubmit)}
      question={t.onboarding.questions.GoalType}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <Controller
        control={control}
        name="goalType"
        render={({ field: { onChange, value } }) => (
          <View style={{ gap: 16 }}>
            {goalOptions.map((option) => (
              <OptionCard
                key={option.value}
                accent={option.accent}
                icon={option.value === "lose_weight" ? "↘" : option.value === "maintain_weight" ? "◎" : "↗"}
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
