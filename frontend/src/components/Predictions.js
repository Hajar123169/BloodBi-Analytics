import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
 
// ─── API ─────────────────────────────────────────────────────────────────────
const BASE = "http://localhost:8082/api/predictions";
const api  = (path) => fetch(`${BASE}${path}`).then((r) => r.json());
 
// ─── Design tokens — matches BloodBI app ─────────────────────────────────────
const C = {
  // App chrome
  pageBg:   "#f3f4f6",   // same light-gray page background as app
  white:    "#ffffff",
  border:   "#e5e7eb",
  border2:  "#d1d5db",
  // Red brand
  red:      "#e11d48",
  redLight: "#fef2f4",
  redDim:   "#fca5a5",
  // Text
  text:     "#111827",
  textSub:  "#6b7280",
  textMute: "#9ca3af",
  // Status palette (matches existing badges)
  green:    "#16a34a",
  greenBg:  "#dcfce7",
  amber:    "#d97706",
  amberBg:  "#fef3c7",
  blue:     "#2563eb",
  blueBg:   "#dbeafe",
  purple:   "#7c3aed",
  purpleBg: "#ede9fe",
  orange:   "#ea580c",
  orangeBg: "#ffedd5",
};
 
const BLOOD_COLORS = {
  "A+": "#e11d48", "A-": "#f87171",
  "B+": "#2563eb", "B-": "#60a5fa",
  "AB+":"#7c3aed", "AB-":"#a78bfa",
  "O+": "#16a34a", "O-": "#4ade80",
};
 
const RISK_CFG = {
  CRITICAL: { color: C.red,    bg: C.redLight,   text: C.red,    label: "CRITICAL" },
  HIGH:     { color: C.orange, bg: C.orangeBg,   text: C.orange, label: "HIGH"     },
  MEDIUM:   { color: C.amber,  bg: C.amberBg,    text: C.amber,  label: "MEDIUM"   },
  LOW:      { color: C.green,  bg: C.greenBg,    text: C.green,  label: "LOW"      },
};
 
// ─── Shared component styles ──────────────────────────────────────────────────
const card = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: "24px 28px",
};
 
const sectionLabel = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: C.textSub,
  marginBottom: 16,
};
 
// ─── Tooltip ─────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border2}`,
      borderRadius: 8, padding: "10px 14px", fontSize: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}>
      <p style={{ color: C.textSub, marginBottom: 6, fontWeight: 600, fontSize: 11 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0", fontWeight: 500 }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};
 
// ─── Risk badge (matches app badge style) ─────────────────────────────────────
const RiskBadge = ({ risk }) => {
  const cfg = RISK_CFG[risk] || RISK_CFG.LOW;
  return (
    <span style={{
      display: "inline-block",
      background: cfg.bg,
      color: cfg.text,
      borderRadius: 20,
      padding: "3px 12px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
    }}>{cfg.label}</span>
  );
};
 
// ─── Blood type pill ──────────────────────────────────────────────────────────
const BTPill = ({ bt }) => (
  <span style={{
    display: "inline-block",
    background: `${BLOOD_COLORS[bt]}18`,
    color: BLOOD_COLORS[bt],
    borderRadius: 6,
    padding: "2px 9px",
    fontSize: 11,
    fontWeight: 700,
    border: `1px solid ${BLOOD_COLORS[bt]}40`,
  }}>{bt}</span>
);
 
// ─── KPI card (matches Dashboard KPI style) ───────────────────────────────────
const KpiCard = ({ label, value, unit = "", sub, accent = C.red, icon }) => (
  <div style={{ ...card, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
    {/* left accent bar */}
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: accent, borderRadius: "12px 0 0 12px" }} />
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.textSub, marginBottom: 8 }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1, letterSpacing: "-0.02em" }}>
      {value}<span style={{ fontSize: 14, fontWeight: 500, color: C.textSub, marginLeft: 4 }}>{unit}</span>
    </p>
    {sub && <p style={{ fontSize: 11, color: C.textMute, marginTop: 6 }}>{sub}</p>}
  </div>
);
 
