import React, { memo } from "react";
import { View } from "react-native";
import Svg, { Rect, Line as SvgLine, G, Text as SvgText, Circle } from "react-native-svg";
import { useAppColors } from "@/hooks/useAppColors";

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
  showAveragePill?: boolean;
}

export const BarChart: React.FC<BarChartProps> = memo(({
  data,
  height = 200,
  width = 300,
  maxValue,
  averageValue,
  barColor = "#22C55E", // Default green
  showYAxis = false,
  showAveragePill = false,
}) => {
  const colors = useAppColors();
  const theme = colors.primary === "#A56CFF" ? "dark" : "light";
  const padding = { top: 20, bottom: 30, left: showYAxis ? 48 : 10, right: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxDataValue = Math.max(...data.map((d) => d.value), averageValue || 0);
  
  // Hàm tính toán giới hạn mốc tối đa tròn trịa
  const getNiceMax = (val: number) => {
    if (val <= 10) return 10;
    if (val <= 100) return Math.ceil(val / 10) * 10;
    if (val <= 1000) return Math.ceil(val / 100) * 100;
    if (val <= 10000) return Math.ceil(val / 1000) * 1000;
    return Math.ceil(val / 5000) * 5000;
  };

  const max = maxValue || getNiceMax(maxDataValue || 1000);

  // Tạo các mốc trục Y
  const yTicks: number[] = [];
  const tickCount = 7;
  for (let i = 0; i < tickCount; i++) {
    yTicks.push(Math.round((i / (tickCount - 1)) * max));
  }

  const formatYLabel = (val: number) => {
    if (val >= 1000) {
      const kVal = val / 1000;
      return `${Number(kVal.toFixed(1))}K`;
    }
    return val.toString();
  };

  const barWidth = data.length > 0 ? (chartWidth / data.length) * 0.45 : 15;
  const spacing = data.length > 0 ? chartWidth / data.length : 30;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <G x={padding.left} y={padding.top}>
          {/* Grid lines & Y Axis Labels */}
          {showYAxis && yTicks.map((tick, i) => {
            const yPos = chartHeight - (tick / max) * chartHeight;
            return (
              <G key={`ytick-${i}`}>
                <SvgLine
                  x1={0}
                  y1={yPos}
                  x2={chartWidth}
                  y2={yPos}
                  stroke={theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={-12}
                  y={yPos + 4}
                  fontSize="10"
                  fill="#9CA3AF"
                  textAnchor="end"
                >
                  {formatYLabel(tick)}
                </SvgText>
              </G>
            );
          })}

          {/* Average Line */}
          {averageValue !== undefined && averageValue > 0 && (
            <G>
              <SvgLine
                x1={0}
                y1={chartHeight - (averageValue / max) * chartHeight}
                x2={chartWidth}
                y2={chartHeight - (averageValue / max) * chartHeight}
                stroke={theme === "dark" ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)"}
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              
              {showAveragePill && (
                <G>
                  <Rect
                    x={-48}
                    y={chartHeight - (averageValue / max) * chartHeight - 10}
                    width={44}
                    height={20}
                    rx={10}
                    fill={theme === "dark" ? "#FFFFFF" : colors.primary}
                  />
                  <SvgText
                    x={-26}
                    y={chartHeight - (averageValue / max) * chartHeight + 4}
                    fill={theme === "dark" ? "#000000" : "#FFFFFF"}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {Math.round(averageValue)}
                  </SvgText>
                  <Circle
                    cx={-2}
                    cy={chartHeight - (averageValue / max) * chartHeight}
                    r={3.5}
                    fill={colors.info}
                    stroke={theme === "dark" ? "#FFFFFF" : colors.bgElevated}
                    strokeWidth={1}
                  />
                </G>
              )}
            </G>
          )}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / max) * chartHeight;
            const x = index * spacing + (spacing - barWidth) / 2;
            const y = chartHeight - barHeight;
            const finalRx = Math.min(6, barHeight / 2);

            // Hide overlapping labels in monthly view
            let showLabel = true;
            let displayLabel = item.label;

            if (data.length > 20) {
              const parts = item.label.split("/");
              const dayStr = parts[0];
              const dayNum = parseInt(dayStr, 10);
              const isLast = index === data.length - 1;
              if (!isNaN(dayNum)) {
                if ([1, 5, 10, 15, 20, 25].includes(dayNum) || isLast) {
                  displayLabel = dayStr.padStart(2, "0");
                } else {
                  showLabel = false;
                }
              }
            }

            return (
              <G key={`bar-${index}`}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color || barColor}
                  rx={finalRx}
                />
                {showLabel && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={chartHeight + 20}
                    fontSize="12"
                    fill="#9CA3AF"
                    textAnchor="middle"
                  >
                    {displayLabel}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
});
