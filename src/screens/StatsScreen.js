import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import storage from '../utils/storage';
import AppText from '../components/ui/AppText';
import AppCard from '../components/ui/AppCard';
import StatCard from '../components/ui/StatCard';
import SegmentedControl from '../components/ui/SegmentedControl';
import { useTheme } from 'react-native-paper';

export default function StatsScreen() {
  const [scores, setScores] = useState([]);
  const [period, setPeriod] = useState('7'); // 7, 30, 90 jours
  const theme = useTheme();

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = () => {
    const json = storage.getString('scoresHistory');
    if (json) {
      const history = JSON.parse(json);
      setScores(history);
    }
  };

  const getChartData = () => {
    const days = parseInt(period);
    const today = new Date();
    const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    
    const dateRange = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dateRange.push(dateStr);
    }

    const chartData = dateRange.map(dateStr => {
      const scoreEntry = scores.find(s => s.date === dateStr);
      return scoreEntry ? scoreEntry.score : null;
    });

    const validScores = chartData.filter(score => score !== null);
    const average = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 'N/A';
    const min = validScores.length > 0 ? Math.min(...validScores) : 'N/A';
    const max = validScores.length > 0 ? Math.max(...validScores) : 'N/A';

    return {
      labels: dateRange.map(dateStr => {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      average,
      min,
      max,
      validDays: validScores.length,
      totalDays: days,
      rawData: chartData
    };
  };

  const chartData = getChartData();

  const getTrendAnalysis = () => {
    const validScores = chartData.rawData.filter(score => score !== null);
    if (validScores.length < 3) return { text: "Données insuffisantes", color: theme.colors.placeholder };

    const recent = validScores.slice(-3);
    const older = validScores.slice(0, -3);
    
    if (older.length === 0) return { text: "Données insuffisantes", color: theme.colors.placeholder };

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff < -0.5) return { text: "📈 Amélioration", color: theme.colors.success };
    if (diff > 0.5) return { text: "📉 Détérioration", color: theme.colors.error };
    return { text: "➡️ Stable", color: theme.colors.warning };
  };

  const trend = getTrendAnalysis();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <AppText variant="displayLarge" style={styles.title}>
          📊 Statistiques
        </AppText>
        <AppText variant="bodyLarge" style={styles.subtitle}>
          Analysez l'évolution de votre santé
        </AppText>
      </View>

      {/* Sélecteur de période moderne */}
      <View style={styles.periodSection}>
        <AppText variant="headlineLarge" style={styles.sectionTitle}>
          Période d'analyse
        </AppText>
        <SegmentedControl
          options={[
            { value: '7', label: '7 jours' },
            { value: '30', label: '30 jours' },
            { value: '90', label: '90 jours' }
          ]}
          selectedValue={period}
          onValueChange={setPeriod}
          style={styles.periodSelector}
        />
      </View>

      {/* Cartes de statistiques */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Score moyen"
          value={chartData.average !== 'N/A' ? chartData.average.toFixed(1) : 'N/A'}
          subtitle={`Sur ${chartData.validDays} jours`}
          icon="📈"
          color={chartData.average !== 'N/A' ? (chartData.average < 5 ? 'success' : chartData.average <= 10 ? 'warning' : 'error') : 'info'}
        />
        
        <StatCard
          title="Score minimum"
          value={chartData.min.toString()}
          subtitle="Meilleur résultat"
          icon="🎯"
          color="success"
        />
        
        <StatCard
          title="Score maximum"
          value={chartData.max.toString()}
          subtitle="Résultat le plus élevé"
          icon="⚠️"
          color="error"
        />
      </View>

      {/* Graphique d'évolution */}
      <AppCard style={styles.chartCard}>
        <AppText variant="headlineLarge" style={styles.chartTitle}>
          Évolution du Score
        </AppText>
        
        {chartData.validDays > 0 ? (
          Platform.OS === 'web' ? (
            <View style={styles.webChartContainer}>
              <View style={styles.pointsChart}>
                {chartData.rawData.map((score, index) => {
                  if (score === null) return null;
                  
                  const x = (index / (chartData.rawData.length - 1)) * 100;
                  const y = 100 - (score / 12) * 100;
                  
                  return (
                    <View key={index} style={styles.chartPoint}>
                      <View 
                        style={[
                          styles.point, 
                          {
                            left: `${x}%`,
                            top: `${y}%`,
                            backgroundColor: score < 5 ? '#10B981' : score <= 10 ? '#F59E0B' : '#EF4444'
                          }
                        ]}
                      />
                      <View style={[styles.pointLabel, { left: `${x}%` }]}>
                        <AppText variant="labelSmall" style={styles.pointValue}>
                          {score}
                        </AppText>
                        <AppText variant="labelSmall" style={styles.pointDate}>
                          {chartData.labels[index]}
                        </AppText>
                      </View>
                    </View>
                  );
                })}

                {/* Ligne de connexion */}
                <View style={styles.chartLine}>
                  {chartData.rawData.map((score, index) => {
                    if (score === null || index === chartData.rawData.length - 1) return null;
                    const nextScore = chartData.rawData[index + 1];
                    if (nextScore === null) return null;

                    const x1 = (index / (chartData.rawData.length - 1)) * 100;
                    const y1 = 100 - (score / 12) * 100;
                    const x2 = ((index + 1) / (chartData.rawData.length - 1)) * 100;
                    const y2 = 100 - (nextScore / 12) * 100;

                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

                    return (
                      <View
                        key={`line-${index}`}
                        style={[
                          styles.line,
                          {
                            left: `${x1}%`,
                            top: `${y1}%`,
                            width: `${length}%`,
                            transform: `rotate(${angle}deg)`,
                            transformOrigin: '0 0'
                          }
                        ]}
                      />
                    );
                  })}
                </View>

                {/* Grille de fond */}
                <View style={styles.chartGrid}>
                  {[0, 3, 6, 9, 12].map(value => (
                    <View key={value} style={styles.gridLine}>
                      <View style={[styles.gridLineHorizontal, { top: `${100 - (value / 12) * 100}%` }]} />
                      <AppText variant="labelSmall" style={[styles.gridLabel, { top: `${100 - (value / 12) * 100}%` }]}>
                        {value}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.nativeChartPlaceholder}>
              <AppText variant="bodyLarge" style={styles.placeholderText}>
                📊 Graphique interactif disponible sur la version web
              </AppText>
              <AppText variant="bodyMedium" style={styles.placeholderSubtext}>
                {chartData.validDays} jours de données disponibles
              </AppText>
            </View>
          )
        ) : (
          <View style={styles.noDataContainer}>
            <AppText style={styles.noDataIcon}>📊</AppText>
            <AppText variant="bodyLarge" style={styles.noDataText}>
              Aucune donnée disponible
            </AppText>
            <AppText variant="bodyMedium" style={styles.noDataSubtext}>
              Enregistrez des selles et complétez vos bilans pour voir l'évolution
            </AppText>
          </View>
        )}
      </AppCard>

      {/* Analyse de tendance */}
      {chartData.validDays >= 3 && (
        <AppCard style={styles.trendCard}>
          <View style={styles.trendContent}>
            <AppText style={styles.trendIcon}>📈</AppText>
            <View style={styles.trendText}>
              <AppText variant="headlineLarge" style={styles.trendTitle}>
                Analyse de tendance
              </AppText>
              <AppText variant="bodyLarge" style={[styles.trendDescription, { color: trend.color }]}>
                {trend.text}
              </AppText>
              <AppText variant="bodyMedium" style={styles.trendDetails}>
                Basé sur les {chartData.validDays} derniers jours avec données
              </AppText>
            </View>
          </View>
        </AppCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748B',
  },
  periodSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1E293B',
    marginBottom: 16,
  },
  periodSelector: {
    marginBottom: 8,
  },
  statsGrid: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
  },
  chartTitle: {
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  webChartContainer: {
    alignItems: 'center',
  },
  pointsChart: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginTop: 16,
  },
  chartPoint: {
    position: 'absolute',
  },
  point: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  pointLabel: {
    position: 'absolute',
    transform: [{ translateX: -20 }, { translateY: -30 }],
    alignItems: 'center',
  },
  pointValue: {
    fontWeight: '600',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
  },
  pointDate: {
    color: '#64748B',
    fontSize: 8,
    marginTop: 2,
  },
  chartLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#2563EB',
    opacity: 0.6,
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  gridLabel: {
    position: 'absolute',
    left: -30,
    transform: [{ translateY: -8 }],
    color: '#94A3B8',
    fontSize: 10,
  },
  nativeChartPlaceholder: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  placeholderText: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataText: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataSubtext: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  trendCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  trendContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  trendText: {
    flex: 1,
  },
  trendTitle: {
    color: '#1E293B',
    marginBottom: 8,
  },
  trendDescription: {
    fontWeight: '600',
    marginBottom: 4,
  },
  trendDetails: {
    color: '#64748B',
  },
});