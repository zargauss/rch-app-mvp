import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import designSystem from '../../theme/designSystem';

const { spacing } = designSystem;

/**
 * Composant skeleton pour les cartes d'actualités
 */
export default function SkeletonCard({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.header}>
            <SkeletonLoader width={80} height={16} variant="text" />
            <SkeletonLoader width={60} height={20} variant="text" style={styles.badge} />
          </View>
          <SkeletonLoader width="100%" height={18} variant="text" style={styles.title} />
          <SkeletonLoader width="100%" height={18} variant="text" style={styles.title} />
          <SkeletonLoader width="80%" height={16} variant="text" style={styles.title} />
          <SkeletonLoader width="100%" height={14} variant="text" style={styles.excerpt} />
          <SkeletonLoader width="70%" height={14} variant="text" style={styles.excerpt} />
          <SkeletonLoader width={100} height={36} variant="text" style={styles.button} />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  badge: {
    borderRadius: 12,
  },
  title: {
    marginBottom: spacing[1],
  },
  excerpt: {
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },
  button: {
    marginTop: spacing[3],
    borderRadius: 8,
  },
});

