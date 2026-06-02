import React, {
  useCallback,
  useState,
} from "react";

import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";

import {
  apiGet,
} from "../api/client";

export default function HomeScreen() {

  const navigation =
    useNavigation();

  const [
    urgentRequests,
    setUrgentRequests,
  ] = useState([]);

  const [
    latestDonations,
    setLatestDonations,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  useFocusEffect(
    useCallback(() => {

      loadHomeData();

    }, [])
  );

  async function loadHomeData() {

    try {

      setLoading(true);

      await Promise.all([
        loadRequests(),
        loadDonations(),
      ]);

    } catch (error) {

      console.log(
        "HOME LOAD ERROR:",
        error
      );

    } finally {

      setLoading(false);
    }
  }

  async function loadRequests() {

    try {

      const data =
        await apiGet("/requests");

      if (Array.isArray(data)) {

        const priority = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };

        const filtered =
          data
            .filter(
              item =>
                item.status === "PENDING"
            )
            .sort(
              (a, b) =>
                (priority[b.urgency] || 0) -
                (priority[a.urgency] || 0)
            )
            .slice(0, 2);

        setUrgentRequests(filtered);
      }

    } catch (error) {

      console.log(
        "REQUESTS HOME ERROR:",
        error
      );

      setUrgentRequests([]);
    }
  }

  async function loadDonations() {

    try {

      const data =
        await apiGet("/donations");

      if (Array.isArray(data)) {

        const sorted =
          data
            .sort(
              (a, b) =>
                new Date(
                  b.scheduledAt ||
                  b.donatedAt ||
                  0
                ) -
                new Date(
                  a.scheduledAt ||
                  a.donatedAt ||
                  0
                )
            )
            .slice(0, 2);

        setLatestDonations(sorted);
      }

    } catch (error) {

      console.log(
        "DONATIONS HOME ERROR:",
        error
      );

      setLatestDonations([]);
    }
  }

  function formatDate(dateValue) {

    if (!dateValue) {
      return "Date inconnue";
    }

    return new Date(dateValue)
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
  }

  function formatBloodType(type) {

    if (!type) {
      return "-";
    }

    return type
      .replace("_POS", "+")
      .replace("_NEG", "-");
  }

  function formatUrgency(value) {

    if (value === "CRITICAL") {
      return "Critique";
    }

    if (value === "HIGH") {
      return "Urgence élevée";
    }

    if (value === "MEDIUM") {
      return "Urgence moyenne";
    }

    if (value === "LOW") {
      return "Faible";
    }

    return value || "Urgence";
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

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.content}>

        <Text style={styles.title}>
          Bienvenue 👋
        </Text>

        <Text style={styles.subtitle}>
          Merci de contribuer à sauver des vies
        </Text>

        <View style={styles.actionsRow}>

          <TouchableOpacity
            style={styles.donateBtn}
            onPress={() =>
              navigation.navigate(
                "Dons"
              )
            }
          >

            <Ionicons
              name="water"
              size={18}
              color="#fff"
            />

            <Text style={styles.btnText}>
              Donner du sang
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.requestBtn}
            onPress={() =>
              navigation.navigate(
                "Demandes"
              )
            }
          >

            <MaterialIcons
              name="warning"
              size={18}
              color="#fff"
            />

            <Text style={styles.btnText}>
              Demander du sang
            </Text>

          </TouchableOpacity>

        </View>

        <View style={styles.sectionRow}>

          <Text style={styles.section}>
            Demandes urgentes
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "Demandes"
              )
            }
          >

            <Text style={styles.viewAll}>
              Voir tout
            </Text>

          </TouchableOpacity>

        </View>

        {urgentRequests.length === 0 ? (

          <View style={styles.emptyCard}>

            <Text style={styles.emptyText}>
              Aucune demande urgente pour le moment.
            </Text>

          </View>

        ) : (

          urgentRequests.map(
            item => (

              <TouchableOpacity
                key={item.id}
                style={styles.cardBox}
                onPress={() =>
                  navigation.navigate(
                    "Demandes"
                  )
                }
              >

                <View style={styles.bloodCircle}>

                  <Text style={styles.bloodText}>
                    {
                      formatBloodType(
                        item.bloodType
                      )
                    }
                  </Text>

                </View>

                <View style={styles.flexBox}>

                  <Text style={styles.hospital}>
                    {
                      item.hospital ||
                      item.center?.name ||
                      "Hôpital non renseigné"
                    }
                  </Text>

                  <Text style={styles.meta}>
                    {
                      item.city ||
                      item.center?.city ||
                      "Ville inconnue"
                    }
                    {" • "}
                    {
                      formatUrgency(
                        item.urgency
                      )
                    }
                  </Text>

                </View>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#777"
                />

              </TouchableOpacity>
            )
          )
        )}

        <View style={styles.sectionRow}>

          <Text style={styles.section}>
            Vos derniers dons
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "Profil"
              )
            }
          >

            <Text style={styles.viewAll}>
              Voir tout
            </Text>

          </TouchableOpacity>

        </View>

        {latestDonations.length === 0 ? (

          <View style={styles.emptyCard}>

            <Text style={styles.emptyText}>
              Aucun don enregistré.
            </Text>

          </View>

        ) : (

          latestDonations.map(
            item => (

              <TouchableOpacity
                key={item.id}
                style={styles.donationCard}
                onPress={() =>
                  navigation.navigate(
                    "Profil"
                  )
                }
              >

                <FontAwesome5
                  name="calendar-alt"
                  size={18}
                  color="#2563eb"
                />

                <View style={styles.info}>

                  <Text style={styles.date}>
                    {
                      formatDate(
                        item.scheduledAt ||
                        item.donatedAt
                      )
                    }
                  </Text>

                  <Text style={styles.meta}>
                    {
                      item.center?.name ||
                      "Centre de don"
                    }
                    {" • "}
                    {
                      item.status ||
                      "PLANNED"
                    }
                  </Text>

                </View>

              </TouchableOpacity>
            )
          )
        )}

        <TouchableOpacity
          style={styles.eligibility}
          onPress={() =>
            navigation
              .getParent()
              ?.navigate(
                "Eligibility"
              )
          }
        >

          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#16a34a"
          />

          <Text style={styles.eligibilityText}>
            Vérifier votre éligibilité
          </Text>

        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

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

  content: {
    padding: 18,
    paddingTop: 24,
    paddingBottom: 40,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111",
  },

  subtitle: {
    color: "#666",
    marginTop: 8,
    marginBottom: 26,
    fontSize: 15,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  donateBtn: {
    width: "48%",
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  requestBtn: {
    width: "48%",
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  section: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
  },

  viewAll: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 14,
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  emptyText: {
    color: "#666",
    fontSize: 15,
    textAlign: "center",
  },

  cardBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  bloodCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  bloodText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  flexBox: {
    flex: 1,
  },

  hospital: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  meta: {
    color: "#666",
    marginTop: 4,
  },

  donationCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  info: {
    marginLeft: 14,
    flex: 1,
  },

  date: {
    fontWeight: "700",
    color: "#111",
    fontSize: 16,
  },

  eligibility: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 28,
  },

  eligibilityText: {
    color: "#16a34a",
    fontWeight: "700",
    marginLeft: 10,
    fontSize: 16,
  },

});