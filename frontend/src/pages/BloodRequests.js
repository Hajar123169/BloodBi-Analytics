import React, { useEffect, useState } from 'react';
import api from '../api';

const fallback = [
  { patientName: 'Patient A', bloodType: 'O_NEG', urgency: 'CRITICAL', status: 'PENDING', hospital: 'CHU Ibn Rochd', city: 'Casablanca' },
  { patientName: 'Patient B', bloodType: 'AB_NEG', urgency: 'HIGH', status: 'PENDING', hospital: 'Hopital Ibn Rochd', city: 'Casablanca' },
  { patientName: 'Patient C', bloodType: 'A_POS', urgency: 'MEDIUM', status: 'FULFILLED', hospital: 'Hopital Mohammed V', city: 'El Jadida' }
];

export default function BloodRequests() {
  const [items, setItems] = useState(fallback);
  useEffect(() => { api.get('/requests').then(res => setItems(res.data)).catch(() => {}); }, []);
  return (
    <div>
      <h1>Blood Requests</h1>
      <p className="subtitle">Suivi des demandes de sang selon le groupe, l'urgence, le statut et la ville.</p>
      <div className="panel">
        <table><thead><tr><th>Patient</th><th>Groupe</th><th>Urgence</th><th>Statut</th><th>Hôpital</th><th>Ville</th></tr></thead>
        <tbody>{items.map((r, idx) => <tr key={r.id || idx}><td>{r.patientName}</td><td>{r.bloodType}</td><td><span className={`badge ${r.urgency?.toLowerCase()}`}>{r.urgency}</span></td><td>{r.status}</td><td>{r.hospital}</td><td>{r.city}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
