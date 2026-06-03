import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

type MilestoneLevel = {
  days: number;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  bg: string;
};

const MILESTONES: MilestoneLevel[] = [
  { days: 3,   label: "Khởi đầu",    icon: "fire",             color: "#FF9500", bg: "rgba(255,149,0,0.12)"  },
  { days: 7,   label: "Tuần lễ",     icon: "star-circle",      color: "#FFD700", bg: "rgba(255,215,0,0.12)"  },
  { days: 14,  label: "Nửa tháng",   icon: "medal-outline",    color: "#34C759", bg: "rgba(52,199,89,0.12)"  },
  { days: 30,  label: "Một tháng",   icon: "trophy-outline",   color: "#5856D6", bg: "rgba(88,86,214,0.12)"  },
  { days: 60,  label: "Hai tháng",   icon: "crown-outline",    color: "#FF2D55", bg: "rgba(255,45,85,0.12)"  },
  { days: 100, label: "Trăm ngày",   icon: "shield-star",      color: "#FF6B00", bg: "rgba(255,107,0,0.12)"  },
];

type Props = {
  currentStreak: number;
};

export function StreakMilestoneCard({ currentStreak }: Props) {
  const colors = useAppColors();

  const nextMilestone = MILESTONES.find((m) => m.days > currentStreak);
  const lastAchieved = [...MILESTONES].reverse().find((m) => m.days <= currentStreak);

  const progress = nextMilestone
    ? Math.min((currentStreak / nextMilestone.days) * 100, 100)
    : 100;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Cột mốc Streak</Text>
      </View>

      {/* Milestone progress bar */}
      {nextMilestone && (
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressFrom, { color: colors.textSecondary }]}>
              {currentStreak} ngày
            </Text>
            <Text style={[styles.progressTo, { color: nextMilestone.color }]}>
              🎯 {nextMilestone.days} ngày — {nextMilestone.label}
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border ?? "#E5E5E5" }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress}%` as any, backgroundColor: nextMilestone.color },
              ]}
            />
          </View>
          <Text style={[styles.progressNote, { color: colors.textSecondary }]}>
            Còn {nextMilestone.days - currentStreak} ngày để đạt cột mốc!
          </Text>
        </View>
      )}

      {!nextMilestone && (
        <View style={styles.maxSection}>
          <MaterialCommunityIcons name="crown" size={32} color="#FFD700" />
          <Text style={[styles.maxText, { color: colors.textPrimary }]}>
            Bạn đã đạt tất cả cột mốc! 🏆
          </Text>
        </View>
      )}

      {/* All milestones list */}
      <View style={styles.milestoneList}>
        {MILESTONES.map((m) => {
          const achieved = currentStreak >= m.days;
          return (
            <View key={m.days} style={[styles.milestoneItem, { backgroundColor: achieved ? m.bg : "transparent" }]}>
              <View style={[styles.milestoneIcon, { backgroundColor: achieved ? m.bg : colors.border ?? "#F0F0F0" }]}>
                <MaterialCommunityIcons
                  name={m.icon}
                  size={18}
                  color={achieved ? m.color : colors.textSecondary ?? "#999"}
                />
              </View>
              <View style={styles.milestoneText}>
                <Text style={[styles.milestoneDays, { color: achieved ? m.color : colors.textSecondary }]}>
                  {m.days} ngày
                </Text>
                <Text style={[styles.milestoneLabel, { color: achieved ? colors.textPrimary : colors.textSecondary }]}>
                  {m.label}
                </Text>
              </View>
              {achieved && (
                <MaterialCommunityIcons name="check-circle" size={18} color={m.color} />
              )}
            </View>
          );
        })}
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
  progressSection: {
    gap: spacing.sm,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressFrom: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "600",
  },
  progressTo: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 10,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  progressNote: {
    ...typography.caption,
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  maxSection: {
    alignItems: "center",
    gap: spacing.sm,
  },
  maxText: {
    ...typography.bodyStrong,
    fontSize: 15,
    textAlign: "center",
  },
  milestoneList: {
    gap: spacing.sm,
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  milestoneIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneText: {
    flex: 1,
  },
  milestoneDays: {
    ...typography.bodyStrong,
    fontSize: 14,
    fontWeight: "700",
  },
  milestoneLabel: {
    ...typography.caption,
    fontSize: 12,
  },
});
