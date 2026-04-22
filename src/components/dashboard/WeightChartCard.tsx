import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path, Circle, Line } from "react-native-svg";

import { t } from "@/src/i18n";
import { colors, spacing, typography, radius } from "@/src/theme";
import { SurfaceCard } from "../common/SurfaceCard";

export function WeightChartCard() {
  // Simple mock chart line
  const d = "M0 60 L50 60 L100 58 L150 55 L200 55 L250 55 L300 55";

  return (
    <SurfaceCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="scale" size={20} color={colors.warning} />
          <Text style={styles.title}>{t.home.weightTitle}</Text>
        </View>
      </View>

      <View style={styles.main}>
        <View>
          <Text style={styles.weightValue}>54.3 {t.home.kgSuffix}</Text>
          <Text style={styles.date}>19 Th 04, 2026</Text>
        </View>
        <TouchableOpacity style={styles.updateBtn}>
          <Text style={styles.updateText}>{t.home.update}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartArea}>
         {/* Simple Grid and Line to mimic the image */}
         <Svg height="80" width="100%" viewBox="0 0 300 80">
            <Line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" />
            <Line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.05)" />
            <Line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.05)" />
            
            <Path d={d} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
            <Circle cx="50" cy="60" r="4" fill={colors.textPrimary} stroke={colors.surfaceAlt} strokeWidth="2" />
            <Text style={[styles.chartPointLabel, { position: 'absolute', left: 40, bottom: 20 }]}>53.9</Text>
         </Svg>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  main: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  weightValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  updateBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  updateText: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  chartArea: {
    height: 80,
    marginTop: spacing.sm,
    justifyContent: "center",
  },
  chartPointLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },
});
