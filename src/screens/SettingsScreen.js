import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import storage from '../utils/storage';
import AppText from '../components/ui/AppText';
import PrimaryButton from '../components/ui/PrimaryButton';
import AppCard from '../components/ui/AppCard';
import { useTheme } from 'react-native-paper';

export default function SettingsScreen() {
  const [isWiping, setIsWiping] = useState(false);
  const theme = useTheme();

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
                Alert.alert('Succès', 'Toutes les données ont été effacées avec succès.');
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <AppText variant="displayMedium" style={styles.title}>
              ⚙️ Paramètres
            </AppText>
            <AppText variant="bodyMedium" style={styles.subtitle}>
              Configuration de l'application
            </AppText>
          </View>
          <View style={styles.menuIcon}>
            <AppText style={styles.menuEmoji}>⋯</AppText>
          </View>
        </View>
      </View>
      
      {/* Informations sur la période nocturne */}
      <AppCard style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <AppText style={styles.infoIcon}>🌙</AppText>
          <AppText variant="headlineLarge" style={styles.infoTitle}>
            Période nocturne
          </AppText>
        </View>
        <AppText variant="bodyMedium" style={styles.infoDescription}>
          La période nocturne est définie de 23h à 6h du matin pour le calcul des scores de Lichtiger.
        </AppText>
      </AppCard>

      {/* Zone de danger */}
      <AppCard style={styles.dangerCard}>
        <View style={styles.dangerHeader}>
          <AppText style={styles.dangerIcon}>⚠️</AppText>
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
        >
          {isWiping ? 'Suppression...' : 'Effacer toutes les données'}
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
  title: {
    color: '#2D3748',
    marginBottom: 6,
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
  menuEmoji: {
    fontSize: 20,
    color: '#718096',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    backgroundColor: '#E8F4FD',
    borderRadius: 20,
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
  infoIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  infoTitle: {
    color: '#2D3748',
    fontWeight: '600',
  },
  infoDescription: {
    color: '#4A5568',
    fontWeight: '400',
  },
  dangerCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 24,
    backgroundColor: '#FFE8E8',
    borderRadius: 20,
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
  dangerIcon: {
    fontSize: 28,
    marginRight: 16,
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
  },
});
