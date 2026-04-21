import { StyleSheet, Text, View } from "react-native";

import { BMISegment } from "@/src/types/contracts";
import { colors, radius, spacing, typography } from "@/src/theme";
import { clamp } from "@/src/utils/date";

type BMIScaleBarProps = {
  value: number;
  segments: BMISegment[];
  markerVisible?: boolean;
  showLabels?: boolean;
};

function segmentWidth(segment: BMISegment) {
  const min = segment.min ?? 0;
  const max = segment.max ?? min + 5;
  return Math.max(max - min, 1.5);
}

export function BMIScaleBar({ value, segments, markerVisible = true, showLabels = true }: BMIScaleBarProps) {
  const minValue = segments[0]?.min ?? 0;
  const maxValue = segments[segments.length - 1]?.max ?? 35;
  const progress = ((clamp(value, minValue, maxValue) - minValue) / (maxValue - minValue)) * 100;

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {segments.map((segment) => (
          <View key={segment.key} style={[styles.segment, { backgroundColor: segment.color, flex: segmentWidth(segment) }]} />
        ))}
        {markerVisible ? (
          <View style={[styles.markerWrap, { left: `${progress}%` as `${number}%` }]}>
            <View style={styles.markerLine} />
            <View style={styles.markerDot} />
          </View>
        ) : null}
      </View>

      {showLabels ? (
        <View style={styles.labels}>
          {segments.map((segment) => (
            <Text key={segment.key} style={styles.label}>
              {segment.label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  bar: {
    height: 18,
    flexDirection: "row",
    borderRadius: radius.pill,
    overflow: "hidden",
    position: "relative",
  },
  segment: {
    height: "100%",
  },
  markerWrap: {
    position: "absolute",
    top: -12,
    marginLeft: -7,
    alignItems: "center",
  },
  markerLine: {
    width: 2,
    height: 12,
    backgroundColor: colors.textPrimary,
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    borderWidth: 3,
    borderColor: colors.bgBase,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
});
