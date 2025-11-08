import storage from './storage';

/**
 * Utilitaires pour la gestion des traitements
 */

// ========================================
// GETTERS - Récupération des données
// ========================================

export const getMedications = () => {
  const json = storage.getString('medications');
  return json ? JSON.parse(json) : {};
};

export const getTherapeuticSchemas = () => {
  const json = storage.getString('therapeuticSchemas');
  return json ? JSON.parse(json) : [];
};

export const getIntakes = () => {
  const json = storage.getString('intakes');
  return json ? JSON.parse(json) : [];
};

// ========================================
// SETTERS - Sauvegarde des données
// ========================================

export const saveMedications = (medications) => {
  storage.set('medications', JSON.stringify(medications));
};

export const saveTherapeuticSchemas = (schemas) => {
  storage.set('therapeuticSchemas', JSON.stringify(schemas));
};

export const saveIntakes = (intakes) => {
  storage.set('intakes', JSON.stringify(intakes));
};

// ========================================
// CALCULS - Observance
// ========================================

/**
 * Calcule l'observance d'un schéma thérapeutique
 * @param {object} schema - Le schéma thérapeutique
 * @returns {number} - Observance en % (0-100+)
 */
export const calculateAdherence = (schema) => {
  const intakes = getIntakes();
  const startDate = new Date(schema.startDate);
  const endDate = schema.endDate ? new Date(schema.endDate) : new Date();

  // Récupérer toutes les prises de ce médicament dans la période du schéma
  const schemaIntakes = intakes.filter(intake => {
    const intakeDate = new Date(intake.timestamp);
    return intake.medicationId === schema.medicationId &&
           intakeDate >= startDate &&
           intakeDate <= endDate;
  });

  // Calculer le nombre de prises prévues
  const daysDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  let expectedIntakes = 0;

  if (schema.frequency.type === 'daily') {
    expectedIntakes = daysDuration * schema.frequency.dosesPerDay;
  } else if (schema.frequency.type === 'interval') {
    expectedIntakes = Math.floor(daysDuration / schema.frequency.intervalDays) + 1;
  }

  // Calculer le nombre de prises effectuées
  const actualIntakes = schemaIntakes.reduce((sum, intake) => sum + intake.doses, 0);

  // Calculer l'observance
  if (expectedIntakes === 0) return 0;

  const adherence = Math.round((actualIntakes / expectedIntakes) * 100);
  return adherence;
};

/**
 * Vérifie s'il y a un surdosage
 * @param {object} schema - Le schéma thérapeutique
 * @returns {object} - { hasOverdose: boolean, excess: number }
 */
export const checkOverdose = (schema) => {
  const intakes = getIntakes();
  const startDate = new Date(schema.startDate);
  const endDate = schema.endDate ? new Date(schema.endDate) : new Date();

  const schemaIntakes = intakes.filter(intake => {
    const intakeDate = new Date(intake.timestamp);
    return intake.medicationId === schema.medicationId &&
           intakeDate >= startDate &&
           intakeDate <= endDate;
  });

  const daysDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  let expectedIntakes = 0;

  if (schema.frequency.type === 'daily') {
    expectedIntakes = daysDuration * schema.frequency.dosesPerDay;
  } else if (schema.frequency.type === 'interval') {
    expectedIntakes = Math.floor(daysDuration / schema.frequency.intervalDays) + 1;
  }

  const actualIntakes = schemaIntakes.reduce((sum, intake) => sum + intake.doses, 0);
  const excess = actualIntakes - expectedIntakes;

  return {
    hasOverdose: excess > 0,
    excess: excess > 0 ? excess : 0
  };
};

// ========================================
// CALCULS - Prochaine prise et retard
// ========================================

/**
 * Calcule la prochaine prise pour un schéma
 * @param {object} schema - Le schéma thérapeutique
 * @returns {object} - { nextDate: Date, isLate: boolean, daysLate: number }
 */
export const getNextIntake = (schema) => {
  const intakes = getIntakes();
  const medications = getMedications();
  const medication = medications[schema.medicationId];

  // Pour les traitements quotidiens, la prochaine prise est toujours aujourd'hui
  if (schema.frequency.type === 'daily') {
    return {
      nextDate: new Date(),
      isLate: false,
      daysLate: 0
    };
  }

  // Pour les traitements à intervalle, trouver la dernière prise
  const medicationIntakes = intakes
    .filter(intake => intake.medicationId === schema.medicationId)
    .sort((a, b) => b.timestamp - a.timestamp);

  let nextDate;

  if (medicationIntakes.length === 0) {
    // Première prise = date de début du schéma
    nextDate = new Date(schema.startDate);
  } else {
    // Dernière prise + intervalle
    const lastIntakeDate = new Date(medicationIntakes[0].timestamp);
    nextDate = new Date(lastIntakeDate);
    nextDate.setDate(nextDate.getDate() + schema.frequency.intervalDays);
  }

  // Calculer le retard
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - nextDate) / (1000 * 60 * 60 * 24));
  const isLate = daysDiff > 0;

  return {
    nextDate,
    isLate,
    daysLate: isLate ? daysDiff : 0
  };
};

