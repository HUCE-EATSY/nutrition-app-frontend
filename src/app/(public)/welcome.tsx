import { useMemo } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { GradientButton } from "@/components/buttons/GradientButton";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { WelcomeHeroIllustration } from "@/components/WelcomeHeroIllustration";

import { useOnboardingStore } from "@/store/onboardingStore";
import { spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { trackEvent } from "@/utils/analytics";
import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";

const BRAND = "Nutrition";

export default function WelcomeScreen() {
  const t = useTranslation();
  const setPublicFlowStep = useOnboardingStore((state) => state.setPublicFlowStep);
  const { width, isNarrowWidth, isShortHeight } = useResponsiveLayout();
  const isCompactLayout = isNarrowWidth || isShortHeight;
  const heroSize = isCompactLayout
    ? Math.min(Math.max(width * 0.6, 220), 280)
    : Math.min(Math.max(width * 0.75, 260), 320);
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleStart = () => {
    trackEvent("welcome_cta_clicked", { screen_name: "welcome" });
    setPublicFlowStep("social-login");
    router.push("/(public)/social-login");
  };

  return (
    <SafeScreen withBackgroundGlow={false}>
      <View style={styles.root}>
        <View style={[styles.screen, isCompactLayout && styles.screenCompact]}>
          <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={[styles.logo, isNarrowWidth && styles.logoCompact]}>
            {BRAND}
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={[styles.heroWrap, isCompactLayout && styles.heroWrapCompact]}>
            <WelcomeHeroIllustration size={heroSize} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.copyWrap}>
            <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>{t.auth.welcome.title}</Text>
            <Text style={[styles.description, isNarrowWidth && styles.descriptionCompact]}>{t.auth.welcome.description}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.button}>
            <GradientButton label={t.auth.welcome.cta} onPress={handleStart} />
          </Animated.View>
        </View>
      </View>
    </SafeScreen>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    justifyContent: "space-between",
  },
  screenCompact: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  logo: {
    fontFamily: "GoogleSans_700Bold",
    color: colors.primary,
    textAlign: "center",
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -3.5,
    marginTop: spacing.sm,
  },
  logoCompact: {
    fontFamily: "GoogleSans_700Bold",
    fontSize: 48,
    lineHeight: 52,
    marginTop: spacing.xs,
  },
  heroWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 240,
    marginTop: spacing.xs,
  },
  heroWrapCompact: {
    minHeight: 200,
    marginTop: 0,
  },
  copyWrap: {
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: 30,
    lineHeight: 36,
    maxWidth: 360,
  },
  titleCompact: {
    fontSize: 26,
    lineHeight: 32,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 360,
    lineHeight: 24,
    fontSize: 16,
  },
  descriptionCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.sm,
  },
});
