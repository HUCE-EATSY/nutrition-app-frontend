import React, { useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, G, Text as SvgText, Line } from "react-native-svg";

export interface LinePoint {
  label: string;
  value: number;
  fullDate?: string;
}

interface TooltipState {
  x: number;
  y: number;
  value: number;
  label: string;
  fullDate?: string;
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
  yUnit?: string; // e.g. "kg" or "BMI"
}

export const LineChart: React.FC<LineChartProps> = ({
  actualData,
  targetData,
  height = 220,
  width = 300,
  actualColor = "#8B5CF6",
  targetColor = "#FFFFFF",
  maxValue,
  minValue,
  yUnit = "kg",
}) => {
  const padding = { top: 20, bottom: 30, left: 36, right: 16 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<any>(null);

  const allValues = [
    ...actualData.map((d) => d.value),
    ...(targetData ? targetData.map((d) => d.value) : []),
  ];

  const min = minValue !== undefined ? minValue : Math.max(0, Math.min(...allValues) - 2);
  const max = maxValue !== undefined ? maxValue : Math.max(...allValues) + 2;
  const range = max - min || 1;

  const getCoordinates = (data: LinePoint[]) =>
    data.map((item, index) => ({
      x: data.length === 1
        ? chartWidth / 2
        : (index / (data.length - 1)) * chartWidth,
      y: chartHeight - ((item.value - min) / range) * chartHeight,
      label: item.label,
      value: item.value,
      fullDate: item.fullDate,
    }));

  const actualCoords = getCoordinates(actualData);
  const targetCoords = targetData ? getCoordinates(targetData) : [];

  const createPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return "";
    return coords.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(" ");
  };

  // Find nearest data point to a touch X position
  const findNearestPoint = (touchX: number) => {
    if (actualCoords.length === 0) return null;
    let nearest = actualCoords[0];
    let minDist = Math.abs(actualCoords[0].x - touchX);
    for (const coord of actualCoords) {
      const dist = Math.abs(coord.x - touchX);
      if (dist < minDist) {
        minDist = dist;
        nearest = coord;
      }
    }
    return nearest;
  };

  // Y-axis labels (4 ticks)
  const yTicks = [0, 0.33, 0.67, 1].map((t) =>
    parseFloat((min + t * range).toFixed(1))
  );

  return (
    <View style={{ width, height }}>
      <Svg
        width={width}
        height={height}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          const touchX = e.nativeEvent.locationX - padding.left;
          const nearest = findNearestPoint(touchX);
          if (nearest) setTooltip(nearest);
        }}
        onResponderMove={(e) => {
          const touchX = e.nativeEvent.locationX - padding.left;
          const nearest = findNearestPoint(touchX);
          if (nearest) setTooltip(nearest);
        }}
        onResponderRelease={() => {
          setTimeout(() => setTooltip(null), 1500);
        }}
      >
        <G x={padding.left} y={padding.top}>
          {/* Y-axis ticks & labels */}
          {yTicks.map((tick, i) => {
            const yPos = chartHeight - ((tick - min) / range) * chartHeight;
            return (
              <G key={`ytick-${i}`}>
                <Line
                  x1={0} y1={yPos}
                  x2={chartWidth} y2={yPos}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <SvgText
                  x={-4}
                  y={yPos + 4}
                  fontSize="10"
                  fill="#6B7280"
                  textAnchor="end"
                >
                  {tick}
                </SvgText>
              </G>
            );
          })}

          {/* Target Line (dashed) */}
          {targetCoords.length > 0 && (
            <>
              <Path
                d={createPath(targetCoords)}
                stroke={targetColor}
                strokeWidth="2"
                fill="transparent"
                strokeDasharray="5 4"
              />
            </>
          )}

          {/* Actual Line */}
          {actualCoords.length > 0 && (
            <>
              <Path
                d={createPath(actualCoords)}
                stroke={actualColor}
                strokeWidth="2.5"
                fill="transparent"
              />
              {actualCoords.map((c, i) => (
                <Circle key={`dot-${i}`} cx={c.x} cy={c.y} r="4" fill={actualColor} />
              ))}
            </>
          )}

          {/* Tooltip highlight */}
          {tooltip && (
            <>
              <Circle
                cx={tooltip.x}
                cy={tooltip.y}
                r="6"
                fill={actualColor}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <Line
                x1={tooltip.x} y1={0}
                x2={tooltip.x} y2={chartHeight}
                stroke={actualColor}
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.5"
              />
            </>
          )}

          {/* X Axis Labels */}
          {actualCoords.map((c, i) => {
            // Only show every Nth label to avoid crowding
            const step = Math.ceil(actualCoords.length / 7);
            if (i % step !== 0 && i !== actualCoords.length - 1) return null;
            return (
              <SvgText
                key={`label-${i}`}
                x={c.x}
                y={chartHeight + 20}
                fontSize="10"
                fill="#6B7280"
                textAnchor="middle"
              >
                {c.label}
              </SvgText>
            );
          })}
        </G>
      </Svg>

      {/* Tooltip overlay (native View for proper text rendering) */}
      {tooltip && (
        <View
          style={[
            styles.tooltip,
            {
              left: padding.left + tooltip.x - 40,
              top: padding.top + tooltip.y - 52,
            },
          ]}
        >
          <Text style={styles.tooltipValue}>{tooltip.value} {yUnit}</Text>
          <Text style={styles.tooltipDate}>{tooltip.fullDate ?? tooltip.label}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    backgroundColor: "#1E1B2E",
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 80,
    alignItems: "center",
    zIndex: 10,
  },
  tooltipValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  tooltipDate: {
    color: "#9CA3AF",
    fontSize: 11,
  },
});
