import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Système de feedback haptique pour améliorer l'expérience utilisateur
 * 
 * Types de feedback :
 * - light/medium/heavy : Pour les interactions de base
 * - success/warning/error : Pour les retours d'action
 * - selection : Pour les changements de sélection
 * - impact : Pour les interactions importantes
 */

/**
 * Feedback léger - Pour les interactions subtiles (hover, press)
 */
export const lightFeedback = () => {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Feedback moyen - Pour les interactions normales (boutons, cartes)
 */
export const mediumFeedback = () => {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Feedback fort - Pour les actions importantes (confirmations)
 */
export const heavyFeedback = () => {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/**
 * Feedback de succès - Pour les actions réussies (sauvegarde, enregistrement)
 */
export const successFeedback = () => {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Feedback d'avertissement - Pour les avertissements
 */
export const warningFeedback = () => {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/**
 * Feedback d'erreur - Pour les erreurs
 */
export const errorFeedback = () => {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

/**
 * Feedback de sélection - Pour les changements de sélection (switch, checkbox)
 */
export const selectionFeedback = () => {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync();
};

/**
 * Feedback personnalisé pour les boutons
 */
export const buttonPressFeedback = () => {
  lightFeedback();
};

/**
 * Feedback personnalisé pour les cartes pressables
 */
export const cardPressFeedback = () => {
  lightFeedback();
};

/**
 * Feedback personnalisé pour les actions de sauvegarde
 */
export const saveFeedback = () => {
  successFeedback();
};

/**
 * Feedback personnalisé pour les actions de suppression
 */
export const deleteFeedback = () => {
  heavyFeedback();
};

/**
 * Feedback personnalisé pour les toggles/switches
 */
export const toggleFeedback = () => {
  selectionFeedback();
};

