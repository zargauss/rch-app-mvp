import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Text, Button, Portal, Modal, Card, Switch, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
import designSystem from '../theme/designSystem';
import { fetchRSSFeed } from '../services/rssService';

export default function HomeScreen({ route }) {
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
  
  // États pour IBDisk
  const [ibdiskAvailable, setIbdiskAvailable] = useState(true);
  const [ibdiskDaysRemaining, setIbdiskDaysRemaining] = useState(0);
  
  // États pour les actualités RSS
  const [rssArticles, setRssArticles] = useState([]);
  const [rssLoading, setRssLoading] = useState(true);

  const bristolDescriptions = useMemo(() => ({
    1: 'Type 1 — Noix dures séparées (constipation sévère)',
    2: 'Type 2 — Saucisse grumeleuse (constipation)',
    3: 'Type 3 — Saucisse fissurée (normal)',
    4: 'Type 4 — Saucisse lisse et molle (normal)',
    5: 'Type 5 — Morceaux mous (tendance diarrhéique)',
    6: 'Type 6 — Morceaux floconneux (diarrhée)',
    7: 'Type 7 — Aqueux, sans morceaux (diarrhée sévère)'
  }), []);

  // Fonction pour charger les articles RSS
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

  // Fonction pour ouvrir un article dans le navigateur
  const openArticle = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        setToastMessage('Impossible d\'ouvrir le lien');
        setToastType('error');
        setToastVisible(true);
      }
    } catch (error) {
      setToastMessage('Erreur lors de l\'ouverture du lien');
      setToastType('error');
      setToastVisible(true);
    }
  };

  // Fonction pour vérifier la disponibilité d'IBDisk
  const checkIBDiskAvailability = () => {
    const lastUsedStr = storage.getString('ibdiskLastUsed');
    if (!lastUsedStr) {
      setIbdiskAvailable(true);
      setIbdiskDaysRemaining(0);
      return;
    }

    const lastUsed = parseInt(lastUsedStr);
    const now = new Date().getTime();
    const daysSinceLastUsed = Math.floor((now - lastUsed) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastUsed >= 30) {
      setIbdiskAvailable(true);
      setIbdiskDaysRemaining(0);
    } else {
      setIbdiskAvailable(false);
      setIbdiskDaysRemaining(30 - daysSinceLastUsed);
    }
  };

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
    // Créer la date en heure locale (pas UTC) pour éviter les décalages de fuseau horaire
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
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

  // Ouvrir automatiquement le modal de bilan si demandé par une notification
  useEffect(() => {
    if (route?.params?.openSurveyModal && !surveyCompleted) {
      console.log('🔔 Ouverture automatique du modal de bilan suite à une notification');
      setVisible(true);
      // Réinitialiser le paramètre pour éviter une réouverture lors du prochain focus
      navigation.setParams({ openSurveyModal: false });
    }
  }, [route?.params?.openSurveyModal, surveyCompleted]);

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
      
      // Vérifier la disponibilité d'IBDisk
      checkIBDiskAvailability();
      
      // Charger les articles RSS
      loadRSSArticles();

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
                <MaterialCommunityIcons name="account-circle" size={32} color="#4A90E2" />
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
              
              <PrimaryButton
                mode="contained"
                onPress={() => navigation.navigate('IBDiskQuestionnaire')}
                style={styles.mainSecondaryAction}
                icon="chart-box-outline"
                buttonColor="#F39C12"
                disabled={!ibdiskAvailable}
              >
                {ibdiskAvailable ? 'Votre quotidien' : `Disponible dans ${ibdiskDaysRemaining} jour${ibdiskDaysRemaining > 1 ? 's' : ''}`}
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


        {/* Actualités de l'association MICI */}
        <AppCard style={styles.newsCard}>
          <View style={styles.newsHeader}>
            <MaterialCommunityIcons name="newspaper" size={24} color={designSystem.colors.primary[500]} />
            <AppText variant="h4" style={styles.newsTitle}>
              Actualités AFA
            </AppText>
          </View>
          <AppText variant="bodyMedium" style={styles.newsDescription}>
            Découvrez les dernières actualités de l'Association François Aupetit (AFA)
          </AppText>
          
          {rssLoading ? (
            <View style={styles.newsLoading}>
              <AppText variant="bodyMedium" style={styles.newsLoadingText}>
                Chargement des actualités...
              </AppText>
            </View>
          ) : rssArticles.length > 0 ? (
            <View style={styles.newsItems}>
              {rssArticles.map((article, index) => (
                <View key={index} style={styles.newsItem}>
                  <View style={styles.newsItemHeader}>
                    <AppText variant="label" style={styles.newsDate}>
                      {article.formattedDate}
                    </AppText>
                    <View style={styles.newsBadge}>
                      <AppText variant="caption" style={styles.newsBadgeText}>
                        {index === 0 ? 'Nouveau' : 'Actualité'}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="bodyMedium" style={styles.newsItemTitle}>
                    {article.title}
                  </AppText>
                  <AppText variant="bodySmall" style={styles.newsItemExcerpt}>
                    {article.description}
                  </AppText>
                  <TouchableOpacity 
                    onPress={() => openArticle(article.link)}
                    style={styles.articleButton}
                  >
                    <AppText variant="bodySmall" color="primary" style={styles.articleButtonText}>
                      Voir l'article complet →
                    </AppText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.newsError}>
              <AppText variant="bodyMedium" style={styles.newsErrorText}>
                Impossible de charger les actualités
              </AppText>
            </View>
          )}
          
          <PrimaryButton 
            onPress={() => openArticle('https://www.afa.asso.fr/')}
            variant="primary"
            outlined
            style={styles.newsButton}
            icon="open-in-new"
          >
            Voir toutes les actualités
          </PrimaryButton>
        </AppCard>
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
                <PrimaryButton
                  onPress={saveTreatment}
                  style={styles.saveButton}
                  variant="primary"
                  size="medium"
                >
                  Enregistrer
                </PrimaryButton>
                <PrimaryButton
                  onPress={hideTreatmentModal}
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
    backgroundColor: designSystem.colors.background.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: designSystem.spacing[4],
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: designSystem.spacing[4],
    paddingBottom: designSystem.spacing[8],
    paddingHorizontal: designSystem.spacing[4],
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
    backgroundColor: designSystem.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: designSystem.spacing[4],
    borderWidth: 2,
    borderColor: designSystem.colors.background.tertiary,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[1],
  },
  subGreeting: {
    color: designSystem.colors.text.secondary,
  },
  statsContainer: {
    marginBottom: designSystem.spacing[6],
  },
  mainActionsContainer: {
    marginBottom: designSystem.spacing[8],
  },
  mainActionCard: {
    padding: designSystem.spacing[7],
    backgroundColor: designSystem.colors.background.tertiary,
    borderWidth: 2,
    borderColor: designSystem.colors.primary[500],
    ...designSystem.shadows.lg,
  },
  mainActionTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[6],
    textAlign: 'center',
  },
  mainActionButtons: {
    gap: designSystem.spacing[4],
  },
  mainPrimaryAction: {
    marginBottom: designSystem.spacing[2],
    borderRadius: designSystem.borderRadius.base,
    paddingVertical: designSystem.spacing[2],
  },
  mainSecondaryAction: {
    marginBottom: designSystem.spacing[2],
    borderRadius: designSystem.borderRadius.base,
    paddingVertical: designSystem.spacing[2],
  },
  actionsContainer: {
    marginBottom: designSystem.spacing[6],
  },
  actionCard: {
    padding: designSystem.spacing[6],
    backgroundColor: designSystem.colors.background.tertiary,
    ...designSystem.shadows.base,
  },
  actionTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[5],
  },
  actionButtons: {
    gap: designSystem.spacing[4],
  },
  primaryAction: {
    marginBottom: designSystem.spacing[2],
    borderRadius: designSystem.borderRadius.base,
    paddingVertical: designSystem.spacing[1],
  },
  secondaryAction: {
    marginBottom: designSystem.spacing[2],
    borderRadius: designSystem.borderRadius.base,
    paddingVertical: designSystem.spacing[1],
  },
  newsCard: {
    backgroundColor: designSystem.colors.background.tertiary,
    borderWidth: 1,
    borderColor: designSystem.colors.border.light,
    ...designSystem.shadows.base,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing[3],
  },
  newsTitle: {
    marginLeft: designSystem.spacing[3],
    color: designSystem.colors.text.primary,
  },
  newsDescription: {
    color: designSystem.colors.text.secondary,
    marginBottom: designSystem.spacing[5],
  },
  newsItems: {
    marginBottom: designSystem.spacing[5],
  },
  newsItem: {
    paddingVertical: designSystem.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: designSystem.colors.border.light,
  },
  newsItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing[2],
  },
  newsDate: {
    color: designSystem.colors.text.tertiary,
  },
  newsBadge: {
    backgroundColor: designSystem.colors.primary[100],
    paddingHorizontal: designSystem.spacing[2],
    paddingVertical: designSystem.spacing[1],
    borderRadius: designSystem.borderRadius.sm,
  },
  newsBadgeText: {
    color: designSystem.colors.primary[700],
    fontWeight: designSystem.typography.fontWeight.medium,
  },
  newsItemTitle: {
    color: designSystem.colors.text.primary,
    fontWeight: designSystem.typography.fontWeight.semiBold,
    marginBottom: designSystem.spacing[1],
  },
  newsItemExcerpt: {
    color: designSystem.colors.text.secondary,
    lineHeight: designSystem.typography.fontSize.sm * 1.4,
  },
  newsButton: {
    width: '100%',
    borderRadius: designSystem.borderRadius.md,
  },
  newsLoading: {
    paddingVertical: designSystem.spacing[6],
    alignItems: 'center',
  },
  newsLoadingText: {
    color: designSystem.colors.text.secondary,
    fontStyle: 'italic',
  },
  newsError: {
    paddingVertical: designSystem.spacing[6],
    alignItems: 'center',
  },
  newsErrorText: {
    color: designSystem.colors.health.danger.main,
  },
  articleButton: {
    marginTop: designSystem.spacing[3],
    alignSelf: 'flex-start',
    paddingVertical: designSystem.spacing[2],
    paddingHorizontal: designSystem.spacing[3],
  },
  articleButtonText: {
    textDecorationLine: 'underline',
    fontWeight: designSystem.typography.fontWeight.medium,
  },
  modalContainer: {
    margin: designSystem.spacing[5],
    maxHeight: '85%',
  },
  modalCard: {
    backgroundColor: designSystem.colors.background.tertiary,
    borderWidth: 1,
    borderColor: designSystem.colors.border.light,
    ...designSystem.shadows.xl,
    overflow: 'hidden',
  },
  modalScroll: {
    padding: designSystem.spacing[7],
  },
  modalTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[7],
    textAlign: 'center',
  },
  dateTimeSection: {
    marginBottom: designSystem.spacing[6],
  },
  fieldLabel: {
    fontSize: designSystem.typography.fontSize.base,
    fontWeight: designSystem.typography.fontWeight.semiBold,
    color: designSystem.colors.text.secondary,
    marginBottom: designSystem.spacing[4],
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: designSystem.spacing[4],
  },
  dateTimeInput: {
    flex: 1,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.borderRadius.md,
  },
  dateTimeHint: {
    color: designSystem.colors.text.tertiary,
    marginTop: designSystem.spacing[3],
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bristolSection: {
    marginBottom: designSystem.spacing[7],
  },
  slider: {
    height: 48,
    marginVertical: designSystem.spacing[4],
  },
  bristolHint: {
    color: designSystem.colors.text.secondary,
    textAlign: 'center',
    marginTop: designSystem.spacing[3],
  },
  bloodSection: {
    marginBottom: designSystem.spacing[7],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: designSystem.spacing[3],
    paddingHorizontal: designSystem.spacing[4],
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.borderRadius.md,
  },
  modalActions: {
    flexDirection: 'column',
    gap: designSystem.spacing[3],
    marginTop: designSystem.spacing[6],
    marginBottom: designSystem.spacing[4],
  },
  cancelButton: {
    width: '100%',
  },
  saveButton: {
    width: '100%',
  },
  treatmentInput: {
    marginTop: designSystem.spacing[2],
  },
  suggestionsContainer: {
    marginTop: designSystem.spacing[3],
    gap: designSystem.spacing[2],
  },
  suggestionButton: {
    borderRadius: designSystem.borderRadius.base,
    borderColor: designSystem.colors.secondary[500],
  },
  suggestionButtonLabel: {
    color: designSystem.colors.secondary[500],
    fontSize: designSystem.typography.fontSize.sm,
  },
});
