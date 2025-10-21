import React from 'react';
import { Text, StyleSheet } from 'react-native';
import designSystem from '../../theme/designSystem';

const { colors, typography } = designSystem;

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
    // Titres
    h1: {
      fontSize: typography.fontSize['3xl'],
      lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
      fontWeight: typography.fontWeight.bold,
    },
    h2: {
      fontSize: typography.fontSize['2xl'],
      lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
      fontWeight: typography.fontWeight.bold,
    },
    h3: {
      fontSize: typography.fontSize.xl,
      lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
      fontWeight: typography.fontWeight.semiBold,
    },
    h4: {
      fontSize: typography.fontSize.lg,
      lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
      fontWeight: typography.fontWeight.semiBold,
    },
    
    // Corps de texte
    body: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.fontSize.base * typography.lineHeight.normal,
      fontWeight: typography.fontWeight.regular,
    },
    bodyLarge: {
      fontSize: typography.fontSize.lg,
      lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
      fontWeight: typography.fontWeight.regular,
    },
    bodySmall: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
      fontWeight: typography.fontWeight.regular,
    },
    
    // Labels et captions
    label: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
    },
    caption: {
      fontSize: typography.fontSize.xs,
      lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
      fontWeight: typography.fontWeight.regular,
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
