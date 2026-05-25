import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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
    requestDate: request.requestDate || request.createdAt?.substring?.(0, 10) || request.date || 'Non renseigné'
  };
}

function getUrgencyClass(urgency) {
  const value = String(urgency || '').toLowerCase();
  if (value === 'critical') return 'badge critical';
  if (value === 'high') return 'badge high';
  if (value === 'medium') return 'badge medium';
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
  const [items, setItems] = useState([]);
  const [urgencyFilter, setUrgencyFilter] = useState('Toute urgence');
  const [statusFilter, setStatusFilter] = useState('Tout statut');
  const [cityFilter, setCityFilter] = useState('Toutes villes');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('Tous groupes');
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingRequest, setEditingRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setItems(res.data.map(normalizeRequest));
      } else {
        setItems(fallback);
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      setItems(fallback);
    } finally {
      setLoading(false);
    }
  };

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
      const matchesUrgency = urgencyFilter === 'Toute urgence' || item.urgency === urgencyFilter;
      const matchesStatus = statusFilter === 'Tout statut' || item.status === statusFilter;
      const matchesCity = cityFilter === 'Toutes villes' || item.city === cityFilter;
      const matchesBloodType = bloodTypeFilter === 'Tous groupes' || item.bloodType === bloodTypeFilter;
      return matchesUrgency && matchesStatus && matchesCity && matchesBloodType;
    });
  }, [items, urgencyFilter, statusFilter, cityFilter, bloodTypeFilter]);

  const handleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredItems.map(item => item.id));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      try {
        await api.delete(`/requests/${id}`);
        setItems(prev => prev.filter(item => item.id !== id));
        setSelectedRows(prev => prev.filter(rid => rid !== id));
        alert('Demande supprimée avec succès');
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      alert('Aucun élément sélectionné');
      return;
    }
    if (window.confirm(`Supprimer ${selectedRows.length} demande(s) ?`)) {
      try {
        await Promise.all(selectedRows.map(id => api.delete(`/requests/${id}`)));
        setItems(prev => prev.filter(item => !selectedRows.includes(item.id)));
        setSelectedRows([]);
        alert(`${selectedRows.length} demande(s) supprimée(s)`);
      } catch (error) {
        console.error('Erreur suppression multiple:', error);
        alert('Erreur lors de la suppression multiple');
      }
    }
  };

  const handleFulfill = async (id) => {
    if (window.confirm('Marquer cette demande comme satisfaite ?')) {
      try {
        await api.patch(`/requests/${id}/fulfill`);
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'FULFILLED' } : item
        ));
        alert('Demande marquée comme satisfaite');
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour');
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Annuler cette demande ?')) {
      try {
        await api.patch(`/requests/${id}/cancel`);
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'CANCELLED' } : item
        ));
        alert('Demande annulée');
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'annulation');
      }
    }
  };

  const handleUpdateRequest = async (updatedRequest) => {
    try {
      const res = await api.put(`/requests/${updatedRequest.id}`, {
        id: updatedRequest.id,
        patientName: updatedRequest.patientName,
        bloodType: updatedRequest.bloodType,
        urgency: updatedRequest.urgency,
        hospital: updatedRequest.hospital,
        city: updatedRequest.city,
        quantity: updatedRequest.quantity,
        notes: updatedRequest.notes
      });
      setItems(prev => prev.map(item => item.id === updatedRequest.id ? normalizeRequest(res.data) : item));
      setEditingRequest(null);
      alert('Demande mise à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleExport = () => {
    if (!filteredItems.length) {
      alert('Aucune demande à exporter.');
      return;
    }

    const headers = ['Patient', 'Groupe', 'Urgence', 'Statut', 'Hôpital', 'Ville', 'Quantité', 'Date'];
    const rows = filteredItems.map((item) => [
      item.patientName, item.bloodType, item.urgency, item.status,
      item.hospital, item.city, item.quantity, item.requestDate
    ]);

    const csvContent = [headers.join(';'), ...rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bloodbi_requests.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement des demandes...</div>;

  return (
    <div>
      <h1>Blood Requests</h1>
      <p className="subtitle">Suivi des demandes de sang selon le groupe, l'urgence, le statut et la ville.</p>

      <div className="panel requests-panel">
        <div className="requests-header">
          <h2>Demandes ({filteredItems.length})</h2>
          <div className="requests-actions">
            <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
              {urgencies.map(u => <option key={u}>{u}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
              {cities.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={bloodTypeFilter} onChange={(e) => setBloodTypeFilter(e.target.value)}>
              {bloodTypes.map(bt => <option key={bt}>{bt}</option>)}
            </select>
            <button className="request-export-btn" onClick={handleExport}>
              <DownloadIcon fontSize="small" /> Export
            </button>
            {selectedRows.length > 0 && (
              <button onClick={handleDeleteSelected} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' }}>
                Supprimer ({selectedRows.length})
              </button>
            )}
          </div>
        </div>

        <table className="requests-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" checked={selectedRows.length === filteredItems.length && filteredItems.length > 0} onChange={handleSelectAll} />
              </th>
              <th>Patient</th><th>Groupe</th><th>Urgence</th><th>Statut</th><th>Hôpital</th><th>Ville</th><th>Qté</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((request) => (
              <tr key={request.id} className={selectedRows.includes(request.id) ? 'row-selected' : ''}>
                <td><input type="checkbox" checked={selectedRows.includes(request.id)} onChange={() => handleSelectRow(request.id)} /></td>
                <td><strong>{request.patientName}</strong></td>
                <td><span className="blood-badge">{request.bloodType}</span></td>
                <td><span className={getUrgencyClass(request.urgency)}>{request.urgency}</span></td>
                <td><span className={getStatusClass(request.status)}>{request.status}</span></td>
                <td>{request.hospital}</td>
                <td>{request.city}</td>
                <td>{request.quantity}</td>
                <td>{request.requestDate}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => setEditingRequest(request)} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }} title="Modifier">✏️</button>
                    <button onClick={() => handleDelete(request.id)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }} title="Supprimer">🗑️</button>
                    {request.status !== 'FULFILLED' && request.status !== 'CANCELLED' && (
                      <button onClick={() => handleFulfill(request.id)} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }} title="Marquer satisfaite">✅</button>
                    )}
                    {request.status === 'PENDING' && (
                      <button onClick={() => handleCancel(request.id)} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }} title="Annuler">❌</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr><td colSpan="10" className="empty-row">Aucune demande trouvée.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal d'édition */}
      {editingRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0 }}>Modifier la demande</h2>
            <div><label>Patient</label><input type="text" value={editingRequest.patientName} onChange={(e) => setEditingRequest({...editingRequest, patientName: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Groupe sanguin</label>
              <select value={editingRequest.bloodType} onChange={(e) => setEditingRequest({...editingRequest, bloodType: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="O_NEG">O_NEG</option><option value="O_POS">O_POS</option><option value="A_NEG">A_NEG</option><option value="A_POS">A_POS</option>
                <option value="B_NEG">B_NEG</option><option value="B_POS">B_POS</option><option value="AB_NEG">AB_NEG</option><option value="AB_POS">AB_POS</option>
              </select>
            </div>
            <div><label>Urgence</label>
              <select value={editingRequest.urgency} onChange={(e) => setEditingRequest({...editingRequest, urgency: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="CRITICAL">CRITICAL</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
              </select>
            </div>
            <div><label>Hôpital</label><input type="text" value={editingRequest.hospital} onChange={(e) => setEditingRequest({...editingRequest, hospital: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Ville</label><input type="text" value={editingRequest.city} onChange={(e) => setEditingRequest({...editingRequest, city: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Quantité</label><input type="number" value={editingRequest.quantity} onChange={(e) => setEditingRequest({...editingRequest, quantity: parseInt(e.target.value)})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingRequest(null)} style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleUpdateRequest(editingRequest)} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}