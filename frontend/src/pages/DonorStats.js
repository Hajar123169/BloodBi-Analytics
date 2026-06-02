import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api";

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#dc2626",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
];

const fallback = [];

function formatDate(value) {
  if (!value) {
    return "Non renseigné";
  }

  return String(value)
    .replace("T", " ")
    .slice(0, 16);
}

function normalizeDonor(donor) {
  return {
    id: donor.id,
    fullName: donor.fullName || donor.name || "",
    bloodType: donor.bloodType || "",
    city: donor.city || "",
    available: donor.available ?? false,
    totalDonations: donor.totalDonations ?? 0,
    phone: donor.phone || "Non renseigné",
    email: donor.email || "Non renseigné",
    lastDonationDate:
      donor.lastDonationDate ||
      donor.lastDonation ||
      "Non renseigné",
    donationHistory:
      Array.isArray(donor.donationHistory)
        ? donor.donationHistory
        : [],
  };
}

export default function DonorStats() {
  const [donors, setDonors] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedCity, setSelectedCity] =
    useState("Toutes villes");

  const [selectedGroup, setSelectedGroup] =
    useState("Tous groupes");

  const [selectedDonor, setSelectedDonor] =
    useState(null);

  const [selectedRows, setSelectedRows] =
    useState([]);

  const [editingDonor, setEditingDonor] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    fetchDonors();
  }, []);

  async function fetchDonors() {
    setLoading(true);
    setMessage("");

    try {
      const [
        donorsRes,
        donationsRes,
      ] = await Promise.all([
        api.get("/donors"),
        api.get("/donations"),
      ]);

      const donorsData =
        Array.isArray(donorsRes.data)
          ? donorsRes.data
          : [];

      const donationsData =
        Array.isArray(donationsRes.data)
          ? donationsRes.data
          : [];

      const donorsWithHistory =
        donorsData.map((donor) => {
          const donorDonations =
            donationsData
              .filter(
                donation =>
                  donation.donor?.id ===
                  donor.id
              )
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
              );

          const lastDonation =
            donorDonations[0];

          return normalizeDonor({
            ...donor,

            totalDonations:
              donorDonations.length ||
              donor.totalDonations ||
              0,

            lastDonationDate:
              lastDonation?.scheduledAt ||
              lastDonation?.donatedAt ||
              donor.lastDonationDate ||
              donor.lastDonation ||
              "Non renseigné",

            donationHistory:
              donorDonations.map(
                donation => ({
                  id: donation.id,
                  date:
                    donation.scheduledAt ||
                    donation.donatedAt ||
                    "Non renseigné",
                  center:
                    donation.center?.name ||
                    "Centre non renseigné",
                  city:
                    donation.center?.city ||
                    donation.donor?.city ||
                    "",
                  status:
                    donation.status ||
                    "PLANNED",
                  notes:
                    donation.notes ||
                    "-",
                })
              ),
          });
        });

      setDonors(
        donorsWithHistory.length > 0
          ? donorsWithHistory
          : fallback
      );

    } catch (error) {
      console.error(
        "Erreur chargement donneurs:",
        error
      );

      setDonors(fallback);

      setMessage(
        "Erreur lors du chargement des donneurs."
      );

    } finally {
      setLoading(false);
    }
  }

  const byBlood =
    useMemo(() => {
      const counts =
        donors.reduce(
          (acc, donor) => {
            const bloodType =
              donor.bloodType ||
              "Non défini";

            acc[bloodType] =
              (acc[bloodType] || 0) + 1;

            return acc;
          },
          {}
        );

      return Object.entries(counts)
        .map(
          ([name, value]) => ({
            name,
            value,
          })
        );
    }, [donors]);

  const byCity =
    useMemo(() => {
      const counts =
        donors.reduce(
          (acc, donor) => {
            const city =
              donor.city ||
              "Non défini";

            acc[city] =
              (acc[city] || 0) + 1;

            return acc;
          },
          {}
        );

      return Object.entries(counts)
        .map(
          ([name, value]) => ({
            name,
            value,
          })
        );
    }, [donors]);

  const cities =
    useMemo(() => {
      return [
        "Toutes villes",
        ...new Set(
          donors
            .map(donor => donor.city)
            .filter(Boolean)
        ),
      ];
    }, [donors]);

  const groups =
    useMemo(() => {
      return [
        "Tous groupes",
        ...new Set(
          donors
            .map(donor => donor.bloodType)
            .filter(Boolean)
        ),
      ];
    }, [donors]);

  const filteredDonors =
    useMemo(() => {
      return donors.filter((donor) => {
        const query =
          search.toLowerCase();

        const matchesSearch =
          donor.fullName
            ?.toLowerCase()
            .includes(query) ||
          donor.email
            ?.toLowerCase()
            .includes(query) ||
          donor.phone
            ?.toLowerCase()
            .includes(query);

        const matchesCity =
          selectedCity ===
            "Toutes villes" ||
          donor.city ===
            selectedCity;

        const matchesGroup =
          selectedGroup ===
            "Tous groupes" ||
          donor.bloodType ===
            selectedGroup;

        return (
          matchesSearch &&
          matchesCity &&
          matchesGroup
        );
      });
    }, [
      donors,
      search,
      selectedCity,
      selectedGroup,
    ]);

  function handleSelectRow(id) {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  }

  function handleSelectAll() {
    if (
      selectedRows.length ===
        filteredDonors.length &&
      filteredDonors.length > 0
    ) {
      setSelectedRows([]);
    } else {
      setSelectedRows(
        filteredDonors.map(donor => donor.id)
      );
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce donneur ?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/donors/${id}`);

      setDonors(prev =>
        prev.filter(donor => donor.id !== id)
      );

      setSelectedRows(prev =>
        prev.filter(rowId => rowId !== id)
      );

      alert(
        "Donneur supprimé avec succès"
      );

    } catch (error) {
      console.error(
        "Erreur suppression:",
        error
      );

      alert(
        "Erreur lors de la suppression"
      );
    }
  }

  async function handleDeleteSelected() {
    if (selectedRows.length === 0) {
      alert(
        "Aucun élément sélectionné"
      );

      return;
    }

    if (
      !window.confirm(
        `Supprimer ${selectedRows.length} donneur(s) ?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedRows.map(id =>
          api.delete(`/donors/${id}`)
        )
      );

      setDonors(prev =>
        prev.filter(
          donor =>
            !selectedRows.includes(donor.id)
        )
      );

      setSelectedRows([]);

      alert(
        `${selectedRows.length} donneur(s) supprimé(s)`
      );

    } catch (error) {
      console.error(
        "Erreur suppression multiple:",
        error
      );

      alert(
        "Erreur lors de la suppression multiple"
      );
    }
  }

  async function handleUpdateDonor(updatedDonor) {
    try {
      const res =
        await api.put(
          `/donors/${updatedDonor.id}`,
          {
            id: updatedDonor.id,
            fullName: updatedDonor.fullName,
            bloodType: updatedDonor.bloodType,
            city: updatedDonor.city,
            phone: updatedDonor.phone,
            email: updatedDonor.email,
            available: updatedDonor.available,
            totalDonations:
              updatedDonor.totalDonations,
            lastDonationDate:
              updatedDonor.lastDonationDate,
          }
        );

      const normalized =
        normalizeDonor({
          ...res.data,
          donationHistory:
            updatedDonor.donationHistory ||
            [],
        });

      setDonors(prev =>
        prev.map(donor =>
          donor.id === updatedDonor.id
            ? normalized
            : donor
        )
      );

      setEditingDonor(null);

      alert(
        "Donneur mis à jour avec succès"
      );

    } catch (error) {
      console.error(
        "Erreur mise à jour:",
        error
      );

      alert(
        "Erreur lors de la mise à jour"
      );
    }
  }

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
        }}
      >
        Chargement des donneurs...
      </div>
    );
  }

  return (
    <div>
      <h1>Donor Statistics</h1>

      <p className="subtitle">
        Analyse des donneurs par ville,
        disponibilité, groupe sanguin et
        réservations.
      </p>

      {message && (
        <div
          className="info-message"
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#fee2e2",
            borderRadius: "8px",
            color: "#991b1b",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}
      >
        <button
          onClick={fetchDonors}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Rafraîchir
        </button>
      </div>

      <div className="grid-2">
        <div className="panel donor-chart-panel">
          <h2>
            Répartition par groupe sanguin
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <PieChart>
              <Pie
                data={byBlood}
                dataKey="value"
                nameKey="name"
                outerRadius={105}
                label
              >
                {byBlood.map(
                  (entry, index) => (
                    <Cell
                      key={`blood-${entry.name}`}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="panel donor-chart-panel">
          <h2>Donneurs par ville</h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart
              data={byCity}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1dada"
              />

              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{
                  fontSize: 11,
                }}
              />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#d71920"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel donor-list-panel">
        <div className="donor-list-header">
          <h2>
            Liste des donneurs (
            {filteredDonors.length})
          </h2>

          <div className="donor-filters">
            <div className="search-input-wrapper">
              <SearchIcon fontSize="small" />

              <input
                type="text"
                placeholder="Recherche par nom, email ou téléphone..."
                value={search}
                onChange={e =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <select
              value={selectedCity}
              onChange={e =>
                setSelectedCity(
                  e.target.value
                )
              }
            >
              {cities.map(city => (
                <option key={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={selectedGroup}
              onChange={e =>
                setSelectedGroup(
                  e.target.value
                )
              }
            >
              {groups.map(group => (
                <option key={group}>
                  {group}
                </option>
              ))}
            </select>

            {selectedRows.length > 0 && (
              <button
                onClick={
                  handleDeleteSelected
                }
                style={{
                  backgroundColor:
                    "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Supprimer (
                {selectedRows.length})
              </button>
            )}
          </div>
        </div>

        <table className="reports-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length ===
                      filteredDonors.length &&
                    filteredDonors.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>

              <th>Nom</th>
              <th>Groupe</th>
              <th>Ville</th>
              <th>Disponible</th>
              <th>Total réservations</th>
              <th>Dernière réservation</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDonors.map(donor => (
              <tr
                key={donor.id}
                className={
                  selectedRows.includes(
                    donor.id
                  )
                    ? "row-selected"
                    : ""
                }
              >
                <td>
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.includes(
                        donor.id
                      )
                    }
                    onChange={() =>
                      handleSelectRow(
                        donor.id
                      )
                    }
                  />
                </td>

                <td>
                  <strong>
                    {donor.fullName}
                  </strong>
                </td>

                <td>
                  <span className="blood-badge">
                    {donor.bloodType}
                  </span>
                </td>

                <td>{donor.city}</td>

                <td
                  className={
                    donor.available
                      ? "status-yes"
                      : "status-no"
                  }
                >
                  {donor.available
                    ? "Oui"
                    : "Non"}
                </td>

                <td>
                  {
                    donor.donationHistory
                      .length ||
                    donor.totalDonations ||
                    0
                  }
                </td>

                <td>
                  {formatDate(
                    donor.lastDonationDate
                  )}
                </td>

                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() =>
                        setSelectedDonor(
                          donor
                        )
                      }
                      style={{
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                      title="Voir profil"
                    >
                      👁️
                    </button>

                    <button
                      onClick={() =>
                        setEditingDonor(
                          donor
                        )
                      }
                      style={{
                        background: "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                      title="Modifier"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          donor.id
                        )
                      }
                      style={{
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredDonors.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="empty-row"
                >
                  Aucun donneur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedDonor && (
        <div
          className="donor-modal-overlay"
          onClick={() =>
            setSelectedDonor(null)
          }
        >
          <div
            className="donor-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              className="donor-modal-close"
              onClick={() =>
                setSelectedDonor(null)
              }
            >
              <CloseIcon />
            </button>

            <h2>
              {selectedDonor.fullName}
            </h2>

            <p className="donor-modal-subtitle">
              {selectedDonor.city} •{" "}
              {selectedDonor.phone} •{" "}
              {selectedDonor.email}
            </p>

            <div className="donor-modal-info-grid">
              <div>
                <span>Groupe</span>
                <strong>
                  {selectedDonor.bloodType}
                </strong>
              </div>

              <div>
                <span>
                  Total réservations
                </span>
                <strong>
                  {
                    selectedDonor
                      .donationHistory
                      .length ||
                    selectedDonor
                      .totalDonations ||
                    0
                  }
                </strong>
              </div>

              <div>
                <span>Disponible</span>
                <strong>
                  {selectedDonor.available
                    ? "Oui"
                    : "Non"}
                </strong>
              </div>
            </div>

            <div className="donor-history">
              <h3>
                Historique des réservations
              </h3>

              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Centre</th>
                    <th>Ville</th>
                    <th>Statut</th>
                    <th>Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedDonor
                    .donationHistory
                    .length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        Aucun historique de
                        réservation.
                      </td>
                    </tr>
                  ) : (
                    selectedDonor
                      .donationHistory
                      .map(
                        (item, index) => (
                          <tr key={item.id || index}>
                            <td>
                              {formatDate(
                                item.date
                              )}
                            </td>

                            <td>
                              {item.center}
                            </td>

                            <td>
                              {item.city || "-"}
                            </td>

                            <td>
                              {item.status}
                            </td>

                            <td>
                              {item.notes || "-"}
                            </td>
                          </tr>
                        )
                      )
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="donor-modal-btn"
              onClick={() =>
                setSelectedDonor(null)
              }
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {editingDonor && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor:
              "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "500px",
              maxWidth: "90%",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Modifier le donneur
            </h2>

            <div>
              <label>Nom complet</label>

              <input
                type="text"
                value={
                  editingDonor.fullName
                }
                onChange={e =>
                  setEditingDonor({
                    ...editingDonor,
                    fullName:
                      e.target.value,
                  })
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>Groupe sanguin</label>

              <select
                value={
                  editingDonor.bloodType
                }
                onChange={e =>
                  setEditingDonor({
                    ...editingDonor,
                    bloodType:
                      e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option value="O_NEG">
                  O_NEG
                </option>
                <option value="O_POS">
                  O_POS
                </option>
                <option value="A_NEG">
                  A_NEG
                </option>
                <option value="A_POS">
                  A_POS
                </option>
                <option value="B_NEG">
                  B_NEG
                </option>
                <option value="B_POS">
                  B_POS
                </option>
                <option value="AB_NEG">
                  AB_NEG
                </option>
                <option value="AB_POS">
                  AB_POS
                </option>
              </select>
            </div>

            <div>
              <label>Ville</label>

              <input
                type="text"
                value={
                  editingDonor.city
                }
                onChange={e =>
                  setEditingDonor({
                    ...editingDonor,
                    city:
                      e.target.value,
                  })
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>Téléphone</label>

              <input
                type="text"
                value={
                  editingDonor.phone
                }
                onChange={e =>
                  setEditingDonor({
                    ...editingDonor,
                    phone:
                      e.target.value,
                  })
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>Email</label>

              <input
                type="email"
                value={
                  editingDonor.email
                }
                onChange={e =>
                  setEditingDonor({
                    ...editingDonor,
                    email:
                      e.target.value,
                  })
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>Disponible</label>

              <select
                value={
                  editingDonor.available
                }
                onChange={e =>
                  setEditingDonor({
                    ...editingDonor,
                    available:
                      e.target.value ===
                      "true",
                  })
                }
                style={inputStyle}
              >
                <option value="true">
                  Oui
                </option>
                <option value="false">
                  Non
                </option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() =>
                  setEditingDonor(null)
                }
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    "#e2e8f0",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>

              <button
                onClick={() =>
                  handleUpdateDonor(
                    editingDonor
                  )
                }
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px",
  margin: "8px 0",
  borderRadius: "6px",
  border: "1px solid #ccc",
};