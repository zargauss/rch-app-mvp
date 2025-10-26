import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import designSystem from '../../theme/designSystem';

/**
 * Composant simple pour la saisie d'heure uniquement
 * Formate automatiquement avec :
 * Valide en temps réel
 */
const TimeInput = ({ 
  value,
  onChange,
  label = "Heure (HH:MM)",
  containerStyle 
}) => {
  
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

  /**
   * Valide l'heure entrée
   */
  const validateTime = (timeStr) => {
    // Si vide ou incomplet, pas d'erreur encore
    if (!timeStr || timeStr.length < 5) {
      return { valid: true, message: '' };
    }

    const parts = timeStr.split(':');
    if (parts.length !== 2) {
      return { valid: false, message: 'Format invalide (HH:MM)' };
    }
    
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    // Vérifier que ce sont des nombres valides
    if (isNaN(hours) || isNaN(minutes)) {
      return { valid: false, message: 'Heure invalide' };
    }
    
    if (hours < 0 || hours > 23) {
      return { valid: false, message: 'Heures invalides (0-23)' };
    }
    
    if (minutes < 0 || minutes > 59) {
      return { valid: false, message: 'Minutes invalides (0-59)' };
    }
    
    return { valid: true, message: '' };
  };

  // Validation en temps réel
  const timeValidation = useMemo(() => validateTime(value), [value]);

  const handleTimeChange = (text) => {
    const formatted = formatTimeInput(text);
    onChange(formatted);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={handleTimeChange}
        style={styles.input}
        mode="outlined"
        outlineStyle={styles.outline}
        keyboardType="numeric"
        placeholder="HH:MM"
        error={!timeValidation.valid}
      />
      <HelperText type="error" visible={!timeValidation.valid} style={styles.helperText}>
        {timeValidation.message}
      </HelperText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: designSystem.colors.background.secondary,
  },
  outline: {
    borderRadius: designSystem.borderRadius.md,
    borderColor: designSystem.colors.border.light,
  },
  helperText: {
    fontSize: 12,
    paddingHorizontal: 4,
    marginTop: -4,
  },
});

export default TimeInput;