// ─── Tab button ───────────────────────────────────────────────────────────────
const Tab = ({ label, active, onClick, count }) => (
  <button onClick={onClick} style={{
    padding: "9px 20px",
    borderRadius: 8,
    border: active ? `1.5px solid ${C.red}` : `1px solid ${C.border}`,
    background: active ? C.redLight : C.white,
    color: active ? C.red : C.textSub,
    fontWeight: active ? 700 : 500,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 7,
    transition: "all 0.15s",
  }}>
    {label}
    {count !== undefined && (
      <span style={{
        background: active ? C.red : C.border,
        color: active ? "#fff" : C.textSub,
        borderRadius: 20,
        padding: "1px 7px",
        fontSize: 10,
        fontWeight: 700,
      }}>{count}</span>
    )}
  </button>
);
 
// ─── Section heading (matches "Blood Requests" h1 style) ──────────────────────
const PageHeading = ({ title, sub }) => (
  <div style={{ marginBottom: 28 }}>
    <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", marginBottom: 6 }}>{title}</h1>
    <p style={{ fontSize: 14, color: C.textSub }}>{sub}</p>
  </div>
);
 
// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ h = 180 }) => (
  <div style={{
    background: `linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)`,
    backgroundSize: "200% 100%",
    borderRadius: 12,
    height: h,
    animation: "shimmer 1.4s infinite",
  }} />
);
 
