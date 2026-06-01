import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export interface MacroRingData {
  value: number;
  color: string;
}

interface MacroRingChartProps {
  data: MacroRingData[];
  size?: number;
  strokeWidth?: number;
}

export function MacroRingChart({
  data,
  size = 120,
  strokeWidth = 8,
}: MacroRingChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const total = data.reduce((acc, item) => acc + item.value, 0);

  let currentAngle = -90; // Start at the top

  return (
    <View style={[{ width: size, height: size }, styles.container]}>
      <Svg width={size} height={size}>
        {/* Background Track */}
        <Circle
          stroke="#2D274E"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {total > 0 &&
          data.map((item, index) => {
            if (item.value <= 0) return null;
            
            const percentage = item.value / total;
            const strokeDashoffset = circumference - percentage * circumference;
            const rotation = currentAngle;

            // Increment the angle for the next segment
            currentAngle += percentage * 360;

            return (
              <Circle
                key={index}
                stroke={item.color}
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              />
            );
          })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
