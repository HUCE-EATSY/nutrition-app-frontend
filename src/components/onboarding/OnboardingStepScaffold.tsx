import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { t, useTranslation } from "@/constants/i18n";
import { BottomCtaBar } from "@/components/layout/BottomCtaBar";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { MascotQuestionBubble } from "@/components/onboarding/MascotQuestionBubble";
import { colors, spacing, typography } from "@/constants";

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
  contentStyle?: any;
  hideBottomCta?: boolean;
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
  contentStyle,
  hideBottomCta = false,
}: OnboardingStepScaffoldProps) {
  useTranslation();
  const content = (
    <Animated.View entering={FadeInDown.duration(350).springify().damping(18)} style={styles.animatedContent}>
      <MascotQuestionBubble text={question} />
      <View style={[styles.content, contentStyle]}>{children}</View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Animated.View>
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
        {!hideBottomCta && (
          <BottomCtaBar disabled={continueDisabled} label={continueLabel} onPress={onContinue} />
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
    width: "100%",
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
