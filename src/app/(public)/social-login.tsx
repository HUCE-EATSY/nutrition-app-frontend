/* eslint-disable react-hooks/rules-of-hooks */
import { router } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useCallback, useMemo } from "react";

import { SocialAuthButton } from "@/components/buttons/SocialAuthButton";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { useTranslation } from "@/constants/i18n";
import { useOnboardingStore } from "@/store/onboardingStore";
import { radius, shadows, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { trackEvent } from "@/utils/analytics";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAppColors } from "@/hooks/useAppColors";

// Chỉ khởi tạo useGoogleLogin trên Web — tránh native crash vì thiếu DOM context
let useGoogleLogin: ((opts: any) => () => void) | null = null;
if (Platform.OS === "web") {
  useGoogleLogin = (require("@react-oauth/google") as typeof import("@react-oauth/google")).useGoogleLogin;
}

export default function SocialLoginScreen() {
  const t = useTranslation();
  const setPublicFlowStep = useOnboardingStore((state) => state.setPublicFlowStep);
  const { isNarrowWidth, isShortHeight } = useResponsiveLayout();
  const { signIn, signInWeb, loading, error } = useGoogleAuth();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleClose = useCallback(() => {
    setPublicFlowStep("welcome");
    router.replace("/(public)/welcome");
  }, [setPublicFlowStep]);

  // Web: khởi tạo popup Google — hook phải được gọi unconditionally theo Rules of Hooks,
  // nhưng vì file này chỉ chạy sau khi bundle, Platform.OS là constant nên safe.
  const loginWeb = Platform.OS === "web" && useGoogleLogin
    ? useGoogleLogin({
        onSuccess: (tokenResponse: { access_token: string }) => {
          trackEvent("social_login_clicked", { provider: "google", screen_name: "social-login", platform: "web" });
          signInWeb(tokenResponse.access_token);
        },
        onError: (err: unknown) => {
          console.log("Đăng nhập Google Web thất bại", err);
        },
      })
    : null;

  // Nút bấm duy nhất cho cả web lẫn native — giao diện không thay đổi
  const handleGooglePress = useCallback(() => {
    trackEvent("social_login_clicked", { provider: "google", screen_name: "social-login" });
    if (Platform.OS === "web" && loginWeb) {
      loginWeb(); // kích popup Google trên Web
    } else {
      signIn(); // SDK native trên iOS/Android
    }
  }, [loginWeb, signIn]);

  return (
    <SafeScreen scrollable={isShortHeight}>
      <View style={styles.screen}>
        <Pressable
          onPress={handleClose}
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
            <SocialAuthButton label={t.auth.social.google} onPress={handleGooglePress} provider="google" />
          )}
        </View>
      </View>
    </SafeScreen>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
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
