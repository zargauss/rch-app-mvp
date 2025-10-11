import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import storage from '../utils/storage';
import AppText from '../components/ui/AppText';
import PrimaryButton from '../components/ui/PrimaryButton';
import AppCard from '../components/ui/AppCard';

export default function SettingsScreen() {
  const [isWiping, setIsWiping] = useState(false);

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
              storage.set('dailySells', '[]');
              storage.set('dailySurvey', '{}');
              storage.set('scoresHistory', '[]');
              storage.set('nightStart', '');
              storage.set('nightEnd', '');
              
              Alert.alert('Succès', 'Toutes les données ont été effacées.');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'effacer les données.');
            } finally {
              setIsWiping(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppText variant="title" style={styles.title}>Paramètres</AppText>
      
      <AppCard style={styles.card}>
        <AppText variant="body" style={styles.description}>
          Période nocturne définie de 23h à 6h du matin pour le calcul des scores.
        </AppText>
      </AppCard>

      <AppCard style={styles.card}>
        <AppText variant="body" style={styles.warningTitle}>Zone de danger</AppText>
        <AppText variant="caption" style={styles.warningText}>
          Cette action supprimera définitivement toutes vos données : selles, bilans quotidiens et historique des scores.
        </AppText>
        <PrimaryButton 
          mode="contained" 
          onPress={handleWipeData} 
          disabled={isWiping}
          buttonColor="#B00020"
          style={styles.wipeButton}
        >
          {isWiping ? 'Suppression...' : 'Effacer toutes les données'}
        </PrimaryButton>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    marginBottom: 16
  },
  card: {
    marginBottom: 16
  },
  description: {
    marginBottom: 8
  },
  warningTitle: {
    marginBottom: 8,
    color: '#B00020'
  },
  warningText: {
    marginBottom: 16,
    color: '#6B7280'
  },
  wipeButton: {
    alignSelf: 'flex-start'
  }
});
