// Design System - RCH Suivi
// Système de design complet pour l'application

export const colors = {
  // Couleurs principales - Palette unifiée
  primary: {
    50: '#EDEDFC',
    100: '#EDEDFC',
    200: '#C8C8F4',
    300: '#C8C8F4',
    400: '#4C4DDC',
    500: '#4C4DDC', // Principale (Color 01)
    600: '#4C4DDC',
    700: '#4C4DDC',
    800: '#4C4DDC',
    900: '#101010', // Color 03
  },
  
  // Couleurs secondaires - Vert médical
  secondary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Secondaire
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  // États de santé - Utilisant uniquement la palette unifiée
  health: {
    excellent: {
      main: '#4C4DDC', // Color 01 - pour les états positifs
      light: '#EDEDFC', // Color 02 - fond clair
      dark: '#4C4DDC', // Color 01
    },
    good: {
      main: '#4C4DDC', // Color 01
      light: '#C8C8F4', // Color 04 - fond lavande
      dark: '#4C4DDC', // Color 01
    },
    moderate: {
      main: '#4C4DDC', // Color 01 - avec opacité pour distinction
      light: '#C8C8F4', // Color 04
      dark: '#4C4DDC', // Color 01
    },
    warning: {
      main: '#4C4DDC', // Color 01
      light: '#EDEDFC', // Color 02
      dark: '#4C4DDC', // Color 01
    },
    danger: {
      main: '#101010', // Color 03 - noir pour les alertes
      light: '#EDEDFC', // Color 02
      dark: '#101010', // Color 03
    },
    // Couleurs pastel pour amélioration/dégradation
    improvement: {
      main: '#86EFAC', // Vert pastel pour amélioration
      light: '#D1FAE5', // Vert pastel très clair
      dark: '#16A34A', // Vert plus foncé
    },
    decline: {
      main: '#FCA5A5', // Rouge pastel pour dégradation
      light: '#FEE2E2', // Rouge pastel très clair
      dark: '#DC2626', // Rouge plus foncé
    },
  },
  
  // Neutres
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Background et surface
  background: {
    primary: '#EDEDFC', // Color 02
    secondary: '#C8C8F4', // Color 04
    tertiary: '#FFFFFF',
  },
  
  // Texte
  text: {
    primary: '#101010', // Color 03 - Noir principal
    secondary: '#101010', // Color 03 - Noir pour meilleure lisibilité (au lieu de bleu)
    tertiary: '#101010', // Color 03 - Noir au lieu de gris pour meilleure lisibilité
    disabled: '#D4D4D8', // Color 05 - Gris uniquement pour les éléments désactivés
    inverse: '#FFFFFF',
  },
  
  // Bordures
  border: {
    light: '#C8C8F4', // Color 04
    medium: '#D4D4D8', // Color 05
    dark: '#4C4DDC', // Color 01
  },
};

export const typography = {
  // Famille de polices - Inter
  fontFamily: {
    regular: 'Inter',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    // Fallback pour web
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  
  // Hiérarchie typographique claire
  // H1 - Titre principal d'écran (36px)
  h1: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  // H2 - Titre de section (28px)
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  // H3 - Titre de sous-section (24px)
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: 0,
  },
  // H4 - Titre de carte (20px)
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0,
  },
  // Body Large - Texte important (18px)
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: 0.15,
  },
  // Body - Texte principal (16px)
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  // Body Small - Texte secondaire (14px)
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  // Caption - Légendes et labels (12px)
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  // Label - Labels de formulaires (14px, medium)
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  // Button - Texte de bouton (16px, semiBold)
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // Tailles de police (pour compatibilité)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Hauteurs de ligne
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Poids de police
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};

export const borderRadius = {
  none: 0,
  sm: 8,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const gradients = {
  primary: ['#6366F1', '#4F46E5'],
  secondary: ['#22C55E', '#16A34A'],
  excellent: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  danger: ['#EF4444', '#DC2626'],
  info: ['#3B82F6', '#2563EB'],
};

export const layout = {
  // Largeurs de conteneur
  containerPadding: spacing[4],
  cardPadding: spacing[4],
  
  // Espacements par défaut
  sectionSpacing: spacing[6],
  elementSpacing: spacing[4],
  
  // Hauteurs
  headerHeight: 60,
  tabBarHeight: 65,
  buttonHeight: 48,
  inputHeight: 48,
};

export const animations = {
  // Durées
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  
  // Types d'animation
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Export du design system complet
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
  layout,
  animations,
};

