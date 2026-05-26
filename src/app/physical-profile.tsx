import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { gradients, radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { t } from "@/constants/i18n";
import { useGetUserInfo } from "@/hooks/queries/useUserQueries";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSettingsStore } from "@/store/settingsStore";
import { getAgeFromBirthDate } from "@/utils/date";
import {
  DEFAULT_CURRENT_WEIGHT_KG,
  DEFAULT_HEIGHT_CM,
  DEFAULT_TARGET_WEIGHT_KG,
} from "@/constants/onboarding";

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcEstimatedDate(goalWeightKg: number, currentWeightKg: number, weeklyRateKg = 0.2): string {
  const diff = Math.abs(goalWeightKg - currentWeightKg);
  const lang = useSettingsStore.getState?.()?.language || "vi";
  if (diff === 0 || weeklyRateKg <= 0) return t.physicalProfile.estimatedMaintaining;
  const weeks = Math.ceil(diff / weeklyRateKg);
  const d = new Date();
  d.setDate(d.getDate() + weeks * 7);
  return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function PhysicalProfileScreen() {
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  // Bypass API call for UI development when auth is disabled
  const { data: userGoalInfo } = useGetUserInfo();
  const { draft } = useOnboardingStore();
  const unit = useSettingsStore((state) => state.unit);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  const profileInfo = userGoalInfo?.profile;
  const activeGoal = userGoalInfo?.activeGoal;

  const isLbs = unit === "lbs";
  const convertWeight = (val: number) => {
    return isLbs ? parseFloat((val * 2.20462).toFixed(1)) : val;
  };

  // ── Derived values ──
  const nickname =
    profileInfo?.displayName ?? draft.nickname ?? "USER";
  const age = profileInfo?.dateOfBirth
    ? getAgeFromBirthDate(profileInfo.dateOfBirth)
    : draft.birthDateISO
    ? getAgeFromBirthDate(draft.birthDateISO)
    : "—";

  const GENDER_LABEL: Record<string | number, string> = {
    1: t.physicalProfile.genders.male,
    2: t.physicalProfile.genders.female,
    male: t.physicalProfile.genders.male,
    female: t.physicalProfile.genders.female,
  };

  const genderLabel =
    GENDER_LABEL[profileInfo?.gender ?? ""] ??
    GENDER_LABEL[draft.gender ?? ""] ?? "—";
  const heightCm = profileInfo?.heightCm ?? draft.heightCm ?? DEFAULT_HEIGHT_CM;
  const weightKg = profileInfo?.weightKg ?? draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG;
  const goalWeightKg = activeGoal?.goalWeightKg ?? draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG;
  const targetCalories = activeGoal?.targetCalories ?? null;
  const activityLevel = activeGoal?.activityLevel ?? null;
  const goalType = activeGoal?.goalType ?? null;
  const weeklyGoalKg = draft.weeklyGoalKg ?? 0.2;

  const displayedWeight = convertWeight(weightKg);
  const displayedGoalWeight = convertWeight(goalWeightKg);
  const displayedWeeklyGoal = convertWeight(weeklyGoalKg);

  const GOAL_LABEL: Record<string | number, string> = {
    1: t.onboarding.goalOptions.lose_weight.title,
    2: t.onboarding.goalOptions.gain_weight.title,
    3: t.onboarding.goalOptions.maintain_weight.title,
    lose_weight: t.onboarding.goalOptions.lose_weight.title,
    gain_weight: t.onboarding.goalOptions.gain_weight.title,
    maintain_weight: t.onboarding.goalOptions.maintain_weight.title,
  };

  const ACTIVITY_LABEL: Record<string | number, string> = {
    1: t.onboarding.activityOptions.sedentary.title,
    2: t.onboarding.activityOptions.light.title,
    3: t.onboarding.activityOptions.moderate.title,
    4: t.onboarding.activityOptions.active.title,
    5: t.onboarding.activityOptions.very_active.title,
    sedentary: t.onboarding.activityOptions.sedentary.title,
    light: t.onboarding.activityOptions.light.title,
    moderate: t.onboarding.activityOptions.moderate.title,
    active: t.onboarding.activityOptions.active.title,
    very_active: t.onboarding.activityOptions.very_active.title,
  };

  const goalLabel = GOAL_LABEL[goalType ?? ""] ?? GOAL_LABEL[draft.goalType ?? ""] ?? "—";
  const activityLabel = ACTIVITY_LABEL[activityLevel ?? ""] ?? ACTIVITY_LABEL[draft.activityLevel ?? ""] ?? "—";

  const weeklyGoalLabel =
    goalType === 1 || draft.goalType === "lose_weight"
      ? t.physicalProfile.weeklyGoalLabel.lose(String(displayedWeeklyGoal), unit)
      : goalType === 2 || draft.goalType === "gain_weight"
      ? t.physicalProfile.weeklyGoalLabel.gain(String(displayedWeeklyGoal), unit)
      : t.physicalProfile.weeklyGoalLabel.maintain;

  const estimatedDate = calcEstimatedDate(goalWeightKg as number, weightKg as number, weeklyGoalKg);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={16}
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>{t.physicalProfile.title}</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Card 1: Basic Info ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t.physicalProfile.basicInfo}</Text>
            <Pressable
              hitSlop={12}
              style={({ pressed }) => pressed && { opacity: 0.6 }}
              onPress={() => Alert.alert(t.common.edit, t.common.featureUnderDev)}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            </Pressable>
          </View>

          {/* Nickname */}
          <Text style={styles.nicknameValue}>{nickname.toUpperCase()}</Text>

          {/* 3-column grid */}
          <View style={styles.infoGrid}>
            <InfoCell label={t.physicalProfile.gender} value={genderLabel} />
            <View style={styles.gridDivider} />
            <InfoCell label={t.physicalProfile.age} value={String(age)} />
            <View style={styles.gridDivider} />
            <InfoCell label={t.physicalProfile.height} value={`${heightCm} cm`} />
          </View>
        </View>

        {/* ── Card 2: Weight Goal ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t.physicalProfile.weightGoal}</Text>
            <Pressable hitSlop={12}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          {/* Goal type badge */}
          <View style={styles.goalBadge}>
            <LinearGradient
              colors={gradients.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.goalBadgeGradient}
            >
              <Ionicons name="flag" size={14} color="#fff" />
              <Text style={styles.goalBadgeText}>{goalLabel ?? "—"}</Text>
            </LinearGradient>
          </View>

          {/* Goal rows */}
          <GoalRow
            label={t.physicalProfile.weeklyGoal}
            value={weeklyGoalLabel}
            clickable
            onPress={() => Alert.alert(t.physicalProfile.weeklyGoal, t.common.featureUnderDev)}
          />
          <GoalRow
            label={t.physicalProfile.activityLevel}
            value={activityLabel ?? "—"}
            clickable
            onPress={() => Alert.alert(t.physicalProfile.activityLevel, t.common.featureUnderDev)}
            truncate
          />
          <GoalRow
            label={t.physicalProfile.calorieGoal}
            value={targetCalories ? `${Math.round(Number(targetCalories))} kcal` : "— kcal"}
          />
          <GoalRow
            label={t.physicalProfile.estimatedCompletion}
            value={estimatedDate}
            isLast
          />
        </View>

        {/* ── Weight summary ── */}
        <View style={styles.weightRow}>
          <WeightChip label={t.physicalProfile.currentWeight} value={`${displayedWeight} ${unit}`} color={colors.textPrimary} />
          <View style={styles.weightArrow}>
            <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
          </View>
          <WeightChip label={t.physicalProfile.goalWeight} value={`${displayedGoalWeight} ${unit}`} color={colors.primary} />
        </View>
      </ScrollView>

      {/* ── Fixed CTA ── */}
      <View style={[styles.cta, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && { opacity: 0.85 }]}
          onPress={() => setResetModalVisible(true)}
        >
          <LinearGradient
            colors={gradients.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.ctaText}>{t.physicalProfile.setNewGoal}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* ── Reset Confirmation Modal ── */}
      <Modal
        transparent
        animationType="fade"
        visible={resetModalVisible}
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <Ionicons name="refresh-circle" size={48} color={colors.primary} style={{ alignSelf: "center", marginBottom: spacing.md }} />

            <Text style={styles.modalTitle}>{t.physicalProfile.newGoalModal.title}</Text>
            <Text style={styles.modalBody}>
              {t.physicalProfile.newGoalModal.body}
            </Text>

            <View style={styles.modalBullets}>
              <Text style={styles.modalBullet}>
                <Text style={styles.bulletNum}>1. </Text>
                {t.physicalProfile.newGoalModal.bullet1}
              </Text>
              <Text style={styles.modalBullet}>
                <Text style={styles.bulletNum}>2. </Text>
                {t.physicalProfile.newGoalModal.bullet2}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalBtnOutline, pressed && { opacity: 0.7 }]}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.modalBtnOutlineText}>{t.physicalProfile.newGoalModal.cancel}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalBtnPrimary, pressed && { opacity: 0.85 }]}
                onPress={() => {
                  setResetModalVisible(false);
                  if (profileInfo) {
                    const genderVal = (profileInfo.gender === 1 || String(profileInfo.gender).toLowerCase() === "male") ? "male" : "female";
                    
                    const activityLevelMapInverse: Record<number | string, any> = {
                      1: "sedentary",
                      2: "light",
                      3: "moderate",
                      4: "active",
                      5: "very_active",
                    };
                    
                    const goalTypeMapInverse: Record<number | string, any> = {
                      1: "lose_weight",
                      2: "gain_weight",
                      3: "maintain_weight",
                    };

                    useOnboardingStore.getState().updateDraft({
                      nickname: profileInfo.displayName ?? null,
                      gender: genderVal,
                      birthDateISO: profileInfo.dateOfBirth ? String(profileInfo.dateOfBirth) : null,
                      heightCm: profileInfo.heightCm ? Number(profileInfo.heightCm) : null,
                      currentWeightKg: profileInfo.weightKg ? Number(profileInfo.weightKg) : null,
                      goalType: activeGoal?.goalType ? goalTypeMapInverse[activeGoal.goalType] : null,
                      targetWeightKg: activeGoal?.goalWeightKg ? Number(activeGoal.goalWeightKg) : null,
                      activityLevel: activeGoal?.activityLevel ? activityLevelMapInverse[activeGoal.activityLevel] : null,
                    });
                  }
                  router.push("/(onboarding)/goal-type");
                }}
              >
                <LinearGradient
                  colors={gradients.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalBtnGradient}
                >
                  <Text style={styles.modalBtnPrimaryText}>{t.physicalProfile.newGoalModal.submit}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoCell({ label, value }: { label: string; value: string }) {
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoCellLabel}>{label}</Text>
      <Text style={styles.infoCellValue}>{value}</Text>
    </View>
  );
}

