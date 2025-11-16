// Analyseur de corrélations entre tags et symptômes
// Analyse l'impact des tags sur : nombre de selles, sang, score de Lichtiger

import { getNotesWithTags, getAllUniqueTags } from './notesUtils';
import storage from './storage';
import calculateLichtigerScore from './scoreCalculator';

/**
 * Configuration de l'analyse
 */
const ANALYSIS_CONFIG = {
  lookbackDays: 7, // Analyser les 7 derniers jours
  maxDelayDays: 4, // Impact jusqu'à J+4
  minOccurrences: 3, // Minimum 3 occurrences pour considérer une corrélation
};

/**
 * Parse une date YYYY-MM-DD en objet Date à minuit
 */
const parseDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Formate une date en YYYY-MM-DD
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Ajoute des jours à une date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Récupère le nombre de selles pour une date donnée
 */
const getStoolCountForDate = (dateStr) => {
  const stools = JSON.parse(storage.getString('dailySells') || '[]');
  return stools.filter(s => {
    const stoolDate = new Date(s.timestamp);
    return formatDate(stoolDate) === dateStr;
  }).length;
};

/**
 * Récupère le nombre de selles sanglantes pour une date donnée
 */
const getBloodyStoolCountForDate = (dateStr) => {
  const stools = JSON.parse(storage.getString('dailySells') || '[]');
  return stools.filter(s => {
    const stoolDate = new Date(s.timestamp);
    return formatDate(stoolDate) === dateStr && s.hasBlood === true;
  }).length;
};

/**
 * Récupère le score de Lichtiger pour une date donnée
 */
const getLichtigerScoreForDate = (dateStr) => {
  const scoresHistory = JSON.parse(storage.getString('scoresHistory') || '[]');
  const scoreEntry = scoresHistory.find(s => s.date === dateStr);
  return scoreEntry ? scoreEntry.score : null;
};

/**
 * Calcule la moyenne d'un tableau de nombres
 */
const average = (arr) => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

/**
 * Calcule le pourcentage d'augmentation/diminution
 */
const calculatePercentageChange = (baseline, value) => {
  if (baseline === 0) return value > 0 ? 100 : 0;
  return ((value - baseline) / baseline) * 100;
};

/**
 * Analyse l'impact d'un tag sur le nombre de selles
 * @param {string} tag - Le tag à analyser
 * @param {Array} notes - Les notes avec tags
 * @returns {Object} Résultat de l'analyse
 */
const analyzeTagImpactOnStools = (tag, notes) => {
  const tagOccurrences = notes.filter(note => note.tags.includes(tag));

  if (tagOccurrences.length < ANALYSIS_CONFIG.minOccurrences) {
    return null; // Pas assez d'occurrences
  }

  const impacts = [];

  // Pour chaque occurrence du tag, analyser l'impact de J+0 à J+4
  for (let delay = 0; delay <= ANALYSIS_CONFIG.maxDelayDays; delay++) {
    const stoolCounts = [];
    const baselineCounts = [];

    tagOccurrences.forEach(note => {
      const noteDate = parseDate(note.date);
      const impactDate = addDays(noteDate, delay);
      const impactDateStr = formatDate(impactDate);

      // Nombre de selles à J+delay
      const stoolCount = getStoolCountForDate(impactDateStr);
      stoolCounts.push(stoolCount);

      // Baseline : moyenne des selles 7 jours avant la note (hors période d'impact)
      const baselineStart = addDays(noteDate, -14);
      const baselineEnd = addDays(noteDate, -7);
      let baselineSum = 0;
      let baselineDays = 0;

      for (let i = 0; i < 7; i++) {
        const baselineDate = addDays(baselineStart, i);
        const baselineDateStr = formatDate(baselineDate);
        baselineSum += getStoolCountForDate(baselineDateStr);
        baselineDays++;
      }

      const baselineAvg = baselineDays > 0 ? baselineSum / baselineDays : 0;
      baselineCounts.push(baselineAvg);
    });

    const avgStoolCount = average(stoolCounts);
    const avgBaseline = average(baselineCounts);
    const percentageChange = calculatePercentageChange(avgBaseline, avgStoolCount);

    impacts.push({
      delay,
      avgStoolCount: Math.round(avgStoolCount * 10) / 10,
      avgBaseline: Math.round(avgBaseline * 10) / 10,
      percentageChange: Math.round(percentageChange),
    });
  }

  // Trouver le délai avec l'impact le plus significatif
  const maxImpact = impacts.reduce((max, impact) =>
    Math.abs(impact.percentageChange) > Math.abs(max.percentageChange) ? impact : max
  , impacts[0]);

  return {
    tag,
    metric: 'stools',
    occurrences: tagOccurrences.length,
    maxImpact,
    allImpacts: impacts,
  };
};

