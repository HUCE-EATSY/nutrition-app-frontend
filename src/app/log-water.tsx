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
import { useAuthStore } from "@/store/authStore";
import { GradientButton } from "@/components/buttons/GradientButton";

const DEFAULT_WATER_DATA = {
  waterLogs: {} as Record<string, number>,
  waterGoal: 2000,
  defaultStep: 250,
};

const DEFAULT_WATER_DATA = {
  waterLogs: {} as Record<string, number>,
  waterGoal: 2000,
  defaultStep: 250,
};

export default function LogWaterScreen() {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  
  const selectedDate = useDiaryStore((state) => state.selectedDate);
  const userId = useAuthStore((state) => state.userInfo?.id) || "guest";
  
  const userWater = useWaterStore((state) => state.userWaterData[userId] || DEFAULT_WATER_DATA);
<<<<<<< HEAD

  const { setWater, setWaterGoal, setDefaultStep: setStoreDefaultStep } = useWaterStore();
=======
  const { setWater, setWaterGoal } = useWaterStore();
>>>>>>> feature/update-frontend
  
  // Set date state based on diary selectedDate or today
  const [logDateStr] = useState(selectedDate || getTodayDateISO());
  
  // Get initial values from the store
  const [intake, setIntake] = useState(0);
  const [goal, setGoal] = useState(userWater.waterGoal);
<<<<<<< HEAD
  const [customAmount, setCustomAmount] = useState("");
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleCustomAmountFocus = () => {
    setIsFocused(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 160, animated: true });
    }, 150);
  };

  const handleDefaultStepFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 80, animated: true });
    }, 150);
  };

  const [defaultStep, setDefaultStep] = useState(userWater.defaultStep ?? 250);

  const handleDefaultStepChange = (text: string) => {
    const val = parseInt(text.replace(/[^0-9]/g, ""), 10);
    setDefaultStep(isNaN(val) ? 0 : val);
  };
=======
>>>>>>> feature/update-frontend
  
  // When date or store changes, update locally
  useEffect(() => {
    setIntake(userWater.waterLogs[logDateStr] || 0);
  }, [logDateStr, userWater.waterLogs]);
<<<<<<< HEAD
=======

  const scrollViewRef = useRef<ScrollView>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date(logDateStr);
    setShowDatePicker(Platform.OS === "ios");
    setLogDateStr(currentDate.toISOString().split('T')[0]);
  };
>>>>>>> feature/update-frontend

  useEffect(() => {
    setGoal(userWater.waterGoal);
  }, [userWater.waterGoal]);
<<<<<<< HEAD

  useEffect(() => {
    setDefaultStep(userWater.defaultStep ?? 250);
  }, [userWater.defaultStep]);
=======
>>>>>>> feature/update-frontend

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
    setWater(userId, logDateStr, intake);
    setWaterGoal(userId, goal);
<<<<<<< HEAD
    setStoreDefaultStep(userId, defaultStep);
