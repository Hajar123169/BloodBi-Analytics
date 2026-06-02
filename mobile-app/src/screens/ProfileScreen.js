import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  AuthContext,
} from "../context/AuthContext";

import {
  apiGet,
  apiPut,
} from "../api/client";

const fallbackProfile = {
  id: null,
  fullName: "Donneur",
  bloodType: "O_NEG",
  city: "Casablanca",
  phone: "0600000000",
  email: "donneur@example.com",
  address: "Adresse utilisateur",
  available: true,
  totalDonations: 0,
  lastDonationDate: null,
};

export default function ProfileScreen() {

  const auth =
    useContext(AuthContext);

  const [loading, setLoading] =
    useState(true);

  const [profile, setProfile] =
    useState(fallbackProfile);

  const [history, setHistory] =
    useState([]);

  const [available, setAvailable] =
    useState(true);

  const [editVisible, setEditVisible] =
    useState(false);

  const [form, setForm] =
    useState(fallbackProfile);

  useEffect(() => {

    loadProfile();

  }, []);

  async function loadProfile() {

    try {

      setLoading(true);

      const data =
        await apiGet("/profile");

      if (data) {

        setProfile(data);

        setAvailable(
          Boolean(data.available)
        );

        setForm(data);

        await loadHistory(
          data.id
        );
      }

    } catch (error) {

      console.log(error);

      setProfile(fallbackProfile);

    } finally {

      setLoading(false);
    }
  }

  async function loadHistory(
    donorId
  ) {

    try {

      const data =
        await apiGet("/donations");

      if (
        Array.isArray(data)
      ) {

        const filtered =
          data.filter(
            item =>
              item.donor?.id ===
              donorId
          );

        setHistory(filtered);
      }

    } catch (error) {

      console.log(error);
    }
  }

  function openEditModal() {

    setForm(profile);

    setEditVisible(true);
  }

  async function saveProfile() {

    try {

      if (!profile.id) {

        Alert.alert(
          "Erreur",
          "Profil introuvable"
        );

        return;
      }

      const updatedProfile = {
        ...profile,
        fullName: form.fullName,
        phone: form.phone,
        city: form.city,
        address: form.address,
        available: available,
      };

      const result =
        await apiPut(
          `/profile/${profile.id}`,
          updatedProfile
        );

      setProfile(result);

      setForm(result);

      setEditVisible(false);

      Alert.alert(
        "Succès",
        "Profil mis à jour"
      );

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Erreur",
        "Impossible de modifier le profil"
      );
    }
  }

  async function toggleAvailability(
    value
  ) {

    setAvailable(value);

    try {

      if (!profile.id) {
        return;
      }

      const updatedProfile = {
        ...profile,
        available: value,
      };

      const result =
        await apiPut(
          `/profile/${profile.id}`,
          updatedProfile
        );

      setProfile(result);

      setForm(result);

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Erreur",
        "Impossible de modifier la disponibilité"
      );
    }
  }

  function handleLogout() {

    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },

        {
          text: "Se déconnecter",

          style: "destructive",

          onPress: () => {

            if (auth?.logout) {

              auth.logout();

            } else if (auth?.signOut) {

              auth.signOut();

            } else if (auth?.setUserToken) {

              auth.setUserToken(null);

            } else {

              Alert.alert(
                "Info",
                "Ajoutez la fonction logout dans AuthContext."
              );
            }
          },
        },
      ]
    );
  }

  function formatBloodType(
    type
  ) {

    if (!type) {
      return "-";
    }

    return type
      .replace("_POS", "+")
      .replace("_NEG", "-");
  }

  function formatDate(date) {

    if (!date) {
      return "Non renseigné";
    }

    return new Date(date)
      .toLocaleDateString(
        "fr-FR"
      );
  }

  if (loading) {

    return (

      <View style={styles.loader}>

        <ActivityIndicator
          size="large"
          color="#ef4444"
        />

      </View>
    );
  }

  return (

    <View style={styles.root}>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.header}>

          <View style={styles.logoCircle}>

            <Ionicons
              name="water"
              size={42}
              color="#fff"
            />

          </View>

          <Text style={styles.name}>
            {profile.fullName}
          </Text>

          <Text style={styles.email}>
            {profile.email}
          </Text>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
          >

            <Ionicons
              name="log-out-outline"
              size={20}
              color="#ef4444"
            />

            <Text style={styles.logoutText}>
              Déconnexion
            </Text>

          </TouchableOpacity>

        </View>

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              Informations sanguines
            </Text>

            <View style={styles.switchRow}>

              <Text style={styles.availableText}>
                Disponible
              </Text>

              <Switch
                value={available}
                onValueChange={
                  toggleAvailability
                }
                trackColor={{
                  false: "#ccc",
                  true: "#ef4444",
                }}
                thumbColor="#fff"
              />

            </View>

          </View>

          {available ? (

            <View style={styles.availableBadge}>

              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#16a34a"
              />

              <Text style={styles.availableBadgeText}>
                Disponible pour don
              </Text>

            </View>

          ) : (

            <View style={styles.unavailableBadge}>

              <Ionicons
                name="close-circle"
                size={16}
                color="#991b1b"
              />

              <Text style={styles.unavailableBadgeText}>
                Indisponible pour don
              </Text>

            </View>
          )}

          <TouchableOpacity
            style={styles.editBtn}
            onPress={openEditModal}
          >

            <Ionicons
              name="pencil"
              size={20}
              color="#666"
            />

          </TouchableOpacity>

          <View style={styles.bloodContainer}>

            <View style={styles.bloodCircle}>

              <Text style={styles.bloodText}>
                {
                  formatBloodType(
                    profile.bloodType
                  )
                }
              </Text>

              <Text style={styles.bloodLabel}>
                Groupe Sanguin
              </Text>

            </View>

            <Text style={styles.totalDonations}>
              Total des dons : {
                profile.totalDonations || 0
              }
            </Text>

            <Text style={styles.lastDonation}>
              Dernier don : {
                formatDate(
                  profile.lastDonationDate
                )
              }
            </Text>

          </View>

        </View>

        <View style={styles.section}>

          <Text style={styles.redTitle}>
            Informations Personnelles
          </Text>

          <View style={styles.infoRow}>

            <Ionicons
              name="person-outline"
              size={20}
              color="#ef4444"
            />

            <Text style={styles.infoText}>
              {profile.fullName}
            </Text>

          </View>

          <View style={styles.infoRow}>

            <Ionicons
              name="mail-outline"
              size={20}
              color="#ef4444"
            />

            <Text style={styles.infoText}>
              {profile.email}
            </Text>

          </View>

          <View style={styles.infoRow}>

            <Ionicons
              name="call-outline"
              size={20}
              color="#ef4444"
            />

            <Text style={styles.infoText}>
              {profile.phone}
            </Text>

          </View>

          <View style={styles.infoRow}>

            <Ionicons
              name="location-outline"
              size={20}
              color="#ef4444"
            />

            <Text style={styles.infoText}>
              {profile.city} • {profile.address}
            </Text>

          </View>

        </View>

        <View style={styles.section}>

          <Text style={styles.redTitle}>
            Historique Des Dons
          </Text>

          {history.length === 0 ? (

            <Text style={styles.emptyText}>
              Aucun don enregistré pour ce profil.
            </Text>

          ) : (

            history.map(item => (

              <View
                key={item.id}
                style={styles.historyItem}
              >

                <View style={styles.historyLeft}>

                  <Ionicons
                    name="water"
                    size={18}
                    color="#ef4444"
                  />

                  <View style={styles.historyContent}>

                    <Text style={styles.historyCenter}>
                      {
                        item.center?.name ||
                        "Centre de don"
                      }
                    </Text>

                    <Text style={styles.historyCity}>
                      {
                        item.center?.city ||
                        ""
                      }
                    </Text>

                  </View>

                </View>

                <Text style={styles.historyDate}>
                  {
                    formatDate(
                      item.donatedAt ||
                      item.scheduledAt
                    )
                  }
                </Text>

              </View>
            ))
          )}

        </View>

        <View style={{ height: 50 }} />

      </ScrollView>

      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <View style={styles.modalHeader}>

              <Text style={styles.modalTitle}>
                Modifier le profil
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setEditVisible(false)
                }
              >

                <Ionicons
                  name="close"
                  size={26}
                  color="#444"
                />

              </TouchableOpacity>

            </View>

            <TextInput
              style={styles.input}
              value={form.fullName}
              placeholder="Nom complet"
              onChangeText={text =>
                setForm({
                  ...form,
                  fullName: text,
                })
              }
            />

            <TextInput
              style={styles.input}
              value={form.phone}
              placeholder="Téléphone"
              keyboardType="phone-pad"
              onChangeText={text =>
                setForm({
                  ...form,
                  phone: text,
                })
              }
            />

            <TextInput
              style={styles.input}
              value={form.city}
              placeholder="Ville"
              onChangeText={text =>
                setForm({
                  ...form,
                  city: text,
                })
              }
            />

            <TextInput
              style={styles.input}
              value={form.address}
              placeholder="Adresse"
              onChangeText={text =>
                setForm({
                  ...form,
                  address: text,
                })
              }
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={saveProfile}
            >

              <Text style={styles.saveText}>
                Enregistrer
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
}

