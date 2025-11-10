/**
 * Utilitaires de formatage de dates pour l'application
 */

/**
 * Formate une date en YYYY-MM-DD
 * @param {Date} d - Date à formater
 * @returns {string} - Date formatée
 */
export const formatDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Formate un timestamp en date/heure compacte
 * @param {number} timestamp - Timestamp à formater
 * @returns {string} - Date formatée (ex: "Aujourd'hui 14:30", "Hier 09:15", "12/01 18:45")
 */
export const formatCompactDate = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  if (isToday) return `Aujourd'hui ${time}`;
  if (isYesterday) return `Hier ${time}`;

  return `${date.getDate()}/${date.getMonth() + 1} ${time}`;
};

/**
 * Formate un timestamp en date uniquement (sans heure)
 * @param {number} timestamp - Timestamp à formater
 * @returns {string} - Date formatée (ex: "Aujourd'hui", "Hier", "12 janvier")
 */
export const formatCompactDateOnly = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Aujourd'hui";
  if (isYesterday) return 'Hier';

  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  return `${date.getDate()} ${months[date.getMonth()]}`;
};

/**
 * Valide un format de date DD/MM/YYYY
 * @param {string} dateStr - Date à valider
 * @returns {boolean} - true si valide
 */
export const validateDate = (dateStr) => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);

  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;

  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
};

/**
 * Valide un format d'heure HH:MM
 * @param {string} timeStr - Heure à valider
 * @returns {boolean} - true si valide
 */
export const validateTime = (timeStr) => {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return false;

  const hour = parseInt(parts[0]);
  const minute = parseInt(parts[1]);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
};

/**
 * Parse une date et heure au format DD/MM/YYYY et HH:MM
 * @param {string} dateStr - Date au format DD/MM/YYYY
 * @param {string} timeStr - Heure au format HH:MM
 * @returns {Date} - Date parsée ou date actuelle si invalide
 */
export const parseDateTime = (dateStr, timeStr) => {
  try {
    if (!validateDate(dateStr) || !validateTime(timeStr)) {
      return new Date();
    }

    const [day, month, year] = dateStr.split('/');
    const [hour, minute] = timeStr.split(':');

    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    );

    return date;
  } catch (error) {
    return new Date();
  }
};