/**
 * Analyse l'impact d'un tag sur le sang dans les selles
 */
const analyzeTagImpactOnBlood = (tag, notes) => {
  const tagOccurrences = notes.filter(note => note.tags.includes(tag));

  if (tagOccurrences.length < ANALYSIS_CONFIG.minOccurrences) {
    return null;
  }

  const impacts = [];

  for (let delay = 0; delay <= ANALYSIS_CONFIG.maxDelayDays; delay++) {
    const bloodyCounts = [];
    const baselineCounts = [];

    tagOccurrences.forEach(note => {
      const noteDate = parseDate(note.date);
      const impactDate = addDays(noteDate, delay);
      const impactDateStr = formatDate(impactDate);

      const bloodyCount = getBloodyStoolCountForDate(impactDateStr);
      bloodyCounts.push(bloodyCount);

      // Baseline
      const baselineStart = addDays(noteDate, -14);
      let baselineSum = 0;
      let baselineDays = 0;

      for (let i = 0; i < 7; i++) {
        const baselineDate = addDays(baselineStart, i);
        const baselineDateStr = formatDate(baselineDate);
        baselineSum += getBloodyStoolCountForDate(baselineDateStr);
        baselineDays++;
      }

      const baselineAvg = baselineDays > 0 ? baselineSum / baselineDays : 0;
      baselineCounts.push(baselineAvg);
    });

    const avgBloodyCount = average(bloodyCounts);
    const avgBaseline = average(baselineCounts);
    const percentageChange = calculatePercentageChange(avgBaseline, avgBloodyCount);

    impacts.push({
      delay,
      avgBloodyCount: Math.round(avgBloodyCount * 10) / 10,
      avgBaseline: Math.round(avgBaseline * 10) / 10,
      percentageChange: Math.round(percentageChange),
    });
  }

  const maxImpact = impacts.reduce((max, impact) =>
    Math.abs(impact.percentageChange) > Math.abs(max.percentageChange) ? impact : max
  , impacts[0]);

  return {
    tag,
    metric: 'blood',
    occurrences: tagOccurrences.length,
    maxImpact,
    allImpacts: impacts,
  };
};

/**
 * Analyse l'impact d'un tag sur le score de Lichtiger
 */
const analyzeTagImpactOnScore = (tag, notes) => {
  const tagOccurrences = notes.filter(note => note.tags.includes(tag));

  if (tagOccurrences.length < ANALYSIS_CONFIG.minOccurrences) {
    return null;
  }

  const impacts = [];

  for (let delay = 0; delay <= ANALYSIS_CONFIG.maxDelayDays; delay++) {
    const scores = [];
    const baselineScores = [];

    tagOccurrences.forEach(note => {
      const noteDate = parseDate(note.date);
      const impactDate = addDays(noteDate, delay);
      const impactDateStr = formatDate(impactDate);

      const score = getLichtigerScoreForDate(impactDateStr);
      if (score !== null) {
        scores.push(score);
      }

      // Baseline
      const baselineStart = addDays(noteDate, -14);
      let baselineSum = 0;
      let baselineDays = 0;

      for (let i = 0; i < 7; i++) {
        const baselineDate = addDays(baselineStart, i);
        const baselineDateStr = formatDate(baselineDate);
        const baselineScore = getLichtigerScoreForDate(baselineDateStr);
        if (baselineScore !== null) {
          baselineSum += baselineScore;
          baselineDays++;
        }
      }

      const baselineAvg = baselineDays > 0 ? baselineSum / baselineDays : 0;
      if (baselineDays > 0) {
        baselineScores.push(baselineAvg);
      }
    });

    if (scores.length === 0) continue;

    const avgScore = average(scores);
    const avgBaseline = average(baselineScores);
    const percentageChange = calculatePercentageChange(avgBaseline, avgScore);

    impacts.push({
      delay,
      avgScore: Math.round(avgScore * 10) / 10,
      avgBaseline: Math.round(avgBaseline * 10) / 10,
      percentageChange: Math.round(percentageChange),
      sampleSize: scores.length,
    });
  }

  if (impacts.length === 0) return null;

  const maxImpact = impacts.reduce((max, impact) =>
    Math.abs(impact.percentageChange) > Math.abs(max.percentageChange) ? impact : max
  , impacts[0]);

  return {
    tag,
    metric: 'score',
    occurrences: tagOccurrences.length,
    maxImpact,
    allImpacts: impacts,
  };
};

