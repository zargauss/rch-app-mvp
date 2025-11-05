import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import designSystem from '../../theme/designSystem';

const { spacing } = designSystem;

/**
 * Composant skeleton pour les cartes de statistiques
 */
export default function SkeletonStats({ count = 4 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.statCard}>
          <SkeletonLoader width="60%" height={14} variant="text" style={styles.label} />
          <SkeletonLoader width="80%" height={24} variant="text" style={styles.value} />
          <SkeletonLoader width="50%" height={12} variant="text" style={styles.subtitle} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  label: {
    marginBottom: spacing[2],
  },
  value: {
    marginBottom: spacing[1],
  },
  subtitle: {
    marginTop: spacing[1],
  },
});

