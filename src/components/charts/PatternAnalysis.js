import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../ui/AppText';
import AppCard from '../ui/AppCard';

const PatternAnalysis = ({ data, labels }) => {
  // Analyser les patterns par jour de la semaine
  const weekdayAnalysis = useMemo(() => {
    if (!data || data.length === 0) return null;

    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayData = {};

    // Initialiser
    dayNames.forEach((_, index) => {
      dayData[index] = { scores: [], count: 0, average: 0 };
    });

    // Collecter les scores par jour de la semaine
    labels.forEach((label, index) => {
      const score = data[index];
      if (score !== null) {
        const [day, month] = label.split('/').map(Number);
        const year = new Date().getFullYear();
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        
        dayData[dayOfWeek].scores.push(score);
        dayData[dayOfWeek].count++;
      }
    });

    // Calculer les moyennes
    Object.keys(dayData).forEach(day => {
      if (dayData[day].scores.length > 0) {
        dayData[day].average = dayData[day].scores.reduce((a, b) => a + b, 0) / dayData[day].scores.length;
      }
    });

    // Trouver le meilleur et le pire jour
    const daysWithData = Object.entries(dayData)
      .filter(([_, data]) => data.count > 0)
      .map(([day, data]) => ({ day: parseInt(day), ...data }));

    if (daysWithData.length === 0) return null;

    const bestDay = daysWithData.reduce((best, current) => 
      current.average < best.average ? current : best
    );

    const worstDay = daysWithData.reduce((worst, current) => 
      current.average > worst.average ? current : worst
    );

    return {
      bestDay: {
        name: dayNames[bestDay.day],
        average: bestDay.average.toFixed(1),
        count: bestDay.count
      },
      worstDay: {
        name: dayNames[worstDay.day],
        average: worstDay.average.toFixed(1),
        count: worstDay.count
      },
      allDays: daysWithData.map(d => ({
        name: dayNames[d.day],
        average: d.average.toFixed(1),
        count: d.count
      }))
    };
  }, [data, labels]);

  // Détecter les séries (jours consécutifs)
  const streakAnalysis = useMemo(() => {
    const validScores = data.filter(score => score !== null);
    if (validScores.length < 3) return null;

    let currentGoodStreak = 0;
    let maxGoodStreak = 0;
    let currentBadStreak = 0;
    let maxBadStreak = 0;

    data.forEach(score => {
      if (score !== null) {
        if (score < 5) {
          currentGoodStreak++;
          currentBadStreak = 0;
          maxGoodStreak = Math.max(maxGoodStreak, currentGoodStreak);
        } else if (score >= 7) {
          currentBadStreak++;
          currentGoodStreak = 0;
          maxBadStreak = Math.max(maxBadStreak, currentBadStreak);
        } else {
          currentGoodStreak = 0;
          currentBadStreak = 0;
        }
      }
    });

    return {
      maxGoodStreak,
      maxBadStreak
    };
  }, [data]);

  if (!weekdayAnalysis) return null;

  return (
    <AppCard style={styles.container}>
      <AppText variant="headlineLarge" style={styles.title}>
        🔍 Analyse des Patterns
      </AppText>
      <AppText variant="bodyMedium" style={styles.subtitle}>
        Découvrez vos habitudes et tendances
      </AppText>

      {/* Meilleur et pire jour */}
      <View style={styles.daysContainer}>
        <View style={[styles.dayCard, styles.bestDayCard]}>
          <AppText style={styles.dayIcon}>🌟</AppText>
          <AppText variant="labelSmall" style={styles.dayLabel}>
            Meilleur jour
          </AppText>
          <AppText variant="headlineLarge" style={styles.bestDayName}>
            {weekdayAnalysis.bestDay.name}
          </AppText>
          <AppText variant="bodyMedium" style={styles.dayScore}>
            Score moyen : {weekdayAnalysis.bestDay.average}
          </AppText>
          <AppText variant="labelSmall" style={styles.dayCount}>
            Sur {weekdayAnalysis.bestDay.count} jour{weekdayAnalysis.bestDay.count > 1 ? 's' : ''}
          </AppText>
        </View>

        <View style={[styles.dayCard, styles.worstDayCard]}>
          <AppText style={styles.dayIcon}>⚠️</AppText>
          <AppText variant="labelSmall" style={styles.dayLabel}>
            Jour à surveiller
          </AppText>
          <AppText variant="headlineLarge" style={styles.worstDayName}>
            {weekdayAnalysis.worstDay.name}
          </AppText>
          <AppText variant="bodyMedium" style={styles.dayScore}>
            Score moyen : {weekdayAnalysis.worstDay.average}
          </AppText>
          <AppText variant="labelSmall" style={styles.dayCount}>
            Sur {weekdayAnalysis.worstDay.count} jour{weekdayAnalysis.worstDay.count > 1 ? 's' : ''}
          </AppText>
        </View>
      </View>

      {/* Séries */}
      {streakAnalysis && (streakAnalysis.maxGoodStreak > 2 || streakAnalysis.maxBadStreak > 2) && (
        <View style={styles.streaksContainer}>
          <AppText variant="bodyLarge" style={styles.streaksTitle}>
            📅 Séries remarquables
          </AppText>
          
          {streakAnalysis.maxGoodStreak > 2 && (
            <View style={styles.streakItem}>
              <AppText style={styles.streakIcon}>✅</AppText>
              <View style={styles.streakText}>
                <AppText variant="bodyMedium" style={styles.streakLabel}>
                  Meilleure série
                </AppText>
                <AppText variant="bodySmall" style={styles.streakValue}>
                  {streakAnalysis.maxGoodStreak} jours consécutifs avec score &lt; 5
                </AppText>
              </View>
            </View>
          )}

          {streakAnalysis.maxBadStreak > 2 && (
            <View style={styles.streakItem}>
              <AppText style={styles.streakIcon}>⚠️</AppText>
              <View style={styles.streakText}>
                <AppText variant="bodyMedium" style={styles.streakLabel}>
                  Série préoccupante
                </AppText>
                <AppText variant="bodySmall" style={styles.streakValue}>
                  {streakAnalysis.maxBadStreak} jours consécutifs avec score ≥ 7
                </AppText>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <AppText variant="bodySmall" style={styles.insightText}>
          💡 Ces patterns peuvent vous aider à identifier des déclencheurs potentiels et à mieux gérer votre santé.
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    color: '#2D3748',
    marginBottom: 4,
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748B',
    marginBottom: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dayCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  bestDayCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  worstDayCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  dayIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  dayLabel: {
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  bestDayName: {
    color: '#10B981',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  worstDayName: {
    color: '#EF4444',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  dayScore: {
    color: '#475569',
    marginBottom: 4,
    textAlign: 'center',
  },
  dayCount: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  streaksContainer: {
    backgroundColor: '#F8FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  streaksTitle: {
    color: '#2D3748',
    marginBottom: 12,
    fontWeight: '700',
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  streakText: {
    flex: 1,
  },
  streakLabel: {
    color: '#475569',
    fontWeight: '600',
    marginBottom: 2,
  },
  streakValue: {
    color: '#64748B',
  },
  insightsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  insightText: {
    color: '#92400E',
    lineHeight: 18,
  },
});

export default PatternAnalysis;

