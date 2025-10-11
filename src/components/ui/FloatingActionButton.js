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
    bottom: 32,
    right: 24,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 2,
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
