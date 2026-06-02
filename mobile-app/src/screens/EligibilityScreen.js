import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function EligibilityScreen() {

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Vérification d'éligibilité
      </Text>

      <Text style={styles.text}>
        Vous êtes éligible pour donner votre sang.
      </Text>

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 20,
  },

  text: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },

});