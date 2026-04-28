import { StyleSheet, Text, View, Pressable } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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
import {
  useDiaryStore,
  getTotalsForDate,
  getEntriesForDate,
} from "@/hooks/store/diaryStore";
import { hourLabel } from "@/hooks/utils/date";

export default function HomeScreen() {
  const selectedDateISO = useDiaryStore((s) => s.selectedDateISO);
  const entriesByDate = useDiaryStore((s) => s.entriesByDate);
  const targetCalories = useDiaryStore((s) => s.targetCalories);

  const totals = getTotalsForDate(entriesByDate, selectedDateISO);
  const allEntries = getEntriesForDate(entriesByDate, selectedDateISO);

  // Lấy 4 entry gần nhất (sắp xếp theo giờ giảm dần)
  const recentEntries = [...allEntries]
    .sort((a, b) => b.hour - a.hour)
    .slice(0, 4);

  const consumed = totals.calories;
  const remaining = Math.max(0, targetCalories - consumed);
  const percentage = targetCalories > 0 ? Math.min(consumed / targetCalories, 1) : 0;

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <HomeHeader />
        <DateScroller />

        <CalorieOverview
          remaining={remaining}
          goal={targetCalories}
          consumed={consumed}
          burned={0}
          percentage={percentage}
        />

        <SurfaceCard style={styles.macroCard}>
          <MacroProgressRow />
          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </SurfaceCard>

        {/* ── Recent Log ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.home.recentLog}</Text>
            <Pressable
              onPress={() => router.push("/(tabs)/diary")}
              hitSlop={8}
            >
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </Pressable>
          </View>

          {recentEntries.length === 0 ? (
            <View style={styles.emptyRecent}>
              <MaterialCommunityIcons
                name="basket-plus-outline"
                size={32}
                color={colors.textMuted}
              />
              <Text style={styles.emptyText}>{t.home.noData}</Text>
            </View>
          ) : (
            <SurfaceCard style={styles.logList}>
              {recentEntries.map((entry, idx) => (
                <View
                  key={entry.id}
                  style={[
                    styles.logItem,
                    idx < recentEntries.length - 1 && styles.logItemBorder,
                  ]}
                >
                  <View style={styles.logIcon}>
                    <Ionicons
                      name={entry.type === "snack" ? "cafe-outline" : "restaurant-outline"}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.logMeta}>
                    <Text style={styles.logTitle} numberOfLines={1}>
                      {entry.title}
                    </Text>
                    <Text style={styles.logTime}>{hourLabel(entry.hour)}</Text>
                  </View>
                  <Text style={styles.logCal}>{entry.calories} kcal</Text>
                </View>
              ))}
            </SurfaceCard>
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.caption,
    color: colors.primary,
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
  // Recent log list
  logList: {
    padding: 0,
    overflow: "hidden",
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  logItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(165,108,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  logMeta: {
    flex: 1,
    gap: 2,
  },
  logTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 13,
  },
  logTime: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  logCal: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
