import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from '../components/ui/AppText';
import AppCard from '../components/ui/AppCard';
import EmptyState from '../components/ui/EmptyState';
import { useFocusEffect } from '@react-navigation/native';
import designSystem from '../theme/designSystem';
import { getFormattedCorrelations } from '../utils/correlationAnalyzer';

/**
 * Écran des insights IA - Corrélations entre tags et symptômes
 */
export default function InsightsScreen() {
  const [correlations, setCorrelations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les corrélations au montage et à chaque focus
  useFocusEffect(
    React.useCallback(() => {
      loadCorrelations();
    }, [])
  );

  const loadCorrelations = () => {
    setIsLoading(true);
    try {
      const results = getFormattedCorrelations();
      setCorrelations(results);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des corrélations:', error);
      setCorrelations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCorrelations();
    setTimeout(() => setRefreshing(false), 500);
  };

  const renderCorrelationCard = (correlation, index) => {
    const { icon, title, description, severity, occurrences, metricLabel } = correlation;

    // Couleurs selon la sévérité
    const severityColors = {
      high: {
        bg: designSystem.colors.error[50],
        border: designSystem.colors.error[300],
        text: designSystem.colors.error[700],
      },
      medium: {
        bg: designSystem.colors.warning[50],
        border: designSystem.colors.warning[300],
        text: designSystem.colors.warning[700],
      },
      low: {
        bg: designSystem.colors.success[50],
        border: designSystem.colors.success[300],
        text: designSystem.colors.success[700],
      },
    };

    const colors = severityColors[severity] || severityColors.low;

    return (
      <AppCard
        key={index}
        style={[
          styles.correlationCard,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.correlationHeader}>
          <View style={styles.correlationTitleRow}>
            <AppText style={styles.correlationIcon}>{icon}</AppText>
            <AppText variant="h3" style={[styles.correlationTitle, { color: colors.text }]}>
              {title}
            </AppText>
          </View>
          <View style={styles.occurrenceBadge}>
            <AppText variant="labelSmall" style={styles.occurrenceText}>
              {occurrences} fois
            </AppText>
          </View>
        </View>

        <AppText variant="bodyMedium" style={[styles.correlationDescription, { color: colors.text }]}>
          → {description}
        </AppText>

        <View style={styles.correlationFooter}>
          <View style={styles.metricBadge}>
            <MaterialCommunityIcons
              name={
                metricLabel === 'nombre de selles' ? 'toilet' :
                metricLabel === 'selles sanglantes' ? 'water-alert' :
                'chart-line'
              }
              size={14}
              color={designSystem.colors.text.secondary}
            />
            <AppText variant="labelSmall" style={styles.metricLabel}>
              {metricLabel}
            </AppText>
          </View>
        </View>
      </AppCard>
    );
  };

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="brain" size={32} color={designSystem.colors.primary[500]} />
          <AppText variant="h1" style={styles.title}>
            Insights IA
          </AppText>
          <AppText variant="bodyMedium" style={styles.subtitle}>
            Analyse des corrélations entre vos habitudes et vos symptômes
          </AppText>
        </View>

        <AppCard style={styles.loadingCard}>
          <AppText variant="bodyMedium" style={styles.loadingText}>
            Analyse en cours...
          </AppText>
        </AppCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="brain" size={32} color={designSystem.colors.primary[500]} />
        <AppText variant="h1" style={styles.title}>
          Insights IA
        </AppText>
        <AppText variant="bodyMedium" style={styles.subtitle}>
          Analyse des corrélations entre vos habitudes et vos symptômes
        </AppText>
      </View>

      {/* Info Card */}
      <AppCard style={styles.infoCard}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={designSystem.colors.primary[500]}
          />
          <AppText variant="bodySmall" style={styles.infoText}>
            L'analyse compare vos habitudes (alimentation, stress, etc.) avec vos symptômes sur 7 jours.
            Minimum 3 occurrences requises. Impact de J+0 à J+4.
          </AppText>
        </View>
      </AppCard>

      {/* Légende */}
      <AppCard style={styles.legendCard}>
        <AppText variant="bodySmall" style={styles.legendTitle}>
          Niveau d'impact
        </AppText>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <AppText style={styles.legendIcon}>🔴</AppText>
            <AppText variant="labelSmall" style={styles.legendText}>
              Fort (&gt;50%)
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <AppText style={styles.legendIcon}>🟡</AppText>
            <AppText variant="labelSmall" style={styles.legendText}>
              Modéré (20-50%)
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <AppText style={styles.legendIcon}>🟢</AppText>
            <AppText variant="labelSmall" style={styles.legendText}>
              Faible (&lt;20%)
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Liste des corrélations */}
      {correlations.length === 0 ? (
        <EmptyState
          icon="chart-line-variant"
          title="Aucune corrélation détectée"
          message="Continuez à ajouter des notes avec des tags pour que l'IA puisse détecter des corrélations significatives."
        />
      ) : (
        <View style={styles.correlationsContainer}>
          <AppText variant="h2" style={styles.sectionTitle}>
            Corrélations détectées ({correlations.length})
          </AppText>
          {correlations.map((correlation, index) => renderCorrelationCard(correlation, index))}
        </View>
      )}

      {/* Footer info */}
      <AppCard style={styles.footerCard}>
        <MaterialCommunityIcons
          name="lightbulb-outline"
          size={20}
          color={designSystem.colors.warning[500]}
        />
        <AppText variant="bodySmall" style={styles.footerText}>
          Ces corrélations sont indicatives. Consultez votre médecin pour un diagnostic personnalisé.
        </AppText>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
  },
  header: {
    alignItems: 'center',
    padding: designSystem.spacing[5],
    paddingBottom: designSystem.spacing[3],
  },
  title: {
    color: designSystem.colors.text.primary,
    marginTop: designSystem.spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    color: designSystem.colors.text.secondary,
    textAlign: 'center',
    marginTop: designSystem.spacing[1],
  },
  infoCard: {
    margin: designSystem.spacing[4],
    marginBottom: designSystem.spacing[3],
    backgroundColor: designSystem.colors.primary[50],
    borderWidth: 1,
    borderColor: designSystem.colors.primary[200],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: designSystem.spacing[2],
  },
  infoText: {
    flex: 1,
    color: designSystem.colors.primary[700],
    lineHeight: 18,
  },
  legendCard: {
    marginHorizontal: designSystem.spacing[4],
    marginBottom: designSystem.spacing[4],
    backgroundColor: designSystem.colors.background.secondary,
  },
  legendTitle: {
    color: designSystem.colors.text.secondary,
    fontWeight: '600',
    marginBottom: designSystem.spacing[2],
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[1],
  },
  legendIcon: {
    fontSize: 16,
  },
  legendText: {
    color: designSystem.colors.text.secondary,
  },
  correlationsContainer: {
    paddingHorizontal: designSystem.spacing[4],
  },
  sectionTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[3],
  },
  correlationCard: {
    marginBottom: designSystem.spacing[3],
    borderWidth: 1,
  },
  correlationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: designSystem.spacing[2],
  },
  correlationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
    flex: 1,
  },
  correlationIcon: {
    fontSize: 24,
  },
  correlationTitle: {
    fontWeight: '700',
    flex: 1,
  },
  occurrenceBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: designSystem.spacing[2],
    paddingVertical: 4,
    borderRadius: designSystem.borderRadius.full,
  },
  occurrenceText: {
    color: designSystem.colors.text.primary,
    fontWeight: '600',
  },
  correlationDescription: {
    fontWeight: '500',
    marginBottom: designSystem.spacing[2],
    fontSize: designSystem.typography.fontSize.base,
  },
  correlationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[1],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: designSystem.spacing[2],
    paddingVertical: 4,
    borderRadius: designSystem.borderRadius.md,
  },
  metricLabel: {
    color: designSystem.colors.text.secondary,
    fontWeight: '500',
  },
  footerCard: {
    margin: designSystem.spacing[4],
    marginTop: designSystem.spacing[5],
    backgroundColor: designSystem.colors.warning[50],
    borderWidth: 1,
    borderColor: designSystem.colors.warning[200],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: designSystem.spacing[2],
  },
  footerText: {
    flex: 1,
    color: designSystem.colors.warning[800],
    lineHeight: 18,
  },
  loadingCard: {
    margin: designSystem.spacing[4],
    alignItems: 'center',
    paddingVertical: designSystem.spacing[6],
  },
  loadingText: {
    color: designSystem.colors.text.secondary,
  },
});
