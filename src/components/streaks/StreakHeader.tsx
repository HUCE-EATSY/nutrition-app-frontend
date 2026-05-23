import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/constants";

type StreakHeaderProps = {
  streakDays: number;
  onBack: () => void;
};

export function StreakHeader({ streakDays, onBack }: StreakHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={15} onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </Pressable>

      <View style={styles.headerContent}>
        <MaterialCommunityIcons name="fire" size={56} color={colors.warning} style={styles.fireIcon} />
        <Text style={styles.streakNumber}>{streakDays}</Text>
        <Text style={styles.streakLabel}>Ngày liên tiếp</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
