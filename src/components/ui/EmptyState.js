import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from './AppText';
import PrimaryButton from './PrimaryButton';
import designSystem from '../../theme/designSystem';
import { fadeIn, scaleIn } from '../../utils/animations';

const { colors, spacing, borderRadius } = designSystem;

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée pour le conteneur
    fadeIn(fadeAnim, 400);
    scaleIn(scaleAnim, 400);
    
    // Animation décalée pour l'icône
    setTimeout(() => {
      scaleIn(iconScaleAnim, 300);
    }, 200);
  }, []);

  const variantConfig = {
    default: {
      iconColor: colors.primary[500],
      iconBg: colors.primary[50],
      borderColor: colors.primary[100],
    },
    success: {
      iconColor: colors.health.excellent.main,
      iconBg: colors.health.excellent.light,
      borderColor: colors.primary[200],
    },
    warning: {
      iconColor: colors.health.moderate.main,
      iconBg: colors.health.moderate.light,
      borderColor: colors.primary[200],
    },
    danger: {
      iconColor: colors.health.danger.main,
      iconBg: colors.health.danger.light,
      borderColor: colors.primary[200],
    },
  };

  const config = variantConfig[variant];

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: config.iconBg,
            borderColor: config.borderColor,
            transform: [{ scale: iconScaleAnim }],
          }
        ]}
      >
        <MaterialCommunityIcons 
          name={icon} 
          size={64} 
          color={config.iconColor}
        />
      </Animated.View>
      
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
    </Animated.View>
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
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
    borderWidth: 2,
    shadowColor: colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    marginBottom: spacing[3],
    maxWidth: 320,
  },
  description: {
    marginBottom: spacing[6],
    maxWidth: 320,
    lineHeight: 22,
  },
  button: {
    minWidth: 200,
    marginTop: spacing[2],
  },
});

