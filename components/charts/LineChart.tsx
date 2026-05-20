import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, G, Text as SvgText } from "react-native-svg";

export interface LinePoint {
  label: string;
  value: number;
}

interface LineChartProps {
  actualData: LinePoint[];
  targetData?: LinePoint[];
  height?: number;
  width?: number;
  actualColor?: string;
  targetColor?: string;
  maxValue?: number;
  minValue?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  actualData,
  targetData,
  height = 200,
  width = 300,
  actualColor = "#8B5CF6", // Purple
  targetColor = "#FFFFFF", // White
  maxValue,
  minValue,
}) => {
  const padding = { top: 20, bottom: 30, left: 30, right: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = [
    ...actualData.map((d) => d.value),
    ...(targetData ? targetData.map((d) => d.value) : []),
  ];
  
  const min = minValue !== undefined ? minValue : Math.min(...allValues) * 0.9;
  const max = maxValue !== undefined ? maxValue : Math.max(...allValues) * 1.1;
  const range = max - min || 1;

  const getCoordinates = (data: LinePoint[]) => {
    return data.map((item, index) => {
      const x = (index / Math.max(1, data.length - 1)) * chartWidth;
      const y = chartHeight - ((item.value - min) / range) * chartHeight;
      return { x, y, label: item.label, value: item.value };
    });
  };

  const actualCoords = getCoordinates(actualData);
  const targetCoords = targetData ? getCoordinates(targetData) : [];

  const createPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return "";
    const path = coords.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(" ");
    return path;
  };

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <G x={padding.left} y={padding.top}>
          {/* Target Line */}
          {targetCoords.length > 0 && (
            <>
              <Path
                d={createPath(targetCoords)}
                stroke={targetColor}
                strokeWidth="2"
                fill="transparent"
                strokeDasharray="4 4"
              />
              {targetCoords.map((c, i) => (
                <Circle key={`target-dot-${i}`} cx={c.x} cy={c.y} r="3" fill={targetColor} />
              ))}
            </>
          )}

          {/* Actual Line */}
          {actualCoords.length > 0 && (
            <>
              <Path
                d={createPath(actualCoords)}
                stroke={actualColor}
                strokeWidth="3"
                fill="transparent"
              />
              {actualCoords.map((c, i) => (
                <Circle key={`actual-dot-${i}`} cx={c.x} cy={c.y} r="4" fill={actualColor} />
              ))}
            </>
          )}

          {/* X Axis Labels */}
          {actualCoords.map((c, i) => (
            <SvgText
              key={`label-${i}`}
              x={c.x}
              y={chartHeight + 20}
              fontSize="12"
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {c.label}
            </SvgText>
          ))}
        </G>
      </Svg>
    </View>
  );
};
