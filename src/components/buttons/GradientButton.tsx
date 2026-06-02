import React, { useMemo } from "react";
import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { gradients, radius, shadows, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

type GradientButtonProps = {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function GradientButton({
  label,
  disabled = false,
  loading = false,
  iconLeft,
  onPress,
  style,
  testID,
}: GradientButtonProps) {
  const inactive = disabled || loading;
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Use a light or dark inactive color representation based on the theme colors.surfaceAlt
  const inactiveGradient = [colors.surfaceAlt, colors.surfaceAlt] as const;

  return (
    <Pressable
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.wrapper, style, pressed && !inactive ? styles.pressed : undefined]}
      testID={testID}
    >
      <LinearGradient
        colors={inactive ? inactiveGradient : [...gradients.button]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.inner}
      >
        {loading ? <ActivityIndicator color={colors.textPrimary} /> : null}
        {!loading && iconLeft ? iconLeft : null}
        {!loading ? <Text style={[styles.label, inactive && styles.inactiveLabel]}>{label}</Text> : null}
      </LinearGradient>
    </Pressable>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.glow,
  },
  inner: {
    minHeight: 58,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
  },
  label: {
    ...typography.h3,
    color: "#FFFFFF",
    flexShrink: 1,
    textAlign: "center",
  },
  inactiveLabel: {
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
});
