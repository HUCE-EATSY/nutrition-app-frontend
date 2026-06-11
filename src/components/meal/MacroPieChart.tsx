import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, G, Circle } from "react-native-svg";
import { spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

// Helper để tính toán Path cho hình quạt (Pie slice)
const createPieSlice = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) => {
  const startAngleRad = (Math.PI * (startAngle - 90)) / 180;
  const endAngleRad = (Math.PI * (endAngle - 90)) / 180;

  const x1 = cx + r * Math.cos(startAngleRad);
  const y1 = cy + r * Math.sin(startAngleRad);
  const x2 = cx + r * Math.cos(endAngleRad);
  const y2 = cy + r * Math.sin(endAngleRad);

  // Cờ large-arc: nếu góc quét > 180 thì bằng 1, ngược lại 0
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  // Lệnh M: Move đến tâm
  // Lệnh L: Vẽ đường thẳng ra biên (x1, y1)
  // Lệnh A: Vẽ cung tròn (Arc) đến (x2, y2)
  // Lệnh Z: Đóng Path (về lại tâm)
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

export function MacroPieChart({ calories, protein, carbs, fat }: Props) {
  const colors = useAppColors();

  const totalMacros = protein + carbs + fat;
  // Tránh chia cho 0
  const pPct = totalMacros > 0 ? protein / totalMacros : 0;
  const cPct = totalMacros > 0 ? carbs / totalMacros : 0;
  const fPct = totalMacros > 0 ? fat / totalMacros : 0;

  const pAngle = pPct * 360;
  const cAngle = cPct * 360;
  const fAngle = fPct * 360;

  const size = 120;
  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  // Xoay các lát cắt
  const pStart = 0;
  const pEnd = pAngle;
  const cStart = pEnd;
  const cEnd = pEnd + cAngle;
  const fStart = cEnd;
  const fEnd = cEnd + fAngle;

  const pColor = "#FF3B30"; // Đỏ Đạm
  const cColor = "#34C759"; // Xanh Carbs
  const fColor = "#FFCC00"; // Vàng Fat

  return (
    <View style={[styles.container, { borderColor: colors.border ?? "#444" }]}>
      {/* Chart Section */}
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size}>
          <G>
            {/* Nếu total = 0, vẽ vòng xám */}
            {totalMacros === 0 ? (
              <Circle cx={cx} cy={cy} r={radius} fill={colors.borderSoft} />
            ) : (
              <>
                {pPct > 0 && <Path d={createPieSlice(cx, cy, radius, pStart, pEnd)} fill={pColor} />}
                {cPct > 0 && <Path d={createPieSlice(cx, cy, radius, cStart, cEnd)} fill={cColor} />}
                {fPct > 0 && <Path d={createPieSlice(cx, cy, radius, fStart, fEnd)} fill={fColor} />}
              </>
            )}
            {/* Donut hole */}
            <Circle cx={cx} cy={cy} r={radius * 0.65} fill={colors.bgBase} />
          </G>
        </Svg>
        <View style={styles.centerTextContainer}>
          <Text style={[styles.centerCalories, { color: colors.textPrimary }]}>
            {Math.round(calories)}
          </Text>
          <Text style={styles.centerLabel}>calo</Text>
        </View>
      </View>

      {/* Legend Section */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <Ionicons name="flash" size={12} color={pColor} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            {Math.round(protein)}g Đạm
          </Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="leaf" size={12} color={cColor} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            {Math.round(carbs)}g Tinh bột
          </Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="water" size={12} color={fColor} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            {Math.round(fat)}g Béo
          </Text>
        </View>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.xl,
  },
  chartWrapper: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  centerTextContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  centerCalories: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: "800",
  },
  centerLabel: {
    ...typography.caption,
    fontSize: 13,
    color: "#888",
  },
  legendContainer: {
    flex: 1,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
});
