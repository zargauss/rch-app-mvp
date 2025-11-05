import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import designSystem from '../../theme/designSystem';

const { spacing } = designSystem;

/**
 * Composant skeleton pour les éléments de liste
 */
export default function SkeletonList({ count = 5, variant = 'default' }) {
  if (variant === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.cardItem}>
            <SkeletonLoader width={40} height={40} variant="circle" />
            <View style={styles.cardContent}>
              <SkeletonLoader width="70%" height={16} variant="text" style={styles.title} />
              <SkeletonLoader width="50%" height={14} variant="text" style={styles.subtitle} />
            </View>
            <SkeletonLoader width={24} height={24} variant="circle" />
          </View>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonLoader width={32} height={32} variant="circle" />
          <View style={styles.listContent}>
            <SkeletonLoader width="80%" height={16} variant="text" style={styles.title} />
            <SkeletonLoader width="60%" height={14} variant="text" style={styles.subtitle} />
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  listContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  title: {
    marginBottom: spacing[1],
  },
  subtitle: {
    marginTop: spacing[1],
  },
});

