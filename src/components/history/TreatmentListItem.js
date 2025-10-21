import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from '../ui/AppText';
import designSystem from '../../theme/designSystem';

const { colors, spacing, borderRadius } = designSystem;

export default function TreatmentListItem({ 
  item, 
  onEdit, 
  onDelete 
}) {
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  const { date, time } = formatDateTime(item.timestamp);

  return (
    <View style={styles.container}>
      <View style={styles.iconSection}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons 
            name="pill"
            size={24} 
            color={colors.secondary[500]}
          />
        </View>
      </View>

      <View style={styles.content}>
        <AppText variant="body" weight="semiBold" color="primary" numberOfLines={2}>
          {item.name}
        </AppText>
        <View style={styles.timeInfo}>
          <MaterialCommunityIcons 
            name="calendar" 
            size={14} 
            color={colors.text.tertiary}
            style={styles.timeIcon}
          />
          <AppText variant="caption" color="tertiary">
            {date} à {time}
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity 
            onPress={() => onEdit(item)} 
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons 
              name="pencil" 
              size={20} 
              color={colors.primary[500]} 
            />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity 
            onPress={() => onDelete(item.id)} 
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons 
              name="delete" 
              size={20} 
              color={colors.health.danger.main} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconSection: {
    marginRight: spacing[3],
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondary[100],
  },
  content: {
    flex: 1,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  timeIcon: {
    marginRight: spacing[1],
  },
  actions: {
    flexDirection: 'column',
    gap: spacing[2],
    marginLeft: spacing[2],
  },
  actionButton: {
    padding: spacing[1],
  },
});

