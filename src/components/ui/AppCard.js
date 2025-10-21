import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import designSystem from '../../theme/designSystem';

const { colors, spacing, borderRadius, shadows } = designSystem;

export default function AppCard({ 
  children, 
  style, 
  variant = 'default', 
  gradient = false,
  gradientColors = null,
  noPadding = false,
  ...props 
}) {
  const variantStyles = {
    default: {
      backgroundColor: colors.background.tertiary,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    elevated: {
      backgroundColor: colors.background.tertiary,
      ...shadows.md,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border.medium,
    },
    success: {
      backgroundColor: colors.health.excellent.light,
      borderWidth: 1,
      borderColor: colors.health.excellent.main,
    },
    warning: {
      backgroundColor: colors.health.moderate.light,
      borderWidth: 1,
      borderColor: colors.health.moderate.main,
    },
    danger: {
      backgroundColor: colors.health.danger.light,
      borderWidth: 1,
      borderColor: colors.health.danger.main,
    },
  };

  const cardStyle = [
    styles.card,
    variantStyles[variant],
    noPadding && styles.noPadding,
    style,
  ];

  if (gradient && gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardStyle}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  noPadding: {
    padding: 0,
  },
});
