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
    { city: 'Casablanca', pending: 28, fulfilled: 14 },
    { city: 'Rabat', pending: 15, fulfilled: 9 },
    { city: 'Marrakech', pending: 14, fulfilled: 7 },
    { city: 'El Jadida', pending: 9, fulfilled: 7 },
    { city: 'Fes', pending: 8, fulfilled: 5 }
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
        {/* Graphique évolution mensuelle avec légende */}
        <div className="panel">
          <h2>Évolution mensuelle dons / demandes</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="donations" 
                stroke="#ef4444"
                strokeWidth={3} 
                dot={{ r: 4, fill: "#ef4444" }}
              />
              <Line 
                type="monotone" 
                dataKey="requests" 
                stroke="#3b82f6"
                strokeWidth={3} 
                dot={{ r: 4, fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '3px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
              <span>Dons</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '3px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
              <span>Demandes</span>
            </div>
          </div>
        </div>

        {/* Graphique demandes par ville - avec noms inclinés pour lisibilité */}
        <div className="panel">
          <h2>Demandes par ville</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={analytics.cityDemand} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="city" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pending" name="En attente" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fulfilled" name="Satisfaites" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {/* Légende en bas */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#ef4444', borderRadius: '4px' }}></div>
              <span>En attente (pending)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#22c55e', borderRadius: '4px' }}></div>
              <span>Satisfaites (fulfilled)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}