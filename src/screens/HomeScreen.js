import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Animated } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

// Components
import AppCard from '../components/ui/AppCard';
import AppText from '../components/ui/AppText';
import PrimaryButton from '../components/ui/PrimaryButton';
import Toast from '../components/ui/Toast';
import DateTimeInput, { isValidDate, isValidTime } from '../components/ui/DateTimeInput';
import SymptomModal from '../components/modals/SymptomModal';
import NoteModal from '../components/modals/NoteModal';
import BristolScaleSlider from '../components/ui/BristolScaleSlider';

// Home sections
import TodaySection from '../components/home/TodaySection';
import RSSSection from '../components/home/RSSSection';
import HistorySection from '../components/home/HistorySection';
import CalendarSection from '../components/home/CalendarSection';
import IBDiskSection from '../components/home/IBDiskSection';

// Hooks
import { useStoolModal } from '../contexts/StoolModalContext';
import { useSpeedDial } from '../contexts/SpeedDialContext';
import { useHistoryData } from '../hooks/useHistoryData';
import { useStoolManagement } from '../hooks/useStoolManagement';
import { useSymptomManagement } from '../hooks/useSymptomManagement';
import { useNoteManagement } from '../hooks/useNoteManagement';

// Utils
import storage from '../utils/storage';
import calculateLichtigerScore from '../utils/scoreCalculator';
import { getSurveyDayKey } from '../utils/dayKey';
import { formatDate, parseDateTime } from '../utils/dateFormatters';
import { fetchRSSFeed } from '../services/rssService';
import { saveFeedback, errorFeedback } from '../utils/haptics';
import designSystem from '../theme/designSystem';

