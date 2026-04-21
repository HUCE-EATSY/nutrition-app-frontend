import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import { colors, spacing, typography } from "@/src/theme";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ label, value, helper, style }: StatCardProps) {
  return (
    <SurfaceCard style={[styles.card, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 132,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  value: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  helper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
