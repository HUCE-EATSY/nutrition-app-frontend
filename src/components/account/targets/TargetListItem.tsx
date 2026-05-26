import React from 'react';
import { colors } from "@/constants";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  iconColor = colors.textPrimary,
  title,
  rightIcon = 'chevron-forward',
  rightIconColor = colors.textSecondary,
  onPress,
  showDivider = true,
}: TargetListItemProps) {
  return (
    <>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.leftGroup}>
          <Ionicons name={icon} size={24} color={iconColor} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Ionicons name={rightIcon} size={20} color={rightIconColor} />
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
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
