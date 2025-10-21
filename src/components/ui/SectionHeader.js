import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from './AppText';
import designSystem from '../../theme/designSystem';

const { colors, spacing } = designSystem;

export default function SectionHeader({ 
  title,
  subtitle,
  icon,
  iconColor = colors.primary[500],
  rightElement,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContent}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: colors.primary[100] }]}>
            <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
          </View>
        )}
        <View style={styles.textContainer}>
          <AppText variant="h3" weight="semiBold" color="primary" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="bodySmall" color="secondary" numberOfLines={2} style={styles.subtitle}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing[1],
  },
});

