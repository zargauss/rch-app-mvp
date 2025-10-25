﻿import React from 'react';
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
import ToiletsScreen from '../screens/ToiletsScreen';
import DailySurveyScreen from '../screens/DailySurveyScreen';
import IBDiskQuestionnaireScreen from '../screens/IBDiskQuestionnaireScreen';
import designSystem from '../theme/designSystem';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: designSystem.colors.background.tertiary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: designSystem.colors.border.light,
        },
        headerTitleStyle: {
          fontSize: designSystem.typography.fontSize.lg,
          fontWeight: designSystem.typography.fontWeight.bold,
          color: designSystem.colors.text.primary,
        },
        tabBarActiveTintColor: designSystem.colors.primary[500],
        tabBarInactiveTintColor: designSystem.colors.text.tertiary,
        tabBarLabelStyle: { 
          fontSize: designSystem.typography.fontSize.xs,
          fontWeight: designSystem.typography.fontWeight.medium,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : designSystem.layout.tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          borderTopWidth: 0,
          backgroundColor: designSystem.colors.background.tertiary,
          ...designSystem.shadows.lg,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName = 'home';
          if (route.name === 'Accueil') iconName = 'home';
          if (route.name === 'Toilettes') iconName = 'toilet';
          if (route.name === 'Historique') iconName = 'clock-outline';
          if (route.name === 'Statistiques') iconName = 'chart-line';
          if (route.name === 'Export') iconName = 'file-pdf-box';
          if (route.name === 'Paramètres') iconName = 'cog';
          return <MaterialCommunityIcons name={iconName} size={26} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Toilettes" component={ToiletsScreen} />
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
