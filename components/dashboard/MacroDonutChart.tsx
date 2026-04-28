import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import { t } from "@/constants/i18n";
import { colors, spacing, typography } from "@/constants";

type MacroDonutChartProps = {
  calories: number;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
  proteinGram: number;
  carbGram: number;
  fatGram: number;
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
}: MacroDonutChartProps) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const proteinLength = (proteinPct / 100) * circumference;
  const carbLength = (carbPct / 100) * circumference;

  return (
    <View style={styles.wrap}>
      <View style={styles.chartWrap}>
        <Svg height="128" width="128" viewBox="0 0 128 128">
          <G rotation="-90" origin="64, 64">
            <Circle cx="64" cy="64" fill="none" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
            <Arc circumference={circumference} offset={0} percentage={proteinPct} radius={radius} stroke={colors.protein} />
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
        <Text style={styles.legendItem}>{t.macros.protein} {proteinGram}g</Text>
        <Text style={[styles.legendItem, { color: colors.carbs }]}>{t.macros.carb} {carbGram}g</Text>
        <Text style={[styles.legendItem, { color: colors.fat }]}>{t.macros.fat} {fatGram}g</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
