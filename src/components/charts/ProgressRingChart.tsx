import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingChartProps {
  percentage: number;
  color: string;
  label?: string;
  size?: number;
  strokeWidth?: number;
  showPercentageText?: boolean;
}

export function ProgressRingChart({
  percentage,
  color,
  label,
  size = 60,
  strokeWidth = 6,
  showPercentageText = true,
}: ProgressRingChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size} style={styles.svg}>
          <Circle
            stroke="#2D274E"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={color}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {showPercentageText && (
          <View style={styles.centerTextContainer}>
            <Text style={styles.percentageText}>{percentage}%</Text>
          </View>
        )}
      </View>
      {label && <Text style={styles.labelText}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  svg: {
    position: 'absolute',
  },
  centerTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  labelText: {
    color: '#9E9E9E',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