function GoalRow({
  label,
  value,
  clickable = false,
  onPress,
  isLast = false,
  truncate = false,
}: {
  label: string;
  value: string;
  clickable?: boolean;
  onPress?: () => void;
  isLast?: boolean;
  truncate?: boolean;
}) {
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const Inner = (
    <View style={[styles.goalRow, !isLast && styles.goalRowBorder]}>
      <Text style={styles.goalRowLabel}>{label}</Text>
      <View style={styles.goalRowRight}>
        <Text
          style={styles.goalRowValue}
          numberOfLines={truncate ? 1 : undefined}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
        {clickable && (
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        )}
      </View>
    </View>
  );

  if (clickable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && { opacity: 0.7 }}
      >
        {Inner}
      </Pressable>
    );
  }
  return Inner;
}

function WeightChip({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  return (
    <View style={styles.weightChip}>
      <Text style={styles.weightChipLabel}>{label}</Text>
      <Text style={[styles.weightChipValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },

  // Navbar
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navBtn: {
    width: 40,
    alignItems: "center",
  },
  navTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },

  // Scroll
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },

  // Nickname
  nicknameValue: {
    ...typography.h2,
    color: colors.textPrimary,
    letterSpacing: 1,
  },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  infoCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: 4,
  },
  infoCellLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 0.5,
    fontWeight: "700",
  },
  infoCellValue: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 18,
  },
  gridDivider: {
    width: 1,
    backgroundColor: colors.borderSoft,
    marginVertical: spacing.sm,
  },

  // Goal badge
  goalBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  goalBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  goalBadgeText: {
    ...typography.caption,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Goal rows
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  goalRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  goalRowLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  goalRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "55%",
  },
  goalRowValue: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 14,
    textAlign: "right",
    flexShrink: 1,
  },

  // Weight summary
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  weightChip: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  weightChipLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  weightChipValue: {
    ...typography.number,
    fontSize: 22,
  },
  weightArrow: {
    paddingHorizontal: spacing.sm,
  },

  // CTA
  cta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.bgBase,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  ctaButton: {
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  ctaText: {
    ...typography.bodyStrong,
    color: "#fff",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
  },
  modalBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 14,
  },
  modalBullets: {
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  modalBullet: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  bulletNum: {
    color: colors.primary,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalBtnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  modalBtnOutlineText: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
  modalBtnPrimary: {
    flex: 1,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  modalBtnGradient: {
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: radius.pill,
  },
  modalBtnPrimaryText: {
    ...typography.bodyStrong,
    color: "#fff",
  },
});
