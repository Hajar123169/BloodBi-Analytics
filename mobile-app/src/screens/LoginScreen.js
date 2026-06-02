import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";

import useAuth from "../hooks/useAuth";

import { loginUser }
from "../api/authApi";

export default function LoginScreen({
  navigation,
}) {

  const { login } = useAuth();

  const [username,
    setUsername] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  async function handleLogin() {

    if (
      !username.trim() ||
      !password.trim()
    ) {

      Alert.alert(
        "Erreur",
        "Veuillez remplir tous les champs"
      );

      return;
    }

    try {

      setLoading(true);

      const response =
        await loginUser({
          username,
          password,
        });

      const token =
        response?.token;

      if (!token) {

        Alert.alert(
          "Erreur",
          "Token invalide"
        );

        return;
      }

      await login(token);

      Alert.alert(
        "Succès",
        "Connexion réussie"
      );

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Erreur",
        "Nom utilisateur ou mot de passe incorrect"
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <KeyboardAvoidingView
      style={styles.flex}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#c62828"
      />

      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        <View style={styles.topSection}>

          <View style={styles.logoCircle}>

            <Text style={styles.logoIcon}>
              🩸
            </Text>

          </View>

          <Text style={styles.logo}>
            BloodBI
          </Text>

          <Text style={styles.subtitle}>
            Connectez-vous pour continuer
          </Text>

        </View>

        <View style={styles.card}>

          <Text style={styles.title}>
            Connexion
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nom utilisateur"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >

            {loading ? (

              <ActivityIndicator
                color="#fff"
              />

            ) : (

              <Text
                style={
                  styles.buttonText
                }
              >
                Se connecter
              </Text>

            )}

          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "Register"
              )
            }
          >

            <Text
              style={
                styles.registerText
              }
            >
              Vous n'avez pas de compte ?

              <Text
                style={
                  styles.registerLink
                }
              >
                {" "}
                Inscription
              </Text>

            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  flex: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    backgroundColor: "#c62828",
    justifyContent: "center",
    padding: 24,
  },

  topSection: {
    alignItems: "center",
    marginBottom: 35,
  },

  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  logoIcon: {
    fontSize: 42,
  },

  logo: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#ffe5e5",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#eee",
  },

  button: {
    backgroundColor: "#c62828",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  registerText: {
    marginTop: 24,
    textAlign: "center",
    color: "#777",
    fontSize: 15,
  },

  registerLink: {
    color: "#c62828",
    fontWeight: "800",
  },

});