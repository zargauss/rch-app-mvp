import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import storage from '../utils/storage';
import AppText from '../components/ui/AppText';
import AppCard from '../components/ui/AppCard';
import StatCard from '../components/ui/StatCard';
import SegmentedControl from '../components/ui/SegmentedControl';
import TrendChart from '../components/charts/TrendChart';
import TrendIndicator from '../components/charts/TrendIndicator';
import ScoreDistribution from '../components/charts/ScoreDistribution';
import KeyInsights from '../components/charts/KeyInsights';
import { useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

export default function StatsScreen() {
  const [scores, setScores] = useState([]);
  const [period, setPeriod] = useState('30'); // 7, 30, 90 jours
  const theme = useTheme();

  useEffect(() => {
    loadScores();
  }, []);

  // Recharger les données à chaque fois qu'on navigue vers cet écran
  useFocusEffect(
    React.useCallback(() => {
      loadScores();
    }, [])
  );

  // Recharger les données périodiquement pour capturer les changements
  useEffect(() => {
    const interval = setInterval(() => {
      loadScores();
    }, 2000); // Recharger toutes les 2 secondes

    return () => clearInterval(interval);
  }, []);

  const loadScores = () => {
    const json = storage.getString('scoresHistory');
    if (json) {
      const history = JSON.parse(json);
      setScores(history);
    } else {
      setScores([]);
    }
  };

  const chartData = useMemo(() => {
    const days = parseInt(period);
    const today = new Date();
    const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    
    const dateRange = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dateRange.push(dateStr);
    }

    const chartDataArray = dateRange.map(dateStr => {
      const scoreEntry = scores.find(s => s.date === dateStr);
      return scoreEntry ? scoreEntry.score : null;
    });

    const validScores = chartDataArray.filter(score => score !== null);
    const average = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;
    const min = validScores.length > 0 ? Math.min(...validScores) : null;
    const max = validScores.length > 0 ? Math.max(...validScores) : null;

    const labels = dateRange.map(dateStr => {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    return {
      labels,
      data: chartDataArray,
      average,
      min,
      max,
      validDays: validScores.length,
      totalDays: days
    };
  }, [scores, period]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <AppText variant="displayMedium" style={styles.title}>
              Statistiques
            </AppText>
            <AppText variant="bodyMedium" style={styles.subtitle}>
              Analysez l'évolution de votre santé
            </AppText>
          </View>
        </View>
      </View>

      {/* Sélecteur de période */}
      <View style={styles.periodSection}>
        <SegmentedControl
          options={[
            { value: '7', label: '7 jours' },
            { value: '30', label: '30 jours' },
            { value: '90', label: '90 jours' }
          ]}
          selectedValue={period}
          onValueChange={setPeriod}
        />
      </View>

      {chartData.validDays > 0 ? (
        <>
          {/* Cartes de statistiques */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Score moyen"
              value={chartData.average !== null ? chartData.average.toFixed(1) : 'N/A'}
              subtitle={`Sur ${chartData.validDays} jours`}
              icon="chart-bar"
              color={chartData.average !== null ? (chartData.average < 5 ? 'success' : chartData.average <= 10 ? 'warning' : 'error') : 'info'}
            />
            
            <StatCard
              title="Meilleur résultat"
              value={chartData.min !== null ? chartData.min.toString() : 'N/A'}
              subtitle="Score minimum"
              icon="target"
              color="success"
            />
            
            <StatCard
              title="Score maximum"
              value={chartData.max !== null ? chartData.max.toString() : 'N/A'}
              subtitle="Résultat le plus élevé"
              icon="alert-circle"
              color="error"
            />
          </View>

          {/* Graphique d'évolution */}
          <AppCard style={styles.chartCard}>
            <AppText variant="headlineLarge" style={styles.chartTitle}>
              Évolution du Score
            </AppText>
            
            {Platform.OS === 'web' ? (
              <TrendChart 
                data={chartData.data} 
                labels={chartData.labels}
                period={chartData.totalDays}
              />
            ) : (
              <View style={styles.nativeChartPlaceholder}>
                <AppText variant="bodyLarge" style={styles.placeholderText}>
                  Graphique interactif disponible sur la version web
                </AppText>
                <AppText variant="bodyMedium" style={styles.placeholderSubtext}>
                  {chartData.validDays} jours de données disponibles
                </AppText>
              </View>
            )}
          </AppCard>

          {/* Analyse de tendance */}
          {chartData.validDays >= 2 && (
            <TrendIndicator 
              data={chartData.data} 
              period={chartData.validDays}
            />
          )}

          {/* Répartition des scores (Histogramme) */}
          {chartData.validDays >= 3 && (
            <ScoreDistribution data={chartData.data} />
          )}

          {/* Points Clés (Analyses médicales) */}
          {chartData.validDays >= 7 && (
            <KeyInsights data={chartData.data} />
          )}
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <AppText variant="headlineLarge" style={styles.noDataTitle}>
            Aucune donnée disponible
          </AppText>
          <AppText variant="bodyMedium" style={styles.noDataText}>
            Enregistrez des selles et complétez vos bilans pour voir l'évolution de votre santé.
          </AppText>
          <AppText variant="bodySmall" style={styles.noDataHint}>
            Conseil : Utilisez le Mode Développeur dans les Paramètres pour générer des données de test.
          </AppText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Espace pour éviter que le contenu soit coupé
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    color: '#2D3748',
    marginBottom: 6,
    fontWeight: '700',
  },
  subtitle: {
    color: '#718096',
    fontWeight: '400',
  },
  periodSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#2D3748',
    marginBottom: 12,
    fontWeight: '700',
  },
  statsGrid: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  chartTitle: {
    color: '#2D3748',
    marginBottom: 16,
    fontWeight: '700',
  },
  nativeChartPlaceholder: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderRadius: 8,
    padding: 24,
  },
  placeholderText: {
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  placeholderSubtext: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  noDataContainer: {
    marginHorizontal: 20,
    marginTop: 40,
    padding: 40,
    alignItems: 'center',
  },
  noDataTitle: {
    color: '#2D3748',
    marginBottom: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  noDataText: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  noDataHint: {
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
