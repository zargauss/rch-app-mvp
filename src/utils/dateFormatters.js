/**
 * Utilitaires de formatage et validation de dates
 */

/**
 * Formate une date au format YYYY-MM-DD
 */
export const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formate un timestamp en format compact "Aujourd'hui 14:30" ou "Hier 09:15"
 */
export const formatCompactDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today - dateDay) / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Aujourd'hui ${timeStr}`;
  if (diffDays === 1) return `Hier ${timeStr}`;
  if (diffDays < 7) return `${date.toLocaleDateString('fr-FR', { weekday: 'long' })} ${timeStr}`;
  return `${date.toLocaleDateString('fr-FR')} ${timeStr}`;
};

/**
 * Formate un timestamp en format compact sans heure "Aujourd'hui" ou "Hier"
 */
export const formatCompactDateOnly = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today - dateDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  return date.toLocaleDateString('fr-FR');
};

/**
 * Valide un format de date DD/MM/YYYY
 */
export const validateDate = (dateStr) => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateStr)) return false;

  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/**
 * Valide un format de temps HH:MM
 */
export const validateTime = (timeStr) => {
  const regex = /^\d{2}:\d{2}$/;
  if (!regex.test(timeStr)) return false;

  const [hour, minute] = timeStr.split(':').map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
};

/**
 * Parse une date et heure DD/MM/YYYY HH:MM vers un objet Date
 */
export const parseDateTime = (dateStr, timeStr) => {
  try {
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute);
  } catch (error) {
    return new Date();
  }
};
