import React from "react";
import { useAppColors } from "@/hooks/useAppColors";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNutritionStats } from "@/hooks/stats/useNutritionStats";
import { FilterTabs } from "@/components/stats/FilterTabs";
import { DateSlider } from "@/components/stats/DateSlider";
import { PieChart } from "@/components/charts/PieChart";
import { BarChart } from "@/components/charts/BarChart";
import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { NutritionPeriod } from "@/constants/stats";
import { useTranslation } from "@/constants/i18n";
import { useSettingsStore } from "@/store/settingsStore";

const { width: screenWidth } = Dimensions.get("window");

// Helper: tính label khoảng thời gian tuần đang xem
function getWeekRangeLabel(offset: number): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
  monday.setDate(monday.getDate() + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(monday)} - ${fmt(sunday)}`;
}

export default function NutritionStatsScreen() {
  const t = useTranslation();
  const colors = useAppColors();
  const language = useSettingsStore((state) => state.language);
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const router = useRouter();
  const {
    period,
    activeTabLabel, tabs, handleTabChange,
    dates, selectedDate, handleSelectDate,
    summary, isLoading,
    weekOffset, barChartData, targetCalories,
    weeklyAvgCalories, weeklyAvgProtein, weeklyAvgCarbs, weeklyAvgFat,
    isLoadingWeek,
    handlePrevWeek, handleNextWeek, canGoNext,
  } = useNutritionStats();

  // ---- Tab Ngày: dữ liệu ----
  const targetCal = summary?.target?.target_calories ?? 0;
  const consumedCal = summary?.total_calories ?? 0;

  const proteinG = summary?.total_protein_g ?? 0;
  const carbG = summary?.total_carbs_g ?? 0;
  const fatG = summary?.total_fat_g ?? 0;

  const targetProteinG = summary?.target?.target_protein_g ?? 0;
  const targetCarbG = summary?.target?.target_carbs_g ?? 0;
  const targetFatG = summary?.target?.target_fat_g ?? 0;

  const proteinPct = summary?.target?.protein_pct ?? 0;
  const carbPct = summary?.target?.carbs_pct ?? 0;
  const fatPct = summary?.target?.fat_pct ?? 0;

  const macroData = [
    { label: t.home.protein, value: Number(proteinG), color: colors.danger },
    { label: t.home.carbs, value: Number(carbG), color: colors.info },
    { label: t.home.fat, value: Number(fatG), color: colors.fat },
  ];

  return (
    <ScreenBackground withGlow={false}>
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.stats.nutritionTitle}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <FilterTabs
            tabs={tabs}
            activeTab={activeTabLabel}
            onChange={handleTabChange}
          />

          {/* ===== TAB NGÀY ===== */}
          {period === NutritionPeriod.DAY && (
            <DateSlider dates={dates} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
          )}

          {period === NutritionPeriod.DAY && (
            isLoading ? (
              <View style={[styles.card, { paddingVertical: 40, alignItems: "center" }]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                {/* Calorie Overview Card */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{t.stats.dailyCalorieStats}</Text>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>{t.stats.calorieGoal}</Text>
                    <Text style={styles.targetValue}>{targetCal} cal</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>{t.stats.calorieIntake}</Text>
                    <Text style={styles.greyValue}>{consumedCal} cal</Text>
                  </View>
                </View>

                {/* Macro Statistics Card */}
                <View style={styles.card}>
                  <View style={styles.chartContainer}>
                    <PieChart data={macroData} />
                  </View>
                  <View style={styles.legendContainer}>
                    <Text style={styles.legendText}>⚡ {t.home.protein} ({proteinG}{t.home.gramSuffix}) | {proteinPct}% | 20%</Text>
                    <Text style={styles.legendText}>🍚 {t.home.carbs} ({carbG}{t.home.gramSuffix}) | {carbPct}% | 50%</Text>
                    <Text style={styles.legendText}>🥑 {t.home.fat} ({fatG}{t.home.gramSuffix}) | {fatPct}% | 30%</Text>
                  </View>
                </View>

                {/* Detailed Nutrients List */}
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t.stats.nutritionalValue}</Text>
                  <NutrientRow label={t.stats.carb} current={`${carbG} ${t.home.gramSuffix}`} target={`${targetCarbG} ${t.home.gramSuffix}`} />
                  <NutrientRow label={t.stats.fiber} current="-" target="-" />
                  <NutrientRow label={t.stats.sugar} current="-" target="-" />
                  <NutrientRow label={t.stats.fat} current={`${fatG} ${t.home.gramSuffix}`} target={`${targetFatG} ${t.home.gramSuffix}`} />
                  <NutrientRow label={t.stats.protein} current={`${proteinG} ${t.home.gramSuffix}`} target={`${targetProteinG} ${t.home.gramSuffix}`} />

                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t.stats.minerals}</Text>
                  <NutrientRow label={t.stats.calcium} current="-" target="-" />
                  <NutrientRow label={t.stats.potassium} current="-" target="-" />
                  <NutrientRow label={t.stats.iron} current="-" target="-" isLast />
                </View>
              </>
            )
          )}

          {/* ===== TAB TUẦN ===== */}
          {period === NutritionPeriod.WEEK && (
            <>
              {/* Date Navigator */}
              <View style={styles.dateNavigator}>
                <TouchableOpacity onPress={handlePrevWeek} style={styles.navArrow}>
                  <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.dateRangeText}>{getWeekRangeLabel(weekOffset)}</Text>
                <TouchableOpacity
                  onPress={handleNextWeek}
                  disabled={!canGoNext}
                  style={[styles.navArrow, !canGoNext && { opacity: 0.3 }]}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Chart Area */}
              {isLoadingWeek ? (
                <View style={[styles.card, { paddingVertical: 40, alignItems: "center" }]}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : barChartData.length === 0 ? (
                <View style={[styles.card, { paddingVertical: 40, alignItems: "center" }]}>
                  <Ionicons name="nutrition-outline" size={40} color={colors.borderSoft} />
                  <Text style={[styles.greyValue, { marginTop: 12 }]}>{t.stats.noDataNutrition}</Text>
                </View>
              ) : (
                <View style={styles.chartSection}>
                  <BarChart
                    data={barChartData}
                    averageValue={targetCalories}
                    barColor={colors.primary}
                    showYAxis={true}
                    showAveragePill={true}
                    width={screenWidth - 32}
                    height={190}
                  />
                  {/* Chart Legends */}
                  <View style={styles.chartLegend}>
                    <View style={styles.legendItem}>
                      <Text style={styles.legendDash}>- - -</Text>
                      <Text style={styles.legendItemLabel}>{t.stats.calorieGoal}</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBar, { backgroundColor: colors.primary }]} />
                      <Text style={styles.legendItemLabel}>{t.stats.calorieIntake}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Weekly Summary Card */}
              {!isLoadingWeek && (
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="bar-chart-outline" size={20} color="#A78BFA" />
                    <Text style={[styles.cardTitle, { marginLeft: 8 }]}>{t.stats.weeklySummary}</Text>
                  </View>

                  <View style={styles.gridMetrics}>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricValue}>{weeklyAvgCalories.toLocaleString("vi-VN")}</Text>
                      <Text style={styles.metricUnit}>{t.macros.caloriesPerDay}</Text>
                      <Text style={styles.metricLabel}>{t.stats.averagePeriod(language === "vi" ? "calo" : "calorie")}</Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricValue}>{targetCalories > 0 ? targetCalories : "—"}</Text>
                      <Text style={styles.metricUnit}>{t.macros.caloriesPerDay}</Text>
                      <Text style={styles.metricLabel}>{t.stats.calorieGoal}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>{t.stats.averagePeriod("macro")}</Text>
                  <View style={styles.macroRow}>
                    <MacroChip label={t.home.protein} value={`${weeklyAvgProtein}g`} color={colors.danger} />
                    <MacroChip label={t.home.carbs} value={`${weeklyAvgCarbs}g`} color={colors.info} />
                    <MacroChip label={t.home.fat} value={`${weeklyAvgFat}g`} color={colors.fat} />
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

// ---- Sub-components ----

const NutrientRow = ({ label, current, target, isLast = false }: any) => {
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  return (
    <View style={[styles.nutrientRow, isLast && { borderBottomWidth: 0 }]}>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <Text style={styles.nutrientCurrent}>{current}</Text>
      <Text style={styles.nutrientTarget}>{target}</Text>
    </View>
  );
};

const MacroChip = ({ label, value, color }: { label: string; value: string; color: string }) => {
  const colors = useAppColors();
  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: color + "22", borderRadius: 12, paddingVertical: 10, marginHorizontal: 4 }}>
      <Text style={{ color, fontWeight: "700", fontSize: 16 }}>{value}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
};

// ---- Styles ----

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingTop: 60 },
  backBtn: { padding: 8 },
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "bold" },
  content: { padding: 16 },
  card: { backgroundColor: colors.bgElevated, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "600", marginBottom: 16 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  rowLabel: { color: colors.textSecondary, fontSize: 16 },
  targetValue: { color: colors.primary, fontSize: 16, fontWeight: "bold" },
  greyValue: { color: colors.textSecondary, fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: 8 },
  chartContainer: { alignItems: "center", marginVertical: 16 },
  legendContainer: { marginTop: 16, gap: 8 },
  legendText: { color: colors.textSecondary, fontSize: 14 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  nutrientRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  nutrientLabel: { flex: 2, color: colors.textPrimary },
  nutrientCurrent: { flex: 1, color: colors.textSecondary, textAlign: "center" },
  nutrientTarget: { flex: 1, color: colors.primary, textAlign: "right" },

  // Date Navigator (đồng bộ với steps.tsx)
  dateNavigator: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingHorizontal: 4 },
  navArrow: { padding: 8 },
  dateRangeText: { color: colors.textPrimary, fontSize: 15, fontWeight: "600" },

  // Chart Section
  chartSection: { backgroundColor: colors.bgElevated, borderRadius: 16, padding: 16, marginBottom: 16 },
  chartLegend: { flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDash: { color: colors.textMuted, fontSize: 14 },
  legendItemLabel: { color: colors.textSecondary, fontSize: 12 },
  legendBar: { width: 12, height: 12, borderRadius: 3 },

  // Metrics Grid
  gridMetrics: { flexDirection: "row", gap: 12, marginVertical: 12 },
  metricBox: { flex: 1, backgroundColor: colors.bgBase, borderRadius: 12, padding: 12, alignItems: "center" },
  metricValue: { color: colors.textPrimary, fontSize: 22, fontWeight: "700" },
  metricUnit: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  metricLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 4, textAlign: "center" },

  // Macro row
  macroRow: { flexDirection: "row", marginTop: 4 },
});