/**
 * Analyse toutes les corrélations
 * @returns {Array} Liste des corrélations détectées, triées par impact
 */
export const analyzeAllCorrelations = () => {
  const notes = getNotesWithTags();
  const uniqueTags = getAllUniqueTags();

  if (notes.length === 0 || uniqueTags.length === 0) {
    return [];
  }

  const correlations = [];

  // Pour chaque tag, analyser son impact sur chaque métrique
  uniqueTags.forEach(tag => {
    // Impact sur les selles
    const stoolImpact = analyzeTagImpactOnStools(tag, notes);
    if (stoolImpact && Math.abs(stoolImpact.maxImpact.percentageChange) >= 20) {
      correlations.push(stoolImpact);
    }

    // Impact sur le sang
    const bloodImpact = analyzeTagImpactOnBlood(tag, notes);
    if (bloodImpact && Math.abs(bloodImpact.maxImpact.percentageChange) >= 20) {
      correlations.push(bloodImpact);
    }

    // Impact sur le score
    const scoreImpact = analyzeTagImpactOnScore(tag, notes);
    if (scoreImpact && Math.abs(scoreImpact.maxImpact.percentageChange) >= 20) {
      correlations.push(scoreImpact);
    }
  });

  // Trier par impact (plus fort en premier)
  correlations.sort((a, b) =>
    Math.abs(b.maxImpact.percentageChange) - Math.abs(a.maxImpact.percentageChange)
  );

  return correlations;
};

/**
 * Formate une corrélation pour l'affichage
 */
export const formatCorrelation = (correlation) => {
  const { tag, metric, occurrences, maxImpact } = correlation;
  const { delay, percentageChange } = maxImpact;

  // Déterminer la couleur et l'icône selon l'impact
  let severity = 'low';
  let icon = '🟢';
  if (Math.abs(percentageChange) >= 50) {
    severity = 'high';
    icon = '🔴';
  } else if (Math.abs(percentageChange) >= 20) {
    severity = 'medium';
    icon = '🟡';
  }

  // Déterminer le message selon la métrique
  let metricLabel = '';
  let impactDescription = '';

  if (metric === 'stools') {
    metricLabel = 'nombre de selles';
    impactDescription = percentageChange > 0
      ? `+${percentageChange}% de selles`
      : `${percentageChange}% de selles`;
  } else if (metric === 'blood') {
    metricLabel = 'selles sanglantes';
    impactDescription = percentageChange > 0
      ? `+${percentageChange}% de sang`
      : `${percentageChange}% de sang`;
  } else if (metric === 'score') {
    metricLabel = 'score de Lichtiger';
    impactDescription = percentageChange > 0
      ? `+${percentageChange}% du score`
      : `${percentageChange}% du score`;
  }

  const delayText = delay === 0 ? 'le jour même' : `${delay} jour${delay > 1 ? 's' : ''} après`;

  return {
    tag,
    metric,
    severity,
    icon,
    title: tag,
    description: `${impactDescription} ${delayText}`,
    occurrences,
    percentageChange,
    delay,
    metricLabel,
  };
};

/**
 * Récupère les corrélations formatées pour l'affichage
 */
export const getFormattedCorrelations = () => {
  const correlations = analyzeAllCorrelations();
  return correlations.map(formatCorrelation);
};
