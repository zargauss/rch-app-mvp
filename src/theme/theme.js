import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Platform } from 'react-native';
import designSystem from './designSystem';

const { colors, typography } = designSystem;

const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[500],
    primaryContainer: colors.primary[100],
    secondary: colors.secondary[500],
    secondaryContainer: colors.secondary[100],
    background: colors.background.primary,
    surface: colors.background.tertiary,
    surfaceVariant: colors.background.secondary,
    onPrimary: colors.text.inverse,
    onSecondary: colors.text.inverse,
    onBackground: colors.text.primary,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    outline: colors.border.medium,
    outlineVariant: colors.border.light,
    error: colors.health.danger.main,
    placeholder: colors.text.tertiary,
    // Couleurs sémantiques personnalisées
    success: colors.health.excellent.main,
    warning: colors.health.moderate.main,
    info: colors.primary[500],
  },
  fonts: {
    ...DefaultTheme.fonts,
    // Titre d'écran (H1)
    displayLarge: {
      fontFamily: systemFont,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize['3xl'],
      lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
      letterSpacing: -0.5,
    },
    // Titre de section (H2)
    displayMedium: {
      fontFamily: systemFont,
      fontWeight: typography.fontWeight.semiBold,
      fontSize: typography.fontSize['2xl'],
      lineHeight: typography.fontSize['2xl'] * typography.lineHeight.normal,
      letterSpacing: 0,
    },
    // Titre de carte (H3)
    headlineLarge: {
      fontFamily: systemFont,
      fontWeight: typography.fontWeight.semiBold,
      fontSize: typography.fontSize.xl,
      lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
      letterSpacing: 0,
    },
    // Sous-titre
    headlineSmall: {
      fontFamily: systemFont,
      fontWeight: typography.fontWeight.semiBold,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
      letterSpacing: 0,
    },
    // Corps de texte principal
    bodyLarge: {
      fontFamily: systemFont,
      fontWeight: typography.fontWeight.regular,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
      letterSpacing: 0.15,
    },
    // Corps de texte secondaire
    bodyMedium: {
      fontFamily: systemFont,
      fontWeight: typography.fontWeight.regular,
      fontSize: typography.fontSize.base,
      lineHeight: typography.fontSize.base * typography.lineHeight.normal,
      letterSpacing: 0.25,
    },
    // Légende et texte petit
    labelMedium: {
      fontFamily: systemFont,
      fontWeight: typography.fontWeight.medium,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
      letterSpacing: 0.5,
    },
    // Texte très petit
    labelSmall: {
      fontFamily: systemFont,
      fontWeight: typography.fontWeight.regular,
      fontSize: typography.fontSize.xs,
      lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
      letterSpacing: 0.5,
    },
  },
  roundness: designSystem.borderRadius.base,
  spacing: (m) => designSystem.spacing[2] * m, // Base unit 8px
};

export default theme;
