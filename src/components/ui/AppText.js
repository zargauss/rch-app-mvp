import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import designSystem from '../../theme/designSystem';

const { colors, typography } = designSystem;

// Inter avec fallbacks
const getInterFont = () => {
  if (Platform.OS === 'web') {
    return 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  } else if (Platform.OS === 'android') {
    return 'Inter';
  } else {
    return 'Inter, System';
  }
};

const interFont = getInterFont();

export default function AppText({ 
  children, 
  variant = 'body', 
  color = 'primary',
  align = 'left',
  weight = 'regular',
  style, 
  numberOfLines,
  ...props 
}) {
  const variantStyles = {
    // Titres - Utiliser la nouvelle hiérarchie
    h1: {
      fontFamily: interFont,
      fontSize: typography.h1.fontSize,
      lineHeight: typography.h1.lineHeight,
      fontWeight: typography.h1.fontWeight,
      letterSpacing: typography.h1.letterSpacing,
    },
    h2: {
      fontFamily: interFont,
      fontSize: typography.h2.fontSize,
      lineHeight: typography.h2.lineHeight,
      fontWeight: typography.h2.fontWeight,
      letterSpacing: typography.h2.letterSpacing,
    },
    h3: {
      fontFamily: interFont,
      fontSize: typography.h3.fontSize,
      lineHeight: typography.h3.lineHeight,
      fontWeight: typography.h3.fontWeight,
      letterSpacing: typography.h3.letterSpacing,
    },
    h4: {
      fontFamily: interFont,
      fontSize: typography.h4.fontSize,
      lineHeight: typography.h4.lineHeight,
      fontWeight: typography.h4.fontWeight,
      letterSpacing: typography.h4.letterSpacing,
    },
    
    // Corps de texte
    body: {
      fontFamily: interFont,
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontWeight: typography.body.fontWeight,
      letterSpacing: typography.body.letterSpacing,
    },
    bodyLarge: {
      fontFamily: interFont,
      fontSize: typography.bodyLarge.fontSize,
      lineHeight: typography.bodyLarge.lineHeight,
      fontWeight: typography.bodyLarge.fontWeight,
      letterSpacing: typography.bodyLarge.letterSpacing,
    },
    bodySmall: {
      fontFamily: interFont,
      fontSize: typography.bodySmall.fontSize,
      lineHeight: typography.bodySmall.lineHeight,
      fontWeight: typography.bodySmall.fontWeight,
      letterSpacing: typography.bodySmall.letterSpacing,
    },
    
    // Labels et captions
    label: {
      fontFamily: interFont,
      fontSize: typography.label.fontSize,
      lineHeight: typography.label.lineHeight,
      fontWeight: typography.label.fontWeight,
      letterSpacing: typography.label.letterSpacing,
    },
    caption: {
      fontFamily: interFont,
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
      fontWeight: typography.caption.fontWeight,
      letterSpacing: typography.caption.letterSpacing,
    },
    
    // Variants pour compatibilité (utilisent la nouvelle hiérarchie)
    displayLarge: {
      fontFamily: interFont,
      fontSize: typography.h1.fontSize,
      lineHeight: typography.h1.lineHeight,
      fontWeight: typography.h1.fontWeight,
      letterSpacing: typography.h1.letterSpacing,
    },
    displayMedium: {
      fontFamily: interFont,
      fontSize: typography.h2.fontSize,
      lineHeight: typography.h2.lineHeight,
      fontWeight: typography.h2.fontWeight,
      letterSpacing: typography.h2.letterSpacing,
    },
    headlineLarge: {
      fontFamily: interFont,
      fontSize: typography.h3.fontSize,
      lineHeight: typography.h3.lineHeight,
      fontWeight: typography.h3.fontWeight,
      letterSpacing: typography.h3.letterSpacing,
    },
    headlineSmall: {
      fontFamily: interFont,
      fontSize: typography.h4.fontSize,
      lineHeight: typography.h4.lineHeight,
      fontWeight: typography.h4.fontWeight,
      letterSpacing: typography.h4.letterSpacing,
    },
    labelMedium: {
      fontFamily: interFont,
      fontSize: typography.label.fontSize,
      lineHeight: typography.label.lineHeight,
      fontWeight: typography.label.fontWeight,
      letterSpacing: typography.label.letterSpacing,
    },
    labelSmall: {
      fontFamily: interFont,
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
      fontWeight: typography.caption.fontWeight,
      letterSpacing: typography.caption.letterSpacing,
    },
  };

  const colorStyles = {
    primary: { color: colors.text.primary },
    secondary: { color: colors.text.secondary },
    tertiary: { color: colors.text.tertiary },
    inverse: { color: colors.text.inverse },
    success: { color: colors.health.excellent.main },
    warning: { color: colors.health.moderate.main },
    danger: { color: colors.health.danger.main },
    info: { color: colors.primary[500] },
  };

  const weightStyles = {
    regular: { fontWeight: typography.fontWeight.regular },
    medium: { fontWeight: typography.fontWeight.medium },
    semiBold: { fontWeight: typography.fontWeight.semiBold },
    bold: { fontWeight: typography.fontWeight.bold },
  };

  const textStyle = [
    styles.text,
    variantStyles[variant],
    colorStyles[color],
    weightStyles[weight],
    { textAlign: align },
    style,
  ];

  return (
    <Text 
      style={textStyle} 
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
