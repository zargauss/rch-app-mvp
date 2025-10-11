import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Portal, Modal, Card, Switch, TextInput } from 'react-native-paper';
import AppCard from '../components/ui/AppCard';
import AppText from '../components/ui/AppText';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import Slider from '@react-native-community/slider';
import storage from '../utils/storage';
import calculateLichtigerScore from '../utils/scoreCalculator';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getSurveyDayKey } from '../utils/dayKey';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const [bristol, setBristol] = useState(4);
  const [hasBlood, setHasBlood] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [yesterdayScore, setYesterdayScore] = useState(null);
  const [todayProvisionalScore, setTodayProvisionalScore] = useState(null);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  const bristolDescriptions = useMemo(() => ({
    1: 'Type 1 — Noix dures séparées (constipation sévère)',
    2: 'Type 2 — Saucisse grumeleuse (constipation)',
    3: 'Type 3 — Saucisse fissurée (normal)',
    4: 'Type 4 — Saucisse lisse et molle (normal)',
    5: 'Type 5 — Morceaux mous (tendance diarrhéique)',
    6: 'Type 6 — Morceaux floconneux (diarrhée)',
    7: 'Type 7 — Aqueux, sans morceaux (diarrhée sévère)'
  }), []);

  const computeTodayCount = () => {
    const json = storage.getString('dailySells');
    if (!json) return 0;
    const list = JSON.parse(json);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    return list.filter((e) => e.timestamp >= start && e.timestamp < end).length;
  };

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const m = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  };

  const isNight = (timestamp) => {
    // 23h -> 6h
    const d = new Date(timestamp);
    const minutes = d.getHours() * 60 + d.getMinutes();
    return minutes >= 1380 || minutes < 360; // 23h = 1380 min, 6h = 360 min
  };

  const computeStoolSubscoresForDate = (dateStr) => {
    const stoolsJson = storage.getString('dailySells');
    const stools = stoolsJson ? JSON.parse(stoolsJson) : [];
    const dayStart = new Date(dateStr + 'T00:00:00').getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const dayStools = stools.filter(s => s.timestamp >= dayStart && s.timestamp < dayEnd);
    const stoolsCount = dayStools.length;
    const nocturnalCount = dayStools.filter(s => isNight(s.timestamp)).length;
    const bloodCount = dayStools.filter(s => s.hasBlood).length;

    let stoolsScore = 0;
    if (stoolsCount >= 10) stoolsScore = 4;
    else if (stoolsCount >= 7) stoolsScore = 3;
    else if (stoolsCount >= 5) stoolsScore = 2;
    else if (stoolsCount >= 3) stoolsScore = 1;
    else stoolsScore = 0;

    const nocturnalScore = nocturnalCount > 0 ? 1 : 0;

    let bloodScore = 0;
    if (stoolsCount > 0) {
      const ratio = bloodCount / stoolsCount;
      if (ratio === 0) bloodScore = 0;
      else if (ratio < 0.5) bloodScore = 1;
      else if (ratio < 1) bloodScore = 2;
      else bloodScore = 3;
    }

    return stoolsScore + nocturnalScore + bloodScore;
  };

  useFocusEffect(
    React.useCallback(() => {
      setDailyCount(computeTodayCount());
      const key = getSurveyDayKey(new Date(), 7);
      const json = storage.getString('dailySurvey');
      if (json) {
        const map = JSON.parse(json);
        setSurveyCompleted(Boolean(map[key]));
      } else {
        setSurveyCompleted(false);
      }

      // Compute yesterday score and persist to history if needed
      const today = new Date();
      const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      const yDateStr = formatDate(yesterday);
      const calculatedYesterday = calculateLichtigerScore(yDateStr, storage);

      // Read history
      const histJson = storage.getString('scoresHistory');
      const history = histJson ? JSON.parse(histJson) : [];
      const existing = history.find((h) => h.date === yDateStr);
      if (calculatedYesterday != null && !existing) {
        const newHistory = [{ date: yDateStr, score: calculatedYesterday }, ...history];
        storage.set('scoresHistory', JSON.stringify(newHistory));
        setYesterdayScore(calculatedYesterday);
      } else {
        setYesterdayScore(existing ? existing.score : calculatedYesterday);
      }

      // Today provisional score
      const tDateStr = formatDate(today);
      const fullToday = calculateLichtigerScore(tDateStr, storage);
      if (fullToday == null) {
        setTodayProvisionalScore(computeStoolSubscoresForDate(tDateStr));
      } else {
        setTodayProvisionalScore(fullToday);
        // Si on a un score complet pour aujourd'hui, le sauvegarder dans l'historique
        const histJson = storage.getString('scoresHistory');
        const history = histJson ? JSON.parse(histJson) : [];
        const existingToday = history.find((h) => h.date === tDateStr);
        if (!existingToday) {
          const newHistory = [{ date: tDateStr, score: fullToday }, ...history];
          storage.set('scoresHistory', JSON.stringify(newHistory));
        }
      }
    }, [])
  );

  const hideModal = () => {
    setVisible(false);
    const now = new Date();
    setDateInput(now.toLocaleDateString('fr-FR'));
    setTimeInput(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setBristol(4);
    setHasBlood(false);
  };
  const showModal = () => {
    const now = new Date();
    setDateInput(now.toLocaleDateString('fr-FR'));
    setTimeInput(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setVisible(true);
  };

  const containerStyle = useMemo(() => ({
    margin: 16
  }), []);

  const formatDateInput = (text) => {
    // Supprimer tout sauf les chiffres
    const numbers = text.replace(/\D/g, '');
    
    // Limiter à 8 chiffres (DDMMYYYY)
    const limited = numbers.slice(0, 8);
    
    // Formater avec les /
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
    }
  };

  const formatTimeInput = (text) => {
    // Supprimer tout sauf les chiffres
    const numbers = text.replace(/\D/g, '');
    
    // Limiter à 4 chiffres (HHMM)
    const limited = numbers.slice(0, 4);
    
    // Formater avec le :
    if (limited.length <= 2) {
      return limited;
    } else {
      return `${limited.slice(0, 2)}:${limited.slice(2)}`;
    }
  };

  const validateDate = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    // Validation basique
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > 2100) return false;
    
    // Validation avec Date
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const validateTime = (timeStr) => {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return false;
    
    const hour = parseInt(parts[0]);
    const minute = parseInt(parts[1]);
    
    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
  };

  const parseDateTime = (dateStr, timeStr) => {
    try {
      if (!validateDate(dateStr) || !validateTime(timeStr)) {
        return new Date(); // Retourner la date actuelle si invalide
      }

      const [day, month, year] = dateStr.split('/');
      const [hour, minute] = timeStr.split(':');
      
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1, // Les mois commencent à 0
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );
      
      return date;
    } catch (error) {
      return new Date(); // Retourner la date actuelle en cas d'erreur
    }
  };

  const handleSave = () => {
    const selectedDateTime = parseDateTime(dateInput, timeInput);
    
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: selectedDateTime.getTime(),
      bristolScale: Math.round(bristol),
      hasBlood
    };

    const existingJson = storage.getString('dailySells');
    const existing = existingJson ? JSON.parse(existingJson) : [];
    const updated = [entry, ...existing];
    storage.set('dailySells', JSON.stringify(updated));
    
    setDailyCount(computeTodayCount());
    // refresh provisional score after add
    const tDateStr = formatDate(new Date());
    const fullToday = calculateLichtigerScore(tDateStr, storage);
    if (fullToday == null) {
      setTodayProvisionalScore(computeStoolSubscoresForDate(tDateStr));
    } else {
      setTodayProvisionalScore(fullToday);
      // Sauvegarder le score complet dans l'historique
      const histJson = storage.getString('scoresHistory');
      const history = histJson ? JSON.parse(histJson) : [];
      const existingToday = history.find((h) => h.date === tDateStr);
      if (!existingToday) {
        const newHistory = [{ date: tDateStr, score: fullToday }, ...history];
        storage.set('scoresHistory', JSON.stringify(newHistory));
      }
    }
    hideModal();
  };

  const navigateToSurvey = () => {
    try {
      navigation.navigate('DailySurvey');
    } catch (e) {
      try {
        navigation.getParent()?.navigate('DailySurvey');
      } catch (_) {
        // ignore
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <PrimaryButton icon="plus" onPress={showModal} style={styles.actionButton}>
          Enregistrer une selle
        </PrimaryButton>
        <SecondaryButton icon="check" onPress={navigateToSurvey} style={styles.actionButton}>
          {surveyCompleted ? 'Modifier le bilan' : 'Compléter mon bilan du jour'}
        </SecondaryButton>
      </View>

      <AppCard style={styles.card}>
        <AppText variant="caption">Score de la veille</AppText>
        <AppText variant="headline">{yesterdayScore == null ? 'N/A' : yesterdayScore}</AppText>
      </AppCard>

      <AppCard style={styles.card}>
        <AppText variant="caption">Compteur de selles du jour</AppText>
        <AppText variant="headline">{dailyCount}</AppText>
      </AppCard>

      <AppCard style={styles.card}>
        <AppText variant="caption">Score du jour (provisoire)</AppText>
        <AppText variant="headline">{todayProvisionalScore == null ? 'N/A' : todayProvisionalScore}</AppText>
      </AppCard>

      

      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
          <AppCard>
            <AppText variant="title">Nouvelle selle</AppText>
            
            <View style={styles.dateTimeSection}>
              <AppText style={styles.fieldLabel}>Date et heure</AppText>
              <View style={styles.dateTimeRow}>
                <TextInput
                  mode="outlined"
                  label="Date (DD/MM/YYYY)"
                  value={dateInput}
                  onChangeText={(text) => setDateInput(formatDateInput(text))}
                  style={styles.dateTimeInput}
                  placeholder="11/01/2025"
                  keyboardType="numeric"
                  maxLength={10}
                  error={dateInput.length > 0 && !validateDate(dateInput)}
                />
                <TextInput
                  mode="outlined"
                  label="Heure (HH:MM)"
                  value={timeInput}
                  onChangeText={(text) => setTimeInput(formatTimeInput(text))}
                  style={styles.dateTimeInput}
                  placeholder="14:30"
                  keyboardType="numeric"
                  maxLength={5}
                  error={timeInput.length > 0 && !validateTime(timeInput)}
                />
              </View>
              <AppText variant="caption" style={styles.dateTimeHint}>
                Format: Date DD/MM/YYYY, Heure HH:MM (24h)
              </AppText>
            </View>

            <View>
              <AppText style={styles.fieldLabel}>Consistance (Bristol)</AppText>
              <Slider
                minimumValue={1}
                maximumValue={7}
                step={1}
                value={bristol}
                onValueChange={setBristol}
              />
              <AppText style={styles.bristolHint}>Sélection: {bristol} — {bristolDescriptions[bristol]}</AppText>
              <View style={styles.row}>
                <AppText>Présence de sang</AppText>
                <Switch value={hasBlood} onValueChange={setHasBlood} style={styles.switch} />
              </View>
            </View>
            <View style={styles.modalActions}>
              <Button onPress={hideModal} mode="text">Annuler</Button>
              <PrimaryButton onPress={handleSave}>Enregistrer</PrimaryButton>
            </View>
          </AppCard>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  actionButton: {
    flex: 1
  },
  addButton: {
    marginTop: 16,
    alignSelf: 'flex-start'
  },
  fieldLabel: {
    marginBottom: 8
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bristolHint: {
    marginTop: 6,
    color: '#475569'
  },
  switch: {
    marginLeft: 12
  },
  card: {
    marginTop: 16
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16
  },
  dateTimeSection: {
    marginBottom: 16
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  dateTimeButton: {
    flex: 1
  },
  dateTimeInput: {
    flex: 1
  },
  dateTimeHint: {
    marginTop: 8,
    color: '#6B7280',
    textAlign: 'center'
  }
});
