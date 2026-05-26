import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { t } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";
import { spacing, typography, radius, layout } from "@/constants";
import { SurfaceCard } from "../common/SurfaceCard";
import { useWeightStats } from "@/hooks/stats/useWeightStats";
import { LineChart } from "../charts/LineChart";
import { useResponsiveLayout } from "@/constants/responsive";
import { useSettingsStore } from "@/store/settingsStore";

function formatLogDate(isoString?: string, language?: string) {
  if (!isoString) return language === "vi" ? "Chưa có dữ liệu" : "No data";
  const parts = isoString.split("-");
  if (parts.length < 3) return isoString;
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (language === "en") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mIdx = parseInt(month, 10) - 1;
    return `${months[mIdx] || month} ${day}, ${year}`;
  }
  return `${day} Th ${month}, ${year}`;
}

export function WeightChartCard() {
  const router = useRouter();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const { width: windowWidth, horizontalPadding } = useResponsiveLayout();
  const language = useSettingsStore((state) => state.language);
  const unit = useSettingsStore((state) => state.unit);
  
  const {
    currentWeight,
    actualChartData,
    targetChartData,
    isLoading,
  } = useWeightStats();

  const contentWidth = Math.min(windowWidth, layout.maxCardWidth);
  const chartWidth = contentWidth - (horizontalPadding * 2) - (spacing.md * 2);
  const lastPoint = actualChartData[actualChartData.length - 1];
  const dateStr = lastPoint 
    ? formatLogDate(lastPoint.fullDate, language) 
    : (language === "vi" ? "Chưa ghi nhận" : "Not recorded");
  const hasData = actualChartData.length > 0;

  return (
    <SurfaceCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="scale" size={20} color={colors.warning} />
          <Text style={styles.title}>{t.home.weightTitle}</Text>
        </View>
      </View>

      <View style={styles.main}>
        <View>
          <Text style={styles.weightValue}>
            {currentWeight > 0 ? `${currentWeight} ${unit}` : "N/A"}
          </Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <TouchableOpacity style={styles.updateBtn} onPress={() => router.push('/log-weight')}>
          <Text style={styles.updateText}>{t.home.update}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartArea}>
         {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
         ) : !hasData ? (
            <Text style={styles.noDataText}>{t.stats.noDataWeight}</Text>
         ) : (
            <LineChart
              actualData={actualChartData}
              targetData={targetChartData}
              width={chartWidth}
              height={100}
              yUnit={unit}
              targetColor={colors.textSecondary}
            />
         )}
      </View>
    </SurfaceCard>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  main: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  weightValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  updateBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  updateText: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.primary === "#A56CFF" ? colors.textPrimary : "#FFFFFF",
  },
  chartArea: {
    height: 100,
    marginTop: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
