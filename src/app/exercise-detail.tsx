import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { getTodayDateISO } from "@/utils/date";
import { exerciseService, Exercise } from "@/services/exerciseService";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/i18n";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function ExerciseDetailScreen() {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const language = useSettingsStore((state) => state.language);
  const userWeight = useOnboardingStore((state) => state.draft.currentWeightKg) || 65;
  const { exerciseId, date } = useLocalSearchParams<{ exerciseId: string; date?: string }>();
  const targetDate = date ?? getTodayDateISO();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);
  const [duration, setDuration] = useState("30");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadExercise() {
      try {
        setLoading(true);
        const data = await exerciseService.getExerciseById(exerciseId);
        setExercise(data);
      } catch (error: any) {
        console.error("Load exercise error:", error);
        Alert.alert(t.common.error, t.exercise.loadDetailError);
        router.back();
      } finally {
        setLoading(false);
      }
    }
    loadExercise();
  }, [exerciseId, t]);

  const durationNum = parseFloat(duration) || 0;
  const met = exercise?.metValue || 0;
  let caloriesBurned = met * userWeight * (durationNum / 60);
  
  if (intensity === 1) caloriesBurned *= 0.8;
  if (intensity === 3) caloriesBurned *= 1.2;
  caloriesBurned = Math.round(caloriesBurned);

  async function handleSave() {
    if (!exercise) return;
    
    if (durationNum <= 0 || durationNum > 600) {
      Alert.alert(t.common.error, t.exercise.durationRangeError);
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
      
      if (Platform.OS === 'web') {
        router.replace("/(tabs)/home");
      } else {
        Alert.alert(t.common.success, t.exercise.saveActivitySuccess, [
          { text: "OK", onPress: () => router.replace("/(tabs)/home") }
        ]);
      }
    } catch (error: any) {
      console.error("Save exercise error:", error);
      if (Platform.OS === 'web') {
        alert(error?.message || t.exercise.saveActivityError);
      } else {
        Alert.alert(t.common.error, error?.message || t.exercise.saveActivityError);
      }
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
        <Text style={styles.headerTitle}>{language === "en" ? exercise.nameEn : exercise.nameVi}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            {exercise.iconUrl ? (
              <Image source={{ uri: exercise.iconUrl }} style={styles.exerciseDetailImage} />
            ) : null}
            <View style={styles.infoCardTextContainer}>
              <Text style={styles.infoLabel}>{t.exercise.activityType}</Text>
              <Text style={styles.infoValue}>{language === "en" ? exercise.nameEn : exercise.nameVi}</Text>
              <Text style={styles.infoSubtext}>{language === "en" ? exercise.nameVi : exercise.nameEn}</Text>
            </View>
          </View>
          {exercise.description && (
            <Text style={styles.infoDescription}>{exercise.description}</Text>
          )}
        </View>

        <Text style={styles.sectionLabel}>{t.exercise.intensityLabel}</Text>
        <View style={styles.intensityRow}>
          {[
            { value: 1 as const, label: t.exercise.intensityLevels.light, icon: "walk-outline" },
            { value: 2 as const, label: t.exercise.intensityLevels.moderate, icon: "fitness-outline" },
            { value: 3 as const, label: t.exercise.intensityLevels.heavy, icon: "barbell-outline" },
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

        <Text style={styles.sectionLabel}>{t.exercise.notesLabel}</Text>
        <TextInput
          multiline
          numberOfLines={3}
          onChangeText={setNotes}
          placeholder={t.exercise.notesPlaceholder}
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
                {t.exercise.burnSummary(durationNum, caloriesBurned)}
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
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  exerciseDetailImage: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  infoCardTextContainer: {
    flex: 1,
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
