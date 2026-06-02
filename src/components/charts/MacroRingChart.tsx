import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/constants";

interface MacroRingChartProps {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  proteinColor: string;
  carbsColor: string;
  fatColor: string;
  size?: number;
  strokeWidth?: number;
  calories: number;
  iconColor: string;
  textColor: string;
}

export function MacroRingChart({
  proteinPct,
  carbsPct,
  fatPct,
  proteinColor,
  carbsColor,
  fatColor,
  size = 120,
  strokeWidth = 8,
  calories,
  iconColor,
  textColor,
}: MacroRingChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const getOffset = (pct: number) => circumference - (pct / 100) * circumference;

  const proteinAngle = (proteinPct / 100) * 360;
  const carbsAngle = (carbsPct / 100) * 360;

  return (
    <View style={styles.chartContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track (optional) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Protein Segment */}
        {proteinPct > 0 && (
          <G origin={`${size / 2}, ${size / 2}`} rotation="-90">
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={proteinColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={getOffset(proteinPct)}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        )}

        {/* Carbs Segment */}
        {carbsPct > 0 && (
          <G origin={`${size / 2}, ${size / 2}`} rotation={-90 + proteinAngle}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={carbsColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={getOffset(carbsPct)}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        )}

        {/* Fat Segment */}
        {fatPct > 0 && (
          <G origin={`${size / 2}, ${size / 2}`} rotation={-90 + proteinAngle + carbsAngle}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={fatColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={getOffset(fatPct)}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        )}
      </Svg>

      <View style={styles.chartCenter}>
        <Ionicons color={iconColor} name="flame" size={20} />
        <Text 
          style={[styles.calorieValue, { color: textColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {Math.round(calories).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenter: {
    position: "absolute",
    alignItems: "center",
  },
  calorieValue: {
    ...typography.h1,
    fontSize: 18,
  },
});
