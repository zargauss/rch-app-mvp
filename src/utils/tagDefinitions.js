// ========================================
// Définitions des tags pour l'analyse MICI
// ========================================

/**
 * Tags organisés par type (aggravant/protecteur) et catégorie (alimentation/comportement)
 * Total : 38 tags (24 aggravants + 14 protecteurs)
 */
export const TAG_DEFINITIONS = {
  aggravants: {
    alimentation: [
      'viande-rouge',
      'charcuterie',
      'fast-food',
      'plats-industriels',
      'fibres-crues',
      'alcool',
      'alcool-important',
      'graisses-saturees',
      'fritures',
      'cafe',
      'epices-fortes',
      'produits-laitiers',
      'repas-copieux',
      'repas-tardif',
      'aliments-froids',
      'repas-saute',
    ],
    comportement: [
      'stress-travail',
      'stress-relationnel',
      'anxiete',
      'sommeil-insuffisant',
      'sommeil-perturbe',
      'sedentarite',
      'deshydratation',
      'manque-repos',
    ],
  },
  protecteurs: {
    alimentation: [
      'poisson-gras',
      'legumes-cuits',
      'fruits-cuits',
      'huile-olive',
      'aliments-fermentes',
      'hydratation-importante',
      'tisane',
      'repos-digestif',
    ],
    comportement: [
      'sport-modere',
      'sport-intense',
      'sommeil-reparateur',
      'relaxation',
      'meditation',
      'yoga',
      'marche',
      'bonne-humeur',
    ],
  },
};

/**
 * Labels d'affichage pour chaque tag
 */
export const TAG_LABELS = {
  // Aggravants - Alimentation
  'viande-rouge': 'Viande rouge',
  'charcuterie': 'Charcuterie',
  'fast-food': 'Fast food',
  'plats-industriels': 'Plats industriels',
  'fibres-crues': 'Fibres crues',
  'alcool': 'Alcool',
  'alcool-important': 'Alcool important',
  'graisses-saturees': 'Graisses saturées',
  'fritures': 'Fritures',
  'cafe': 'Café',
  'epices-fortes': 'Épices fortes',
  'produits-laitiers': 'Produits laitiers',
  'repas-copieux': 'Repas copieux',
  'repas-tardif': 'Repas tardif',
  'aliments-froids': 'Aliments froids',
  'repas-saute': 'Repas sauté',

  // Aggravants - Comportement
  'stress-travail': 'Stress travail',
  'stress-relationnel': 'Stress relationnel',
  'anxiete': 'Anxiété',
  'sommeil-insuffisant': 'Sommeil insuffisant',
  'sommeil-perturbe': 'Sommeil perturbé',
  'sedentarite': 'Sédentarité',
  'deshydratation': 'Déshydratation',
  'manque-repos': 'Manque repos',

  // Protecteurs - Alimentation
  'poisson-gras': 'Poisson gras',
  'legumes-cuits': 'Légumes cuits',
  'fruits-cuits': 'Fruits cuits',
  'huile-olive': 'Huile olive',
  'aliments-fermentes': 'Aliments fermentés',
  'hydratation-importante': 'Hydratation importante',
  'tisane': 'Tisane',
  'repos-digestif': 'Repos digestif',

  // Protecteurs - Comportement
  'sport-modere': 'Sport modéré',
  'sport-intense': 'Sport intense',
  'sommeil-reparateur': 'Sommeil réparateur',
  'relaxation': 'Relaxation',
  'meditation': 'Méditation',
  'yoga': 'Yoga',
  'marche': 'Marche',
  'bonne-humeur': 'Bonne humeur',
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
 * Récupère le label d'affichage d'un tag
 * @param {string} tag - Le tag
 * @returns {string} Label d'affichage
 */
export const getTagLabel = (tag) => {
  return TAG_LABELS[tag] || tag;
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
