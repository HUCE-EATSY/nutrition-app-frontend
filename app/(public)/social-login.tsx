import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useEffect } from "react";

import { SocialAuthButton } from "@/components/buttons/SocialAuthButton";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { colors, radius, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { trackEvent } from "@/hooks/utils/analytics";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function SocialLoginScreen() {
  const setPublicFlowStep = useOnboardingStore((state) => state.setPublicFlowStep);
  const { isNarrowWidth, isShortHeight } = useResponsiveLayout();
  const { signIn, userInfo, loading, error } = useGoogleAuth();

  useEffect(() => {
    if (userInfo) {
      setPublicFlowStep("mascot-intro");
      router.push("/(public)/mascot-intro");
    }
  }, [userInfo, setPublicFlowStep]);

  const handleContinue = (provider: "google" | "facebook") => {
    trackEvent("social_login_clicked", { provider, screen_name: "social-login" });
    if (provider === "google") {
      signIn();
    } else {
      // Facebook logic or just fallback for demo
      setPublicFlowStep("mascot-intro");
      router.push("/(public)/mascot-intro");
    }
  };

  return (
    <SafeScreen scrollable={isShortHeight}>
      <View style={styles.screen}>
        <Pressable 
          onPress={() => {
            setPublicFlowStep("welcome");
            router.replace("/(public)/welcome");
          }} 
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>

        <View style={styles.copy}>
          <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>{t.auth.social.title}</Text>
          <Text style={styles.description}>{t.auth.social.description}</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.actions}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <SocialAuthButton label={t.auth.social.google} onPress={() => handleContinue("google")} provider="google" />
              <SocialAuthButton label={t.auth.social.facebook} onPress={() => handleContinue("facebook")} provider="facebook" />
            </>
          )}
        </View>

        <Text style={styles.legal}>{t.auth.social.legal}</Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingVertical: spacing.lg,
    justifyContent: "space-between",
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  closeText: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 24,
  },
  copy: {
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: "center",
  },
  titleCompact: {
    ...typography.h1,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  actions: {
    gap: spacing.md,
  },
  legal: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: "#FF5A5F",
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
