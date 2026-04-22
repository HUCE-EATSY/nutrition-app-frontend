import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { t } from "@/src/i18n";
import { colors, spacing, typography } from "@/src/theme";
import { HomeHeader, DateScroller } from "@/src/components/dashboard/HomeHeader";
import { CalorieOverview } from "@/src/components/dashboard/CalorieOverview";
import { MacroProgressRow } from "@/src/components/dashboard/MacroProgressRow";
import { ActivityGrid } from "@/src/components/dashboard/ActivityGrid";
import { SmallStatRow } from "@/src/components/dashboard/SmallStatRow";
import { WaterIntakeCard } from "@/src/components/dashboard/WaterIntakeCard";
import { WeightChartCard } from "@/src/components/dashboard/WeightChartCard";

export function HomeScreen() {
  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <HomeHeader />
        <DateScroller />

        <CalorieOverview 
          remaining={1925} 
          goal={1925} 
          consumed={0} 
          burned={0} 
          percentage={0} 
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