// ─── Main component ───────────────────────────────────────────────────────────
export default function Predictions() {
  const [tab,      setTab]      = useState("demand");
  const [demand,   setDemand]   = useState(null);
  const [behavior, setBehavior] = useState(null);
  const [highRisk, setHighRisk] = useState(null);
  const [zoneRisk, setZoneRisk] = useState(null);
  const [status,   setStatus]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [btFilter, setBtFilter] = useState("All");
 
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [st, dem, beh, hr, zr] = await Promise.all([
        api("/status"),
        api("/demand"),
        api("/donor-behavior"),
        api("/high-risk?limit=20"),
        api("/zone-risk"),
      ]);
      setStatus(st);
      setDemand(dem);
      setBehavior(beh);
      setHighRisk(hr);
      setZoneRisk(zr);
    } catch {
      setError("Impossible de joindre le backend — vérifiez que Spring Boot tourne sur le port .");
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { load(); }, [load]);
 
  // ── Forecast chart data ────────────────────────────────────────────────────
  const forecastData = React.useMemo(() => {
    if (!demand?.daily_forecasts) return [];
    const filtered = btFilter === "All"
      ? demand.daily_forecasts
      : demand.daily_forecasts.filter((d) => d.blood_type === btFilter);
    const map = {};
    filtered.forEach(({ date, blood_type, predicted_requests }) => {
      if (!map[date]) map[date] = { date: date.slice(5) };
      map[date][blood_type] = parseFloat(predicted_requests.toFixed(1));
    });
    return Object.values(map);
  }, [demand, btFilter]);
 
  const cvData = React.useMemo(() => {
    if (!behavior?.cv_scores) return [];
    return behavior.cv_scores.map((s, i) => ({
      fold: `Fold ${i + 1}`,
      score: parseFloat((s * 100).toFixed(1)),
      mean:  parseFloat(((behavior.cv_mean || 0) * 100).toFixed(1)),
    }));
  }, [behavior]);
 
  const zoneData = React.useMemo(() => {
    if (!zoneRisk?.zone_risk) return [];
    return [...zoneRisk.zone_risk].sort((a, b) => b.avg_daily_need - a.avg_daily_need);
  }, [zoneRisk]);
 
  const activeBTs = btFilter === "All" ? Object.keys(BLOOD_COLORS) : [btFilter];
 
  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f3f4f6; }
        tr:hover td { background: #f9fafb !important; }
      `}</style>
 
      <div style={{ background: C.pageBg, minHeight: "100vh", padding: "32px 36px 64px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
 
        {/* ── Page heading ── */}
        <PageHeading
          title="Prédictions IA"
          sub="Comportement des donneurs (KNN) · Prévision de la demande (Régression Linéaire) · Analyse des risques"
        />
 
        {/* ── Status banner ── */}
        {status && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: status.all_models_ready ? C.greenBg : C.amberBg,
            border: `1px solid ${status.all_models_ready ? "#86efac" : "#fcd34d"}`,
            borderRadius: 10, padding: "10px 16px", marginBottom: 24,
            fontSize: 13, color: status.all_models_ready ? C.green : C.amber,
            fontWeight: 600,
          }}>
            <span style={{ fontSize: 16 }}>{status.all_models_ready ? "✓" : "⚠"}</span>
            {status.all_models_ready
              ? `Modèles chargés — KNN accuracy ${((status.knn_accuracy || 0) * 100).toFixed(1)}%  ·  Régression R² ${status.lr_metrics?.r2?.toFixed(3) ?? "—"}`
              : "Certains modèles ne sont pas encore entraînés — exécutez les scripts Python d'abord."}
            <button onClick={load} style={{
              marginLeft: "auto", background: "transparent",
              border: `1px solid currentColor`, borderRadius: 6,
              color: "inherit", padding: "4px 12px", cursor: "pointer", fontSize: 12,
            }}>↻ Actualiser</button>
          </div>
        )}
 
        {/* ── Error ── */}
        {error && (
          <div style={{
            background: C.redLight, border: `1px solid ${C.redDim}`,
            borderRadius: 10, padding: "12px 18px", marginBottom: 24,
            fontSize: 13, color: C.red, fontWeight: 500,
          }}>⚠ {error}</div>
        )}
 
        {/* ── KPI row ── */}
        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28, animation: "fadeIn .3s ease" }}>
            <KpiCard label="KNN Accuracy"   value={behavior?.accuracy  ? (behavior.accuracy  * 100).toFixed(1) : "—"} unit="%" accent={C.red}    sub="Prédiction retour donneur" />
            <KpiCard label="AUC-ROC"        value={behavior?.auc_roc?.toFixed(3) ?? "—"}                              accent={C.blue}  sub="Discrimination modèle" />
            <KpiCard label="Demande R²"     value={demand?.metrics?.r2?.toFixed(3) ?? "—"}                            accent={C.green} sub="Qualité régression linéaire" />
            <KpiCard label="RMSE Demande"   value={demand?.metrics?.rmse?.toFixed(2) ?? "—"}                          accent={C.amber} sub="Erreur prévision quotidienne" />
            <KpiCard label="Donneurs à risque" value={highRisk?.count ?? "—"}                                         accent={C.orange} sub="Risque de churn élevé" />
          </div>
        )}
 
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {[1,2,3,4].map((i) => <Skeleton key={i} h={90} />)}
          </div>
        )}
 
        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          <Tab label="📈 Prévision Demande"    active={tab === "demand"}   onClick={() => setTab("demand")}   />
          <Tab label="🧬 Comportement Donneur" active={tab === "donor"}    onClick={() => setTab("donor")}    />
          <Tab label="⚠️ Risque par Groupe"   active={tab === "risk"}     onClick={() => setTab("risk")}     />
          <Tab label="🔴 Donneurs à Risque"    active={tab === "highRisk"} onClick={() => setTab("highRisk")} count={highRisk?.count} />
        </div>
 
        {/* ════════════════════════════════════════════════════════════════════
            TAB 1 — DEMAND FORECAST
        ════════════════════════════════════════════════════════════════════ */}
        {!loading && !error && tab === "demand" && demand?.daily_forecasts && (
          <div style={{ animation: "fadeIn .25s ease" }}>
 
            {/* Blood type filter pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {["All", ...Object.keys(BLOOD_COLORS)].map((bt) => (
                <button key={bt} onClick={() => setBtFilter(bt)} style={{
                  padding: "4px 14px",
                  borderRadius: 20,
                  border: `1.5px solid ${btFilter === bt ? (BLOOD_COLORS[bt] || C.red) : C.border}`,
                  background: btFilter === bt ? `${(BLOOD_COLORS[bt] || C.red)}14` : C.white,
                  color: btFilter === bt ? (BLOOD_COLORS[bt] || C.red) : C.textSub,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>
                  {bt === "All" ? "Tous" : bt}
                </button>
              ))}
            </div>
 
            {/* Area chart */}
            <div style={{ ...card, marginBottom: 20 }}>
              <p style={sectionLabel}>Prévision quotidienne — 30 jours</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecastData} margin={{ top: 4, right: 16, bottom: 0, left: -12 }}>
                  <defs>
                    {activeBTs.map((bt) => (
                      <linearGradient key={bt} id={`g${bt.replace(/[^a-z]/gi,"")}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={BLOOD_COLORS[bt]} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={BLOOD_COLORS[bt]} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke={C.border} strokeDasharray="4 4" />
                  <XAxis dataKey="date" tick={{ fill: C.textMute, fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fill: C.textMute, fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.textSub, paddingTop: 12 }} />
                  {activeBTs.map((bt) => (
                    <Area key={bt} type="monotone" dataKey={bt}
                      stroke={BLOOD_COLORS[bt]} strokeWidth={2.5}
                      fill={`url(#g${bt.replace(/[^a-z]/gi,"")})`}
                      dot={false} activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
 
            {/* Metrics row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={card}>
                <p style={sectionLabel}>Métriques Régression Linéaire</p>
                {[
                  ["RMSE",         demand.metrics?.rmse?.toFixed(4) ?? "—", C.red],
                  ["MAE",          demand.metrics?.mae?.toFixed(4)  ?? "—", C.amber],
                  ["R²",           demand.metrics?.r2?.toFixed(4)   ?? "—", C.green],
                  ["CV-5 R² moy.", demand.metrics?.cv_mean?.toFixed(4) ?? "—", C.blue],
                ].map(([k, v, col]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.textSub }}>{k}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: col }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={card}>
                <p style={sectionLabel}>Features utilisées</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {(demand.features || []).map((f) => (
                    <span key={f} style={{
                      background: C.blueBg, color: C.blue,
                      borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 600,
                    }}>{f}</span>
                  ))}
                </div>
                <div style={{ marginTop: 20 }}>
                  <p style={{ ...sectionLabel, marginBottom: 10 }}>Horizon de prévision</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: C.text }}>
                    {demand.forecast_days ?? 30} <span style={{ fontSize: 14, fontWeight: 500, color: C.textSub }}>jours</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
 
        {/* ════════════════════════════════════════════════════════════════════
            TAB 2 — DONOR BEHAVIOR (KNN)
        ════════════════════════════════════════════════════════════════════ */}
        {!loading && !error && tab === "donor" && behavior && (
          <div style={{ animation: "fadeIn .25s ease" }}>
 
            {/* CV Bar chart */}
            <div style={{ ...card, marginBottom: 20 }}>
              <p style={sectionLabel}>Validation croisée 5-Fold — KNN (k={behavior.k_neighbors ?? 7})</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={cvData} margin={{ top: 4, right: 16, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke={C.border} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="fold" tick={{ fill: C.textMute, fontSize: 12 }} />
                  <YAxis
                    domain={[Math.max(0, (behavior.cv_mean - 0.12) * 100), 100]}
                    tick={{ fill: C.textMute, fontSize: 11 }}
                    unit="%"
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine
                    y={behavior.cv_mean * 100}
                    stroke={C.red} strokeDasharray="5 3"
                    label={{ value: `Moy. ${(behavior.cv_mean * 100).toFixed(1)}%`, fill: C.red, fontSize: 11, position: "right" }}
                  />
                  <Bar dataKey="score" name="Accuracy %" radius={[6, 6, 0, 0]}>
                    {cvData.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= entry.mean ? C.green : C.blue} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
 
            {/* Classification report + model info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {["0","1"].map((cls) => {
                const rpt = behavior?.classification_report?.[cls];
                if (!rpt) return null;
                const isPos = cls === "1";
                const accent = isPos ? C.green : C.blue;
                const bgAccent = isPos ? C.greenBg : C.blueBg;
                return (
                  <div key={cls} style={card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                        {isPos ? "Donnera à nouveau" : "Ne donnera pas"}
                      </p>
                      <span style={{ background: bgAccent, color: accent, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        Classe {cls}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        ["Précision",  (rpt.precision * 100).toFixed(1) + "%"],
                        ["Rappel",     (rpt.recall    * 100).toFixed(1) + "%"],
                        ["F1-Score",   (rpt["f1-score"] * 100).toFixed(1) + "%"],
                        ["Support",    rpt.support],
                      ].map(([k, v]) => (
                        <div key={k} style={{ background: C.pageBg, borderRadius: 8, padding: "12px 14px" }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.textMute, marginBottom: 4 }}>{k}</p>
                          <p style={{ fontSize: 20, fontWeight: 800, color: accent }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
 
            {/* Features + distribution */}
            <div style={{ ...card, marginTop: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <p style={sectionLabel}>Variables d'entrée (features)</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {(behavior.features || []).map((f) => (
                      <span key={f} style={{ background: C.pageBg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 600, color: C.textSub }}>{f}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={sectionLabel}>Distribution des classes</p>
                  {[
                    ["Donnera à nouveau", behavior.class_distribution?.will_donate, C.green, C.greenBg],
                    ["Ne donnera pas",    behavior.class_distribution?.wont_donate,  C.blue,  C.blueBg],
                  ].map(([label, count, col, bg]) => {
                    const total = (behavior.class_distribution?.will_donate || 0) + (behavior.class_distribution?.wont_donate || 0);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={label} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                          <span style={{ color: C.textSub }}>{label}</span>
                          <span style={{ fontWeight: 700, color: col }}>{count ?? "—"} ({pct}%)</span>
                        </div>
                        <div style={{ background: C.border, borderRadius: 4, height: 6 }}>
                          <div style={{ width: `${pct}%`, height: 6, borderRadius: 4, background: col, transition: "width .5s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
 
        {/* ════════════════════════════════════════════════════════════════════
            TAB 3 — ZONE / BLOOD-TYPE RISK
        ════════════════════════════════════════════════════════════════════ */}
        {!loading && !error && tab === "risk" && zoneRisk?.zone_risk && (
          <div style={{ animation: "fadeIn .25s ease" }}>
 
            {/* Risk cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 20 }}>
              {zoneData.map((z) => {
                const cfg = RISK_CFG[z.risk] || RISK_CFG.LOW;
                const btCol = BLOOD_COLORS[z.blood_type] || C.red;
                return (
                  <div key={z.blood_type} style={{
                    background: C.white,
                    border: `1.5px solid ${cfg.color}30`,
                    borderLeft: `4px solid ${cfg.color}`,
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <span style={{
                        fontSize: 22, fontWeight: 900, color: btCol,
                        background: `${btCol}12`,
                        borderRadius: 8, padding: "4px 12px",
                      }}>{z.blood_type}</span>
                      <RiskBadge risk={z.risk} />
                    </div>
                    <p style={{ fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1 }}>
                      {z.avg_daily_need}
                    </p>
                    <p style={{ fontSize: 11, color: C.textMute, marginTop: 4, marginBottom: 10 }}>demandes moy. / jour</p>
                    <div style={{ background: C.border, borderRadius: 4, height: 5 }}>
                      <div style={{ width: `${Math.min(100, (z.avg_daily_need / 20) * 100)}%`, height: 5, borderRadius: 4, background: cfg.color, transition: "width .6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
 
            {/* Bar chart */}
            <div style={card}>
              <p style={sectionLabel}>Besoin moyen quotidien par groupe sanguin</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={zoneData} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 32 }}>
                  <CartesianGrid stroke={C.border} strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" tick={{ fill: C.textMute, fontSize: 11 }} />
                  <YAxis type="category" dataKey="blood_type" tick={{ fill: C.text, fontSize: 13, fontWeight: 700 }} width={36} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="avg_daily_need" name="Moy. quotidienne" radius={[0, 6, 6, 0]}>
                    {zoneData.map((entry, i) => (
                      <Cell key={i} fill={BLOOD_COLORS[entry.blood_type] || C.blue} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
 
        {/* ════════════════════════════════════════════════════════════════════
            TAB 4 — HIGH-RISK DONORS TABLE
        ════════════════════════════════════════════════════════════════════ */}
        {!loading && !error && tab === "highRisk" && highRisk && (
          <div style={{ animation: "fadeIn .25s ease" }}>
 
            {/* Summary row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
              <KpiCard label="Donneurs identifiés" value={highRisk.count ?? "—"}        accent={C.red}   sub="Risque de churn élevé" />
              <KpiCard label="KNN Accuracy"         value={highRisk.model_accuracy ? (highRisk.model_accuracy * 100).toFixed(1) : "—"} unit="%" accent={C.blue}  sub="Précision du modèle" />
              <KpiCard label="AUC-ROC"              value={highRisk.model_auc?.toFixed(3) ?? "—"}       accent={C.green} sub="Score discrimination" />
            </div>
 
            {/* Table — same style as Blood Requests */}
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                  Donneurs à risque
                </p>
                <span style={{ background: C.redLight, color: C.red, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                  {highRisk.count ?? 0}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: C.pageBg }}>
                      {["#","ID Donneur","Récence (mois)","Nb Dons","Groupe","Risque Churn","Niveau"].map((h) => (
                        <th key={h} style={{
                          padding: "11px 16px", textAlign: "left",
                          fontSize: 11, fontWeight: 700,
                          letterSpacing: "0.05em", textTransform: "uppercase",
                          color: C.textSub, borderBottom: `2px solid ${C.border}`,
                          whiteSpace: "nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(highRisk.high_risk_donors || []).map((d, i) => {
                      const risk = d.churn_risk >= 0.85 ? "CRITICAL"
                                 : d.churn_risk >= 0.70 ? "HIGH"
                                 : d.churn_risk >= 0.55 ? "MEDIUM" : "LOW";
                      const btMap = {1:"A+",2:"A-",3:"B+",4:"B-",5:"AB+",6:"AB-",7:"O+",8:"O-"};
                      const bt   = btMap[d.blood_type_encoded] || `Type ${d.blood_type_encoded}`;
                      const cfg  = RISK_CFG[risk] || RISK_CFG.LOW;
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "12px 16px", color: C.textMute, fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "monospace", color: C.text }}>
                            #{String(d.donor_id).padStart(5, "0")}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ color: d.recency_months > 12 ? C.red : C.text, fontWeight: d.recency_months > 12 ? 700 : 400 }}>
                              {d.recency_months} mois
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", color: C.text }}>{d.frequency}</td>
                          <td style={{ padding: "12px 16px" }}><BTPill bt={bt} /></td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ flex: 1, background: C.border, borderRadius: 4, height: 6, minWidth: 80 }}>
                                <div style={{
                                  width: `${Math.round(d.churn_risk * 100)}%`,
                                  height: 6, borderRadius: 4, background: cfg.color,
                                }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, minWidth: 38 }}>
                                {Math.round(d.churn_risk * 100)}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}><RiskBadge risk={risk} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
 
        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "grid", gap: 16 }}>
            <Skeleton h={320} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Skeleton h={200} /><Skeleton h={200} />
            </div>
          </div>
        )}
 
      </div>
    </>
  );
}
