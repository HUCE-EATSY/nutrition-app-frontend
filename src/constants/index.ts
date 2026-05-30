import { TextStyle, StyleSheet } from "react-native";
import { useSettingsStore } from "@/store/settingsStore";

// Flags & helper storage for StyleSheet interceptor
let isInsideStyleSheetCreate = false;

const originalCreate = StyleSheet.create;
(StyleSheet as any).create = function (stylesObj: any) {
  isInsideStyleSheetCreate = true;
  let rawStyles: any;
  try {
    rawStyles = originalCreate(stylesObj);
  } finally {
    isInsideStyleSheetCreate = false;
  }

  // Helper function to resolve theme tokens recursively
  function resolveThemeTokens(obj: any, theme: "dark" | "light"): any {
    if (!obj || typeof obj !== "object") {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => resolveThemeTokens(item, theme));
    }
    const resolved: any = {};
    for (const prop of Object.keys(obj)) {
      const val = obj[prop];
      if (typeof val === "string" && val.startsWith("__THEME_COLOR_")) {
        const colorKey = val.replace("__THEME_COLOR_", "").replace("__", "");
        const colorsSource = theme === "light" ? lightColors : darkColors;
        resolved[prop] = (colorsSource as any)[colorKey] ?? val;
      } else if (typeof val === "object" && val !== null) {
        resolved[prop] = resolveThemeTokens(val, theme);
      } else {
        resolved[prop] = val;
      }
    }
    return resolved;
  }

  // Return a Proxy for the created stylesheet to dynamically resolve tokens
  return new Proxy(rawStyles, {
    get(target, key) {
      const originalStyle = target[key];
      if (!originalStyle || typeof originalStyle !== "object") {
        return originalStyle;
      }
      try {
        const theme = useSettingsStore.getState().theme || "dark";
        return resolveThemeTokens(originalStyle, theme);
      } catch (err) {
        console.warn("Failed to get current theme, falling back to dark:", err);
        return resolveThemeTokens(originalStyle, "dark");
      }
    },
  });
};

export const darkColors = {
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
  border: "rgba(255,255,255,0.08)",
  info: "#3D8BFF",
  warning: "#F2B437",
  success: "#5CD67A",
  protein: "#FF5A5F",
  carbs: "#3D8BFF",
  fat: "#F5B323",
  bubble: "#F9F7FF",
  bubbleText: "#111020",
  danger: "#FF7D7D",
};

export const lightColors = {
  bgBase: "#F4F5F7",
  bgElevated: "#FFFFFF",
  surface: "#EAECEF",
  surfaceAlt: "#DFE2E6",
  primary: "#8E57F5",
  primaryStrong: "#7C44E3",
  primaryDark: "#6D3DE6",
  primaryGradientFrom: "#9F6CFF",
  primaryGradientTo: "#B07EFF",
  textPrimary: "#111020",
  textSecondary: "#4E4B66",
  textMuted: "#7B7F99",
  borderSoft: "rgba(0,0,0,0.06)",
  border: "rgba(0,0,0,0.06)",
  info: "#0066FF",
  warning: "#E69C24",
  success: "#2EAD5C",
  protein: "#FF5A5F",
  carbs: "#3D8BFF",
  fat: "#F5B323",
  bubble: "#F1EDFA",
  bubbleText: "#1C1A2C",
  danger: "#FF4D4D",
};

// colors proxy
export const colors = new Proxy({} as typeof darkColors, {
  get(target, prop: string) {
    if (isInsideStyleSheetCreate) {
      return `__THEME_COLOR_${prop}__`;
    }
    try {
      const theme = useSettingsStore.getState().theme || "dark";
      const activeColors = theme === "light" ? lightColors : darkColors;
      return (activeColors as any)[prop];
    } catch {
      return (darkColors as any)[prop];
    }
  },
});

// gradients proxy
export const gradients = new Proxy({} as {
  readonly background: readonly [string, string, string];
  readonly button: readonly [string, string];
  readonly panel: readonly [string, string];
}, {
  get(target, prop: string) {
    try {
      const theme = useSettingsStore.getState().theme || "dark";
      if (prop === "background") {
        return theme === "light"
          ? (["#EDE4FF", "#F3EEFE", "#F4F5F7"] as const)
          : (["#4A1F76", "#151124", "#111020"] as const);
      }
      if (prop === "panel") {
        return theme === "light"
          ? (["rgba(165,108,255,0.08)", "rgba(255,255,255,0.8)"] as const)
          : (["rgba(165,108,255,0.18)", "rgba(17,16,32,0.04)"] as const);
      }
      if (prop === "button") {
        return ["#9F6CFF", "#B07EFF"] as const;
      }
    } catch {
      // fallback
    }
    if (prop === "background") return ["#4A1F76", "#151124", "#111020"] as const;
    if (prop === "panel") return ["rgba(165,108,255,0.18)", "rgba(17,16,32,0.04)"] as const;
    return ["#9F6CFF", "#B07EFF"] as const;
  },
});

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
    fontFamily: "GoogleSans_700Bold",
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
  } satisfies TextStyle,
  h1: {
    fontFamily: "GoogleSans_700Bold",
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
  } satisfies TextStyle,
  h2: {
    fontFamily: "GoogleSans_700Bold",
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  } satisfies TextStyle,
  h3: {
    fontFamily: "GoogleSans_700Bold",
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.2,
  } satisfies TextStyle,
  body: {
    fontFamily: "GoogleSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,
  bodyStrong: {
    fontFamily: "GoogleSans_600SemiBold",
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,
  caption: {
    fontFamily: "GoogleSans_400Regular",
    fontSize: 12,
    lineHeight: 16,
  } satisfies TextStyle,
  number: {
    fontFamily: "GoogleSans_700Bold",
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.3,
  } satisfies TextStyle,
};

// shadows proxy
export const shadows = new Proxy({} as any, {
  get(target, prop: string) {
    try {
      const theme = useSettingsStore.getState().theme || "dark";
      const activeColors = theme === "light" ? lightColors : darkColors;
      if (prop === "glow") {
        return {
          shadowColor: activeColors.primary,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 24,
          elevation: 10,
        };
      }
      if (prop === "card") {
        return {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: theme === "light" ? 0.06 : 0.18,
          shadowRadius: 18,
          elevation: 6,
        };
      }
    } catch {
      // fallback
    }
    if (prop === "glow") {
      return {
        shadowColor: darkColors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 10,
      };
    }
    return {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.18,
      shadowRadius: 18,
      elevation: 6,
    };
  },
});

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
