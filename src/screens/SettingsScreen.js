import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import storage from '../utils/storage';
import AppText from '../components/ui/AppText';
import PrimaryButton from '../components/ui/PrimaryButton';
import AppCard from '../components/ui/AppCard';
import { useTheme } from 'react-native-paper';
import { injectTestData, clearTestData, generateScenarioData } from '../utils/dataGenerator';

export default function SettingsScreen() {
  const [isWiping, setIsWiping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const theme = useTheme();

  // Générer des données de test
  const handleGenerateTestData = (scenario) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous générer des données de test ? Cela écrasera vos données actuelles.')) {
        setIsGenerating(true);
        try {
          const result = generateScenarioData(scenario);
          setIsGenerating(false);
          Alert.alert(
            'Données générées !',
            `${result.scores.length} jours de données ont été générés.\n\nAllez dans l'onglet Statistiques pour voir les graphiques.`,
            [{ text: 'OK', onPress: () => {} }]
          );
        } catch (error) {
          setIsGenerating(false);
          Alert.alert('Erreur', 'Impossible de générer les données de test.');
        }
      }
    } else {
      Alert.alert(
        'Générer des données de test',
        'Voulez-vous générer des données de test ? Cela écrasera vos données actuelles.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Générer',
            onPress: () => {
              setIsGenerating(true);
              try {
                const result = generateScenarioData(scenario);
                setIsGenerating(false);
                Alert.alert(
                  'Données générées !',
                  `${result.scores.length} jours de données ont été générés.\n\nAllez dans l'onglet Statistiques pour voir les graphiques.`
                );
              } catch (error) {
                setIsGenerating(false);
                Alert.alert('Erreur', 'Impossible de générer les données de test.');
              }
            }
          }
        ]
      );
    }
  };

  const handleWipeData = () => {
    Alert.alert(
      'Effacer toutes les données',
      'Êtes-vous sûr de vouloir supprimer toutes les données de l\'application ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Effacer', 
          style: 'destructive',
          onPress: () => {
            setIsWiping(true);
            
            try {
              // Effacer toutes les données
              console.log('Début de la suppression des données...');
              
              storage.set('dailySells', '[]');
              console.log('dailySells effacé');
              
              storage.set('dailySurvey', '{}');
              console.log('dailySurvey effacé');
              
              storage.set('scoresHistory', '[]');
              console.log('scoresHistory effacé');
              
              // Vérifier que les données ont bien été effacées
              const dailySells = storage.getString('dailySells');
              const dailySurvey = storage.getString('dailySurvey');
              const scoresHistory = storage.getString('scoresHistory');
              
              console.log('Vérification après suppression:');
              console.log('dailySells:', dailySells);
              console.log('dailySurvey:', dailySurvey);
              console.log('scoresHistory:', scoresHistory);
              
              if (dailySells === '[]' && dailySurvey === '{}' && scoresHistory === '[]') {
                Alert.alert('Succès', 'Toutes les données ont été effacées avec succès. Les écrans se mettront à jour automatiquement.');
              } else {
                Alert.alert('Attention', 'Certaines données n\'ont pas pu être effacées.');
              }
              
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', `Impossible d'effacer les données: ${error.message}`);
            } finally {
              setIsWiping(false);
            }
          }
        }
      ]
    );
  };

  const handleManualClear = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
        console.log('localStorage effacé manuellement');
        Alert.alert('Succès', 'localStorage effacé manuellement. Les écrans se mettront à jour automatiquement.');
      } catch (error) {
        console.error('Erreur localStorage:', error);
        Alert.alert('Erreur', `Erreur localStorage: ${error.message}`);
      }
    } else {
      Alert.alert('Info', 'localStorage non disponible (probablement sur mobile natif)');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <View style={styles.titleWithIcon}>
              <MaterialCommunityIcons name="cog" size={32} color="#2D3748" style={{ marginRight: 12 }} />
              <AppText variant="displayMedium" style={styles.title}>
                Paramètres
              </AppText>
            </View>
            <AppText variant="bodyMedium" style={styles.subtitle}>
              Configuration de l'application
            </AppText>
          </View>
          <View style={styles.menuIcon}>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color="#718096" />
          </View>
        </View>
      </View>
      
      {/* Informations sur la période nocturne */}
      <AppCard style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <MaterialCommunityIcons name="weather-night" size={28} color="#2D3748" style={{ marginRight: 16 }} />
          <AppText variant="headlineLarge" style={styles.infoTitle}>
            Période nocturne
          </AppText>
        </View>
        <AppText variant="bodyMedium" style={styles.infoDescription}>
          La période nocturne est définie de 23h à 6h du matin pour le calcul des scores de Lichtiger.
        </AppText>
      </AppCard>

      {/* Mode Développeur */}
      <AppCard style={styles.devCard}>
        <View style={styles.devHeader}>
          <MaterialCommunityIcons name="dice-multiple" size={24} color="#065F46" style={{ marginRight: 12 }} />
          <AppText variant="headlineLarge" style={styles.devTitle}>
            Mode Développeur
          </AppText>
        </View>
        <AppText variant="bodyMedium" style={styles.devDescription}>
          Générez des données de test pour voir les graphiques et tendances sans attendre. Parfait pour tester l'application !
        </AppText>
        
        <View style={styles.scenarioButtons}>
          <PrimaryButton 
            mode="contained" 
            onPress={() => handleGenerateTestData('realiste')} 
            disabled={isGenerating}
            buttonColor="#10B981"
            style={styles.scenarioButton}
            icon={isGenerating ? "timer-sand" : "chart-bar"}
          >
            {isGenerating ? 'Génération...' : 'Réaliste (60j)'}
          </PrimaryButton>
          
          <PrimaryButton 
            mode="outlined" 
            onPress={() => handleGenerateTestData('remission')} 
            disabled={isGenerating}
            buttonColor="#10B981"
            style={styles.scenarioButton}
            icon="trending-up"
          >
            Amélioration (60j)
          </PrimaryButton>
          
          <PrimaryButton 
            mode="outlined" 
            onPress={() => handleGenerateTestData('poussee')} 
            disabled={isGenerating}
            buttonColor="#F59E0B"
            style={styles.scenarioButton}
            icon="trending-down"
          >
            Poussée (30j)
          </PrimaryButton>
          
          <PrimaryButton 
            mode="outlined" 
            onPress={() => handleGenerateTestData('stable')} 
            disabled={isGenerating}
            buttonColor="#6366F1"
            style={styles.scenarioButton}
            icon="minus"
          >
            Stable (90j)
          </PrimaryButton>
        </View>
      </AppCard>

      {/* Zone de danger */}
      <AppCard style={styles.dangerCard}>
        <View style={styles.dangerHeader}>
          <MaterialCommunityIcons name="alert" size={28} color="#2D3748" style={{ marginRight: 16 }} />
          <AppText variant="headlineLarge" style={styles.dangerTitle}>
            Zone de danger
          </AppText>
        </View>
        <AppText variant="bodyMedium" style={styles.dangerDescription}>
          Cette action supprimera définitivement toutes vos données : selles, bilans quotidiens et historique des scores.
        </AppText>
        <PrimaryButton 
          mode="contained" 
          onPress={handleWipeData} 
          disabled={isWiping}
          buttonColor="#FF6B6B"
          style={styles.wipeButton}
          icon="delete-forever"
        >
          {isWiping ? 'Suppression...' : 'Effacer toutes les données'}
        </PrimaryButton>
        
        {/* Bouton de debug temporaire */}
        <PrimaryButton 
          mode="outlined" 
          onPress={handleManualClear}
          buttonColor="#4A90E2"
          style={styles.debugButton}
          icon="broom"
        >
          Effacer localStorage (Debug)
        </PrimaryButton>
      </AppCard>
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
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    color: '#2D3748',
    fontWeight: '700',
  },
  subtitle: {
    color: '#718096',
    fontWeight: '400',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    backgroundColor: '#E8F4FD',
    borderWidth: 1,
    borderColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    color: '#2D3748',
    fontWeight: '600',
  },
  infoDescription: {
    color: '#4A5568',
    fontWeight: '400',
  },
  devCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  devTitle: {
    color: '#065F46',
    fontWeight: '700',
  },
  devDescription: {
    color: '#047857',
    marginBottom: 20,
    lineHeight: 22,
  },
  scenarioButtons: {
    gap: 12,
  },
  scenarioButton: {
    borderRadius: 16,
    paddingVertical: 4,
  },
  dangerCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 24,
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dangerTitle: {
    color: '#2D3748',
    fontWeight: '600',
  },
  dangerDescription: {
    color: '#4A5568',
    marginBottom: 24,
    fontWeight: '400',
  },
  wipeButton: {
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  debugButton: {
    borderRadius: 16,
    paddingVertical: 4,
  },
});
