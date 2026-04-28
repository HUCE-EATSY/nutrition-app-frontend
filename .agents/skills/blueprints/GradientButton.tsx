import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, typography } from './dnt_theme';

type GradientButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function GradientButton({
  label,
  onPress,
  disabled = false,
  style,
}: GradientButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.wrapper, style, disabled && styles.disabled]}>
      <LinearGradient
        colors={
          disabled
            ? ['#2B273E', '#2B273E']
            : [colors.primaryGradientFrom, colors.primaryGradientTo]
        }
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.inner}
      >
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  inner: {
    minHeight: 58,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  disabled: {
    opacity: 0.7,
  },
  labelDisabled: {
    color: '#8E89A6',
  },
});
