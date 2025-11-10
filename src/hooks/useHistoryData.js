import { useState, useCallback } from 'react';
import storage from '../utils/storage';
import { getSymptoms } from '../utils/symptomsUtils';
import { getNotes } from '../utils/notesUtils';

/**
 * Hook pour gérer le chargement des données d'historique
 */
export const useHistoryData = () => {
  const [stools, setStools] = useState([]);
  const [scores, setScores] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [ibdiskHistory, setIbdiskHistory] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState([]);

  const loadHistoryData = useCallback(() => {
    // Charger les selles
    const stoolsJson = storage.getString('dailySells');
    const entries = stoolsJson ? JSON.parse(stoolsJson) : [];
    setStools(entries.sort((a, b) => b.timestamp - a.timestamp));

    // Charger les scores
    const histJson = storage.getString('scoresHistory');
    const history = histJson ? JSON.parse(histJson) : [];
    setScores(history);

    // Charger les traitements
    const treatmentsJson = storage.getString('treatments');
    const treatmentsList = treatmentsJson ? JSON.parse(treatmentsJson) : [];
    setTreatments(treatmentsList.sort((a, b) => b.timestamp - a.timestamp));

    // Charger l'historique IBDisk
    const ibdiskJson = storage.getString('ibdiskHistory');
    const ibdiskList = ibdiskJson ? JSON.parse(ibdiskJson) : [];
    setIbdiskHistory(ibdiskList);

    // Charger les symptômes et notes
    const symptomsData = getSymptoms();
    setSymptoms(symptomsData.sort((a, b) => b.timestamp - a.timestamp));

    const notesData = getNotes();
    setNotes(notesData.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  return {
    stools,
    scores,
    treatments,
    ibdiskHistory,
    symptoms,
    notes,
    loadHistoryData,
    setStools,
    setScores,
    setTreatments,
    setIbdiskHistory,
    setSymptoms,
    setNotes,
  };
};
