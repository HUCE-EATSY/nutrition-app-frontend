import { useState } from "react";
import { StyleSheet, Text, View, Pressable, Platform, Alert, KeyboardAvoidingView } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing, typography, radius } from "@/constants";
import { SafeScreen } from "@/components/layout/SafeScreen";

export default function LogWeightScreen() {
  const insets = useSafeAreaInsets();
  
  // Mặc định lấy từ state toàn cục, ở đây tạm mock giá trị 53.6
  const [weight, setWeight] = useState(53.6);
  
  // Lấy ngày hiện tại format dạng: 29 / 04 / 2026
  const today = new Date();
  const dateString = `${today.getDate().toString().padStart(2, '0')} / ${(today.getMonth() + 1).toString().padStart(2, '0')} / ${today.getFullYear()}`;

  const handleUpload = () => {
    Alert.alert("Chưa hỗ trợ", "Tính năng thêm ảnh chụp sẽ được ra mắt trong phiên bản tới.");
  };

  const handleSave = () => {
    // Gọi API hoặc update Global Store ở đây
    router.back();
  };

  const incrementWeight = () => setWeight((prev) => parseFloat((prev + 0.1).toFixed(1)));
  const decrementWeight = () => setWeight((prev) => parseFloat((prev - 0.1).toFixed(1)));

  return (
    <SafeScreen contentContainerStyle={styles.container}>
      <KeyboardAvoidingView 
        style={styles.flex1} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Ghi lại cân nặng</Text>
          <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={15}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Media Upload Section */}
        <View style={styles.mediaSection}>
          <Pressable style={styles.uploadBox} onPress={handleUpload}>
            <MaterialCommunityIcons name="camera-plus-outline" size={48} color={colors.textMuted} />
          </Pressable>
          <Pressable onPress={handleUpload}>
            <Text style={styles.uploadText}>+ Thêm ảnh chụp</Text>
          </Pressable>
        </View>

        {/* Main Input Section (Weight Stepper) */}
        <View style={styles.inputSection}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Cân nặng hiện tại</Text>
            <Text style={styles.inputGoal}>Mục tiêu: 60Kg</Text>
          </View>

          <View style={styles.stepperContainer}>
            {/* Nút Trừ */}
            <Pressable 
              style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]} 
              onPress={decrementWeight}
            >
              <MaterialCommunityIcons name="minus" size={32} color={colors.textPrimary} />
            </Pressable>

            {/* Giá trị */}
            <Text style={styles.weightValue}>{weight} Kg</Text>

            {/* Nút Cộng */}
            <Pressable 
              style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]} 
              onPress={incrementWeight}
            >
              <MaterialCommunityIcons name="plus" size={32} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Form Fields (Date Picker) */}
        <View style={styles.formSection}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Ngày cân</Text>
            <View style={styles.dateRight}>
              <Text style={styles.dateValue}>{dateString}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textPrimary} />
            </View>
          </View>
        </View>

      </KeyboardAvoidingView>

      {/* Footer Action */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Lưu cân nặng</Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
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
  },
  headerSpacer: {
    width: 28, // Same width as the close button to center the title
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeBtn: {
    alignItems: "flex-end",
  },
  mediaSection: {
    alignItems: "center",
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  uploadBox: {
    width: 120,
    height: 120,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  inputSection: {
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  inputLabel: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  inputGoal: {
    ...typography.caption,
    color: colors.textMuted,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepperBtn: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnPressed: {
    opacity: 0.7,
  },
  weightValue: {
    ...typography.display,
    color: colors.textPrimary,
  },
  formSection: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  dateLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  dateRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dateValue: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
});
