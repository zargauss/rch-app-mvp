import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import storage from '../utils/storage';
import { getSurveyDayKey } from '../utils/dayKey';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// IDs des notifications pour pouvoir les annuler
const NOTIFICATION_IDS = {
  SURVEY_REMINDER_1: 'survey-reminder-1',
  SURVEY_REMINDER_2: 'survey-reminder-2',
};

/**
 * Demander les permissions pour les notifications
 */
export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Permission de notification refusée');
      return false;
    }
    
    console.log('✅ Permission de notification accordée');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la demande de permission:', error);
    return false;
  }
}

/**
 * Vérifier si le bilan du jour est complété
 */
function isSurveyCompletedToday() {
  const todayKey = getSurveyDayKey(new Date(), 0);
  const json = storage.getString('dailySurvey');
  
  if (!json) return false;
  
  try {
    const surveys = JSON.parse(json);
    return surveys && surveys[todayKey] !== undefined;
  } catch (error) {
    console.error('Erreur lors de la vérification du bilan:', error);
    return false;
  }
}

/**
 * Planifier une notification de rappel pour le bilan
 */
export async function scheduleSurveyReminder(reminderNumber, hour, minute) {
  try {
    // Annuler la notification existante
    await cancelSurveyReminder(reminderNumber);
    
    // Vérifier si les notifications sont activées
    const settings = getNotificationSettings();
    if (!settings.enabled) {
      console.log('Notifications désactivées');
      return null;
    }
    
    // Créer la date de déclenchement
    const trigger = {
      hour,
      minute,
      repeats: true, // Répéter chaque jour
    };
    
    const content = {
      title: reminderNumber === 1 
        ? '📊 Bilan quotidien'
        : '⏰ Rappel bilan quotidien',
      body: reminderNumber === 1
        ? "C'est le moment de compléter votre bilan du jour."
        : "Vous avez oublié de compléter votre bilan.",
      data: { 
        type: 'SURVEY_REMINDER',
        reminderNumber,
        action: 'OPEN_SURVEY'
      },
      sound: true,
    };
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger,
      identifier: reminderNumber === 1 
        ? NOTIFICATION_IDS.SURVEY_REMINDER_1 
        : NOTIFICATION_IDS.SURVEY_REMINDER_2,
    });
    
    console.log(`✅ Notification ${reminderNumber} planifiée pour ${hour}:${minute.toString().padStart(2, '0')}`);
    return notificationId;
  } catch (error) {
    console.error(`❌ Erreur lors de la planification de la notification ${reminderNumber}:`, error);
    return null;
  }
}

/**
 * Annuler un rappel de bilan
 */
export async function cancelSurveyReminder(reminderNumber) {
  try {
    const identifier = reminderNumber === 1 
      ? NOTIFICATION_IDS.SURVEY_REMINDER_1 
      : NOTIFICATION_IDS.SURVEY_REMINDER_2;
    
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log(`🗑️ Notification ${reminderNumber} annulée`);
  } catch (error) {
    console.error(`Erreur lors de l'annulation de la notification ${reminderNumber}:`, error);
  }
}

/**
 * Annuler toutes les notifications planifiées
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🗑️ Toutes les notifications annulées');
  } catch (error) {
    console.error('Erreur lors de l\'annulation des notifications:', error);
  }
}

/**
 * Récupérer les paramètres de notification
 */
export function getNotificationSettings() {
  const json = storage.getString('notificationSettings');
  
  if (!json) {
    // Paramètres par défaut
    return {
      enabled: false,
      surveyReminder1: { enabled: true, hour: 9, minute: 0 },
      surveyReminder2: { enabled: true, hour: 20, minute: 0 },
    };
  }
  
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Erreur lors de la lecture des paramètres:', error);
    return {
      enabled: false,
      surveyReminder1: { enabled: true, hour: 9, minute: 0 },
      surveyReminder2: { enabled: true, hour: 20, minute: 0 },
    };
  }
}

/**
 * Sauvegarder les paramètres de notification
 */
export function saveNotificationSettings(settings) {
  try {
    storage.set('notificationSettings', JSON.stringify(settings));
    console.log('💾 Paramètres de notification sauvegardés');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error);
  }
}

/**
 * Activer les notifications
 */
export async function enableNotifications() {
  const hasPermission = await requestNotificationPermissions();
  
  if (!hasPermission) {
    return false;
  }
  
  const settings = getNotificationSettings();
  settings.enabled = true;
  saveNotificationSettings(settings);
  
  // Planifier les notifications
  await scheduleAllReminders();
  
  return true;
}

/**
 * Désactiver les notifications
 */
export async function disableNotifications() {
  const settings = getNotificationSettings();
  settings.enabled = false;
  saveNotificationSettings(settings);
  
  // Annuler toutes les notifications
  await cancelAllNotifications();
}

/**
 * Planifier tous les rappels configurés
 */
export async function scheduleAllReminders() {
  const settings = getNotificationSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  if (settings.surveyReminder1.enabled) {
    await scheduleSurveyReminder(
      1,
      settings.surveyReminder1.hour,
      settings.surveyReminder1.minute
    );
  }
  
  if (settings.surveyReminder2.enabled) {
    await scheduleSurveyReminder(
      2,
      settings.surveyReminder2.hour,
      settings.surveyReminder2.minute
    );
  }
}

/**
 * Envoyer une notification de test
 */
export async function sendTestNotification() {
  try {
    console.log('🧪 Début du test de notification...');
    
    // Vérifier la plateforme
    console.log('📱 Plateforme:', Platform.OS);
    
    const hasPermission = await requestNotificationPermissions();
    console.log('🔐 Permission:', hasPermission);
    
    if (!hasPermission) {
      throw new Error('Permission de notification refusée. Veuillez autoriser les notifications dans les paramètres de votre appareil.');
    }
    
    // Sur web, les notifications ne fonctionnent pas de la même manière
    if (Platform.OS === 'web') {
      console.log('⚠️ Les notifications sur web sont limitées. Testez sur mobile pour une expérience complète.');
      
      // Essayer quand même d'envoyer une notification web
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🧪 Notification de test', {
          body: 'Vos notifications fonctionnent correctement !',
          icon: '/favicon.png',
        });
        console.log('✅ Notification web native envoyée');
        return true;
      }
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Notification de test',
        body: 'Vos notifications fonctionnent correctement !',
        data: { type: 'TEST' },
        sound: true,
      },
      trigger: {
        seconds: 2,
      },
    });
    
    console.log('✅ Notification de test planifiée avec ID:', notificationId);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification de test:', error);
    throw error;
  }
}

/**
 * Obtenir toutes les notifications planifiées (pour debug)
 */
export async function getAllScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Notifications planifiées:', notifications);
    return notifications;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
}

