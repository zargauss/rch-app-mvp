import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { IconButton, Portal, Modal, Switch, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import storage from '../utils/storage';
import calculateLichtigerScore from '../utils/scoreCalculator';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../components/ui/AppText';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import SegmentedControl from '../components/ui/SegmentedControl';
import DateTimeInput, { isValidDate, isValidTime } from '../components/ui/DateTimeInput';
import { useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';

export default function HistoryScreen({ navigation }) {
  const [scores, setScores] = useState([]);
  const [stools, setStools] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [calendarMode, setCalendarMode] = useState('score');
  const theme = useTheme();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStool, setEditingStool] = useState(null);
  const [editBristol, setEditBristol] = useState(4);
  const [editHasBlood, setEditHasBlood] = useState(false);
  const [editDateInput, setEditDateInput] = useState('');
  const [editTimeInput, setEditTimeInput] = useState('');
  
  // États pour l'édition des traitements
  const [treatmentEditModalVisible, setTreatmentEditModalVisible] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [editTreatmentName, setEditTreatmentName] = useState('');
  const [editTreatmentDateInput, setEditTreatmentDateInput] = useState('');
  const [editTreatmentTimeInput, setEditTreatmentTimeInput] = useState('');
  
  // État pour la navigation du calendrier (offset en mois par rapport au mois actuel)
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = () => {
    const stoolsJson = storage.getString('dailySells');
    const entries = stoolsJson ? JSON.parse(stoolsJson) : [];
    setStools(entries.sort((a, b) => b.timestamp - a.timestamp)); // Plus récent en premier
    
    const histJson = storage.getString('scoresHistory');
    const history = histJson ? JSON.parse(histJson) : [];
    setScores(history);
    
    const treatmentsJson = storage.getString('treatments');
    const treatmentsList = treatmentsJson ? JSON.parse(treatmentsJson) : [];
    setTreatments(treatmentsList.sort((a, b) => b.timestamp - a.timestamp)); // Plus récent en premier
  };

  const bristolDescriptions = useMemo(() => ({
    1: 'Type 1 — Noix dures séparées',
    2: 'Type 2 — Saucisse grumeleuse',
    3: 'Type 3 — Saucisse fissurée',
    4: 'Type 4 — Saucisse lisse',
    5: 'Type 5 — Morceaux mous',
    6: 'Type 6 — Morceaux floconneux',
    7: 'Type 7 — Aqueux, sans morceaux'
  }), []);

  // Supprimé - remplacé par icône MaterialCommunityIcons inline

  const handleDeleteStool = (stoolId) => {
    const executeDelete = () => {
      const stoolsJson = storage.getString('dailySells');
      const allStools = stoolsJson ? JSON.parse(stoolsJson) : [];
      const updated = allStools.filter(s => s.id !== stoolId);
      storage.set('dailySells', JSON.stringify(updated));
      
      setStools(updated);
      
      const deletedStool = allStools.find(s => s.id === stoolId);
      if (deletedStool) {
        const date = new Date(deletedStool.timestamp);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        const newScore = calculateLichtigerScore(dateStr, storage);
        
        const histJson = storage.getString('scoresHistory');
        const history = histJson ? JSON.parse(histJson) : [];
        const existingIndex = history.findIndex((h) => h.date === dateStr);
        
        if (newScore !== null && existingIndex >= 0) {
          history[existingIndex].score = newScore;
          storage.set('scoresHistory', JSON.stringify(history));
        } else if (newScore === null && existingIndex >= 0) {
          history.splice(existingIndex, 1);
          storage.set('scoresHistory', JSON.stringify(history));
        }
        
        setScores([...history]);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Supprimer la selle',
        'Êtes-vous sûr de vouloir supprimer cette entrée ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: executeDelete }
        ]
      );
    }
  };

  const handleEditStool = (stool) => {
    setEditingStool(stool);
    setEditBristol(stool.bristolScale);
    setEditHasBlood(stool.hasBlood);
    
    const date = new Date(stool.timestamp);
    const dateStr = date.toLocaleDateString('fr-FR');
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    setEditDateInput(dateStr);
    setEditTimeInput(timeStr);
    setEditModalVisible(true);
  };

  const hideEditModal = () => {
    setEditModalVisible(false);
    setEditingStool(null);
  };

  // Fonctions pour gérer les traitements
  const handleEditTreatment = (treatment) => {
    setEditingTreatment(treatment);
    setEditTreatmentName(treatment.name);
    const date = new Date(treatment.timestamp);
    setEditTreatmentDateInput(date.toLocaleDateString('fr-FR'));
    setEditTreatmentTimeInput(date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setTreatmentEditModalVisible(true);
  };

  const hideTreatmentEditModal = () => {
    setTreatmentEditModalVisible(false);
    setEditingTreatment(null);
  };

  const handleSaveTreatment = () => {
    if (!editTreatmentName.trim()) {
      alert('Veuillez entrer le nom du traitement');
      return;
    }

    // Valider la date et l'heure
    if (!isValidDate(editTreatmentDateInput)) {
      alert('Date invalide');
      return;
    }

    if (!isValidTime(editTreatmentTimeInput)) {
      alert('Heure invalide');
      return;
    }

    const selectedDateTime = parseDateTime(editTreatmentDateInput, editTreatmentTimeInput);
    const timestamp = selectedDateTime.getTime();

    const treatmentsJson = storage.getString('treatments');
    const allTreatments = treatmentsJson ? JSON.parse(treatmentsJson) : [];
    
    const updatedTreatments = allTreatments.map(t =>
      t.id === editingTreatment.id
        ? { ...t, name: editTreatmentName.trim(), timestamp }
        : t
    );
    
    storage.set('treatments', JSON.stringify(updatedTreatments));
    setTreatments(updatedTreatments.sort((a, b) => b.timestamp - a.timestamp));
    
    hideTreatmentEditModal();
  };

  const handleDeleteTreatment = (treatmentId) => {
    const executeDelete = () => {
      const treatmentsJson = storage.getString('treatments');
      const allTreatments = treatmentsJson ? JSON.parse(treatmentsJson) : [];
      const updated = allTreatments.filter(t => t.id !== treatmentId);
      storage.set('treatments', JSON.stringify(updated));
      
      setTreatments(updated.sort((a, b) => b.timestamp - a.timestamp));
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce traitement ?')) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Supprimer le traitement',
        'Êtes-vous sûr de vouloir supprimer ce traitement ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', onPress: executeDelete, style: 'destructive' }
        ]
      );
    }
  };

  const parseDateTime = (dateStr, timeStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  };

  const handleSaveEdit = () => {
    if (!editingStool) return;

    const editDateTime = parseDateTime(editDateInput, editTimeInput);

    const updatedStool = {
      ...editingStool,
      timestamp: editDateTime.getTime(),
      bristolScale: Math.round(editBristol),
      hasBlood: editHasBlood
    };

    const stoolsJson = storage.getString('dailySells');
    const stools = stoolsJson ? JSON.parse(stoolsJson) : [];
    const updated = stools.map(s => s.id === editingStool.id ? updatedStool : s);
    storage.set('dailySells', JSON.stringify(updated));
    setStools(updated.sort((a, b) => b.timestamp - a.timestamp));
    hideEditModal();
  };

  // Formatage de la date compacte
  const formatCompactDate = (timestamp) => {
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

  // Couleur selon le score Bristol
  const getBristolColor = (bristol) => {
    if (bristol <= 2) return '#6366F1'; // Bleu (constipation)
    if (bristol <= 4) return '#10B981'; // Vert (normal)
    if (bristol <= 5) return '#F59E0B'; // Orange (tendance)
    return '#EF4444'; // Rouge (diarrhée)
  };

  // Rendu calendrier moderne
  const renderModernCalendar = () => {
    const now = new Date();
    // Appliquer l'offset de mois
    const targetDate = new Date(now.getFullYear(), now.getMonth() + calendarMonthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Convertir le jour de la semaine pour commencer par Lundi (0=Lundi, 6=Dimanche)
    // En JS : 0=Dimanche, 1=Lundi, 2=Mardi, etc.
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1; // Dimanche devient 6, Lundi devient 0
    
    const days = [];
    
    // Jours vides avant le premier jour du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    // Compléter avec des cellules vides pour avoir des semaines complètes (7 jours)
    const remainingCells = days.length % 7;
    if (remainingCells > 0) {
      for (let i = 0; i < (7 - remainingCells); i++) {
        days.push(null);
      }
    }

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D']; // Lundi à Dimanche

    const isCurrentMonth = calendarMonthOffset === 0;

    return (
      <View style={styles.calendarContainer}>
        {/* En-tête avec navigation */}
        <View style={styles.calendarMonthHeader}>
          <TouchableOpacity 
            onPress={() => setCalendarMonthOffset(calendarMonthOffset - 1)}
            style={styles.monthNavButton}
          >
            <AppText style={styles.monthNavIcon}>←</AppText>
          </TouchableOpacity>
          
          <View style={styles.monthTitleContainer}>
            <AppText variant="headlineLarge" style={styles.calendarMonth}>
              {monthNames[month]} {year}
            </AppText>
            {isCurrentMonth && (
              <View style={styles.currentMonthBadge}>
                <AppText variant="labelSmall" style={styles.currentMonthText}>
                  Aujourd'hui
                </AppText>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            onPress={() => setCalendarMonthOffset(calendarMonthOffset + 1)}
            style={styles.monthNavButton}
          >
            <AppText style={styles.monthNavIcon}>→</AppText>
          </TouchableOpacity>
        </View>

        {/* En-têtes des jours */}
        <View style={styles.calendarHeader}>
          {dayNames.map((name, index) => (
            <View key={index} style={styles.dayNameCell}>
              <AppText variant="labelSmall" style={styles.dayName}>
                {name}
              </AppText>
            </View>
          ))}
        </View>

        {/* Grille du calendrier */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            let cellContent = null;
            let cellStyle = [styles.dayCell];
            let hasData = false;

            if (calendarMode === 'score') {
              const score = calculateLichtigerScore(dateStr, storage);
              if (score !== null) {
                hasData = true;
                let scoreColor = '#10B981';
                if (score >= 7) scoreColor = '#EF4444';
                else if (score >= 4) scoreColor = '#F59E0B';
                
                cellStyle.push(styles.dayCellWithScore, { backgroundColor: scoreColor });
                cellContent = (
                  <View style={styles.dayCellContent}>
                    <AppText variant="headlineLarge" style={styles.scoreInCell}>
                      {score}
                    </AppText>
                  </View>
                );
              }
            } else {
              // Créer la date en heure locale (pas UTC)
              const [y, m, d] = dateStr.split('-').map(Number);
              const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
              const dayEnd = dayStart + 24 * 60 * 60 * 1000;
              const dayEntries = stools.filter(s => s.timestamp >= dayStart && s.timestamp < dayEnd);
              
              if (dayEntries.length > 0) {
                hasData = true;
                cellStyle.push(styles.dayCellWithStools);
                cellContent = (
                  <View style={styles.dayCellContent}>
                    <AppText variant="displayMedium" style={styles.stoolCountLarge}>
                      {dayEntries.length}
                    </AppText>
                  </View>
                );
              }
            }

            if (!hasData) {
              cellStyle.push(styles.dayCellEmpty);
              cellContent = (
                <AppText variant="bodyMedium" style={styles.dayNumberEmpty}>
                  {day}
                </AppText>
              );
            }

            return (
              <View key={index} style={cellStyle}>
                {cellContent}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Liste des selles compacte */}
      <AppCard style={styles.stoolsCard}>
        
        {stools.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText variant="bodyMedium" style={styles.emptyText}>
              Aucune selle enregistrée
            </AppText>
          </View>
        ) : (
          <FlatList
            data={stools.slice(0, 10)} // Limiter à 10 dernières
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.stoolItem}>
                <View style={styles.stoolMain}>
                  <View style={[styles.bristolBadge, { backgroundColor: getBristolColor(item.bristolScale) }]}>
                    <AppText variant="bodyLarge" style={styles.bristolNumber}>
                      {item.bristolScale}
                    </AppText>
                  </View>
                  <View style={styles.stoolInfo}>
                    <View style={styles.stoolDateContainer}>
                      <AppText variant="bodyMedium" style={styles.stoolDate}>
                        {formatCompactDate(item.timestamp)}
                      </AppText>
                      {item.hasBlood && (
                        <MaterialCommunityIcons 
                          name="water" 
                          size={16} 
                          color="#EF4444" 
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>
                  </View>
                  <View style={styles.stoolActions}>
                    <TouchableOpacity 
                      onPress={() => handleEditStool(item)}
                      style={styles.actionButton}
                    >
                      <MaterialCommunityIcons name="pencil" size={20} color="#4A90E2" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteStool(item.id)}
                      style={styles.actionButton}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </AppCard>

      {/* Calendrier moderne */}
      <AppCard style={styles.calendarCard}>
        <View style={styles.calendarHeaderSection}>
          <SegmentedControl
            options={[
              { value: 'score', label: 'Score' },
              { value: 'bristol', label: 'Selles' }
            ]}
            selectedValue={calendarMode}
            onValueChange={setCalendarMode}
          />
        </View>
        
        {renderModernCalendar()}

        {/* Légende */}
        <View style={styles.legend}>
          {calendarMode === 'score' ? (
            <>
              <View style={styles.legendItem}>
                <View style={[styles.legendSquare, { backgroundColor: '#10B981' }]} />
                <AppText variant="labelSmall" style={styles.legendText}>Excellent (0-3)</AppText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendSquare, { backgroundColor: '#F59E0B' }]} />
                <AppText variant="labelSmall" style={styles.legendText}>Acceptable (4-6)</AppText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendSquare, { backgroundColor: '#EF4444' }]} />
                <AppText variant="labelSmall" style={styles.legendText}>Préoccupant (7+)</AppText>
              </View>
            </>
          ) : (
            <View style={styles.legendFullWidth}>
              <AppText variant="labelSmall" style={styles.legendTextCentered}>
                💡 Le chiffre indique le nombre de selles enregistrées ce jour-là
              </AppText>
            </View>
          )}
        </View>
      </AppCard>

      {/* Historique des traitements */}
      <AppCard style={styles.treatmentsCard}>
        <AppText variant="headlineLarge" style={styles.cardTitle}>
          Historique des traitements
        </AppText>
        
        {treatments.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText variant="bodyMedium" style={styles.emptyText}>
              Aucun traitement enregistré
            </AppText>
          </View>
        ) : (
          <FlatList
            data={treatments.slice(0, 20)} // Limiter à 20 derniers
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.treatmentItem}>
                <View style={styles.treatmentIcon}>
                  <MaterialCommunityIcons name="pill" size={24} color="#9B59B6" />
                </View>
                <View style={styles.treatmentInfo}>
                  <AppText variant="bodyLarge" style={styles.treatmentName}>
                    {item.name}
                  </AppText>
                  <AppText variant="bodyMedium" style={styles.treatmentDate}>
                    {formatCompactDate(item.timestamp)}
                  </AppText>
                </View>
                <View style={styles.treatmentActions}>
                  <TouchableOpacity 
                    onPress={() => handleEditTreatment(item)}
                    style={styles.actionButton}
                  >
                    <MaterialCommunityIcons name="pencil" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeleteTreatment(item.id)}
                    style={styles.actionButton}
                  >
                    <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </AppCard>

      {/* Modal d'édition */}
      <Portal>
        <Modal visible={editModalVisible} onDismiss={hideEditModal} contentContainerStyle={styles.modalContainer}>
          <AppCard style={styles.modalCard}>
            <AppText variant="headlineLarge" style={styles.modalTitle}>
              Modifier la selle
            </AppText>

            <View style={styles.modalContent}>
              <AppText variant="bodyMedium" style={styles.inputLabel}>
                Date et heure
              </AppText>
              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeInput}>
                  <AppText variant="labelSmall" style={styles.inputHelper}>Date (JJ/MM/AAAA)</AppText>
                  <AppText variant="bodyLarge">{editDateInput}</AppText>
                </View>
                <View style={styles.dateTimeInput}>
                  <AppText variant="labelSmall" style={styles.inputHelper}>Heure (HH:MM)</AppText>
                  <AppText variant="bodyLarge">{editTimeInput}</AppText>
                </View>
              </View>

              <AppText variant="bodyMedium" style={styles.inputLabel}>
                Consistance (Bristol)
              </AppText>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={7}
                  step={1}
                  value={editBristol}
                  onValueChange={setEditBristol}
                  minimumTrackTintColor="#4A90E2"
                  maximumTrackTintColor="#E2E8F0"
                />
                <AppText variant="headlineLarge" style={styles.bristolValue}>
                  {Math.round(editBristol)}
                </AppText>
              </View>
              <AppText variant="labelSmall" style={styles.bristolDesc}>
                {bristolDescriptions[Math.round(editBristol)]}
              </AppText>

              <View style={styles.switchRow}>
                <AppText variant="bodyMedium">Présence de sang</AppText>
                <Switch value={editHasBlood} onValueChange={setEditHasBlood} />
              </View>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton onPress={hideEditModal} style={styles.modalButton}>
                Annuler
              </SecondaryButton>
              <PrimaryButton onPress={handleSaveEdit} style={styles.modalButton}>
                Enregistrer
              </PrimaryButton>
    </View>
          </AppCard>
        </Modal>
      </Portal>

      {/* Modal d'édition des traitements */}
      <Portal>
        <Modal visible={treatmentEditModalVisible} onDismiss={hideTreatmentEditModal} contentContainerStyle={styles.modalContainer}>
          <AppCard style={styles.modalCard}>
            <AppText variant="headlineLarge" style={styles.modalTitle}>
              Modifier le traitement
            </AppText>

            <ScrollView>
              <View style={styles.modalContent}>
                <AppText variant="bodyMedium" style={styles.inputLabel}>
                  📅 Date et heure de la prise
                </AppText>
                
                <DateTimeInput
                  dateValue={editTreatmentDateInput}
                  timeValue={editTreatmentTimeInput}
                  onDateChange={setEditTreatmentDateInput}
                  onTimeChange={setEditTreatmentTimeInput}
                  dateLabel="Date (JJ/MM/AAAA)"
                  timeLabel="Heure (HH:MM)"
                />

                <AppText variant="bodyMedium" style={[styles.inputLabel, { marginTop: 20 }]}>
                  Nom du traitement
                </AppText>
                
                <TextInput
                  label="Ex: Pentasa, Humira..."
                  value={editTreatmentName}
                  onChangeText={setEditTreatmentName}
                  style={styles.textInputField}
                  mode="outlined"
                  outlineStyle={{ borderRadius: 12 }}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.modalActions}>
                <SecondaryButton onPress={hideTreatmentEditModal} style={styles.modalButton}>
                  Annuler
                </SecondaryButton>
                <PrimaryButton onPress={handleSaveTreatment} style={styles.modalButton}>
                  Enregistrer
                </PrimaryButton>
              </View>
            </ScrollView>
          </AppCard>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    color: '#2D3748',
    marginBottom: 6,
    fontWeight: '700',
  },
  subtitle: {
    color: '#718096',
  },
  stoolsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
  },
  sectionTitle: {
    color: '#2D3748',
    marginBottom: 16,
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
  },
  stoolItem: {
    marginBottom: 12,
  },
  stoolMain: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bristolBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bristolNumber: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stoolInfo: {
    flex: 1,
  },
  stoolDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stoolDate: {
    color: '#475569',
    fontWeight: '500',
  },
  stoolActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: {
    fontSize: 18,
  },
  calendarCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
  },
  calendarHeaderSection: {
    marginBottom: 20,
  },
  calendarContainer: {
    marginBottom: 16,
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthNavButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthNavIcon: {
    fontSize: 24,
    color: '#4A90E2',
    fontWeight: '700',
  },
  monthTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  calendarMonth: {
    color: '#2D3748',
    fontWeight: '700',
    textAlign: 'center',
  },
  currentMonthBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  currentMonthText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayName: {
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '13.5%',
    aspectRatio: 1,
    margin: '0.4%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellEmpty: {
    opacity: 0.7,
  },
  dayCellWithScore: {
    borderRadius: 6,
  },
  dayCellWithStools: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  dayCellContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  dayNumberInScore: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    fontSize: 9,
    position: 'absolute',
    top: 2,
    left: 4,
  },
  scoreInCell: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 22,
  },
  dayNumberSmall: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 9,
    position: 'absolute',
    top: 2,
    left: 4,
  },
  stoolCountLarge: {
    color: '#4A90E2',
    fontWeight: '700',
    fontSize: 26,
  },
  dayNumberEmpty: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSquare: {
    width: 20,
    height: 20,
    borderRadius: 6,
  },
  legendText: {
    color: '#64748B',
    fontWeight: '500',
  },
  legendFullWidth: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  legendTextCentered: {
    color: '#92400E',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalContainer: {
    padding: 20,
  },
  modalCard: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  modalTitle: {
    color: '#2D3748',
    marginBottom: 20,
    fontWeight: '700',
  },
  modalContent: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#475569',
    marginBottom: 8,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateTimeInput: {
    flex: 1,
    backgroundColor: '#F8FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputHelper: {
    color: '#94A3B8',
    marginBottom: 4,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  slider: {
    flex: 1,
  },
  bristolValue: {
    color: '#4A90E2',
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  bristolDesc: {
    color: '#64748B',
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    padding: 12,
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  treatmentsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  treatmentIcon: {
    marginRight: 12,
  },
  treatmentInfo: {
    flex: 1,
  },
  treatmentName: {
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 4,
  },
  treatmentDate: {
    color: '#64748B',
    fontSize: 13,
  },
  treatmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  treatmentNameInput: {
    backgroundColor: '#F8FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  textInputField: {
    backgroundColor: '#F8FAFB',
    marginBottom: 16,
  },
});
