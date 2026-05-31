import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, Animated, Easing } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
import { useRouter } from "expo-router";

import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";
import { spacing, typography, radius } from "@/constants";

interface CalorieOverviewProps {
  remaining: number;
  goal: number;
  consumed: number;
  burned: number;
  percentage: number;
}

export function CalorieOverview({ remaining, goal, consumed, burned, percentage }: CalorieOverviewProps) {
  const t = useTranslation();
  const router = useRouter();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const circleRadius = 70;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const animatedOffset = useRef(new Animated.Value(circumference)).current;

  // Force useNativeDriver false to ensure compatibility with SVG strokeDashoffset
  useEffect(() => {
    Animated.timing(animatedOffset, {
      toValue: strokeDashoffset,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [strokeDashoffset]);

  const bgCircleStroke = colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.home.calorieGoal}</Text>
        <Pressable 
          style={({ pressed }) => [styles.reportBadge, pressed && { opacity: 0.7 }]} 
          onPress={() => router.push('/stats/nutrition')}
        >
          <Text style={styles.reportText}>{t.home.report}</Text>
        </Pressable>
      </View>

      <View style={styles.chartContainer}>
        <Svg height="180" width="180" viewBox="0 0 180 180">
          <G rotation="-90" origin="90, 90">
            {/* Background Circle */}
            <Circle
              cx="90"
              cy="90"
              r={circleRadius}
              stroke={bgCircleStroke}
              strokeWidth="10"
              fill="none"
            />
            {/* Progress Circle */}
            <AnimatedCircle
              cx="90"
              cy="90"
              r={circleRadius}
              stroke={colors.primary}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={animatedOffset}
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
        <Pressable style={styles.statItem} onPress={() => router.push('/guide/goal')}>
          <Text style={styles.statValue}>{goal.toLocaleString()}</Text>
          <View style={styles.statLabelRow}>
            <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
            <Text style={styles.statLabel}>{t.home.goal}</Text>
          </View>
        </Pressable>

        <Pressable style={styles.statItem} onPress={() => router.push('/guide/consumed')}>
          <Text style={styles.statValue}>{consumed}</Text>
          <View style={styles.statLabelRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={styles.statLabel}>{t.home.consumed}</Text>
          </View>
        </Pressable>

        <Pressable style={styles.statItem} onPress={() => router.push('/guide/exercise')}>
          <Text style={styles.statValue}>{burned}</Text>
          <View style={styles.statLabelRow}>
            <View style={[styles.dot, { backgroundColor: colors.danger }]} />
            <Text style={styles.statLabel}>{t.home.exercise}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
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
