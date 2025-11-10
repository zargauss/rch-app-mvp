import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Portal, Modal, TextInput, Switch, HelperText, Menu } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import PrimaryButton from '../ui/PrimaryButton';
import DateTimeInput, { isValidDate } from '../ui/DateTimeInput';
import designSystem from '../../theme/designSystem';
import { NOTE_CATEGORIES, validateNoteContent, getCategoryLabel } from '../../utils/notesUtils';

/**
 * Modale pour ajouter/éditer une note libre
 */
const NoteModal = ({ visible, onDismiss, onSave, initialData = null }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(null);
  const [sharedWithDoctor, setSharedWithDoctor] = useState(false);
  const [dateInput, setDateInput] = useState('');
  const [errors, setErrors] = useState({ content: '', date: '' });
  const [menuVisible, setMenuVisible] = useState(false);

  // Initialiser avec les données existantes (mode édition)
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setContent(initialData.content || '');
        setCategory(initialData.category || null);
        setSharedWithDoctor(initialData.sharedWithDoctor || false);
        // Convertir date YYYY-MM-DD en DD/MM/YYYY
        if (initialData.date) {
          const [y, m, d] = initialData.date.split('-');
          setDateInput(`${d}/${m}/${y}`);
        }
      } else {
        // Mode création : valeurs par défaut
        const today = new Date();
        setDateInput(today.toLocaleDateString('fr-FR'));
        setContent('');
        setCategory(null);
        setSharedWithDoctor(false);
      }
      setErrors({ content: '', date: '' });
    }
  }, [visible, initialData]);

  const handleSave = () => {
    const newErrors = { content: '', date: '' };
    let hasError = false;

    // Validation du contenu
    const validation = validateNoteContent(content, 500);
    if (!validation.valid) {
      newErrors.content = validation.error;
      hasError = true;
    }

    // Validation de la date
    if (!isValidDate(dateInput)) {
      newErrors.date = 'Date invalide (format: JJ/MM/AAAA)';
      hasError = true;
    } else {
      const [day, month, year] = dateInput.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (date > today) {
        newErrors.date = 'La date ne peut pas être dans le futur';
        hasError = true;
      }
    }

    setErrors(newErrors);

    if (hasError) return;

    // Convertir la date en objet Date
    const [day, month, year] = dateInput.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    onSave({
      content: content.trim(),
      category,
      sharedWithDoctor,
      date,
    });
  };

  const getCategoryDisplayText = () => {
    if (!category) return 'Aucune';
    return getCategoryLabel(category);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <AppCard style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="note-text-outline" size={32} color="#F59E0B" />
              <AppText variant="h2" style={styles.modalTitle}>
                {initialData ? 'Modifier la note' : 'Nouvelle note'}
              </AppText>
            </View>

            {/* Contenu */}
            <View style={styles.section}>
              <AppText style={styles.fieldLabel}>Contenu *</AppText>
              <TextInput
                mode="outlined"
                placeholder="Écrivez votre note..."
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                error={!!errors.content}
                style={styles.textArea}
                outlineStyle={{ borderRadius: 12 }}
                maxLength={500}
              />
              <View style={styles.helperRow}>
                <HelperText type="error" visible={!!errors.content} style={{ flex: 1 }}>
                  {errors.content}
                </HelperText>
                <AppText variant="labelSmall" style={styles.charCount}>
                  {content.length}/500
                </AppText>
              </View>
            </View>

            {/* Catégorie */}
            <View style={styles.section}>
              <AppText style={styles.fieldLabel}>Catégorie (optionnel)</AppText>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setMenuVisible(true)}
                  >
                    <AppText variant="bodyMedium" style={styles.dropdownText}>
                      {getCategoryDisplayText()}
                    </AppText>
                    <MaterialCommunityIcons
                      name={menuVisible ? "chevron-up" : "chevron-down"}
                      size={24}
                      color={designSystem.colors.text.secondary}
                    />
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setCategory(null);
                    setMenuVisible(false);
                  }}
                  title="Aucune"
                />
                {NOTE_CATEGORIES.map((cat) => (
                  <Menu.Item
                    key={cat.value}
                    onPress={() => {
                      setCategory(cat.value);
                      setMenuVisible(false);
                    }}
                    title={cat.label}
                  />
                ))}
              </Menu>
            </View>

            {/* Date */}
            <View style={styles.section}>
              <AppText style={styles.fieldLabel}>Date</AppText>
              <DateTimeInput
                dateValue={dateInput}
                onDateChange={setDateInput}
                dateLabel="Date (JJ/MM/AAAA)"
              />
              <HelperText type="error" visible={!!errors.date}>
                {errors.date}
              </HelperText>
            </View>

            {/* Partager avec le médecin */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View style={styles.switchLeft}>
                  <MaterialCommunityIcons
                    name={sharedWithDoctor ? "share-variant" : "lock-outline"}
                    size={20}
                    color={sharedWithDoctor ? designSystem.colors.primary[500] : designSystem.colors.text.secondary}
                  />
                  <View style={styles.switchTextContainer}>
                    <AppText variant="bodyLarge" style={styles.switchLabel}>
                      Partager avec le médecin
                    </AppText>
                    <AppText variant="labelSmall" style={styles.switchHint}>
                      {sharedWithDoctor ? 'Visible dans l\'export PDF' : 'Note privée'}
                    </AppText>
                  </View>
                </View>
                <Switch
                  value={sharedWithDoctor}
                  onValueChange={setSharedWithDoctor}
                  color={designSystem.colors.primary[500]}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <PrimaryButton
                onPress={handleSave}
                style={styles.saveButton}
                variant="primary"
                size="medium"
              >
                {initialData ? 'Enregistrer' : 'Ajouter'}
              </PrimaryButton>
              <PrimaryButton
                onPress={onDismiss}
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
  },
  modalScroll: {
    padding: designSystem.spacing[5],
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: designSystem.spacing[5],
  },
  modalTitle: {
    color: designSystem.colors.text.primary,
    marginTop: designSystem.spacing[2],
    textAlign: 'center',
  },
  section: {
    marginBottom: designSystem.spacing[4],
  },
  fieldLabel: {
    fontSize: designSystem.typography.fontSize.sm,
    fontWeight: designSystem.typography.fontWeight.semiBold,
    color: designSystem.colors.text.secondary,
    marginBottom: designSystem.spacing[2],
  },
  textArea: {
    backgroundColor: designSystem.colors.background.secondary,
    minHeight: 120,
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    color: designSystem.colors.text.tertiary,
    marginTop: designSystem.spacing[1],
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
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: designSystem.spacing[3],
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    color: designSystem.colors.text.primary,
    fontWeight: '500',
  },
  switchHint: {
    color: designSystem.colors.text.secondary,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'column',
    gap: designSystem.spacing[3],
    marginTop: designSystem.spacing[4],
  },
  cancelButton: {
    width: '100%',
  },
  saveButton: {
    width: '100%',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.borderRadius.md,
    padding: designSystem.spacing[4],
    borderWidth: 1,
    borderColor: designSystem.colors.border.light,
  },
  dropdownText: {
    color: designSystem.colors.text.primary,
    flex: 1,
  },
});

export default NoteModal;
