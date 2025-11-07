import { useState, useEffect } from 'react';
import storage from '../utils/storage';
import { getSurveyDayKey } from '../utils/dayKey';

/**
 * Hook pour calculer le nombre de questionnaires en attente
 * Retourne un nombre entre 0 et 2
 *
 * - Bilan quotidien : 1 point si non rempli aujourd'hui
 * - IBDisk : 1 point si disponible (>30 jours depuis le dernier)
 *
 * Usage:
 * const pendingCount = usePendingQuestionnaires();
 */

export const usePendingQuestionnaires = () => {
  const [pendingCount, setPendingCount] = useState(0);

  const calculatePending = () => {
    let count = 0;

    // 1. Vérifier le bilan quotidien
    const todayKey = getSurveyDayKey(new Date(), 0);
    const dailySurveyJson = storage.getString('dailySurvey');

    if (dailySurveyJson) {
      const dailySurveyMap = JSON.parse(dailySurveyJson);
      const isTodayCompleted = Boolean(dailySurveyMap[todayKey]);

      if (!isTodayCompleted) {
        count += 1;
      }
    } else {
      // Pas de bilan quotidien du tout = à remplir
      count += 1;
    }

    // 2. Vérifier IBDisk (disponible si >30 jours)
    const ibdiskLastUsedStr = storage.getString('ibdiskLastUsed');

    if (!ibdiskLastUsedStr) {
      // Jamais rempli = disponible
      count += 1;
    } else {
      const lastUsed = parseInt(ibdiskLastUsedStr);
      const now = new Date().getTime();
      const daysSinceLastUsed = Math.floor((now - lastUsed) / (1000 * 60 * 60 * 24));

      if (daysSinceLastUsed >= 30) {
        count += 1;
      }
    }

    return count;
  };

  // Recalculer périodiquement (toutes les 10 secondes)
  useEffect(() => {
    setPendingCount(calculatePending());

    const interval = setInterval(() => {
      setPendingCount(calculatePending());
    }, 10000); // 10 secondes

    return () => clearInterval(interval);
  }, []);

  return pendingCount;
};

export default usePendingQuestionnaires;
