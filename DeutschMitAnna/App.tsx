import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ContentScreen from './src/screens/ContentScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddContentScreen from './src/screens/AddContentScreen';
import { setupNotifications, registerBackgroundFetch } from './src/services/scheduler';

const Tab = createBottomTabNavigator();
const ContentStack = createNativeStackNavigator();

function ContentStackNavigator() {
  return (
    <ContentStack.Navigator screenOptions={{ headerShown: false }}>
      <ContentStack.Screen name="ContentList" component={ContentScreen} />
      <ContentStack.Screen name="AddContent" component={AddContentScreen} />
    </ContentStack.Navigator>
  );
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string[]> = {
    'Ana Sayfa': ['🏠', '🏡'],
    'İçerikler': ['📄', '📝'],
    'Takvim': ['📅', '🗓️'],
    'Ayarlar': ['⚙️', '🔧'],
  };

  const [inactive, active] = icons[label] || ['●', '●'];

  return (
    <View style={styles.tabIconContainer}>
      <Text style={styles.tabIcon}>{focused ? active : inactive}</Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? '#00f2ea' : '#888' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function App() {
  useEffect(() => {
    const init = async () => {
      await setupNotifications();
      await registerBackgroundFetch();
    };
    init();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#111',
            borderTopColor: '#333',
            borderTopWidth: 1,
            height: 70,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#00f2ea',
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Ana Sayfa" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="ContentTab"
          component={ContentStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon label="İçerikler" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="ScheduleTab"
          component={ScheduleScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Takvim" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Ayarlar" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
