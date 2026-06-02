import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import EligibilityScreen from "../screens/EligibilityScreen";

const Stack =
  createNativeStackNavigator();

export default function MainStack() {

  return (

    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >

      <Stack.Screen
        name="Tabs"
        component={BottomTabs}
      />

      <Stack.Screen
        name="Eligibility"
        component={EligibilityScreen}
      />

    </Stack.Navigator>

  );
}