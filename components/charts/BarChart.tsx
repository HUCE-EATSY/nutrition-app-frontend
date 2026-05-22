import React from "react";
import { View } from "react-native";
import Svg, { Rect, Line as SvgLine, G, Text as SvgText } from "react-native-svg";

export interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  width?: number;
  maxValue?: number;
  averageValue?: number;
  barColor?: string;
  showYAxis?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  width = 300,
  maxValue,
  averageValue,
  barColor = "#22C55E", // Default green
  showYAxis = false,
}) => {
  const padding = { top: 20, bottom: 30, left: showYAxis ? 40 : 10, right: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxDataValue = Math.max(...data.map((d) => d.value), averageValue || 0);
  const max = maxValue || (maxDataValue > 0 ? maxDataValue * 1.2 : 1); // 20% headroom

  const barWidth = chartWidth / data.length * 0.6;
  const spacing = chartWidth / data.length;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <G x={padding.left} y={padding.top}>
          {/* Average Line */}
          {averageValue !== undefined && averageValue > 0 && (
            <SvgLine
              x1={0}
              y1={chartHeight - (averageValue / max) * chartHeight}
              x2={chartWidth}
              y2={chartHeight - (averageValue / max) * chartHeight}
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / max) * chartHeight;
            const x = index * spacing + (spacing - barWidth) / 2;
            const y = chartHeight - barHeight;

            return (
              <G key={`bar-${index}`}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color || barColor}
                  rx={4}
                />
                {/* X Axis Label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  fontSize="12"
                  fill="#9CA3AF"
                  textAnchor="middle"
                >
                  {item.label}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};
