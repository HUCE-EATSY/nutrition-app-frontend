import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius, shadows } from "@/constants";

type SurfaceCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 20,
    ...shadows.card,
  },
});
