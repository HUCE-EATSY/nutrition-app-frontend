import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "@/src/i18n";
import { colors, radius, spacing, typography } from "@/src/theme";

type TimelineHourRowProps = {
  hourLabel: string;
  entriesCount: number;
  isCurrentHour?: boolean;
  title?: string;
  calories?: number;
  onAdd: () => void;
  onPress?: () => void;
};

export function TimelineHourRow({
  hourLabel,
  entriesCount,
  isCurrentHour = false,
  title,
  calories,
  onAdd,
  onPress,
}: TimelineHourRowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.row, isCurrentHour && styles.currentRow]}>
      <View style={styles.leftColumn}>
        <Text style={[styles.hour, isCurrentHour && styles.currentHour]}>{hourLabel}</Text>
        <View style={styles.timelineLine} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{entriesCount > 0 ? title : t.diary.emptyTitle}</Text>
        <Text style={styles.subtitle}>
          {entriesCount > 0 ? t.diary.summary(entriesCount, calories ?? 0) : t.diary.emptyHint}
        </Text>
      </View>
      <Pressable hitSlop={12} onPress={onAdd} style={styles.addButton}>
        <Ionicons color={colors.textPrimary} name="add" size={18} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  currentRow: {
    backgroundColor: "rgba(165,108,255,0.08)",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
  },
  leftColumn: {
    width: 60,
    alignItems: "center",
  },
  hour: {
    ...typography.caption,
    color: colors.textMuted,
  },
  currentHour: {
    color: colors.primary,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    marginTop: spacing.xs,
    backgroundColor: colors.borderSoft,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
