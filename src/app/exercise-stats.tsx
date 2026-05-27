import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { exerciseService, ExerciseLog } from "@/services/exerciseService";
import { useTranslation } from "@/constants/i18n";
import { useSettingsStore } from "@/store/settingsStore";
import { getTodayDateISO } from "@/utils/date";

export default function ExerciseStatsScreen() {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const language = useSettingsStore((state) => state.language);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const endDate = getTodayDateISO();
        const startDate = new Date();
        
        if (period === "week") {
          startDate.setDate(startDate.getDate() - 7);
        } else if (period === "month") {
          startDate.setMonth(startDate.getMonth() - 1);
        } else {
          startDate.setFullYear(startDate.getFullYear() - 1);
        }
        
        const startDateISO = startDate.toISOString().split("T")[0];
        const data = await exerciseService.getLogs(startDateISO, endDate);
        setLogs(data);
      } catch (error) {
        Alert.alert(t.common.error, t.exercise.loadStatsError);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [period, t]);

  // Tính toán thống kê
  const totalCalories = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  const totalMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const totalWorkouts = logs.length;
  const avgCaloriesPerWorkout = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

  // Thống kê theo loại bài tập
  const exerciseStats = logs.reduce((acc, log) => {
    const name = language === "en" ? log.exerciseNameEn : log.exerciseNameVi;
    if (!acc[name]) {
      acc[name] = {
        name,
        count: 0,
        totalCalories: 0,
        totalMinutes: 0,
      };
    }
    acc[name].count++;
    acc[name].totalCalories += log.caloriesBurned;
    acc[name].totalMinutes += log.durationMinutes;
    return acc;
  }, {} as Record<string, { name: string; count: number; totalCalories: number; totalMinutes: number }>);

  const topExercises = Object.values(exerciseStats)
    .sort((a, b) => b.totalCalories - a.totalCalories)
    .slice(0, 5);

  // Thống kê theo ngày trong tuần
  const dayStats = logs.reduce((acc, log) => {
    const date = new Date(log.logDate);
    const day = date.getDay(); // 0 = CN, 1 = T2, ...
    if (!acc[day]) {
      acc[day] = { count: 0, calories: 0 };
    }
    acc[day].count++;
    acc[day].calories += log.caloriesBurned;
    return acc;
  }, {} as Record<number, { count: number; calories: number }>);

  const dayNames = language === "en"
    ? ["S", "M", "T", "W", "T", "F", "S"]
    : ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const maxDayCalories = Math.max(...Object.values(dayStats).map(d => d.calories), 1);

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>{t.exercise.loadingStats}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.exercise.statsTitle}</Text>
        <Pressable hitSlop={12} onPress={() => router.push("/exercise-diary")}>
          <Ionicons color={colors.primary} name="list-outline" size={24} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <Pressable
            onPress={() => setPeriod("week")}
            style={[styles.periodBtn, period === "week" && styles.periodBtnActive]}
          >
            <Text style={[styles.periodText, period === "week" && styles.periodTextActive]}>
              {t.exercise.sevenDays}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPeriod("month")}
            style={[styles.periodBtn, period === "month" && styles.periodBtnActive]}
          >
            <Text style={[styles.periodText, period === "month" && styles.periodTextActive]}>
              {t.exercise.thirtyDays}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPeriod("year")}
            style={[styles.periodBtn, period === "year" && styles.periodBtnActive]}
          >
            <Text style={[styles.periodText, period === "year" && styles.periodTextActive]}>
              {t.exercise.oneYear}
            </Text>
          </Pressable>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "rgba(255,107,107,0.15)" }]}>
              <Ionicons color="#FF6B6B" name="flame" size={28} />
            </View>
            <Text style={styles.summaryValue}>{totalCalories.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>{t.exercise.totalBurned}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "rgba(92,214,122,0.15)" }]}>
              <Ionicons color={colors.success} name="time-outline" size={28} />
            </View>
            <Text style={styles.summaryValue}>{totalMinutes}</Text>
            <Text style={styles.summaryLabel}>{t.exercise.totalMinutes}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "rgba(165,108,255,0.15)" }]}>
              <MaterialCommunityIcons color={colors.primary} name="dumbbell" size={28} />
            </View>
            <Text style={styles.summaryValue}>{totalWorkouts}</Text>
            <Text style={styles.summaryLabel}>{t.exercise.workoutSessions}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "rgba(52,152,219,0.15)" }]}>
              <Ionicons color={colors.info} name="stats-chart" size={28} />
            </View>
            <Text style={styles.summaryValue}>{avgCaloriesPerWorkout}</Text>
            <Text style={styles.summaryLabel}>{t.exercise.avgKcalWorkout}</Text>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.exercise.dailyActivity}</Text>
          <View style={styles.chartCard}>
            <View style={styles.barChart}>
              {dayNames.map((day, index) => {
                const stat = dayStats[index] || { count: 0, calories: 0 };
                const height = maxDayCalories > 0 ? (stat.calories / maxDayCalories) * 100 : 0;
                
                return (
                  <View key={day} style={styles.barColumn}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${Math.max(height, 5)}%`,
                            backgroundColor: stat.count > 0 ? colors.success : colors.surfaceAlt,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{day}</Text>
                    {stat.count > 0 && (
                      <Text style={styles.barValue}>{stat.calories}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Top Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.exercise.popularExercises}</Text>
          {topExercises.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t.exercise.noDataAvailable}</Text>
            </View>
          ) : (
            topExercises.map((exercise, index) => (
              <View key={exercise.name} style={styles.exerciseCard}>
                <View style={styles.exerciseRank}>
                  <Text style={styles.exerciseRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={styles.exerciseStats}>
                    <View style={styles.exerciseStatItem}>
                      <Ionicons color={colors.textMuted} name="repeat-outline" size={14} />
                      <Text style={styles.exerciseStatText}>{t.exercise.timesSuffix(exercise.count)}</Text>
                    </View>
                    <View style={styles.exerciseStatItem}>
                      <Ionicons color={colors.textMuted} name="time-outline" size={14} />
                      <Text style={styles.exerciseStatText}>{t.exercise.durationSuffix(exercise.totalMinutes)}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.exerciseCalories}>
                  <Text style={styles.exerciseCaloriesValue}>{exercise.totalCalories}</Text>
                  <Text style={styles.exerciseCaloriesLabel}>kcal</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => router.push("/add-exercise")}
          >
            <Ionicons color="#fff" name="add-circle-outline" size={20} />
            <Text style={styles.actionButtonText}>{t.exercise.logActivity}</Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/exercise-diary")}
          >
            <Ionicons color="#fff" name="list-outline" size={20} />
            <Text style={styles.actionButtonText}>{t.exercise.viewDiary}</Text>
          </Pressable>
        </View>
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
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
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
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  periodBtnActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    ...typography.bodyStrong,
    color: colors.textMuted,
    fontSize: 14,
  },
  periodTextActive: {
    color: "#fff",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 24,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 18,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.lg,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  barWrapper: {
    flex: 1,
    width: "70%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  barValue: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.md,
  },
  exerciseRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseRankText: {
    ...typography.bodyStrong,
    color: "#fff",
    fontSize: 14,
  },
  exerciseContent: {
    flex: 1,
    gap: spacing.xs,
  },
  exerciseName: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 15,
  },
  exerciseStats: {
    flexDirection: "row",
    gap: spacing.md,
  },
  exerciseStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  exerciseStatText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  exerciseCalories: {
    alignItems: "flex-end",
  },
  exerciseCaloriesValue: {
    ...typography.h3,
    color: colors.success,
    fontSize: 20,
  },
  exerciseCaloriesLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
  actionButtonText: {
    ...typography.bodyStrong,
    color: "#fff",
  },
});
