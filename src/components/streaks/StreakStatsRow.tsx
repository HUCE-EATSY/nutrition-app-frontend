import React, { useMemo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { spacing, typography } from "@/constants";
import { t } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";

type StreakStatsRowProps = {
  currentStreak: number;
  shieldCount: number;
};

export function StreakStatsRow({ currentStreak, shieldCount }: StreakStatsRowProps) {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.statsRow}>
      <SurfaceCard style={styles.statCard}>
        <View style={styles.statHeader}>
          <MaterialCommunityIcons name="fire" size={20} color={colors.warning} />
          <Text style={styles.statLabel}>{t.streaks.currentStreak}</Text>
        </View>
        <Text style={styles.statValue}>{currentStreak}</Text>
      </SurfaceCard>

      <SurfaceCard style={styles.statCard}>
        <View style={styles.statHeader}>
          <MaterialCommunityIcons name="shield" size={20} color={colors.carbs} />
          <Text style={styles.statLabel}>{t.streaks.waoShield}</Text>
        </View>
        <Text style={styles.statValue}>{shieldCount}</Text>
      </SurfaceCard>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
});
