import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import AppCard from '../components/ui/AppCard';
import AppText from '../components/ui/AppText';
import AppTextInput from '../components/ui/AppTextInput';
import PrimaryButton from '../components/ui/PrimaryButton';
import { setGoogleAIAPIKey, getGoogleAIAPIKey } from '../utils/aiService';

export default function AIConfigScreen() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  // Charger la clé API au montage du composant
  React.useEffect(() => {
    const savedKey = getGoogleAIAPIKey();
    if (savedKey && savedKey !== 'YOUR_API_KEY_HERE') {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveAPIKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre clé API Google AI Studio');
      return;
    }

    setIsLoading(true);
    try {
      setGoogleAIAPIKey(apiKey.trim());
      Alert.alert('Succès', 'Clé API sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur sauvegarde API key:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la clé API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAPI = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Erreur', 'Veuillez d\'abord saisir votre clé API');
      return;
    }

    setIsLoading(true);
    try {
      // Test simple de l'API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Test de connexion'
            }]
          }]
        })
      });

      if (response.ok) {
        Alert.alert('Succès', 'Connexion à l\'API Google AI réussie !');
      } else {
        Alert.alert('Erreur', 'Clé API invalide ou problème de connexion');
      }
    } catch (error) {
      console.error('Erreur test API:', error);
      Alert.alert('Erreur', 'Impossible de tester la connexion API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="cog" size={24} color="#059669" style={{ marginRight: 12 }} />
        <AppText variant="headlineLarge" style={styles.headerTitle}>
          Configuration IA
        </AppText>
      </View>

      {/* Instructions */}
      <AppCard style={styles.instructionCard}>
        <View style={styles.instructionHeader}>
          <MaterialCommunityIcons name="information" size={20} color="#059669" style={{ marginRight: 8 }} />
          <AppText variant="headlineSmall" style={styles.instructionTitle}>
            Comment obtenir votre clé API ?
          </AppText>
        </View>
        <AppText variant="bodyMedium" style={styles.instructionText}>
          1. Allez sur{' '}
          <AppText variant="bodyMedium" style={styles.linkText}>
            https://aistudio.google.com
          </AppText>
        </AppText>
        <AppText variant="bodyMedium" style={styles.instructionText}>
          2. Connectez-vous avec votre compte Google
        </AppText>
        <AppText variant="bodyMedium" style={styles.instructionText}>
          3. Cliquez sur "Get API Key" dans le menu
        </AppText>
        <AppText variant="bodyMedium" style={styles.instructionText}>
          4. Créez une nouvelle clé API
        </AppText>
        <AppText variant="bodyMedium" style={styles.instructionText}>
          5. Copiez la clé et collez-la ci-dessous
        </AppText>
      </AppCard>

      {/* Configuration API */}
      <AppCard style={styles.configCard}>
        <View style={styles.configHeader}>
          <MaterialCommunityIcons name="key" size={20} color="#059669" style={{ marginRight: 8 }} />
          <AppText variant="headlineSmall" style={styles.configTitle}>
            Clé API Google AI Studio
          </AppText>
        </View>
        
        <AppTextInput
          label="Clé API"
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Collez votre clé API ici..."
          secureTextEntry={true}
          style={styles.apiKeyInput}
        />
        
        <View style={styles.buttonContainer}>
          <PrimaryButton
            mode="outlined"
            onPress={handleTestAPI}
            loading={isLoading}
            disabled={!apiKey.trim() || isLoading}
            buttonColor="#059669"
            style={styles.testButton}
            icon="test-tube"
          >
            Tester la connexion
          </PrimaryButton>
          
          <PrimaryButton
            mode="contained"
            onPress={handleSaveAPIKey}
            loading={isLoading}
            disabled={!apiKey.trim() || isLoading}
            buttonColor="#059669"
            style={styles.saveButton}
            icon="content-save"
          >
            Sauvegarder
          </PrimaryButton>
        </View>
      </AppCard>

      {/* Informations importantes */}
      <AppCard style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#059669" style={{ marginRight: 8 }} />
          <AppText variant="headlineSmall" style={styles.infoTitle}>
            Sécurité et confidentialité
          </AppText>
        </View>
        <AppText variant="bodyMedium" style={styles.infoText}>
          • Votre clé API est stockée localement sur votre appareil
        </AppText>
        <AppText variant="bodyMedium" style={styles.infoText}>
          • L'IA répond uniquement basée sur les sources médicales officielles
        </AppText>
        <AppText variant="bodyMedium" style={styles.infoText}>
          • Aucune donnée personnelle n'est transmise à Google
        </AppText>
        <AppText variant="bodyMedium" style={styles.infoText}>
          • L'assistant ne remplace pas l'avis médical professionnel
        </AppText>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    color: '#059669',
    fontWeight: '700',
  },
  instructionCard: {
    margin: 16,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionTitle: {
    color: '#059669',
    fontWeight: '600',
  },
  instructionText: {
    color: '#047857',
    marginBottom: 8,
    lineHeight: 20,
  },
  linkText: {
    color: '#059669',
    fontWeight: '600',
  },
  configCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  configTitle: {
    color: '#059669',
    fontWeight: '600',
  },
  apiKeyInput: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    color: '#D97706',
    fontWeight: '600',
  },
  infoText: {
    color: '#92400E',
    marginBottom: 6,
    lineHeight: 18,
  },
});
