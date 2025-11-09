import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Portal, Modal, TextInput, RadioButton } from 'react-native-paper';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import PrimaryButton from '../ui/PrimaryButton';
import designSystem from '../../theme/designSystem';
import {
  saveMedication,
  createSchema
} from '../../utils/treatmentUtils';
import { buttonPressFeedback } from '../../utils/haptics';

/**
 * Modal pour créer un nouveau schéma thérapeutique
 */

const CreateSchemaModal = ({ visible, onDismiss, onSuccess }) => {
  const [medicationName, setMedicationName] = useState('');
  const [frequencyType, setFrequencyType] = useState('daily');
  const [dosesPerDay, setDosesPerDay] = useState('1');
  const [intervalDays, setIntervalDays] = useState('7');

  React.useEffect(() => {
    if (visible) {
      setMedicationName('');
      setFrequencyType('daily');
      setDosesPerDay('1');
      setIntervalDays('7');
    }
  }, [visible]);

  const handleSave = () => {
    // Validation
    if (!medicationName.trim()) {
      alert('Veuillez entrer le nom du médicament');
      return;
    }

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

    // Créer le médicament
    const medicationId = saveMedication(null, medicationName.trim());

    // Créer le schéma
    const frequency = frequencyType === 'daily'
      ? { type: 'daily', dosesPerDay: parseInt(dosesPerDay) }
      : { type: 'interval', intervalDays: parseInt(intervalDays) };

    createSchema(medicationId, frequency);

    buttonPressFeedback();
    onSuccess?.();
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <AppCard style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <AppText variant="h2" style={styles.modalTitle}>
              Nouveau traitement
            </AppText>

            {/* Nom du médicament */}
            <View style={styles.section}>
              <AppText style={styles.fieldLabel}>Nom du médicament</AppText>
              <TextInput
                value={medicationName}
                onChangeText={setMedicationName}
                placeholder="Ex: Pentasa, Humira..."
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: designSystem.borderRadius.md }}
              />
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
                  placeholder="Ex: 7, 14, 28..."
                />
                <AppText variant="labelSmall" style={styles.hint}>
                  Nombre de jours entre chaque prise
                </AppText>
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
                Créer le traitement
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
  hint: {
    color: designSystem.colors.text.tertiary,
    marginTop: designSystem.spacing[2],
    fontStyle: 'italic',
    fontSize: 11,
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

export default CreateSchemaModal;
