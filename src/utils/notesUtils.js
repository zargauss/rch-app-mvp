import storage from './storage';
import { analyzeNoteWithAI } from '../services/geminiService';
import { createSymptom } from './symptomsUtils';

// ========================================
// Catégories prédéfinies
// ========================================

export const NOTE_CATEGORIES = [
  { value: 'traitement', label: 'Traitement' },
  { value: 'alimentation', label: 'Alimentation' },
  { value: 'lifestyle', label: 'Mode de vie' },
  { value: 'autre', label: 'Autre' },
];

// ========================================
// Storage
// ========================================

export const getNotes = () => {
  const json = storage.getString('notes');
  return json ? JSON.parse(json) : [];
};

export const saveNotes = (notes) => {
  storage.set('notes', JSON.stringify(notes));
};

// ========================================
// CRUD Operations
// ========================================

/**
 * Crée une nouvelle note
 * @param {string} content - Contenu de la note
 * @param {string} category - Catégorie (optionnel)
 * @param {boolean} sharedWithDoctor - Partager avec le médecin
 * @param {Date} date - Date de la note
 * @returns {string} - ID de la note créée
 */
export const createNote = (content, category = null, sharedWithDoctor = false, date = new Date()) => {
  const notes = getNotes();

  const newNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    content,
    category,
    date: formatDate(date),
    timestamp: date.getTime(),
    sharedWithDoctor,
    createdAt: Date.now(),
    // Nouveaux champs pour l'analyse IA
    tags: [],
    aiProcessed: false,
    aiConfidence: null,
  };

  notes.push(newNote);
  saveNotes(notes);

  return newNote.id;
};

/**
 * Met à jour une note existante
 * @param {string} id - ID de la note
 * @param {object} updates - Champs à mettre à jour
 */
export const updateNote = (id, updates) => {
  const notes = getNotes();
  const index = notes.findIndex(n => n.id === id);

  if (index === -1) return;

  const note = notes[index];

  // Mise à jour des champs
  if (updates.content !== undefined) {
    note.content = updates.content;
  }

  if (updates.category !== undefined) {
    note.category = updates.category;
  }

  if (updates.sharedWithDoctor !== undefined) {
    note.sharedWithDoctor = updates.sharedWithDoctor;
  }

  if (updates.date !== undefined) {
    note.date = formatDate(updates.date);
    note.timestamp = updates.date.getTime();
  }

  // Mise à jour des champs IA
  if (updates.tags !== undefined) {
    note.tags = updates.tags;
  }

  if (updates.aiProcessed !== undefined) {
    note.aiProcessed = updates.aiProcessed;
  }

  if (updates.aiConfidence !== undefined) {
    note.aiConfidence = updates.aiConfidence;
  }

  note.updatedAt = Date.now();

  saveNotes(notes);
};

/**
 * Supprime une note
 * @param {string} id - ID de la note
 */
export const deleteNote = (id) => {
  const notes = getNotes();
  const filtered = notes.filter(n => n.id !== id);
  saveNotes(filtered);
};

/**
 * Récupère une note par ID
 * @param {string} id - ID de la note
 * @returns {object|null} - Note ou null
 */
export const getNoteById = (id) => {
  const notes = getNotes();
  return notes.find(n => n.id === id) || null;
};

/**
 * Récupère les notes pour une période
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @returns {Array} - Liste des notes
 */
export const getNotesByDateRange = (startDate, endDate) => {
  const notes = getNotes();
  const start = startDate.getTime();
  const end = endDate.getTime();

  return notes.filter(n => n.timestamp >= start && n.timestamp <= end);
};

/**
 * Récupère les notes d'une date spécifique
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {Array} - Liste des notes
 */
export const getNotesByDate = (dateStr) => {
  const notes = getNotes();
  return notes.filter(n => n.date === dateStr);
};

/**
 * Récupère uniquement les notes partagées avec le médecin
 * @returns {Array} - Liste des notes partagées
 */
export const getSharedNotes = () => {
  const notes = getNotes();
  return notes.filter(n => n.sharedWithDoctor);
};

/**
 * Récupère le label de la catégorie
 * @param {string} category - Valeur de la catégorie
 * @returns {string} - Label de la catégorie
 */
export const getCategoryLabel = (category) => {
  const cat = NOTE_CATEGORIES.find(c => c.value === category);
  return cat ? cat.label : 'Sans catégorie';
};

// ========================================
// Analyse IA
// ========================================

