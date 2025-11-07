import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import HealthIcon from './HealthIcon';
import AppText from './AppText';
import PrimaryButton from './PrimaryButton';
import designSystem from '../../theme/designSystem';
import { fadeIn, scaleIn } from '../../utils/animations';

const { colors, spacing, borderRadius } = designSystem;

/**
 * Composant EmptyState moderne avec support des HealthIcons
 *
 * Usage:
 * <EmptyState
 *   healthIcon="journal"
 *   title="Aucune donnée"
 *   description="Commencez par ajouter vos premières entrées"
 *   actionLabel="Ajouter"
 *   onAction={() => {}}
 * />
 */

export default function EmptyState({
  icon = 'inbox',
  healthIcon, // Nouveau: utiliser HealthIcon au lieu de MaterialCommunityIcons
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  size = 'default', // 'default' | 'compact'
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
  const iconSize = size === 'compact' ? 48 : 72;
  const containerSize = size === 'compact' ? 96 : 140;

  return (
    <Animated.View
      style={[
        styles.container,
        size === 'compact' && styles.containerCompact,
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
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            backgroundColor: config.iconBg,
            borderColor: config.borderColor,
            transform: [{ scale: iconScaleAnim }],
          }
        ]}
      >
        {healthIcon ? (
          <HealthIcon
            name={healthIcon}
            size={iconSize}
            color={config.iconColor}
          />
        ) : (
          <MaterialCommunityIcons
            name={icon}
            size={iconSize}
            color={config.iconColor}
          />
        )}
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
  containerCompact: {
    paddingVertical: spacing[6],
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
    borderWidth: 2,
    ...designSystem.shadows.base,
  },
  title: {
    marginBottom: spacing[3],
    maxWidth: 320,
  },
  description: {
    marginBottom: spacing[6],
    maxWidth: 320,
    lineHeight: 24,
  },
  button: {
    minWidth: 200,
    marginTop: spacing[2],
  },
});

