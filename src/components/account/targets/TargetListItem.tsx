import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '@/hooks/useAppColors';

interface TargetListItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightIconColor?: string;
  onPress: () => void;
  showDivider?: boolean;
}

export function TargetListItem({
  icon,
  iconColor,
  title,
  rightIcon = 'chevron-forward',
  rightIconColor,
  onPress,
  showDivider = true,
}: TargetListItemProps) {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const activeIconColor = iconColor ?? colors.textPrimary;
  const activeRightIconColor = rightIconColor ?? colors.textSecondary;

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.leftGroup}>
          <Ionicons name={icon} size={24} color={activeIconColor} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Ionicons name={rightIcon} size={20} color={activeRightIconColor} />
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: 16,
  },
});
