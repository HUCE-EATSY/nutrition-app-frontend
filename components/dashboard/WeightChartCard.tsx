import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { useRouter } from "expo-router";

import { t } from "@/constants/i18n";
import { colors, spacing, typography, radius } from "@/constants";
import { SurfaceCard } from "../common/SurfaceCard";
import { useGetWeightLogs, useGetUserInfo } from "@/hooks/queries/useUserQueries";

export function WeightChartCard() {
  const router = useRouter();
  
  const { data: userGoalInfo } = useGetUserInfo();

  // Tính toán khoảng ngày 30 ngày gần đây theo giờ địa phương để tránh lỗi múi giờ
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fromStr = formatDate(thirtyDaysAgo);
  const toStr = formatDate(today);

  const { data: logs, isLoading } = useGetWeightLogs(fromStr, toStr);

  const profileWeight = userGoalInfo?.profile?.weightKg ?? 0;
  
  // Handle data
  const hasLogs = logs && logs.length > 0;
  // Sort logs oldest -> newest
  const sortedLogs = hasLogs ? [...logs].sort((a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime()) : [];
  
  const latestWeight = hasLogs ? sortedLogs[sortedLogs.length - 1].weightKg : profileWeight;
  const latestDateStr = hasLogs 
    ? new Date(sortedLogs[sortedLogs.length - 1].logDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : "Hôm nay";

  // Build SVG Path
  let d = "";
  let points: { x: number, y: number, w: number }[] = [];
  
  if (sortedLogs.length > 1) {
    const minW = Math.min(...sortedLogs.map(l => l.weightKg)) - 2;
    const maxW = Math.max(...sortedLogs.map(l => l.weightKg)) + 2;
    const rangeW = maxW - minW || 1;
    
    const wWidth = 300;
    const wHeight = 80;
    
    points = sortedLogs.map((log, index) => {
      const x = (index / (sortedLogs.length - 1)) * wWidth;
      // y inverted because SVG y=0 is top
      const y = wHeight - ((log.weightKg - minW) / rangeW) * wHeight;
      return { x, y, w: log.weightKg };
    });
    
    d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(" ");
  } else if (sortedLogs.length === 1) {
    // Only 1 log -> straight line
    d = `M0 40 L300 40`;
    points = [{ x: 150, y: 40, w: sortedLogs[0].weightKg }];
  }

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
          <Text style={styles.weightValue}>{latestWeight.toFixed(1)} {t.home.kgSuffix}</Text>
          <Text style={styles.date}>{latestDateStr}</Text>
        </View>
        <TouchableOpacity style={styles.updateBtn} onPress={() => router.push('/log-weight')}>
          <Text style={styles.updateText}>{t.home.update}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartArea}>
         {isLoading ? (
            <ActivityIndicator color={colors.primary} />
         ) : (
            <View style={{ flex: 1, position: 'relative' }}>
              <Svg height="80" width="100%" viewBox="0 0 300 80">
                <Line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" />
                <Line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.05)" />
                <Line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.05)" />
                
                {d ? <Path d={d} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" /> : null}
                {points.map((p, i) => (
                  <Circle key={i} cx={p.x} cy={p.y} r="4" fill={colors.textPrimary} stroke={colors.surfaceAlt} strokeWidth="2" />
                ))}
              </Svg>
              {points.length > 0 && (
                <Text style={[styles.chartPointLabel, { position: 'absolute', right: 0, bottom: 0 }]}>
                  {points[points.length-1].w.toFixed(1)} kg
                </Text>
              )}
            </View>
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
    height: 80,
    marginTop: spacing.sm,
    justifyContent: "center",
  },
  chartPointLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },
});

