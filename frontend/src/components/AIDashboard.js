import React, { useState } from 'react';
import api from '../api';

const box = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 20,
  boxShadow: '0 8px 22px rgba(15,23,42,0.06)'
};

const badge = (level) => ({
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 12,
  color: level === 'CRITICAL' ? '#be123c' : level === 'HIGH' ? '#ea580c' : level === 'MEDIUM' ? '#d97706' : '#15803d',
  background: level === 'CRITICAL' ? '#ffe4e6' : level === 'HIGH' ? '#ffedd5' : level === 'MEDIUM' ? '#fef3c7' : '#dcfce7'
});

export default function AIDashboard() {
  const [prediction, setPrediction] = useState(28);
  const [stock, setStock] = useState(10);
  const [demand, setDemand] = useState(30);
  const [donors, setDonors] = useState(8);
  const [insight, setInsight] = useState(null);
  const [risk, setRisk] = useState(null);
  const [explain, setExplain] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAI = async () => {
    setLoading(true);
    try {
      const [insightRes, riskRes, explainRes, reportRes] = await Promise.all([
        api.get(`/ai/insight?prediction=${prediction}&confidence=0.87`),
        api.get(`/ai/risk?stock=${stock}&demand=${demand}`),
        api.get(`/ai/v2/explain?stock=${stock}&demand=${demand}&donors=${donors}`),
        api.get('/ai/report')
      ]);
      setInsight(insightRes.data);
      setRisk(riskRes.data);
      setExplain(explainRes.data);
      setReport(reportRes.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: '#111827' }}>AI Decision Support</h1>
        <p style={{ marginTop: 8, color: '#6b7280' }}>Professional AI layer for blood demand, shortage risk, explanations, and operational recommendations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 18 }}>
        <label style={box}>Predicted demand
          <input style={{ width: '100%', marginTop: 8, padding: 10 }} type="number" value={prediction} onChange={(e) => setPrediction(e.target.value)} />
        </label>
        <label style={box}>Current stock
          <input style={{ width: '100%', marginTop: 8, padding: 10 }} type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
        </label>
        <label style={box}>Expected demand
          <input style={{ width: '100%', marginTop: 8, padding: 10 }} type="number" value={demand} onChange={(e) => setDemand(e.target.value)} />
        </label>
        <label style={box}>Available donors
          <input style={{ width: '100%', marginTop: 8, padding: 10 }} type="number" value={donors} onChange={(e) => setDonors(e.target.value)} />
        </label>
      </div>

      <button onClick={runAI} disabled={loading} style={{ background: '#e11d48', color: '#fff', border: 0, borderRadius: 10, padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }}>
        {loading ? 'Running AI...' : 'Run AI Analysis'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18, marginTop: 22 }}>
        <div style={box}>
          <h2>AI Insight</h2>
          {insight ? <>
            <span style={badge(insight.riskLevel)}>{insight.riskLevel}</span>
            <p><b>Prediction:</b> {insight.prediction}</p>
            <p><b>Confidence:</b> {(insight.confidence * 100).toFixed(0)}%</p>
            <p><b>Why:</b> {insight.explanation}</p>
            <p><b>Action:</b> {insight.recommendation}</p>
          </> : <p>Run AI analysis to generate insight.</p>}
        </div>

        <div style={box}>
          <h2>Shortage Risk</h2>
          {risk ? <>
            <span style={badge(risk.riskLevel)}>{risk.riskLevel}</span>
            <p style={{ fontSize: 42, fontWeight: 900, margin: '16px 0' }}>{risk.riskScore}/100</p>
            <p>{risk.message}</p>
          </> : <p>Run AI analysis to calculate risk score.</p>}
        </div>

        <div style={box}>
          <h2>Explainable AI</h2>
          {explain ? <>
            <p><b>Stock impact:</b> {explain.stockImpact}</p>
            <p><b>Demand impact:</b> {explain.demandImpact}</p>
            <p><b>Donor impact:</b> {explain.donorImpact}</p>
            <p><b>Strongest driver:</b> {explain.strongestDriver}</p>
            <p>{explain.interpretation}</p>
          </> : <p>Run AI analysis to view SHAP-style explanation.</p>}
        </div>

        <div style={box}>
          <h2>AI Weekly Report</h2>
          {report ? <>
            <p><b>{report.title}</b></p>
            <p>{report.summary}</p>
            <ul>{report.recommendedActions?.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </> : <p>Run AI analysis to generate report preview.</p>}
        </div>
      </div>
    </div>
  );
}
