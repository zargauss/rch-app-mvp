import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import designSystem from '../../theme/designSystem';

const { colors, spacing, borderRadius } = designSystem;

export function SettingsItem({ 
  icon, 
  title, 
  description, 
  onPress, 
  variant = 'default',
  rightElement,
}) {
  const variantConfig = {
    default: {
      iconBg: colors.primary[100],
      iconColor: colors.primary[500],
    },
    success: {
      iconBg: colors.health.excellent.light,
      iconColor: colors.health.excellent.main,
    },
    warning: {
      iconBg: colors.health.moderate.light,
      iconColor: colors.health.moderate.main,
    },
    danger: {
      iconBg: colors.health.danger.light,
      iconColor: colors.health.danger.main,
    },
  };

  const config = variantConfig[variant];

  const content = (
    <>
      <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
        <MaterialCommunityIcons name={icon} size={24} color={config.iconColor} />
      </View>
      <View style={styles.textContainer}>
        <AppText variant="body" weight="medium" color="primary" numberOfLines={1}>
          {title}
        </AppText>
        {description && (
          <AppText variant="caption" color="secondary" numberOfLines={2} style={styles.description}>
            {description}
          </AppText>
        )}
      </View>
      {rightElement || (
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color={colors.text.tertiary} 
        />
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.item}>{content}</View>;
}

export default function SettingsSection({ title, children, variant = 'default' }) {
  return (
    <AppCard variant={variant} style={styles.section}>
      {title && (
        <AppText variant="label" color="secondary" style={styles.sectionTitle}>
          {title.toUpperCase()}
        </AppText>
      )}
      <View style={styles.items}>
        {React.Children.map(children, (child, index) => (
          <>
            {child}
            {index < React.Children.count(children) - 1 && (
              <View style={styles.separator} />
            )}
          </>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    marginBottom: spacing[3],
    letterSpacing: 0.5,
  },
  items: {
    gap: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
    marginRight: spacing[2],
  },
  description: {
    marginTop: spacing[1],
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 56, // icon width + margin
  },
});

