import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppCard from '../components/ui/AppCard';
import AppText from '../components/ui/AppText';
import PrimaryButton from '../components/ui/PrimaryButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import storage from '../utils/storage';
import { getSurveyDayKey } from '../utils/dayKey';
import designSystem from '../theme/designSystem';
import EmptyState from '../components/ui/EmptyState';

function getTodayKey() {
  return getSurveyDayKey(new Date(), 0);
}

export default function SurveyScreen() {
  const navigation = useNavigation();
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [ibdiskAvailable, setIbdiskAvailable] = useState(true);
  const [ibdiskDaysRemaining, setIbdiskDaysRemaining] = useState(0);
  const [surveysHistory, setSurveysHistory] = useState([]);
  const [ibdiskHistory, setIbdiskHistory] = useState([]);

  // Vérifier la disponibilité d'IBDisk
  const checkIBDiskAvailability = () => {
    const lastUsedStr = storage.getString('ibdiskLastUsed');
    if (!lastUsedStr) {
      setIbdiskAvailable(true);
      setIbdiskDaysRemaining(0);
      return;
    }

    const lastUsed = parseInt(lastUsedStr);
    const now = new Date().getTime();
    const daysSinceLastUsed = Math.floor((now - lastUsed) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastUsed >= 30) {
      setIbdiskAvailable(true);
      setIbdiskDaysRemaining(0);
    } else {
      setIbdiskAvailable(false);
      setIbdiskDaysRemaining(30 - daysSinceLastUsed);
    }
  };

  // Charger l'historique des bilans
  const loadSurveysHistory = () => {
    const json = storage.getString('dailySurvey');
    if (json) {
      const map = JSON.parse(json);
      const surveys = Object.keys(map)
        .map(key => ({
          date: key,
          data: map[key]
        }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10); // Les 10 derniers
      setSurveysHistory(surveys);
    } else {
      setSurveysHistory([]);
    }
  };

  // Charger l'historique IBDisk
  const loadIbdiskHistory = () => {
    const ibdiskJson = storage.getString('ibdiskHistory');
    const ibdiskList = ibdiskJson ? JSON.parse(ibdiskJson) : [];
    setIbdiskHistory(ibdiskList);
  };

  useFocusEffect(
    React.useCallback(() => {
      const key = getTodayKey();
      const json = storage.getString('dailySurvey');
      if (json) {
        const map = JSON.parse(json);
        setSurveyCompleted(Boolean(map[key]));
      } else {
        setSurveyCompleted(false);
      }
      
      checkIBDiskAvailability();
      loadSurveysHistory();
      loadIbdiskHistory();
    }, [])
  );

  const formatDate = (dateKey) => {
    // dateKey est au format "YYYY-MM-DD"
    const [year, month, day] = dateKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (dateKey) => {
    const [year, month, day] = dateKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section : Bilan à remplir */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clipboard-text" size={24} color={designSystem.colors.primary[500]} />
            <AppText variant="h3" style={styles.sectionTitle}>
              Bilan à remplir
            </AppText>
          </View>

          {/* Carte formulaire quotidien */}
          <AppCard 
            style={styles.surveyCard}
            onPress={() => navigation.navigate('DailySurvey')}
            pressable
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons 
                  name={surveyCompleted ? "check-circle" : "clipboard-text-outline"} 
                  size={32} 
                  color={surveyCompleted ? designSystem.colors.secondary[600] : designSystem.colors.primary[500]} 
                />
                <View style={styles.cardHeaderText}>
                  <AppText variant="h4" style={styles.cardTitle}>
                    Bilan quotidien
                  </AppText>
                  <AppText variant="bodySmall" style={styles.cardSubtitle}>
                    {surveyCompleted ? 'Complété aujourd\'hui' : 'À compléter aujourd\'hui'}
                  </AppText>
                </View>
              </View>
              {surveyCompleted && (
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color={designSystem.colors.text.tertiary} 
                />
              )}
            </View>
          </AppCard>

          {/* Carte IBDisk */}
          <AppCard 
            style={[styles.surveyCard, !ibdiskAvailable && styles.cardDisabled]}
            onPress={ibdiskAvailable ? () => navigation.navigate('IBDiskQuestionnaire') : null}
            pressable={ibdiskAvailable}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons 
                  name="chart-box-outline" 
                  size={32} 
                  color={ibdiskAvailable ? designSystem.colors.primary[500] : designSystem.colors.text.tertiary} 
                />
                <View style={styles.cardHeaderText}>
                  <AppText variant="h4" style={[styles.cardTitle, !ibdiskAvailable && styles.cardTitleDisabled]}>
                    Questionnaire IBDisk
                  </AppText>
                  <AppText variant="bodySmall" style={styles.cardSubtitle}>
                    {ibdiskAvailable 
                      ? 'Disponible maintenant' 
                      : `Disponible dans ${ibdiskDaysRemaining} jour${ibdiskDaysRemaining > 1 ? 's' : ''}`
                    }
                  </AppText>
                </View>
              </View>
              {ibdiskAvailable && (
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color={designSystem.colors.text.tertiary} 
                />
              )}
            </View>
          </AppCard>
        </View>

        {/* Section : Bilan à venir */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color={designSystem.colors.primary[500]} />
            <AppText variant="h3" style={styles.sectionTitle}>
              Bilan à venir
            </AppText>
          </View>

          {!ibdiskAvailable ? (
            <AppCard
              style={[styles.surveyCard, styles.disabledCard]}
              disabled
            >
              <View style={styles.surveyCardHeader}>
                <MaterialCommunityIcons
                  name="checkbox-multiple-marked-circle"
                  size={32}
                  color="#94A3B8"
                />
                <View style={styles.surveyCardContent}>
                  <AppText variant="h4" style={[styles.surveyCardTitle, styles.disabledText]}>
                    Questionnaire IBDisk
                  </AppText>
                  <AppText variant="bodySmall" style={[styles.surveyCardDescription, styles.disabledText]}>
                    Disponible dans {ibdiskDaysRemaining} jour{ibdiskDaysRemaining > 1 ? 's' : ''}
                  </AppText>
                </View>
              </View>
              <View style={styles.surveyCardFooter}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#94A3B8" />
                <AppText variant="bodySmall" style={styles.disabledText}>
                  Ce questionnaire est disponible une fois par mois
                </AppText>
              </View>
            </AppCard>
          ) : (
            <AppCard style={styles.infoCard}>
              <EmptyState
                icon="calendar-outline"
                title="Aucun bilan programmé"
                message="Les bilans quotidiens sont disponibles chaque jour. Le questionnaire IBDisk est disponible une fois par mois."
                variant="default"
              />
            </AppCard>
          )}
        </View>

        {/* Section : Historique des bilans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="history" size={24} color={designSystem.colors.primary[500]} />
            <AppText variant="h3" style={styles.sectionTitle}>
              Historique des bilans
            </AppText>
          </View>

          {/* Historique des bilans quotidiens */}
          {surveysHistory.length > 0 ? (
            <AppCard style={styles.historyCard}>
              <AppText variant="h4" style={styles.historySectionTitle}>
                Bilans quotidiens
              </AppText>
              {surveysHistory.map((survey, index) => (
                <TouchableOpacity
                  key={survey.date}
                  style={styles.historyItem}
                  onPress={() => {
                    // Naviguer vers le formulaire avec la date pré-remplie
                    navigation.navigate('DailySurvey', { date: survey.date });
                  }}
                >
                  <View style={styles.historyItemContent}>
                    <MaterialCommunityIcons 
                      name="clipboard-text" 
                      size={20} 
                      color={designSystem.colors.primary[500]} 
                    />
                    <View style={styles.historyItemText}>
                      <AppText variant="bodyMedium" style={styles.historyItemDate}>
                        {formatShortDate(survey.date)}
                      </AppText>
                      <AppText variant="bodySmall" style={styles.historyItemDetails}>
                        {survey.data.abdominalPain === 'aucune' ? 'Aucune douleur' : 
                         survey.data.abdominalPain === 'legeres' ? 'Douleurs légères' :
                         survey.data.abdominalPain === 'moyennes' ? 'Douleurs moyennes' : 'Douleurs intenses'}
                        {' • '}
                        {survey.data.generalState === 'parfait' ? 'Parfait' :
                         survey.data.generalState === 'tres_bon' ? 'Très bon' :
                         survey.data.generalState === 'bon' ? 'Bon' :
                         survey.data.generalState === 'moyen' ? 'Moyen' :
                         survey.data.generalState === 'mauvais' ? 'Mauvais' : 'Très mauvais'}
                      </AppText>
                    </View>
                  </View>
                  <MaterialCommunityIcons 
                    name="pencil" 
                    size={20} 
                    color={designSystem.colors.primary[500]} 
                  />
                </TouchableOpacity>
              ))}
            </AppCard>
          ) : (
            <AppCard style={styles.historyCard}>
              <EmptyState
                icon="clipboard-text-outline"
                title="Aucun bilan enregistré"
                message="Vos bilans quotidiens apparaîtront ici une fois complétés."
                variant="default"
              />
            </AppCard>
          )}

          {/* Historique IBDisk */}
          {ibdiskHistory.length > 0 ? (
            <AppCard style={styles.historyCard}>
              <AppText variant="h4" style={styles.historySectionTitle}>
                Questionnaires IBDisk
              </AppText>
              {ibdiskHistory.map((ibdisk, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyItemContent}>
                    <MaterialCommunityIcons 
                      name="chart-box" 
                      size={20} 
                      color={designSystem.colors.primary[500]} 
                    />
                    <View style={styles.historyItemText}>
                      <AppText variant="bodyMedium" style={styles.historyItemDate}>
                        {formatShortDate(ibdisk.date)}
                      </AppText>
                      <AppText variant="bodySmall" style={styles.historyItemDetails}>
                        Score calculé
                      </AppText>
                    </View>
                  </View>
                </View>
              ))}
            </AppCard>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: designSystem.spacing[4],
    paddingBottom: 100,
  },
  section: {
    marginBottom: designSystem.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing[4],
  },
  sectionTitle: {
    marginLeft: designSystem.spacing[3],
    color: designSystem.colors.text.primary,
  },
  surveyCard: {
    marginBottom: designSystem.spacing[3],
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardHeaderText: {
    marginLeft: designSystem.spacing[3],
    flex: 1,
  },
  cardTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[1],
  },
  cardTitleDisabled: {
    color: designSystem.colors.text.tertiary,
  },
  cardSubtitle: {
    color: designSystem.colors.text.secondary,
  },
  infoCard: {
    padding: designSystem.spacing[4],
  },
  historyCard: {
    marginBottom: designSystem.spacing[4],
  },
  historySectionTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[3],
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: designSystem.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: designSystem.colors.border.light,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyItemText: {
    marginLeft: designSystem.spacing[3],
    flex: 1,
  },
  historyItemDate: {
    color: designSystem.colors.text.primary,
    fontWeight: '500',
    marginBottom: designSystem.spacing[1],
  },
  historyItemDetails: {
    color: designSystem.colors.text.secondary,
  },
  surveyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing[3],
  },
  surveyCardContent: {
    marginLeft: designSystem.spacing[3],
    flex: 1,
  },
  surveyCardTitle: {
    color: designSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: designSystem.spacing[1],
  },
  surveyCardDescription: {
    color: designSystem.colors.text.secondary,
  },
  surveyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
    paddingTop: designSystem.spacing[3],
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.border.light,
  },
  disabledCard: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  disabledText: {
    color: '#94A3B8',
  },
});

