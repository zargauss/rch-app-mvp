import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  canInstallPWA,
  showInstallPrompt,
  isStandalone,
  sendTestNotification,
  requestNotificationPermission,
} from '../../utils/registerServiceWorker';
import AppText from './AppText';
import AppCard from './AppCard';
import designSystem from '../../theme/designSystem';

/**
 * Composant pour afficher un bouton d'installation PWA
 * et gérer les notifications
 */
export default function PWAInstallButton() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (Platform.OS === 'web') {
      setIsInstalled(isStandalone());

      // Écouter les événements PWA
      const handlePWAInstallAvailable = () => {
        setCanInstall(canInstallPWA());
      };

      const handlePWAInstalled = () => {
        setIsInstalled(true);
        setCanInstall(false);
      };

      window.addEventListener('pwa-install-available', handlePWAInstallAvailable);
      window.addEventListener('pwa-installed', handlePWAInstalled);

      // Vérifier la permission de notification
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }

      return () => {
        window.removeEventListener('pwa-install-available', handlePWAInstallAvailable);
        window.removeEventListener('pwa-installed', handlePWAInstalled);
      };
    }
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();

    if (accepted) {
      setCanInstall(false);
      setIsInstalled(true);
    }
  };

  const handleRequestNotification = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      // Envoyer une notification de test
      await sendTestNotification();
    }
  };

  // Ne rien afficher sur mobile natif
  if (Platform.OS !== 'web') {
    return null;
  }

  // Ne rien afficher si déjà installé et notifications activées
  if (isInstalled && notificationPermission === 'granted') {
    return null;
  }

  return (
    <AppCard style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="cellphone-arrow-down"
          size={32}
          color={designSystem.colors.primary[500]}
        />
        <AppText variant="h3" style={styles.title}>
          {isInstalled ? 'Application installée !' : 'Installez l\'application'}
        </AppText>
      </View>

      {!isInstalled && canInstall && (
        <View style={styles.section}>
          <AppText variant="bodyMedium" style={styles.description}>
            Installez RCH Suivi sur votre écran d'accueil pour un accès rapide et une meilleure
            expérience.
          </AppText>

          <Button
            mode="contained"
            onPress={handleInstall}
            icon={() => <MaterialCommunityIcons name="download" size={20} color="white" />}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Installer l'application
          </Button>
        </View>
      )}

      {!isInstalled && !canInstall && (
        <View style={styles.section}>
          <AppText variant="bodyMedium" style={styles.description}>
            💡 Pour installer l'application :
          </AppText>
          <AppText variant="bodySmall" style={styles.instructions}>
            • Sur Chrome/Edge : Cliquez sur le menu (⋮) puis "Installer l'application"
            {'\n'}• Sur Safari iOS : Appuyez sur Partager puis "Sur l'écran d'accueil"
          </AppText>
        </View>
      )}

      {notificationPermission !== 'granted' && (
        <View style={styles.section}>
          <AppText variant="bodyMedium" style={styles.description}>
            🔔 Activez les notifications pour ne jamais oublier votre bilan quotidien.
          </AppText>

          <Button
            mode="outlined"
            onPress={handleRequestNotification}
            icon={() => <MaterialCommunityIcons name="bell" size={20} color={designSystem.colors.primary[500]} />}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Activer les notifications
          </Button>

          {notificationPermission === 'denied' && (
            <AppText variant="bodySmall" style={styles.deniedText}>
              ⚠️ Vous avez bloqué les notifications. Autorisez-les dans les paramètres de votre
              navigateur.
            </AppText>
          )}
        </View>
      )}

      {isInstalled && (
        <View style={styles.successBanner}>
          <MaterialCommunityIcons name="check-circle" size={24} color={designSystem.colors.secondary[600]} />
          <AppText variant="bodyMedium" style={styles.successText}>
            L'application est installée et prête à être utilisée hors ligne !
          </AppText>
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: designSystem.spacing[4],
    padding: designSystem.spacing[5],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing[4],
    gap: designSystem.spacing[3],
  },
  title: {
    color: designSystem.colors.text.primary,
    flex: 1,
  },
  section: {
    marginBottom: designSystem.spacing[4],
  },
  description: {
    color: designSystem.colors.text.secondary,
    marginBottom: designSystem.spacing[3],
    lineHeight: 22,
  },
  instructions: {
    color: designSystem.colors.text.tertiary,
    lineHeight: 20,
    marginTop: designSystem.spacing[2],
    paddingLeft: designSystem.spacing[2],
  },
  button: {
    marginTop: designSystem.spacing[3],
    borderRadius: designSystem.borderRadius.md,
  },
  buttonContent: {
    paddingVertical: designSystem.spacing[2],
  },
  deniedText: {
    color: designSystem.colors.health.danger.main,
    marginTop: designSystem.spacing[2],
    fontStyle: 'italic',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designSystem.colors.health.excellent.light,
    padding: designSystem.spacing[3],
    borderRadius: designSystem.borderRadius.md,
    gap: designSystem.spacing[2],
  },
  successText: {
    color: designSystem.colors.secondary[900],
    flex: 1,
  },
});
