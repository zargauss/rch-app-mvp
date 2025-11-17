// ========================================
// Définitions des tags pour l'analyse MICI
// ========================================

/**
 * Tags organisés par type (aggravant/protecteur) et catégorie (alimentation/comportement)
 * Total : 39 tags (25 aggravants + 14 protecteurs)
 */
export const TAG_DEFINITIONS = {
  aggravants: {
    alimentation: [
      'viande rouge',
      'charcuterie',
      'fast food',
      'plats industriels',
      'fibres crues',
      'fruits crus',
      'alcool',
      'alcool important',
      'graisses saturées',
      'fritures',
      'café',
      'épices fortes',
      'produits laitiers',
      'repas copieux',
      'repas tardif',
      'aliments froids',
      'repas sauté',
    ],
    comportement: [
      'stress travail',
      'stress relationnel',
      'anxiété',
      'sommeil insuffisant',
      'sommeil perturbé',
      'sédentarité',
      'déshydratation',
      'manque repos',
    ],
  },
  protecteurs: {
    alimentation: [
      'poisson gras',
      'légumes cuits',
      'fruits cuits',
      'huile olive',
      'aliments fermentés',
      'hydratation importante',
      'tisane',
      'repos digestif',
    ],
    comportement: [
      'sport modéré',
      'sport intense',
      'sommeil réparateur',
      'relaxation',
      'méditation',
      'yoga',
      'marche',
      'bonne humeur',
    ],
  },
};

/**
 * Détermine si un tag est aggravant ou protecteur
 * @param {string} tag - Le tag à analyser
 * @returns {'aggravant'|'protecteur'|null} Type du tag
 */
export const getTagType = (tag) => {
  const allAggravants = [
    ...TAG_DEFINITIONS.aggravants.alimentation,
    ...TAG_DEFINITIONS.aggravants.comportement,
  ];

  const allProtecteurs = [
    ...TAG_DEFINITIONS.protecteurs.alimentation,
    ...TAG_DEFINITIONS.protecteurs.comportement,
  ];

  if (allAggravants.includes(tag)) {
    return 'aggravant';
  }
  if (allProtecteurs.includes(tag)) {
    return 'protecteur';
  }
  return null;
};

/**
 * Récupère tous les tags disponibles (liste complète)
 * @returns {string[]} Liste de tous les tags
 */
export const getAllTags = () => {
  return [
    ...TAG_DEFINITIONS.aggravants.alimentation,
    ...TAG_DEFINITIONS.aggravants.comportement,
    ...TAG_DEFINITIONS.protecteurs.alimentation,
    ...TAG_DEFINITIONS.protecteurs.comportement,
  ];
};

/**
 * Récupère le label d'affichage d'un tag (capitalisation pour l'affichage)
 * @param {string} tag - Le tag
 * @returns {string} Label d'affichage avec première lettre en majuscule
 */
export const getTagLabel = (tag) => {
  // Les tags utilisent maintenant des espaces, on capitalise juste la première lettre
  return tag.charAt(0).toUpperCase() + tag.slice(1);
};

/**
 * Génère la liste formatée pour le prompt IA
 * @returns {string} Liste formatée des tags
 */
export const getTagsForPrompt = () => {
  const lines = [];

  lines.push('FACTEURS AGGRAVANTS - Alimentation :');
  TAG_DEFINITIONS.aggravants.alimentation.forEach(tag => {
    lines.push(`- "${tag}"`);
  });

  lines.push('\nFACTEURS AGGRAVANTS - Comportement :');
  TAG_DEFINITIONS.aggravants.comportement.forEach(tag => {
    lines.push(`- "${tag}"`);
  });

  lines.push('\nFACTEURS PROTECTEURS - Alimentation :');
  TAG_DEFINITIONS.protecteurs.alimentation.forEach(tag => {
    lines.push(`- "${tag}"`);
  });

  lines.push('\nFACTEURS PROTECTEURS - Comportement :');
  TAG_DEFINITIONS.protecteurs.comportement.forEach(tag => {
    lines.push(`- "${tag}"`);
  });

  return lines.join('\n');
};
