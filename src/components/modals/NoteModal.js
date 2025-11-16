import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Portal, Modal, TextInput, Switch, HelperText, Menu, Chip, ActivityIndicator } from 'react-native-paper';
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

  // États pour les tags IA
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [aiProcessed, setAiProcessed] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(null);

  // Initialiser avec les données existantes (mode édition)
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setContent(initialData.content || '');
        setCategory(initialData.category || null);
        setSharedWithDoctor(initialData.sharedWithDoctor || false);
        setTags(initialData.tags || []);
        setAiProcessed(initialData.aiProcessed || false);
        setAiConfidence(initialData.aiConfidence || null);
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
        setTags([]);
        setAiProcessed(false);
        setAiConfidence(null);
      }
      setErrors({ content: '', date: '' });
      setNewTagInput('');
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
      tags,
    });
  };

  const handleAddTag = () => {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 8) {
      setTags([...tags, trimmedTag]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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

            {/* Tags IA */}
            {initialData && (
              <View style={styles.section}>
                <View style={styles.tagsHeader}>
                  <AppText style={styles.fieldLabel}>Tags IA</AppText>
                  {!aiProcessed && (
                    <View style={styles.processingBadge}>
                      <ActivityIndicator size={12} color={designSystem.colors.primary[500]} />
                      <AppText variant="labelSmall" style={styles.processingText}>
                        Analyse en cours...
                      </AppText>
                    </View>
                  )}
                  {aiProcessed && aiConfidence && (
                    <AppText variant="labelSmall" style={styles.confidenceText}>
                      Confiance: {aiConfidence}
                    </AppText>
                  )}
                </View>

                {/* Liste des tags */}
                <View style={styles.tagsContainer}>
                  {tags.length === 0 && aiProcessed && (
                    <AppText variant="bodySmall" style={styles.noTagsText}>
                      Aucun tag détecté
                    </AppText>
                  )}
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      onClose={() => handleRemoveTag(tag)}
                      style={styles.chip}
                      textStyle={styles.chipText}
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>

                {/* Ajouter un tag manuellement */}
                {tags.length < 8 && (
                  <View style={styles.addTagRow}>
                    <TextInput
                      mode="outlined"
                      placeholder="Ajouter un tag..."
                      value={newTagInput}
                      onChangeText={setNewTagInput}
                      onSubmitEditing={handleAddTag}
                      style={styles.tagInput}
                      outlineStyle={{ borderRadius: 8 }}
                      dense
                    />
                    <TouchableOpacity
                      style={styles.addTagButton}
                      onPress={handleAddTag}
                      disabled={!newTagInput.trim()}
                    >
                      <MaterialCommunityIcons
                        name="plus-circle"
                        size={28}
                        color={newTagInput.trim() ? designSystem.colors.primary[500] : designSystem.colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {tags.length >= 8 && (
                  <HelperText type="info">
                    Limite de 8 tags atteinte
                  </HelperText>
                )}
              </View>
            )}

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
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing[2],
  },
  processingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[1],
    backgroundColor: designSystem.colors.primary[50],
    paddingHorizontal: designSystem.spacing[2],
    paddingVertical: designSystem.spacing[1],
    borderRadius: designSystem.borderRadius.full,
  },
  processingText: {
    color: designSystem.colors.primary[600],
    fontWeight: '500',
  },
  confidenceText: {
    color: designSystem.colors.text.secondary,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing[2],
    marginBottom: designSystem.spacing[2],
  },
  chip: {
    backgroundColor: designSystem.colors.primary[100],
    borderWidth: 1,
    borderColor: designSystem.colors.primary[300],
  },
  chipText: {
    color: designSystem.colors.primary[700],
    fontSize: designSystem.typography.fontSize.sm,
  },
  noTagsText: {
    color: designSystem.colors.text.tertiary,
    fontStyle: 'italic',
  },
  addTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
  },
  tagInput: {
    flex: 1,
    backgroundColor: designSystem.colors.background.secondary,
  },
  addTagButton: {
    padding: designSystem.spacing[1],
  },
});

export default NoteModal;
