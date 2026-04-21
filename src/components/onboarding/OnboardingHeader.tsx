import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";

type OnboardingHeaderProps = {
  step: number;
  totalSteps: number;
  onBack?: () => void;
  showDivider?: boolean;
};

export function OnboardingHeader({ step, totalSteps, onBack, showDivider = false }: OnboardingHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Pressable hitSlop={12} onPress={onBack} style={styles.backButton}>
          <Ionicons color={colors.textPrimary} name="chevron-back" size={26} />
        </Pressable>
        <Text style={styles.label}>
          {Math.min(step, totalSteps)}/{totalSteps}
        </Text>
      </View>

      <View style={[styles.track, showDivider && styles.divider]}>
        <View style={[styles.fill, { width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  track: {
    height: 8,
    marginTop: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: "#3A3453",
    overflow: "hidden",
  },
  divider: {
    marginTop: spacing.md,
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
