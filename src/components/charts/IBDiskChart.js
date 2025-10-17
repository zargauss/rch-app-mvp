import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { RadarChart } from 'react-native-chart-kit';
import AppText from '../ui/AppText';
import AppCard from '../ui/AppCard';

const IBDiskChart = ({ data, date }) => {
  const { width } = Dimensions.get('window');
  const chartWidth = Math.min(width - 80, 350);
  const chartHeight = 350;

  // Configuration des données pour le graphique radar
  const chartData = {
    labels: [
      'Douleur\nabdominale',
      'Régulation\ndéfécation',
      'Vie\nsociale',
      'Activités\nprofessionnelles',
      'Sommeil',
      'Énergie',
      'Stress\nanxiété',
      'Image\nde soi',
      'Vie\nintime',
      'Douleur\narticulaire'
    ],
    datasets: [
      {
        data: [
          data.abdominal_pain || 0,
          data.bowel_regulation || 0,
          data.social_life || 0,
          data.professional_activities || 0,
          data.sleep || 0,
          data.energy || 0,
          data.stress_anxiety || 0,
          data.self_image || 0,
          data.intimate_life || 0,
          data.joint_pain || 0
        ],
        color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`, // Vert
        strokeWidth: 2,
        fillColor: (opacity = 1) => `rgba(5, 150, 105, ${opacity * 0.2})`, // Vert avec transparence
      }
    ]
  };

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, // Gris pour les axes
    labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`, // Gris foncé pour les labels
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#059669'
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // Lignes pleines
      stroke: '#E2E8F0',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: '600',
    }
  };

  // Calculer la moyenne des scores
  const scores = Object.values(data).filter(score => typeof score === 'number');
  const averageScore = scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : 0;

  return (
    <AppCard style={styles.container}>
      <View style={styles.header}>
        <AppText variant="headlineSmall" style={styles.title}>
          IBDisk - {date}
        </AppText>
        <AppText variant="bodyMedium" style={styles.subtitle}>
          Score moyen : {averageScore}/10
        </AppText>
      </View>

      <View style={styles.chartContainer}>
        <RadarChart
          data={chartData}
          width={chartWidth}
          height={chartHeight}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      {/* Légende des scores */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
          <AppText variant="labelSmall" style={styles.legendText}>
            Vos scores (0-10)
          </AppText>
        </View>
      </View>

      {/* Interprétation */}
      <View style={styles.interpretationContainer}>
        <AppText variant="labelSmall" style={styles.interpretationTitle}>
          💡 Interprétation
        </AppText>
        <AppText variant="labelSmall" style={styles.interpretationText}>
          • 0-3 : Très satisfaisant{'\n'}
          • 4-6 : Modérément satisfaisant{'\n'}
          • 7-10 : Peu satisfaisant
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    color: '#2D3748',
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#64748B',
    fontWeight: '600',
  },
  interpretationContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  interpretationTitle: {
    color: '#059669',
    fontWeight: '700',
    marginBottom: 8,
  },
  interpretationText: {
    color: '#047857',
    lineHeight: 18,
  },
});

export default IBDiskChart;
