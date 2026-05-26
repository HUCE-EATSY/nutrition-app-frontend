import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAppColors } from "@/hooks/useAppColors";
import { useSettingsStore } from "@/store/settingsStore";

type ScreenBackgroundProps = {
  withGlow?: boolean;
  children: ReactNode;
};

export function ScreenBackground({ withGlow = true, children }: ScreenBackgroundProps) {
  const colors = useAppColors();
  const theme = useSettingsStore((state) => state.theme);

  const bgGradient = theme === "dark" 
    ? (["#4A1F76", "#151124", "#111020"] as const)
    : (["#EDE4FF", "#F3EEFE", "#F4F5F7"] as const);

  const topGlowColor = theme === "dark" ? "rgba(165,108,255,0.16)" : "rgba(165,108,255,0.08)";
  const bottomGlowColor = theme === "dark" ? "rgba(109,61,230,0.12)" : "rgba(109,61,230,0.06)";

  return (
    <View style={[styles.root, { backgroundColor: colors.bgBase }]}>
      {/* Top extension for bounce overscroll */}
      <View style={[styles.topExtension, { backgroundColor: bgGradient[0] }]} />
      {/* Bottom extension for bounce overscroll */}
      <View style={[styles.bottomExtension, { backgroundColor: bgGradient[bgGradient.length - 1] }]} />

      <LinearGradient colors={bgGradient} style={StyleSheet.absoluteFillObject} />
      {withGlow ? (
        <>
          <View style={[styles.topGlow, { backgroundColor: topGlowColor }]} />
          <View style={[styles.bottomGlow, { backgroundColor: bottomGlowColor }]} />
        </>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topExtension: {
    position: "absolute",
    top: -1000,
    height: 1000,
    left: 0,
    right: 0,
  },
  bottomExtension: {
    position: "absolute",
    bottom: -1000,
    height: 1000,
    left: 0,
    right: 0,
  },
  topGlow: {
    position: "absolute",
    top: -40,
    left: -20,
    right: -20,
    height: 240,
    borderRadius: 240,
    transform: [{ scaleX: 1.2 }],
  },
  bottomGlow: {
    position: "absolute",
    right: -60,
    bottom: 80,
    width: 200,
    height: 200,
    borderRadius: 200,
  },
});
