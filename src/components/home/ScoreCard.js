import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import designSystem from '../../theme/designSystem';

const { colors, spacing, borderRadius, shadows } = designSystem;

export default function ScoreCard({ score, date, type = 'today' }) {
  const getScoreInfo = (score) => {
    if (score === null || score === undefined) {
      return {
        label: 'Aucune donnée',
        color: colors.neutral[400],
        gradient: [colors.neutral[400], colors.neutral[500]],
        icon: 'help-circle',
        message: 'Commencez à suivre vos symptômes',
      };
    }
    
    if (score <= 3) {
      return {
        label: 'Excellent',
        color: colors.health.excellent.main,
        gradient: [colors.health.excellent.main, colors.health.excellent.dark],
        icon: 'emoticon-excited',
        message: 'Continuez comme ça !',
      };
    }
    
    if (score <= 9) {
      return {
        label: 'Acceptable',
        color: colors.health.moderate.main,
        gradient: [colors.health.moderate.main, colors.health.moderate.dark],
        icon: 'emoticon-neutral',
        message: 'Restez vigilant',
      };
    }
    
    return {
      label: 'Préoccupant',
      color: colors.health.danger.main,
      gradient: [colors.health.danger.main, colors.health.danger.dark],
      icon: 'alert-circle',
      message: 'Consultez votre médecin',
    };
  };

  const scoreInfo = getScoreInfo(score);
  const title = type === 'today' ? "Aujourd'hui" : 'Hier';

  return (
    <AppCard variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <View>
          <AppText variant="h4" weight="semiBold" color="primary">
            {title}
          </AppText>
          {date && (
            <AppText variant="caption" color="tertiary">
              {date}
            </AppText>
          )}
        </View>
        <MaterialCommunityIcons 
          name={scoreInfo.icon} 
          size={32} 
          color={scoreInfo.color} 
        />
      </View>

      <View style={styles.scoreSection}>
        <LinearGradient
          colors={scoreInfo.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCircle}
        >
          <AppText variant="h1" weight="bold" color="inverse">
            {score !== null && score !== undefined ? score : '—'}
          </AppText>
        </LinearGradient>
        
        <View style={styles.scoreInfo}>
          <AppText variant="h3" weight="semiBold" style={{ color: scoreInfo.color }}>
            {scoreInfo.label}
          </AppText>
          <AppText variant="body" color="secondary" style={styles.message}>
            {scoreInfo.message}
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  scoreInfo: {
    flex: 1,
    gap: spacing[1],
  },
  message: {
    marginTop: spacing[1],
  },
});

