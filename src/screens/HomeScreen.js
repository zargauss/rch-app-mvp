import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Portal, Modal, Card, Switch, TextInput } from 'react-native-paper';
import AppCard from '../components/ui/AppCard';
import AppText from '../components/ui/AppText';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import StatCard from '../components/ui/StatCard';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import Toast from '../components/ui/Toast';
import DateTimeInput, { isValidDate, isValidTime } from '../components/ui/DateTimeInput';
import Slider from '@react-native-community/slider';
import storage from '../utils/storage';
import calculateLichtigerScore from '../utils/scoreCalculator';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getSurveyDayKey } from '../utils/dayKey';
import { useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [bristol, setBristol] = useState(4);
  const [hasBlood, setHasBlood] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [yesterdayScore, setYesterdayScore] = useState(null);
  const [todayProvisionalScore, setTodayProvisionalScore] = useState(null);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  
  // États pour la modale de traitement
  const [treatmentModalVisible, setTreatmentModalVisible] = useState(false);
  const [treatmentName, setTreatmentName] = useState('');
  const [treatmentDateInput, setTreatmentDateInput] = useState('');
  const [treatmentTimeInput, setTreatmentTimeInput] = useState('');
  const [treatmentSuggestions, setTreatmentSuggestions] = useState([]);
  
  // État pour le Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

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
      const key = getSurveyDayKey(new Date(), 0);
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
        const existingIndex = history.findIndex((h) => h.date === tDateStr);
        if (existingIndex >= 0) {
          // Mettre à jour le score existant
          history[existingIndex].score = fullToday;
          storage.set('scoresHistory', JSON.stringify(history));
        } else {
          // Ajouter un nouveau score
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
  };

  // Fonctions pour la modale de traitement
  const showTreatmentModal = () => {
    const now = new Date();
    setTreatmentDateInput(now.toLocaleDateString('fr-FR'));
    setTreatmentTimeInput(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setTreatmentName('');
    setTreatmentSuggestions([]);
    setTreatmentModalVisible(true);
  };

  const hideTreatmentModal = () => {
    setTreatmentModalVisible(false);
    setTreatmentName('');
    setTreatmentSuggestions([]);
  };

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleTreatmentNameChange = (text) => {
    setTreatmentName(text);
    
    // Récupérer tous les traitements pour l'auto-complétion
    if (text.length > 0) {
      const treatmentsJson = storage.getString('treatments');
      const treatments = treatmentsJson ? JSON.parse(treatmentsJson) : [];
      
      // Extraire les noms uniques
      const uniqueNames = [...new Set(treatments.map(t => t.name))];
      
      // Filtrer ceux qui commencent par le texte entré
      const suggestions = uniqueNames.filter(name => 
        name.toLowerCase().startsWith(text.toLowerCase())
      ).slice(0, 5); // Limiter à 5 suggestions
      
      setTreatmentSuggestions(suggestions);
    } else {
      setTreatmentSuggestions([]);
    }
  };

  const saveTreatment = () => {
    if (!treatmentName.trim()) {
      showToast('Veuillez entrer le nom du traitement', 'error');
      return;
    }

    // Valider la date et l'heure
    if (!isValidDate(treatmentDateInput)) {
      showToast('Date invalide', 'error');
      return;
    }

    if (!isValidTime(treatmentTimeInput)) {
      showToast('Heure invalide', 'error');
      return;
    }

    const selectedDateTime = parseDateTime(treatmentDateInput, treatmentTimeInput);
    const timestamp = selectedDateTime.getTime();

    const treatmentsJson = storage.getString('treatments');
    const treatments = treatmentsJson ? JSON.parse(treatmentsJson) : [];
    
    const newTreatment = {
      id: Date.now().toString(),
      name: treatmentName.trim(),
      timestamp: timestamp
    };
    
    treatments.push(newTreatment);
    storage.set('treatments', JSON.stringify(treatments));
    
    hideTreatmentModal();
    showToast('💊 Traitement enregistré !', 'success');
  };
  const showModal = () => {
    const now = new Date();
    setDateInput(now.toLocaleDateString('fr-FR'));
    setTimeInput(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    
    // Récupérer la dernière selle pour pré-remplir les valeurs
    const stoolsJson = storage.getString('dailySells');
    const stools = stoolsJson ? JSON.parse(stoolsJson) : [];
    
    if (stools.length > 0) {
      // Trier par timestamp décroissant pour avoir la plus récente
      const sortedStools = stools.sort((a, b) => b.timestamp - a.timestamp);
      const lastStool = sortedStools[0];
      
      // Utiliser les valeurs de la dernière selle
      setBristol(lastStool.bristolScale);
      setHasBlood(lastStool.hasBlood);
    } else {
      // Valeurs par défaut si aucune selle
      setBristol(4);
      setHasBlood(false);
    }
    
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
    // Valider la date et l'heure
    if (!isValidDate(dateInput)) {
      showToast('Date invalide', 'error');
      return;
    }

    if (!isValidTime(timeInput)) {
      showToast('Heure invalide', 'error');
      return;
    }

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
      const existingIndex = history.findIndex((h) => h.date === tDateStr);
      if (existingIndex >= 0) {
        // Mettre à jour le score existant
        history[existingIndex].score = fullToday;
        storage.set('scoresHistory', JSON.stringify(history));
      } else {
        // Ajouter un nouveau score
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête avec message d'accueil */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.profileSection}>
              <View style={styles.profileIcon}>
                <AppText style={styles.profileEmoji}>👤</AppText>
              </View>
              <View style={styles.greetingSection}>
                <AppText variant="displayMedium" style={styles.greeting}>
                  Bonjour !
                </AppText>
                <AppText variant="bodyMedium" style={styles.subGreeting}>
                  Comment vous sentez-vous aujourd'hui ?
                </AppText>
              </View>
            </View>
            <View style={styles.notificationIcon}>
              <AppText style={styles.bellIcon}>🔔</AppText>
            </View>
          </View>
        </View>

        {/* Actions principales - Mises en avant */}
        <View style={styles.mainActionsContainer}>
          <AppCard style={styles.mainActionCard}>
            <AppText variant="headlineLarge" style={styles.mainActionTitle}>
              Actions importantes du jour
            </AppText>
            
            <View style={styles.mainActionButtons}>
              <PrimaryButton
                mode="contained"
                onPress={showModal}
                style={styles.mainPrimaryAction}
                icon="plus"
                buttonColor="#4ECDC4"
              >
                Enregistrer une selle
              </PrimaryButton>
              
              <PrimaryButton
                mode="contained"
                onPress={navigateToSurvey}
                style={styles.mainSecondaryAction}
                icon={surveyCompleted ? "check" : "clipboard-text"}
                buttonColor="#4A90E2"
                disabled={false}
              >
                {surveyCompleted ? "Modifier le bilan" : "Compléter le bilan"}
              </PrimaryButton>
              
              <PrimaryButton
                mode="contained"
                onPress={showTreatmentModal}
                style={styles.mainSecondaryAction}
                icon="pill"
                buttonColor="#9B59B6"
              >
                Prise de traitement
              </PrimaryButton>
            </View>
          </AppCard>
        </View>

        {/* Cartes de résumé */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Score d'hier"
            value={yesterdayScore !== null ? yesterdayScore : 'N/A'}
            subtitle="Score de Lichtiger"
            icon="chart-line"
            color={yesterdayScore !== null ? (yesterdayScore < 5 ? 'success' : yesterdayScore <= 10 ? 'warning' : 'error') : 'info'}
            trend={yesterdayScore !== null ? 'stable' : null}
            trendValue={yesterdayScore !== null ? 'Stable' : null}
          />
          
          <StatCard
            title="Selles aujourd'hui"
            value={dailyCount.toString()}
            subtitle="Enregistrements"
            icon="toilet"
            color="primary"
          />
          
          <StatCard
            title="Score du jour"
            value={todayProvisionalScore !== null ? todayProvisionalScore : 'N/A'}
            subtitle="Provisoire"
            icon="chart-bar"
            color={todayProvisionalScore !== null ? (todayProvisionalScore < 5 ? 'success' : todayProvisionalScore <= 10 ? 'warning' : 'error') : 'info'}
          />
        </View>


        {/* Message d'encouragement */}
        {dailyCount > 0 && (
          <AppCard style={styles.encouragementCard}>
            <View style={styles.encouragementContent}>
              <AppText style={styles.encouragementIcon}>💪</AppText>
              <AppText variant="bodyLarge" style={styles.encouragementText}>
                Excellent ! Vous suivez bien votre santé. Continuez comme ça !
              </AppText>
            </View>
          </AppCard>
        )}
      </ScrollView>

      {/* Bouton d'action flottant */}
      <FloatingActionButton
        onPress={showModal}
        icon="+"
        label="Ajouter"
      />

      {/* Modal d'enregistrement de selle */}
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
          <AppCard style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <AppText variant="headlineLarge" style={styles.modalTitle}>
                Nouvelle selle
              </AppText>
              
              <View style={styles.dateTimeSection}>
              <AppText style={styles.fieldLabel}>Date et heure</AppText>
              <DateTimeInput
                dateValue={dateInput}
                timeValue={timeInput}
                onDateChange={setDateInput}
                onTimeChange={setTimeInput}
                dateLabel="Date (DD/MM/YYYY)"
                timeLabel="Heure (HH:MM)"
              />
              <AppText variant="labelSmall" style={styles.dateTimeHint}>
                Format: Date DD/MM/YYYY, Heure HH:MM (24h)
              </AppText>
            </View>

            <View style={styles.bristolSection}>
              <AppText style={styles.fieldLabel}>Consistance (Bristol)</AppText>
              <Slider
                minimumValue={1}
                maximumValue={7}
                step={1}
                value={bristol}
                onValueChange={setBristol}
                style={styles.slider}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.outline}
                thumbStyle={{ backgroundColor: theme.colors.primary }}
              />
              <AppText variant="labelMedium" style={styles.bristolHint}>
                Sélection: {bristol} — {bristolDescriptions[bristol]}
              </AppText>
            </View>

            <View style={styles.bloodSection}>
              <View style={styles.switchRow}>
                <AppText variant="bodyLarge">Présence de sang</AppText>
                <Switch 
                  value={hasBlood} 
                  onValueChange={setHasBlood}
                  color={theme.colors.error}
                />
              </View>
            </View>

              <View style={styles.modalActions}>
                <SecondaryButton 
                  onPress={hideModal} 
                  style={styles.cancelButton}
                  labelStyle={styles.buttonLabel}
                >
                  Annuler
                </SecondaryButton>
                <PrimaryButton 
                  onPress={handleSave} 
                  style={styles.saveButton}
                  labelStyle={styles.buttonLabel}
                >
                  OK
                </PrimaryButton>
              </View>
            </ScrollView>
          </AppCard>
        </Modal>
      </Portal>

      {/* Modale de prise de traitement */}
      <Portal>
        <Modal visible={treatmentModalVisible} onDismiss={hideTreatmentModal} contentContainerStyle={styles.modalContainer}>
          <AppCard style={styles.modalCard}>
            <ScrollView>
              <Card.Title title="Prise de traitement" titleStyle={{ fontSize: 22, fontWeight: '700', color: '#1E293B' }} />
              
              <Card.Content>
                {/* Date et Heure */}
                <AppText variant="bodyMedium" style={styles.modalSectionLabel}>
                  📅 Date et heure de la prise
                </AppText>
                
                <DateTimeInput
                  dateValue={treatmentDateInput}
                  timeValue={treatmentTimeInput}
                  onDateChange={setTreatmentDateInput}
                  onTimeChange={setTreatmentTimeInput}
                  dateLabel="Date (JJ/MM/AAAA)"
                  timeLabel="Heure (HH:MM)"
                />

                {/* Nom du traitement */}
                <AppText variant="bodyMedium" style={[styles.modalSectionLabel, { marginTop: 20 }]}>
                  💊 Nom du traitement
                </AppText>
                
                <TextInput
                  label="Ex: Pentasa, Humira..."
                  value={treatmentName}
                  onChangeText={handleTreatmentNameChange}
                  style={[styles.treatmentInput, { backgroundColor: '#F8FAFB', borderRadius: 16 }]}
                  mode="outlined"
                  outlineStyle={{ borderRadius: 16 }}
                  autoCapitalize="words"
                />

                {/* Suggestions d'auto-complétion */}
                {treatmentSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {treatmentSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        mode="outlined"
                        onPress={() => {
                          setTreatmentName(suggestion);
                          setTreatmentSuggestions([]);
                        }}
                        style={styles.suggestionButton}
                        labelStyle={styles.suggestionButtonLabel}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </View>
                )}
              </Card.Content>

              <View style={styles.modalActions}>
                <Button
                  mode="text"
                  onPress={hideTreatmentModal}
                  textColor="#64748B"
                  style={styles.cancelButton}
                  labelStyle={{ fontSize: 16, fontWeight: '600' }}
                >
                  Annuler
                </Button>
                <PrimaryButton
                  mode="contained"
                  onPress={saveTreatment}
                  buttonColor="#9B59B6"
                  style={styles.saveButton}
                  labelStyle={{ fontSize: 16, fontWeight: '700' }}
                  contentStyle={{ height: 48 }}
                >
                  OK
                </PrimaryButton>
              </View>
            </ScrollView>
          </AppCard>
        </Modal>
      </Portal>

      {/* Toast de notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        duration={3000}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    paddingBottom: 80, // Espace pour la barre de navigation
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileEmoji: {
    fontSize: 24,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    color: '#2D3748',
    marginBottom: 4,
    fontWeight: '700',
  },
  subGreeting: {
    color: '#718096',
    fontWeight: '400',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bellIcon: {
    fontSize: 20,
  },
  statsContainer: {
    marginBottom: 24,
  },
  mainActionsContainer: {
    marginBottom: 32,
  },
  mainActionCard: {
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mainActionTitle: {
    color: '#2D3748',
    marginBottom: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  mainActionButtons: {
    gap: 16,
  },
  mainPrimaryAction: {
    marginBottom: 8,
    borderRadius: 20,
    paddingVertical: 8,
    elevation: 4,
  },
  mainSecondaryAction: {
    marginBottom: 8,
    borderRadius: 20,
    paddingVertical: 8,
    elevation: 4,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionCard: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionTitle: {
    color: '#2D3748',
    marginBottom: 20,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 16,
  },
  primaryAction: {
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 4,
  },
  secondaryAction: {
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 4,
  },
  encouragementCard: {
    backgroundColor: '#E8F8F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  encouragementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  encouragementIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  encouragementText: {
    flex: 1,
    color: '#2D5A4A',
    fontWeight: '500',
  },
  modalContainer: {
    margin: 20,
    maxHeight: '85%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  modalScroll: {
    padding: 28,
  },
  modalTitle: {
    color: '#2D3748',
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '700',
  },
  dateTimeSection: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateTimeInput: {
    flex: 1,
    backgroundColor: '#F8FAFB',
    borderRadius: 16,
  },
  dateTimeHint: {
    color: '#A0AEC0',
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bristolSection: {
    marginBottom: 28,
  },
  slider: {
    height: 48,
    marginVertical: 16,
  },
  bristolHint: {
    color: '#718096',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  bloodSection: {
    marginBottom: 28,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFB',
    borderRadius: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 16,
    height: 52,
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    height: 52,
  },
  treatmentInput: {
    marginTop: 8,
  },
  suggestionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  suggestionButton: {
    borderRadius: 12,
    borderColor: '#9B59B6',
  },
  suggestionButtonLabel: {
    color: '#9B59B6',
    fontSize: 14,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
});
