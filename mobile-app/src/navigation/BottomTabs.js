import React from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  Ionicons,
} from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import RequestsScreen from "../screens/RequestsScreen";
import DonationsScreen from "../screens/DonationsScreen";
import SearchDonorScreen from "../screens/SearchDonorScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab =
  createBottomTabNavigator();

export default function BottomTabs() {

  return (

    <Tab.Navigator

      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarActiveTintColor:
          "#dc2626",

        tabBarInactiveTintColor:
          "#888",

        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },

        tabBarIcon: ({
          color,
          size,
        }) => {

          let iconName;

          if (
            route.name ===
            "Accueil"
          ) {

            iconName = "home";

          } else if (
            route.name ===
            "Demandes"
          ) {

            iconName =
              "alert-circle";

          } else if (
            route.name ===
            "Dons"
          ) {

            iconName =
              "water";

          } else if (
            route.name ===
            "Recherche"
          ) {

            iconName =
              "search";

          } else if (
            route.name ===
            "Profil"
          ) {

            iconName =
              "person";
          }

          return (

            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />

          );
        },

      })}
    >

      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Demandes"
        component={RequestsScreen}
      />

      <Tab.Screen
        name="Dons"
        component={DonationsScreen}
      />

      <Tab.Screen
        name="Recherche"
        component={SearchDonorScreen}
      />

      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
      />

    </Tab.Navigator>
  );
}