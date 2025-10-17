import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from '../ui/AppText';
import AppCard from '../ui/AppCard';

const KeyInsights = ({ data }) => {
  // Calculer les insights clés
  const insights = useMemo(() => {
    const validScores = data.filter(score => score !== null);
    if (validScores.length < 7) return null;

    const results = [];

    // 1. Tendance court terme (7 derniers jours vs 7 précédents)
    if (validScores.length >= 14) {
      const last7 = validScores.slice(-7);
      const previous7 = validScores.slice(-14, -7);
      
      const last7Avg = last7.reduce((a, b) => a + b, 0) / last7.length;
      const previous7Avg = previous7.reduce((a, b) => a + b, 0) / previous7.length;
      
      const diff = last7Avg - previous7Avg;
      const percentChange = previous7Avg !== 0 ? Math.abs((diff / previous7Avg) * 100) : 0;
      
      if (diff < -0.5) {
        results.push({
          type: 'improvement',
          icon: 'trending-up',
          title: 'Amélioration récente',
          description: `Votre score moyen a diminué de ${percentChange.toFixed(0)}% ces 7 derniers jours.`,
          color: '#10B981',
          backgroundColor: '#ECFDF5'
        });
      } else if (diff > 0.5) {
        results.push({
          type: 'decline',
          icon: 'trending-down',
          title: 'Dégradation récente',
          description: `Votre score moyen a augmenté de ${percentChange.toFixed(0)}% ces 7 derniers jours. Consultez votre médecin.`,
          color: '#EF4444',
          backgroundColor: '#FEF2F2'
        });
      } else {
        results.push({
          type: 'stable',
          icon: 'minus',
          title: 'Stabilité récente',
          description: `Votre score reste stable ces 7 derniers jours (variation de ${percentChange.toFixed(0)}%).`,
          color: '#F59E0B',
          backgroundColor: '#FFFBEB'
        });
      }
    }

    // 2. Stabilité globale (écart-type)
    const mean = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    const variance = validScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / validScores.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 1.5) {
      results.push({
        type: 'stability',
        icon: 'target',
        title: 'Scores très stables',
        description: `Vos scores varient peu (±${stdDev.toFixed(1)} points). Excellente régularité !`,
        color: '#10B981',
        backgroundColor: '#ECFDF5'
      });
    } else if (stdDev > 3) {
      results.push({
        type: 'variability',
        icon: 'lightning-bolt',
        title: 'Scores variables',
        description: `Vos scores varient beaucoup (±${stdDev.toFixed(1)} points). Identifiez les déclencheurs.`,
        color: '#F59E0B',
        backgroundColor: '#FFFBEB'
      });
    }

    // 3. Série actuelle de bons scores (< 5)
    let currentGoodStreak = 0;
    for (let i = validScores.length - 1; i >= 0; i--) {
      if (validScores[i] < 5) {
        currentGoodStreak++;
      } else {
        break;
      }
    }

    if (currentGoodStreak >= 5) {
      results.push({
        type: 'good-streak',
        icon: 'fire',
        title: `${currentGoodStreak} jours de rémission`,
        description: `Vous maintenez un score < 5 depuis ${currentGoodStreak} jours consécutifs. Continuez !`,
        color: '#10B981',
        backgroundColor: '#ECFDF5'
      });
    } else if (currentGoodStreak >= 3) {
      results.push({
        type: 'good-streak',
        icon: 'check-circle',
        title: `${currentGoodStreak} jours en amélioration`,
        description: `Vous maintenez un score < 5 depuis ${currentGoodStreak} jours. Bon début !`,
        color: '#10B981',
        backgroundColor: '#ECFDF5'
      });
    }

    // 4. Alerte : série de mauvais scores (>= 10)
    let currentBadStreak = 0;
    for (let i = validScores.length - 1; i >= 0; i--) {
      if (validScores[i] >= 10) {
        currentBadStreak++;
      } else {
        break;
      }
    }

    if (currentBadStreak >= 3) {
      results.push({
        type: 'alert',
        icon: 'alert',
        title: `Alerte : ${currentBadStreak} jours de poussée`,
        description: `Votre score est élevé (≥10) depuis ${currentBadStreak} jours. Consultez rapidement votre médecin.`,
        color: '#EF4444',
        backgroundColor: '#FEF2F2'
      });
    }

    // 5. Nombre de poussées dans la période
    let flareCount = 0;
    let inFlare = false;
    validScores.forEach(score => {
      if (score >= 10 && !inFlare) {
        flareCount++;
        inFlare = true;
      } else if (score < 10) {
        inFlare = false;
      }
    });

    if (flareCount > 0) {
      const days = validScores.length;
      const periodText = days >= 60 ? 'ces deux derniers mois' : days >= 30 ? 'ce mois' : 'cette période';
      
      if (flareCount === 1) {
        results.push({
          type: 'flares',
          icon: 'chart-bar',
          title: '1 poussée détectée',
          description: `Une seule poussée (score ≥10) détectée ${periodText}.`,
          color: '#F59E0B',
          backgroundColor: '#FFFBEB'
        });
      } else if (flareCount >= 3) {
        results.push({
          type: 'flares',
          icon: 'alert-circle',
          title: `${flareCount} poussées détectées`,
          description: `Poussées fréquentes ${periodText}. Parlez-en à votre médecin pour ajuster le traitement.`,
          color: '#EF4444',
          backgroundColor: '#FEF2F2'
        });
      }
    }

    // 6. Score le plus récent
    const lastScore = validScores[validScores.length - 1];
    if (lastScore === 0) {
      results.push({
        type: 'perfect',
          icon: 'star',
        title: 'Score parfait aujourd\'hui',
        description: 'Félicitations ! Votre score est de 0. Continuez vos bonnes habitudes.',
        color: '#10B981',
        backgroundColor: '#ECFDF5'
      });
    } else if (lastScore <= 2) {
      results.push({
        type: 'excellent',
        icon: '✨',
        title: 'Excellent score actuel',
        description: `Votre dernier score est de ${lastScore}. Vous êtes en très bonne forme !`,
        color: '#10B981',
        backgroundColor: '#ECFDF5'
      });
    }

    return results.length > 0 ? results : null;
  }, [data]);

  if (!insights || insights.length === 0) return null;

  return (
    <AppCard style={styles.container}>
      <View style={styles.titleContainer}>
        <MaterialCommunityIcons name="lightbulb-on" size={28} color="#2D3748" style={{ marginRight: 12 }} />
        <AppText variant="headlineLarge" style={styles.title}>
          Points Clés
        </AppText>
      </View>
      <AppText variant="bodyMedium" style={styles.subtitle}>
        Analyses médicalement pertinentes de votre évolution
      </AppText>
      <AppText variant="bodySmall" style={styles.infoSubtitle}>
        💡 Seuil de gravité : score ≥10 (selon les critères médicaux du score de Litchtiger)
      </AppText>

      <View style={styles.insightsContainer}>
        {insights.map((insight, index) => (
          <View 
            key={index} 
            style={[
              styles.insightCard,
              { 
                backgroundColor: insight.backgroundColor,
                borderColor: insight.color
              }
            ]}
          >
            <View style={styles.insightHeader}>
              <View style={[styles.iconContainer, { backgroundColor: insight.color + '20' }]}>
                <MaterialCommunityIcons name={insight.icon} size={24} color={insight.color} />
              </View>
              <View style={styles.textContainer}>
                <AppText variant="bodyLarge" style={[styles.insightTitle, { color: insight.color }]}>
                  {insight.title}
                </AppText>
                <AppText variant="bodyMedium" style={styles.insightDescription}>
                  {insight.description}
                </AppText>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Message informatif */}
      <View style={styles.infoBox}>
        <View style={styles.infoContent}>
          <MaterialCommunityIcons name="information" size={16} color="#64748B" style={{ marginRight: 8 }} />
          <AppText variant="labelSmall" style={styles.infoText}>
            Ces analyses vous aident à suivre votre évolution et à prendre des décisions éclairées avec votre médecin.
          </AppText>
        </View>
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: '#2D3748',
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748B',
    marginBottom: 8,
  },
  infoSubtitle: {
    color: '#059669',
    marginBottom: 20,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  insightsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  insightCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  insightTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  insightDescription: {
    color: '#475569',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    color: '#64748B',
    lineHeight: 16,
    flex: 1,
  },
});

export default KeyInsights;

