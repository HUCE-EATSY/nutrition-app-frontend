import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { GradientButton } from "@/components/buttons/GradientButton";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { WelcomeHeroIllustration } from "@/components/WelcomeHeroIllustration";

import { useOnboardingStore } from "@/store/onboardingStore";
import { colors, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { trackEvent } from "@/utils/analytics";
import { useTranslation } from "@/constants/i18n";

const BRAND = "Nutrition";

export default function WelcomeScreen() {
  const t = useTranslation();
  const setPublicFlowStep = useOnboardingStore((state) => state.setPublicFlowStep);
  const { width, isNarrowWidth, isShortHeight } = useResponsiveLayout();
  const isCompactLayout = isNarrowWidth || isShortHeight;
  const heroSize = isCompactLayout
    ? Math.min(Math.max(width * 0.6, 220), 280)
    : Math.min(Math.max(width * 0.75, 260), 320);

  const handleStart = () => {
    trackEvent("welcome_cta_clicked", { screen_name: "welcome" });
    setPublicFlowStep("social-login");
    router.push("/(public)/social-login");
  };

  return (
    <SafeScreen withBackgroundGlow={false}>
      <View style={styles.root}>
        <View style={[styles.screen, isCompactLayout && styles.screenCompact]}>
          <Text style={[styles.logo, isNarrowWidth && styles.logoCompact]}>{BRAND}</Text>

          <View style={[styles.heroWrap, isCompactLayout && styles.heroWrapCompact]}>
            <WelcomeHeroIllustration size={heroSize} />
          </View>

          <View style={styles.copyWrap}>
            <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>{t.auth.welcome.title}</Text>
            <Text style={[styles.description, isNarrowWidth && styles.descriptionCompact]}>{t.auth.welcome.description}</Text>
          </View>

          <GradientButton label={t.auth.welcome.cta} onPress={handleStart} style={styles.button} />
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
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
    color: colors.textPrimary,
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
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
    zIndex: 2,
  },
  emojiShadow: {
    position: 'absolute',
    bottom: '15%',
    width: '60%',
    height: 20,
    backgroundColor: 'rgba(165, 108, 255, 0.2)',
    borderRadius: 100,
    transform: [{ scaleX: 2 }],
    zIndex: 1,
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
