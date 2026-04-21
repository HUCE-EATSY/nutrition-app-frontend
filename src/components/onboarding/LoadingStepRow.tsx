import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";

type LoadingStepRowProps = {
  label: string;
  progress: number;
  status: "idle" | "loading" | "done";
};

export function LoadingStepRow({ label, progress, status }: LoadingStepRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(8, progress * 100)}%` }]} />
        </View>
      </View>
      {status === "loading" ? <ActivityIndicator color={colors.primary} /> : null}
      {status === "done" ? <Text style={styles.done}>✓</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  label: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    overflow: "hidden",
    backgroundColor: "#3A3453",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  done: {
    ...typography.h3,
    color: colors.success,
  },
});
