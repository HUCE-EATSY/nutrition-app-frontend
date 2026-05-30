import React, { useMemo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { radius, spacing, typography } from "@/constants";
import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";

type StreakActionCardProps = {
  onPressAdd?: () => void;
};

export function StreakActionCard({ onPressAdd }: StreakActionCardProps) {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <SurfaceCard style={styles.actionCard}>
      <View style={styles.actionLeft}>
        <View style={styles.actionIconBg}>
          <MaterialCommunityIcons name="food-apple" size={24} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.actionTitle}>{t.streaks.logFoodNow}</Text>
          <Text style={styles.actionSubtitle}>{t.streaks.maintainStreak}</Text>
        </View>
      </View>
      <Pressable onPress={onPressAdd} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
        <MaterialCommunityIcons name="plus" size={24} color={colors.textPrimary} />
      </Pressable>
    </SurfaceCard>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: "rgba(165,108,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
});
