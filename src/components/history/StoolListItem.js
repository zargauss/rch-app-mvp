import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from '../ui/AppText';
import Badge from '../ui/Badge';
import designSystem from '../../theme/designSystem';

const { colors, spacing, borderRadius } = designSystem;

export default function StoolListItem({ 
  item, 
  onEdit, 
  onDelete,
  bristolDescription 
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

  const getBristolColor = (bristol) => {
    if (bristol <= 2) return 'warning';
    if (bristol >= 6) return 'danger';
    return 'success';
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconSection}>
        <View style={[
          styles.iconCircle,
          { backgroundColor: item.hasBlood ? colors.health.danger.light : colors.primary[100] }
        ]}>
          <MaterialCommunityIcons 
            name={item.hasBlood ? "water" : "check-circle"}
            size={24} 
            color={item.hasBlood ? colors.health.danger.main : colors.primary[500]}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppText variant="body" weight="semiBold" color="primary">
              {date}
            </AppText>
            <AppText variant="caption" color="tertiary">
              {time}
            </AppText>
          </View>
          <Badge variant={getBristolColor(item.bristol)} size="small">
            Type {item.bristol}
          </Badge>
        </View>

        <AppText variant="bodySmall" color="secondary" numberOfLines={2} style={styles.description}>
          {bristolDescription}
        </AppText>

        {item.hasBlood && (
          <View style={styles.bloodBadge}>
            <MaterialCommunityIcons name="water" size={14} color={colors.health.danger.main} />
            <AppText variant="caption" color="danger" style={styles.bloodText}>
              Présence de sang
            </AppText>
          </View>
        )}
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
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing[2],
  },
  description: {
    marginTop: spacing[1],
  },
  bloodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    backgroundColor: colors.health.danger.light,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  bloodText: {
    marginLeft: spacing[1],
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

