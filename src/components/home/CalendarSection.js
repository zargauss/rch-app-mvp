import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import SegmentedControl from '../ui/SegmentedControl';
import designSystem from '../../theme/designSystem';

// Import conditionnel : react-native-calendars uniquement sur mobile
let Calendar = null;
let LocaleConfig = null;
if (Platform.OS !== 'web') {
  const calendars = require('react-native-calendars');
  Calendar = calendars.Calendar;
  LocaleConfig = calendars.LocaleConfig;
}

/**
 * Section Calendrier - Affiche un calendrier avec scores ou nombre de selles
 */
const CalendarSection = ({
  calendarMode,
  onCalendarModeChange,
  stools,
  scores,
  onDayPress,
}) => {
  // Configuration locale française pour le calendrier (mobile uniquement)
  useEffect(() => {
    if (LocaleConfig) {
      LocaleConfig.locales['fr'] = {
        monthNames: [
          'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ],
        monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        today: "Aujourd'hui"
      };
      LocaleConfig.defaultLocale = 'fr';
    }
  }, []);

  // Générer les données du calendrier selon le mode
  const markedDates = useMemo(() => {
    const marks = {};

    if (calendarMode === 'score') {
      // Mode Score : afficher les scores par jour
      scores.forEach(scoreEntry => {
        const { date, score } = scoreEntry;
        let color = '#4C4DDC'; // Excellent/Modéré
        if (score > 10) {
          color = '#DC2626'; // Sévère
        } else if (score >= 5) {
          color = '#F59E0B'; // Modéré
        } else {
          color = '#16A34A'; // Excellent
        }

        marks[date] = {
          customStyles: {
            container: {
              backgroundColor: color,
              borderRadius: 8,
            },
            text: {
              color: '#FFFFFF',
              fontWeight: '700',
            },
          },
        };
      });
    } else {
      // Mode Bristol : compter les selles par jour
      const stoolsByDate = {};
      stools.forEach(stool => {
        const date = new Date(stool.timestamp);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        if (!stoolsByDate[dateStr]) {
          stoolsByDate[dateStr] = 0;
        }
        stoolsByDate[dateStr]++;
      });

      Object.entries(stoolsByDate).forEach(([date, count]) => {
        marks[date] = {
          marked: true,
          dotColor: '#4C4DDC',
          customStyles: {
            container: {
              backgroundColor: count > 0 ? '#E0E7FF' : 'transparent',
              borderRadius: 8,
            },
            text: {
              color: '#4C4DDC',
              fontWeight: '600',
            },
          },
        };
      });
    }

    // Marquer aujourd'hui
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (!marks[todayStr]) {
      marks[todayStr] = {
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: '#4C4DDC',
            borderRadius: 8,
          },
          text: {
            color: designSystem.colors.text.primary,
          },
        },
      };
    } else {
      marks[todayStr] = {
        ...marks[todayStr],
        customStyles: {
          ...marks[todayStr].customStyles,
          container: {
            ...marks[todayStr].customStyles.container,
            borderWidth: 2,
            borderColor: '#FFFFFF',
          },
        },
      };
    }

    return marks;
  }, [calendarMode, stools, scores]);

  return (
    <AppCard style={styles.calendarCard}>
      <View style={styles.calendarHeaderSection}>
        <SegmentedControl
          options={[
            { value: 'score', label: 'Score' },
            { value: 'bristol', label: 'Selles' }
          ]}
          selectedValue={calendarMode}
          onValueChange={onCalendarModeChange}
        />
      </View>

      {Calendar ? (
        <Calendar
          markingType={'custom'}
          markedDates={markedDates}
          onDayPress={onDayPress}
          theme={{
            backgroundColor: designSystem.colors.background.tertiary,
            calendarBackground: designSystem.colors.background.tertiary,
            textSectionTitleColor: designSystem.colors.text.secondary,
            selectedDayBackgroundColor: designSystem.colors.primary[500],
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: designSystem.colors.primary[500],
            dayTextColor: designSystem.colors.text.primary,
            textDisabledColor: designSystem.colors.text.tertiary,
            dotColor: designSystem.colors.primary[500],
            selectedDotColor: '#FFFFFF',
            arrowColor: designSystem.colors.primary[500],
            monthTextColor: designSystem.colors.text.primary,
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
          style={styles.calendar}
        />
      ) : (
        <View style={styles.webCalendarPlaceholder}>
          <AppText variant="bodyLarge" style={styles.placeholderText}>
            📅 Calendrier disponible sur l'application mobile
          </AppText>
          <AppText variant="bodySmall" style={styles.placeholderSubtext}>
            Le calendrier interactif sera bientôt disponible sur la version web
          </AppText>
        </View>
      )}

      {/* Légende */}
      <View style={styles.legend}>
        {calendarMode === 'score' ? (
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendSquare, { backgroundColor: '#16A34A' }]} />
              <AppText variant="labelSmall" style={styles.legendText}>Excellent (0-4)</AppText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSquare, { backgroundColor: '#F59E0B' }]} />
              <AppText variant="labelSmall" style={styles.legendText}>Modéré (5-10)</AppText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSquare, { backgroundColor: '#DC2626' }]} />
              <AppText variant="labelSmall" style={styles.legendText}>Sévère (10+)</AppText>
            </View>
          </>
        ) : (
          <View style={styles.legendFullWidth}>
            <AppText variant="labelSmall" style={styles.legendTextCentered}>
              💡 Les jours avec selles sont mis en évidence
            </AppText>
          </View>
        )}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  calendarCard: {
    marginHorizontal: designSystem.spacing[4],
    marginBottom: designSystem.spacing[4],
  },
  calendarHeaderSection: {
    marginBottom: designSystem.spacing[4],
  },
  calendar: {
    borderRadius: designSystem.borderRadius.md,
  },
  webCalendarPlaceholder: {
    padding: designSystem.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.borderRadius.md,
    minHeight: 200,
  },
  placeholderText: {
    color: designSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: designSystem.spacing[2],
  },
  placeholderSubtext: {
    color: designSystem.colors.text.tertiary,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing[3],
    marginTop: designSystem.spacing[4],
    paddingTop: designSystem.spacing[4],
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.border.light,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    color: designSystem.colors.text.secondary,
  },
  legendFullWidth: {
    flex: 1,
    alignItems: 'center',
  },
  legendTextCentered: {
    color: designSystem.colors.text.tertiary,
    textAlign: 'center',
  },
});

export default CalendarSection;
