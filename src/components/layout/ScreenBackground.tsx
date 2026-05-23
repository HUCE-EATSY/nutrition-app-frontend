import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, gradients } from "@/constants";

type ScreenBackgroundProps = {
  withGlow?: boolean;
  children: ReactNode;
};

export function ScreenBackground({ withGlow = true, children }: ScreenBackgroundProps) {
  return (
    <View style={styles.root}>
      {/* Top extension for bounce overscroll */}
      <View style={styles.topExtension} />
      {/* Bottom extension for bounce overscroll */}
      <View style={styles.bottomExtension} />

      <LinearGradient colors={[...gradients.background]} style={StyleSheet.absoluteFillObject} />
      {withGlow ? (
        <>
          <View style={styles.topGlow} />
          <View style={styles.bottomGlow} />
        </>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  topExtension: {
    position: "absolute",
    top: -1000,
    height: 1000,
    left: 0,
    right: 0,
    backgroundColor: gradients.background[0],
  },
  bottomExtension: {
    position: "absolute",
    bottom: -1000,
    height: 1000,
    left: 0,
    right: 0,
    backgroundColor: gradients.background[gradients.background.length - 1],
  },
  topGlow: {
    position: "absolute",
    top: -40,
    left: -20,
    right: -20,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(165,108,255,0.16)",
    transform: [{ scaleX: 1.2 }],
  },
  bottomGlow: {
    position: "absolute",
    right: -60,
    bottom: 80,
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: "rgba(109,61,230,0.12)",
  },
});
