import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { GradientButton } from "@/src/components/buttons/GradientButton";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { WelcomeHeroIllustration } from "@/src/features/auth/components/WelcomeHeroIllustration";
import { t } from "@/src/i18n";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { colors, spacing, typography } from "@/src/theme";
import { useResponsiveLayout } from "@/src/theme/responsive";
import { trackEvent } from "@/src/utils/analytics";

const BRAND = "Nutrition";
const TITLE = "Ứng dụng dinh dưỡng";
const DESCRIPTION = "Ứng dụng cá nhân hoá món ăn, thói quen và lối sống dành cho người Việt.";
const CTA = "Bắt đầu ngay";

export function WelcomeScreen() {
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
            <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>{TITLE}</Text>
            <Text style={[styles.description, isNarrowWidth && styles.descriptionCompact]}>{DESCRIPTION}</Text>
          </View>

          <GradientButton label={CTA} onPress={handleStart} style={styles.button} />
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
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -3.5,
    marginTop: spacing.sm,
  },
  logoCompact: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
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
    filter: 'blur(15px)',
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
    fontSize: 34,
    lineHeight: 40,
    maxWidth: 360,
  },
  titleCompact: {
    fontSize: 30,
    lineHeight: 36,
  },
  description: {
    ...typography.body,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    maxWidth: 360,
    lineHeight: 26,
    fontSize: 18,
  },
  descriptionCompact: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    marginTop: spacing.sm,
  },
});
