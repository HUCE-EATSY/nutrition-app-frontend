import { StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import { colors, spacing, typography } from "@/src/theme";

type BMIInfoCardProps = {
  bmi: number;
  statusLabel: string;
  description: string;
  sourceLabel?: string;
};

export function BMIInfoCard({ bmi, statusLabel, description, sourceLabel }: BMIInfoCardProps) {
  return (
    <SurfaceCard>
      <View style={styles.row}>
        <Text style={styles.value}>{bmi.toFixed(1)}</Text>
        <Text style={styles.badge}>{statusLabel}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      {sourceLabel ? <Text style={styles.source}>{sourceLabel}</Text> : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  value: {
    ...typography.display,
    color: colors.textPrimary,
  },
  badge: {
    ...typography.caption,
    color: colors.warning,
    textTransform: "uppercase",
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  source: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
