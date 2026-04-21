import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "@/src/i18n";
import { colors, radius, spacing, typography } from "@/src/theme";

type WeeklyGoalSliderProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  recommendedValue?: number;
  estimatedDailyCalories?: number;
  onChange: (value: number) => void;
};

export function WeeklyGoalSlider({
  min,
  max,
  step,
  value,
  recommendedValue,
  estimatedDailyCalories,
  onChange,
}: WeeklyGoalSliderProps) {
  const steps = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) => Number((min + index * step).toFixed(1)));
  const progress = steps.length > 1 ? steps.indexOf(value) / (steps.length - 1) : 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.value}>
        {value.toFixed(1)} kg
        <Text style={styles.unit}> {t.onboarding.weeklyGoal.perWeek}</Text>
      </Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        <View style={styles.pointsRow}>
          {steps.map((stepValue) => {
            const active = stepValue <= value;
            const recommended = recommendedValue !== undefined && Math.abs(stepValue - recommendedValue) < 0.01;
            return (
              <Pressable key={stepValue} onPress={() => onChange(stepValue)} style={styles.pointButton}>
                <View style={[styles.point, active && styles.pointActive, recommended && styles.pointRecommended]} />
                <Text style={[styles.pointLabel, active && styles.pointLabelActive]}>{stepValue.toFixed(1)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.helper}>
        {estimatedDailyCalories !== undefined
          ? t.onboarding.weeklyGoal.estimatedDailyCalories(estimatedDailyCalories)
          : t.onboarding.weeklyGoal.helper}
      </Text>
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
  track: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    position: "relative",
  },
  fill: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    top: "50%",
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: "rgba(165,108,255,0.2)",
    transform: [{ translateY: -3 }],
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pointButton: {
    alignItems: "center",
    gap: 8,
  },
  point: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: "#6D6880",
    borderWidth: 2,
    borderColor: "transparent",
  },
  pointActive: {
    backgroundColor: colors.primary,
  },
  pointRecommended: {
    borderColor: colors.warning,
  },
  pointLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  pointLabelActive: {
    color: colors.textPrimary,
  },
  helper: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
