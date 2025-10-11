import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Platform } from 'react-native';

const palette = {
  // Couleur primaire - Bleu médical apaisant
  primary: '#2563EB', // Bleu professionnel et rassurant
  primaryContainer: '#E0E7FF', // Fond bleu très clair
  
  // Couleur secondaire - Vert pour les tendances positives
  secondary: '#059669', // Vert émeraude pour les améliorations
  secondaryContainer: '#D1FAE5', // Fond vert très clair
  
  // Couleurs sémantiques
  success: '#10B981', // Vert pour les tendances positives
  warning: '#F59E0B', // Orange pour les avertissements
  error: '#EF4444', // Rouge pour les alertes
  info: '#3B82F6', // Bleu pour les informations
  
  // Fonds et surfaces
  background: '#FAFAFA', // Blanc cassé très doux
  surface: '#FFFFFF', // Blanc pur pour les cartes
  surfaceVariant: '#F8FAFC', // Gris très léger pour les variantes
  
  // Texte
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#1E293B', // Gris foncé pour le texte principal
  onSurface: '#334155', // Gris moyen pour le texte sur surface
  onSurfaceVariant: '#64748B', // Gris clair pour le texte secondaire
  
  // Bordures et séparateurs
  outline: '#E2E8F0', // Gris très clair pour les bordures
  outlineVariant: '#F1F5F9', // Encore plus clair
  
  // États spéciaux
  disabled: '#94A3B8', // Gris pour les éléments désactivés
  placeholder: '#9CA3AF', // Gris pour les placeholders
};

const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    primaryContainer: palette.primaryContainer,
    secondary: palette.secondary,
    secondaryContainer: palette.secondaryContainer,
    background: palette.background,
    surface: palette.surface,
    surfaceVariant: palette.surfaceVariant,
    onPrimary: palette.onPrimary,
    onSecondary: palette.onSecondary,
    onBackground: palette.onBackground,
    onSurface: palette.onSurface,
    onSurfaceVariant: palette.onSurfaceVariant,
    outline: palette.outline,
    outlineVariant: palette.outlineVariant,
    error: palette.error,
    placeholder: palette.placeholder,
    // Couleurs sémantiques personnalisées
    success: palette.success,
    warning: palette.warning,
    info: palette.info,
  },
  fonts: {
    ...DefaultTheme.fonts,
    // Titre d'écran (H1)
    displayLarge: {
      fontFamily: systemFont,
      fontWeight: '700',
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    // Titre de section (H2)
    displayMedium: {
      fontFamily: systemFont,
      fontWeight: '600',
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
    },
    // Titre de carte (H3)
    headlineLarge: {
      fontFamily: systemFont,
      fontWeight: '600',
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: 0,
    },
    // Corps de texte principal
    bodyLarge: {
      fontFamily: systemFont,
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    // Corps de texte secondaire
    bodyMedium: {
      fontFamily: systemFont,
      fontWeight: '400',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    // Légende et texte petit
    labelMedium: {
      fontFamily: systemFont,
      fontWeight: '500',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    // Texte très petit
    labelSmall: {
      fontFamily: systemFont,
      fontWeight: '400',
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 0.5,
    },
  },
  roundness: 12, // Bordures plus douces et modernes
  spacing: (m) => 8 * m, // Base unit 8px
};

export default theme;
