// Design System - RCH Suivi
// Système de design complet pour l'application

export const colors = {
  // Couleurs principales - Palette médicale douce
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Principale
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
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
  
  // États de santé
  health: {
    excellent: {
      main: '#10B981',
      light: '#D1FAE5',
      dark: '#047857',
    },
    good: {
      main: '#3B82F6',
      light: '#DBEAFE',
      dark: '#1E40AF',
    },
    moderate: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#D97706',
    },
    warning: {
      main: '#F97316',
      light: '#FFEDD5',
      dark: '#EA580C',
    },
    danger: {
      main: '#EF4444',
      light: '#FEE2E2',
      dark: '#DC2626',
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
    primary: '#FAFBFC',
    secondary: '#F3F4F6',
    tertiary: '#FFFFFF',
  },
  
  // Texte
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    disabled: '#D1D5DB',
    inverse: '#FFFFFF',
  },
  
  // Bordures
  border: {
    light: '#F3F4F6',
    medium: '#E5E7EB',
    dark: '#D1D5DB',
  },
};

export const typography = {
  // Famille de polices
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  // Tailles de police
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
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
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

