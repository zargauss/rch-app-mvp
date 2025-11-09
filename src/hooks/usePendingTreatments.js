import { useState, useEffect } from 'react';
import { getPendingIntakesCount } from '../utils/treatmentUtils';

/**
 * Hook pour calculer le nombre de prises de traitement en attente
 * Retourne le nombre de cases à cocher (max 9)
 *
 * Usage:
 * const pendingCount = usePendingTreatments();
 */

export const usePendingTreatments = () => {
  const [pendingCount, setPendingCount] = useState(0);

  const updatePendingCount = () => {
    const count = getPendingIntakesCount();
    setPendingCount(count);
  };

  // Recalculer périodiquement (toutes les 10 secondes)
  useEffect(() => {
    updatePendingCount();

    const interval = setInterval(() => {
      updatePendingCount();
    }, 10000); // 10 secondes

    return () => clearInterval(interval);
  }, []);

  return pendingCount;
};

export default usePendingTreatments;
