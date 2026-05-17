import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import DownloadIcon from '@mui/icons-material/Download';

const fallback = [
  {
    id: 1,
    patientName: 'Patient A',
    bloodType: 'O_NEG',
    urgency: 'CRITICAL',
    status: 'PENDING',
    hospital: 'CHU Ibn Rochd',
    city: 'Casablanca',
    quantity: 4,
    requestDate: '2026-05-13'
  },
  {
    id: 2,
    patientName: 'Patient B',
    bloodType: 'AB_NEG',
    urgency: 'HIGH',
    status: 'PENDING',
    hospital: 'Hopital Ibn Rochd',
    city: 'Casablanca',
    quantity: 2,
    requestDate: '2026-05-12'
  },
  {
    id: 3,
    patientName: 'Patient C',
    bloodType: 'A_POS',
    urgency: 'MEDIUM',
    status: 'FULFILLED',
    hospital: 'Hopital Mohammed V',
    city: 'El Jadida',
    quantity: 3,
    requestDate: '2026-05-10'
  },
  {
    id: 4,
    patientName: 'Patient D',
    bloodType: 'B_POS',
    urgency: 'LOW',
    status: 'CANCELLED',
    hospital: 'Clinique Atlas',
    city: 'Marrakech',
    quantity: 1,
    requestDate: '2026-05-08'
  },
  {
    id: 5,
    patientName: 'Patient E',
    bloodType: 'O_POS',
    urgency: 'HIGH',
    status: 'PENDING',
    hospital: 'CHU Hassan II',
    city: 'Fes',
    quantity: 5,
    requestDate: '2026-05-13'
  },
  {
    id: 6,
    patientName: 'Patient F',
    bloodType: 'A_NEG',
    urgency: 'CRITICAL',
    status: 'FULFILLED',
    hospital: 'Hopital Militaire',
    city: 'Rabat',
    quantity: 2,
    requestDate: '2026-05-11'
  }
];

function normalizeRequest(request) {
  return {
    id: request.id,
    patientName: request.patientName || request.patient || 'Patient non renseigné',
    bloodType: request.bloodType || 'Non défini',
    urgency: request.urgency || 'LOW',
    status: request.status || 'PENDING',
    hospital: request.hospital || request.hospitalName || 'Hôpital non renseigné',
    city: request.city || 'Ville non renseignée',
    quantity: Number(request.quantity || request.unitsNeeded || request.units || 1),
    requestDate:
      request.requestDate ||
      request.createdAt?.substring?.(0, 10) ||
      request.date ||
      'Non renseigné'
  };
}

function getUrgencyClass(urgency) {
  const value = String(urgency || '').toLowerCase();

  if (value === 'critical') return 'badge critical';
  if (value === 'high') return 'badge high';
  if (value === 'medium') return 'badge medium';
  if (value === 'low') return 'badge low';

  return 'badge low';
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase();

  if (value === 'pending') return 'request-status status-pending';
  if (value === 'fulfilled') return 'request-status status-fulfilled';
  if (value === 'cancelled') return 'request-status status-cancelled';

  return 'request-status status-pending';
}

export default function BloodRequests() {
  const [items, setItems] = useState(fallback);
  const [urgencyFilter, setUrgencyFilter] = useState('Toute urgence');
  const [statusFilter, setStatusFilter] = useState('Tout statut');
  const [cityFilter, setCityFilter] = useState('Toutes villes');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('Tous groupes');

  useEffect(() => {
    api.get('/requests')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setItems(res.data.map(normalizeRequest));
        }
      })
      .catch(() => {
        setItems(fallback);
      });
  }, []);

  const urgencies = useMemo(() => {
    return ['Toute urgence', ...new Set(items.map((item) => item.urgency).filter(Boolean))];
  }, [items]);

  const statuses = useMemo(() => {
    return ['Tout statut', ...new Set(items.map((item) => item.status).filter(Boolean))];
  }, [items]);

  const cities = useMemo(() => {
    return ['Toutes villes', ...new Set(items.map((item) => item.city).filter(Boolean))];
  }, [items]);

  const bloodTypes = useMemo(() => {
    return ['Tous groupes', ...new Set(items.map((item) => item.bloodType).filter(Boolean))];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesUrgency =
        urgencyFilter === 'Toute urgence' || item.urgency === urgencyFilter;

      const matchesStatus =
        statusFilter === 'Tout statut' || item.status === statusFilter;

      const matchesCity =
        cityFilter === 'Toutes villes' || item.city === cityFilter;

      const matchesBloodType =
        bloodTypeFilter === 'Tous groupes' || item.bloodType === bloodTypeFilter;

      return matchesUrgency && matchesStatus && matchesCity && matchesBloodType;
    });
  }, [items, urgencyFilter, statusFilter, cityFilter, bloodTypeFilter]);

  const handleExport = () => {
    if (!filteredItems.length) {
      alert('Aucune demande à exporter.');
      return;
    }

    const headers = [
      'Patient',
      'Groupe',
      'Urgence',
      'Statut',
      'Hôpital',
      'Ville',
      'Quantité',
      'Date'
    ];

    const rows = filteredItems.map((item) => [
      item.patientName,
      item.bloodType,
      item.urgency,
      item.status,
      item.hospital,
      item.city,
      item.quantity,
      item.requestDate
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'bloodbi_requests.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Blood Requests</h1>

      <p className="subtitle">
        Suivi des demandes de sang selon le groupe, l'urgence, le statut et la ville.
      </p>

      <div className="panel requests-panel">
        <div className="requests-header">
          <h2>Demandes ({filteredItems.length})</h2>

          <div className="requests-actions">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
            >
              {urgencies.map((urgency) => (
                <option key={urgency} value={urgency}>
                  {urgency}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
            >
              {bloodTypes.map((bloodType) => (
                <option key={bloodType} value={bloodType}>
                  {bloodType}
                </option>
              ))}
            </select>

            <button type="button" className="request-export-btn" onClick={handleExport}>
              <DownloadIcon fontSize="small" />
              Export
            </button>
          </div>
        </div>

        <table className="requests-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Groupe</th>
              <th>Urgence</th>
              <th>Statut</th>
              <th>Hôpital</th>
              <th>Ville</th>
              <th>Qté</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((request, index) => (
              <tr key={request.id || index}>
                <td>
                  <strong>{request.patientName}</strong>
                </td>

                <td>
                  <span className="blood-badge">
                    {request.bloodType}
                  </span>
                </td>

                <td>
                  <span className={getUrgencyClass(request.urgency)}>
                    {request.urgency}
                  </span>
                </td>

                <td>
                  <span className={getStatusClass(request.status)}>
                    {request.status}
                  </span>
                </td>

                <td>{request.hospital}</td>
                <td>{request.city}</td>
                <td>{request.quantity}</td>
                <td>{request.requestDate}</td>
              </tr>
            ))}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-row">
                  Aucune demande trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}