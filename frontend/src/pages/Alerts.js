import React, { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../api';

const fallback = [
  { title: 'Stock critique O- au CNTS Casablanca', message: 'Le stock O- est de 3 poches alors que le seuil minimal est de 10.', severity: 'CRITICAL', city: 'Casablanca' },
  { title: 'Demande urgente AB- à l Hopital Ibn Rochd', message: 'Une demande AB- haute priorité est toujours en attente.', severity: 'HIGH', city: 'Casablanca' },
  { title: 'Stock de plaquettes faible à Marrakech', message: 'Le stock de plaquettes AB- expire bientôt et reste sous le seuil.', severity: 'CRITICAL', city: 'Marrakech' }
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(fallback);
  useEffect(() => { api.get('/alerts?activeOnly=true').then(res => setAlerts(res.data)).catch(() => {}); }, []);

  async function resolve(id) {
    if (!id) return;
    await api.patch(`/alerts/${id}/resolve`);
    setAlerts(alerts.filter(a => a.id !== id));
  }

  return (
    <div>
      <h1>Alerts</h1>
      <p className="subtitle">Alertes décisionnelles : pénurie, urgence, manque de donneurs compatibles.</p>
      <div className="panel list-panel">
        {alerts.map((a, idx) => (
          <div className="alert-row" key={a.id || idx}>
            <WarningIcon className={`icon-${a.severity?.toLowerCase()}`} />
            <div className="alert-body"><h3>{a.title}</h3><p>{a.message}</p><span className={`badge ${a.severity?.toLowerCase()}`}>{a.severity}</span> <span>{a.city}</span></div>
            <button className="icon-btn" onClick={() => resolve(a.id)}><DeleteIcon /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
