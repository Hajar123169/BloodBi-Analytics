import React, { useEffect, useMemo, useState } from 'react';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import api from '../api';

const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'DONE', 'CANCELLED'];

function dateTimeValue(days = 1) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatDate(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 16);
}

function getStatusClass(status) {
  return `status-pill ${String(status || '').toLowerCase()}`;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [centers, setCenters] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    donorId: '',
    requestId: '',
    centerId: '',
    scheduledAt: dateTimeValue(1),
    notes: ''
  });

  async function loadData() {
    setLoading(true);
    setMessage('');

    try {
      const [appointmentsRes, donorsRes, requestsRes, centersRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/donors'),
        api.get('/requests'),
        api.get('/centers')
      ]);

      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      setDonors(Array.isArray(donorsRes.data) ? donorsRes.data : []);
      setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
      setCenters(Array.isArray(centersRes.data) ? centersRes.data : []);
    } catch (error) {
      setMessage('Impossible de charger les rendez-vous. Vérifiez que le backend est lancé.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const statusOk = statusFilter === 'ALL' || appointment.status === statusFilter;

      const text = [
        appointment.donor?.fullName,
        appointment.donor?.bloodType,
        appointment.request?.patientName,
        appointment.request?.bloodType,
        appointment.center?.name,
        appointment.center?.city,
        appointment.notes
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return statusOk && (!query || text.includes(query));
    });
  }, [appointments, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      pending: appointments.filter((a) => a.status === 'PENDING').length,
      confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
      done: appointments.filter((a) => a.status === 'DONE').length,
      cancelled: appointments.filter((a) => a.status === 'CANCELLED').length
    };
  }, [appointments]);

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  async function createAppointment(e) {
    e.preventDefault();

    if (!form.donorId) {
      setMessage('Choisissez un donneur avant de créer le rendez-vous.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const payload = {
        donor: { id: Number(form.donorId) },
        scheduledAt: form.scheduledAt,
        notes: form.notes
      };

      if (form.requestId) {
        payload.request = { id: Number(form.requestId) };
      }

      if (form.centerId) {
        payload.center = { id: Number(form.centerId) };
      }

      await api.post('/appointments', payload);

      setForm({
        donorId: '',
        requestId: '',
        centerId: '',
        scheduledAt: dateTimeValue(1),
        notes: ''
      });

      setMessage('Rendez-vous ajouté avec succès.');
      loadData();
    } catch (error) {
      setMessage('Erreur pendant la création du rendez-vous. Vérifiez les données saisies.');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id, action) {
    setMessage('');

    try {
      await api.patch(`/appointments/${id}/${action}`);

      setMessage(
        action === 'complete'
          ? 'Rendez-vous terminé : une donation a été créée automatiquement et la demande peut être satisfaite.'
          : 'Statut du rendez-vous mis à jour.'
      );

      loadData();
    } catch (error) {
      setMessage('Impossible de modifier ce rendez-vous.');
    }
  }

  return (
    <div>
      <h1>Gestion des rendez-vous</h1>

      <p className="subtitle">
        Planification, confirmation, annulation et validation des rendez-vous de donation liés aux donneurs,
        centres et demandes de sang.
      </p>

      <div className="kpi-grid appointment-kpis">
        <div className="kpi-card">
          <div className="kpi-label">En attente</div>
          <div className="kpi-value">{stats.pending}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Confirmés</div>
          <div className="kpi-value">{stats.confirmed}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Terminés</div>
          <div className="kpi-value">{stats.done}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Annulés</div>
          <div className="kpi-value">{stats.cancelled}</div>
        </div>
      </div>

      <div className="panel">
        <h2>Nouveau rendez-vous</h2>

        <form className="form-grid appointments-form" onSubmit={createAppointment}>
          <label>
            Donneur
            <select
              value={form.donorId}
              onChange={(e) => updateForm('donorId', e.target.value)}
              required
            >
              <option value="">Choisir un donneur</option>
              {donors.map((donor) => (
                <option key={donor.id} value={donor.id}>
                  {donor.fullName} · {donor.bloodType} · {donor.city}
                </option>
              ))}
            </select>
          </label>

          <label>
            Demande de sang
            <select
              value={form.requestId}
              onChange={(e) => updateForm('requestId', e.target.value)}
            >
              <option value="">Sans demande liée</option>
              {requests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.patientName} · {request.bloodType} · {request.status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Centre
            <select
              value={form.centerId}
              onChange={(e) => updateForm('centerId', e.target.value)}
            >
              <option value="">Centre automatique</option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name} · {center.city}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date et heure
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => updateForm('scheduledAt', e.target.value)}
              required
            />
          </label>

          <label>
            Notes
            <input
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              placeholder="Ex: appeler le donneur avant le rendez-vous"
            />
          </label>

          <button type="submit" disabled={submitting}>
            <AddIcon /> {submitting ? 'Ajout...' : 'Ajouter rendez-vous'}
          </button>
        </form>

        {message && <div className="info-message">{message}</div>}
      </div>

      <div className="panel">
        <div className="panel-actions filters-row">
          <h2>Liste des rendez-vous</h2>

          <div className="filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher donneur, patient, centre..."
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <EventAvailableIcon fontSize="large" />
            <p>Chargement des rendez-vous...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <EventAvailableIcon fontSize="large" />
            <p>Aucun rendez-vous trouvé.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Donneur</th>
                <th>Demande</th>
                <th>Centre</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    <strong>{appointment.donor?.fullName || '-'}</strong>
                    <br />
                    <span className="blood-chip">
                      {appointment.donor?.bloodType || '-'}
                    </span>
                  </td>

                  <td>
                    {appointment.request
                      ? `${appointment.request.patientName} · ${appointment.request.bloodType}`
                      : '-'}
                  </td>

                  <td>
                    {appointment.center
                      ? `${appointment.center.name} · ${appointment.center.city}`
                      : '-'}
                  </td>

                  <td>{formatDate(appointment.scheduledAt)}</td>

                  <td>
                    <span className={getStatusClass(appointment.status)}>
                      {appointment.status}
                    </span>
                  </td>

                  <td>{appointment.contactPhone || appointment.donor?.phone || '-'}</td>

                  <td>
                    <div className="table-actions appointment-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        disabled={appointment.status !== 'PENDING'}
                        onClick={() => updateStatus(appointment.id, 'confirm')}
                      >
                        <CheckCircleIcon /> Confirmer
                      </button>

                      <button
                        type="button"
                        className="success-btn"
                        disabled={!['PENDING', 'CONFIRMED'].includes(appointment.status)}
                        onClick={() => updateStatus(appointment.id, 'complete')}
                      >
                        <DoneAllIcon /> Terminer
                      </button>

                      <button
                        type="button"
                        className="danger-btn"
                        disabled={['DONE', 'CANCELLED'].includes(appointment.status)}
                        onClick={() => updateStatus(appointment.id, 'cancel')}
                      >
                        <CancelIcon /> Annuler
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}