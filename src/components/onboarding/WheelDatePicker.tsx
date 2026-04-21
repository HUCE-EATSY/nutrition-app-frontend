import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "@/src/i18n";
import { colors, radius, spacing, typography } from "@/src/theme";
import { clamp } from "@/src/utils/date";

type WheelDatePickerProps = {
  day: number;
  month: number;
  year: number;
  minYear: number;
  maxYear: number;
  onChange: (next: { day: number; month: number; year: number }) => void;
};

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function WheelColumn({
  label,
  value,
  onDecrement,
  onIncrement,
}: {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>
      <Pressable onPress={onDecrement} style={styles.arrowButton}>
        <Ionicons color={colors.textPrimary} name="chevron-up" size={18} />
      </Pressable>
      <View style={styles.valueFrame}>
        <Text style={styles.valueText}>{value}</Text>
      </View>
      <Pressable onPress={onIncrement} style={styles.arrowButton}>
        <Ionicons color={colors.textPrimary} name="chevron-down" size={18} />
      </Pressable>
    </View>
  );
}

export function WheelDatePicker({ day, month, year, minYear, maxYear, onChange }: WheelDatePickerProps) {
  const maxDay = getDaysInMonth(month, year);

  return (
    <View style={styles.wrap}>
      <WheelColumn
        label={t.onboarding.wheelDate.day}
        value={`${day}`.padStart(2, "0")}
        onDecrement={() => onChange({ day: clamp(day - 1, 1, maxDay), month, year })}
        onIncrement={() => onChange({ day: clamp(day + 1, 1, maxDay), month, year })}
      />
      <WheelColumn
        label={t.onboarding.wheelDate.month}
        value={`${month}`.padStart(2, "0")}
        onDecrement={() => {
          const nextMonth = clamp(month - 1, 1, 12);
          onChange({ day: clamp(day, 1, getDaysInMonth(nextMonth, year)), month: nextMonth, year });
        }}
        onIncrement={() => {
          const nextMonth = clamp(month + 1, 1, 12);
          onChange({ day: clamp(day, 1, getDaysInMonth(nextMonth, year)), month: nextMonth, year });
        }}
      />
      <WheelColumn
        label={t.onboarding.wheelDate.year}
        value={`${year}`}
        onDecrement={() => onChange({ day, month, year: clamp(year - 1, minYear, maxYear) })}
        onIncrement={() => onChange({ day, month, year: clamp(year + 1, minYear, maxYear) })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: spacing.md,
  },
  column: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  columnLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  valueFrame: {
    minHeight: 92,
    minWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    ...typography.h1,
    color: colors.textPrimary,
  },
});
