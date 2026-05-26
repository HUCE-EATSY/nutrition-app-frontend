import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { GradientButton } from "@/components/buttons/GradientButton";
import { spacing } from "@/constants";

type BottomCtaBarProps = {
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  children?: ReactNode;
};

export function BottomCtaBar({ label, onPress, disabled = false, children }: BottomCtaBarProps) {
  return (
    <View style={styles.wrap}>
      {children ?? (label && onPress ? <GradientButton disabled={disabled} label={label} onPress={onPress} /> : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
