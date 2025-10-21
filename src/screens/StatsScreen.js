import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import storage from '../utils/storage';
import AppText from '../components/ui/AppText';
import AppCard from '../components/ui/AppCard';
import StatCard from '../components/ui/StatCard';
import SegmentedControl from '../components/ui/SegmentedControl';
import TrendChart from '../components/charts/TrendChart';
import TrendIndicator from '../components/charts/TrendIndicator';
import ScoreDistribution from '../components/charts/ScoreDistribution';
import KeyInsights from '../components/charts/KeyInsights';
import EmptyState from '../components/ui/EmptyState';
import { useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import designSystem from '../theme/designSystem';

export default function StatsScreen() {
  const [scores, setScores] = useState([]);
  const [stools, setStools] = useState([]);
  const [period, setPeriod] = useState('30'); // 7, 30, 90 jours
  const [dataType, setDataType] = useState('score'); // 'score' ou 'stools'
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  // Recharger les données à chaque fois qu'on navigue vers cet écran
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // Recharger les données périodiquement pour capturer les changements
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 2000); // Recharger toutes les 2 secondes

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    // Charger les scores
    const scoresJson = storage.getString('scoresHistory');
    if (scoresJson) {
      const history = JSON.parse(scoresJson);
      setScores(history);
    } else {
      setScores([]);
    }

    // Charger les selles
    const stoolsJson = storage.getString('dailySells');
    if (stoolsJson) {
      const stoolsData = JSON.parse(stoolsJson);
      setStools(stoolsData);
    } else {
      setStools([]);
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

    const labels = dateRange.map(dateStr => {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    if (dataType === 'score') {
      // Données des scores
      const chartDataArray = dateRange.map(dateStr => {
        const scoreEntry = scores.find(s => s.date === dateStr);
        return scoreEntry ? scoreEntry.score : null;
      });

      const validScores = chartDataArray.filter(score => score !== null);
      const average = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;
      const min = validScores.length > 0 ? Math.min(...validScores) : null;
      const max = validScores.length > 0 ? Math.max(...validScores) : null;

      return {
        labels,
        data: chartDataArray,
        average,
        min,
        max,
        validDays: validScores.length,
        totalDays: days
      };
    } else {
      // Données des selles (nombre de selles par jour)
      const chartDataArray = dateRange.map(dateStr => {
        // Convertir la date en timestamps (début et fin du jour)
        const [y, m, d] = dateStr.split('-').map(Number);
        const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000;
        
        // Filtrer les selles de ce jour
        const dayStool = stools.filter(s => s.timestamp >= dayStart && s.timestamp < dayEnd);
        return dayStool.length > 0 ? dayStool.length : null;
      });

      const validDays = chartDataArray.filter(count => count !== null);
      const average = validDays.length > 0 ? validDays.reduce((a, b) => a + b, 0) / validDays.length : null;
      const min = validDays.length > 0 ? Math.min(...validDays) : null;
      const max = validDays.length > 0 ? Math.max(...validDays) : null;

      // Calcul du nombre total de selles
      const totalStools = validDays.length > 0 ? validDays.reduce((a, b) => a + b, 0) : 0;

      return {
        labels,
        data: chartDataArray,
        average,
        min,
        max,
        validDays: validDays.length,
        totalDays: days,
        totalStools
      };
    }
  }, [scores, stools, period, dataType]);

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

      {/* Sélecteur de type de données */}
      <View style={styles.dataTypeSection}>
        <SegmentedButtons
          value={dataType}
          onValueChange={setDataType}
          buttons={[
            {
              value: 'score',
              label: 'Score Lichtiger',
              icon: 'chart-line',
            },
            {
              value: 'stools',
              label: 'Selles',
              icon: 'toilet',
            },
          ]}
        />
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
            {dataType === 'score' ? (
              <>
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
              </>
            ) : (
              <>
                <StatCard
                  title="Moyenne par jour"
                  value={chartData.average !== null ? chartData.average.toFixed(1) : 'N/A'}
                  subtitle={`Sur ${chartData.validDays} jours`}
                  icon="chart-bar"
                  color={chartData.average !== null ? (chartData.average <= 3 ? 'success' : chartData.average <= 6 ? 'warning' : 'error') : 'info'}
                />
                
                <StatCard
                  title="Jour le plus calme"
                  value={chartData.min !== null ? chartData.min.toString() : 'N/A'}
                  subtitle="Minimum de selles"
                  icon="check-circle"
                  color="success"
                />
                
                <StatCard
                  title="Jour le plus actif"
                  value={chartData.max !== null ? chartData.max.toString() : 'N/A'}
                  subtitle="Maximum de selles"
                  icon="alert-circle"
                  color="error"
                />
              </>
            )}
          </View>

          {/* Graphique d'évolution */}
          <AppCard style={styles.chartCard}>
            <AppText variant="headlineLarge" style={styles.chartTitle}>
              {dataType === 'score' ? 'Évolution du Score' : 'Évolution des Selles'}
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
              dataType={dataType}
            />
          )}

          {/* Répartition des scores/selles (Histogramme) */}
          {chartData.validDays >= 3 && (
            <ScoreDistribution 
              data={chartData.data}
              dataType={dataType}
            />
          )}

          {/* Points Clés (Analyses médicales) - uniquement pour les scores */}
          {chartData.validDays >= 7 && dataType === 'score' && (
            <KeyInsights data={chartData.data} />
          )}
        </>
      ) : (
        <EmptyState
          icon="chart-line-variant"
          title="Aucune donnée disponible"
          description="Enregistrez des selles et complétez vos bilans pour voir l'évolution de votre santé. Conseil : Utilisez le Mode Développeur dans les Paramètres pour générer des données de test."
          variant="default"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: designSystem.spacing[4],
    paddingTop: designSystem.spacing[4],
    paddingBottom: designSystem.spacing[6],
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
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[2],
  },
  subtitle: {
    color: designSystem.colors.text.secondary,
  },
  dataTypeSection: {
    paddingHorizontal: designSystem.spacing[4],
    marginBottom: designSystem.spacing[4],
  },
  periodSection: {
    paddingHorizontal: designSystem.spacing[4],
    marginBottom: designSystem.spacing[6],
  },
  sectionTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[3],
  },
  statsGrid: {
    paddingHorizontal: designSystem.spacing[4],
    gap: designSystem.spacing[4],
    marginBottom: designSystem.spacing[6],
  },
  chartCard: {
    marginHorizontal: designSystem.spacing[4],
    marginBottom: designSystem.spacing[6],
  },
  chartTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[4],
  },
  nativeChartPlaceholder: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.borderRadius.base,
    padding: designSystem.spacing[6],
  },
  placeholderText: {
    color: designSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: designSystem.spacing[2],
  },
  placeholderSubtext: {
    color: designSystem.colors.text.tertiary,
    textAlign: 'center',
  },
});
