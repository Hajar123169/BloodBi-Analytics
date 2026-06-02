import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  Picker,
} from "@react-native-picker/picker";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  apiGet,
} from "../api/client";

const bloodGroups = [
  {
    label: "Tous",
    value: "",
  },
  {
    label: "O+",
    value: "O_POS",
  },
  {
    label: "O-",
    value: "O_NEG",
  },
  {
    label: "A+",
    value: "A_POS",
  },
  {
    label: "A-",
    value: "A_NEG",
  },
  {
    label: "B+",
    value: "B_POS",
  },
  {
    label: "B-",
    value: "B_NEG",
  },
  {
    label: "AB+",
    value: "AB_POS",
  },
  {
    label: "AB-",
    value: "AB_NEG",
  },
];

export default function SearchDonorScreen() {

  const [loading, setLoading] =
    useState(true);

  const [donors, setDonors] =
    useState([]);

  const [filteredDonors, setFilteredDonors] =
    useState([]);

  const [searchText, setSearchText] =
    useState("");

  const [selectedBlood, setSelectedBlood] =
    useState("");

  const [selectedCity, setSelectedCity] =
    useState("");

  const [cities, setCities] =
    useState([]);

  useEffect(() => {

    loadDonors();

  }, []);

  useEffect(() => {

    filterDonors();

  }, [
    searchText,
    selectedBlood,
    selectedCity,
    donors,
  ]);

  async function loadDonors() {

    try {

      setLoading(true);

      const data =
        await apiGet("/donors");

      if (
        Array.isArray(data)
      ) {

        setDonors(data);

        const uniqueCities =
          [
            ...new Set(
              data
                .map(item => item.city)
                .filter(Boolean)
            ),
          ];

        setCities(uniqueCities);

        setFilteredDonors(data);
      }

    } catch (error) {

      console.log(error);

      setDonors([]);

      setFilteredDonors([]);

    } finally {

      setLoading(false);
    }
  }

  function filterDonors() {

    let result =
      [...donors];

    if (
      searchText.trim()
    ) {

      const keyword =
        searchText
          .trim()
          .toLowerCase();

      result =
        result.filter(
          item =>
            item.fullName
              ?.toLowerCase()
              .includes(keyword) ||
            item.email
              ?.toLowerCase()
              .includes(keyword) ||
            item.phone
              ?.toLowerCase()
              .includes(keyword)
        );
    }

    if (selectedBlood) {

      result =
        result.filter(
          item =>
            item.bloodType ===
            selectedBlood
        );
    }

    if (selectedCity) {

      result =
        result.filter(
          item =>
            item.city ===
            selectedCity
        );
    }

    setFilteredDonors(result);
  }

  function formatBloodType(type) {

    if (!type) {
      return "-";
    }

    return type
      .replace("_POS", "+")
      .replace("_NEG", "-");
  }

  function resetFilters() {

    setSearchText("");

    setSelectedBlood("");

    setSelectedCity("");
  }

  if (loading) {

    return (

      <View style={styles.loader}>

        <ActivityIndicator
          size="large"
          color="#dc2626"
        />

      </View>
    );
  }

  return (

    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.title}>
          Trouver des Donneurs
        </Text>

        <Text style={styles.subtitle}>
          Connectez-vous avec des donneurs dans votre région.
        </Text>

        <Text style={styles.label}>
          Recherche
        </Text>

        <View style={styles.searchBox}>

          <Ionicons
            name="search"
            size={20}
            color="#777"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Nom, email ou téléphone"
            value={searchText}
            onChangeText={setSearchText}
          />

        </View>

        <Text style={styles.label}>
          Groupe Sanguin
        </Text>

        <View style={styles.pickerBox}>

          <Picker
            selectedValue={selectedBlood}
            onValueChange={value =>
              setSelectedBlood(value)
            }
          >

            {bloodGroups.map(group => (

              <Picker.Item
                key={group.value}
                label={group.label}
                value={group.value}
              />

            ))}

          </Picker>

        </View>

        <Text style={styles.label}>
          Ville
        </Text>

        <View style={styles.pickerBox}>

          <Picker
            selectedValue={selectedCity}
            onValueChange={value =>
              setSelectedCity(value)
            }
          >

            <Picker.Item
              label="Toutes"
              value=""
            />

            {cities.map(city => (

              <Picker.Item
                key={city}
                label={city}
                value={city}
              />

            ))}

          </Picker>

        </View>

        <View style={styles.resultHeader}>

          <Text style={styles.resultTitle}>
            {filteredDonors.length} Donneurs Trouvés
          </Text>

          <TouchableOpacity
            onPress={resetFilters}
          >

            <Text style={styles.resetText}>
              Réinitialiser
            </Text>

          </TouchableOpacity>

        </View>

        {filteredDonors.length === 0 ? (

          <View style={styles.emptyBox}>

            <Ionicons
              name="person-outline"
              size={46}
              color="#dc2626"
            />

            <Text style={styles.emptyTitle}>
              Aucun donneur trouvé
            </Text>

            <Text style={styles.emptyText}>
              Essayez un autre groupe sanguin ou une autre ville.
            </Text>

          </View>

        ) : (

          filteredDonors.map(
            donor => (

              <View
                key={donor.id}
                style={styles.card}
              >

                <View style={styles.cardHeader}>

                  <View>

                    <Text style={styles.name}>
                      {donor.fullName}
                    </Text>

                    <Text style={styles.email}>
                      {donor.email}
                    </Text>

                  </View>

                  <View style={styles.bloodCircle}>

                    <Text style={styles.bloodText}>
                      {
                        formatBloodType(
                          donor.bloodType
                        )
                      }
                    </Text>

                  </View>

                </View>

                <View style={styles.infoRow}>

                  <Ionicons
                    name="call-outline"
                    size={18}
                    color="#ef4444"
                  />

                  <Text style={styles.infoText}>
                    {
                      donor.phone ||
                      "Téléphone non renseigné"
                    }
                  </Text>

                </View>

                <View style={styles.infoRow}>

                  <Ionicons
                    name="location-outline"
                    size={18}
                    color="#ef4444"
                  />

                  <Text style={styles.infoText}>
                    {
                      donor.city ||
                      "Ville inconnue"
                    }
                    {" "}
                    •
                    {" "}
                    {
                      donor.address ||
                      "Adresse non renseignée"
                    }
                  </Text>

                </View>

                <View style={styles.infoRow}>

                  <Ionicons
                    name="water-outline"
                    size={18}
                    color="#ef4444"
                  />

                  <Text style={styles.infoText}>
                    Total dons : {
                      donor.totalDonations || 0
                    }
                  </Text>

                </View>

                <View
                  style={[
                    styles.statusBadge,
                    donor.available
                      ? styles.availableBadge
                      : styles.unavailableBadge,
                  ]}
                >

                  <Ionicons
                    name={
                      donor.available
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={16}
                    color={
                      donor.available
                        ? "#16a34a"
                        : "#991b1b"
                    }
                  />

                  <Text
                    style={[
                      styles.statusText,
                      donor.available
                        ? styles.availableText
                        : styles.unavailableText,
                    ]}
                  >
                    {
                      donor.available
                        ? "Disponible pour don"
                        : "Indisponible"
                    }
                  </Text>

                </View>

              </View>
            )
          )
        )}

        <View style={{ height: 40 }} />

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
  },

  subtitle: {
    color: "#666",
    fontSize: 15,
    marginBottom: 22,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },

  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 10,
    fontSize: 15,
    color: "#111",
  },

  pickerBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 18,
    overflow: "hidden",
  },

  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 14,
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },

  resetText: {
    color: "#dc2626",
    fontWeight: "700",
  },

  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    marginTop: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginTop: 10,
  },

  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },

  email: {
    color: "#666",
    marginTop: 4,
  },

  bloodCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },

  bloodText: {
    color: "#dc2626",
    fontWeight: "800",
    fontSize: 18,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  infoText: {
    marginLeft: 10,
    color: "#333",
    fontSize: 15,
    flex: 1,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 8,
  },

  availableBadge: {
    backgroundColor: "#dcfce7",
  },

  unavailableBadge: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 13,
  },

  availableText: {
    color: "#15803d",
  },

  unavailableText: {
    color: "#991b1b",
  },
});