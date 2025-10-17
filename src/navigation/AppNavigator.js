import React from 'react';
import { Platform } from 'react-native';
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
import IBDiskQuestionnaireScreen from '../screens/IBDiskQuestionnaireScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          backgroundColor: '#FFFFFF',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
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
        <Stack.Screen name="IBDiskQuestionnaire" component={IBDiskQuestionnaireScreen} options={{ title: 'Votre quotidien' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
