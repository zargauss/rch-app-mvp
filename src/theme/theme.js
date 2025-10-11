import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Platform } from 'react-native';

const palette = {
  primary: '#005A9C',
  accent: '#4CAF50',
  background: '#F5F5F7',
  surface: '#FFFFFF',
  text: '#1F2937',
  placeholder: '#9CA3AF',
  error: '#B00020',
  outline: '#E5E7EB'
};

const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    secondary: palette.accent,
    background: palette.background,
    surface: palette.surface,
    onSurface: palette.text,
    outline: palette.outline,
    error: palette.error,
    placeholder: palette.placeholder
  },
  fonts: {
    ...DefaultTheme.fonts,
    bodyLarge: { ...DefaultTheme.fonts.bodyLarge, fontFamily: systemFont },
    bodyMedium: { ...DefaultTheme.fonts.bodyMedium, fontFamily: systemFont },
    bodySmall: { ...DefaultTheme.fonts.bodySmall, fontFamily: systemFont },
    titleLarge: { ...DefaultTheme.fonts.titleLarge, fontFamily: systemFont, fontWeight: '700' },
    titleMedium: { ...DefaultTheme.fonts.titleMedium, fontFamily: systemFont, fontWeight: '600' },
    titleSmall: { ...DefaultTheme.fonts.titleSmall, fontFamily: systemFont, fontWeight: '600' },
    labelLarge: { ...DefaultTheme.fonts.labelLarge, fontFamily: systemFont, letterSpacing: 0.5 },
    labelMedium: { ...DefaultTheme.fonts.labelMedium, fontFamily: systemFont },
    labelSmall: { ...DefaultTheme.fonts.labelSmall, fontFamily: systemFont }
  },
  roundness: 10,
  spacing: (m) => 8 * m
};

export default theme;
