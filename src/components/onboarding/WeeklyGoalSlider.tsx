import React, { useRef, useState, useMemo, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, PanResponder } from "react-native";

import { useTranslation } from "@/constants/i18n";
import { radius, shadows, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

type WeeklyGoalSliderProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

export function WeeklyGoalSlider({
  min,
  max,
  step,
  value,
  onChange,
}: WeeklyGoalSliderProps) {
  const t = useTranslation();
  const [trackWidth, setTrackWidth] = useState(0);
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const steps = useMemo(() => {
    return Array.from(
      { length: Math.round((max - min) / step) + 1 },
      (_, index) => Number((min + index * step).toFixed(1))
    );
  }, [min, max, step]);

  const progress = steps.length > 1 ? steps.indexOf(value) / (steps.length - 1) : 0;
  const showSlider = steps.length > 5;
  const percentage = max > min ? (value - min) / (max - min) : 0;
  const THUMB_SIZE = 28;
  const thumbPosition = percentage * trackWidth;

  const latestRefs = useRef({ trackWidth, min, max, step, onChange });
  useEffect(() => {
    latestRefs.current = { trackWidth, min, max, step, onChange };
  });

  const initialLocalX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        initialLocalX.current = evt.nativeEvent.locationX;
        updateValueFromX(initialLocalX.current);
      },
      onPanResponderMove: (evt, gestureState) => {
        const currentX = initialLocalX.current + gestureState.dx;
        updateValueFromX(currentX);
      },
    })
  ).current;

  const updateValueFromX = (localX: number) => {
    const { trackWidth: currWidth, min: currMin, max: currMax, step: currStep, onChange: currOnChange } = latestRefs.current;
    
    if (currWidth <= 0) return;
    
    const clampedX = Math.max(0, Math.min(currWidth, localX));
    const pct = clampedX / currWidth;
    const rawVal = currMin + pct * (currMax - currMin);
    
    const stepCount = Math.round((rawVal - currMin) / currStep);
    const steppedVal = currMin + stepCount * currStep;
    const finalVal = Number(Math.max(currMin, Math.min(currMax, steppedVal)).toFixed(1));
    
    currOnChange(finalVal);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.value}>
        {value.toFixed(1)} kg
        <Text style={styles.unit}> {t.onboarding.weeklyGoal.perWeek}</Text>
      </Text>

      {showSlider ? (
        <View style={[styles.track, styles.sliderTrack]}>
          <View
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            style={styles.sliderContainer}
            {...panResponder.panHandlers}
          >
            <View pointerEvents="none" style={styles.customTrack}>
              <View style={[styles.customFill, { width: `${percentage * 100}%` }]} />
            </View>
            <View
              pointerEvents="none"
              style={[
                styles.customThumb,
                { left: thumbPosition - THUMB_SIZE / 2 },
              ]}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>{min.toFixed(1)} kg</Text>
            <Text style={styles.sliderLabelText}>{max.toFixed(1)} kg</Text>
          </View>
        </View>
      ) : (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: `${colors.primary}33` }]} />
          <View style={styles.pointsRow}>
            {steps.map((stepValue) => {
              const active = stepValue <= value;
              return (
                <Pressable key={stepValue} onPress={() => onChange(stepValue)} style={styles.pointButton}>
                  <View style={[styles.point, active && styles.pointActive]} />
                  <Text style={[styles.pointLabel, active && styles.pointLabelActive]}>{stepValue.toFixed(1)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <Text style={styles.helper}>
        {t.onboarding.weeklyGoal.helper}
      </Text>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    position: "relative",
    ...shadows.card,
  },
  sliderTrack: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sliderContainer: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    position: "relative",
  },
  customTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    width: "100%",
    overflow: "hidden",
  },
  customFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  customThumb: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    top: (40 - 28) / 2,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  sliderLabelText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  fill: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    top: "50%",
    height: 6,
    borderRadius: radius.pill,
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
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pointActive: {
    backgroundColor: colors.primary,
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
