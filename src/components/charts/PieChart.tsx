import React from "react";
import { View } from "react-native";
import Svg, { G, Path, Circle, Text as SvgText } from "react-native-svg";

interface MacroData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: MacroData[];
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 150,
}) => {
  const radius = size / 2;
  const center = size / 2;
  
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  let currentAngle = 0;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {total === 0 ? (
            <Circle
              cx={center}
              cy={center}
              r={radius}
              fill="#374151" // Gray 700
            />
          ) : (
            data.map((item, index) => {
              if (item.value <= 0) return null;

              const percentage = item.value / total;
              const angle = percentage * 360;

              if (percentage === 1) {
                return (
                  <G key={index}>
                    <Circle cx={center} cy={center} r={radius} fill={item.color} />
                    <SvgText
                      x={center}
                      y={center}
                      fill="#FFFFFF"
                      fontSize={14}
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      transform={`rotate(90, ${center}, ${center})`}
                    >
                      100%
                    </SvgText>
                  </G>
                );
              }

              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;

              const start = polarToCartesian(center, center, radius, startAngle);
              const end = polarToCartesian(center, center, radius, endAngle);

              const largeArcFlag = angle <= 180 ? "0" : "1";

              const d = [
                "M", center, center,
                "L", start.x, start.y,
                "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y,
                "Z"
              ].join(" ");

              const midAngle = startAngle + angle / 2;
              const textPos = polarToCartesian(center, center, radius * 0.6, midAngle);

              currentAngle += angle;
              const displayPct = Math.round(percentage * 100);

              // Don't show text if slice is too small to fit the label (e.g. < 5%)
              const showText = percentage > 0.05;

              return (
                <G key={index}>
                  <Path d={d} fill={item.color} />
                  {showText && (
                    <SvgText
                      x={textPos.x}
                      y={textPos.y}
                      fill="#FFFFFF"
                      fontSize={12}
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      transform={`rotate(90, ${textPos.x}, ${textPos.y})`}
                    >
                      {`${displayPct}%`}
                    </SvgText>
                  )}
                </G>
              );
            })
          )}
        </G>
      </Svg>
    </View>
  );
};
