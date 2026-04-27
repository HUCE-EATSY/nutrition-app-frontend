import { StyleSheet, Text, View } from "react-native";

import { t } from "@/constants/i18n";
import { colors, spacing, typography, radius } from "@/constants";

interface MacroItemProps {
  label: string;
  current: number;
  target: number;
  color: string;
  icon: string;
}

function ProgressItem({ label, current, target, color, icon }: MacroItemProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.progress, { width: `${percentage}%`, backgroundColor: color }]} />
        <View style={[styles.thumb, { left: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.values}>
        <Text style={styles.current}>{current}</Text>
        <Text style={styles.target}>{` / ${target}${t.home.gramSuffix}`}</Text>
      </Text>
    </View>
  );
}

export function MacroProgressRow() {
  return (
    <View style={styles.container}>
      <ProgressItem
        color={colors.protein}
        current={0}
        icon="⚡"
		label={t.home.protein}
        target={96}
      />
      <ProgressItem
        color={colors.carbs}
        current={0}
        icon="🍞"
        label={t.home.carbs}
        target={241}
      />
      <ProgressItem
        color={colors.fat}
        current={0}
        icon="🥑"
        label={t.home.fat}
        target={64}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  item: {
    flex: 1,
    gap: 8,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  track: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "visible",
    justifyContent: "center",
  },
  progress: {
    height: "100%",
    borderRadius: 3,
  },
  thumb: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    borderWidth: 1,
    borderColor: colors.textPrimary,
  },
  values: {
    ...typography.caption,
    marginTop: 2,
  },
  current: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  target: {
    color: colors.textMuted,
  },
});