/**
 * Analyse une note avec l'IA pour extraire les tags et créer les symptômes
 * Cette fonction est asynchrone et met à jour la note après l'analyse
 * @param {string} noteId - ID de la note à analyser
 * @returns {Promise<{tags: string[], createdSymptoms: Array, confiance: string}>}
 */
export const processNoteWithAI = async (noteId) => {
  try {
    const note = getNoteById(noteId);

    if (!note) {
      console.warn('⚠️ Note non trouvée:', noteId);
      return { tags: [], createdSymptoms: [], confiance: 'faible' };
    }

    console.log('🤖 Début de l\'analyse IA pour la note:', noteId);

    // Appel au service Gemini (retourne tags ET symptoms)
    const { tags, symptoms, confiance } = await analyzeNoteWithAI(note.content);

    // Mise à jour de la note avec les tags
    updateNote(noteId, {
      tags,
      aiProcessed: true,
      aiConfidence: confiance,
    });

    // Création automatique des symptômes détectés
    const createdSymptoms = [];
    if (symptoms && symptoms.length > 0) {
      const noteDate = new Date(note.timestamp);

      // Formater la date au format DD/MM/YYYY
      const day = String(noteDate.getDate()).padStart(2, '0');
      const month = String(noteDate.getMonth() + 1).padStart(2, '0');
      const year = noteDate.getFullYear();
      const dateFormatted = `${day}/${month}/${year}`;

      const autoNoteText = `Création IA à partir de la note du ${dateFormatted}`;

      for (const symptom of symptoms) {
        try {
          const symptomId = createSymptom(
            symptom.nom,           // type (correspond à PREDEFINED_SYMPTOMS)
            symptom.intensité,     // intensity 1-5
            autoNoteText,          // note formatée avec date
            noteDate               // même date que la note
          );

          createdSymptoms.push({
            id: symptomId,
            nom: symptom.nom,
            intensité: symptom.intensité,
          });

          console.log(`  ➕ Symptôme créé: ${symptom.nom} (intensité: ${symptom.intensité}/5)`);
        } catch (symptomError) {
          console.error(`  ❌ Erreur création symptôme "${symptom.nom}":`, symptomError);
        }
      }
    }

    console.log(`✅ Note ${noteId} analysée: ${tags.length} tag(s), ${createdSymptoms.length} symptôme(s) créé(s) (confiance: ${confiance})`);

    return { tags, createdSymptoms, confiance };
  } catch (error) {
    console.error('❌ Erreur lors du traitement IA de la note:', error);

    // En cas d'erreur, marquer la note comme traitée mais sans tags ni symptômes
    updateNote(noteId, {
      tags: [],
      aiProcessed: true,
      aiConfidence: 'faible',
    });

    return { tags: [], createdSymptoms: [], confiance: 'faible' };
  }
};

/**
 * Récupère toutes les notes avec leurs tags (filtre les notes non traitées)
 * @returns {Array} - Notes avec tags
 */
export const getNotesWithTags = () => {
  const notes = getNotes();
  return notes.filter(n => n.aiProcessed && n.tags && n.tags.length > 0);
};

/**
 * Récupère tous les tags uniques de toutes les notes
 * @returns {Array} - Liste des tags uniques
 */
export const getAllUniqueTags = () => {
  const notes = getNotesWithTags();
  const allTags = notes.flatMap(n => n.tags);
  return [...new Set(allTags)].sort();
};

// ========================================
// Helpers
// ========================================

/**
 * Formate une date en YYYY-MM-DD
 * @param {Date} date - Date à formater
 * @returns {string} - Date formatée
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Groupe les notes par date
 * @param {Array} notes - Liste de notes
 * @returns {object} - Notes groupées par date
 */
export const groupNotesByDate = (notes) => {
  const grouped = {};

  notes.forEach(note => {
    if (!grouped[note.date]) {
      grouped[note.date] = [];
    }
    grouped[note.date].push(note);
  });

  return grouped;
};

/**
 * Valide le contenu d'une note
 * @param {string} content - Contenu à valider
 * @param {number} maxLength - Longueur maximale (défaut: 500)
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateNoteContent = (content, maxLength = 500) => {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Le contenu ne peut pas être vide' };
  }

  if (content.length > maxLength) {
    return { valid: false, error: `Le contenu ne peut pas dépasser ${maxLength} caractères` };
  }

  return { valid: true, error: null };
};
