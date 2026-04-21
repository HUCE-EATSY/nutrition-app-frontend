import { TextStyle, ViewStyle } from "react-native";

export const colors = {
  bgBase: "#111020",
  bgElevated: "#1C1A2C",
  surface: "#252238",
  surfaceAlt: "#302C44",
  primary: "#A56CFF",
  primaryStrong: "#8E57F5",
  primaryDark: "#6D3DE6",
  primaryGradientFrom: "#9F6CFF",
  primaryGradientTo: "#B07EFF",
  textPrimary: "#FFFFFF",
  textSecondary: "#C7C3D8",
  textMuted: "#9B97AE",
  borderSoft: "rgba(255,255,255,0.08)",
  warning: "#F2B437",
  success: "#5CD67A",
  protein: "#FF5A5F",
  carbs: "#3D8BFF",
  fat: "#F5B323",
  bubble: "#F9F7FF",
  bubbleText: "#111020",
  danger: "#FF7D7D",
};

export const gradients = {
  background: ["#4A1F76", "#151124", "#111020"] as const,
  button: ["#9F6CFF", "#B07EFF"] as const,
  panel: ["rgba(165,108,255,0.18)", "rgba(17,16,32,0.04)"] as const,
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radius = {
  sm: 14,
  md: 20,
  lg: 24,
  xl: 28,
  pill: 999,
};

export const typography = {
  display: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "700",
    letterSpacing: -0.7,
  } satisfies TextStyle,
  h1: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.5,
  } satisfies TextStyle,
  h2: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.4,
  } satisfies TextStyle,
  h3: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  } satisfies TextStyle,
  body: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "400",
  } satisfies TextStyle,
  bodyStrong: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
  } satisfies TextStyle,
  caption: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  } satisfies TextStyle,
  number: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
  } satisfies TextStyle,
};

export const shadows = {
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  } satisfies ViewStyle,
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  } satisfies ViewStyle,
};

export const layout = {
  screenPadding: spacing.xl,
  safeBottom: spacing.xl,
  maxCardWidth: 480,
};

export const theme = {
  colors,
  gradients,
  spacing,
  radius,
  typography,
  shadows,
  layout,
};
