import React, { useEffect, useMemo, useState } from 'react';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
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
  switch (status) {
    case 'PENDING': return 'status-pill pending';
    case 'CONFIRMED': return 'status-pill confirmed';
    case 'DONE': return 'status-pill done';
    case 'CANCELLED': return 'status-pill cancelled';
    default: return 'status-pill';
  }
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
  const [updatingId, setUpdatingId] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [form, setForm] = useState({
    donorId: '',
    requestId: '',
    centerId: '',
    scheduledAt: dateTimeValue(1),
    notes: ''
  });

  async function loadData() {
    setLoading(true);
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
      console.error('Erreur:', error);
      setMessage('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredAppointments = useMemo(() => {
    const query = search.toLowerCase();
    return appointments.filter((a) => {
      const statusOk = statusFilter === 'ALL' || a.status === statusFilter;
      const text = `${a.donor?.fullName || ''} ${a.donor?.bloodType || ''} ${a.request?.patientName || ''} ${a.center?.name || ''}`.toLowerCase();
      return statusOk && (!query || text.includes(query));
    });
  }, [appointments, search, statusFilter]);

  const stats = {
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    done: appointments.filter(a => a.status === 'DONE').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length
  };

  async function createAppointment(e) {
    e.preventDefault();
    if (!form.donorId) {
      setMessage('Choisissez un donneur');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        donor: { id: Number(form.donorId) },
        scheduledAt: form.scheduledAt,
        notes: form.notes
      };
      if (form.requestId) payload.request = { id: Number(form.requestId) };
      if (form.centerId) payload.center = { id: Number(form.centerId) };
      
      await api.post('/appointments', payload);
      setForm({ ...form, donorId: '', requestId: '', centerId: '', notes: '' });
      setMessage('Rendez-vous ajouté avec succès');
      await loadData();
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id, action) {
    setUpdatingId(id);
    try {
      await api.patch(`/appointments/${id}/${action}`);
      const actionMessages = {
        confirm: 'Rendez-vous confirmé',
        cancel: 'Rendez-vous annulé',
        complete: 'Rendez-vous terminé'
      };
      setMessage(actionMessages[action] || 'Action effectuée');
      await loadData();
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors de l\'action');
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateAppointment(updatedAppointment) {
    setUpdatingId(updatedAppointment.id);
    try {
      const payload = {
        donor: updatedAppointment.donor ? { id: updatedAppointment.donor.id } : null,
        request: updatedAppointment.request ? { id: updatedAppointment.request.id } : null,
        center: updatedAppointment.center ? { id: updatedAppointment.center.id } : null,
        scheduledAt: updatedAppointment.scheduledAt,
        status: updatedAppointment.status,
        notes: updatedAppointment.notes
      };
      
      await api.put(`/appointments/${updatedAppointment.id}`, payload);
      setMessage('Rendez-vous modifié avec succès');
      setEditingAppointment(null);
      await loadData();
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors de la modification');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1>Gestion des rendez-vous</h1>
      <p className="subtitle">Planification, confirmation, annulation et validation des rendez-vous de donation.</p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          <RefreshIcon fontSize="small" /> Rafraîchir
        </button>
      </div>

      <div className="kpi-grid appointment-kpis">
        <div className="kpi-card"><div className="kpi-label">En attente</div><div className="kpi-value">{stats.pending}</div></div>
        <div className="kpi-card"><div className="kpi-label">Confirmés</div><div className="kpi-value">{stats.confirmed}</div></div>
        <div className="kpi-card"><div className="kpi-label">Terminés</div><div className="kpi-value">{stats.done}</div></div>
        <div className="kpi-card"><div className="kpi-label">Annulés</div><div className="kpi-value">{stats.cancelled}</div></div>
      </div>

      {/* Formulaire d'ajout */}
      <div className="panel">
        <h2>Nouveau rendez-vous</h2>
        <form className="form-grid appointments-form" onSubmit={createAppointment}>
          <label>Donneur *
            <select value={form.donorId} onChange={(e) => setForm({...form, donorId: e.target.value})} required>
              <option value="">Choisir un donneur</option>
              {donors.map(d => <option key={d.id} value={d.id}>{d.fullName} · {d.bloodType} · {d.city}</option>)}
            </select>
          </label>
          <label>Demande
            <select value={form.requestId} onChange={(e) => setForm({...form, requestId: e.target.value})}>
              <option value="">Sans demande</option>
              {requests.map(r => <option key={r.id} value={r.id}>{r.patientName} · {r.bloodType}</option>)}
            </select>
          </label>
          <label>Centre
            <select value={form.centerId} onChange={(e) => setForm({...form, centerId: e.target.value})}>
              <option value="">Automatique</option>
              {centers.map(c => <option key={c.id} value={c.id}>{c.name} · {c.city}</option>)}
            </select>
          </label>
          <label>Date
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({...form, scheduledAt: e.target.value})} required />
          </label>
          <label>Notes
            <input value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Notes..." />
          </label>
          <button type="submit" disabled={submitting}><AddIcon /> {submitting ? 'Ajout...' : 'Ajouter'}</button>
        </form>
        {message && <div className="info-message" style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e2e8f0', borderRadius: '8px' }}>{message}</div>}
      </div>

      {/* Liste des rendez-vous */}
      <div className="panel">
        <div className="panel-actions filters-row">
          <h2>Liste des rendez-vous ({filteredAppointments.length})</h2>
          <div className="filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." />
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><EventAvailableIcon fontSize="large" /><p>Chargement...</p></div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state"><EventAvailableIcon fontSize="large" /><p>Aucun rendez-vous</p></div>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Donneur</th>
                <th>Demande</th>
                <th>Centre</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((app) => (
                <tr key={app.id} style={{ opacity: updatingId === app.id ? 0.6 : 1 }}>
                  <td>
                    <strong>{app.donor?.fullName || '-'}</strong>
                    <br />
                    <span className="blood-badge">{app.donor?.bloodType || '-'}</span>
                  </td>
                  <td>
                    {app.request ? `${app.request.patientName} · ${app.request.bloodType}` : '-'}
                  </td>
                  <td>
                    {app.center ? `${app.center.name} · ${app.center.city}` : '-'}
                  </td>
                  <td>{formatDate(app.scheduledAt)}</td>
                  <td><span className={getStatusClass(app.status)}>{app.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => updateStatus(app.id, 'confirm')}
                        disabled={app.status !== 'PENDING' || updatingId === app.id}
                        style={{ background: app.status !== 'PENDING' || updatingId === app.id ? '#9ca3af' : '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Confirmer
                      </button>
                      <button 
                        onClick={() => updateStatus(app.id, 'complete')}
                        disabled={!['PENDING', 'CONFIRMED'].includes(app.status) || updatingId === app.id}
                        style={{ background: !['PENDING', 'CONFIRMED'].includes(app.status) || updatingId === app.id ? '#9ca3af' : '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Terminer
                      </button>
                      <button 
                        onClick={() => updateStatus(app.id, 'cancel')}
                        disabled={app.status === 'DONE' || app.status === 'CANCELLED' || updatingId === app.id}
                        style={{ background: app.status === 'DONE' || app.status === 'CANCELLED' || updatingId === app.id ? '#9ca3af' : '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Annuler
                      </button>
                      <button 
                        onClick={() => setEditingAppointment(app)}
                        disabled={updatingId === app.id}
                        style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        <EditIcon fontSize="small" /> Modifier
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de modification avec STATUT */}
      {editingAppointment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0 }}>Modifier le rendez-vous</h2>
            
            {/* Donneur */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Donneur</label>
              <select 
                value={editingAppointment.donor?.id || ''} 
                onChange={(e) => setEditingAppointment({
                  ...editingAppointment, 
                  donor: donors.find(d => d.id === parseInt(e.target.value))
                })}
                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">Choisir un donneur</option>
                {donors.map(d => <option key={d.id} value={d.id}>{d.fullName} · {d.bloodType} · {d.city}</option>)}
              </select>
            </div>

            {/* Demande de sang */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Demande de sang</label>
              <select 
                value={editingAppointment.request?.id || ''} 
                onChange={(e) => setEditingAppointment({
                  ...editingAppointment, 
                  request: requests.find(r => r.id === parseInt(e.target.value))
                })}
                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">Sans demande</option>
                {requests.map(r => <option key={r.id} value={r.id}>{r.patientName} · {r.bloodType}</option>)}
              </select>
            </div>

            {/* Centre */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Centre</label>
              <select 
                value={editingAppointment.center?.id || ''} 
                onChange={(e) => setEditingAppointment({
                  ...editingAppointment, 
                  center: centers.find(c => c.id === parseInt(e.target.value))
                })}
                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">Automatique</option>
                {centers.map(c => <option key={c.id} value={c.id}>{c.name} · {c.city}</option>)}
              </select>
            </div>

            {/* Date et heure */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Date et heure</label>
              <input 
                type="datetime-local" 
                value={editingAppointment.scheduledAt ? new Date(editingAppointment.scheduledAt).toISOString().slice(0, 16) : ''} 
                onChange={(e) => setEditingAppointment({...editingAppointment, scheduledAt: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            {/* STATUT - AJOUTÉ */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Statut</label>
              <select 
                value={editingAppointment.status || 'PENDING'} 
                onChange={(e) => setEditingAppointment({...editingAppointment, status: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="PENDING">En attente (PENDING)</option>
                <option value="CONFIRMED">Confirmé (CONFIRMED)</option>
                <option value="DONE">Terminé (DONE)</option>
                <option value="CANCELLED">Annulé (CANCELLED)</option>
              </select>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Notes</label>
              <input 
                type="text" 
                value={editingAppointment.notes || ''} 
                onChange={(e) => setEditingAppointment({...editingAppointment, notes: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setEditingAppointment(null)} 
                style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button 
                onClick={() => updateAppointment(editingAppointment)} 
                style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
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