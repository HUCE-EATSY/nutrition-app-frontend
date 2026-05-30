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
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';

import { colors, spacing, typography, radius } from "@/constants";
import { getTodayDateISO } from "@/hooks/utils/date";
import { exerciseService, Exercise } from "@/services/exerciseService";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/hooks/store/authStore";

export default function ExerciseDetailScreen() {
  const { exerciseId, date } = useLocalSearchParams<{ exerciseId: string; date?: string }>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);
  const [duration, setDuration] = useState("30");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [userWeight, setUserWeight] = useState(65); // Default 65kg
  const [selectedDate, setSelectedDate] = useState(
    // Fix timezone bug: thêm 'T00:00:00' để parse đúng local time, tránh lệch ngày
    new Date((date ?? getTodayDateISO()) + 'T00:00:00')
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const targetDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    console.log("Auth status:", { isAuthenticated, hasToken: !!accessToken });
    loadExercise();
    loadUserWeight();
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

  async function loadUserWeight() {
    try {
      const userInfo = await userService.getUserInfo();
      const weight = userInfo?.profile?.weightKg;
      if (weight && weight > 0) {
        setUserWeight(weight);
        console.log("User weight loaded:", weight);
      }
    } catch (error) {
      console.error("Failed to load user weight:", error);
      // Keep default 65kg if failed
    }
  }

  const durationNum = parseInt(duration, 10) || 0;
  const met = exercise?.metValue || 0;
  let caloriesBurned = met * userWeight * (durationNum / 60);
  
  if (intensity === 1) caloriesBurned *= 0.8;
  if (intensity === 3) caloriesBurned *= 1.2;
  caloriesBurned = Math.round(caloriesBurned);

  async function handleSave() {
    if (!exercise) return;
    
    // Check authentication first
    if (!isAuthenticated) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để lưu nhật ký tập luyện",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => router.push("/(public)/login") }
        ]
      );
      return;
    }
    
    if (durationNum <= 0 || durationNum > 600) {
      Alert.alert("Lỗi", "Thời gian phải từ 1 đến 600 phút.");
      return;
    }

    setIsSaving(true);
    try {
      console.log("Creating exercise log:", {
        exerciseId: exercise.id,
        logDate: targetDate,
        durationMinutes: durationNum,
        intensity,
        notes: notes.trim() || undefined,
      });

      const result = await exerciseService.createLog({
        exerciseId: exercise.id,
        logDate: targetDate,
        durationMinutes: durationNum,
        intensity,
        notes: notes.trim() || undefined,
      });
      
      console.log("Exercise log created successfully:", result);
      
      Alert.alert("Thành công", "Đã ghi hoạt động thành công", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error("Save exercise error:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.title
        || error.message 
        || "Không thể ghi hoạt động";
      
      Alert.alert("Thất bại", errorMessage);
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
          {exercise.iconUrl && (
            <Image 
              source={{ uri: exercise.iconUrl }} 
              style={styles.exerciseImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.infoLabel}>Bài tập</Text>
          <Text style={styles.infoValue}>{exercise.nameVi}</Text>
          <Text style={styles.infoSubtext}>{exercise.nameEn}</Text>
          {exercise.description && (
            <Text style={styles.infoDescription}>{exercise.description}</Text>
          )}
        </View>

        <Text style={styles.sectionLabel}>Ngày tập</Text>
        <Pressable 
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.dateButtonText}>
            {new Date(targetDate).toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) {
                setSelectedDate(date);
              }
            }}
            maximumDate={new Date()}
          />
        )}

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
  exerciseImage: {
    width: '100%',
    height: 160,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.bgBase,
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  dateButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
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
