import storage from './storage';

// ========================================
// Symptômes prédéfinis
// ========================================

export const PREDEFINED_SYMPTOMS = [
  'Douleurs abdominales',
  'Fatigue',
  'Nausées',
  'Fièvre',
  'Perte d\'appétit',
  'Douleurs articulaires',
  'Ballonnements',
  'Maux de tête',
  'Diarrhée',
  'Constipation',
];

export const INTENSITY_LABELS = {
  0: 'Aucune',
  1: 'Légère',
  2: 'Modérée',
  3: 'Importante',
  4: 'Sévère',
  5: 'Insupportable',
};

// ========================================
// Storage
// ========================================

export const getSymptoms = () => {
  const json = storage.getString('symptoms');
  return json ? JSON.parse(json) : [];
};

export const saveSymptoms = (symptoms) => {
  storage.set('symptoms', JSON.stringify(symptoms));
};

// ========================================
// CRUD Operations
// ========================================

/**
 * Crée un nouveau symptôme
 * @param {string} type - Type de symptôme (prédéfini ou personnalisé)
 * @param {number} intensity - Intensité 0-5
 * @param {string} note - Note optionnelle
 * @param {Date} date - Date du symptôme
 * @returns {string} - ID du symptôme créé
 */
export const createSymptom = (type, intensity, note = '', date = new Date()) => {
  const symptoms = getSymptoms();

  const isPredefined = PREDEFINED_SYMPTOMS.includes(type);

  const newSymptom = {
    id: `symptom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: isPredefined ? type : null,
    customType: isPredefined ? null : type,
    intensity,
    note,
    date: formatDate(date),
    timestamp: date.getTime(),
  };

  symptoms.push(newSymptom);
  saveSymptoms(symptoms);

  return newSymptom.id;
};

/**
 * Met à jour un symptôme existant
 * @param {string} id - ID du symptôme
 * @param {object} updates - Champs à mettre à jour
 */
export const updateSymptom = (id, updates) => {
  const symptoms = getSymptoms();
  const index = symptoms.findIndex(s => s.id === id);

  if (index === -1) return;

  const symptom = symptoms[index];

  // Mise à jour des champs
  if (updates.type !== undefined) {
    const isPredefined = PREDEFINED_SYMPTOMS.includes(updates.type);
    symptom.type = isPredefined ? updates.type : null;
    symptom.customType = isPredefined ? null : updates.type;
  }

  if (updates.intensity !== undefined) {
    symptom.intensity = updates.intensity;
  }

  if (updates.note !== undefined) {
    symptom.note = updates.note;
  }

  if (updates.date !== undefined) {
    symptom.date = formatDate(updates.date);
    symptom.timestamp = updates.date.getTime();
  }

  saveSymptoms(symptoms);
};

/**
 * Supprime un symptôme
 * @param {string} id - ID du symptôme
 */
export const deleteSymptom = (id) => {
  const symptoms = getSymptoms();
  const filtered = symptoms.filter(s => s.id !== id);
  saveSymptoms(filtered);
};

/**
 * Récupère un symptôme par ID
 * @param {string} id - ID du symptôme
 * @returns {object|null} - Symptôme ou null
 */
export const getSymptomById = (id) => {
  const symptoms = getSymptoms();
  return symptoms.find(s => s.id === id) || null;
};

/**
 * Récupère les symptômes pour une période
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @returns {Array} - Liste des symptômes
 */
export const getSymptomsByDateRange = (startDate, endDate) => {
  const symptoms = getSymptoms();
  const start = startDate.getTime();
  const end = endDate.getTime();

  return symptoms.filter(s => s.timestamp >= start && s.timestamp <= end);
};

/**
 * Récupère les symptômes d'une date spécifique
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {Array} - Liste des symptômes
 */
export const getSymptomsByDate = (dateStr) => {
  const symptoms = getSymptoms();
  return symptoms.filter(s => s.date === dateStr);
};

/**
 * Récupère le nom d'affichage du symptôme
 * @param {object} symptom - Objet symptôme
 * @returns {string} - Nom à afficher
 */
export const getSymptomDisplayName = (symptom) => {
  return symptom.type || symptom.customType || 'Symptôme';
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
 * Groupe les symptômes par date
 * @param {Array} symptoms - Liste de symptômes
 * @returns {object} - Symptômes groupés par date
 */
export const groupSymptomsByDate = (symptoms) => {
  const grouped = {};

  symptoms.forEach(symptom => {
    if (!grouped[symptom.date]) {
      grouped[symptom.date] = [];
    }
    grouped[symptom.date].push(symptom);
  });

  return grouped;
};
