import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Alert,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { getTodayDateISO } from "@/utils/date";
import { useWaterStore } from "@/store/waterStore";
import { useDiaryStore } from "@/store/diaryStore";
import { GradientButton } from "@/components/buttons/GradientButton";

export default function LogWaterScreen() {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  
  const selectedDate = useDiaryStore((state) => state.selectedDate);
  const { waterLogs, waterGoal, setWater, setWaterGoal } = useWaterStore();
  
  // Set date state based on diary selectedDate or today
  const [logDateStr, setLogDateStr] = useState(selectedDate || getTodayDateISO());
  
  // Get initial values from the store
  const [intake, setIntake] = useState(0);
  const [goal, setGoal] = useState(waterGoal);
  
  // When date or store changes, update locally
  useEffect(() => {
    setIntake(waterLogs[logDateStr] || 0);
  }, [logDateStr, waterLogs]);

  useEffect(() => {
    setGoal(waterGoal);
  }, [waterGoal]);

  const handleSave = () => {
    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(logDateStr)) {
      Alert.alert("Lỗi định dạng", "Vui lòng nhập ngày đúng định dạng YYYY-MM-DD.\nVí dụ: 2026-05-20");
      return;
    }

    if (isNaN(intake) || intake < 0) {
      Alert.alert("Lỗi nhập liệu", "Lượng nước uống không hợp lệ.");
      return;
    }

    if (isNaN(goal) || goal <= 0) {
      Alert.alert("Lỗi nhập liệu", "Mục tiêu nước uống phải lớn hơn 0.");
      return;
    }

    // Save to store
    setWater(logDateStr, intake);
    setWaterGoal(goal);

    // Alert success or go back
    router.back();
  };

  const handleQuickAdd = (amount: number) => {
    setIntake((prev) => prev + amount);
  };

  const handleQuickSubtract = (amount: number) => {
    setIntake((prev) => Math.max(0, prev - amount));
  };

  const handleTextChange = (text: string) => {
    const val = parseInt(text.replace(/[^0-9]/g, ""), 10);
    setIntake(isNaN(val) ? 0 : val);
  };

  const handleGoalChange = (text: string) => {
    const val = parseInt(text.replace(/[^0-9]/g, ""), 10);
    setGoal(isNaN(val) ? 0 : val);
  };

  const progressPercentage = goal > 0 ? Math.round((intake / goal) * 100) : 0;

  return (
    <SafeScreen contentContainerStyle={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={15}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Nhật ký nước uống</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Wave/Droplet Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.waterDropOuter}>
              <View style={[styles.waterDropInner, { height: `${Math.min(100, progressPercentage)}%` }]} />
              <MaterialCommunityIcons
                name={progressPercentage >= 100 ? "trophy-outline" : "water"}
                size={54}
                color={progressPercentage >= 100 ? "#F5B323" : "#FFF"}
                style={styles.dropIcon}
              />
            </View>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressMl}>
                {intake} <Text style={styles.unitText}>/ {goal} ml</Text>
              </Text>
              <Text style={styles.progressSub}>
                {progressPercentage >= 100
                  ? "Đã hoàn thành xuất sắc mục tiêu! 🎉"
                  : `Đạt ${progressPercentage}% mục tiêu ngày`}
              </Text>
            </View>
          </View>

          {/* Stepper controls */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>Lượng nước đã uống</Text>
            <View style={styles.stepperContainer}>
              <Pressable
                style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                onPress={() => handleQuickSubtract(250)}
              >
                <MaterialCommunityIcons name="minus" size={28} color={colors.textPrimary} />
              </Pressable>

              <View style={styles.valueInputContainer}>
                <TextInput
                  style={styles.intakeInput}
                  value={String(intake)}
                  onChangeText={handleTextChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <Text style={styles.mlLabel}>ml</Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                onPress={() => handleQuickAdd(250)}
              >
                <MaterialCommunityIcons name="plus" size={28} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* Presets Grid */}
          <View style={styles.presetsSection}>
            <Text style={styles.sectionLabel}>Thêm nhanh theo cốc/chai</Text>
            <View style={styles.presetsGrid}>
              <Pressable style={styles.presetItem} onPress={() => handleQuickAdd(150)}>
                <MaterialCommunityIcons name="cup-water" size={24} color={colors.carbs} />
                <Text style={styles.presetName}>Cốc nhỏ</Text>
                <Text style={styles.presetVal}>+150 ml</Text>
              </Pressable>
              
              <Pressable style={styles.presetItem} onPress={() => handleQuickAdd(250)}>
                <MaterialCommunityIcons name="cup" size={24} color={colors.carbs} />
                <Text style={styles.presetName}>Cốc tiêu chuẩn</Text>
                <Text style={styles.presetVal}>+250 ml</Text>
              </Pressable>

              <Pressable style={styles.presetItem} onPress={() => handleQuickAdd(500)}>
                <MaterialCommunityIcons name="bottle-wine-outline" size={24} color={colors.carbs} />
                <Text style={styles.presetName}>Chai vừa</Text>
                <Text style={styles.presetVal}>+500 ml</Text>
              </Pressable>

              <Pressable style={styles.presetItem} onPress={() => handleQuickAdd(750)}>
                <MaterialCommunityIcons name="bottle-wine" size={24} color={colors.carbs} />
                <Text style={styles.presetName}>Chai lớn</Text>
                <Text style={styles.presetVal}>+750 ml</Text>
              </Pressable>
            </View>
          </View>

          {/* Settings Section: Goal & Date */}
          <View style={styles.settingsSection}>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Mục tiêu ngày (ml)</Text>
              <TextInput
                style={styles.settingsInput}
                value={String(goal)}
                onChangeText={handleGoalChange}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Ngày ghi nhận</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.settingsInput, styles.dateInput]}
                  value={logDateStr}
                  onChangeText={setLogDateStr}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} style={styles.dateIcon} />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Save Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <GradientButton label="Lưu thay đổi" onPress={handleSave} />
      </View>
    </SafeScreen>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
  },
  waterDropOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(61, 139, 255, 0.3)",
  },
  waterDropInner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.carbs,
  },
  dropIcon: {
    zIndex: 1,
  },
  progressTextContainer: {
    flex: 1,
    gap: 4,
  },
  progressMl: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  unitText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  inputSection: {
    gap: spacing.md,
  },
  sectionLabel: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnPressed: {
    opacity: 0.7,
  },
  valueInputContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  intakeInput: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: "center",
    minWidth: 100,
    padding: 0,
    margin: 0,
  },
  mlLabel: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  presetsSection: {
    gap: spacing.md,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  presetItem: {
    width: "48%",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
    gap: 4,
  },
  presetName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  presetVal: {
    ...typography.bodyStrong,
    color: colors.carbs,
  },
  settingsSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  settingsLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  settingsInput: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    textAlign: "right",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    minWidth: 80,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateInput: {
    minWidth: 110,
    textAlign: "center",
  },
  dateIcon: {
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
