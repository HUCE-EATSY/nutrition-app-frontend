import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";
import { clamp, roundToStep } from "@/src/utils/date";

type HorizontalRulerPickerProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  majorTickEvery: number;
  decimalPlaces?: number;
  onChange: (value: number) => void;
};

export function HorizontalRulerPicker({
  min,
  max,
  step,
  value,
  unit,
  majorTickEvery,
  decimalPlaces = 0,
  onChange,
}: HorizontalRulerPickerProps) {
  const safeValue = clamp(value, min, max);
  const values = Array.from({ length: 11 }, (_, index) => roundToStep(safeValue + (index - 5) * step, step)).filter(
    (next) => next >= min && next <= max,
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.value}>
        {safeValue.toFixed(decimalPlaces)}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
      <Text style={styles.subtle}>Chon bang ruler tung buoc, uu tien thao tac mot tay.</Text>

      <View style={styles.controls}>
        <Pressable onPress={() => onChange(roundToStep(clamp(safeValue - step, min, max), step))} style={styles.controlButton}>
          <Ionicons color={colors.textPrimary} name="remove" size={20} />
        </Pressable>
        <View style={styles.ruler}>
          {values.map((tickValue) => {
            const selected = Math.abs(tickValue - safeValue) < step / 2;
            const major = Math.round((tickValue - min) / step) % majorTickEvery === 0;

            return (
              <Pressable key={tickValue} onPress={() => onChange(tickValue)} style={styles.tickWrap}>
                <View style={[styles.tick, major && styles.majorTick, selected && styles.selectedTick]} />
                <Text style={[styles.tickLabel, selected && styles.selectedLabel]}>{tickValue.toFixed(decimalPlaces)}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => onChange(roundToStep(clamp(safeValue + step, min, max), step))} style={styles.controlButton}>
          <Ionicons color={colors.textPrimary} name="add" size={20} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  value: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: "center",
  },
  unit: {
    ...typography.h3,
    color: colors.textMuted,
  },
  subtle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  ruler: {
    flex: 1,
    minHeight: 124,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.lg,
  },
  tickWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  tick: {
    width: 2,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: "#746E90",
  },
  majorTick: {
    height: 42,
  },
  selectedTick: {
    height: 64,
    width: 3,
    backgroundColor: colors.primary,
  },
  tickLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  selectedLabel: {
    color: colors.textPrimary,
  },
});
