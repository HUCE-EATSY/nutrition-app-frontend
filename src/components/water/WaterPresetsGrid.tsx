import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppColors } from "@/hooks/useAppColors";
import { spacing, typography, radius } from "@/constants";

interface WaterPresetsGridProps {
  onAdd: (amount: number) => void;
}

export const WaterPresetsGrid: React.FC<WaterPresetsGridProps> = ({ onAdd }) => {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.presetsSection}>
      <Text style={styles.sectionLabel}>Thêm nhanh theo cốc/chai</Text>
      <View style={styles.presetsGrid}>
        <Pressable style={styles.presetItem} onPress={() => onAdd(150)}>
          <MaterialCommunityIcons name="cup-water" size={24} color={colors.carbs} />
          <Text style={styles.presetName}>Cốc nhỏ</Text>
          <Text style={styles.presetVal}>+150 ml</Text>
        </Pressable>
        
        <Pressable style={styles.presetItem} onPress={() => onAdd(250)}>
          <MaterialCommunityIcons name="cup" size={24} color={colors.carbs} />
          <Text style={styles.presetName}>Cốc tiêu chuẩn</Text>
          <Text style={styles.presetVal}>+250 ml</Text>
        </Pressable>

        <Pressable style={styles.presetItem} onPress={() => onAdd(500)}>
          <MaterialCommunityIcons name="bottle-wine-outline" size={24} color={colors.carbs} />
          <Text style={styles.presetName}>Chai vừa</Text>
          <Text style={styles.presetVal}>+500 ml</Text>
        </Pressable>

        <Pressable style={styles.presetItem} onPress={() => onAdd(750)}>
          <MaterialCommunityIcons name="bottle-wine" size={24} color={colors.carbs} />
          <Text style={styles.presetName}>Chai lớn</Text>
          <Text style={styles.presetVal}>+750 ml</Text>
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  presetsSection: {
    gap: spacing.md,
  },
  sectionLabel: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  presetItem: {
    width: "48%",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
    gap: 4,
  },
  presetName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  presetVal: {
    ...typography.bodyStrong,
    color: colors.carbs,
  },
});
