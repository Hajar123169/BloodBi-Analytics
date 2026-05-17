import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
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
  Legend
} from 'recharts';

const fallback = [
  {
    id: 1,
    fullName: 'Hajar Khomssi',
    bloodType: 'O_NEG',
    city: 'El Jadida',
    available: true,
    totalDonations: 4,
    phone: '0600000001',
    lastDonationDate: '2026-04-11',
    donationHistory: [
      { date: '2026-04-11', center: 'Centre El Jadida', component: 'WHOLE_BLOOD' },
      { date: '2025-12-02', center: 'Centre El Jadida', component: 'PLASMA' }
    ]
  },
  {
    id: 2,
    fullName: 'Sara Mahfoud',
    bloodType: 'A_POS',
    city: 'Casablanca',
    available: true,
    totalDonations: 6,
    phone: '0622222222',
    lastDonationDate: '2026-03-28',
    donationHistory: [
      { date: '2026-03-28', center: 'CNTS Casablanca', component: 'PLASMA' },
      { date: '2025-11-15', center: 'CNTS Casablanca', component: 'RED_CELLS' }
    ]
  },
  {
    id: 3,
    fullName: 'Adil Karimi',
    bloodType: 'AB_NEG',
    city: 'Rabat',
    available: false,
    totalDonations: 2,
    phone: '0611111111',
    lastDonationDate: '2026-02-05',
    donationHistory: [
      { date: '2026-02-05', center: 'Centre Régional Rabat', component: 'PLATELETS' }
    ]
  },
  {
    id: 4,
    fullName: 'Nabil Ouardi',
    bloodType: 'B_POS',
    city: 'Marrakech',
    available: true,
    totalDonations: 3,
    phone: '0633333333',
    lastDonationDate: '2026-01-19',
    donationHistory: [
      { date: '2026-01-19', center: 'Centre de Transfusion Marrakech', component: 'WHOLE_BLOOD' }
    ]
  },
  {
    id: 5,
    fullName: 'Fatima Azzouz',
    bloodType: 'O_POS',
    city: 'Casablanca',
    available: true,
    totalDonations: 7,
    phone: '0644444444',
    lastDonationDate: '2026-04-03',
    donationHistory: [
      { date: '2026-04-03', center: 'CNTS Casablanca', component: 'PLASMA' },
      { date: '2025-10-21', center: 'CNTS Casablanca', component: 'WHOLE_BLOOD' }
    ]
  }
];

function groupBy(data, key) {
  const counts = data.reduce((acc, item) => {
    const value = item[key] || 'Non défini';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value
  }));
}

function normalizeDonor(donor) {
  return {
    id: donor.id,
    fullName: donor.fullName || donor.name || '',
    bloodType: donor.bloodType || '',
    city: donor.city || '',
    available: donor.available ?? false,
    totalDonations: donor.totalDonations ?? 0,
    phone: donor.phone || 'Non renseigné',
    lastDonationDate: donor.lastDonationDate || donor.lastDonation || 'Non renseigné',
    donationHistory: donor.donationHistory || [
      {
        date: donor.lastDonationDate || donor.lastDonation || 'Non renseigné',
        center: donor.preferredCenter?.name || donor.centerName || 'Centre non renseigné',
        component: 'WHOLE_BLOOD'
      }
    ]
  };
}

export default function DonorStats() {
  const [donors, setDonors] = useState(fallback);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Toutes villes');
  const [selectedGroup, setSelectedGroup] = useState('Tous groupes');
  const [selectedDonor, setSelectedDonor] = useState(null);

  const COLORS = [
    '#dc2626',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#a855f7'
  ];

  useEffect(() => {
    api.get('/donors')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDonors(res.data.map(normalizeDonor));
        }
      })
      .catch(() => {
        setDonors(fallback);
      });
  }, []);

  const byBlood = useMemo(() => groupBy(donors, 'bloodType'), [donors]);
  const byCity = useMemo(() => groupBy(donors, 'city'), [donors]);

  const cities = useMemo(() => {
    return ['Toutes villes', ...new Set(donors.map((d) => d.city).filter(Boolean))];
  }, [donors]);

  const groups = useMemo(() => {
    return ['Tous groupes', ...new Set(donors.map((d) => d.bloodType).filter(Boolean))];
  }, [donors]);

  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      const matchesSearch = donor.fullName
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesCity =
        selectedCity === 'Toutes villes' || donor.city === selectedCity;

      const matchesGroup =
        selectedGroup === 'Tous groupes' || donor.bloodType === selectedGroup;

      return matchesSearch && matchesCity && matchesGroup;
    });
  }, [donors, search, selectedCity, selectedGroup]);

  return (
    <div>
      <h1>Donor Statistics</h1>

      <p className="subtitle">
        Analyse des donneurs par ville, disponibilité et groupe sanguin.
      </p>

      <div className="grid-2">
        <div className="panel donor-chart-panel">
          <h2>Répartition par groupe sanguin</h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={byBlood}
                dataKey="value"
                nameKey="name"
                outerRadius={105}
                label
              >
                {byBlood.map((entry, index) => (
                  <Cell
                    key={`blood-${entry.name}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="panel donor-chart-panel">
          <h2>Donneurs par ville</h2>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={byCity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1dada" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#d71920"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel donor-list-panel">
        <div className="donor-list-header">
          <h2>Liste des donneurs</h2>

          <div className="donor-filters">
            <div className="search-input-wrapper">
              <SearchIcon fontSize="small" />
              <input
                type="text"
                placeholder="Recherche par nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Groupe</th>
              <th>Ville</th>
              <th>Disponible</th>
              <th>Total dons</th>
              <th>Dernier don</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredDonors.map((donor, index) => (
              <tr key={donor.id || index}>
                <td>
                  <strong>{donor.fullName}</strong>
                </td>

                <td>
                  <span className="blood-badge">
                    {donor.bloodType}
                  </span>
                </td>

                <td>{donor.city}</td>

                <td className={donor.available ? 'status-yes' : 'status-no'}>
                  {donor.available ? 'Oui' : 'Non'}
                </td>

                <td>{donor.totalDonations}</td>

                <td>{donor.lastDonationDate}</td>

                <td>
                  <button
                    type="button"
                    className="profile-link-btn"
                    onClick={() => setSelectedDonor(donor)}
                  >
                    Profil
                  </button>
                </td>
              </tr>
            ))}

            {filteredDonors.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">
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
          onClick={() => setSelectedDonor(null)}
        >
          <div
            className="donor-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="donor-modal-close"
              onClick={() => setSelectedDonor(null)}
            >
              <CloseIcon />
            </button>

            <h2>{selectedDonor.fullName}</h2>

            <p className="donor-modal-subtitle">
              {selectedDonor.city} • {selectedDonor.phone}
            </p>

            <div className="donor-modal-info-grid">
              <div>
                <span>Groupe</span>
                <strong>{selectedDonor.bloodType}</strong>
              </div>

              <div>
                <span>Total dons</span>
                <strong>{selectedDonor.totalDonations}</strong>
              </div>

              <div>
                <span>Disponible</span>
                <strong>{selectedDonor.available ? 'Oui' : 'Non'}</strong>
              </div>
            </div>

            <div className="donor-history">
              <h3>Historique des dons</h3>

              <table>
                <tbody>
                  {selectedDonor.donationHistory.map((item, index) => (
                    <tr key={index}>
                      <td>{item.date}</td>
                      <td>{item.center}</td>
                      <td>{item.component}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="donor-modal-btn"
              onClick={() => setSelectedDonor(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}