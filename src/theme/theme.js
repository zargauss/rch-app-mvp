import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Platform } from 'react-native';

const palette = {
  // Couleur primaire - Bleu doux et apaisant
  primary: '#4A90E2', // Bleu doux moderne
  primaryContainer: '#E8F4FD', // Fond bleu très clair
  
  // Couleur secondaire - Orange/Vert doux pour les accents
  secondary: '#FF6B6B', // Rouge doux pour les alertes
  secondaryContainer: '#FFE8E8', // Fond rouge très clair
  
  // Couleurs sémantiques douces
  success: '#4ECDC4', // Vert menthe doux
  warning: '#FFB347', // Orange doux
  error: '#FF6B6B', // Rouge doux
  info: '#4A90E2', // Bleu doux
  
  // Fonds et surfaces - Tons très doux
  background: '#F8FAFB', // Gris très clair, presque blanc
  surface: '#FFFFFF', // Blanc pur pour les cartes
  surfaceVariant: '#F1F5F9', // Gris très léger pour les variantes
  
  // Texte - Tons doux mais lisibles
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#2D3748', // Gris foncé doux
  onSurface: '#4A5568', // Gris moyen doux
  onSurfaceVariant: '#718096', // Gris clair doux
  
  // Bordures et séparateurs - Très subtils
  outline: '#E2E8F0', // Gris très clair pour les bordures
  outlineVariant: '#F7FAFC', // Encore plus clair
  
  // États spéciaux
  disabled: '#A0AEC0', // Gris pour les éléments désactivés
  placeholder: '#CBD5E0', // Gris pour les placeholders
  
  // Couleurs d'accent pour les cartes
  cardBackground: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardShadow: 'rgba(0, 0, 0, 0.05)',
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
