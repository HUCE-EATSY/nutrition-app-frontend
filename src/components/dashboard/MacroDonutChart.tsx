import React, { useMemo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useRouter } from "expo-router";

import { useTranslation } from "@/constants/i18n";
import { spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

type MacroDonutChartProps = {
  calories: number;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
  proteinGram: number;
  carbGram: number;
  fatGram: number;
  /** When true, the macro legend items are not tappable (no router.push). Use in onboarding. */
  disablePress?: boolean;
};

function Arc({
  percentage,
  stroke,
  radius,
  circumference,
  offset,
}: {
  percentage: number;
  stroke: string;
  radius: number;
  circumference: number;
  offset: number;
}) {
  return (
    <Circle
      cx="64"
      cy="64"
      fill="none"
      r={radius}
      stroke={stroke}
      strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
      strokeDashoffset={offset}
      strokeLinecap="round"
      strokeWidth="14"
    />
  );
}

export function MacroDonutChart({
  calories,
  proteinPct,
  carbPct,
  fatPct,
  proteinGram,
  carbGram,
  fatGram,
  disablePress = false,
}: MacroDonutChartProps) {
  const t = useTranslation();
  const router = useRouter();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const proteinLength = (proteinPct / 100) * circumference;
  const carbLength = (carbPct / 100) * circumference;

  const trackColor =
    colors.primary === "#A56CFF"
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.06)";

  return (
    <View style={styles.wrap}>
      <View style={styles.chartWrap}>
        <Svg height="128" width="128" viewBox="0 0 128 128">
          <G rotation="-90" origin="64, 64">
            <Circle
              cx="64"
              cy="64"
              fill="none"
              r={radius}
              stroke={trackColor}
              strokeWidth="14"
            />
            <Arc
              circumference={circumference}
              offset={0}
              percentage={proteinPct}
              radius={radius}
              stroke={colors.protein}
            />
            <Arc
              circumference={circumference}
              offset={-proteinLength}
              percentage={carbPct}
              radius={radius}
              stroke={colors.carbs}
            />
            <Arc
              circumference={circumference}
              offset={-(proteinLength + carbLength)}
              percentage={fatPct}
              radius={radius}
              stroke={colors.fat}
            />
          </G>
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={styles.centerValue}>{calories}</Text>
          <Text style={styles.centerUnit}>{t.macros.caloriesPerDay}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {disablePress ? (
          <>
            <Text style={styles.legendItem}>
              {t.macros.protein} {proteinGram}g
            </Text>
            <Text style={[styles.legendItem, { color: colors.carbs }]}>
              {t.macros.carb} {carbGram}g
            </Text>
            <Text style={[styles.legendItem, { color: colors.fat }]}>
              {t.macros.fat} {fatGram}g
            </Text>
          </>
        ) : (
          <>
            <Pressable onPress={() => router.push("/guide/protein")}>
              <Text style={styles.legendItem}>
                {t.macros.protein} {proteinGram}g
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push("/guide/carb")}>
              <Text style={[styles.legendItem, { color: colors.carbs }]}>
                {t.macros.carb} {carbGram}g
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push("/guide/fat")}>
              <Text style={[styles.legendItem, { color: colors.fat }]}>
                {t.macros.fat} {fatGram}g
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    wrap: {
      alignItems: "center",
      gap: spacing.lg,
    },
    chartWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
    centerLabel: {
      position: "absolute",
      alignItems: "center",
    },
    centerValue: {
      ...typography.number,
      color: colors.textPrimary,
    },
    centerUnit: {
      ...typography.caption,
      color: colors.textMuted,
    },
    legend: {
      width: "100%",
      gap: spacing.sm,
    },
    legendItem: {
      ...typography.bodyStrong,
      color: colors.protein,
      textAlign: "center",
    },
  });
