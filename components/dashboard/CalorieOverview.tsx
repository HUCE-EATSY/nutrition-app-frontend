import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import { t } from "@/constants/i18n";
import { colors, spacing, typography, radius } from "@/constants";

interface CalorieOverviewProps {
  remaining: number;
  goal: number;
  consumed: number;
  burned: number;
  percentage: number;
}

export function CalorieOverview({ remaining, goal, consumed, burned, percentage }: CalorieOverviewProps) {
  const circleRadius = 70;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.home.calorieGoal}</Text>
        <View style={styles.reportBadge}>
          <Text style={styles.reportText}>{t.home.report}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Svg height="180" width="180" viewBox="0 0 180 180">
          <G rotation="-90" origin="90, 90">
            {/* Background Circle */}
            <Circle
              cx="90"
              cy="90"
              r={circleRadius}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="10"
              fill="none"
            />
            {/* Progress Circle */}
            <Circle
              cx="90"
              cy="90"
              r={circleRadius}
              stroke={colors.primary}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        </Svg>
        <View style={styles.centerContent}>
          <Text style={styles.remainingValue}>{remaining}</Text>
          <Text style={styles.remainingLabel}>{t.home.caloriesRemaining}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{goal.toLocaleString()}</Text>
          <View style={styles.statLabelRow}>
            <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
            <Text style={styles.statLabel}>{t.home.goal}</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{consumed}</Text>
          <View style={styles.statLabelRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={styles.statLabel}>{t.home.consumed}</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{burned}</Text>
          <View style={styles.statLabelRow}>
            <View style={[styles.dot, { backgroundColor: colors.danger }]} />
            <Text style={styles.statLabel}>{t.home.exercise}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  reportBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  reportText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.md,
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
  },
  remainingValue: {
    ...typography.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.textPrimary,
  },
  remainingLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
