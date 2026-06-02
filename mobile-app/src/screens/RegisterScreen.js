import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";

import { Picker }
from "@react-native-picker/picker";

import { registerUser }
from "../api/authApi";

const bloodGroups = [
  "A_POS",
  "A_NEG",
  "B_POS",
  "B_NEG",
  "AB_POS",
  "AB_NEG",
  "O_POS",
  "O_NEG",
];

export default function RegisterScreen({
  navigation,
}) {

  const [fullName,
    setFullName] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [phone,
    setPhone] =
    useState("");

  const [bloodGroup,
    setBloodGroup] =
    useState("O_POS");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  async function handleRegister() {

    if (
      !fullName ||
      !email ||
      !phone ||
      !bloodGroup ||
      !password
    ) {

      Alert.alert(
        "Erreur",
        "Veuillez remplir tous les champs"
      );

      return;
    }

    try {

      setLoading(true);

      const data = {
  fullName: fullName,
  email: email,
  phone: phone,
  bloodGroup: bloodGroup,
  password: password,
};
      await registerUser(data);

      Alert.alert(
        "Succès",
        "Compte créé avec succès"
      );

      navigation.goBack();

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Erreur",
        "Impossible de créer le compte"
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
          : undefined
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
            Créer un compte
          </Text>

        </View>

        <View style={styles.card}>

          <Text style={styles.title}>
            Inscription
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Téléphone"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <View style={styles.pickerBox}>

            <Picker
              selectedValue={
                bloodGroup
              }
              onValueChange={(
                value
              ) =>
                setBloodGroup(
                  value
                )
              }
            >

              {bloodGroups.map(
                group => (

                  <Picker.Item
                    key={group}
                    label={group}
                    value={group}
                  />

                )
              )}

            </Picker>

          </View>

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={
              handleRegister
            }
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
                Créer un compte
              </Text>

            )}

          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
          >

            <Text
              style={styles.loginText}
            >
              Vous avez déjà un compte ?

              <Text
                style={
                  styles.loginLink
                }
              >
                {" "}
                Connexion
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

  pickerBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    marginBottom: 18,
    overflow: "hidden",
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

  loginText: {
    marginTop: 24,
    textAlign: "center",
    color: "#777",
    fontSize: 15,
  },

  loginLink: {
    color: "#c62828",
    fontWeight: "800",
  },

});