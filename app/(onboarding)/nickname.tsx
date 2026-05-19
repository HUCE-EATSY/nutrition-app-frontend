import { router } from "expo-router";
import { StyleSheet, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { getNextOnboardingPath, getOnboardingMeta } from "@/domain/onboarding";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { colors, radius, spacing, typography } from "@/constants";


const nicknameSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, t.validators.nicknameMin)
    .max(24, t.validators.nicknameMax),
});

type NicknameFormData = z.infer<typeof nicknameSchema>;

export default function NicknameScreen() {
  const nickname = useOnboardingStore((state) => state.draft.nickname ?? "");
  const updateDraft = useOnboardingStore((state) => state.updateDraft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("Nickname");

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NicknameFormData>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: {
      nickname,
    },
    mode: "onChange",
  });

  const onSubmit = (data: NicknameFormData) => {
    updateDraft({ nickname: data.nickname });
    markStepCompleted("Nickname");
    router.replace(getNextOnboardingPath("Nickname"));
  };

  return (
    <OnboardingStepScaffold
      continueDisabled={!isValid}
      hint={errors.nickname?.message ?? t.onboarding.nicknameHint}
      onBack={() => router.replace("/(public)/mascot-intro")}
      onContinue={handleSubmit(onSubmit)}
      question={t.onboarding.questions.Nickname}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <Controller
        control={control}
        name="nickname"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            autoCapitalize="words"
            autoFocus
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t.onboarding.nicknamePlaceholder}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={value}
          />
        )}
      />
    </OnboardingStepScaffold>
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.h1,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
