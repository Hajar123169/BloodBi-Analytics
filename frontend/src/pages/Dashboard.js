import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';
import KpiCard from '../components/KpiCard';

const fallbackKpis = { totalDonors: 205, availableDonors: 178, activeRequests: 12, criticalRequests: 4, fulfilledDonations: 94, criticalStocks: 3, activeAlerts: 4, centers: 4, fulfillmentRate: 62.5 };
const fallbackAnalytics = {
  monthlyActivity: [
    { month: 'Jan', donations: 45, requests: 38 }, { month: 'Feb', donations: 52, requests: 44 },
    { month: 'Mar', donations: 60, requests: 51 }, { month: 'Apr', donations: 72, requests: 66 },
    { month: 'May', donations: 94, requests: 78 }, { month: 'Jun', donations: 108, requests: 89 }
  ],
  cityDemand: [
    { city: 'Casablanca', requests: 42, critical: 11 }, { city: 'Rabat', requests: 24, critical: 5 },
    { city: 'Marrakech', requests: 21, critical: 7 }, { city: 'El Jadida', requests: 16, critical: 3 }
  ]
};

export default function Dashboard() {
  const [kpis, setKpis] = useState(fallbackKpis);
  const [analytics, setAnalytics] = useState(fallbackAnalytics);

  useEffect(() => {
    api.get('/dashboard/kpis').then(res => setKpis(res.data)).catch(() => {});
    api.get('/dashboard/analytics').then(res => setAnalytics(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1>BloodBI Dashboard</h1>
      <p className="subtitle">Vue décisionnelle des donneurs, demandes, stocks et alertes critiques.</p>
      <div className="kpi-grid">
        <KpiCard label="Total donneurs" value={kpis.totalDonors} />
        <KpiCard label="Donneurs disponibles" value={kpis.availableDonors} />
        <KpiCard label="Demandes actives" value={kpis.activeRequests} />
        <KpiCard label="Demandes critiques" value={kpis.criticalRequests} />
        <KpiCard label="Dons réalisés" value={kpis.fulfilledDonations} />
        <KpiCard label="Stocks critiques" value={kpis.criticalStocks} />
        <KpiCard label="Alertes actives" value={kpis.activeAlerts} />
        <KpiCard label="Taux satisfaction" value={`${kpis.fulfillmentRate}%`} />
      </div>
      <div className="grid-2">
        <div className="panel">
          <h2>Évolution mensuelle dons / demandes</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="donations" strokeWidth={3} />
              <Line type="monotone" dataKey="requests" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <h2>Demandes par ville</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.cityDemand}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="city" /><YAxis /><Tooltip />
              <Bar dataKey="requests" /><Bar dataKey="critical" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
