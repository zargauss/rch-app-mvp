import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import ExportScreen from '../screens/ExportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import theme from '../theme/theme';
import DailySurveyScreen from '../screens/DailySurveyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Accueil') iconName = 'home';
          if (route.name === 'Historique') iconName = 'chart-timeline-variant';
          if (route.name === 'Statistiques') iconName = 'chart-line';
          if (route.name === 'Export') iconName = 'file-pdf-box';
          if (route.name === 'Paramètres') iconName = 'cog';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Historique" component={HistoryScreen} />
      <Tab.Screen name="Statistiques" component={StatsScreen} />
      <Tab.Screen name="Export" component={ExportScreen} />
      <Tab.Screen name="Paramètres" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="DailySurvey" component={DailySurveyScreen} options={{ title: 'Bilan du jour' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