// ========================================
// PRISES AUJOURD'HUI
// ========================================

/**
 * Récupère les prises effectuées aujourd'hui pour un schéma daily
 * @param {object} schema - Le schéma thérapeutique
 * @returns {number} - Nombre de prises effectuées aujourd'hui
 */
export const getTodayIntakesCount = (schema) => {
  const intakes = getIntakes();
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

  const todayIntakes = intakes.filter(intake =>
    intake.medicationId === schema.medicationId &&
    intake.timestamp >= startOfDay &&
    intake.timestamp < endOfDay
  );

  return todayIntakes.reduce((sum, intake) => sum + intake.doses, 0);
};

/**
 * Vérifie si la prise du jour est déjà effectuée pour un schéma interval
 * @param {object} schema - Le schéma thérapeutique
 * @returns {boolean}
 */
export const isIntervalIntakeDone = (schema) => {
  const { nextDate, isLate } = getNextIntake(schema);
  const intakes = getIntakes();
  const today = new Date();

  // Si la prochaine prise est dans le futur, c'est déjà fait
  if (nextDate > today && !isLate) {
    return true;
  }

  // Vérifier si une prise a été faite à la date prévue ou après
  const intakesAtExpectedDate = intakes.filter(intake => {
    const intakeDate = new Date(intake.timestamp);
    return intake.medicationId === schema.medicationId &&
           intakeDate >= nextDate;
  });

  return intakesAtExpectedDate.length > 0;
};

// ========================================
// BADGE - Nombre de prises à effectuer
// ========================================

/**
 * Calcule le nombre de cases à cocher aujourd'hui (pour le badge)
 * @returns {number}
 */
export const getPendingIntakesCount = () => {
  const schemas = getTherapeuticSchemas();
  const activeSchemas = schemas.filter(s => !s.endDate);

  let count = 0;

  activeSchemas.forEach(schema => {
    if (schema.frequency.type === 'daily') {
      // Nombre de prises restantes aujourd'hui
      const todayCount = getTodayIntakesCount(schema);
      const remaining = schema.frequency.dosesPerDay - todayCount;
      count += Math.max(0, remaining);
    } else if (schema.frequency.type === 'interval') {
      // Si prise non faite et date atteinte ou dépassée
      if (!isIntervalIntakeDone(schema)) {
        const { nextDate } = getNextIntake(schema);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (nextDate <= today) {
          count += 1;
        }
      }
    }
  });

  return Math.min(count, 9); // Max 9 pour affichage "9+"
};

// ========================================
// CRUD - Médicaments
// ========================================

/**
 * Crée ou met à jour un médicament
 * @param {string} id - ID du médicament (null pour créer)
 * @param {string} name - Nom du médicament
 * @returns {string} - ID du médicament
 */
export const saveMedication = (id, name) => {
  const medications = getMedications();

  if (!id) {
    // Créer un nouveau médicament
    id = `med-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    medications[id] = {
      id,
      name,
      createdAt: Date.now()
    };
  } else {
    // Mettre à jour le nom
    if (medications[id]) {
      medications[id].name = name;
    }
  }

  saveMedications(medications);
  return id;
};

/**
 * Renomme un médicament partout dans l'application
 * @param {string} medicationId - ID du médicament
 * @param {string} newName - Nouveau nom
 */
export const renameMedication = (medicationId, newName) => {
  const medications = getMedications();

  if (medications[medicationId]) {
    medications[medicationId].name = newName;
    saveMedications(medications);
  }
};

// ========================================
// CRUD - Schémas thérapeutiques
// ========================================

/**
 * Crée un nouveau schéma thérapeutique
 * @param {string} medicationId - ID du médicament
 * @param {object} frequency - { type, dosesPerDay, intervalDays }
 * @returns {string} - ID du schéma
 */
export const createSchema = (medicationId, frequency) => {
  const schemas = getTherapeuticSchemas();

  const newSchema = {
    id: `schema-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    medicationId,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    frequency,
    adherence: 0
  };

  schemas.push(newSchema);
  saveTherapeuticSchemas(schemas);

  return newSchema.id;
};

/**
 * Arrête un schéma thérapeutique actif
 * @param {string} schemaId - ID du schéma
 */
export const stopSchema = (schemaId) => {
  const schemas = getTherapeuticSchemas();
  const schema = schemas.find(s => s.id === schemaId);

  if (schema) {
    schema.endDate = new Date().toISOString().split('T')[0];
    schema.adherence = calculateAdherence(schema);
    saveTherapeuticSchemas(schemas);
  }
};

/**
 * Modifie la fréquence d'un schéma (crée un nouveau schéma)
 * @param {string} schemaId - ID du schéma actuel
 * @param {object} newFrequency - Nouvelle fréquence
 * @returns {string} - ID du nouveau schéma
 */
