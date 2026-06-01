import React, { useState, useEffect, useMemo, useRef } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { getTodayDateISO } from "@/utils/date";
import { useWaterStore } from "@/store/waterStore";
import { useDiaryStore } from "@/store/diaryStore";
import { useAuthStore } from "@/store/authStore";
import { GradientButton } from "@/components/buttons/GradientButton";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { WaterPresetsGrid } from "@/components/water/WaterPresetsGrid";

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
  const { setWater, setWaterGoal } = useWaterStore();
  
  // Set date state based on diary selectedDate or today
  const [logDateStr, setLogDateStr] = useState(selectedDate || getTodayDateISO());
  
  // Get initial values from the store
  const [intake, setIntake] = useState(0);
  const [goal, setGoal] = useState(userWater.waterGoal);
  
  // When date or store changes, update locally
  useEffect(() => {
    setIntake(userWater.waterLogs[logDateStr] || 0);
  }, [logDateStr, userWater.waterLogs]);

  const scrollViewRef = useRef<ScrollView>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date(logDateStr);
    setShowDatePicker(Platform.OS === "ios");
    setLogDateStr(currentDate.toISOString().split('T')[0]);
  };

  useEffect(() => {
    setGoal(userWater.waterGoal);
  }, [userWater.waterGoal]);

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
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={15}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Nhật ký nước uống</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
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
          <QuantityStepper
            label="Lượng nước đã uống"
            value={intake}
            unit="ml"
            step={250}
            onChange={handleTextChange}
            onAdd={handleQuickAdd}
            onSubtract={handleQuickSubtract}
          />

          {/* Presets Grid */}
          <WaterPresetsGrid onAdd={handleQuickAdd} />

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
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 250);
                }}
              />
            </View>

            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Ngày ghi nhận</Text>
              <Pressable style={styles.dateInputContainer} onPress={() => setShowDatePicker(true)}>
                <Text style={[styles.settingsInput, styles.dateInput]}>
                  {logDateStr}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} style={styles.dateIcon} />
              </Pressable>
            </View>
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={new Date(logDateStr)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </ScrollView>

        {/* Footer Save Button - Moved inside KeyboardAvoidingView */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <GradientButton label="Lưu thay đổi" onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
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
