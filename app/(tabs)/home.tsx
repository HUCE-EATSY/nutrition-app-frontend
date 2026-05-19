import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";

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
import { useNutritionStore } from "@/hooks/store/statsStore";

export default function HomeScreen() {
  const { selectedDate, summaryCache, fetchSummary } = useNutritionStore();

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate]);

  const summary = summaryCache[selectedDate];

  const targetCalories = summary?.target?.target_calories ?? 2000;
  const consumedCalories = summary?.total_calories ?? 0;
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const percentage = Math.min((consumedCalories / targetCalories) * 100, 100);

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <HomeHeader />
        <DateScroller />

        <CalorieOverview 
          remaining={remainingCalories} 
          goal={targetCalories} 
          consumed={consumedCalories} 
          burned={0} 
          percentage={percentage} 
        />

        <SurfaceCard style={styles.macroCard}>
          <MacroProgressRow 
            protein={summary?.total_protein_g ?? 0}
            targetProtein={summary?.target?.target_protein_g ?? 100}
            carbs={summary?.total_carbs_g ?? 0}
            targetCarbs={summary?.target?.target_carbs_g ?? 200}
            fat={summary?.total_fat_g ?? 0}
            targetFat={summary?.target?.target_fat_g ?? 70}
          />
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
