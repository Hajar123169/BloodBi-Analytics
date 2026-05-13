import React, { useEffect, useState } from 'react';
import api from '../api';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const fallback = [
  { bloodType: 'O_NEG', componentType: 'RED_CELLS', quantity: 3, minThreshold: 10, status: 'CRITICAL', center: { name: 'CNTS Casablanca', city: 'Casablanca' } },
  { bloodType: 'A_POS', componentType: 'PLASMA', quantity: 25, minThreshold: 10, status: 'NORMAL', center: { name: 'CNTS Casablanca', city: 'Casablanca' } },
  { bloodType: 'AB_NEG', componentType: 'PLATELETS', quantity: 2, minThreshold: 8, status: 'CRITICAL', center: { name: 'Centre Marrakech', city: 'Marrakech' } }
];

export default function BloodStock() {
  const [stocks, setStocks] = useState(fallback);
  useEffect(() => { api.get('/stocks').then(res => setStocks(res.data)).catch(() => {}); }, []);
  return (
    <div>
      <h1>Blood Stock</h1>
      <p className="subtitle">Surveillance des stocks par centre, groupe sanguin et composant.</p>
      <div className="panel">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stocks.map(s => ({ name: `${s.bloodType} ${s.center?.city || ''}`, quantity: s.quantity, threshold: s.minThreshold }))}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="quantity" /><Bar dataKey="threshold" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="panel">
        <table><thead><tr><th>Centre</th><th>Ville</th><th>Groupe</th><th>Composant</th><th>Quantité</th><th>Seuil</th><th>Statut</th></tr></thead>
        <tbody>{stocks.map((s, idx) => <tr key={s.id || idx}><td>{s.center?.name}</td><td>{s.center?.city}</td><td>{s.bloodType}</td><td>{s.componentType}</td><td>{s.quantity}</td><td>{s.minThreshold}</td><td><span className={`badge ${s.status?.toLowerCase()}`}>{s.status}</span></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
