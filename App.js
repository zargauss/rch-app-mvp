import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import theme from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator';

// Import du script de mise à jour PWA
import './src/utils/pwaUpdate';

export default function App() {
  const navigationRef = useRef(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Charger Inter depuis Google Fonts pour le web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      // Ajouter le style de base pour Inter
      const style = document.createElement('style');
      style.textContent = `
        * {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    // Écouter les notifications reçues quand l'app est ouverte
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification reçue:', notification);
    });

    // Écouter les clics sur les notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée:', response);
      const data = response.notification.request.content.data;
      
      // Si c'est un rappel de bilan, naviguer vers l'écran Accueil
      if (data?.action === 'OPEN_SURVEY' && navigationRef.current) {
        console.log('🧭 Redirection vers Accueil pour compléter le bilan');
        // Naviguer vers Main (les tabs), puis vers Accueil avec le paramètre
        navigationRef.current.navigate('Main', {
          screen: 'Accueil',
          params: { openSurveyModal: true }
        });
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <PaperProvider theme={theme}>
      <AppNavigator ref={navigationRef} />
    </PaperProvider>
  );
}