const styles =
  StyleSheet.create({

    root: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },

    container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },

    loader: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
    },

    header: {
      backgroundColor: "#dc2626",
      paddingTop: 60,
      paddingBottom: 35,
      alignItems: "center",
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    logoCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 18,
      borderWidth: 4,
      borderColor: "#fff",
    },

    name: {
      color: "#fff",
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 8,
      textAlign: "center",
    },

    email: {
      color: "#fff",
      fontSize: 15,
      opacity: 0.9,
      marginBottom: 18,
    },

    logoutBtn: {
      backgroundColor: "#fff",
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 30,
      flexDirection: "row",
      alignItems: "center",
    },

    logoutText: {
      color: "#ef4444",
      fontWeight: "700",
      marginLeft: 8,
    },

    section: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 18,
      marginHorizontal: 14,
      marginTop: 14,
      elevation: 2,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },

    sectionTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#111",
      flex: 1,
      marginRight: 10,
    },

    switchRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    availableText: {
      color: "#666",
      fontSize: 14,
      marginRight: 8,
    },

    availableBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: "#dcfce7",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 18,
    },

    availableBadgeText: {
      color: "#15803d",
      fontWeight: "700",
      fontSize: 13,
      marginLeft: 6,
    },

    unavailableBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: "#fee2e2",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 18,
    },

    unavailableBadgeText: {
      color: "#991b1b",
      fontWeight: "700",
      fontSize: 13,
      marginLeft: 6,
    },

    editBtn: {
      alignSelf: "flex-end",
      marginBottom: 10,
    },

    bloodContainer: {
      alignItems: "center",
    },

    bloodCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: "#fca5a5",
      justifyContent: "center",
      alignItems: "center",
    },

    bloodText: {
      color: "#ef4444",
      fontSize: 34,
      fontWeight: "800",
    },

    bloodLabel: {
      color: "#777",
      fontSize: 12,
      marginTop: 6,
    },

    totalDonations: {
      marginTop: 14,
      color: "#16a34a",
      fontSize: 16,
      fontWeight: "700",
    },

    lastDonation: {
      marginTop: 6,
      color: "#666",
      fontSize: 14,
      fontWeight: "600",
    },

    redTitle: {
      color: "#ef4444",
      fontSize: 22,
      fontWeight: "800",
      marginBottom: 18,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
    },

    infoText: {
      fontSize: 16,
      color: "#111",
      marginLeft: 12,
      flex: 1,
    },

    historyItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },

    historyLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    historyContent: {
      marginLeft: 10,
    },

    historyCenter: {
      fontSize: 16,
      fontWeight: "700",
      color: "#111",
    },

    historyCity: {
      color: "#666",
      marginTop: 4,
    },

    historyDate: {
      color: "#666",
      fontSize: 14,
      marginLeft: 12,
    },

    emptyText: {
      color: "#777",
      fontSize: 15,
      textAlign: "center",
      paddingVertical: 20,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      padding: 20,
    },

    modalContent: {
      backgroundColor: "#fff",
      borderRadius: 18,
      padding: 20,
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },

    modalTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: "#111",
    },

    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 14,
      backgroundColor: "#fff",
      color: "#111",
    },

    saveBtn: {
      backgroundColor: "#ef4444",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
    },

    saveText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
    },
});