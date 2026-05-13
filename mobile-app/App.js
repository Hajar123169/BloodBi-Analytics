import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import DonationsScreen from './src/screens/DonationsScreen';
import SearchDonorScreen from './src/screens/SearchDonorScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#c62828' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#c62828',
        tabBarIcon: ({ color, size }) => {
          const icons = { Accueil: 'home', Demandes: 'alert-circle', Dons: 'water', Recherche: 'search', Profil: 'person' };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        }
      })}>
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Demandes" component={RequestsScreen} />
        <Tab.Screen name="Dons" component={DonationsScreen} />
        <Tab.Screen name="Recherche" component={SearchDonorScreen} />
        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
