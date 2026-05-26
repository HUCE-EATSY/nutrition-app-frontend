import { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, View, Pressable, Platform, Alert, KeyboardAvoidingView, ActivityIndicator, TextInput } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";



import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { saveWeightLog } from "@/services/weightLogService";
import { getTodayDateISO } from "@/utils/date";
import { useWeightStore } from "@/store/statsStore";
import { useWeightStats } from "@/hooks/stats/useWeightStats";
import { useSettingsStore } from "@/store/settingsStore";
import { t } from "@/constants/i18n";

export default function LogWeightScreen() {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { currentWeight, resolvedTarget } = useWeightStats();
  const unit = useSettingsStore((state) => state.unit);

  const defaultWeight = unit === "lbs" ? 130 : 60;

  // Khởi tạo cân nặng bằng cân nặng gần nhất hoặc mặc định dựa trên đơn vị
  const [weight, setWeight] = useState(currentWeight || defaultWeight);
  const [isSaving, setIsSaving] = useState(false);

  // Cho phép tự điền ngày để test (mặc định là ngày hôm nay dạng YYYY-MM-DD)
  const [logDateStr, setLogDateStr] = useState(getTodayDateISO());

  // Set initial weight when currentWeight is fetched
  useEffect(() => {
    if (currentWeight > 0) {
      setWeight(currentWeight);
    }
  }, [currentWeight]);

  const handleUpload = () => {
    Alert.alert(t.stats.notSupported, t.stats.photoUploadHint);
  };

  const handleSave = async () => {
    if (isSaving) return;

    // Kiểm tra định dạng ngày nhập YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(logDateStr)) {
      Alert.alert(t.stats.formatError, t.stats.invalidDateMsg);
      return;
    }

    setIsSaving(true);
    try {
      const weightToSend = unit === "lbs" ? parseFloat((weight / 2.20462).toFixed(2)) : weight;
      await saveWeightLog(weightToSend, logDateStr);

      // Invalidate react-query cache for user profile (Account & Physical Profile)
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Reload weight store so home page chart and weight value updates instantly
      const { period, fetchWeightData } = useWeightStore.getState();
      await fetchWeightData(period);

      router.back();
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || t.stats.logWeightError);
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
          <Text style={styles.headerTitle}>{t.stats.logWeightTitle}</Text>
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
            <Text style={styles.uploadText}>{t.stats.addPhoto}</Text>
          </Pressable>
        </View>

        {/* Main Input Section (Weight Stepper) */}
        <View style={styles.inputSection}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>{t.physicalProfile.currentWeight}</Text>
            <Text style={styles.inputGoal}>
              {t.stats.goal}: {resolvedTarget ? `${resolvedTarget} ${unit === "lbs" ? "Lbs" : "Kg"}` : t.stats.notSet}
            </Text>
          </View>

          <View style={styles.stepperContainer}>
            {/* Nút Trừ */}
            <Pressable
              style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
              onPress={decrementWeight}
              disabled={isSaving}
            >
              <MaterialCommunityIcons name="minus" size={32} color={colors.textPrimary} />
            </Pressable>

            {/* Giá trị */}
            <Text style={styles.weightValue}>{weight} {unit === "lbs" ? "Lbs" : "Kg"}</Text>

            {/* Nút Cộng */}
            <Pressable
              style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
              onPress={incrementWeight}
              disabled={isSaving}
            >
              <MaterialCommunityIcons name="plus" size={32} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Form Fields (Date Picker) */}
        <View style={styles.formSection}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>{t.stats.logDate}</Text>
            <View style={styles.dateRight}>
              <TextInput
                style={styles.dateInput}
                value={logDateStr}
                onChangeText={setLogDateStr}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <Ionicons name="calendar-outline" size={20} color={colors.textPrimary} />
            </View>
          </View>
        </View>

      </KeyboardAvoidingView>


      {/* Footer Action */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Pressable
          style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.textPrimary} size="small" />
          ) : (
            <Text style={styles.saveBtnText}>{t.stats.saveWeight}</Text>
          )}
        </Pressable>
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
  dateInput: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    textAlign: "right",
    minWidth: 110,
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
