import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { Text, SegmentedButtons, Card } from 'react-native-paper';
import storage from '../utils/storage';
import AppText from '../components/ui/AppText';
import AppCard from '../components/ui/AppCard';
import { useTheme } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const [scores, setScores] = useState([]);
  const [period, setPeriod] = useState('7'); // 7, 30, 90 jours
  const theme = useTheme();

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = () => {
    const histJson = storage.getString('scoresHistory');
    const history = histJson ? JSON.parse(histJson) : [];
    setScores(history);
  };

  const getChartData = () => {
    const days = parseInt(period);
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    
    // Créer un tableau de dates pour la période
    const dateRange = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dateRange.push(dateStr);
    }

    // Trouver les scores pour chaque date
    const chartData = dateRange.map(dateStr => {
      const scoreItem = scores.find(s => s.date === dateStr);
      return scoreItem ? scoreItem.score : null;
    });

    // Calculer les statistiques
    const validScores = chartData.filter(score => score !== null);
    const average = validScores.length > 0 ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) : 'N/A';
    const min = validScores.length > 0 ? Math.min(...validScores) : 'N/A';
    const max = validScores.length > 0 ? Math.max(...validScores) : 'N/A';

    return {
      labels: dateRange.map(dateStr => {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [{
        data: chartData.map(score => score !== null ? score : 0),
        color: (opacity = 1) => `rgba(0, 90, 156, ${opacity})`, // Couleur primaire du thème
        strokeWidth: 2
      }],
      average,
      min,
      max,
      validDays: validScores.length,
      totalDays: days,
      rawData: chartData // Données brutes pour le graphique à points
    };
  };

  const chartData = getChartData();

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 90, 156, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.primary
    }
  };

  const getTrendAnalysis = () => {
    const validScores = chartData.datasets[0].data.filter(score => score > 0);
    if (validScores.length < 3) return { text: "Données insuffisantes", color: theme.colors.placeholder };

    const recent = validScores.slice(-3);
    const older = validScores.slice(0, -3);
    
    if (older.length === 0) return { text: "Données insuffisantes", color: theme.colors.placeholder };

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff < -0.5) return { text: "📈 Amélioration", color: theme.colors.accent };
    if (diff > 0.5) return { text: "📉 Détérioration", color: theme.colors.error };
    return { text: "➡️ Stable", color: theme.colors.placeholder };
  };

  const trend = getTrendAnalysis();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppText variant="title" style={styles.title}>Évolution du Score</AppText>
      
      <AppCard style={styles.periodCard}>
        <AppText variant="body" style={styles.periodLabel}>Période d'analyse</AppText>
        <SegmentedButtons
          value={period}
          onValueChange={setPeriod}
          buttons={[
            { value: '7', label: '7 jours' },
            { value: '30', label: '30 jours' },
            { value: '90', label: '90 jours' }
          ]}
          style={styles.segmentedButtons}
        />
      </AppCard>

      <AppCard style={styles.chartCard}>
        <AppText variant="body" style={styles.chartTitle}>Score de Lichtiger</AppText>
        {chartData.validDays > 0 ? (
          Platform.OS === 'web' ? (
            <View style={styles.webChartContainer}>
              <AppText variant="body" style={styles.webChartText}>
                📊 Évolution du Score (Graphique à Points)
              </AppText>
              <View style={styles.pointsChart}>
                {chartData.rawData.map((score, index) => {
                  if (score === null) return null; // Ne pas afficher les points sans données
                  
                  const x = (index / (chartData.rawData.length - 1)) * 100; // Position X en pourcentage
                  const y = 100 - (score / 12) * 100; // Position Y inversée (0 en haut, 12 en bas)
                  
                  return (
                    <View key={index} style={styles.chartPoint}>
                      <View 
                        style={[
                          styles.point, 
                          { 
                            left: `${x}%`,
                            top: `${y}%`,
                            backgroundColor: score < 5 ? '#4CAF50' : score <= 10 ? '#FF9800' : '#F44336'
                          }
                        ]} 
                      />
                      <View style={[styles.pointLabel, { left: `${x}%` }]}>
                        <AppText variant="caption" style={styles.pointValue}>
                          {score}
                        </AppText>
                        <AppText variant="caption" style={styles.pointDate}>
                          {chartData.labels[index]}
                        </AppText>
                      </View>
                    </View>
                  );
                })}
                
                {/* Ligne de connexion entre les points */}
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
                      <AppText variant="caption" style={[styles.gridLabel, { top: `${100 - (value / 12) * 100}%` }]}>
                        {value}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <AppText variant="body" style={styles.noDataText}>
                Graphique disponible dans la version mobile
              </AppText>
            </View>
          )
        ) : (
          <View style={styles.noDataContainer}>
            <AppText variant="body" style={styles.noDataText}>
              Aucune donnée disponible pour cette période
            </AppText>
          </View>
        )}
      </AppCard>

      <AppCard style={styles.statsCard}>
        <AppText variant="body" style={styles.statsTitle}>Statistiques</AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <AppText variant="caption">Moyenne</AppText>
            <AppText variant="headline">{chartData.average}</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="caption">Minimum</AppText>
            <AppText variant="headline">{chartData.min}</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="caption">Maximum</AppText>
            <AppText variant="headline">{chartData.max}</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="caption">Jours avec données</AppText>
            <AppText variant="headline">{chartData.validDays}/{chartData.totalDays}</AppText>
          </View>
        </View>
      </AppCard>

      <AppCard style={styles.trendCard}>
        <AppText variant="body" style={styles.trendTitle}>Tendance</AppText>
        <AppText variant="headline" style={[styles.trendText, { color: trend.color }]}>
          {trend.text}
        </AppText>
        <AppText variant="caption" style={styles.trendDescription}>
          Basé sur la comparaison des 3 derniers jours avec la période précédente
        </AppText>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    marginBottom: 16,
    textAlign: 'center'
  },
  periodCard: {
    marginBottom: 16
  },
  periodLabel: {
    marginBottom: 8
  },
  segmentedButtons: {
    marginTop: 8
  },
  chartCard: {
    marginBottom: 16
  },
  chartTitle: {
    marginBottom: 16,
    textAlign: 'center'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noDataText: {
    textAlign: 'center',
    color: '#6B7280'
  },
  statsCard: {
    marginBottom: 16
  },
  statsTitle: {
    marginBottom: 16,
    textAlign: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16
  },
  trendCard: {
    marginBottom: 16
  },
  trendTitle: {
    marginBottom: 8,
    textAlign: 'center'
  },
  trendText: {
    textAlign: 'center',
    marginBottom: 8
  },
  trendDescription: {
    textAlign: 'center',
    color: '#6B7280'
  },
  webChartContainer: {
    alignItems: 'center',
    padding: 16
  },
  webChartText: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#6B7280'
  },
  pointsChart: {
    height: 200,
    width: '100%',
    position: 'relative',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  chartPoint: {
    position: 'absolute',
    zIndex: 3
  },
  point: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    marginLeft: -6,
    marginTop: -6,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3
  },
  pointLabel: {
    position: 'absolute',
    marginLeft: -20,
    marginTop: 15,
    width: 40,
    alignItems: 'center'
  },
  pointValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#005A9C',
    backgroundColor: 'white',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  pointDate: {
    fontSize: 8,
    color: '#666',
    marginTop: 2
  },
  chartLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#005A9C',
    opacity: 0.6
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#e0e0e0',
    opacity: 0.5
  },
  gridLabel: {
    position: 'absolute',
    left: -25,
    fontSize: 10,
    color: '#666',
    marginTop: -6
  }
});
