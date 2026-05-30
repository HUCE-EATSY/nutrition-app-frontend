import { router } from "expo-router";
import { StyleSheet, TextInput } from "react-native";
import { Controller } from "react-hook-form";
import * as z from "zod";

import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import { t, useTranslation } from "@/constants/i18n";
import { colors, radius, spacing, typography } from "@/constants";

const nicknameSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, t.validators.nicknameMin)
    .max(24, t.validators.nicknameMax),
});

export default function NicknameScreen() {
  const t = useTranslation();
  const { control, error, isValid, meta, onContinue } = useOnboardingForm(
    "Nickname",
    "nickname",
    nicknameSchema
  );

  return (
    <OnboardingStepScaffold
      continueDisabled={!isValid}
      hint={error ?? t.onboarding.nicknameHint}
      onBack={() => router.replace("/(public)/mascot-intro")}
      onContinue={onContinue}
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
    ...typography.h2,
    lineHeight: undefined,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});

