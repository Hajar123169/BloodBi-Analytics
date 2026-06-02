import React from "react";

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";

export default function SplashScreen() {

  return (

    <View style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#c62828"
      />

      <View style={styles.logoCircle}>

        <Text style={styles.drop}>
          🩸
        </Text>

      </View>

      <Text style={styles.logo}>
        BloodBI
      </Text>

      <Text style={styles.subtitle}>
        Blood Donation Analytics Platform
      </Text>

      <ActivityIndicator
        size="large"
        color="#fff"
        style={styles.loader}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#c62828",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  drop: {
    fontSize: 52,
  },

  logo: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#ffe5e5",
    textAlign: "center",
  },

  loader: {
    marginTop: 40,
  },

});