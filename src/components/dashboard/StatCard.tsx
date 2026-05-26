import React, { useMemo } from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ label, value, helper, style }: StatCardProps) {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <SurfaceCard style={[styles.card, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </SurfaceCard>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
