import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { t } from "@/constants/i18n";
import { colors, spacing, typography, radius, layout } from "@/constants";
import { SurfaceCard } from "../common/SurfaceCard";
import { useWeightStats } from "@/hooks/stats/useWeightStats";
import { LineChart } from "../charts/LineChart";
import { useResponsiveLayout } from "@/constants/responsive";

function formatLogDate(isoString?: string) {
  if (!isoString) return "Chưa có dữ liệu";
  const parts = isoString.split("-");
  if (parts.length < 3) return isoString;
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  return `${day} Th ${month}, ${year}`;
}

export function WeightChartCard() {
  const router = useRouter();
  const { width: windowWidth, horizontalPadding } = useResponsiveLayout();
  
  const {
    currentWeight,
    actualChartData,
    targetChartData,
    isLoading,
  } = useWeightStats();

  const contentWidth = Math.min(windowWidth, layout.maxCardWidth);
  const chartWidth = contentWidth - (horizontalPadding * 2) - (spacing.md * 2);
  const lastPoint = actualChartData[actualChartData.length - 1];
  const dateStr = lastPoint ? formatLogDate(lastPoint.fullDate) : "Chưa ghi nhận";
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
            {currentWeight > 0 ? `${currentWeight} ${t.home.kgSuffix}` : "N/A"}
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
           <Text style={styles.noDataText}>Chưa có dữ liệu cân nặng</Text>
         ) : (
           <LineChart
             actualData={actualChartData}
             targetData={targetChartData}
             width={chartWidth}
             height={100}
             yUnit="kg"
           />
         )}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
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
    color: colors.textPrimary,
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
