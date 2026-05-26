import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { useAppColors } from "@/hooks/useAppColors";
import { radius, shadows } from "@/constants";

type SurfaceCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  const colors = useAppColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSoft,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 20,
    ...shadows.card,
  },
});
