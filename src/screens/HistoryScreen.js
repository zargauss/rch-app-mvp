import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, List, SegmentedButtons, Divider, IconButton, Portal, Modal, Button, Switch, TextInput } from 'react-native-paper';
import CalendarMonth from '../components/CalendarMonth';
import storage from '../utils/storage';
import calculateLichtigerScore from '../utils/scoreCalculator';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../components/ui/AppText';
import { useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function HistoryScreen({ navigation }) {
  const [scores, setScores] = useState([]);
  const [stools, setStools] = useState([]);
  const [calendarMode, setCalendarMode] = useState('score');
  const theme = useTheme();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStool, setEditingStool] = useState(null);
  const [editBristol, setEditBristol] = useState(4);
  const [editHasBlood, setEditHasBlood] = useState(false);
  const [editDateInput, setEditDateInput] = useState('');
  const [editTimeInput, setEditTimeInput] = useState('');

  useEffect(() => {
    const histJson = storage.getString('scoresHistory');
    const history = histJson ? JSON.parse(histJson) : [];
    setScores(history);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const stoolsJson = storage.getString('dailySells');
      const entries = stoolsJson ? JSON.parse(stoolsJson) : [];
      setStools(entries);
      const histJson = storage.getString('scoresHistory');
      const history = histJson ? JSON.parse(histJson) : [];
      setScores(history);
    }, [])
  );

  const bristolDescriptions = useMemo(() => ({
    1: 'Type 1 — Noix dures séparées (constipation sévère)',
    2: 'Type 2 — Saucisse grumeleuse (constipation)',
    3: 'Type 3 — Saucisse fissurée (normal)',
    4: 'Type 4 — Saucisse lisse et molle (normal)',
    5: 'Type 5 — Morceaux mous (tendance diarrhéique)',
    6: 'Type 6 — Morceaux floconneux (diarrhée)',
    7: 'Type 7 — Aqueux, sans morceaux (diarrhée sévère)'
  }), []);

  const handleDeleteStool = (stoolId) => {
    Alert.alert(
      'Supprimer la selle',
      'Êtes-vous sûr de vouloir supprimer cette entrée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            const stoolsJson = storage.getString('dailySells');
            const allStools = stoolsJson ? JSON.parse(stoolsJson) : [];
            const updated = allStools.filter(s => s.id !== stoolId);
            storage.set('dailySells', JSON.stringify(updated));
            
            // Mettre à jour l'état local immédiatement
            setStools(updated);
            
            // Recalculer les scores pour les jours affectés
            const deletedStool = allStools.find(s => s.id === stoolId);
            if (deletedStool) {
              const date = new Date(deletedStool.timestamp);
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              
              // Recalculer le score pour ce jour
              const calculateLichtigerScore = require('../utils/scoreCalculator').default;
              const newScore = calculateLichtigerScore(dateStr, storage);
              
              // Mettre à jour l'historique des scores
              const histJson = storage.getString('scoresHistory');
              const history = histJson ? JSON.parse(histJson) : [];
              const existingIndex = history.findIndex((h) => h.date === dateStr);
              
              if (newScore !== null && existingIndex >= 0) {
                history[existingIndex].score = newScore;
                storage.set('scoresHistory', JSON.stringify(history));
              } else if (newScore === null && existingIndex >= 0) {
                // Si plus de score, supprimer l'entrée
                history.splice(existingIndex, 1);
                storage.set('scoresHistory', JSON.stringify(history));
              }
              
              // Recharger les scores
              setScores([...history]);
            }
          }
        }
      ]
    );
  };

  const bloodIcon = useMemo(() => '🩸', []);

  const handleEditStool = (stool) => {
    setEditingStool(stool);
    const date = new Date(stool.timestamp);
    setEditDateInput(date.toLocaleDateString('fr-FR'));
    setEditTimeInput(date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setEditBristol(stool.bristolScale);
    setEditHasBlood(stool.hasBlood);
    setEditModalVisible(true);
  };

  const hideEditModal = () => {
    setEditModalVisible(false);
    setEditingStool(null);
    setEditDateInput('');
    setEditTimeInput('');
    setEditBristol(4);
    setEditHasBlood(false);
  };

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
    setStools(updated);
    hideEditModal();
  };

  return (
    <View style={styles.container}>
      <AppText variant="title" style={styles.title}>Historique des selles</AppText>
      <FlatList
        data={stools}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider style={{ marginVertical: theme.spacing(0.5) }} />}
        renderItem={({ item }) => {
          const date = new Date(item.timestamp);
          const d = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
          const title = `Bristol ${item.bristolScale}${item.hasBlood ? ' ' + bloodIcon : ''}`;
          return (
            <List.Item
              title={<AppText variant="body">{title}</AppText>}
              description={<AppText variant="caption">{d}</AppText>}
              right={() => (
                <View style={styles.actionButtons}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => handleEditStool(item)}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#B00020"
                    onPress={() => handleDeleteStool(item.id)}
                  />
                </View>
              )}
            />
          );
        }}
      />

      <AppText variant="title" style={styles.subtitle}>Calendrier (mois)</AppText>
      <SegmentedButtons
        value={calendarMode}
        onValueChange={setCalendarMode}
        buttons={[
          { value: 'score', label: 'Score/jour' },
          { value: 'bristol', label: 'Selles par Bristol' }
        ]}
        style={styles.toggle}
      />
      <CalendarMonth
        renderDay={({ year, month, day }) => {
          const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          if (calendarMode === 'score') {
            const score = calculateLichtigerScore(dateStr, storage);
            return (
              <View>
                <Text style={score == null ? styles.muted : undefined}>{day}</Text>
                {score != null ? <Text>{`Score: ${score}`}</Text> : null}
              </View>
            );
          }
          const dayStart = new Date(dateStr + 'T00:00:00').getTime();
          const dayEnd = dayStart + 24*60*60*1000;
          const dayEntries = stools.filter(s => s.timestamp >= dayStart && s.timestamp < dayEnd);
          const count = dayEntries.length;
          return (
            <View>
              <Text style={count === 0 ? styles.muted : undefined}>{day}</Text>
              {count > 0 ? <Text>{count}</Text> : null}
            </View>
          );
        }}
      />

      <Portal>
        <Modal visible={editModalVisible} onDismiss={hideEditModal} contentContainerStyle={styles.modalContainer}>
          <AppCard>
            <AppText variant="title">Modifier la selle</AppText>
            
            <View style={styles.dateTimeSection}>
              <AppText style={styles.fieldLabel}>Date et heure</AppText>
              <View style={styles.dateTimeRow}>
                <TextInput
                  mode="outlined"
                  label="Date (DD/MM/YYYY)"
                  value={editDateInput}
                  onChangeText={(text) => setEditDateInput(formatDateInput(text))}
                  style={styles.dateTimeInput}
                  placeholder="11/01/2025"
                  keyboardType="numeric"
                  maxLength={10}
                  error={editDateInput.length > 0 && !validateDate(editDateInput)}
                />
                <TextInput
                  mode="outlined"
                  label="Heure (HH:MM)"
                  value={editTimeInput}
                  onChangeText={(text) => setEditTimeInput(formatTimeInput(text))}
                  style={styles.dateTimeInput}
                  placeholder="14:30"
                  keyboardType="numeric"
                  maxLength={5}
                  error={editTimeInput.length > 0 && !validateTime(editTimeInput)}
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
                value={editBristol}
                onValueChange={setEditBristol}
              />
              <AppText style={styles.bristolHint}>Sélection: {editBristol} — {bristolDescriptions[editBristol]}</AppText>
              <View style={styles.row}>
                <AppText>Présence de sang</AppText>
                <Switch value={editHasBlood} onValueChange={setEditHasBlood} style={styles.switch} />
              </View>
            </View>
            <View style={styles.modalActions}>
              <Button onPress={hideEditModal} mode="text">Annuler</Button>
              <PrimaryButton onPress={handleSaveEdit}>Modifier</PrimaryButton>
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
  title: {
    marginBottom: 16
  },
  subtitle: {
    marginTop: 24,
    marginBottom: 12
  },
  toggle: {
    marginBottom: 12
  },
  muted: {
    color: '#94A3B8'
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalContainer: {
    margin: 16
  },
  dateTimeSection: {
    marginBottom: 16
  },
  fieldLabel: {
    marginBottom: 8
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
  },
  bristolHint: {
    marginTop: 6,
    color: '#475569'
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  switch: {
    marginLeft: 12
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16
  }
});
