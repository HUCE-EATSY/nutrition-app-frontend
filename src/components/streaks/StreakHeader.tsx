import React, { useMemo } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography } from "@/constants";
import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";

type StreakHeaderProps = {
  streakDays: number;
  onBack: () => void;
};

export function StreakHeader({ streakDays, onBack }: StreakHeaderProps) {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <Pressable hitSlop={15} onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </Pressable>

      <View style={styles.headerContent}>
        <MaterialCommunityIcons name="fire" size={56} color={colors.warning} style={styles.fireIcon} />
        <Text style={styles.streakNumber}>{streakDays}</Text>
        <Text style={styles.streakLabel}>{t.streaks.consecutiveDays}</Text>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  header: {
    alignItems: "center",
    position: "relative",
    paddingVertical: spacing.xl,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: spacing.lg,
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  headerContent: {
    alignItems: "center",
    gap: 0,
  },
  fireIcon: {
    marginBottom: -10,
  },
  streakNumber: {
    ...typography.display,
    fontSize: 72,
    lineHeight: 80,
    letterSpacing: -2,
    color: colors.textPrimary,
  },
  streakLabel: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
