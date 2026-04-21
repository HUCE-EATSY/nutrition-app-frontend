import { router } from "expo-router";
import { StyleSheet, TextInput } from "react-native";

import { OnboardingStepScaffold } from "@/src/components/onboarding/OnboardingStepScaffold";
import { validateNickname } from "@/src/domain/validators/onboarding";
import { t } from "@/src/i18n";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { colors, radius, spacing, typography } from "@/src/theme";
import { getNextOnboardingPath, getOnboardingMeta } from "@/src/utils/onboarding";

export function NicknameScreen() {
  const nickname = useOnboardingStore((state) => state.draft.nickname ?? "");
  const setNickname = useOnboardingStore((state) => state.setNickname);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("Nickname");
  const error = validateNickname(nickname);

  const handleContinue = () => {
    if (error) {
      return;
    }

    markStepCompleted("Nickname");
    router.replace(getNextOnboardingPath("Nickname"));
  };

  return (
    <OnboardingStepScaffold
      continueDisabled={Boolean(error)}
      hint={error ?? t.onboarding.nicknameHint}
      onBack={() => router.replace("/(public)/mascot-intro")}
      onContinue={handleContinue}
      question={t.onboarding.questions.Nickname}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <TextInput
        autoCapitalize="words"
        autoFocus
        onChangeText={setNickname}
        placeholder={t.onboarding.nicknamePlaceholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={nickname}
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
