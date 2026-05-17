import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { t } from "@/constants/i18n";
import { colors, spacing, typography, radius } from "@/constants";
import { HomeHeader, DateScroller } from "@/components/dashboard/HomeHeader";
import { CalorieOverview } from "@/components/dashboard/CalorieOverview";
import { MacroProgressRow } from "@/components/dashboard/MacroProgressRow";
import { ActivityGrid } from "@/components/dashboard/ActivityGrid";
import { SmallStatRow } from "@/components/dashboard/SmallStatRow";
import { WaterIntakeCard } from "@/components/dashboard/WaterIntakeCard";
import { WeightChartCard } from "@/components/dashboard/WeightChartCard";
import { useDiaryStore } from "@/hooks/store/diaryStore";

export default function HomeScreen() {
  const { summary, rawLogs, exercises, fetchDiary, selectedDate } = useDiaryStore();

  useEffect(() => {
    fetchDiary(selectedDate);
  }, [selectedDate, fetchDiary]);

  const goal = Math.round(summary?.targetCalories ?? 2000);
  const consumed = Math.round(summary?.consumedCalories ?? 0);
  const burned = Math.round(exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0));
  const remaining = Math.round(Math.max(goal - consumed + burned, 0));
  const percentage = Math.round(Math.min((consumed / goal) * 100, 100));

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <HomeHeader />
        <DateScroller />

        <CalorieOverview 
          remaining={remaining} 
          goal={goal} 
          consumed={consumed} 
          burned={burned} 
          percentage={percentage} 
        />

        <SurfaceCard style={styles.macroCard}>
          <MacroProgressRow />
          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </SurfaceCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.home.recentLog}</Text>
          {rawLogs.length === 0 ? (
            <View style={styles.emptyRecent}>
              <MaterialCommunityIcons name="basket-plus-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>{t.home.noData}</Text>
            </View>
          ) : (
            <View style={styles.logsList}>
              {rawLogs.map((log) => (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logInfo}>
                    <Text style={styles.logFoodName}>{log.foodName}</Text>
                    <Text style={styles.logDetails}>{log.quantityG}g • P: {Math.round(log.proteinG ?? 0)}g • C: {Math.round(log.carbsG ?? 0)}g • F: {Math.round(log.fatG ?? 0)}g</Text>
                  </View>
                  <Text style={styles.logCalories}>{log.caloriesKcal} kcal</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <ActivityGrid />
        
        <SmallStatRow />

        <WaterIntakeCard />

        <WeightChartCard />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  macroCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptyRecent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  logsList: {
    gap: spacing.sm,
  },
  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  logInfo: {
    gap: 4,
  },
  logFoodName: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  logDetails: {
    ...typography.caption,
    color: colors.textMuted,
  },
  logCalories: {
    ...typography.body,
    fontWeight: "700",
    color: colors.primary,
  },
});
