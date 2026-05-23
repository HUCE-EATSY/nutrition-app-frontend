import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { GradientButton } from "@/components/buttons/GradientButton";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { WelcomeHeroIllustration } from "@/components/WelcomeHeroIllustration";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuthStore } from "@/store/authStore";
import { colors, radius, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { trackEvent } from "@/utils/analytics";

// 1. Tối ưu: Đưa mảng vị trí tĩnh ra ngoài component để tránh việc khởi tạo lại liên tục
const FLOATING_POSITIONS: ViewStyle[] = [
  { top: '15%', left: '-10%' },
  { bottom: '20%', right: '-15%' },
  { top: '-5%', left: '30%' },
  { bottom: '-10%', right: '25%' },
];

export default function MascotIntroScreen() {
  const setPublicFlowStep = useOnboardingStore((state) => state.setPublicFlowStep);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { width, isNarrowWidth, isShortHeight } = useResponsiveLayout();
  
  const isCompactLayout = isNarrowWidth || isShortHeight;

  // 2. Tối ưu: Memoize các giá trị tính toán layout dựa trên width/layout thay đổi
  const { heroBounds, chipOffset, chipSize, secondaryChipSize } = useMemo(() => {
    const bounds = isCompactLayout
      ? Math.min(Math.max(width * 0.54, 176), 220)
      : Math.min(Math.max(width * 0.68, 220), 300);
    const offset = Math.max(bounds * 0.1, 10);
    const size = isCompactLayout ? 44 : 56;
    
    return {
      heroBounds: bounds,
      chipOffset: offset,
      chipSize: size,
      secondaryChipSize: size * 0.8,
    };
  }, [width, isCompactLayout]);

  // 3. Tối ưu: Bọc các hàm điều hướng trong useCallback để giữ nguyên tham chiếu hàm
  const handleContinue = useCallback(() => {
    trackEvent("mascot_intro_continue", { screen_name: "mascot-intro" });
    setPublicFlowStep("done");
    router.replace("/(onboarding)/nickname");
  }, [setPublicFlowStep]);

  const handleClose = useCallback(() => {
    clearAuth();
    setPublicFlowStep("social-login");
    router.replace("/(public)/social-login");
  }, [clearAuth, setPublicFlowStep]);

  return (
    <SafeScreen>
      <View style={[styles.screen, isCompactLayout && styles.screenCompact]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>

        <View style={[styles.bubble, isCompactLayout && styles.bubbleCompact]}>
          <Text style={[styles.bubbleText, isNarrowWidth && styles.bubbleTextCompact]}>
            {t.auth.mascot.bubble}
          </Text>
        </View>

        <View style={[styles.heroArea, isCompactLayout && styles.heroAreaCompact, { minHeight: heroBounds }]}>
          <View style={[styles.heroOrbit, { width: heroBounds, height: heroBounds }]}>
            
            {/* Main Badge 1 */}
            <View 
              style={[
                styles.iconChipTop, 
                { 
                  top: chipOffset * 0.5, 
                  right: chipOffset * 0.5, 
                  width: chipSize, 
                  height: chipSize 
                }
              ]}
            >
              <Text style={styles.iconText}>{t.auth.mascot.topBadge}</Text>
            </View>

            {/* Main Badge 2 */}
            <View 
              style={[
                styles.iconChipBottom, 
                { 
                  bottom: chipOffset * 0.5, 
                  left: chipOffset * 0.5, 
                  width: chipSize, 
                  height: chipSize 
                }
              ]}
            >
              <Text style={styles.iconText}>{t.auth.mascot.bottomBadge}</Text>
            </View>

            {/* Additional floating badges */}
            {t.auth.mascot.badges.map((emoji, index) => {
              const pos = FLOATING_POSITIONS[index % FLOATING_POSITIONS.length];

              return (
                <View
                  key={index}
                  style={[
                    styles.secondaryChip,
                    pos,
                    {
                      width: secondaryChipSize,
                      height: secondaryChipSize,
                    }
                  ]}
                >
                  <Text style={{ fontSize: secondaryChipSize * 0.5 }}>{emoji}</Text>
                </View>
              );
            })}

            <WelcomeHeroIllustration size={heroBounds * 0.8} />
          </View>
        </View>

        <View style={[styles.copy, isCompactLayout && styles.copyCompact]}>
          <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>
            {t.auth.mascot.title}
          </Text>
          <Text style={styles.description}>{t.auth.mascot.description}</Text>
        </View>

        <GradientButton label={t.auth.mascot.cta} onPress={handleContinue} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: spacing.xs,
  },
  closeText: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 24,
  },
  screen: {
    flex: 1,
    paddingVertical: spacing.lg,
    justifyContent: "space-between",
  },
  screenCompact: {
    paddingVertical: spacing.md,
  },
  bubble: {
    marginTop: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.bubble,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bubbleCompact: {
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bubbleText: {
    ...typography.h2,
    color: colors.bubbleText,
  },
  bubbleTextCompact: {
    ...typography.h3,
  },
  heroArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroAreaCompact: {
    flex: 0.8,
  },
  heroOrbit: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconChipTop: {
    position: "absolute",
    zIndex: 3,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  iconChipBottom: {
    position: "absolute",
    zIndex: 3,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  secondaryChip: {
    position: "absolute",
    zIndex: 2,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  },
  iconText: {
    fontSize: 24,
  },
  copy: {
    gap: spacing.sm,
    alignItems: "center",
  },
  copyCompact: {
    gap: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: "center",
  },
  titleCompact: {
    ...typography.h2,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
