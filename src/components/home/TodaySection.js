import React, { useRef } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import HealthIcon from '../ui/HealthIcon';
import designSystem from '../../theme/designSystem';

/**
 * Section "Aujourd'hui" - Affiche le nombre de selles et le score du jour
 */
const TodaySection = ({
  dailyCount,
  todayProvisionalScore,
  scoreTooltipVisible,
  setScoreTooltipVisible,
  tooltipOpacity,
  tooltipScale
}) => {
  return (
    <AppCard style={styles.todaySection}>
      <View style={styles.sectionHeader}>
        <HealthIcon name="calendar" size={28} color={designSystem.colors.primary[500]} />
        <AppText variant="h3" style={styles.sectionTitle}>
          Aujourd'hui
        </AppText>
      </View>

      <View style={styles.todayStatsRow}>
        {/* Selles */}
        <View style={[styles.todayStat, styles.todayStatLeft]}>
          <View style={styles.todayStatIcon}>
            <MaterialCommunityIcons name="toilet" size={Platform.OS === 'web' ? 32 : 28} color="#4C4DDC" />
          </View>
          <View style={styles.todayStatContent}>
            <AppText variant="labelMedium" style={styles.todayStatLabel}>
              Selles
            </AppText>
            <AppText variant="displayMedium" style={styles.todayStatValue}>
              {dailyCount}
            </AppText>
          </View>
        </View>

        {/* Score */}
        <View
          style={[styles.todayStat, styles.todayStatRight]}
          {...(Platform.OS === 'web' && {
            onMouseEnter: () => setScoreTooltipVisible(true),
            onMouseLeave: () => setScoreTooltipVisible(false),
          })}
        >
          <View style={styles.todayStatIcon}>
            <MaterialCommunityIcons
              name="chart-bar"
              size={Platform.OS === 'web' ? 32 : 28}
              color={todayProvisionalScore !== null ? (todayProvisionalScore < 5 ? '#16A34A' : todayProvisionalScore <= 10 ? '#F59E0B' : '#DC2626') : '#A3A3A3'}
            />
          </View>
          <View style={styles.todayStatContent}>
            <View style={styles.todayScoreHeader}>
              <AppText variant="labelMedium" style={styles.todayStatLabel}>
                Score
              </AppText>
              {Platform.OS === 'web' && (
                <MaterialCommunityIcons name="information-outline" size={16} color="#64748B" />
              )}
            </View>
            <AppText variant="displayMedium" style={[
              styles.todayStatValue,
              todayProvisionalScore !== null && (
                todayProvisionalScore < 5 ? styles.scoreGood :
                todayProvisionalScore <= 10 ? styles.scoreWarning :
                styles.scoreError
              )
            ]}>
              {todayProvisionalScore !== null ? todayProvisionalScore : 'N/A'}
            </AppText>
          </View>

          {/* Tooltip au survol (web uniquement) */}
          {Platform.OS === 'web' && scoreTooltipVisible && (
            <>
              <Animated.View
                style={[
                  styles.scoreTooltip,
                  {
                    opacity: tooltipOpacity,
                    transform: [{ scale: tooltipScale }],
                  },
                ]}
                pointerEvents="none"
              >
                <View style={styles.scoreTooltipHeader}>
                  <MaterialCommunityIcons name="chart-line" size={14} color="#4C4DDC" />
                  <AppText variant="labelSmall" style={styles.scoreTooltipTitle}>
                    Score de Lichtiger
                  </AppText>
                </View>
                <AppText variant="labelSmall" style={styles.scoreTooltipText}>
                  Évalue l'activité de la maladie
                </AppText>
                <View style={styles.scoreTooltipScale}>
                  <AppText variant="labelSmall" style={styles.scoreTooltipScaleItem}>
                    • 0-4 : Rémission
                  </AppText>
                  <AppText variant="labelSmall" style={styles.scoreTooltipScaleItem}>
                    • 5-10 : Modérée
                  </AppText>
                  <AppText variant="labelSmall" style={styles.scoreTooltipScaleItem}>
                    • {'>'} 10 : Sévère
                  </AppText>
                </View>
              </Animated.View>

              {/* Flèche du tooltip */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.scoreTooltipArrow,
                  {
                    opacity: tooltipOpacity,
                    transform: [{ scale: tooltipScale }],
                  },
                ]}
              />
            </>
          )}
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  todaySection: {
    marginHorizontal: designSystem.spacing[4],
    marginBottom: designSystem.spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
    marginBottom: designSystem.spacing[4],
  },
  sectionTitle: {
    color: designSystem.colors.text.primary,
  },
  todayStatsRow: {
    flexDirection: 'row',
    gap: designSystem.spacing[3],
  },
  todayStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[3],
    padding: designSystem.spacing[3],
    borderRadius: designSystem.borderRadius.lg,
    backgroundColor: designSystem.colors.background.secondary,
    position: 'relative',
  },
  todayStatLeft: {},
  todayStatRight: {},
  todayStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: designSystem.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayStatContent: {
    flex: 1,
  },
  todayScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayStatLabel: {
    color: designSystem.colors.text.secondary,
    marginBottom: 4,
  },
  todayStatValue: {
    color: designSystem.colors.text.primary,
    fontWeight: '700',
  },
  scoreGood: {
    color: '#16A34A',
  },
  scoreWarning: {
    color: '#F59E0B',
  },
  scoreError: {
    color: '#DC2626',
  },
  scoreTooltip: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginLeft: -100,
    marginTop: 12,
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    ...designSystem.shadows.lg,
    zIndex: 1000,
  },
  scoreTooltipArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginLeft: -6,
    marginTop: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    zIndex: 1001,
  },
  scoreTooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  scoreTooltipTitle: {
    fontWeight: '600',
    color: designSystem.colors.text.primary,
  },
  scoreTooltipText: {
    color: designSystem.colors.text.secondary,
    marginBottom: 8,
  },
  scoreTooltipScale: {
    gap: 4,
  },
  scoreTooltipScaleItem: {
    color: designSystem.colors.text.tertiary,
  },
});

export default TodaySection;
