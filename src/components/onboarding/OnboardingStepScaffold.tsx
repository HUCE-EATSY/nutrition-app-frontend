import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { t } from "@/src/i18n";
import { BottomCtaBar } from "@/src/components/layout/BottomCtaBar";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { OnboardingHeader } from "@/src/components/onboarding/OnboardingHeader";
import { MascotQuestionBubble } from "@/src/components/onboarding/MascotQuestionBubble";
import { colors, spacing, typography } from "@/src/theme";

type OnboardingStepScaffoldProps = {
  step: number;
  totalSteps: number;
  question: string;
  children: ReactNode;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  hint?: string | null;
  scrollable?: boolean;
};

export function OnboardingStepScaffold({
  step,
  totalSteps,
  question,
  children,
  onBack,
  onContinue,
  continueLabel = t.common.continue,
  continueDisabled = false,
  hint,
  scrollable = true,
}: OnboardingStepScaffoldProps) {
  const content = (
    <>
      <MascotQuestionBubble text={question} />
      <View style={styles.content}>{children}</View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </>
  );

  return (
    <SafeScreen>
      <View style={styles.screen}>
        <OnboardingHeader onBack={onBack} step={step} totalSteps={totalSteps} />
        {scrollable ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={styles.staticContent}>{content}</View>
        )}
        <BottomCtaBar disabled={continueDisabled} label={continueLabel} onPress={onContinue} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  content: {
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  staticContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
