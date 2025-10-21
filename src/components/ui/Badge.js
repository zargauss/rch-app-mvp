import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import designSystem from '../../theme/designSystem';

const { colors, spacing, borderRadius } = designSystem;

export default function Badge({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  style,
}) {
  const variantConfig = {
    primary: {
      backgroundColor: colors.primary[100],
      textColor: colors.primary[700],
    },
    secondary: {
      backgroundColor: colors.secondary[100],
      textColor: colors.secondary[700],
    },
    success: {
      backgroundColor: colors.health.excellent.light,
      textColor: colors.health.excellent.dark,
    },
    warning: {
      backgroundColor: colors.health.moderate.light,
      textColor: colors.health.moderate.dark,
    },
    danger: {
      backgroundColor: colors.health.danger.light,
      textColor: colors.health.danger.dark,
    },
    neutral: {
      backgroundColor: colors.neutral[100],
      textColor: colors.neutral[700],
    },
  };

  const sizeConfig = {
    small: {
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      textVariant: 'caption',
    },
    medium: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      textVariant: 'label',
    },
    large: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      textVariant: 'body',
    },
  };

  const variantStyle = variantConfig[variant];
  const sizeStyle = sizeConfig[size];

  return (
    <View 
      style={[
        styles.badge, 
        {
          backgroundColor: variantStyle.backgroundColor,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
        style,
      ]}
    >
      <AppText 
        variant={sizeStyle.textVariant} 
        weight="semiBold"
        style={{ color: variantStyle.textColor }}
      >
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
});

