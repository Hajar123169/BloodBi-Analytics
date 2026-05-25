import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const fallback = [
  { id: 1, name: 'CNTS Casablanca', city: 'Casablanca', address: 'Rue des Hopitaux', phone: '0522000001', region: 'Casablanca-Settat', active: true },
  { id: 2, name: 'Centre Regional Rabat', city: 'Rabat', address: 'Avenue Mohammed V', phone: '0537000002', region: 'Rabat-Salé-Kenitra', active: true },
  { id: 3, name: 'Centre de Transfusion Marrakech', city: 'Marrakech', address: 'Gueliz', phone: '0524000003', region: 'Marrakech-Safi', active: false }
];

export default function Centers() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('Toutes villes');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingCenter, setEditingCenter] = useState(null);
  const [addingCenter, setAddingCenter] = useState(false);
  const [newCenter, setNewCenter] = useState({ name: '', city: '', address: '', phone: '', active: true });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/centers');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCenters(res.data);
      } else {
        setCenters(fallback);
      }
    } catch (error) {
      console.error('Erreur chargement centres:', error);
      setCenters(fallback);
    } finally {
      setLoading(false);
    }
  };

  const cities = useMemo(() => {
    return ['Toutes villes', ...new Set(centers.map(c => c.city).filter(Boolean))];
  }, [centers]);

  const filteredCenters = useMemo(() => {
    let filtered = [...centers];
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(term) || c.city.toLowerCase().includes(term));
    }
    if (selectedCity !== 'Toutes villes') {
      filtered = filtered.filter(c => c.city === selectedCity);
    }
    if (showOnlyActive) {
      filtered = filtered.filter(c => c.active === true);
    }
    return filtered;
  }, [centers, searchTerm, selectedCity, showOnlyActive]);

  const handleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredCenters.length && filteredCenters.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredCenters.map(c => c.id));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce centre ?')) {
      try {
        await api.delete(`/centers/${id}`);
        setCenters(prev => prev.filter(c => c.id !== id));
        setSelectedRows(prev => prev.filter(rid => rid !== id));
        alert('Centre supprimé avec succès');
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
    if (window.confirm(`Supprimer ${selectedRows.length} centre(s) ?`)) {
      try {
        await Promise.all(selectedRows.map(id => api.delete(`/centers/${id}`)));
        setCenters(prev => prev.filter(c => !selectedRows.includes(c.id)));
        setSelectedRows([]);
        alert(`${selectedRows.length} centre(s) supprimé(s)`);
      } catch (error) {
        console.error('Erreur suppression multiple:', error);
        alert('Erreur lors de la suppression multiple');
      }
    }
  };

  const handleUpdateCenter = async (updatedCenter) => {
    try {
      const res = await api.put(`/centers/${updatedCenter.id}`, updatedCenter);
      setCenters(prev => prev.map(c => c.id === updatedCenter.id ? res.data : c));
      setEditingCenter(null);
      alert('Centre mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleAddCenter = async () => {
    if (!newCenter.name || !newCenter.city) {
      alert('Veuillez remplir le nom et la ville');
      return;
    }
    try {
      const res = await api.post('/centers', newCenter);
      setCenters(prev => [...prev, res.data]);
      setAddingCenter(false);
      setNewCenter({ name: '', city: '', address: '', phone: '', active: true });
      alert('Centre ajouté avec succès');
    } catch (error) {
      console.error('Erreur ajout:', error);
      alert('Erreur lors de l\'ajout');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement des centres...</div>;

  return (
    <div>
      <h1>Donation Centers</h1>
      <p className="subtitle">Centres de collecte et banques de sang suivis par BloodBI.</p>

      {/* Filtres et bouton Ajouter */}
      <div className="centers-filters" style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input type="text" placeholder="🔍 Rechercher par nom ou ville..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
        </div>
        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
          style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}>
          {cities.map(city => <option key={city}>{city}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={showOnlyActive} onChange={(e) => setShowOnlyActive(e.target.checked)} style={{ width: '18px', height: '18px' }} />
          <span>Afficher uniquement les centres actifs</span>
        </label>
        <button onClick={() => setAddingCenter(true)} style={{ padding: '10px 16px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          + Ajouter un centre
        </button>
        {selectedRows.length > 0 && (
          <button onClick={handleDeleteSelected} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
            Supprimer ({selectedRows.length})
          </button>
        )}
        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#64748b' }}>{filteredCenters.length} centre(s) trouvé(s)</div>
      </div>

      {/* Tableau */}
      <div className="panel">
        <table className="reports-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" checked={selectedRows.length === filteredCenters.length && filteredCenters.length > 0} onChange={handleSelectAll} /></th>
              <th>Centre</th><th>Ville</th><th>Adresse</th><th>Téléphone</th><th>Actif</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCenters.map((center) => (
              <tr key={center.id} className={selectedRows.includes(center.id) ? 'row-selected' : ''}>
                <td><input type="checkbox" checked={selectedRows.includes(center.id)} onChange={() => handleSelectRow(center.id)} /></td>
                <td><strong>{center.name}</strong>{center.region && <div style={{ fontSize: '12px', color: '#64748b' }}>{center.region}</div>}</td>
                <td>{center.city}</td>
                <td>{center.address || '—'}</td>
                <td>{center.phone || '—'}</td>
                <td>
                  <span className={center.active ? 'center-active-badge' : 'center-inactive-badge'}>
                    {center.active ? 'Oui' : 'Non'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditingCenter(center)} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDelete(center.id)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCenters.length === 0 && (
              <tr><td colSpan="7" className="empty-row">Aucun centre trouvé.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal d'édition */}
      {editingCenter && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0 }}>Modifier le centre</h2>
            <div><label>Nom</label><input type="text" value={editingCenter.name} onChange={(e) => setEditingCenter({...editingCenter, name: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Ville</label><input type="text" value={editingCenter.city} onChange={(e) => setEditingCenter({...editingCenter, city: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Adresse</label><input type="text" value={editingCenter.address || ''} onChange={(e) => setEditingCenter({...editingCenter, address: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Téléphone</label><input type="text" value={editingCenter.phone || ''} onChange={(e) => setEditingCenter({...editingCenter, phone: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Actif</label>
              <select value={editingCenter.active} onChange={(e) => setEditingCenter({...editingCenter, active: e.target.value === 'true'})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="true">Oui</option><option value="false">Non</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingCenter(null)} style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleUpdateCenter(editingCenter)} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {addingCenter && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0 }}>Ajouter un centre</h2>
            <div><label>Nom</label><input type="text" value={newCenter.name} onChange={(e) => setNewCenter({...newCenter, name: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Ville</label><input type="text" value={newCenter.city} onChange={(e) => setNewCenter({...newCenter, city: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Adresse</label><input type="text" value={newCenter.address} onChange={(e) => setNewCenter({...newCenter, address: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Téléphone</label><input type="text" value={newCenter.phone} onChange={(e) => setNewCenter({...newCenter, phone: e.target.value})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div><label>Actif</label>
              <select value={newCenter.active} onChange={(e) => setNewCenter({...newCenter, active: e.target.value === 'true'})} style={{ width: '100%', padding: '8px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="true">Oui</option><option value="false">Non</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setAddingCenter(false)} style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleAddCenter} style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}