export default function HomeScreen({ route }) {
  const navigation = useNavigation();
  const theme = useTheme();
  const { isModalVisible, openModal, closeModal } = useStoolModal();
  const { registerHandlers } = useSpeedDial();

  // États locaux
  const [bristol, setBristol] = useState(4);
  const [hasBlood, setHasBlood] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [todayProvisionalScore, setTodayProvisionalScore] = useState(null);
  const [calendarMode, setCalendarMode] = useState('score');
  const [currentIbdiskIndex, setCurrentIbdiskIndex] = useState(0);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [rssArticles, setRssArticles] = useState([]);
  const [rssLoading, setRssLoading] = useState(true);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [scoreTooltipVisible, setScoreTooltipVisible] = useState(false);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipScale = useRef(new Animated.Value(0.96)).current;

  // Custom hooks
  const {
    stools,
    scores,
    ibdiskHistory,
    symptoms,
    notes,
    loadHistoryData,
  } = useHistoryData();

  const stoolManagement = useStoolManagement({
    onDataChange: () => {
      loadHistoryData();
      setDailyCount(computeTodayCount());
    },
  });

  const symptomManagement = useSymptomManagement({
    onDataChange: loadHistoryData,
    showToast,
  });

  const noteManagement = useNoteManagement({
    onDataChange: loadHistoryData,
    showToast,
  });

  // Animations
  useEffect(() => {
    if (scoreTooltipVisible) {
      Animated.parallel([
        Animated.timing(tooltipOpacity, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.spring(tooltipScale, { toValue: 1, speed: 20, bounciness: 6, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(tooltipOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(tooltipScale, { toValue: 0.96, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [scoreTooltipVisible]);

  const bristolDescriptions = useMemo(() => ({
    1: 'Noix dures séparées',
    2: 'Saucisse grumeleuse',
    3: 'Saucisse fissurée',
    4: 'Saucisse lisse (normal)',
    5: 'Morceaux mous',
    6: 'Morceaux floconneux',
    7: 'Aqueux, liquide'
  }), []);

  // Helpers
  const computeTodayCount = () => {
    const json = storage.getString('dailySells');
    if (!json) return 0;
    const list = JSON.parse(json);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    return list.filter((e) => e.timestamp >= start && e.timestamp < end).length;
  };

  const computeStoolSubscoresForDate = (dateStr) => {
    const stoolsJson = storage.getString('dailySells');
    const stools = stoolsJson ? JSON.parse(stoolsJson) : [];
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const dayStools = stools.filter(s => s.timestamp >= dayStart && s.timestamp < dayEnd);
    const stoolsCount = dayStools.length;
    const nocturnalCount = dayStools.filter(s => {
      const d = new Date(s.timestamp);
      const minutes = d.getHours() * 60 + d.getMinutes();
      return minutes >= 1380 || minutes < 360;
    }).length;
    const bloodCount = dayStools.filter(s => s.hasBlood).length;

    let stoolsScore = 0;
    if (stoolsCount >= 10) stoolsScore = 4;
    else if (stoolsCount >= 7) stoolsScore = 3;
    else if (stoolsCount >= 5) stoolsScore = 2;
    else if (stoolsCount >= 3) stoolsScore = 1;

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

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideModal = () => {
    closeModal();
  };

  const handleSave = () => {
    if (!isValidDate(dateInput)) {
      errorFeedback();
      showToast('Date invalide', 'error');
      return;
    }

    if (!isValidTime(timeInput)) {
      errorFeedback();
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
    const tDateStr = formatDate(new Date());
    const fullToday = calculateLichtigerScore(tDateStr, storage);
    if (fullToday == null) {
      setTodayProvisionalScore(computeStoolSubscoresForDate(tDateStr));
    } else {
      setTodayProvisionalScore(fullToday);
      const histJson = storage.getString('scoresHistory');
      const history = histJson ? JSON.parse(histJson) : [];
      const existingIndex = history.findIndex((h) => h.date === tDateStr);
      if (existingIndex >= 0) {
        history[existingIndex].score = fullToday;
        storage.set('scoresHistory', JSON.stringify(history));
      } else {
        const newHistory = [{ date: tDateStr, score: fullToday }, ...history];
        storage.set('scoresHistory', JSON.stringify(newHistory));
      }
    }

    saveFeedback();
    loadHistoryData();
    hideModal();
    showToast('✅ Selle enregistrée !', 'success');
  };

  const getBristolColor = (bristol) => {
    if (bristol <= 2) return '#4C4DDC';
    if (bristol <= 4) return '#4C4DDC';
    if (bristol <= 5) return '#C8C8F4';
    return '#101010';
  };

  const loadRSSArticles = async () => {
    try {
      setRssLoading(true);
      const articles = await fetchRSSFeed();
      setRssArticles(articles);
    } catch (error) {
      console.error('Erreur lors du chargement des articles RSS:', error);
      setRssArticles([]);
    } finally {
      setRssLoading(false);
    }
  };

  const openArticle = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showToast('Impossible d\'ouvrir le lien', 'error');
      }
    } catch (error) {
      showToast('Erreur lors de l\'ouverture du lien', 'error');
    }
  };

  // Register Speed Dial handlers
  useEffect(() => {
    registerHandlers({
      onStoolPress: () => openModal(),
      onSymptomPress: symptomManagement.handleOpenSymptomModal,
      onNotePress: noteManagement.handleOpenNoteModal,
    });
  }, []);

  // Initialize modal values
  useEffect(() => {
    if (isModalVisible) {
      const now = new Date();
      setDateInput(now.toLocaleDateString('fr-FR'));
      setTimeInput(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));

      const stoolsJson = storage.getString('dailySells');
      const stools = stoolsJson ? JSON.parse(stoolsJson) : [];

      if (stools.length > 0) {
        const sortedStools = stools.sort((a, b) => b.timestamp - a.timestamp);
        const lastStool = sortedStools[0];
        setBristol(lastStool.bristolScale);
        setHasBlood(lastStool.hasBlood);
      } else {
        setBristol(4);
        setHasBlood(false);
      }
    }
  }, [isModalVisible]);

  // Load data on focus
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

      loadRSSArticles();
      loadHistoryData();

      const today = new Date();
      const tDateStr = formatDate(today);
      const fullToday = calculateLichtigerScore(tDateStr, storage);
      if (fullToday == null) {
        setTodayProvisionalScore(computeStoolSubscoresForDate(tDateStr));
      } else {
        setTodayProvisionalScore(fullToday);
        const histJson = storage.getString('scoresHistory');
        const history = histJson ? JSON.parse(histJson) : [];
        const existingIndex = history.findIndex((h) => h.date === tDateStr);
        if (existingIndex >= 0) {
          history[existingIndex].score = fullToday;
          storage.set('scoresHistory', JSON.stringify(history));
        } else {
          const newHistory = [{ date: tDateStr, score: fullToday }, ...history];
          storage.set('scoresHistory', JSON.stringify(newHistory));
        }
      }
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Aujourd'hui */}
        <TodaySection
          dailyCount={dailyCount}
          todayProvisionalScore={todayProvisionalScore}
          scoreTooltipVisible={scoreTooltipVisible}
          setScoreTooltipVisible={setScoreTooltipVisible}
          tooltipOpacity={tooltipOpacity}
          tooltipScale={tooltipScale}
        />

        {/* Actualités AFA */}
        <RSSSection
          rssArticles={rssArticles}
          rssLoading={rssLoading}
          onArticlePress={openArticle}
        />

        {/* Section Historique */}
        <HistorySection
          stools={stools}
          symptoms={symptoms}
          notes={notes}
          historyFilter={historyFilter}
          setHistoryFilter={setHistoryFilter}
          getBristolColor={getBristolColor}
          handleEditStool={stoolManagement.handleEditStool}
          handleDeleteStool={stoolManagement.handleDeleteStool}
          handleEditSymptom={symptomManagement.handleEditSymptom}
          handleDeleteSymptom={symptomManagement.handleDeleteSymptom}
          handleEditNote={noteManagement.handleEditNote}
          handleDeleteNote={noteManagement.handleDeleteNote}
        />

        {/* Calendrier */}
        <CalendarSection
          calendarMode={calendarMode}
          onCalendarModeChange={setCalendarMode}
          stools={stools}
          scores={scores}
          onDayPress={(day) => {
            console.log('Day pressed:', day.dateString);
          }}
        />

        {/* Historique IBDisk */}
        <IBDiskSection
          ibdiskHistory={ibdiskHistory}
          currentIbdiskIndex={currentIbdiskIndex}
          onPrevious={() => setCurrentIbdiskIndex(prev => prev + 1)}
          onNext={() => setCurrentIbdiskIndex(prev => prev - 1)}
        />
      </ScrollView>

      {/* Modal d'enregistrement de selle */}
      <Portal>
        <Modal visible={isModalVisible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
          <AppCard style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <AppText variant="h2" style={styles.modalTitle}>
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
              </View>

              <View style={styles.bristolSection}>
                <AppText style={styles.fieldLabel}>Consistance (Bristol)</AppText>
                <BristolScaleSlider
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

              <View style={styles.modalActions}>
                <PrimaryButton
                  onPress={handleSave}
                  style={styles.saveButton}
                  variant="primary"
                  size="medium"
                >
                  Enregistrer
                </PrimaryButton>
                <PrimaryButton
                  onPress={hideModal}
                  style={styles.cancelButton}
                  variant="neutral"
                  size="medium"
                  outlined
                >
                  Annuler
                </PrimaryButton>
              </View>
            </ScrollView>
          </AppCard>
        </Modal>
      </Portal>

      {/* Modal d'édition de selle */}
      <Portal>
        <Modal
          visible={stoolManagement.editModalVisible}
          onDismiss={stoolManagement.hideEditModal}
          contentContainerStyle={styles.modalContainer}
        >
          <AppCard style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <AppText variant="h2" style={styles.modalTitle}>
                Modifier la selle
              </AppText>

              <View style={styles.dateTimeSection}>
                <AppText style={styles.fieldLabel}>Date et heure</AppText>
                <DateTimeInput
                  dateValue={stoolManagement.editDateInput}
                  timeValue={stoolManagement.editTimeInput}
                  onDateChange={stoolManagement.setEditDateInput}
                  onTimeChange={stoolManagement.setEditTimeInput}
                  dateLabel="Date (DD/MM/YYYY)"
                  timeLabel="Heure (HH:MM)"
                />
              </View>

              <View style={styles.bristolSection}>
                <AppText style={styles.fieldLabel}>Consistance (Bristol)</AppText>
                <BristolScaleSlider
                  value={stoolManagement.editBristol}
                  onValueChange={stoolManagement.setEditBristol}
                  style={styles.slider}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.outline}
                  thumbStyle={{ backgroundColor: theme.colors.primary }}
                />
                <AppText variant="labelMedium" style={styles.bristolHint}>
                  Sélection: {stoolManagement.editBristol} — {bristolDescriptions[stoolManagement.editBristol]}
                </AppText>
              </View>

              <View style={styles.modalActions}>
                <PrimaryButton
                  onPress={stoolManagement.handleSaveEdit}
                  style={styles.saveButton}
                  variant="primary"
                  size="medium"
                >
                  Enregistrer
                </PrimaryButton>
                <PrimaryButton
                  onPress={stoolManagement.hideEditModal}
                  style={styles.cancelButton}
                  variant="neutral"
                  size="medium"
                  outlined
                >
                  Annuler
                </PrimaryButton>
              </View>
            </ScrollView>
          </AppCard>
        </Modal>
      </Portal>

      {/* Modal Symptômes */}
      <SymptomModal
        visible={symptomManagement.symptomModalVisible}
        onDismiss={symptomManagement.handleCloseSymptomModal}
        onSave={symptomManagement.handleSaveSymptom}
        initialData={symptomManagement.editingSymptom}
      />

      {/* Modal Notes */}
      <NoteModal
        visible={noteManagement.noteModalVisible}
        onDismiss={noteManagement.handleCloseNoteModal}
        onSave={noteManagement.handleSaveNote}
        initialData={noteManagement.editingNote}
      />

      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  modalContainer: {
    margin: designSystem.spacing[4],
    maxHeight: '90%',
  },
  modalCard: {
    padding: designSystem.spacing[5],
    backgroundColor: designSystem.colors.background.tertiary,
    borderWidth: 1,
    borderColor: designSystem.colors.border.light,
    ...designSystem.shadows.xl,
  },
  modalTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[5],
    textAlign: 'center',
  },
  dateTimeSection: {
    marginBottom: designSystem.spacing[4],
  },
  fieldLabel: {
    fontSize: designSystem.typography.fontSize.sm,
    fontWeight: designSystem.typography.fontWeight.semiBold,
    color: designSystem.colors.text.secondary,
    marginBottom: designSystem.spacing[2],
  },
  bristolSection: {
    marginBottom: designSystem.spacing[4],
  },
  slider: {
    height: 40,
    marginVertical: designSystem.spacing[2],
  },
  bristolHint: {
    color: designSystem.colors.text.secondary,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'column',
    gap: designSystem.spacing[3],
    marginTop: designSystem.spacing[4],
  },
  saveButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
  },
});
