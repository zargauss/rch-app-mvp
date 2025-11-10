import React, { useState } from 'react';
import { Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimeInput from './DateTimeInput';
import AppText from './AppText';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import designSystem from '../../theme/designSystem';

// Import conditionnel : react-native-date-picker uniquement sur mobile
let DatePicker = null;
if (Platform.OS !== 'web') {
  DatePicker = require('react-native-date-picker').default;
}

/**
 * DatePickerUnified - Wrapper cross-platform pour date picker
 * Mobile (iOS/Android): react-native-date-picker natif
 * Web: DateTimeInput existant
 */
const DatePickerUnified = ({
  date,
  onDateChange,
  mode = 'date', // 'date', 'time', 'datetime'
  label,
  minimumDate,
  maximumDate,
}) => {
  const [open, setOpen] = useState(false);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  // Formater la date pour l'affichage
  const formatDisplayDate = (d) => {
    if (!d) return '';
    if (mode === 'date') {
      return d.toLocaleDateString('fr-FR');
    } else if (mode === 'time') {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  // Sur web, utiliser DateTimeInput
  if (Platform.OS === 'web') {
    return (
      <DateTimeInput
        dateValue={dateInput}
        timeValue={timeInput}
        onDateChange={(val) => {
          setDateInput(val);
          // Parser et appeler onDateChange si valide
          try {
            const [day, month, year] = val.split('/');
            if (day && month && year) {
              const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              if (!isNaN(newDate.getTime())) {
                onDateChange(newDate);
              }
            }
          } catch (e) {}
        }}
        onTimeChange={(val) => {
          setTimeInput(val);
          // Parser et appeler onDateChange si valide
          try {
            const [hour, minute] = val.split(':');
            if (hour && minute && date) {
              const newDate = new Date(date);
              newDate.setHours(parseInt(hour), parseInt(minute));
              if (!isNaN(newDate.getTime())) {
                onDateChange(newDate);
              }
            }
          } catch (e) {}
        }}
        dateLabel={mode === 'time' ? undefined : (label || 'Date (JJ/MM/AAAA)')}
        timeLabel={mode === 'date' ? undefined : 'Heure (HH:MM)'}
      />
    );
  }

  // Sur mobile, utiliser react-native-date-picker
  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="labelMedium" style={styles.label}>
          {label}
        </AppText>
      )}

      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <MaterialCommunityIcons
          name={mode === 'time' ? 'clock-outline' : 'calendar'}
          size={20}
          color={designSystem.colors.primary[500]}
        />
        <AppText variant="bodyMedium" style={styles.triggerText}>
          {date ? formatDisplayDate(date) : 'Sélectionner'}
        </AppText>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={designSystem.colors.text.tertiary}
        />
      </TouchableOpacity>

      {DatePicker && (
        <DatePicker
          modal
          open={open}
          date={date || new Date()}
          mode={mode}
          locale="fr"
          title={label || 'Sélectionner'}
          confirmText="Confirmer"
          cancelText="Annuler"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onConfirm={(selectedDate) => {
            setOpen(false);
            onDateChange(selectedDate);
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: designSystem.spacing[3],
  },
  label: {
    color: designSystem.colors.text.secondary,
    marginBottom: designSystem.spacing[2],
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
    padding: designSystem.spacing[3],
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: designSystem.colors.border.light,
  },
  triggerText: {
    flex: 1,
    color: designSystem.colors.text.primary,
  },
});

export default DatePickerUnified;
