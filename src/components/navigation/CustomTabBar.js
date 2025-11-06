import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import designSystem from '../../theme/designSystem';
import { useStoolModal } from '../../contexts/StoolModalContext';
import { buttonPressFeedback } from '../../utils/haptics';

export default function CustomTabBar({ state, descriptors, navigation }) {
  const { openModal } = useStoolModal();
  const { colors } = designSystem;

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

  // Rendre un onglet
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
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    // Icônes pour chaque route
    let iconName = 'home';
    if (route.name === 'Accueil') iconName = 'home';
    if (route.name === 'Bilan') iconName = 'clipboard-text';
    if (route.name === 'Statistiques') iconName = 'chart-line';
    if (route.name === 'Export') iconName = 'file-pdf-box';

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
      >
        <MaterialCommunityIcons
          name={iconName}
          size={26}
          color={isFocused ? colors.primary[500] : colors.text.tertiary}
        />
        <View style={styles.labelContainer}>
          <MaterialCommunityIcons
            name="circle"
            size={4}
            color={isFocused ? colors.primary[500] : 'transparent'}
            style={styles.labelDot}
          />
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
    height: Platform.OS === 'ios' ? 85 : designSystem.layout.tabBarHeight,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    borderTopWidth: 0,
    backgroundColor: designSystem.colors.background.tertiary,
    ...designSystem.shadows.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  labelContainer: {
    marginTop: 4,
    height: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelDot: {
    marginTop: 2,
  },
  centralButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: designSystem.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    ...designSystem.shadows.md,
    elevation: 6,
  },
});