export const updateSchemaFrequency = (schemaId, newFrequency) => {
  const schemas = getTherapeuticSchemas();
  const oldSchema = schemas.find(s => s.id === schemaId);

  if (!oldSchema) return null;

  // Clore l'ancien schéma
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  oldSchema.endDate = yesterday.toISOString().split('T')[0];
  oldSchema.adherence = calculateAdherence(oldSchema);

  // Créer le nouveau schéma
  const newSchemaId = createSchema(oldSchema.medicationId, newFrequency);

  saveTherapeuticSchemas(schemas);
  return newSchemaId;
};

/**
 * Modifie un schéma historique
 * @param {string} schemaId - ID du schéma
 * @param {object} updates - { startDate?, endDate?, frequency? }
 */
export const updateHistoricalSchema = (schemaId, updates) => {
  const schemas = getTherapeuticSchemas();
  const schema = schemas.find(s => s.id === schemaId);

  if (schema) {
    if (updates.startDate) schema.startDate = updates.startDate;
    if (updates.endDate !== undefined) schema.endDate = updates.endDate;
    if (updates.frequency) schema.frequency = updates.frequency;

    // Recalculer l'observance
    schema.adherence = calculateAdherence(schema);

    saveTherapeuticSchemas(schemas);
  }
};

// ========================================
// CRUD - Prises
// ========================================

/**
 * Enregistre une prise de médicament
 * @param {string} medicationId - ID du médicament
 * @param {number} doses - Nombre de doses
 * @param {Date} dateTaken - Date de la prise
 * @param {boolean} isFree - Prise libre ou via schéma
 * @returns {string} - ID de la prise
 */
export const recordIntake = (medicationId, doses, dateTaken, isFree = false) => {
  const intakes = getIntakes();
  const schemas = getTherapeuticSchemas();

  // Trouver le schéma actif pour ce médicament
  const activeSchema = schemas.find(s =>
    s.medicationId === medicationId && !s.endDate
  );

  const newIntake = {
    id: `intake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    medicationId,
    schemaId: activeSchema ? activeSchema.id : null,
    timestamp: dateTaken.getTime(),
    isFree,
    doses,
    dateTaken: dateTaken.toISOString().split('T')[0]
  };

  intakes.push(newIntake);
  saveIntakes(intakes);

  // Mettre à jour l'observance du schéma actif
  if (activeSchema) {
    activeSchema.adherence = calculateAdherence(activeSchema);
    saveTherapeuticSchemas(schemas);
  }

  return newIntake.id;
};

/**
 * Modifie une prise existante
 * @param {string} intakeId - ID de la prise
 * @param {object} updates - { medicationId?, doses?, dateTaken? }
 */
export const updateIntake = (intakeId, updates) => {
  const intakes = getIntakes();
  const intake = intakes.find(i => i.id === intakeId);

  if (intake) {
    if (updates.medicationId) intake.medicationId = updates.medicationId;
    if (updates.doses) intake.doses = updates.doses;
    if (updates.dateTaken) {
      intake.timestamp = updates.dateTaken.getTime();
      intake.dateTaken = updates.dateTaken.toISOString().split('T')[0];
    }

    saveIntakes(intakes);

    // Recalculer l'observance
    const schemas = getTherapeuticSchemas();
    const relatedSchema = schemas.find(s => s.id === intake.schemaId);
    if (relatedSchema) {
      relatedSchema.adherence = calculateAdherence(relatedSchema);
      saveTherapeuticSchemas(schemas);
    }
  }
};

/**
 * Supprime une prise
 * @param {string} intakeId - ID de la prise
 */
export const deleteIntake = (intakeId) => {
  const intakes = getIntakes();
  const intakeIndex = intakes.findIndex(i => i.id === intakeId);

  if (intakeIndex >= 0) {
    const intake = intakes[intakeIndex];
    intakes.splice(intakeIndex, 1);
    saveIntakes(intakes);

    // Recalculer l'observance
    const schemas = getTherapeuticSchemas();
    const relatedSchema = schemas.find(s => s.id === intake.schemaId);
    if (relatedSchema) {
      relatedSchema.adherence = calculateAdherence(relatedSchema);
      saveTherapeuticSchemas(schemas);
    }
  }
};

// ========================================
// HELPERS
// ========================================

/**
 * Formatte la fréquence d'un schéma en texte
 * @param {object} frequency - Objet fréquence
 * @returns {string}
 */
export const formatFrequency = (frequency) => {
  if (frequency.type === 'daily') {
    return `${frequency.dosesPerDay} fois par jour`;
  } else if (frequency.type === 'interval') {
    return `1 fois tous les ${frequency.intervalDays} jours`;
  }
  return '';
};

/**
 * Récupère tous les noms de médicaments pour l'autocomplete
 * @returns {string[]}
 */
export const getAllMedicationNames = () => {
  const medications = getMedications();
  return Object.values(medications).map(m => m.name).sort();
};

/**
 * Trouve un médicament par son nom
 * @param {string} name - Nom du médicament
 * @returns {object|null}
 */
export const findMedicationByName = (name) => {
  const medications = getMedications();
  return Object.values(medications).find(m => m.name.toLowerCase() === name.toLowerCase());
};
