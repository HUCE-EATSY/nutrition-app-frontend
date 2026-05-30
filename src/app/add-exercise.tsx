import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useMemo } from "react";
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

import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { getTodayDateISO } from "@/utils/date";
import { useDiaryStore } from "@/store/diaryStore";
import {
  ACTIVITIES,
  ActivityId,
  ActivityIntensity,
} from "@/constants/activities";
import { getMetValue } from "@/utils/activities";
import { useTranslation } from "@/constants/i18n";
import { useGetUserInfo } from "@/hooks/queries/useUserQueries";

// Cân nặng mặc định nếu chưa có profile (kg)
const DEFAULT_WEIGHT_KG = 65;

export default function AddExerciseScreen() {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { date, exerciseName } = useLocalSearchParams<{ date: string; exerciseName?: string }>();
  const targetDate = date ?? getTodayDateISO();
  const currentHour = new Date().getHours();

  const { addExercise } = useDiaryStore();
  const { data: userInfo } = useGetUserInfo();
  const userWeight = userInfo?.profile?.weightKg ?? DEFAULT_WEIGHT_KG;

  // Pre-select activity based on exerciseName query param
  const initialSelectedId = useMemo(() => {
    if (!exerciseName) return null;
    const nameLower = exerciseName.toLowerCase();
    if (nameLower.includes("run")) return "running" as const;
    if (nameLower.includes("cycle") || nameLower.includes("bike")) return "cycling" as const;
    if (nameLower.includes("badminton")) return "badminton" as const;
    if (nameLower.includes("pickle")) return "pickleball" as const;
    if (nameLower.includes("yoga")) return "yoga" as const;
    return "other" as const;
  }, [exerciseName]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<ActivityId | null>(initialSelectedId);
  const [intensity, setIntensity] = useState<ActivityIntensity>("amateur");
  const [duration, setDuration] = useState("30");

  // ── Tính calo đốt: MET × weight × hours ──────────────────────────────────
  const durationNum = parseFloat(duration) || 0;
  const met = selectedId ? getMetValue(selectedId, intensity) : 0;
  const caloriesBurned = Math.round(met * userWeight * (durationNum / 60));

  const selectedActivity = ACTIVITIES.find((a) => a.id === selectedId);

  // ── Lưu bài tập ──────────────────────────────────────────────────────────
  async function handleSave() {
    if (!selectedId || !selectedActivity) {
      Alert.alert(t.common.error, t.exercise.selectActivityError);
      return;
    }
    if (durationNum <= 0 || durationNum > 600) {
      Alert.alert(t.common.error, t.exercise.durationRangeError);
      return;
    }

    setIsSaving(true);
    try {
      await addExercise({
        activityId: selectedId,
        activityLabel: `${t.activities[selectedActivity.id]}${intensity === "professional" ? t.exercise.proSuffix : ""}`,
        dateISO: targetDate,
        hour: currentHour,
        durationMinutes: durationNum,
        caloriesBurned,
      });
      router.back();
    } catch {
      Alert.alert(t.common.error, t.exercise.saveActivityError);
    } finally {
      setIsSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.exercise.logActivity}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Chọn hoạt động ── */}
        <Text style={styles.sectionLabel}>{t.exercise.activityType}</Text>
        <View style={styles.activityGrid}>
          {ACTIVITIES.map((activity) => {
            const isActive = activity.id === selectedId;
            return (
              <Pressable
                key={activity.id}
                onPress={() => setSelectedId(activity.id)}
                style={[styles.activityCard, isActive && styles.activityCardActive]}
              >
                <MaterialCommunityIcons
                  color={isActive ? colors.primary : colors.textMuted}
                  name={activity.icon}
                  size={28}
                />
                <Text style={[styles.activityLabel, isActive && styles.activityLabelActive]}>
                  {t.activities[activity.id] || activity.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Cường độ ── */}
        <Text style={styles.sectionLabel}>{t.exercise.intensityText}</Text>
        <View style={styles.intensityRow}>
          {(["amateur", "professional"] as ActivityIntensity[]).map((level) => (
            <Pressable
              key={level}
              onPress={() => setIntensity(level)}
              style={[
                styles.intensityBtn,
                intensity === level && styles.intensityBtnActive,
              ]}
            >
              <Ionicons
                color={intensity === level ? colors.primary : colors.textMuted}
                name={level === "amateur" ? "walk-outline" : "trending-up-outline"}
                size={18}
              />
              <Text
                style={[
                  styles.intensityText,
                  intensity === level && { color: colors.primary },
                ]}
              >
                {level === "amateur" ? t.exercise.normal : t.exercise.pro}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Thời gian ── */}
        <Text style={styles.sectionLabel}>{t.exercise.timeMinutes}</Text>
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

        {/* ── Preview calo đốt ── */}
        {selectedId && durationNum > 0 && (
          <View style={styles.burnPreview}>
            <Ionicons color={colors.success} name="flame" size={24} />
            <View>
              <Text style={styles.burnKcal}>{caloriesBurned} kcal</Text>
              <Text style={styles.burnNote}>
                {t.exercise.burnSuffix(t.activities[selectedId], durationNum, intensity === "professional")}
              </Text>
            </View>
          </View>
        )}

        {/* ── Nút lưu ── */}
        <Pressable
          disabled={isSaving || !selectedId}
          onPress={handleSave}
          style={[
            styles.saveBtn,
            (!selectedId || isSaving) && { opacity: 0.5 },
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons color="#fff" name="checkmark-circle-outline" size={20} />
              <Text style={styles.saveBtnText}>{t.exercise.logActivity}</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.bodyStrong, color: colors.textPrimary },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.sm,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  activityCard: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  activityCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(165,108,255,0.1)",
  },
  activityLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  activityLabelActive: { color: colors.primary },
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
