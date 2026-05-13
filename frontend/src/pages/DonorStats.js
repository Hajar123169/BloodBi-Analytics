import React, { useEffect, useState } from 'react';
import api from '../api';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

const fallback = [
  { fullName: 'Hajar Khomssi', bloodType: 'O_NEG', city: 'El Jadida', available: true, totalDonations: 4 },
  { fullName: 'Sara Mahfoud', bloodType: 'A_POS', city: 'Casablanca', available: true, totalDonations: 6 },
  { fullName: 'Adil Karimi', bloodType: 'AB_NEG', city: 'Rabat', available: false, totalDonations: 2 },
  { fullName: 'Nabil Ouardi', bloodType: 'B_POS', city: 'Marrakech', available: true, totalDonations: 3 }
];

function groupBy(data, key) {
  const counts = data.reduce((acc, item) => ({ ...acc, [item[key]]: (acc[item[key]] || 0) + 1 }), {});
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default function DonorStats() {
  const [donors, setDonors] = useState(fallback);
  useEffect(() => { api.get('/donors').then(res => setDonors(res.data)).catch(() => {}); }, []);
  const byBlood = groupBy(donors, 'bloodType');
  const byCity = groupBy(donors, 'city');

  return (
    <div>
      <h1>Donor Statistics</h1>
      <p className="subtitle">Analyse des donneurs par ville, disponibilité et groupe sanguin.</p>
      <div className="grid-2">
        <div className="panel">
          <h2>Répartition par groupe sanguin</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart><Pie dataKey="value" data={byBlood} outerRadius={90} label>{byBlood.map((_, i) => <Cell key={i} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <h2>Donneurs par ville</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCity}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel">
        <h2>Liste des donneurs</h2>
        <table><thead><tr><th>Nom</th><th>Groupe</th><th>Ville</th><th>Disponible</th><th>Total dons</th></tr></thead>
        <tbody>{donors.map((d, idx) => <tr key={d.id || idx}><td>{d.fullName}</td><td>{d.bloodType}</td><td>{d.city}</td><td>{d.available ? 'Oui' : 'Non'}</td><td>{d.totalDonations}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
