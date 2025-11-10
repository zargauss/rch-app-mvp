import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { createNote, updateNote, deleteNote } from '../utils/notesUtils';
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
    if (editingNote) {
      // Mode édition
      updateNote(editingNote.id, data);
      showToast?.('✅ Note mise à jour', 'success');
    } else {
      // Mode création
      createNote(data.content, data.category, data.sharedWithDoctor, data.date);
      showToast?.('✅ Note enregistrée', 'success');
    }
    setNoteModalVisible(false);
    setEditingNote(null);
    onDataChange?.();
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
