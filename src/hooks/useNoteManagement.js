import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { createNote, updateNote, deleteNote, processNoteWithAI } from '../utils/notesUtils';
import { saveFeedback, deleteFeedback } from '../utils/haptics';

/**
 * Hook pour gérer les opérations CRUD sur les notes
 */
export const useNoteManagement = ({ onDataChange, showToast }) => {
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const handleOpenNoteModal = () => {
    setEditingNote(null);
    setNoteModalVisible(true);
  };

  const handleSaveNote = (data) => {
    saveFeedback();
    let noteId;

    if (editingNote) {
      // Mode édition
      noteId = editingNote.id;
      updateNote(noteId, data);
      showToast?.('✅ Note mise à jour', 'success');
    } else {
      // Mode création
      noteId = createNote(data.content, data.category, data.sharedWithDoctor, data.date);
      showToast?.('✅ Note enregistrée', 'success');
    }

    setNoteModalVisible(false);
    setEditingNote(null);
    onDataChange?.();

    // Lancer l'analyse IA en arrière-plan (asynchrone, non-bloquant)
    if (noteId) {
      console.log('🚀 Lancement de l\'analyse IA pour la note:', noteId);

      // Toast de début d'analyse
      setTimeout(() => {
        showToast?.('🤖 Analyse IA en cours...', 'info');
      }, 500);

      processNoteWithAI(noteId)
        .then(() => {
          console.log('✅ Analyse IA terminée pour la note:', noteId);
          // Rafraîchir les données pour afficher les tags
          onDataChange?.();

          // Récupérer la note pour afficher le résultat
          const { getNoteById } = require('../utils/notesUtils');
          const updatedNote = getNoteById(noteId);
          if (updatedNote && updatedNote.tags && updatedNote.tags.length > 0) {
            showToast?.(`✅ ${updatedNote.tags.length} tag(s) détecté(s)`, 'success');
          } else {
            showToast?.('ℹ️ Aucun tag détecté', 'info');
          }
        })
        .catch((error) => {
          console.error('❌ Erreur lors de l\'analyse IA:', error);
          showToast?.('⚠️ Erreur analyse IA', 'error');
        });
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteModalVisible(true);
  };

  const handleDeleteNote = (noteId) => {
    const executeDelete = () => {
      deleteFeedback();
      deleteNote(noteId);
      onDataChange?.();
      showToast?.('🗑️ Note supprimée', 'success');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Supprimer la note',
        'Êtes-vous sûr de vouloir supprimer cette note ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', onPress: executeDelete, style: 'destructive' }
        ]
      );
    }
  };

  const handleCloseNoteModal = () => {
    setNoteModalVisible(false);
    setEditingNote(null);
  };

  return {
    noteModalVisible,
    editingNote,
    handleOpenNoteModal,
    handleSaveNote,
    handleEditNote,
    handleDeleteNote,
    handleCloseNoteModal,
  };
};