=======
>>>>>>> feature/update-frontend

    // Alert success or go back
    router.back();
  };

  const handleQuickAdd = (amount: number) => {
    setIntake((prev) => prev + amount);
  };

  const handleQuickSubtract = (amount: number) => {
    setIntake((prev) => Math.max(0, prev - amount));
  };

  const handleCustomAdd = () => {
    const val = parseInt(customAmount.replace(/[^0-9]/g, ""), 10);
    if (isNaN(val) || val <= 0) {
      Alert.alert("Lỗi nhập liệu", "Vui lòng nhập lượng nước hợp lệ.");
      return;
    }
    setIntake((prev) => prev + val);
    setCustomAmount("");
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

        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Wave/Droplet Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.waterDropOuter}>
              <View style={[styles.waterDropInner, { height: `${Math.min(100, progressPercentage)}%` }]} />
              <MaterialCommunityIcons
                name={progressPercentage >= 100 ? "trophy-outline" : "water"}
                size={36}
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

          {/* Daily Goal row (Moved from bottom to top) */}
          <View style={styles.settingsSection}>
            <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.settingsLabel}>Mục tiêu ngày</Text>
              <View style={styles.goalInputContainer}>
                <TextInput
                  style={styles.settingsInput}
                  value={String(goal)}
                  onChangeText={handleGoalChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <Text style={styles.goalInputMlLabel}>ml</Text>
              </View>
            </View>
          </View>

          {/* Stepper controls */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>Lượng nước đã uống</Text>
            
            <View style={styles.stepperCard}>
              {/* Main Stepper Row */}
              <View style={styles.mainStepperRow}>
                <Pressable
                  style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                  onPress={() => handleQuickSubtract(defaultStep)}
                >
                  <MaterialCommunityIcons name="minus" size={20} color={colors.textPrimary} />
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
                  onPress={() => handleQuickAdd(defaultStep)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color={colors.textPrimary} />
                </Pressable>
              </View>

              {/* Minimalist Default Step Capsule */}
              <View style={styles.minimalistDefaultStepRow}>
                <View style={styles.minimalistControls}>
                  <View style={styles.miniInputContainer}>
                    <Text style={styles.minimalistLabel}>Mặc định: </Text>
                    <TextInput
                      style={styles.miniInput}
                      value={String(defaultStep)}
                      onChangeText={handleDefaultStepChange}
                      keyboardType="numeric"
                      maxLength={4}
                      onFocus={handleDefaultStepFocus}
                    />
                    <Text style={styles.miniUnit}>ml</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Custom Add Section */}
          <View style={styles.customAddSection}>
            <Text style={styles.sectionLabel}>Lượng nước vừa uống tùy chỉnh</Text>
            <View style={styles.customAddContainer}>
              <View style={[styles.customInputContainer, isFocused && styles.customInputContainerFocused]}>
                <TextInput
                  style={styles.customInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  placeholder="Số ml..."
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={5}
                  onFocus={handleCustomAmountFocus}
                  onBlur={() => setIsFocused(false)}
                />
                <Text style={styles.customInputMlLabel}>ml</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.customAddBtn,
                  { backgroundColor: colors.carbs },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={handleCustomAdd}
              >
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.customAddBtnText}>Thêm</Text>
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
    padding: spacing.md,
    gap: 12,
    paddingBottom: 30, // Reduced bottom padding since Y offsets are much smaller
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  waterDropOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
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
    ...typography.h3,
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
  stepperCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 1,
    gap: 1,
  },
  mainStepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepperBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    ...typography.h2,
    lineHeight: undefined,
    color: colors.textPrimary,
    textAlign: "center",
    minWidth: 80,
    padding: 0,
    margin: 0,
    textAlignVertical: "center",
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
    padding: 10,
    borderRadius: radius.sm,
    alignItems: "center",
    gap: 2,
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
  customAddSection: {
    gap: spacing.md,
  },
  customAddContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  customInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  customInputContainerFocused: {
    borderColor: colors.carbs,
    borderWidth: 1.5,
  },
  customInput: {
    flex: 1,
    height: "100%",
    ...typography.bodyStrong,
    lineHeight: undefined,
    color: colors.textPrimary,
    paddingVertical: 0,
    margin: 0,
    textAlignVertical: "center",
  },
  customInputMlLabel: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  customAddBtn: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  customAddBtnText: {
    ...typography.bodyStrong,
    color: "#FFF",
  },
  goalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalInputMlLabel: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
  minimalistDefaultStepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  minimalistLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  minimalistControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  miniInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniInput: {
    ...typography.bodyStrong,
    color: colors.carbs,
    textAlign: "center",

    minWidth: 40,

    padding: 0,
    margin: 0,

    height: 24,
    lineHeight: 24,

    textAlignVertical: "center",
    includeFontPadding: false,
  },
  miniUnit: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 2,
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
    paddingVertical: spacing.sm,
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

    minWidth: 80,
    height: 44,

    paddingHorizontal: 12,
    paddingVertical: 0,

    textAlign: "center",
    textAlignVertical: "center",

    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,

    includeFontPadding: false,
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
