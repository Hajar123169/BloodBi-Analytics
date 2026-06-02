import React, {
  useEffect,
  useState,
} from "react";

import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import { Picker } from "@react-native-picker/picker";

import { Ionicons } from "@expo/vector-icons";

import * as DocumentPicker from "expo-document-picker";

import {
  apiGet,
  apiPost,
} from "../api/client";

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

const urgencyLevels = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

export default function RequestsScreen() {

  const [items, setItems] =
    useState([]);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [sortMode, setSortMode] =
    useState("urgency");

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [cities, setCities] =
    useState([]);

  const [centers, setCenters] =
    useState([]);

  const [formData, setFormData] =
    useState({
      bloodType: "O_NEG",
      urgency: "HIGH",
      city: "",
      center: "",
      comment: "",
      requestDate: new Date(),
    });

  useEffect(() => {

    initScreen();

  }, []);

  async function initScreen() {

    try {

      setLoading(true);

      await loadProfile();

      await loadCenters();

      await loadRequests();

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  }

  async function loadProfile() {

    try {

      const data =
        await apiGet("/profile");

      if (data) {
        setProfile(data);
      }

    } catch (error) {

      console.log(error);
    }
  }

  async function loadRequests() {

    try {

      const data =
        await apiGet("/requests");

      if (Array.isArray(data)) {

        const sorted =
          data.sort(
            (a, b) =>
              new Date(
                b.createdAt || 0
              ) -
              new Date(
                a.createdAt || 0
              )
          );

        setItems(sorted);
      }

    } catch (error) {

      console.log(error);

      setItems([]);
    }
  }

  async function loadCenters() {

    try {

      const data =
        await apiGet("/centers");

      if (
        Array.isArray(data) &&
        data.length > 0
      ) {

        setCenters(data);

        const uniqueCities =
          [
            ...new Set(
              data.map(
                item => item.city
              )
            ),
          ];

        setCities(uniqueCities);

        const defaultCity =
          uniqueCities[0];

        const filteredCenters =
          data.filter(
            item =>
              item.city ===
              defaultCity
          );

        setFormData(prev => ({
          ...prev,
          city: defaultCity,
          center:
            filteredCenters[0]
              ?.name || "",
        }));
      }

    } catch (error) {

      console.log(error);
    }
  }

  useEffect(() => {

    const filteredCenters =
      centers.filter(
        item =>
          item.city ===
          formData.city
      );

    if (
      filteredCenters.length > 0
    ) {

      setFormData(prev => ({
        ...prev,
        center:
          filteredCenters[0].name,
      }));
    }

  }, [
    formData.city,
    centers,
  ]);

  function formatDate(date) {

    if (!date) {
      return "Date inconnue";
    }

    return new Date(date)
      .toLocaleDateString("fr-FR");
  }

  function formatDateTimeForBackend(value) {

    const d =
      new Date(value);

    const year =
      d.getFullYear();

    const month =
      String(
        d.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        d.getDate()
      ).padStart(2, "0");

    const hours =
      String(
        d.getHours()
      ).padStart(2, "0");

    const minutes =
      String(
        d.getMinutes()
      ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  }

  async function pickDocument() {

    const result =
      await DocumentPicker
        .getDocumentAsync({
          type: "*/*",
        });

    if (!result.canceled) {

      setSelectedFile(
        result.assets[0].name
      );
    }
  }

  async function handleSubmit() {

    try {

      if (
        !formData.bloodType ||
        !formData.urgency ||
        !formData.city ||
        !formData.center
      ) {

        Alert.alert(
          "Erreur",
          "Veuillez remplir tous les champs obligatoires"
        );

        return;
      }

      const selectedCenter =
        centers.find(
          item =>
            item.name ===
            formData.center
        );

      if (!selectedCenter?.id) {

        Alert.alert(
          "Erreur",
          "Centre de don introuvable"
        );

        return;
      }

      const payload = {
        patientName:
          profile?.fullName ||
          "Patient mobile",

        bloodType:
          formData.bloodType,

        urgency:
          formData.urgency,

        status:
          "PENDING",

        hospital:
          formData.center,

        city:
          formData.city,

        notes:
          formData.comment ||
          "Demande créée depuis l'application mobile",

        createdAt:
          formatDateTimeForBackend(
            formData.requestDate
          ),

        center: {
          id: selectedCenter.id,
        },
      };

      console.log(
        "REQUEST PAYLOAD:",
        payload
      );

      await apiPost(
        "/requests",
        payload
      );

      Alert.alert(
        "Succès",
        "Votre demande a été envoyée"
      );

      setShowModal(false);

      setSelectedFile(null);

      setFormData(prev => ({
        ...prev,
        comment: "",
        requestDate: new Date(),
      }));

      await loadRequests();

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Erreur",
        "Impossible d'enregistrer la demande"
      );
    }
  }

  function handleRespond(item) {

    Alert.alert(
      "Réponse envoyée",
      `Vous avez répondu à ${item.patientName}`
    );
  }

  const sortedItems =
    [...items].sort(
      (a, b) => {

        if (
          sortMode === "recent"
        ) {

          return (
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
          );
        }

        const priority = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };

        return (
          priority[b.urgency] -
          priority[a.urgency]
        );
      }
    );

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

      <View style={styles.topBar}>

        <TouchableOpacity
          style={styles.askButton}
          onPress={() =>
            setShowModal(true)
          }
        >

          <Ionicons
            name="water"
            size={18}
            color="#d62828"
          />

          <Text style={styles.askText}>
            Demander
          </Text>

        </TouchableOpacity>

        <View style={styles.filters}>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              sortMode === "urgency" &&
                styles.activeFilter,
            ]}
            onPress={() =>
              setSortMode("urgency")
            }
          >

            <Text
              style={[
                styles.filterText,
                sortMode === "urgency" &&
                  styles.activeFilterText,
              ]}
            >
              Urgence
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              sortMode === "recent" &&
                styles.activeFilter,
            ]}
            onPress={() =>
              setSortMode("recent")
            }
          >

            <Text
              style={[
                styles.filterText,
                sortMode === "recent" &&
                  styles.activeFilterText,
              ]}
            >
              Récent
            </Text>

          </TouchableOpacity>

        </View>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {sortedItems.map(
          (item, index) => (

            <View
              key={item.id || index}
              style={styles.card}
            >

              <View style={styles.cardHeader}>

                <Text style={styles.name}>
                  {item.patientName}
                </Text>

                <View style={styles.statusBadge}>

                  <Text style={styles.statusText}>
                    {item.status}
                  </Text>

                </View>

              </View>

              <Text style={styles.blood}>
                🩸 {item.bloodType}
              </Text>

              <Text style={styles.meta}>
                🏥 {item.hospital}
              </Text>

              <Text style={styles.meta}>
                📍 {item.city}
              </Text>

              <View style={styles.urgencyRow}>

                <Text style={styles.warning}>
                  ⚠️
                </Text>

                <View
                  style={[
                    styles.urgencyBadge,

                    item.urgency === "CRITICAL" &&
                      styles.critical,

                    item.urgency === "HIGH" &&
                      styles.high,

                    item.urgency === "MEDIUM" &&
                      styles.medium,

                    item.urgency === "LOW" &&
                      styles.low,
                  ]}
                >

                  <Text style={styles.urgencyText}>
                    {item.urgency}
                  </Text>

                </View>

              </View>

              <Text style={styles.date}>
                📅 {
                  formatDate(
                    item.createdAt
                  )
                }
              </Text>

              {item.notes ? (

                <Text style={styles.notes}>
                  💬 {item.notes}
                </Text>

              ) : null}

              <TouchableOpacity
                style={styles.respondButton}
                onPress={() =>
                  handleRespond(item)
                }
              >

                <Text style={styles.respondText}>
                  Répondre
                </Text>

              </TouchableOpacity>

            </View>
          )
        )}

      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
      >

        <ScrollView
          style={styles.modalContainer}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.modalHeader}>

            <View>

              <Text style={styles.reservation}>
                Réservation
              </Text>

              <Text style={styles.modalTitle}>
                🩸 Faire une Demande
              </Text>

            </View>

            <TouchableOpacity
              onPress={() =>
                setShowModal(false)
              }
            >

              <Ionicons
                name="close"
                size={28}
                color="#444"
              />

            </TouchableOpacity>

          </View>

          <View style={styles.profileBox}>

            <Text style={styles.profileText}>
              Patient : {
                profile?.fullName ||
                "Utilisateur mobile"
              }
            </Text>

          </View>

          <Text style={styles.label}>
            Groupe sanguin *
          </Text>

          <View style={styles.pickerBox}>

            <Picker
              selectedValue={
                formData.bloodType
              }
              onValueChange={value =>
                setFormData({
                  ...formData,
                  bloodType: value,
                })
              }
            >

              {bloodGroups.map(group => (

                <Picker.Item
                  key={group}
                  label={group}
                  value={group}
                />

              ))}

            </Picker>

          </View>

          <Text style={styles.label}>
            Niveau d'urgence *
          </Text>

          <View style={styles.pickerBox}>

            <Picker
              selectedValue={
                formData.urgency
              }
              onValueChange={value =>
                setFormData({
                  ...formData,
                  urgency: value,
                })
              }
            >

              {urgencyLevels.map(level => (

                <Picker.Item
                  key={level}
                  label={level}
                  value={level}
                />

              ))}

            </Picker>

          </View>

          <Text style={styles.label}>
            Ville *
          </Text>

          <View style={styles.pickerBox}>

            <Picker
              selectedValue={
                formData.city
              }
              onValueChange={value =>
                setFormData({
                  ...formData,
                  city: value,
                })
              }
            >

              {cities.map(city => (

                <Picker.Item
                  key={city}
                  label={city}
                  value={city}
                />

              ))}

            </Picker>

          </View>

          <Text style={styles.label}>
            Centre de don
          </Text>

          <View style={styles.pickerBox}>

            <Picker
              selectedValue={
                formData.center
              }
              onValueChange={value =>
                setFormData({
                  ...formData,
                  center: value,
                })
              }
            >

              {centers
                .filter(
                  item =>
                    item.city ===
                    formData.city
                )
                .map(center => (

                  <Picker.Item
                    key={center.id}
                    label={center.name}
                    value={center.name}
                  />

                ))}

            </Picker>

          </View>

          <Text style={styles.label}>
            Commentaire
          </Text>

          <TextInput
            multiline
            placeholder="Ex : Besoin urgent..."
            style={[
              styles.input,
              styles.commentInput,
            ]}
            value={formData.comment}
            onChangeText={text =>
              setFormData({
                ...formData,
                comment: text,
              })
            }
          />

          <Text style={styles.label}>
            Date de la demande
          </Text>

          <TouchableOpacity
            style={styles.dateBox}
            onPress={() =>
              setShowDatePicker(true)
            }
          >

            <Text style={styles.dateText}>
              {
                formData.requestDate
                  .toLocaleDateString(
                    "fr-FR"
                  )
              }
            </Text>

          </TouchableOpacity>

          {showDatePicker && (

            <DateTimePicker
              value={formData.requestDate}
              mode="date"
              display={
                Platform.OS === "ios"
                  ? "spinner"
                  : "default"
              }
              onChange={(
                event,
                selectedDate
              ) => {

                setShowDatePicker(false);

                if (selectedDate) {

                  setFormData({
                    ...formData,
                    requestDate:
                      selectedDate,
                  });
                }
              }}
            />
          )}

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickDocument}
          >

            <Text style={styles.uploadText}>
              📎 Joindre un justificatif
            </Text>

          </TouchableOpacity>

          {selectedFile && (

            <Text style={styles.fileName}>
              {selectedFile}
            </Text>

          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
          >

            <Text style={styles.submitText}>
              Soumettre
            </Text>

          </TouchableOpacity>

        </ScrollView>

      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  askButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  askText: {
    color: "#d62828",
    fontWeight: "700",
    marginLeft: 8,
  },

  filters: {
    flexDirection: "row",
  },

  filterBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },

  activeFilter: {
    backgroundColor: "#ef4444",
  },

  filterText: {
    fontWeight: "600",
    color: "#555",
  },

  activeFilterText: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 10,
  },

  statusBadge: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    color: "#b45309",
    fontWeight: "700",
    fontSize: 12,
  },

  blood: {
    color: "#dc2626",
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 16,
  },

  meta: {
    color: "#444",
    marginBottom: 8,
  },

  urgencyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  warning: {
    marginRight: 10,
  },

  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  urgencyText: {
    color: "#fff",
    fontWeight: "700",
  },

  critical: {
    backgroundColor: "#111",
  },

  high: {
    backgroundColor: "#dc2626",
  },

  medium: {
    backgroundColor: "#f97316",
  },

  low: {
    backgroundColor: "#2563eb",
  },

  date: {
    color: "#555",
    marginBottom: 12,
  },

  notes: {
    color: "#555",
    marginBottom: 18,
  },

  respondButton: {
    borderWidth: 1,
    borderColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  respondText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 16,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingTop: 25,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  reservation: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
  },

  profileBox: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
  },

  profileText: {
    fontWeight: "700",
    color: "#333",
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 8,
    color: "#222",
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    marginBottom: 18,
  },

  commentInput: {
    height: 110,
    textAlignVertical: "top",
  },

  dateBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },

  dateText: {
    color: "#333",
    fontSize: 15,
  },

  uploadButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },

  uploadText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  fileName: {
    color: "#444",
    marginBottom: 20,
    textAlign: "center",
  },

  submitBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});