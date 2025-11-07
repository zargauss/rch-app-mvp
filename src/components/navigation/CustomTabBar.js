import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from '../ui/AppText';
import NotificationBadge from '../ui/NotificationBadge';
import designSystem from '../../theme/designSystem';
import { useStoolModal } from '../../contexts/StoolModalContext';
import { buttonPressFeedback } from '../../utils/haptics';
import usePendingQuestionnaires from '../../hooks/usePendingQuestionnaires';

export default function CustomTabBar({ state, descriptors, navigation }) {
  const { openModal } = useStoolModal();
  const { colors } = designSystem;
  const pendingCount = usePendingQuestionnaires();

  const handleAddStool = () => {
    buttonPressFeedback();
    openModal();
  };

  // Filtrer les routes pour exclure Paramètres de la tab bar
  const visibleRoutes = state.routes.filter(route => route.name !== 'Paramètres');
  const visibleDescriptors = visibleRoutes.reduce((acc, route) => {
    acc[route.key] = descriptors[route.key];
    return acc;
  }, {});

  // Rendre un onglet moderne avec label
  const renderTab = (route, index) => {
    const { options } = visibleDescriptors[route.key];
    const actualIndex = state.routes.findIndex(r => r.key === route.key);
    const isFocused = state.index === actualIndex;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        buttonPressFeedback();
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    // Icônes et labels pour chaque route
    let iconName = 'home';
    let label = route.name;

    if (route.name === 'Accueil') {
      iconName = 'home';
      label = 'Accueil';
    }
    if (route.name === 'Bilan') {
      iconName = 'clipboard-text';
      label = 'Bilan';
    }
    if (route.name === 'Statistiques') {
      iconName = 'chart-line';
      label = 'Stats';
    }
    if (route.name === 'Export') {
      iconName = 'file-pdf-box';
      label = 'Export';
    }

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <View style={[
          styles.tabContent,
          isFocused && styles.tabContentFocused
        ]}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={isFocused ? colors.primary[500] : colors.text.tertiary}
            />
            {/* Badge pour l'onglet Bilan */}
            {route.name === 'Bilan' && (
              <NotificationBadge count={pendingCount} size="medium" />
            )}
          </View>
          <AppText
            variant="caption"
            style={[
              styles.tabLabel,
              { color: isFocused ? colors.primary[500] : colors.text.tertiary }
            ]}
          >
            {label}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {/* Premier onglet (Accueil) */}
        {visibleRoutes[0] && renderTab(visibleRoutes[0], 0)}
        
        {/* Deuxième onglet (Bilan) */}
        {visibleRoutes[1] && renderTab(visibleRoutes[1], 1)}

        {/* Bouton central avec icône toilettes */}
        <TouchableOpacity
          style={styles.centralButton}
          onPress={handleAddStool}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Ajouter une selle"
        >
          <MaterialCommunityIcons
            name="toilet"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Troisième onglet (Statistiques) */}
        {visibleRoutes[2] && renderTab(visibleRoutes[2], 2)}

        {/* Quatrième onglet (Export) */}
        {visibleRoutes[3] && renderTab(visibleRoutes[3], 3)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 88 : 72,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 0,
    backgroundColor: designSystem.colors.background.tertiary,
    ...designSystem.shadows.xl,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Touch target minimum
    paddingHorizontal: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: designSystem.borderRadius.lg,
    minWidth: 60,
  },
  tabContentFocused: {
    backgroundColor: designSystem.colors.primary[50],
  },
  tabLabel: {
    marginTop: 2,
    fontWeight: '600',
    fontSize: 11,
  },
  iconWrapper: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: designSystem.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginBottom: 8,
    ...designSystem.shadows.lg,
    elevation: 8,
  },
});
