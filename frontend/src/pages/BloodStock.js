import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

// Les 4 types de composants avec leurs labels
const COMPONENT_TYPES = [
  { value: 'WHOLE_BLOOD', label: 'Sang total' },
  { value: 'RED_CELLS', label: 'Globules rouges' },
  { value: 'PLASMA', label: 'Plasma' },
  { value: 'PLATELETS', label: 'Plaquettes' }
];

function getComponentLabel(componentType) {
  const mapping = {
    'WHOLE_BLOOD': 'Sang total',
    'RED_CELLS': 'Globules rouges',
    'PLASMA': 'Plasma',
    'PLATELETS': 'Plaquettes'
  };
  return mapping[componentType] || componentType;
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'critical') return 'badge critical';
  if (value === 'low') return 'badge low';
  return 'badge normal';
}

function getStatusColor(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'critical') return '#dc2626';
  if (value === 'low') return '#f59e0b';
  return '#10b981';
}

function normalizeStock(stock) {
  return {
    id: stock.id,
    bloodType: stock.bloodType || stock.blood_type || 'Non défini',
    componentType: stock.componentType || stock.component_type || 'WHOLE_BLOOD',
    quantity: Number(stock.quantity || 0),
    minThreshold: Number(stock.minThreshold || stock.min_threshold || 0),
    expiryDate: stock.expiryDate || stock.expiry_date || 'Non renseigné',
    status: stock.status || 'NORMAL',
    center: {
      name: stock.center?.name || stock.center_name || 'Centre non renseigné',
      city: stock.center?.city || stock.city || 'Ville non renseignée'
    }
  };
}

