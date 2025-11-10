import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import HealthIcon from '../ui/HealthIcon';
import EmptyState from '../ui/EmptyState';
import SegmentedControl from '../ui/SegmentedControl';
import AnimatedListItem from '../ui/AnimatedListItem';
import designSystem from '../../theme/designSystem';
import { formatCompactDate, formatCompactDateOnly } from '../../utils/dateFormatters';
import { getSymptomDisplayName, INTENSITY_LABELS } from '../../utils/symptomsUtils';
import { getCategoryLabel } from '../../utils/notesUtils';

/**
 * Section Historique - Affiche l'historique filtré des selles, symptômes et notes
 */
const HistorySection = ({
  stools,
  symptoms,
  notes,
  historyFilter,
  setHistoryFilter,
  getBristolColor,
  handleEditStool,
  handleDeleteStool,
  handleEditSymptom,
  handleDeleteSymptom,
  handleEditNote,
  handleDeleteNote,
}) => {
  const filteredEntries = useMemo(() => {
    let entries = [];

    if (historyFilter === 'all' || historyFilter === 'stools') {
      entries = [...entries, ...stools.map(s => ({ ...s, entryType: 'stool' }))];
    }
    if (historyFilter === 'all' || historyFilter === 'symptoms') {
      entries = [...entries, ...symptoms.map(s => ({ ...s, entryType: 'symptom' }))];
    }
    if (historyFilter === 'all' || historyFilter === 'notes') {
      entries = [...entries, ...notes.map(n => ({ ...n, entryType: 'note' }))];
    }

    // Trier par timestamp
    entries.sort((a, b) => b.timestamp - a.timestamp);

    // Limiter à 20 entrées
    return entries.slice(0, 20);
  }, [stools, symptoms, notes, historyFilter]);

  const emptyMessage = useMemo(() => {
    if (historyFilter === 'stools') return 'Aucune selle enregistrée';
    if (historyFilter === 'symptoms') return 'Aucun symptôme enregistré';
    if (historyFilter === 'notes') return 'Aucune note enregistrée';
    return 'Aucune donnée enregistrée';
  }, [historyFilter]);

  return (
    <AppCard style={styles.historySection}>
      <View style={styles.sectionHeader}>
        <HealthIcon name="journal" size={28} color={designSystem.colors.primary[500]} />
        <AppText variant="h3" style={styles.sectionTitle}>
          Historique
        </AppText>
      </View>

      {/* Onglets de filtrage */}
      <View style={styles.historyTabsContainer}>
        <SegmentedControl
          options={[
            { value: 'all', label: 'Tout' },
            { value: 'stools', label: 'Selles' },
            { value: 'symptoms', label: 'Symptômes' },
            { value: 'notes', label: 'Notes' }
          ]}
          selectedValue={historyFilter}
          onValueChange={setHistoryFilter}
        />
      </View>

      {/* Liste filtrée */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          healthIcon="empty"
          title={emptyMessage}
          description="Utilisez le bouton + en bas pour ajouter une entrée"
          size="compact"
        />
      ) : (
        <View>
          {filteredEntries.map((item, index) => (
            <AnimatedListItem key={`${item.entryType}-${item.id}`} index={index} delay={30}>
              {item.entryType === 'stool' && (
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
                            color="#DC2626"
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
                        <MaterialCommunityIcons name="pencil" size={20} color="#4C4DDC" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteStool(item.id)}
                        style={styles.actionButton}
                      >
                        <MaterialCommunityIcons name="delete" size={20} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {item.entryType === 'symptom' && (
                <View style={styles.symptomItem}>
                  <View style={styles.symptomMain}>
                    <View style={[styles.symptomIcon, { backgroundColor: '#FEE2E2' }]}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#DC2626" />
                    </View>
                    <View style={styles.symptomInfo}>
                      <AppText variant="bodyMedium" style={styles.symptomType}>
                        {getSymptomDisplayName(item)}
                      </AppText>
                      <View style={styles.symptomMeta}>
                        <AppText variant="labelSmall" style={styles.symptomDate}>
                          {formatCompactDateOnly(item.timestamp)}
                        </AppText>
                        <View style={styles.symptomIntensity}>
                          <AppText variant="labelSmall" style={styles.symptomIntensityText}>
                            Intensité: {item.intensity}/5 ({INTENSITY_LABELS[item.intensity]})
                          </AppText>
                        </View>
                      </View>
                      {item.note && (
                        <AppText variant="labelSmall" style={styles.symptomNote}>
                          {item.note}
                        </AppText>
                      )}
                    </View>
                    <View style={styles.stoolActions}>
                      <TouchableOpacity
                        onPress={() => handleEditSymptom(item)}
                        style={styles.actionButton}
                      >
                        <MaterialCommunityIcons name="pencil" size={20} color="#4C4DDC" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteSymptom(item.id)}
                        style={styles.actionButton}
                      >
                        <MaterialCommunityIcons name="delete" size={20} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {item.entryType === 'note' && (
                <View style={styles.noteItem}>
                  <View style={styles.noteMain}>
                    <View style={[styles.noteIcon, { backgroundColor: '#FEF3C7' }]}>
                      <MaterialCommunityIcons
                        name={item.sharedWithDoctor ? "share-variant" : "note-text-outline"}
                        size={24}
                        color="#F59E0B"
                      />
                    </View>
                    <View style={styles.noteInfo}>
                      <View style={styles.noteHeader}>
                        <AppText variant="bodyMedium" style={styles.noteContent}>
                          {item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content}
                        </AppText>
                      </View>
                      <View style={styles.noteMeta}>
                        <AppText variant="labelSmall" style={styles.noteDate}>
                          {formatCompactDateOnly(item.timestamp)}
                        </AppText>
                        {item.category && (
                          <View style={styles.noteCategory}>
                            <AppText variant="labelSmall" style={styles.noteCategoryText}>
                              {getCategoryLabel(item.category)}
                            </AppText>
                          </View>
                        )}
                        {item.sharedWithDoctor && (
                          <View style={styles.noteShared}>
                            <MaterialCommunityIcons name="share-variant" size={12} color="#4C4DDC" />
                            <AppText variant="labelSmall" style={styles.noteSharedText}>
                              Partagé
                            </AppText>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.stoolActions}>
                      <TouchableOpacity
                        onPress={() => handleEditNote(item)}
                        style={styles.actionButton}
                      >
                        <MaterialCommunityIcons name="pencil" size={20} color="#4C4DDC" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteNote(item.id)}
                        style={styles.actionButton}
                      >
                        <MaterialCommunityIcons name="delete" size={20} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </AnimatedListItem>
          ))}
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  historySection: {
    marginHorizontal: designSystem.spacing[4],
    marginBottom: designSystem.spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
    marginBottom: designSystem.spacing[4],
  },
  sectionTitle: {
    color: designSystem.colors.text.primary,
  },
  historyTabsContainer: {
    marginBottom: designSystem.spacing[4],
  },
  // Stools
  stoolItem: {
    marginBottom: designSystem.spacing[3],
  },
  stoolMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: designSystem.spacing[3],
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.borderRadius.md,
    gap: designSystem.spacing[3],
  },
  bristolBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: designSystem.colors.text.primary,
  },
  stoolActions: {
    flexDirection: 'row',
    gap: designSystem.spacing[2],
  },
  actionButton: {
    padding: designSystem.spacing[2],
  },
  // Symptoms
  symptomItem: {
    marginBottom: designSystem.spacing[3],
  },
  symptomMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: designSystem.spacing[3],
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.borderRadius.md,
    gap: designSystem.spacing[3],
  },
  symptomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomInfo: {
    flex: 1,
  },
  symptomType: {
    color: designSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  symptomMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing[2],
  },
  symptomDate: {
    color: designSystem.colors.text.tertiary,
  },
  symptomIntensity: {},
  symptomIntensityText: {
    color: designSystem.colors.text.secondary,
  },
  symptomNote: {
    color: designSystem.colors.text.tertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Notes
  noteItem: {
    marginBottom: designSystem.spacing[3],
  },
  noteMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: designSystem.spacing[3],
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.borderRadius.md,
    gap: designSystem.spacing[3],
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteInfo: {
    flex: 1,
  },
  noteHeader: {},
  noteContent: {
    color: designSystem.colors.text.primary,
    marginBottom: 4,
  },
  noteMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing[2],
    alignItems: 'center',
  },
  noteDate: {
    color: designSystem.colors.text.tertiary,
  },
  noteCategory: {
    paddingHorizontal: designSystem.spacing[2],
    paddingVertical: 2,
    backgroundColor: designSystem.colors.primary[100],
    borderRadius: designSystem.borderRadius.sm,
  },
  noteCategoryText: {
    color: designSystem.colors.primary[700],
    fontSize: 10,
    fontWeight: '600',
  },
  noteShared: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteSharedText: {
    color: designSystem.colors.primary[600],
    fontSize: 10,
    fontWeight: '600',
  },
});

export default HistorySection;
