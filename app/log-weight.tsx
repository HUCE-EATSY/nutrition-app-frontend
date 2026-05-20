import { useState } from "react";
import { StyleSheet, Text, View, Pressable, Platform, Alert, KeyboardAvoidingView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Conditionally require DateTimePicker cho mobile
let DateTimePicker: any = null;
if (Platform.OS !== "web") {
  try {
    DateTimePicker = require("@react-native-community/datetimepicker").default;
  } catch (e) {}
}

import { colors, spacing, typography, radius } from "@/constants";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { weightLogService } from "@/services/logService";
import { useGetUserInfo } from "@/hooks/queries/useUserQueries";
import { useQueryClient } from "@tanstack/react-query";

export default function LogWeightScreen() {
  const insets = useSafeAreaInsets();
  const { data: userGoalInfo } = useGetUserInfo();
  
  // Cân nặng mặc định từ profile
  const defaultWeight = userGoalInfo?.profile?.weightKg ?? 53.6;
  const goalWeight = userGoalInfo?.activeGoal?.goalWeightKg ?? 60;

  const [weight, setWeight] = useState(defaultWeight);
  const [logDate, setLogDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Format ngày hiển thị: 29 / 04 / 2026
  const dateString = `${logDate.getDate().toString().padStart(2, '0')} / ${(logDate.getMonth() + 1).toString().padStart(2, '0')} / ${logDate.getFullYear()}`;

  const handleUpload = () => {
    Alert.alert("Chưa hỗ trợ", "Tính năng thêm ảnh chụp sẽ được ra mắt trong phiên bản tới.");
  };

  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const log_date = logDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // 1. Kiểm tra xem ngày hôm đó đã được ghi nhận cân nặng chưa
      const existingLogs = await weightLogService.getWeightLogs(log_date, log_date);
      
      if (existingLogs && existingLogs.length > 0) {
        // 2. Nếu đã tồn tại, tự động gọi PUT để cập nhật thay vì POST để tránh lỗi 409 Conflict
        const existingLog = existingLogs[0];
        await weightLogService.updateWeightLog(existingLog.id, { weight_kg: weight });
        
        // Invalidate cache của react-query để UI tự động tải lại dữ liệu mới nhất
        queryClient.invalidateQueries({ queryKey: ["user"] });

        const msg = `Cân nặng ngày ${dateString} đã được cập nhật thành ${weight} kg.`;
        if (Platform.OS === 'web') {
          alert(msg);
          router.back();
        } else {
          Alert.alert("Đã cập nhật", msg, [{ text: "OK", onPress: () => router.back() }]);
        }
      } else {
        // 3. Nếu chưa tồn tại, gọi POST để tạo mới
        await weightLogService.createWeightLog({ weight_kg: weight, log_date });
        
        // Invalidate cache của react-query để UI tự động tải lại dữ liệu mới nhất
        queryClient.invalidateQueries({ queryKey: ["user"] });

        const msg = `Cân nặng ${weight} kg ngày ${dateString} đã được ghi lại.`;
        if (Platform.OS === 'web') {
          alert(msg);
          router.back();
        } else {
          Alert.alert("Đã lưu", msg, [{ text: "OK", onPress: () => router.back() }]);
        }
      }
    } catch (err: any) {
      console.error("Lỗi khi lưu cân nặng:", err);
      if (err.response?.status === 409) {
        Alert.alert("Lỗi", "Bạn đã ghi nhận cân nặng cho ngày này rồi.");
      } else {
        Alert.alert("Lỗi", "Không thể lưu cân nặng. Vui lòng thử lại.");
      }
    } finally {
      setIsSaving(false);
    }
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
            <Text style={styles.inputGoal}>Mục tiêu: {goalWeight}Kg</Text>
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
          <Pressable style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateLabel}>Ngày cân</Text>
            <View style={styles.dateRight}>
              <Text style={styles.dateValue}>{dateString}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textPrimary} />
            </View>
          </Pressable>

          {showDatePicker && Platform.OS !== 'web' && DateTimePicker && (
            <DateTimePicker
              value={logDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(_event: any, selectedDate: any) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setLogDate(selectedDate);
              }}
            />
          )}

          {/* Web fallback for date picker */}
          {showDatePicker && Platform.OS === 'web' && (() => {
            const Input = 'input' as any;
            return (
              <Input
                type="date"
                value={logDate.toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e: any) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    setLogDate(newDate);
                  }
                  setShowDatePicker(false);
                }}
                style={{
                  marginTop: spacing.sm,
                  padding: spacing.sm,
                  borderRadius: radius.sm,
                  border: `1px solid ${colors.borderSoft}`,
                  fontFamily: "PlusJakartaSans-Regular",
                  width: '100%',
                }}
              />
            );
          })()}

        </View>

      </KeyboardAvoidingView>

      {/* Footer Action */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Pressable style={[styles.saveBtn, isSaving && { opacity: 0.6 }]} onPress={handleSave} disabled={isSaving}>
          {isSaving
            ? <ActivityIndicator color={colors.textPrimary} size="small" />
            : <Text style={styles.saveBtnText}>Lưu cân nặng</Text>
          }
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
