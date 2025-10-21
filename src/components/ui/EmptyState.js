import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from './AppText';
import PrimaryButton from './PrimaryButton';
import designSystem from '../../theme/designSystem';

const { colors, spacing } = designSystem;

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}) {
  const variantConfig = {
    default: {
      iconColor: colors.primary[300],
    },
    success: {
      iconColor: colors.health.excellent.main,
    },
    warning: {
      iconColor: colors.health.moderate.main,
    },
    danger: {
      iconColor: colors.health.danger.main,
    },
  };

  const config = variantConfig[variant];

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name={icon} 
        size={80} 
        color={config.iconColor} 
        style={styles.icon}
      />
      <AppText variant="h3" weight="semiBold" color="primary" align="center" style={styles.title}>
        {title}
      </AppText>
      {description && (
        <AppText variant="body" color="secondary" align="center" style={styles.description}>
          {description}
        </AppText>
      )}
      {actionLabel && onAction && (
        <PrimaryButton onPress={onAction} style={styles.button}>
          {actionLabel}
        </PrimaryButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[10],
  },
  icon: {
    marginBottom: spacing[4],
    opacity: 0.5,
  },
  title: {
    marginBottom: spacing[2],
  },
  description: {
    marginBottom: spacing[6],
    maxWidth: 300,
  },
  button: {
    minWidth: 200,
  },
});

