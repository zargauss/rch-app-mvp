export function getSurveyDayKey(date = new Date(), resetHour = 7) {
  const d = new Date(date);
  const boundary = new Date(d.getFullYear(), d.getMonth(), d.getDate(), resetHour, 0, 0, 0);
  // If before reset hour, use previous day as the survey day
  if (d < boundary) {
    const prev = new Date(boundary.getTime() - 24 * 60 * 60 * 1000);
    const yyyy = prev.getFullYear();
    const mm = String(prev.getMonth() + 1).padStart(2, '0');
    const dd = String(prev.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default getSurveyDayKey;