export default function BloodStock() {
  const [stocks, setStocks] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Toutes villes');
  const [selectedGroup, setSelectedGroup] = useState('Tous groupes');
  const [selectedComponent, setSelectedComponent] = useState('Tous composants');
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [viewingStock, setViewingStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await api.get('/stocks');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setStocks(res.data.map(normalizeStock));
        }
      } catch (error) {
        console.error('Erreur chargement stocks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const cities = useMemo(() => {
    return ['Toutes villes', ...new Set(stocks.map((s) => s.center?.city).filter(Boolean))];
  }, [stocks]);

  const groups = useMemo(() => {
    return ['Tous groupes', ...new Set(stocks.map((s) => s.bloodType).filter(Boolean))];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesCity = selectedCity === 'Toutes villes' || stock.center?.city === selectedCity;
      const matchesGroup = selectedGroup === 'Tous groupes' || stock.bloodType === selectedGroup;
      const matchesComponent = selectedComponent === 'Tous composants' || stock.componentType === selectedComponent;
      return matchesCity && matchesGroup && matchesComponent;
    });
  }, [stocks, selectedCity, selectedGroup, selectedComponent]);

  // Regrouper par ville pour le graphique (afficher uniquement les villes)
  const chartData = useMemo(() => {
    const cityMap = new Map();
    
    filteredStocks.forEach((stock) => {
      const city = stock.center?.city || 'Ville non renseignée';
      if (!cityMap.has(city)) {
        cityMap.set(city, { totalQuantity: 0, totalThreshold: 0, count: 0 });
      }
      const data = cityMap.get(city);
      data.totalQuantity += stock.quantity;
      data.totalThreshold += stock.minThreshold;
      data.count++;
    });
    
    // Convertir en tableau pour le graphique
    return Array.from(cityMap.entries()).map(([city, data]) => ({
      name: city,
      quantity: Math.round(data.totalQuantity / data.count),
      threshold: Math.round(data.totalThreshold / data.count)
    }));
  }, [filteredStocks]);

  const handleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredStocks.length && filteredStocks.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredStocks.map(s => s.id));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) {
      try {
        await api.delete(`/stocks/${id}`);
        setStocks(prev => prev.filter(s => s.id !== id));
        setSelectedRows(prev => prev.filter(rid => rid !== id));
        alert('Stock supprimé avec succès');
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
    if (window.confirm(`Supprimer ${selectedRows.length} stock(s) ?`)) {
      try {
        await Promise.all(selectedRows.map(id => api.delete(`/stocks/${id}`)));
        setStocks(prev => prev.filter(s => !selectedRows.includes(s.id)));
        setSelectedRows([]);
        alert(`${selectedRows.length} stock(s) supprimé(s)`);
      } catch (error) {
        console.error('Erreur suppression multiple:', error);
        alert('Erreur lors de la suppression multiple');
      }
    }
  };

  const handleUpdateStock = async (updatedStock) => {
    try {
      const res = await api.put(`/stocks/${updatedStock.id}`, {
        id: updatedStock.id,
        quantity: updatedStock.quantity,
        minThreshold: updatedStock.minThreshold,
        status: updatedStock.status,
        componentType: updatedStock.componentType
      });
      setStocks(prev => prev.map(s => s.id === updatedStock.id ? normalizeStock(res.data) : s));
      setEditingStock(null);
      alert('Stock mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleExport = () => {
    if (!filteredStocks.length) {
      alert('Aucune donnée à exporter');
      return;
    }
    const headers = ['Centre', 'Ville', 'Groupe', 'Composant', 'Quantité', 'Seuil', 'Expire', 'Statut'];
    const rows = filteredStocks.map((s) => [
      s.center?.name, s.center?.city, s.bloodType,
      getComponentLabel(s.componentType), s.quantity, s.minThreshold, s.expiryDate, s.status
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.map(v => `"${v}"`).join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bloodbi_stocks.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement des stocks...</div>;

  return (
    <div>
      <h1>Blood Stock</h1>
      <p className="subtitle">Surveillance des stocks par centre, groupe sanguin et composant.</p>

      {/* Graphique agrandi - uniquement les villes - sans texte d'interprétation */}
      {chartData.length > 0 && (
        <div className="panel stock-chart-panel">
          <h2>Stocks moyens par ville</h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Quantité moyenne disponible par ville (tous groupes sanguins confondus)
          </p>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData} margin={{ top: 30, right: 50, left: 30, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
                tick={{ fontSize: 13, fontWeight: 'bold' }}
              />
              <YAxis 
                allowDecimals={false} 
                label={{ value: 'Nombre moyen de poches', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 13 } }} 
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'quantity') return [`${Math.round(value)} poches`, '📦 Quantité moyenne'];
                  if (name === 'threshold') return [`${Math.round(value)} poches`, '⚠️ Seuil moyen'];
                  return [value, name];
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={60}
                wrapperStyle={{ bottom: 5, fontSize: '14px' }}
                formatter={(value) => {
                  if (value === 'quantity') return '📦 Quantité moyenne disponible';
                  if (value === 'threshold') return '⚠️ Seuil moyen (alerte)';
                  return value;
                }}
              />
              <Bar dataKey="quantity" name="quantity" fill="#d71920" radius={[6, 6, 0, 0]} />
              <Bar dataKey="threshold" name="threshold" fill="#d8c5c5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filtres et tableau détaillé (avec groupes sanguins) */}
      <div className="panel stock-detail-panel">
        <div className="stock-detail-header">
          <h2>Détail des stocks</h2>
          <div className="stock-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              {cities.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              {groups.map(g => <option key={g}>{g}</option>)}
            </select>
            <select value={selectedComponent} onChange={(e) => setSelectedComponent(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option>Tous composants</option>
              {COMPONENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              <DownloadIcon fontSize="small" /> Export
            </button>
            {selectedRows.length > 0 && (
              <button onClick={handleDeleteSelected} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
                Supprimer ({selectedRows.length})
              </button>
            )}
          </div>
        </div>

        <table className="reports-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" checked={selectedRows.length === filteredStocks.length && filteredStocks.length > 0} onChange={handleSelectAll} /></th>
              <th>Centre</th>
              <th>Ville</th>
              <th>Groupe</th>
              <th>Composant</th>
              <th>Quantité</th>
              <th>Seuil</th>
              <th>Expire</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((s) => (
              <tr key={s.id} className={selectedRows.includes(s.id) ? 'row-selected' : ''}>
                <td><input type="checkbox" checked={selectedRows.includes(s.id)} onChange={() => handleSelectRow(s.id)} /></td>
                <td style={{ fontWeight: 'bold' }}>{s.center?.name}</td>
                <td>{s.center?.city}</td>
                <td><span className="blood-badge" style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>{s.bloodType}</span></td>
                <td>{getComponentLabel(s.componentType)}</td>
                <td style={{ fontWeight: 'bold', color: s.quantity < s.minThreshold ? '#dc2626' : '#333' }}>{s.quantity}</td>
                <td>{s.minThreshold}</td>
                <td style={{ color: new Date(s.expiryDate) < new Date() ? '#dc2626' : '#333' }}>{s.expiryDate}</td>
                <td>
                  <span style={{ 
                    backgroundColor: getStatusColor(s.status), 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setViewingStock(s)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }} title="Voir détails">👁️</button>
                    <button onClick={() => setEditingStock(s)} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }} title="Modifier">✏️</button>
                    <button onClick={() => handleDelete(s.id)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }} title="Supprimer">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStocks.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>Aucun stock trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Édition */}
      {editingStock && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '450px', maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0 }}>Modifier le stock</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Quantité</label>
              <input type="number" value={editingStock.quantity} onChange={(e) => setEditingStock({...editingStock, quantity: parseInt(e.target.value)})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Seuil minimum</label>
              <input type="number" value={editingStock.minThreshold} onChange={(e) => setEditingStock({...editingStock, minThreshold: parseInt(e.target.value)})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Composant</label>
              <select value={editingStock.componentType} onChange={(e) => setEditingStock({...editingStock, componentType: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {COMPONENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Statut</label>
              <select value={editingStock.status} onChange={(e) => setEditingStock({...editingStock, status: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="NORMAL">NORMAL</option>
                <option value="LOW">LOW</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingStock(null)} style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleUpdateStock(editingStock)} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualisation */}
      {viewingStock && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '450px', maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0 }}>Détails du stock</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ padding: '8px', fontWeight: 'bold' }}>Centre: </td><td>{viewingStock.center?.name}</td></tr>
                <tr><td style={{ padding: '8px', fontWeight: 'bold' }}>Ville: </td><td>{viewingStock.center?.city}</td></tr>
                <tr><td style={{ padding: '8px', fontWeight: 'bold' }}>Groupe: </td><td><span className="blood-badge">{viewingStock.bloodType}</span></td></tr>
                <tr><td style={{ padding: '8px', fontWeight: 'bold' }}>Composant: </td><td>{getComponentLabel(viewingStock.componentType)}</td></tr>
                <tr><td style={{ padding: '8px', fontWeight: 'bold' }}>Quantité: </td><td style={{ fontWeight: 'bold', color: viewingStock.quantity < viewingStock.minThreshold ? '#dc2626' : '#333' }}>{viewingStock.quantity}</td></tr>
                <tr><td style={{ padding: '8px', fontWeight: 'bold' }}>Seuil: </td><td>{viewingStock.minThreshold}</td></tr>
                <tr><td style={{ padding: '8px', fontWeight: 'bold' }}>Expiration: </td><td style={{ color: new Date(viewingStock.expiryDate) < new Date() ? '#dc2626' : '#333' }}>{viewingStock.expiryDate}</td></tr>
                <tr><td style={{ padding: '8px', fontWeight: 'bold' }}>Statut: </td><td><span style={{ backgroundColor: getStatusColor(viewingStock.status), padding: '4px 8px', borderRadius: '4px', color: 'white' }}>{viewingStock.status}</span></td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setViewingStock(null)} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}