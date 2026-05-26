import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { t } from "@/constants/i18n";
import { colors, spacing, typography } from "@/constants";
import { HomeHeader, DateScroller } from "@/components/dashboard/HomeHeader";
import { CalorieOverview } from "@/components/dashboard/CalorieOverview";
import { MacroProgressRow } from "@/components/dashboard/MacroProgressRow";
import { ActivityGrid } from "@/components/dashboard/ActivityGrid";
import { SmallStatRow } from "@/components/dashboard/SmallStatRow";
import { WaterIntakeCard } from "@/components/dashboard/WaterIntakeCard";
import { WeightChartCard } from "@/components/dashboard/WeightChartCard";
import { exerciseService } from "@/services/exerciseService";
import { getTodayDateISO } from "@/hooks/utils/date";
import { useDiaryStore } from "@/hooks/store/diaryStore";

export default function HomeScreen() {
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const { summary, fetchDiary } = useDiaryStore();

  // Refresh data khi quay lại trang home
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const today = getTodayDateISO();
      
      // Load exercise data
      const exerciseSummary = await exerciseService.getDailySummary(today);
      setCaloriesBurned(Math.round(exerciseSummary.totalCaloriesBurned));
      
      // Load diary summary để lấy targetCalories
      await fetchDiary(today);
    } catch (error) {
      console.log("Failed to load data:", error);
    }
  }

  const targetCalories = summary?.targetCalories || 1925;
  const consumedCalories = summary?.consumedCalories || 0;
  const remaining = targetCalories + caloriesBurned - consumedCalories;
  const percentage = targetCalories > 0 ? Math.round((consumedCalories / targetCalories) * 100) : 0;

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <HomeHeader />
        <DateScroller />

        <CalorieOverview 
          remaining={remaining} 
          goal={targetCalories} 
          consumed={consumedCalories} 
          burned={caloriesBurned} 
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
          <View style={styles.emptyRecent}>
             <MaterialCommunityIcons name="basket-plus-outline" size={32} color={colors.textMuted} />
             <Text style={styles.emptyText}>{t.home.noData}</Text>
          </View>
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
});
