export const colors = {
  bgBase: '#111020',
  bgElevated: '#1C1A2C',
  surface: '#252238',
  surfaceAlt: '#302C44',
  primary: '#A56CFF',
  primaryDark: '#6D3DE6',
  primaryGradientFrom: '#9F6CFF',
  primaryGradientTo: '#B07EFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#C7C3D8',
  textMuted: '#9B97AE',
  borderSoft: 'rgba(255,255,255,0.08)',
  warning: '#F2B437',
  success: '#5CD67A',
  protein: '#FF5A5F',
  carbs: '#3D8BFF',
  fat: '#F5B323',
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 14,
  md: 20,
  lg: 24,
  xl: 28,
  pill: 999,
};

export const typography = {
  display: { fontSize: 40, lineHeight: 48, fontWeight: '700' as const },
  h1: { fontSize: 34, lineHeight: 40, fontWeight: '700' as const },
  h2: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  h3: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
};

export const shadows = {
  glow: {
    shadowColor: '#A56CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
};
