import { router } from "expo-router";
import { View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { OptionCard } from "@/components/onboarding/OptionCard";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { genderOptions, getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/domain/onboarding";

const genderSchema = z.object({
  gender: z.enum(["male", "female"]),
});

type GenderFormData = z.infer<typeof genderSchema>;

export default function GenderScreen() {
  const selected = useOnboardingStore((state) => state.draft.gender);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("Gender");

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<GenderFormData>({
    resolver: zodResolver(genderSchema),
    defaultValues: {
      gender: selected || undefined,
    },
    mode: "onChange",
  });

  const onSubmit = (data: GenderFormData) => {
    updateDraft({ gender: data.gender });
    markStepCompleted("Gender");
    router.replace(getNextOnboardingPath("Gender"));
  };

  return (
    <OnboardingStepScaffold
      continueDisabled={!isValid}
      onBack={() => router.replace(getPreviousOnboardingPath("Gender"))}
      onContinue={handleSubmit(onSubmit)}
      question={t.onboarding.questions.Gender}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value } }) => (
          <View style={{ gap: 16 }}>
            {genderOptions.map((option) => (
              <OptionCard
                key={option.value}
                accent={option.accent}
                icon={option.value === "female" ? "♀" : "♂"}
                onPress={() => onChange(option.value)}
                selected={value === option.value}
                title={option.title}
              />
            ))}
          </View>
        )}
      />
    </OnboardingStepScaffold>
  );
}
