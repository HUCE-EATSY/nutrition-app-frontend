import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Toast } from "@/components/common/Toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import DateTimePicker from "@react-native-community/datetimepicker";
import { gradients, radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { t, useTranslation } from "@/constants/i18n";
import { useGetUserInfo } from "@/hooks/queries/useUserQueries";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSettingsStore } from "@/store/settingsStore";
import { getAgeFromBirthDate, createBirthDateISO, getDateParts } from "@/utils/date";
import { userService } from "@/services/userService";
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
  const t = useTranslation();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  // Bypass API call for UI development when auth is disabled
  const { data: userGoalInfo } = useGetUserInfo();
  const { draft } = useOnboardingStore();
  const unit = useSettingsStore((state) => state.unit);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  const queryClient = useQueryClient();
  const [editBasicVisible, setEditBasicVisible] = useState(false);
  const [editActivityVisible, setEditActivityVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // States for basic info form
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState<1 | 2>(1);
  const [editHeight, setEditHeight] = useState<number>(170);
  const [editWeight, setEditWeight] = useState<number>(60);
  const [editBirthDate, setEditBirthDate] = useState<Date>(new Date("2000-08-15"));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State for activity level form
  const [editActivityLevel, setEditActivityLevel] = useState<number>(1);

  const profileInfo = userGoalInfo?.profile;
  const activeGoal = userGoalInfo?.activeGoal ?? userGoalInfo?.ActiveGoal;

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
  const goalWeightKg = activeGoal?.goalWeightKg ?? activeGoal?.GoalWeightKg ?? draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG;
  const targetCalories = activeGoal?.targetCalories ?? activeGoal?.TargetCalories ?? null;
  const activityLevel = activeGoal?.activityLevel ?? activeGoal?.ActivityLevel ?? null;
  const goalType = activeGoal?.goalType ?? activeGoal?.GoalType ?? null;
  const weeklyGoalKg = activeGoal?.weeklyGoalKg ?? activeGoal?.WeeklyGoalKg ?? draft.weeklyGoalKg ?? 0.2;

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

  const openEditBasicModal = () => {
    const curName = profileInfo?.displayName ?? draft.nickname ?? "USER";
    const curGender = profileInfo?.gender ?? (draft.gender === "male" ? 1 : 2);
    const curHeight = profileInfo?.heightCm ?? draft.heightCm ?? DEFAULT_HEIGHT_CM;
    const curWeight = profileInfo?.weightKg ?? draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG;

    const displayedWeightVal = convertWeight(Number(curWeight));

    const dobISO = profileInfo?.dateOfBirth ? String(profileInfo.dateOfBirth) : (draft.birthDateISO ? String(draft.birthDateISO) : "2000-08-15");
    const dobParts = getDateParts(dobISO);

    setEditName(curName);
    setEditGender(curGender === 1 || String(curGender).toLowerCase() === "male" ? 1 : 2);
    setEditHeight(Number(curHeight));
    setEditWeight(Number(displayedWeightVal));
    setEditBirthDate(new Date(dobISO));

    setEditBasicVisible(true);
  };

  const openEditActivityModal = () => {
    const curLevel = activeGoal?.activityLevel ?? activeGoal?.ActivityLevel ?? 1;
    setEditActivityLevel(Number(curLevel));
    setEditActivityVisible(true);
  };

  const handleSaveBasicInfo = async () => {
    if (!editName.trim()) {
      showToast(t.validators.nicknameMin, "error");
      return;
    }

    const h = editHeight;
    if (isNaN(h) || h < 50 || h > 300) {
      showToast("Chiều cao không hợp lệ (50 - 300 cm)", "error");
      return;
    }

    const w = editWeight;
    if (isNaN(w) || w < 20 || w > 300) {
      showToast(isLbs ? "Cân nặng không hợp lệ (44 - 660 lbs)" : "Cân nặng không hợp lệ (20 - 300 kg)", "error");
      return;
    }

    // Convert weight to kg if it was input in lbs
    const weightKgVal = isLbs ? parseFloat((w / 2.20462).toFixed(1)) : w;

    const birthDateISO = editBirthDate.toISOString().split("T")[0];
    const ageVal = getAgeFromBirthDate(birthDateISO);
    if (ageVal < 18) {
      showToast(t.validators.adultOnly, "error");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        displayName: editName,
        avatarUrl: profileInfo?.avatarUrl ?? null,
        gender: editGender, // 1 = Male, 2 = Female
        dateOfBirth: birthDateISO,
        heightCm: h,
        weightKg: weightKgVal,
        activityLevel: activeGoal?.activityLevel ?? activeGoal?.ActivityLevel ?? 1,
      };

      await userService.updateProfile(payload);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setEditBasicVisible(false);
      showToast("Cập nhật hồ sơ thành công!", "success");
    } catch (err: any) {
      console.error("Save basic profile error:", err);
      showToast(err?.message || "Không thể cập nhật hồ sơ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveActivityLevel = async (level: number) => {
    try {
      setIsSaving(true);

      const curName = profileInfo?.displayName ?? draft.nickname ?? "USER";
      const curGender = profileInfo?.gender ?? (draft.gender === "male" ? 1 : 2);
      const curHeight = profileInfo?.heightCm ?? draft.heightCm ?? DEFAULT_HEIGHT_CM;
      const curWeight = profileInfo?.weightKg ?? draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG;
      const dobISO = profileInfo?.dateOfBirth ? String(profileInfo.dateOfBirth) : (draft.birthDateISO ? String(draft.birthDateISO) : "2000-08-15");

      const payload = {
        displayName: curName,
        avatarUrl: profileInfo?.avatarUrl ?? null,
        gender: curGender === 1 || String(curGender).toLowerCase() === "male" ? 1 : 2,
        dateOfBirth: dobISO.split("T")[0],
        heightCm: Number(curHeight),
        weightKg: Number(curWeight),
        activityLevel: level,
      };

      await userService.updateProfile(payload);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setEditActivityVisible(false);
      showToast("Cập nhật mức vận động thành công!", "success");
    } catch (err: any) {
      console.error("Save activity level error:", err);
      showToast(err?.message || "Không thể cập nhật mức vận động", "error");
    } finally {
      setIsSaving(false);
    }
  };

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
              onPress={openEditBasicModal}
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
            clickable={goalType !== 3}
            onPress={goalType !== 3 ? () => showToast("Để thay đổi tiến trình, vui lòng chọn 'Thiết lập mục tiêu mới' ở dưới.", "info") : undefined}
          />
          <GoalRow
            label={t.physicalProfile.activityLevel}
            value={activityLabel ?? "—"}
            clickable={goalType !== 3}
            onPress={goalType !== 3 ? openEditActivityModal : undefined}
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

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

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
                      goalType: (activeGoal?.goalType ?? activeGoal?.GoalType) ? goalTypeMapInverse[activeGoal?.goalType ?? activeGoal?.GoalType] : null,
                      targetWeightKg: (activeGoal?.goalWeightKg ?? activeGoal?.GoalWeightKg) ? Number(activeGoal?.goalWeightKg ?? activeGoal?.GoalWeightKg) : null,
                      activityLevel: (activeGoal?.activityLevel ?? activeGoal?.ActivityLevel) ? activityLevelMapInverse[activeGoal?.activityLevel ?? activeGoal?.ActivityLevel] : null,
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

      {/* ── Edit Basic Info Modal ── */}
      <Modal
        transparent
        animationType="slide"
        visible={editBasicVisible}
        onRequestClose={() => {
          if (!isSaving) setEditBasicVisible(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior="padding"
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => !isSaving && setEditBasicVisible(false)}
          />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Cập nhật thông tin cơ bản</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Biệt danh */}
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Biệt danh</Text>
                <TextInput
                  style={styles.infoRowInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nhập biệt danh..."
                  placeholderTextColor={colors.textMuted}
                  editable={!isSaving}
                  returnKeyType="next"
                />
              </View>

              {/* Giới tính */}
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Giới tính</Text>
                <View style={styles.genderToggle}>
                  <Pressable
                    style={[styles.genderChip, editGender === 1 && styles.genderChipActive]}
                    onPress={() => !isSaving && setEditGender(1)}
                  >
                    <Text style={[styles.genderChipText, editGender === 1 && styles.genderChipTextActive]}>Nam</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.genderChip, editGender === 2 && styles.genderChipActive]}
                    onPress={() => !isSaving && setEditGender(2)}
                  >
                    <Text style={[styles.genderChipText, editGender === 2 && styles.genderChipTextActive]}>Nữ</Text>
                  </Pressable>
                </View>
              </View>

              {/* Chiều cao */}
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Chiều cao (cm)</Text>
                <TextInput
                  style={styles.infoRowInput}
                  value={String(editHeight)}
                  onChangeText={(text) => {
                    const val = parseFloat(text.replace(/[^0-9.]/g, ""));
                    setEditHeight(isNaN(val) ? 0 : val);
                  }}
                  placeholder="170"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  editable={!isSaving}
                  returnKeyType="done"
                />
              </View>

              {/* Ngày sinh */}
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoRowLabel}>Ngày sinh</Text>
                <Pressable onPress={() => !isSaving && setShowDatePicker(true)}>
                  <Text style={styles.infoRowDateText}>
                    {editBirthDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={editBirthDate}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setEditBirthDate(selectedDate);
                    }}
                  />
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalBtnOutline, pressed && { opacity: 0.7 }]}
                onPress={() => !isSaving && setEditBasicVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.modalBtnOutlineText}>{t.common.cancel}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalBtnPrimary, pressed && { opacity: 0.85 }]}
                onPress={handleSaveBasicInfo}
                disabled={isSaving}
              >
                <LinearGradient
                  colors={gradients.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalBtnGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalBtnPrimaryText}>{t.common.save}</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Edit Activity Level Modal ── */}
      <Modal
        transparent
        animationType="slide"
        visible={editActivityVisible}
        onRequestClose={() => {
          if (!isSaving) setEditActivityVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t.physicalProfile.activityLevel}</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {Object.keys(t.onboarding.activityOptions).map((key, index) => {
                const optKey = key as keyof typeof t.onboarding.activityOptions;
                const opt = t.onboarding.activityOptions[optKey];
                const optVal = index + 1; // 1 to 5
                const isActive = editActivityLevel === optVal;

                return (
                  <Pressable
                    key={key}
                    style={[styles.activityOption, isActive && styles.activityOptionActive]}
                    onPress={() => !isSaving && setEditActivityLevel(optVal)}
                  >
                    <Text style={[styles.activityOptionTitle, isActive && styles.activityOptionTitleActive]}>
                      {opt.title}
                    </Text>
                    <Text style={styles.activityOptionSub}>{opt.subtitle}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalBtnOutline, pressed && { opacity: 0.7 }]}
                onPress={() => !isSaving && setEditActivityVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.modalBtnOutlineText}>{t.common.cancel}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalBtnPrimary, pressed && { opacity: 0.85 }]}
                onPress={() => handleSaveActivityLevel(editActivityLevel)}
                disabled={isSaving}
              >
                <LinearGradient
                  colors={gradients.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalBtnGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalBtnPrimaryText}>{t.common.save}</Text>
                  )}
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
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: "700",
  },
  textInput: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  inputCol: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  genderBtnActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(165, 108, 255, 0.1)",
  },
  genderBtnText: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
  genderBtnTextActive: {
    color: colors.primary,
  },
  // ── Inline row layout for Edit Basic Info ──
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  infoRowLabel: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  infoRowInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    textAlign: "right",
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  infoRowDateText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: "right",
  },
  genderToggle: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  genderChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  genderChipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(165, 108, 255, 0.15)",
  },
  genderChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  genderChipTextActive: {
    color: colors.primary,
  },
  activityOption: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  activityOptionActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(165, 108, 255, 0.1)",
  },
  activityOptionTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  activityOptionTitleActive: {
    color: colors.primary,
  },
  activityOptionSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
