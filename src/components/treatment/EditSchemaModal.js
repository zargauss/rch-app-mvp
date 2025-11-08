import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Portal, Modal, TextInput, RadioButton } from 'react-native-paper';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import PrimaryButton from '../ui/PrimaryButton';
import designSystem from '../../theme/designSystem';
import {
  renameMedication,
  updateSchemaFrequency
} from '../../utils/treatmentUtils';
import { buttonPressFeedback } from '../../utils/haptics';

/**
 * Modal pour modifier un schéma thérapeutique actif
 * Permet de modifier le nom (mise à jour partout) ou la fréquence (nouveau schéma)
 */

const EditSchemaModal = ({ visible, schema, medication, onDismiss, onSuccess }) => {
  const [medicationName, setMedicationName] = useState('');
  const [frequencyType, setFrequencyType] = useState('daily');
  const [dosesPerDay, setDosesPerDay] = useState('1');
  const [intervalDays, setIntervalDays] = useState('7');

  React.useEffect(() => {
    if (visible && schema && medication) {
      setMedicationName(medication.name);
      setFrequencyType(schema.frequency.type);

      if (schema.frequency.type === 'daily') {
        setDosesPerDay(schema.frequency.dosesPerDay.toString());
      } else {
        setIntervalDays(schema.frequency.intervalDays.toString());
      }
    }
  }, [visible, schema, medication]);

  const hasNameChanged = () => {
    return medicationName.trim() !== medication?.name;
  };

  const hasFrequencyChanged = () => {
    if (frequencyType !== schema?.frequency.type) return true;

    if (frequencyType === 'daily') {
      return parseInt(dosesPerDay) !== schema.frequency.dosesPerDay;
    } else {
      return parseInt(intervalDays) !== schema.frequency.intervalDays;
    }
  };

  const handleSave = () => {
    if (!medicationName.trim()) {
      alert('Veuillez entrer le nom du médicament');
      return;
    }

    // Vérifier si la fréquence a changé
    const freqChanged = hasFrequencyChanged();
    const nameChanged = hasNameChanged();

    if (!freqChanged && !nameChanged) {
      onDismiss();
      return;
    }

    // Si changement de nom, demander confirmation (car rétroactif)
    if (nameChanged) {
      const confirmMessage = Platform.OS === 'web'
        ? window.confirm('Renommer le médicament mettra à jour son nom partout dans l\'application. Continuer ?')
        : true; // Sur mobile, utiliser Alert.alert

      if (Platform.OS !== 'web') {
        Alert.alert(
          'Confirmation',
          'Renommer le médicament mettra à jour son nom partout dans l\'application. Continuer ?',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Continuer',
              onPress: () => {
                renameMedication(medication.id, medicationName.trim());
                handleFrequencyUpdate();
              }
            }
          ]
        );
        return;
      } else if (!confirmMessage) {
        return;
      } else {
        renameMedication(medication.id, medicationName.trim());
      }
    }

    handleFrequencyUpdate();
  };

  const handleFrequencyUpdate = () => {
    const freqChanged = hasFrequencyChanged();

    if (freqChanged) {
      // Validation
      if (frequencyType === 'daily') {
        const doses = parseInt(dosesPerDay);
        if (isNaN(doses) || doses < 1 || doses > 10) {
          alert('Le nombre de prises par jour doit être entre 1 et 10');
          return;
        }
      } else {
        const interval = parseInt(intervalDays);
        if (isNaN(interval) || interval < 1 || interval > 365) {
          alert('L\'intervalle doit être entre 1 et 365 jours');
          return;
        }
      }

      // Créer la nouvelle fréquence
      const newFrequency = frequencyType === 'daily'
        ? { type: 'daily', dosesPerDay: parseInt(dosesPerDay) }
        : { type: 'interval', intervalDays: parseInt(intervalDays) };

      // Modifier le schéma (clôt l'ancien, crée un nouveau)
      updateSchemaFrequency(schema.id, newFrequency);
    }

    buttonPressFeedback();
    onSuccess?.();
    onDismiss();
  };

  if (!schema || !medication) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <AppCard style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <AppText variant="h2" style={styles.modalTitle}>
              Modifier le traitement
            </AppText>

            {/* Nom du médicament */}
            <View style={styles.section}>
              <AppText style={styles.fieldLabel}>Nom du médicament</AppText>
              <TextInput
                value={medicationName}
                onChangeText={setMedicationName}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: designSystem.borderRadius.md }}
              />
              {hasNameChanged() && (
                <AppText variant="labelSmall" style={styles.warningText}>
                  ⚠️ Le nom sera mis à jour dans tout l'historique
                </AppText>
              )}
            </View>

            {/* Type de fréquence */}
            <View style={styles.section}>
              <AppText style={styles.fieldLabel}>Fréquence</AppText>

              <TouchableOpacity
                onPress={() => setFrequencyType('daily')}
                style={[styles.radioOption, frequencyType === 'daily' && styles.radioOptionSelected]}
              >
                <RadioButton
                  value="daily"
                  status={frequencyType === 'daily' ? 'checked' : 'unchecked'}
                  onPress={() => setFrequencyType('daily')}
                  color={designSystem.colors.primary[500]}
                />
                <View style={styles.radioContent}>
                  <AppText variant="bodyLarge" style={styles.radioLabel}>Tous les jours</AppText>
                  <AppText variant="bodySmall" style={styles.radioHint}>
                    Plusieurs prises par jour
                  </AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFrequencyType('interval')}
                style={[styles.radioOption, frequencyType === 'interval' && styles.radioOptionSelected]}
              >
                <RadioButton
                  value="interval"
                  status={frequencyType === 'interval' ? 'checked' : 'unchecked'}
                  onPress={() => setFrequencyType('interval')}
                  color={designSystem.colors.primary[500]}
                />
                <View style={styles.radioContent}>
                  <AppText variant="bodyLarge" style={styles.radioLabel}>Tous les X jours</AppText>
                  <AppText variant="bodySmall" style={styles.radioHint}>
                    Une seule prise à intervalle régulier
                  </AppText>
                </View>
              </TouchableOpacity>

              {hasFrequencyChanged() && (
                <AppText variant="labelSmall" style={styles.warningText}>
                  ⚠️ Un nouveau schéma sera créé, l'ancien sera clôturé
                </AppText>
              )}
            </View>

            {/* Nombre de prises (si daily) */}
            {frequencyType === 'daily' && (
              <View style={styles.section}>
                <AppText style={styles.fieldLabel}>Nombre de prises par jour</AppText>
                <TextInput
                  value={dosesPerDay}
                  onChangeText={setDosesPerDay}
                  keyboardType="number-pad"
                  mode="outlined"
                  style={styles.input}
                  outlineStyle={{ borderRadius: designSystem.borderRadius.md }}
                />
              </View>
            )}

            {/* Intervalle (si interval) */}
            {frequencyType === 'interval' && (
              <View style={styles.section}>
                <AppText style={styles.fieldLabel}>Intervalle en jours</AppText>
                <TextInput
                  value={intervalDays}
                  onChangeText={setIntervalDays}
                  keyboardType="number-pad"
                  mode="outlined"
                  style={styles.input}
                  outlineStyle={{ borderRadius: designSystem.borderRadius.md }}
                />
              </View>
            )}

            {/* Actions */}
            <View style={styles.modalActions}>
              <PrimaryButton
                onPress={handleSave}
                variant="primary"
                size="medium"
                style={styles.saveButton}
              >
                Enregistrer
              </PrimaryButton>
              <PrimaryButton
                onPress={onDismiss}
                variant="neutral"
                size="medium"
                outlined
                style={styles.cancelButton}
              >
                Annuler
              </PrimaryButton>
            </View>
          </ScrollView>
        </AppCard>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: designSystem.spacing[4],
    maxHeight: '90%',
  },
  modalCard: {
    backgroundColor: designSystem.colors.background.tertiary,
    borderWidth: 1,
    borderColor: designSystem.colors.border.light,
    ...designSystem.shadows.xl,
    overflow: 'hidden',
    padding: designSystem.spacing[5],
  },
  modalTitle: {
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[5],
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
  },
  section: {
    marginBottom: designSystem.spacing[5],
  },
  fieldLabel: {
    fontSize: designSystem.typography.fontSize.sm,
    fontWeight: designSystem.typography.fontWeight.semiBold,
    color: designSystem.colors.text.secondary,
    marginBottom: designSystem.spacing[3],
  },
  input: {
    backgroundColor: designSystem.colors.background.secondary,
  },
  warningText: {
    color: '#F59E0B',
    marginTop: designSystem.spacing[2],
    fontStyle: 'italic',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: designSystem.spacing[3],
    borderRadius: designSystem.borderRadius.md,
    borderWidth: 2,
    borderColor: designSystem.colors.border.light,
    marginBottom: designSystem.spacing[3],
    backgroundColor: '#FFFFFF',
  },
  radioOptionSelected: {
    borderColor: designSystem.colors.primary[500],
    backgroundColor: designSystem.colors.primary[50],
  },
  radioContent: {
    flex: 1,
    marginLeft: designSystem.spacing[2],
  },
  radioLabel: {
    color: designSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: designSystem.spacing[1],
  },
  radioHint: {
    color: designSystem.colors.text.secondary,
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

export default EditSchemaModal;
