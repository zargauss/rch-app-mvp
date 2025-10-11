import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from './AppText';

export default function SegmentedControl({ 
  options, 
  selectedValue, 
  onValueChange, 
  style 
}) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.segment,
            index === 0 && styles.firstSegment,
            index === options.length - 1 && styles.lastSegment,
            selectedValue === option.value && styles.selectedSegment,
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <AppText
            variant="labelMedium"
            style={[
              styles.segmentText,
              selectedValue === option.value && styles.selectedText,
            ]}
          >
            {option.label}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  firstSegment: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  lastSegment: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  selectedSegment: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentText: {
    color: '#718096',
    fontWeight: '500',
    fontSize: 14,
  },
  selectedText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});
