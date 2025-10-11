import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import AppText from '../ui/AppText';
import AppCard from '../ui/AppCard';

const ScoreDistribution = ({ data }) => {
  const { width } = Dimensions.get('window');
  const chartWidth = Math.min(width - 80, 500);
  const chartHeight = 200;

  // Calculer la distribution des scores
  const distribution = useMemo(() => {
    const validScores = data.filter(score => score !== null);
    if (validScores.length === 0) return [];

    // Compter chaque score de 0 à 13
    const counts = {};
    for (let i = 0; i <= 13; i++) {
      counts[i] = 0;
    }

    validScores.forEach(score => {
      counts[score] = (counts[score] || 0) + 1;
    });

    // Convertir en tableau avec pourcentages
    const total = validScores.length;
    const maxCount = Math.max(...Object.values(counts));

    return Object.keys(counts).map(score => ({
      score: parseInt(score),
      count: counts[score],
      percentage: ((counts[score] / total) * 100).toFixed(1),
      heightPercent: maxCount > 0 ? (counts[score] / maxCount) * 100 : 0
    }));
  }, [data]);

  if (distribution.length === 0) {
    return null;
  }

  // Regrouper par catégories
  const categories = useMemo(() => {
    const excellent = distribution.filter(d => d.score <= 3).reduce((sum, d) => sum + d.count, 0);
    const acceptable = distribution.filter(d => d.score >= 4 && d.score <= 6).reduce((sum, d) => sum + d.count, 0);
    const preoccupant = distribution.filter(d => d.score >= 7).reduce((sum, d) => sum + d.count, 0);
    const total = excellent + acceptable + preoccupant;

    return [
      {
        label: 'Excellent',
        range: '0-3',
        count: excellent,
        percentage: total > 0 ? ((excellent / total) * 100).toFixed(0) : 0,
        color: '#10B981',
        icon: '🟢'
      },
      {
        label: 'Acceptable',
        range: '4-6',
        count: acceptable,
        percentage: total > 0 ? ((acceptable / total) * 100).toFixed(0) : 0,
        color: '#F59E0B',
        icon: '🟡'
      },
      {
        label: 'Préoccupant',
        range: '7+',
        count: preoccupant,
        percentage: total > 0 ? ((preoccupant / total) * 100).toFixed(0) : 0,
        color: '#EF4444',
        icon: '🔴'
      }
    ];
  }, [distribution]);

  return (
    <AppCard style={styles.container}>
      <AppText variant="headlineLarge" style={styles.title}>
        📊 Répartition des Scores
      </AppText>
      <AppText variant="bodyMedium" style={styles.subtitle}>
        Distribution de vos scores sur la période
      </AppText>

      {/* Barres d'histogramme */}
      <View style={styles.chartContainer}>
        {distribution.filter(d => d.count > 0).map((item) => {
          let barColor = '#10B981';
          if (item.score >= 7) barColor = '#EF4444';
          else if (item.score >= 4) barColor = '#F59E0B';

          return (
            <View key={item.score} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${item.heightPercent}%`,
                      backgroundColor: barColor 
                    }
                  ]}
                />
                {item.count > 0 && (
                  <AppText variant="labelSmall" style={styles.barValue}>
                    {item.count}
                  </AppText>
                )}
              </View>
              <AppText variant="labelSmall" style={styles.barLabel}>
                {item.score}
              </AppText>
            </View>
          );
        })}
      </View>

      {/* Catégories */}
      <View style={styles.categoriesContainer}>
        {categories.map((category, index) => (
          <View key={index} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <AppText style={styles.categoryIcon}>{category.icon}</AppText>
              <AppText variant="labelSmall" style={styles.categoryRange}>
                {category.range}
              </AppText>
            </View>
            <AppText variant="headlineLarge" style={[styles.categoryPercentage, { color: category.color }]}>
              {category.percentage}%
            </AppText>
            <AppText variant="labelSmall" style={styles.categoryLabel}>
              {category.label}
            </AppText>
            <AppText variant="labelSmall" style={styles.categoryCount}>
              {category.count} jour{category.count > 1 ? 's' : ''}
            </AppText>
          </View>
        ))}
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
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 150,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barWrapper: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4,
  },
  barValue: {
    color: '#475569',
    fontWeight: '600',
    marginTop: 4,
  },
  barLabel: {
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#F8FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryRange: {
    color: '#64748B',
    fontWeight: '700',
  },
  categoryPercentage: {
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryLabel: {
    color: '#475569',
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    color: '#94A3B8',
  },
});

export default ScoreDistribution;

