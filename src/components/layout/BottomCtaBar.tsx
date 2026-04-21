import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { GradientButton } from "@/src/components/buttons/GradientButton";
import { colors } from "@/src/theme";

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
    paddingTop: 14,
    paddingBottom: 4,
    backgroundColor: "rgba(17,16,32,0.92)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSoft,
  },
});
