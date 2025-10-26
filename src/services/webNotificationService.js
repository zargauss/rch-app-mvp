/**
 * Service de notifications pour le Web (PWA)
 * Utilise l'API Notification native du navigateur
 */

import storage from '../utils/storage';
import { getSurveyDayKey } from '../utils/dayKey';

/**
 * Vérifier si les notifications sont supportées par le navigateur
 */
export function areNotificationsSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Demander les permissions pour les notifications web
 */
export async function requestNotificationPermissions() {
  if (!areNotificationsSupported()) {
    console.log('❌ Notifications non supportées par ce navigateur');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('🔐 Permission de notification:', permission);
    return permission === 'granted';
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
 * Envoyer une notification web
 */
export function showWebNotification(title, body, data = {}) {
  if (!areNotificationsSupported()) {
    console.log('❌ Notifications non supportées');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('❌ Permission de notification non accordée');
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: data.tag || 'rch-notification',
      requireInteraction: true,
      data,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Si c'est un rappel de bilan, ouvrir la page d'accueil
      if (data.action === 'OPEN_SURVEY') {
        window.location.href = '/';
      }
    };

    console.log('✅ Notification web affichée');
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage de la notification:', error);
  }
}

/**
 * Envoyer une notification de test
 */
export async function sendTestNotification() {
  console.log('🧪 Test de notification web...');
  
  const hasPermission = await requestNotificationPermissions();
  
  if (!hasPermission) {
    throw new Error('Permission de notification refusée. Veuillez autoriser les notifications dans les paramètres de votre navigateur.');
  }

  showWebNotification(
    '🧪 Notification de test',
    'Vos notifications fonctionnent correctement !',
    { type: 'TEST' }
  );

  return true;
}

/**
 * Récupérer les paramètres de notification
 */
export function getNotificationSettings() {
  const json = storage.getString('notificationSettings');
  
  if (!json) {
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
  console.log('🔔 Activation des notifications web...');
  
  const hasPermission = await requestNotificationPermissions();
  
  if (!hasPermission) {
    return false;
  }
  
  const settings = getNotificationSettings();
  settings.enabled = true;
  saveNotificationSettings(settings);
  
  // Planifier les rappels
  scheduleAllReminders();
  
  return true;
}

/**
 * Désactiver les notifications
 */
export function disableNotifications() {
  console.log('🔕 Désactivation des notifications web...');
  
  const settings = getNotificationSettings();
  settings.enabled = false;
  saveNotificationSettings(settings);
  
  // Annuler tous les timers
  cancelAllReminders();
}

// Variables pour stocker les timers des rappels
let reminder1Timer = null;
let reminder2Timer = null;

/**
 * Calculer le délai en millisecondes jusqu'à une heure donnée
 */
function getDelayUntilTime(hour, minute) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  
  // Si l'heure est déjà passée aujourd'hui, programmer pour demain
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  
  return target.getTime() - now.getTime();
}

/**
 * Planifier un rappel quotidien
 */
function scheduleReminder(reminderNumber, hour, minute) {
  console.log(`📅 Planification du rappel ${reminderNumber} à ${hour}:${minute}`);
  
  const scheduleNext = () => {
    const delay = getDelayUntilTime(hour, minute);
    console.log(`⏰ Prochain rappel ${reminderNumber} dans ${Math.round(delay / 1000 / 60)} minutes`);
    
    const timer = setTimeout(() => {
      // Vérifier si le bilan est complété
      if (!isSurveyCompletedToday()) {
        const title = reminderNumber === 1 
          ? '📊 Bilan quotidien'
          : '⏰ Rappel bilan quotidien';
        const body = reminderNumber === 1
          ? "C'est le moment de compléter votre bilan du jour."
          : "Vous avez oublié de compléter votre bilan.";
        
        showWebNotification(title, body, {
          type: 'SURVEY_REMINDER',
          reminderNumber,
          action: 'OPEN_SURVEY'
        });
      }
      
      // Reprogrammer pour le lendemain
      scheduleNext();
    }, delay);
    
    if (reminderNumber === 1) {
      reminder1Timer = timer;
    } else {
      reminder2Timer = timer;
    }
  };
  
  scheduleNext();
}

/**
 * Planifier tous les rappels
 */
export function scheduleAllReminders() {
  const settings = getNotificationSettings();
  
  if (!settings.enabled) {
    console.log('⚠️ Notifications désactivées');
    return;
  }
  
  console.log('📅 Planification de tous les rappels...');
  
  // Annuler les rappels existants
  cancelAllReminders();
  
  // Planifier les nouveaux rappels
  if (settings.surveyReminder1.enabled) {
    scheduleReminder(1, settings.surveyReminder1.hour, settings.surveyReminder1.minute);
  }
  
  if (settings.surveyReminder2.enabled) {
    scheduleReminder(2, settings.surveyReminder2.hour, settings.surveyReminder2.minute);
  }
}

/**
 * Annuler tous les rappels
 */
export function cancelAllReminders() {
  console.log('🗑️ Annulation de tous les rappels...');
  
  if (reminder1Timer) {
    clearTimeout(reminder1Timer);
    reminder1Timer = null;
  }
  
  if (reminder2Timer) {
    clearTimeout(reminder2Timer);
    reminder2Timer = null;
  }
}

// Initialiser les rappels au chargement de la page
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const settings = getNotificationSettings();
    if (settings.enabled) {
      console.log('🔄 Initialisation des rappels de notification...');
      scheduleAllReminders();
    }
  });
}

