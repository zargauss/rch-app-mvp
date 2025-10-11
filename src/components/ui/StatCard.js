import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import AppText from './AppText';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  color = 'primary',
  style 
}) {
  const theme = useTheme();
  
  const getColor = () => {
    switch (color) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'stable': return '→';
      default: return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return theme.colors.onSurfaceVariant;
    switch (trend) {
      case 'up': return theme.colors.success;
      case 'down': return theme.colors.error;
      case 'stable': return theme.colors.warning;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  return (
    <Card style={[styles.card, style]} elevation={1}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: getColor() + '20' }]}>
              <AppText style={[styles.icon, { color: getColor() }]}>{icon}</AppText>
            </View>
          )}
          <View style={styles.headerText}>
            <AppText variant="labelMedium" style={styles.title}>{title}</AppText>
            {trend && trendValue && (
              <View style={styles.trendContainer}>
                <AppText style={[styles.trendIcon, { color: getTrendColor() }]}>
                  {getTrendIcon()}
                </AppText>
                <AppText style={[styles.trendText, { color: getTrendColor() }]}>
                  {trendValue}
                </AppText>
              </View>
            )}
          </View>
        </View>
        
        <AppText variant="displayLarge" style={[styles.value, { color: getColor() }]}>
          {value}
        </AppText>
        
        {subtitle && (
          <AppText variant="labelSmall" style={styles.subtitle}>
            {subtitle}
          </AppText>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#64748B',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 14,
    marginRight: 4,
    fontWeight: '600',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  value: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
  },
});
