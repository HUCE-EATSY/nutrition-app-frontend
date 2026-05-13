import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

interface MacroData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: MacroData[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSubLabel?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 150,
  strokeWidth = 15,
  centerLabel,
  centerSubLabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  let currentOffset = 0;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {total === 0 ? (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#374151" // Gray 700
              strokeWidth={strokeWidth}
              fill="transparent"
            />
          ) : (
            data.map((item, index) => {
              const strokeDasharray = `${circumference} ${circumference}`;
              const percentage = item.value / total;
              const strokeDashoffset = circumference - percentage * circumference;
              
              const offsetPercentage = currentOffset / total;
              const rotation = offsetPercentage * 360;
              
              currentOffset += item.value;

              return (
                <G key={index} rotation={rotation} origin={`${size / 2}, ${size / 2}`}>
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </G>
              );
            })
          )}
        </G>
      </Svg>
      {(centerLabel || centerSubLabel) && (
        <View style={[StyleSheet.absoluteFill, styles.centerContainer]}>
          {centerLabel && <Text style={styles.centerLabel}>{centerLabel}</Text>}
          {centerSubLabel && <Text style={styles.centerSubLabel}>{centerSubLabel}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  centerSubLabel: {
    color: "#9CA3AF",
    fontSize: 14,
  },
});
