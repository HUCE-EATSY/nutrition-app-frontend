import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppColors } from '@/hooks/useAppColors';
import { spacing, typography, radius } from '@/constants';

interface WaterPresetsGridProps {
  onSelect: (amount: number) => void;
  activePreset?: number;
  showPlus?: boolean;
}

export const WaterPresetsGrid: React.FC<WaterPresetsGridProps> = ({ 
  onSelect, 
  activePreset,
  showPlus = false,
}) => {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const renderVal = (val: number) => showPlus ? `+${val} ml` : `${val} ml`;

  return (
    <View style={styles.stepGrid}>
      <TouchableOpacity 
        style={[styles.stepItem, activePreset === 150 && styles.stepItemActive]} 
        onPress={() => onSelect(150)}
      >
        <MaterialCommunityIcons name="cup-water" size={24} color={activePreset === 150 ? colors.primary : colors.carbs} />
        <Text style={styles.stepName}>Cốc nhỏ</Text>
        <Text style={styles.stepVal}>{renderVal(150)}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.stepItem, activePreset === 250 && styles.stepItemActive]} 
        onPress={() => onSelect(250)}
      >
        <MaterialCommunityIcons name="cup" size={24} color={activePreset === 250 ? colors.primary : colors.carbs} />
        <Text style={styles.stepName}>Cốc tiêu chuẩn</Text>
        <Text style={styles.stepVal}>{renderVal(250)}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.stepItem, activePreset === 500 && styles.stepItemActive]} 
        onPress={() => onSelect(500)}
      >
        <MaterialCommunityIcons name="bottle-wine-outline" size={24} color={activePreset === 500 ? colors.primary : colors.carbs} />
        <Text style={styles.stepName}>Chai vừa</Text>
        <Text style={styles.stepVal}>{renderVal(500)}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.stepItem, activePreset === 750 && styles.stepItemActive]} 
        onPress={() => onSelect(750)}
      >
        <MaterialCommunityIcons name="bottle-wine" size={24} color={activePreset === 750 ? colors.primary : colors.carbs} />
        <Text style={styles.stepName}>Chai lớn</Text>
        <Text style={styles.stepVal}>{renderVal(750)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  stepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stepItem: {
    width: '48%',
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stepItemActive: {
    borderColor: colors.primary,
  },
  stepName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  stepVal: {
    ...typography.bodyStrong,
    color: colors.carbs,
  },
});
