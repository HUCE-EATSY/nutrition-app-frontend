import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TrialBanner } from "@/src/components/account/TrialBanner";
import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { t } from "@/src/i18n";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { colors, radius, spacing, typography } from "@/src/theme";
import { useResponsiveLayout } from "@/src/theme/responsive";
import { getAgeFromBirthDate } from "@/src/utils/date";

const resetCopy = {
  title: "Du lieu test",
  body: "Xoa ho so onboarding da luu va dua tai khoan ve trang bat dau de test lai tu dau.",
  confirmBody: "Thao tac nay se xoa toan bo thong tin onboarding dang luu tren thiet bi nay.",
  startButton: "Dat lai tu dau",
  confirmButton: "Xoa du lieu",
  loading: "Dang xoa du lieu...",
  cancel: "Huy",
} as const;

export function AccountScreen() {
  const draft = useOnboardingStore((state) => state.draft);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const age = draft.birthDateISO ? getAgeFromBirthDate(draft.birthDateISO) : 24;
  const { isCompact, isNarrowWidth } = useResponsiveLayout();
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetRequest = () => {
    if (isResetting) {
      return;
    }

    setIsConfirmingReset(true);
  };

  const handleResetCancel = () => {
    if (isResetting) {
      return;
    }

    setIsConfirmingReset(false);
  };

  const handleResetConfirm = () => {
    if (isResetting) {
      return;
    }

    setIsResetting(true);
    resetOnboarding();
    router.replace("/(public)/welcome");
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>{t.account.title}</Text>

        <View style={[styles.profileRow, isCompact && styles.profileRowCompact]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(draft.nickname ?? t.account.defaultInitial).slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.name, isNarrowWidth && styles.nameCompact]}>{draft.nickname ?? t.account.defaultName}</Text>
            <Text style={styles.subline}>{t.account.subline}</Text>
          </View>
          <Pressable style={[styles.editButton, isCompact && styles.editButtonCompact]}>
            <Ionicons color={colors.textPrimary} name="create-outline" size={18} />
          </Pressable>
        </View>

        <TrialBanner ctaLabel={t.account.upgrade} onPress={() => undefined} title={t.account.trialTitle} />

        <SurfaceCard>
          <Text style={styles.sectionTitle}>{t.account.quickStats}</Text>
          <View style={[styles.metricsRow, isCompact && styles.metricsRowCompact]}>
            <ProfileMetric compact={isCompact} label={t.account.age} value={`${age}`} />
            <ProfileMetric compact={isCompact} label={t.account.height} value={`${draft.heightCm ?? 168} cm`} />
            <ProfileMetric compact={isCompact} label={t.account.weight} value={`${draft.currentWeightKg ?? 62} kg`} />
          </View>
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>{t.account.macroGoals}</Text>
          <Text style={styles.body}>{t.account.macroGoalsBody}</Text>
        </SurfaceCard>

        <SurfaceCard style={styles.dangerCard}>
          <Text style={styles.sectionTitle}>{resetCopy.title}</Text>
          <Text style={styles.body}>{isConfirmingReset ? resetCopy.confirmBody : resetCopy.body}</Text>

          {isConfirmingReset ? (
            <View style={[styles.resetActionsRow, isCompact && styles.resetActionsRowCompact]}>
              <Pressable
                disabled={isResetting}
                onPress={handleResetCancel}
                style={({ pressed }) => [
                  styles.secondaryActionButton,
                  pressed && !isResetting && styles.actionButtonPressed,
                  isResetting && styles.actionButtonDisabled,
                ]}
              >
                <Text style={styles.secondaryActionText}>{resetCopy.cancel}</Text>
              </Pressable>

              <Pressable
                disabled={isResetting}
                onPress={handleResetConfirm}
                style={({ pressed }) => [
                  styles.primaryDangerButton,
                  pressed && !isResetting && styles.actionButtonPressed,
                  isResetting && styles.actionButtonDisabled,
                ]}
              >
                <Text style={styles.primaryDangerText}>{isResetting ? resetCopy.loading : resetCopy.confirmButton}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              disabled={isResetting}
              onPress={handleResetRequest}
              style={({ pressed }) => [
                styles.primaryDangerButton,
                pressed && !isResetting && styles.actionButtonPressed,
                isResetting && styles.actionButtonDisabled,
              ]}
            >
              <Text style={styles.primaryDangerText}>{resetCopy.startButton}</Text>
            </Pressable>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/webview",
                params: { title: t.account.supportTitle, url: "https://dnt.app/support" },
              })
            }
            style={styles.rowButton}
          >
            <Text style={styles.rowButtonText}>{t.account.supportLabel}</Text>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/webview",
                params: { title: t.account.policyTitle, url: "https://dnt.app/policy" },
              })
            }
            style={styles.rowButton}
          >
            <Text style={styles.rowButtonText}>{t.account.policyLabel}</Text>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </Pressable>
        </SurfaceCard>
      </View>
    </SafeScreen>
  );
}

function ProfileMetric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <View style={[styles.metric, compact && styles.metricCompact]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  titleCompact: {
    ...typography.h1,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  profileRowCompact: {
    flexWrap: "wrap",
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: radius.pill,
    backgroundColor: "rgba(165,108,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  nameCompact: {
    ...typography.h3,
  },
  subline: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  editButtonCompact: {
    marginLeft: "auto",
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metricsRowCompact: {
    flexWrap: "wrap",
  },
  metric: {
    flex: 1,
    gap: 4,
  },
  metricCompact: {
    flexBasis: "45%",
    minWidth: "45%",
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metricValue: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  dangerCard: {
    gap: spacing.md,
    borderColor: "rgba(255,125,125,0.24)",
  },
  resetActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  resetActionsRowCompact: {
    flexDirection: "column",
  },
  primaryDangerButton: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255,125,125,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,125,125,0.45)",
  },
  secondaryActionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  actionButtonPressed: {
    opacity: 0.88,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  primaryDangerText: {
    ...typography.bodyStrong,
    color: colors.danger,
  },
  secondaryActionText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  rowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  rowButtonText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
});
