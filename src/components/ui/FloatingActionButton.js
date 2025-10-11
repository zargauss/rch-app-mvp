import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from './AppText';

export default function FloatingActionButton({ 
  onPress, 
  icon = '+', 
  label, 
  style 
}) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.fabContent}>
        <AppText style={[styles.fabIcon, { color: theme.colors.onPrimary }]}>
          {icon}
        </AppText>
        {label && (
          <AppText 
            variant="labelMedium" 
            style={[styles.fabLabel, { color: theme.colors.onPrimary }]}
          >
            {label}
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 2,
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
