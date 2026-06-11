import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

type Props = {
  longestStreak: number;
  currentStreak: number;
  shieldCount: number;
  totalFreezes?: number;
};

export function StreakDetailStats({ longestStreak, currentStreak, shieldCount, totalFreezes = 0 }: Props) {
  const colors = useAppColors();

  const stats = [
    {
      icon: "fire" as const,
      color: "#FF9500",
      label: "Chuỗi hiện tại",
      value: `${currentStreak} ngày`,
    },
    {
      icon: "trophy-outline" as const,
      color: "#FFD700",
      label: "Chuỗi dài nhất",
      value: `${longestStreak} ngày`,
    },
    {
      icon: "shield-check" as const,
      color: "#5856D6",
      label: "Thẻ đóng băng",
      value: `${shieldCount} thẻ`,
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="chart-bar" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Thống kê Streak</Text>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat, idx) => (
          <View key={idx} style={styles.statItem}>
            <View style={[styles.iconBox, { backgroundColor: `${stat.color}20` }]}>
              <MaterialCommunityIcons name={stat.icon} size={22} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.bodyStrong,
    fontSize: 15,
    fontWeight: "700",
  },
  statLabel: {
    ...typography.caption,
    fontSize: 11,
    textAlign: "center",
  },
});
