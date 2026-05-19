import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography, radius } from "@/constants";
import { getTodayDateISO } from "@/hooks/utils/date";
import { exerciseService, Exercise } from "@/services/exerciseService";

export default function ExerciseDetailScreen() {
  const { exerciseId, date } = useLocalSearchParams<{ exerciseId: string; date?: string }>();
  const targetDate = date ?? getTodayDateISO();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);
  const [duration, setDuration] = useState("30");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  async function loadExercise() {
    try {
      setLoading(true);
      const data = await exerciseService.getExerciseById(exerciseId);
      setExercise(data);
    } catch (error: any) {
      console.error("Load exercise error:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin bài tập");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  const durationNum = parseFloat(duration) || 0;
  const met = exercise?.metValue || 0;
  const DEFAULT_WEIGHT_KG = 65;
  let caloriesBurned = met * DEFAULT_WEIGHT_KG * (durationNum / 60);
  
  if (intensity === 1) caloriesBurned *= 0.8;
  if (intensity === 3) caloriesBurned *= 1.2;
  caloriesBurned = Math.round(caloriesBurned);

  async function handleSave() {
    if (!exercise) return;
    
    if (durationNum <= 0 || durationNum > 600) {
      Alert.alert("Lỗi", "Thời gian phải từ 1 đến 600 phút.");
      return;
    }

    setIsSaving(true);
    try {
      await exerciseService.createLog({
        exerciseId: exercise.id,
        logDate: targetDate,
        durationMinutes: durationNum,
        intensity,
        notes: notes.trim() || undefined,
      });
      
      Alert.alert("Thành công", "Đã ghi nhật ký tập luyện!", [
        { text: "OK", onPress: () => router.replace("/exercise-diary") }
      ]);
    } catch (error: any) {
      console.error("Save exercise error:", error);
      Alert.alert("Thất bại", error?.message || "Không thể ghi hoạt động");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) return null;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{exercise.nameVi}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Bài tập</Text>
          <Text style={styles.infoValue}>{exercise.nameVi}</Text>
          <Text style={styles.infoSubtext}>{exercise.nameEn}</Text>
          {exercise.description && (
            <Text style={styles.infoDescription}>{exercise.description}</Text>
          )}
        </View>

        <Text style={styles.sectionLabel}>Cường độ</Text>
        <View style={styles.intensityRow}>
          {[
            { value: 1 as const, label: "Nhẹ", icon: "walk-outline" },
            { value: 2 as const, label: "Trung bình", icon: "fitness-outline" },
            { value: 3 as const, label: "Nặng", icon: "barbell-outline" },
          ].map((level) => (
            <Pressable
              key={level.value}
              onPress={() => setIntensity(level.value)}
              style={[
                styles.intensityBtn,
                intensity === level.value && styles.intensityBtnActive,
              ]}
            >
              <Ionicons
                color={intensity === level.value ? colors.primary : colors.textMuted}
                name={level.icon as any}
                size={18}
              />
              <Text
                style={[
                  styles.intensityText,
                  intensity === level.value && { color: colors.primary },
                ]}
              >
                {level.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Thời gian (phút)</Text>
        <View style={styles.durationRow}>
          <Pressable
            onPress={() => setDuration((d) => String(Math.max(1, parseFloat(d) - 5)))}
            style={styles.stepBtn}
          >
            <Ionicons color={colors.textPrimary} name="remove" size={22} />
          </Pressable>
          <TextInput
            keyboardType="numeric"
            onChangeText={setDuration}
            style={styles.durationInput}
            value={duration}
          />
          <Pressable
            onPress={() => setDuration((d) => String(parseFloat(d) + 5))}
            style={styles.stepBtn}
          >
            <Ionicons color={colors.textPrimary} name="add" size={22} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Ghi chú (tùy chọn)</Text>
        <TextInput
          multiline
          numberOfLines={3}
          onChangeText={setNotes}
          placeholder="Ví dụ: Chạy ở công viên, cảm thấy tốt..."
          placeholderTextColor={colors.textMuted}
          style={styles.notesInput}
          value={notes}
        />

        {durationNum > 0 && (
          <View style={styles.burnPreview}>
            <Ionicons color={colors.success} name="flame" size={24} />
            <View>
              <Text style={styles.burnKcal}>{caloriesBurned} kcal</Text>
              <Text style={styles.burnNote}>
                {durationNum} phút · {intensity === 1 ? "Nhẹ" : intensity === 3 ? "Nặng" : "Trung bình"}
              </Text>
            </View>
          </View>
        )}

        <Pressable
          disabled={isSaving}
          onPress={handleSave}
          style={[styles.saveBtn, isSaving && { opacity: 0.5 }]}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons color="#fff" name="checkmark-circle-outline" size={20} />
              <Text style={styles.saveBtnText}>Ghi hoạt động</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { 
    ...typography.h3, 
    color: colors.textPrimary,
    fontSize: 18,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
  },
  infoValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 24,
  },
  infoSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.sm,
  },
  intensityRow: { flexDirection: "row", gap: spacing.sm },
  intensityBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  intensityBtnActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(165,108,255,0.1)",
  },
  intensityText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  durationInput: {
    width: 80,
    height: 56,
    textAlign: "center",
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 28,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
  },
  notesInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: "top",
  },
  burnPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(92,214,122,0.1)",
    borderRadius: radius.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(92,214,122,0.25)",
    marginTop: spacing.sm,
  },
  burnKcal: {
    ...typography.h3,
    color: colors.success,
    fontSize: 24,
  },
  burnNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.success,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  saveBtnText: { ...typography.bodyStrong, color: "#fff" },
});
