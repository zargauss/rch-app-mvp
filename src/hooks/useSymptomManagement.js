import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { createSymptom, updateSymptom, deleteSymptom } from '../utils/symptomsUtils';
import { saveFeedback, deleteFeedback } from '../utils/haptics';

/**
 * Hook pour gérer les opérations CRUD sur les symptômes
 */
export const useSymptomManagement = ({ onDataChange, showToast }) => {
  const [symptomModalVisible, setSymptomModalVisible] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState(null);

  const handleOpenSymptomModal = () => {
    setEditingSymptom(null);
    setSymptomModalVisible(true);
  };

  const handleSaveSymptom = (data) => {
    saveFeedback();
    if (editingSymptom) {
      // Mode édition
      updateSymptom(editingSymptom.id, data);
      showToast?.('✅ Symptôme mis à jour', 'success');
    } else {
      // Mode création
      createSymptom(data.type, data.intensity, data.note, data.date);
      showToast?.('✅ Symptôme enregistré', 'success');
    }
    setSymptomModalVisible(false);
    setEditingSymptom(null);
    onDataChange?.();
  };

  const handleEditSymptom = (symptom) => {
    setEditingSymptom(symptom);
    setSymptomModalVisible(true);
  };

  const handleDeleteSymptom = (symptomId) => {
    const executeDelete = () => {
      deleteFeedback();
      deleteSymptom(symptomId);
      onDataChange?.();
      showToast?.('🗑️ Symptôme supprimé', 'success');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce symptôme ?')) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Supprimer le symptôme',
        'Êtes-vous sûr de vouloir supprimer ce symptôme ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', onPress: executeDelete, style: 'destructive' }
        ]
      );
    }
  };

  const handleCloseSymptomModal = () => {
    setSymptomModalVisible(false);
    setEditingSymptom(null);
  };

  return {
    symptomModalVisible,
    editingSymptom,
    handleOpenSymptomModal,
    handleSaveSymptom,
    handleEditSymptom,
    handleDeleteSymptom,
    handleCloseSymptomModal,
  };
};
