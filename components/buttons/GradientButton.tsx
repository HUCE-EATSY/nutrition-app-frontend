import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, gradients, radius, shadows, typography } from "@/constants";

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

  return (
    <Pressable
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.wrapper, style, pressed && !inactive ? styles.pressed : undefined]}
      testID={testID}
    >
      <LinearGradient
        colors={inactive ? ["#2B273E", "#2B273E"] : [...gradients.button]}
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

const styles = StyleSheet.create({
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
    color: colors.textPrimary,
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
