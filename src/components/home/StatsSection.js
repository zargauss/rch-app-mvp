import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import designSystem from '../../theme/designSystem';

const { colors, spacing, borderRadius, shadows } = designSystem;

function StatItem({ icon, value, label, variant = 'primary' }) {
  const variantConfig = {
    primary: {
      gradient: [colors.primary[500], colors.primary[600]],
      iconColor: colors.text.inverse,
    },
    success: {
      gradient: [colors.health.excellent.main, colors.health.excellent.dark],
      iconColor: colors.text.inverse,
    },
    warning: {
      gradient: [colors.health.moderate.main, colors.health.moderate.dark],
      iconColor: colors.text.inverse,
    },
    danger: {
      gradient: [colors.health.danger.main, colors.health.danger.dark],
      iconColor: colors.text.inverse,
    },
  };

  const config = variantConfig[variant];

  return (
    <View style={styles.statItem}>
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statIconContainer}
      >
        <MaterialCommunityIcons name={icon} size={24} color={config.iconColor} />
      </LinearGradient>
      <View style={styles.statContent}>
        <AppText variant="h2" weight="bold" color="primary">
          {value}
        </AppText>
        <AppText variant="caption" color="secondary" numberOfLines={1}>
          {label}
        </AppText>
      </View>
    </View>
  );
}

export default function StatsSection({ stats }) {
  return (
    <AppCard variant="elevated" style={styles.container}>
      <AppText variant="h4" weight="semiBold" color="primary" style={styles.title}>
        Vue d'ensemble
      </AppText>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatItem key={index} {...stat} />
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  title: {
    marginBottom: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing[2],
  },
  statItem: {
    width: '50%',
    paddingHorizontal: spacing[2],
    marginBottom: spacing[3],
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
    ...shadows.sm,
  },
  statContent: {
    gap: spacing[1],
  },
});

