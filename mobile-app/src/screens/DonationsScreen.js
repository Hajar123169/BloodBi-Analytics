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
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import DateTimePicker from "@react-native-community/datetimepicker";

import { Ionicons } from "@expo/vector-icons";

import * as Print from "expo-print";

import * as Sharing from "expo-sharing";

import {
  apiGet,
  apiPost,
} from "../api/client";

const fallback = [];

export default function DonationsScreen() {

  const [items, setItems] =
    useState(fallback);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  const [requests, setRequests] =
    useState([]);

  const [centers, setCenters] =
    useState([]);

  const [
    selectedRequest,
    setSelectedRequest,
  ] = useState("");

  const [
    selectedCenter,
    setSelectedCenter,
  ] = useState("");

  const [comment, setComment] =
    useState("");

  const [date, setDate] =
    useState(new Date());

  useEffect(() => {

    initScreen();

  }, []);

  async function initScreen() {

    try {

      setLoading(true);

      const profileData =
        await loadProfile();

      await loadRequests();

      await loadCenters();

      await loadDonations(
        profileData?.id
      );

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

        return data;
      }

      return null;

    } catch (error) {

      console.log(error);

      return null;
    }
  }

  async function loadDonations(
    donorIdParam = profile?.id
  ) {

    try {

      const data =
        await apiGet("/donations");

      if (Array.isArray(data)) {

        let filtered = data;

        if (donorIdParam) {

          filtered =
            data.filter(
              item =>
                item.donor?.id ===
                donorIdParam
            );
        }

        const sorted =
          filtered.sort(
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
          );

        setItems(sorted);
      }

    } catch (error) {

      console.log(error);

      setItems([]);
    }
  }

  async function loadRequests() {

    try {

      const data =
        await apiGet("/requests");

      if (Array.isArray(data)) {

        const pending =
          data.filter(
            item =>
              item.status ===
              "PENDING"
          );

        setRequests(pending);
      }

    } catch (error) {

      console.log(error);
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

        setSelectedCenter(
          data[0].name
        );
      }

    } catch (error) {

      console.log(error);
    }
  }

  function formatDate(dateValue) {

    if (!dateValue) {
      return "Date inconnue";
    }

    return new Date(dateValue)
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

    const seconds =
      "00";

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  function formatBloodType(type) {

    if (!type) {
      return "-";
    }

    return type
      .replace("_POS", "+")
      .replace("_NEG", "-");
  }

  function buildTicketHtml(
    donation
  ) {

    const donorName =
      donation?.donor?.fullName ||
      profile?.fullName ||
      "Donneur";

    const bloodType =
      formatBloodType(
        donation?.donor?.bloodType ||
        profile?.bloodType
      );

    const centerName =
      donation?.center?.name ||
      "Centre de don";

    const centerCity =
      donation?.center?.city ||
      "";

    const scheduledDate =
      donation?.scheduledAt ||
      date;

    const note =
      donation?.notes ||
      "Réservation de don de sang";

    const ticketNumber =
      donation?.id
        ? `DON-${donation.id}`
        : `DON-${Date.now()}`;

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 30px;
              color: #222;
            }

            .ticket {
              background-color: white;
              border-radius: 18px;
              padding: 30px;
              text-align: center;
              max-width: 620px;
              margin: 0 auto;
              box-shadow: 0 6px 18px rgba(0,0,0,0.12);
              border-top: 8px solid #dc2626;
            }

            .logo {
              width: 90px;
              height: 90px;
              border-radius: 45px;
              background-color: #dc2626;
              color: white;
              margin: 0 auto 18px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 42px;
              font-weight: bold;
            }

            .brand {
              color: #dc2626;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 8px;
            }

            .title {
              color: #dc2626;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 18px;
            }

            .hello {
              font-size: 16px;
              margin-bottom: 8px;
            }

            .thanks {
              font-size: 15px;
              color: #555;
              margin-bottom: 24px;
            }

            .date-box {
              border: 2px solid #dc2626;
              border-radius: 12px;
              padding: 16px 24px;
              display: inline-block;
              margin: 12px 0 24px 0;
              background-color: #fff5f5;
            }

            .date {
              color: #dc2626;
              font-size: 30px;
              font-weight: bold;
            }

            .info {
              margin-top: 18px;
              padding: 14px;
              background-color: #f9fafb;
              border-radius: 12px;
              text-align: left;
            }

            .row {
              margin-bottom: 10px;
              font-size: 15px;
            }

            .label {
              color: #555;
              font-weight: bold;
            }

            .value {
              color: #111;
              font-weight: bold;
            }

            .center {
              color: #dc2626;
              font-size: 20px;
              font-weight: bold;
              margin-top: 4px;
            }

            .footer {
              margin-top: 28px;
              color: #666;
              font-size: 13px;
              line-height: 1.6;
            }

            .ticket-number {
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>

        <body>
          <div class="ticket">

            <div class="logo">
              🩸
            </div>

            <div class="brand">
              BloodBI
            </div>

            <h1 class="title">
              🎫 Ticket de Don de Sang
            </h1>

            <p class="hello">
              Bonjour <strong>${donorName}</strong>
            </p>

            <p class="thanks">
              Merci pour votre générosité ❤️
            </p>

            <p>
              Votre réservation est confirmée pour le :
            </p>

            <div class="date-box">
              <div class="date">
                ${formatDate(scheduledDate)}
              </div>
            </div>

            <p>
              Centre de Don :
            </p>

            <div class="center">
              ${centerName}
            </div>

            <div class="info">
              <div class="row">
                <span class="label">Donneur :</span>
                <span class="value">${donorName}</span>
              </div>

              <div class="row">
                <span class="label">Groupe sanguin :</span>
                <span class="value">${bloodType}</span>
              </div>

              <div class="row">
                <span class="label">Ville :</span>
                <span class="value">${centerCity || "Non renseignée"}</span>
              </div>

              <div class="row">
                <span class="label">Statut :</span>
                <span class="value">${donation?.status || "PLANNED"}</span>
              </div>

              <div class="row">
                <span class="label">Commentaire :</span>
                <span class="value">${note}</span>
              </div>
            </div>

            <p class="footer">
              Veuillez vous présenter avec ce ticket au centre sélectionné.
              <br />
              Ce document confirme uniquement la réservation du don.
            </p>

            <p class="footer">
              — L’équipe BloodBI
            </p>

            <div class="ticket-number">
              Référence : ${ticketNumber}
            </div>

          </div>
        </body>
      </html>
    `;
  }

  async function generateTicket(
    donation
  ) {

    try {

      const html =
        buildTicketHtml(
          donation
        );

      const { uri } =
        await Print.printToFileAsync({
          html,
        });

      const isAvailable =
        await Sharing.isAvailableAsync();

      if (isAvailable) {

        await Sharing.shareAsync(uri, {
          mimeType:
            "application/pdf",
          UTI:
            "com.adobe.pdf",
          dialogTitle:
            "Télécharger le ticket de don",
        });

      } else {

        Alert.alert(
          "Ticket généré",
          `PDF créé ici : ${uri}`
        );
      }

    } catch (error) {

      console.log(
        "PDF ERROR:",
        error
      );

      Alert.alert(
        "Erreur",
        "Impossible de générer le ticket PDF"
      );
    }
  }

  async function handleReservation() {

    try {

      if (!profile?.id) {

        Alert.alert(
          "Erreur",
          "Profil donneur introuvable"
        );

        return;
      }

      const center =
        centers.find(
          item =>
            item.name ===
            selectedCenter
        );

      if (!center?.id) {

        Alert.alert(
          "Erreur",
          "Centre de don introuvable"
        );

        return;
      }

      const payload = {
        donor: {
          id: profile.id,
        },

        center: {
          id: center.id,
        },

        request: selectedRequest
          ? {
              id: Number(
                selectedRequest
              ),
            }
          : null,

        status: "PLANNED",

        scheduledAt:
          formatDateTimeForBackend(
            date
          ),

        donatedAt: null,

        notes: comment,
      };

      console.log(
        "DONATION PAYLOAD:",
        payload
      );

      const savedDonation =
        await apiPost(
          "/donations",
          payload
        );

      Alert.alert(
        "Succès",
        "Réservation enregistrée",
        [
          {
            text: "Télécharger le ticket",
            onPress: () =>
              generateTicket(
                savedDonation
              ),
          },
          {
            text: "OK",
            style: "cancel",
          },
        ]
      );

      setShowModal(false);

      setComment("");

      setSelectedRequest("");

      await loadDonations(
        profile.id
      );

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Erreur",
        "Impossible d'enregistrer la donation"
      );
    }
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

        {items.length === 0 ? (

          <View style={styles.emptyBox}>

            <Ionicons
              name="water-outline"
              size={46}
              color="#dc2626"
            />

            <Text style={styles.emptyTitle}>
              Aucun don enregistré
            </Text>

            <Text style={styles.emptyText}>
              Réservez votre premier don pour l'afficher ici.
            </Text>

          </View>

        ) : (

          items.map(
            (item, index) => (

              <View
                key={item.id || index}
                style={styles.card}
              >

                <View style={styles.cardHeader}>

                  <Text style={styles.name}>
                    {
                      item.donor?.fullName ||
                      profile?.fullName ||
                      "Donneur inconnu"
                    }
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "CANCELLED" &&
                        styles.cancelledBadge,
                      item.status === "PLANNED" &&
                        styles.plannedBadge,
                    ]}
                  >

                    <Text
                      style={[
                        styles.statusText,
                        item.status === "CANCELLED" &&
                          styles.cancelledText,
                        item.status === "PLANNED" &&
                          styles.plannedText,
                      ]}
                    >
                      ☑ {item.status}
                    </Text>

                  </View>

                </View>

                <Text style={styles.blood}>
                  🩸 {
                    formatBloodType(
                      item.donor?.bloodType ||
                      profile?.bloodType
                    )
                  }
                </Text>

                <Text style={styles.meta}>
                  🏥 {
                    item.center?.name ||
                    "Centre de don"
                  }
                </Text>

                <Text style={styles.date}>
                  📅 {
                    formatDate(
                      item.scheduledAt ||
                      item.donatedAt
                    )
                  }
                </Text>

                {item.notes ? (

                  <Text style={styles.note}>
                    💬 {item.notes}
                  </Text>

                ) : null}

                <TouchableOpacity
                  style={styles.ticketBtn}
                  onPress={() =>
                    generateTicket(item)
                  }
                >

                  <Ionicons
                    name="download-outline"
                    size={18}
                    color="#dc2626"
                  />

                  <Text style={styles.ticketText}>
                    Télécharger le ticket
                  </Text>

                </TouchableOpacity>

              </View>
            )
          )
        )}

      </ScrollView>

      <TouchableOpacity
        style={styles.reserveBtn}
        onPress={() =>
          setShowModal(true)
        }
      >

        <Ionicons
          name="calendar"
          size={20}
          color="#fff"
        />

        <Text style={styles.reserveText}>
          Réserver un Don
        </Text>

      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <View style={styles.modalHeader}>

              <Text style={styles.modalSmall}>
                Réservation
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowModal(false)
                }
              >

                <Ionicons
                  name="close"
                  size={26}
                  color="#555"
                />

              </TouchableOpacity>

            </View>

            <Text style={styles.modalTitle}>
              🩸 Réserver un Don
            </Text>

            <View style={styles.profileBox}>

              <Text style={styles.profileText}>
                Donneur : {
                  profile?.fullName ||
                  "Profil inconnu"
                }
              </Text>

              <Text style={styles.profileText}>
                Groupe : {
                  formatBloodType(
                    profile?.bloodType
                  )
                }
              </Text>

            </View>

            <View style={styles.pickerBox}>

              <Picker
                selectedValue={selectedRequest}
                onValueChange={value =>
                  setSelectedRequest(value)
                }
              >

                <Picker.Item
                  label="Lier à une demande (facultatif)"
                  value=""
                />

                {requests.map(req => (

                  <Picker.Item
                    key={req.id}
                    label={`${req.bloodType} - ${req.hospital}`}
                    value={String(req.id)}
                  />

                ))}

              </Picker>

            </View>

            <View style={styles.pickerBox}>

              <Picker
                selectedValue={selectedCenter}
                onValueChange={value =>
                  setSelectedCenter(value)
                }
              >

                {centers.map(center => (

                  <Picker.Item
                    key={center.id}
                    label={center.name}
                    value={center.name}
                  />

                ))}

              </Picker>

            </View>

            <Text style={styles.commentLabel}>
              💬 Commentaire (facultatif)
            </Text>

            <TextInput
              multiline
              placeholder="Ex : Je souhaite donner pour un membre de ma famille"
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.lastDonation}>

              <Text style={styles.lastDonationText}>
                🕓 Dernier don :
                <Text style={{ fontWeight: "700" }}>
                  {" "}
                  {
                    profile?.lastDonationDate
                      ? formatDate(
                          profile.lastDonationDate
                        )
                      : "Non renseigné"
                  }
                </Text>
              </Text>

            </View>

            <Text style={styles.dateLabel}>
              📅 Date de Don :
            </Text>

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() =>
                setShowDatePicker(true)
              }
            >

              <Text style={styles.dateText}>
                {formatDate(date)}
              </Text>

            </TouchableOpacity>

            {showDatePicker && (

              <DateTimePicker
                value={date}
                mode="date"
                display={
                  Platform.OS === "ios"
                    ? "spinner"
                    : "default"
                }
                minimumDate={new Date()}
                onChange={(
                  event,
                  selectedDate
                ) => {

                  setShowDatePicker(false);

                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />

            )}

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleReservation}
            >

              <Text style={styles.confirmText}>
                Confirmer la Réservation
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

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
    marginBottom: 20,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },

  statusBadge: {
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#22c55e",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  plannedBadge: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0284c7",
  },

  cancelledBadge: {
    backgroundColor: "#fee2e2",
    borderColor: "#dc2626",
  },

  statusText: {
    color: "#15803d",
    fontWeight: "700",
    fontSize: 12,
  },

  plannedText: {
    color: "#0369a1",
  },

  cancelledText: {
    color: "#b91c1c",
  },

  blood: {
    color: "#dc2626",
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 16,
  },

  meta: {
    color: "#333",
    marginBottom: 10,
  },

  date: {
    color: "#333",
  },

  note: {
    color: "#555",
    marginTop: 10,
  },

  ticketBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  ticketText: {
    color: "#dc2626",
    fontWeight: "700",
    marginLeft: 8,
  },

  reserveBtn: {
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },

  reserveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
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
    marginBottom: 10,
  },

  modalSmall: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    marginBottom: 16,
  },

  profileBox: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },

  profileText: {
    color: "#333",
    fontWeight: "600",
    marginBottom: 4,
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },

  commentLabel: {
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },

  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    height: 90,
    textAlignVertical: "top",
    marginBottom: 18,
  },

  lastDonation: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
  },

  lastDonationText: {
    color: "#444",
  },

  dateLabel: {
    marginBottom: 10,
    fontWeight: "600",
    color: "#333",
  },

  dateBox: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
  },

  dateText: {
    color: "#333",
    fontSize: 15,
  },

  confirmBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});