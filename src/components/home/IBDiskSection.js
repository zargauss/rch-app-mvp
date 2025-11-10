import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import IBDiskChart from '../charts/IBDiskChart';
import designSystem from '../../theme/designSystem';

/**
 * Section IBDisk - Affiche l'historique des questionnaires IBDisk
 */
const IBDiskSection = ({
  ibdiskHistory,
  currentIbdiskIndex,
  onPrevious,
  onNext,
}) => {
  if (ibdiskHistory.length === 0) return null;

  return (
    <AppCard style={styles.ibdiskCard}>
      <View style={styles.ibdiskHeader}>
        <AppText variant="headlineLarge" style={styles.cardTitle}>
          Historique IBDisk
        </AppText>

        {ibdiskHistory.length > 1 ? (
          <View style={styles.ibdiskNavigation}>
            <TouchableOpacity
              onPress={onPrevious}
              disabled={currentIbdiskIndex >= ibdiskHistory.length - 1}
              style={[
                styles.navButton,
                currentIbdiskIndex >= ibdiskHistory.length - 1 && styles.navButtonDisabled
              ]}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={currentIbdiskIndex >= ibdiskHistory.length - 1 ? '#A3A3A3' : '#101010'}
              />
            </TouchableOpacity>

            <AppText variant="labelMedium" style={styles.navText}>
              {currentIbdiskIndex + 1} / {ibdiskHistory.length}
            </AppText>

            <TouchableOpacity
              onPress={onNext}
              disabled={currentIbdiskIndex <= 0}
              style={[
                styles.navButton,
                currentIbdiskIndex <= 0 && styles.navButtonDisabled
              ]}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={currentIbdiskIndex <= 0 ? '#A3A3A3' : '#101010'}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <AppText variant="labelSmall" style={styles.singleQuestionnaireText}>
            Premier questionnaire IBDisk
          </AppText>
        )}
      </View>

      <IBDiskChart
        data={ibdiskHistory[currentIbdiskIndex]?.answers || {}}
        date={ibdiskHistory[currentIbdiskIndex]?.date || ''}
      />
    </AppCard>
  );
};

const styles = StyleSheet.create({
  ibdiskCard: {
    marginHorizontal: designSystem.spacing[4],
    marginBottom: designSystem.spacing[4],
  },
  ibdiskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing[4],
  },
  cardTitle: {
    color: designSystem.colors.text.primary,
    fontWeight: '700',
  },
  ibdiskNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
  },
  navButton: {
    padding: designSystem.spacing[2],
    borderRadius: designSystem.borderRadius.md,
    backgroundColor: designSystem.colors.background.secondary,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navText: {
    color: designSystem.colors.text.secondary,
    minWidth: 40,
    textAlign: 'center',
  },
  singleQuestionnaireText: {
    color: designSystem.colors.text.tertiary,
    fontStyle: 'italic',
  },
});

export default IBDiskSection;
