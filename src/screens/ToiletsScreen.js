import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Portal, Modal, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';

import AppCard from '../components/ui/AppCard';
import AppText from '../components/ui/AppText';
import PrimaryButton from '../components/ui/PrimaryButton';
import Toast from '../components/ui/Toast';
import designSystem from '../theme/designSystem';

import {
  fetchNearbyToilets,
  sortToiletsByDistance,
  formatDistance,
  generateNavigationUrl
} from '../services/toiletsService';

const { width, height } = Dimensions.get('window');

export default function ToiletsScreen() {
  // États pour la géolocalisation
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  
  // États pour les toilettes
  const [toilets, setToilets] = useState([]);
  const [toiletsLoading, setToiletsLoading] = useState(false);
  const [toiletsError, setToiletsError] = useState(null);
  
  // États pour l'interface
  const [selectedToilet, setSelectedToilet] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Demander la permission de géolocalisation
  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      // Vérifier si la géolocalisation est disponible
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Permission de géolocalisation refusée');
      }

      // Obtenir la position actuelle
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);
      console.log('📍 Position utilisateur:', coords);
      
      // Charger les toilettes proches
      await loadNearbyToilets(coords);

    } catch (error) {
      console.error('❌ Erreur de géolocalisation:', error);
      setLocationError(error.message);
      
      // Utiliser des données de test en cas d'erreur
      const mockLocation = { latitude: 48.8566, longitude: 2.3522 };
      setUserLocation(mockLocation);
      setToilets(getMockToilets());
      
    } finally {
      setLocationLoading(false);
    }
  };

  // Charger les toilettes proches
  const loadNearbyToilets = async (coords) => {
    try {
      setToiletsLoading(true);
      setToiletsError(null);

      const nearbyToilets = await fetchNearbyToilets(
        coords.latitude,
        coords.longitude,
        1000, // 1 km de rayon
        20    // Maximum 20 résultats
      );

      // Trier par distance
      const sortedToilets = sortToiletsByDistance(
        nearbyToilets,
        coords.latitude,
        coords.longitude
      );

      setToilets(sortedToilets);
      console.log(`🚽 ${sortedToilets.length} toilettes chargées`);

    } catch (error) {
      console.error('❌ Erreur lors du chargement des toilettes:', error);
      setToiletsError(error.message);
      
      // Utiliser des données de test en cas d'erreur
      setToilets(getMockToilets());
    } finally {
      setToiletsLoading(false);
    }
  };

  // Ouvrir la navigation vers une toilette
  const openNavigation = async (toilet) => {
    if (!userLocation) {
      showToast('Position non disponible', 'error');
      return;
    }

    try {
      const url = generateNavigationUrl(
        userLocation.latitude,
        userLocation.longitude,
        toilet.coordinates.latitude,
        toilet.coordinates.longitude
      );

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        console.log('🧭 Navigation ouverte vers:', toilet.name);
      } else {
        showToast('Impossible d\'ouvrir la navigation', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur navigation:', error);
      showToast('Erreur lors de l\'ouverture de la navigation', 'error');
    }
  };

  // Afficher un toast
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Recharger les données
  const refreshData = () => {
    if (userLocation) {
      loadNearbyToilets(userLocation);
    } else {
      requestLocationPermission();
    }
  };

  // Effet initial
  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      {/* En-tête avec informations */}
      <View style={styles.header}>
        <AppCard style={styles.headerCard}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons 
              name="toilet" 
              size={32} 
              color={designSystem.colors.primary[500]} 
            />
            <View style={styles.headerText}>
              <AppText variant="h4" style={styles.headerTitle}>
                Toilettes Publiques
              </AppText>
              <AppText variant="bodyMedium" style={styles.headerSubtitle}>
                Trouvez les toilettes les plus proches
              </AppText>
            </View>
          </View>
          
          {locationLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={designSystem.colors.primary[500]} />
              <AppText variant="bodySmall" style={styles.loadingText}>
                Recherche de votre position...
              </AppText>
            </View>
          )}
          
          {locationError && (
            <View style={styles.errorContainer}>
              <AppText variant="bodySmall" style={styles.errorText}>
                ⚠️ {locationError}
              </AppText>
              <PrimaryButton
                onPress={requestLocationPermission}
                variant="primary"
                size="small"
                style={styles.retryButton}
              >
                Réessayer
              </PrimaryButton>
            </View>
          )}
        </AppCard>
      </View>

      {/* Zone d'information de position */}
      <View style={styles.mapContainer}>
        <AppCard style={styles.mapPlaceholder}>
          <View style={styles.mapPlaceholderContent}>
            <MaterialCommunityIcons 
              name="map-marker" 
              size={48} 
              color={designSystem.colors.primary[500]} 
            />
            <AppText variant="h6" style={styles.mapPlaceholderTitle}>
              Votre position
            </AppText>
            <AppText variant="bodyMedium" style={styles.mapPlaceholderText}>
              {userLocation 
                ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
                : 'Position non disponible'
              }
            </AppText>
            <AppText variant="bodySmall" style={styles.mapPlaceholderSubtext}>
              Recherche dans un rayon de 1 km
            </AppText>
          </View>
        </AppCard>
      </View>

      {/* Liste des toilettes */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {toiletsLoading && (
          <AppCard style={styles.loadingCard}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={designSystem.colors.primary[500]} />
              <AppText variant="bodyMedium" style={styles.loadingText}>
                Recherche des toilettes...
              </AppText>
            </View>
          </AppCard>
        )}
        
        {toiletsError && !toiletsLoading && (
          <AppCard style={styles.errorCard}>
            <View style={styles.errorContent}>
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={24} 
                color={designSystem.colors.health.danger.main} 
              />
              <AppText variant="bodyMedium" style={styles.errorText}>
                {toiletsError}
              </AppText>
              <PrimaryButton
                onPress={refreshData}
                variant="primary"
                size="small"
                style={styles.retryButton}
              >
                Réessayer
              </PrimaryButton>
            </View>
          </AppCard>
        )}
        
        {toilets.length > 0 && !toiletsLoading && (
          <View style={styles.toiletsList}>
            <AppText variant="h5" style={styles.listTitle}>
              {toilets.length} toilette{toilets.length > 1 ? 's' : ''} trouvée{toilets.length > 1 ? 's' : ''}
            </AppText>
            
            {toilets.map((toilet, index) => (
              <AppCard key={toilet.id} style={styles.toiletCard}>
                <View style={styles.toiletHeader}>
                  <View style={styles.toiletInfo}>
                    <AppText variant="h6" style={styles.toiletName}>
                      {toilet.name}
                    </AppText>
                    <AppText variant="bodySmall" style={styles.toiletDistance}>
                      📍 {formatDistance(toilet.distance)}
                    </AppText>
                  </View>
                  <View style={styles.toiletBadge}>
                    <AppText variant="caption" style={styles.badgeText}>
                      #{index + 1}
                    </AppText>
                  </View>
                </View>
                
                <AppText variant="bodyMedium" style={styles.toiletAddress}>
                  {toilet.address}
                </AppText>
                
                <View style={styles.toiletDetails}>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons 
                      name="clock-outline" 
                      size={16} 
                      color={designSystem.colors.text.secondary} 
                    />
                    <AppText variant="bodySmall" style={styles.detailText}>
                      {toilet.hours}
                    </AppText>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons 
                      name="wheelchair-accessibility" 
                      size={16} 
                      color={designSystem.colors.text.secondary} 
                    />
                    <AppText variant="bodySmall" style={styles.detailText}>
                      {toilet.pmrAccess}
                    </AppText>
                  </View>
                </View>
                
                <PrimaryButton
                  onPress={() => openNavigation(toilet)}
                  variant="primary"
                  style={styles.navigationButton}
                  icon="navigation"
                >
                  Guide moi vers mon trône
                </PrimaryButton>
              </AppCard>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal de détails d'une toilette */}
      <Portal>
        <Modal
          visible={selectedToilet !== null}
          onDismiss={() => setSelectedToilet(null)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedToilet && (
            <AppCard style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <AppText variant="h5" style={styles.modalTitle}>
                  {selectedToilet.name}
                </AppText>
                <TouchableOpacity
                  onPress={() => setSelectedToilet(null)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons 
                    name="close" 
                    size={24} 
                    color={designSystem.colors.text.secondary} 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <View style={styles.modalDetail}>
                  <MaterialCommunityIcons 
                    name="map-marker" 
                    size={20} 
                    color={designSystem.colors.primary[500]} 
                  />
                  <AppText variant="bodyMedium" style={styles.modalDetailText}>
                    {selectedToilet.address}
                  </AppText>
                </View>
                
                <View style={styles.modalDetail}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={20} 
                    color={designSystem.colors.primary[500]} 
                  />
                  <AppText variant="bodyMedium" style={styles.modalDetailText}>
                    {selectedToilet.hours}
                  </AppText>
                </View>
                
                <View style={styles.modalDetail}>
                  <MaterialCommunityIcons 
                    name="wheelchair-accessibility" 
                    size={20} 
                    color={designSystem.colors.primary[500]} 
                  />
                  <AppText variant="bodyMedium" style={styles.modalDetailText}>
                    {selectedToilet.pmrAccess}
                  </AppText>
                </View>
                
                <View style={styles.modalDetail}>
                  <MaterialCommunityIcons 
                    name="ruler" 
                    size={20} 
                    color={designSystem.colors.primary[500]} 
                  />
                  <AppText variant="bodyMedium" style={styles.modalDetailText}>
                    Distance: {formatDistance(selectedToilet.distance)}
                  </AppText>
                </View>
              </View>
              
              <PrimaryButton
                onPress={() => {
                  openNavigation(selectedToilet);
                  setSelectedToilet(null);
                }}
                variant="primary"
                style={styles.modalNavigationButton}
                icon="navigation"
              >
                Guide moi vers mon trône
              </PrimaryButton>
            </AppCard>
          )}
        </Modal>
      </Portal>

      {/* Toast de notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        duration={3000}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
  },
  header: {
    padding: designSystem.spacing[4],
    paddingBottom: designSystem.spacing[2],
  },
  headerCard: {
    backgroundColor: designSystem.colors.background.tertiary,
    borderWidth: 1,
    borderColor: designSystem.colors.border.light,
    ...designSystem.shadows.base,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing[3],
  },
  headerText: {
    marginLeft: designSystem.spacing[3],
    flex: 1,
  },
  headerTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[1],
  },
  headerSubtitle: {
    color: designSystem.colors.text.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: designSystem.spacing[2],
  },
  loadingText: {
    marginLeft: designSystem.spacing[2],
    color: designSystem.colors.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: designSystem.spacing[2],
  },
  errorText: {
    color: designSystem.colors.health.danger.main,
    textAlign: 'center',
    marginBottom: designSystem.spacing[2],
  },
  retryButton: {
    borderRadius: designSystem.borderRadius.sm,
  },
  mapContainer: {
    marginHorizontal: designSystem.spacing[4],
    marginBottom: designSystem.spacing[4],
  },
  mapPlaceholder: {
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: 1,
    borderColor: designSystem.colors.primary[200],
    borderStyle: 'solid',
  },
  mapPlaceholderContent: {
    alignItems: 'center',
    paddingVertical: designSystem.spacing[6],
    paddingHorizontal: designSystem.spacing[4],
  },
  mapPlaceholderTitle: {
    color: designSystem.colors.text.primary,
    marginTop: designSystem.spacing[3],
    marginBottom: designSystem.spacing[2],
  },
  mapPlaceholderText: {
    color: designSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: designSystem.spacing[2],
    fontFamily: 'monospace',
  },
  mapPlaceholderSubtext: {
    color: designSystem.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: designSystem.spacing[4],
  },
  loadingCard: {
    backgroundColor: designSystem.colors.background.tertiary,
    marginBottom: designSystem.spacing[3],
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: designSystem.spacing[6],
  },
  errorCard: {
    backgroundColor: designSystem.colors.background.tertiary,
    marginBottom: designSystem.spacing[3],
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: designSystem.spacing[4],
  },
  toiletsList: {
    paddingBottom: designSystem.spacing[6],
  },
  listTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[4],
    fontWeight: designSystem.typography.fontWeight.semiBold,
  },
  toiletCard: {
    backgroundColor: designSystem.colors.background.tertiary,
    marginBottom: designSystem.spacing[3],
    borderWidth: 1,
    borderColor: designSystem.colors.border.light,
    ...designSystem.shadows.base,
  },
  toiletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: designSystem.spacing[2],
  },
  toiletInfo: {
    flex: 1,
  },
  toiletName: {
    color: designSystem.colors.text.primary,
    fontWeight: designSystem.typography.fontWeight.semiBold,
    marginBottom: designSystem.spacing[1],
  },
  toiletDistance: {
    color: designSystem.colors.primary[500],
    fontWeight: designSystem.typography.fontWeight.medium,
  },
  toiletBadge: {
    backgroundColor: designSystem.colors.primary[100],
    paddingHorizontal: designSystem.spacing[2],
    paddingVertical: designSystem.spacing[1],
    borderRadius: designSystem.borderRadius.sm,
  },
  badgeText: {
    color: designSystem.colors.primary[700],
    fontWeight: designSystem.typography.fontWeight.medium,
  },
  toiletAddress: {
    color: designSystem.colors.text.secondary,
    marginBottom: designSystem.spacing[3],
  },
  toiletDetails: {
    marginBottom: designSystem.spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing[1],
  },
  detailText: {
    marginLeft: designSystem.spacing[2],
    color: designSystem.colors.text.secondary,
  },
  navigationButton: {
    borderRadius: designSystem.borderRadius.md,
  },
  modalContainer: {
    margin: designSystem.spacing[4],
    maxHeight: '80%',
  },
  modalCard: {
    backgroundColor: designSystem.colors.background.tertiary,
    borderWidth: 1,
    borderColor: designSystem.colors.border.light,
    ...designSystem.shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing[4],
  },
  modalTitle: {
    color: designSystem.colors.text.primary,
    fontWeight: designSystem.typography.fontWeight.semiBold,
    flex: 1,
  },
  closeButton: {
    padding: designSystem.spacing[1],
  },
  modalContent: {
    marginBottom: designSystem.spacing[6],
  },
  modalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing[3],
  },
  modalDetailText: {
    marginLeft: designSystem.spacing[3],
    color: designSystem.colors.text.secondary,
    flex: 1,
  },
  modalNavigationButton: {
    borderRadius: designSystem.borderRadius.md,
  },
});
