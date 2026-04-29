import { StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { colors, radius, spacing, typography } from "@/constants";

type WeeklyProgressCardProps = {
  daysOfWeek: string[]; // length = 7
  weeklyProgress: boolean[]; // length = 7
};

export function WeeklyProgressCard({ daysOfWeek, weeklyProgress }: WeeklyProgressCardProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mục tiêu tuần</Text>
      <SurfaceCard style={styles.weeklyCard}>
        {weeklyProgress.map((isCompleted, idx) => (
          <View key={`${daysOfWeek[idx] ?? idx}`} style={[styles.dayCircle, isCompleted && styles.dayCircleActive]}>
            <Text style={[styles.dayText, isCompleted && styles.dayTextActive]}>{daysOfWeek[idx] ?? ""}</Text>
          </View>
        ))}
      </SurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  weeklyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.bgBase,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: {
    backgroundColor: colors.warning,
  },
  dayText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
  },
  dayTextActive: {
    color: colors.bgElevated,
  },
});
