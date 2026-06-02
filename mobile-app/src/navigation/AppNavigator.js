import React, {
  useContext,
} from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import { AuthContext } from "../context/AuthContext";

import AuthNavigator from "./AuthNavigator";

import MainStack from "./MainStack";

import SplashScreen from "../screens/SplashScreen";

export default function AppNavigator() {

  const {
    userToken,
    loading,
  } = useContext(AuthContext);

  if (loading) {

    return <SplashScreen />;
  }

  return (

    <NavigationContainer>

      {userToken ? (
        <MainStack />
      ) : (
        <AuthNavigator />
      )}

    </NavigationContainer>
  );
}