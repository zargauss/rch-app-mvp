import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

/**
 * Composant réutilisable pour la saisie de date et heure
 * Formate automatiquement avec / et :
 */
const DateTimeInput = ({ 
  dateValue, 
  timeValue, 
  onDateChange, 
  onTimeChange,
  dateLabel = "Date (JJ/MM/AAAA)",
  timeLabel = "Heure (HH:MM)",
  containerStyle 
}) => {
  
  /**
   * Formate l'entrée de date avec des /
   * Ex: 13102025 → 13/10/2025
   */
  const formatDateInput = (text) => {
    // Supprimer tout sauf les chiffres
    const numbers = text.replace(/\D/g, '');
    
    // Limiter à 8 chiffres (DDMMYYYY)
    const limited = numbers.slice(0, 8);
    
    // Formater avec les /
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
    }
  };

  /**
   * Formate l'entrée d'heure avec :
   * Ex: 0830 → 08:30
   */
  const formatTimeInput = (text) => {
    // Supprimer tout sauf les chiffres
    const numbers = text.replace(/\D/g, '');
    
    // Limiter à 4 chiffres (HHMM)
    const limited = numbers.slice(0, 4);
    
    // Formater avec le :
    if (limited.length <= 2) {
      return limited;
    } else {
      return `${limited.slice(0, 2)}:${limited.slice(2)}`;
    }
  };

  const handleDateChange = (text) => {
    const formatted = formatDateInput(text);
    onDateChange(formatted);
  };

  const handleTimeChange = (text) => {
    const formatted = formatTimeInput(text);
    onTimeChange(formatted);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        label={dateLabel}
        value={dateValue}
        onChangeText={handleDateChange}
        style={[styles.input, styles.dateInput]}
        mode="outlined"
        outlineStyle={styles.outline}
        keyboardType="numeric"
        placeholder="JJ/MM/AAAA"
      />
      <TextInput
        label={timeLabel}
        value={timeValue}
        onChangeText={handleTimeChange}
        style={[styles.input, styles.timeInput]}
        mode="outlined"
        outlineStyle={styles.outline}
        keyboardType="numeric"
        placeholder="HH:MM"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  dateInput: {
    marginRight: 8,
  },
  timeInput: {
    marginLeft: 8,
  },
  outline: {
    borderRadius: 16,
  },
});

export default DateTimeInput;

