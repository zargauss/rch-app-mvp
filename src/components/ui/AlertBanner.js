import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from './AppText';
import designSystem from '../../theme/designSystem';

const { colors, spacing, borderRadius } = designSystem;

export default function AlertBanner({ 
  variant = 'info',
  title,
  message,
  icon,
  style,
}) {
  const variantConfig = {
    success: {
      backgroundColor: colors.health.excellent.light,
      borderColor: colors.health.excellent.main,
      iconColor: colors.health.excellent.main,
      defaultIcon: 'check-circle',
    },
    info: {
      backgroundColor: colors.primary[50],
      borderColor: colors.primary[500],
      iconColor: colors.primary[500],
      defaultIcon: 'information',
    },
    warning: {
      backgroundColor: colors.health.moderate.light,
      borderColor: colors.health.moderate.main,
      iconColor: colors.health.moderate.main,
      defaultIcon: 'alert',
    },
    danger: {
      backgroundColor: colors.health.danger.light,
      borderColor: colors.health.danger.main,
      iconColor: colors.health.danger.main,
      defaultIcon: 'alert-circle',
    },
  };

  const config = variantConfig[variant];

  return (
    <View 
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons 
        name={icon || config.defaultIcon} 
        size={24} 
        color={config.iconColor}
        style={styles.icon}
      />
      <View style={styles.content}>
        {title && (
          <AppText variant="body" weight="semiBold" color="primary" style={styles.title}>
            {title}
          </AppText>
        )}
        {message && (
          <AppText variant="bodySmall" color="secondary" style={styles.message}>
            {message}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing[4],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  icon: {
    marginRight: spacing[3],
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: spacing[1],
  },
  message: {
    lineHeight: spacing[5],
  },
});

