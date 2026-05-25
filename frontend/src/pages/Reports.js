import React, { useEffect, useMemo, useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import api from '../api';

// Données de secours (fallbacks)
const fallback = [
  {
    id: 1,
    reportType: 'Rapport de stock',
    centerName: 'CNTS Casablanca',
    city: 'Casablanca',
    status: 'Completed',
    priority: 'Critical',
    findings: 'Stock O- inférieur au seuil minimal',
    reportDate: '2026-05-13',
    satisfactionRate: 25
  },
  {
    id: 2,
    reportType: 'Rapport des demandes',
    centerName: 'Hopital Ibn Rochd',
    city: 'Casablanca',
    status: 'Pending',
    priority: 'High',
    findings: 'Demande urgente AB- non encore satisfaite',
    reportDate: '2026-05-13',
    satisfactionRate: 35
  },
  {
    id: 3,
    reportType: 'Rapport des donations',
    centerName: 'Centre El Jadida',
    city: 'El Jadida',
    status: 'Completed',
    priority: 'Medium',
    findings: 'Taux de satisfaction des demandes stable',
    reportDate: '2026-05-12',
    satisfactionRate: 50
  },
  {
    id: 4,
    reportType: 'Rapport OLAP par ville',
    centerName: 'Multi-centres',
    city: 'Maroc',
    status: 'Completed',
    priority: 'Low',
    findings: 'Casablanca concentre 42% des demandes nationales',
    reportDate: '2026-05-10',
    satisfactionRate: 50
  }
];

// Fallbacks OLAP (utilisés uniquement si l'API échoue)
const olapByCityFallback = [
  { city: 'Casablanca', total_requests: 2, pending_requests: 2, fulfilled_requests: 0, satisfaction_rate: 0, total_stock: 32 },
  { city: 'Rabat', total_requests: 1, pending_requests: 0, fulfilled_requests: 1, satisfaction_rate: 100, total_stock: 18 },
  { city: 'Marrakech', total_requests: 1, pending_requests: 1, fulfilled_requests: 0, satisfaction_rate: 0, total_stock: 2 },
  { city: 'El Jadida', total_requests: 1, pending_requests: 0, fulfilled_requests: 1, satisfaction_rate: 100, total_stock: 9 },
  { city: 'Fes', total_requests: 1, pending_requests: 1, fulfilled_requests: 0, satisfaction_rate: 0, total_stock: 12 }
];

const olapByBloodTypeFallback = [
  { blood_type: 'O_NEG', total_requests: 2, total_donors: 1, available_donors: 1, total_stock: 3, risk_level: 'HIGH' },
  { blood_type: 'A_POS', total_requests: 1, total_donors: 1, available_donors: 1, total_stock: 25, risk_level: 'LOW' },
  { blood_type: 'AB_NEG', total_requests: 1, total_donors: 1, available_donors: 0, total_stock: 2, risk_level: 'HIGH' },
  { blood_type: 'B_POS', total_requests: 1, total_donors: 1, available_donors: 1, total_stock: 9, risk_level: 'MEDIUM' },
  { blood_type: 'O_POS', total_requests: 0, total_donors: 1, available_donors: 1, total_stock: 18, risk_level: 'LOW' }
];

const olapByCenterFallback = [
  { center_name: 'CNTS Casablanca', city: 'Casablanca', total_donations: 2, total_requests: 2, critical_stocks: 1, total_stock: 32 },
  { center_name: 'Centre Régional Rabat', city: 'Rabat', total_donations: 1, total_requests: 1, critical_stocks: 0, total_stock: 18 },
  { center_name: 'Centre de Transfusion Marrakech', city: 'Marrakech', total_donations: 0, total_requests: 1, critical_stocks: 1, total_stock: 2 },
  { center_name: 'Centre El Jadida', city: 'El Jadida', total_donations: 1, total_requests: 1, critical_stocks: 0, total_stock: 9 }
];

const olapByPeriodFallback = [
  { period: 'Janvier', total_donations: 38, total_requests: 45, fulfilled_requests: 18, satisfaction_rate: 40 },
  { period: 'Février', total_donations: 44, total_requests: 52, fulfilled_requests: 22, satisfaction_rate: 42 },
  { period: 'Mars', total_donations: 51, total_requests: 60, fulfilled_requests: 25, satisfaction_rate: 42 },
  { period: 'Avril', total_donations: 66, total_requests: 72, fulfilled_requests: 34, satisfaction_rate: 47 },
  { period: 'Mai', total_donations: 78, total_requests: 95, fulfilled_requests: 40, satisfaction_rate: 42 },
  { period: 'Juin', total_donations: 89, total_requests: 110, fulfilled_requests: 44, satisfaction_rate: 40 }
];

function normalizeReport(report) {
  return {
    id: report.id,
    reportType: report.reportType || report.type || '',
    centerName: report.centerName || report.center || '',
    city: report.city || '',
    status: report.status || 'Pending',
    priority: report.priority || 'Medium',
    findings: report.findings || '',
    reportDate: report.reportDate || report.date || '',
    satisfactionRate: Number(report.satisfactionRate || 0)
  };
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'completed') return 'report-badge status-completed';
  if (value === 'pending') return 'report-badge status-pending';
  if (value === 'cancelled') return 'report-badge status-cancelled';
  return 'report-badge status-pending';
}

function getPriorityClass(priority) {
  const value = String(priority || '').toLowerCase();
  if (value === 'critical') return 'report-badge priority-critical';
  if (value === 'high') return 'report-badge priority-high';
  if (value === 'medium') return 'report-badge priority-medium';
  if (value === 'low') return 'report-badge priority-low';
  return 'report-badge priority-medium';
}

function getRiskClass(risk) {
  const value = String(risk || '').toLowerCase();
  if (value === 'high') return 'report-badge priority-critical';
  if (value === 'medium') return 'report-badge priority-high';
  if (value === 'low') return 'report-badge status-completed';
  return 'report-badge status-pending';
}

export default function Reports() {
  const [reports, setReports] = useState(fallback);
  // États pour les données OLAP réelles
  const [olapByCity, setOlapByCity] = useState(olapByCityFallback);
  const [olapByBloodType, setOlapByBloodType] = useState(olapByBloodTypeFallback);
  const [olapByCenter, setOlapByCenter] = useState(olapByCenterFallback);
  const [olapByPeriod, setOlapByPeriod] = useState(olapByPeriodFallback);
  const [loadingOlap, setLoadingOlap] = useState(true);

  const [cityFilter, setCityFilter] = useState('Toutes villes');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('Tous groupes');
  const [centerFilter, setCenterFilter] = useState('Tous centres');
  const [periodFilter, setPeriodFilter] = useState('Toutes périodes');

  // Chargement des rapports (existants)
  useEffect(() => {
    api.get('/reports')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const apiReports = res.data.map(normalizeReport);
          const hasOlapReport = apiReports.some((report) =>
            report.reportType?.toLowerCase().includes('olap')
          );
          if (hasOlapReport) {
            setReports(apiReports);
          } else {
            setReports([...apiReports, fallback[3]]);
          }
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des rapports :', error);
        setReports(fallback);
      });
  }, []);

  // Chargement des données OLAP depuis les nouvelles vues
  useEffect(() => {
    const fetchOlapData = async () => {
      setLoadingOlap(true);
      try {
        const [cityRes, bloodRes, centerRes, periodRes] = await Promise.all([
          api.get('/olap/by-city'),
          api.get('/olap/by-blood-type'),
          api.get('/olap/by-center'),
          api.get('/olap/by-period')
        ]);
        setOlapByCity(Array.isArray(cityRes.data) && cityRes.data.length ? cityRes.data : olapByCityFallback);
        setOlapByBloodType(Array.isArray(bloodRes.data) && bloodRes.data.length ? bloodRes.data : olapByBloodTypeFallback);
        setOlapByCenter(Array.isArray(centerRes.data) && centerRes.data.length ? centerRes.data : olapByCenterFallback);
        setOlapByPeriod(Array.isArray(periodRes.data) && periodRes.data.length ? periodRes.data : olapByPeriodFallback);
      } catch (error) {
        console.error('Erreur chargement données OLAP :', error);
        // Garde les fallbacks déjà présents
      } finally {
        setLoadingOlap(false);
      }
    };
    fetchOlapData();
  }, []);

  const totalReports = reports.length;
  const criticalReports = reports.filter(
    (report) => report.priority?.toLowerCase() === 'critical'
  ).length;

  const averageSatisfaction = useMemo(() => {
    const rates = reports
      .map((report) => Number(report.satisfactionRate || 0))
      .filter((rate) => rate > 0);
    if (rates.length === 0) return 40;
    return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
  }, [reports]);

  // Options de filtres dynamiques (basées sur les données réelles)
  const cityOptions = useMemo(() => {
    return ['Toutes villes', ...new Set(olapByCity.map((row) => row.city))];
  }, [olapByCity]);

  const bloodTypeOptions = useMemo(() => {
    return ['Tous groupes', ...new Set(olapByBloodType.map((row) => row.blood_type))];
  }, [olapByBloodType]);

  const centerOptions = useMemo(() => {
    return ['Tous centres', ...new Set(olapByCenter.map((row) => row.center_name))];
  }, [olapByCenter]);

  const periodOptions = useMemo(() => {
    return ['Toutes périodes', ...new Set(olapByPeriod.map((row) => row.period))];
  }, [olapByPeriod]);

  // Filtrage des données OLAP
  const filteredOlapByCity = useMemo(() => {
    return olapByCity.filter((row) => cityFilter === 'Toutes villes' || row.city === cityFilter);
  }, [olapByCity, cityFilter]);

  const filteredOlapByBloodType = useMemo(() => {
    return olapByBloodType.filter((row) => bloodTypeFilter === 'Tous groupes' || row.blood_type === bloodTypeFilter);
  }, [olapByBloodType, bloodTypeFilter]);

  const filteredOlapByCenter = useMemo(() => {
    return olapByCenter.filter((row) => centerFilter === 'Tous centres' || row.center_name === centerFilter);
  }, [olapByCenter, centerFilter]);

  const filteredOlapByPeriod = useMemo(() => {
    return olapByPeriod.filter((row) => periodFilter === 'Toutes périodes' || row.period === periodFilter);
  }, [olapByPeriod, periodFilter]);

  const handleExport = () => {
    if (!reports || reports.length === 0) {
      alert('Aucun rapport à exporter.');
      return;
    }
    const headers = ['Type', 'Centre', 'Ville', 'Statut', 'Priorité', 'Findings', 'Date', 'Satisfaction'];
    const rows = reports.map((report) => [
      report.reportType || '',
      report.centerName || '',
      report.city || '',
      report.status || '',
      report.priority || '',
      report.findings || '',
      report.reportDate || '',
      `${report.satisfactionRate || averageSatisfaction}%`
    ]);
    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bloodbi_reports.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loadingOlap) {
    // Optionnel : afficher un indicateur de chargement
    // return <div>Chargement des données OLAP...</div>;
  }

  return (
    <div>
      <h1>Reports</h1>
      <p className="subtitle">Reporting BI avancé avec analyse OLAP, export et impression.</p>

      <div className="reports-kpi-grid">
        <div className="report-kpi-card">
          <div>
            <div className="report-kpi-label">TOTAL RAPPORTS</div>
            <div className="report-kpi-value">{totalReports}</div>
          </div>
          <div className="report-kpi-icon icon-red"><DescriptionIcon /></div>
        </div>
        <div className="report-kpi-card">
          <div>
            <div className="report-kpi-label">CRITIQUES</div>
            <div className="report-kpi-value">{criticalReports}</div>
          </div>
          <div className="report-kpi-icon icon-orange"><WarningAmberIcon /></div>
        </div>
        <div className="report-kpi-card">
          <div>
            <div className="report-kpi-label">SATISFACTION MOYENNE</div>
            <div className="report-kpi-value">{averageSatisfaction}%</div>
          </div>
          <div className="report-kpi-icon icon-green"><AssignmentTurnedInIcon /></div>
        </div>
      </div>

      {/* Tableau des rapports BI */}
      <div className="panel reports-panel report-print-zone">
        <div className="reports-panel-header">
          <h2>Rapports BI</h2>
          <div className="reports-actions no-print">
            <button type="button" className="report-export-btn" onClick={handleExport}><DownloadIcon fontSize="small" /> Export</button>
            <button type="button" className="report-print-btn" onClick={handlePrint}><PrintIcon fontSize="small" /> Print</button>
          </div>
        </div>
        <table className="reports-table">
          <thead>
            <tr><th>Type</th><th>Centre</th><th>Ville</th><th>Statut</th><th>Priorité</th><th>Findings</th><th>Date</th></tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr key={report.id || index}>
                <td>{report.reportType}</td>
                <td>{report.centerName}</td>
                <td>{report.city}</td>
                <td><span className={getStatusClass(report.status)}>{String(report.status).toUpperCase()}</span></td>
                <td><span className={getPriorityClass(report.priority)}>{String(report.priority).toUpperCase()}</span></td>
                <td>{report.findings}</td>
                <td>{report.reportDate}</td>
              </tr>
            ))}
            {reports.length === 0 && <tr><td colSpan="7" className="empty-row">Aucun rapport trouvé.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* OLAP par ville */}
      <div className="panel olap-panel">
        <div className="olap-panel-header">
          <div><h2>Analyse OLAP — par ville</h2><p>Analyse croisée des demandes, demandes satisfaites et stocks par ville.</p></div>
          <div className="olap-filters">
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
              {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>
        <table className="reports-table olap-table">
          <thead><tr><th>Ville</th><th>Demandes</th><th>En attente</th><th>Satisfaites</th><th>Satisfaction</th><th>Stock total</th></tr></thead>
          <tbody>
            {filteredOlapByCity.map((row) => (
              <tr key={row.city}>
                <td><strong>{row.city}</strong></td>
                <td>{row.total_requests}</td>
                <td>{row.pending_requests}</td>
                <td>{row.fulfilled_requests}</td>
                <td className={row.satisfaction_rate >= 50 ? 'olap-good' : 'olap-bad'}>{row.satisfaction_rate}%</td>
                <td>{row.total_stock}</td>
              </tr>
            ))}
            {filteredOlapByCity.length === 0 && <tr><td colSpan="6" className="empty-row">Aucune donnée trouvée.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* OLAP par groupe sanguin */}
      <div className="panel olap-panel">
        <div className="olap-panel-header">
          <div><h2>Analyse OLAP — par groupe sanguin</h2><p>Analyse du risque selon les demandes, les donneurs disponibles et le stock.</p></div>
          <div className="olap-filters">
            <select value={bloodTypeFilter} onChange={(e) => setBloodTypeFilter(e.target.value)}>
              {bloodTypeOptions.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>
        </div>
        <table className="reports-table olap-table">
          <thead><tr><th>Groupe</th><th>Demandes</th><th>Donneurs</th><th>Donneurs disponibles</th><th>Stock</th><th>Risque</th></tr></thead>
          <tbody>
            {filteredOlapByBloodType.map((row) => (
              <tr key={row.blood_type}>
                <td><span className="blood-badge">{row.blood_type}</span></td>
                <td>{row.total_requests}</td>
                <td>{row.total_donors}</td>
                <td>{row.available_donors}</td>
                <td>{row.total_stock}</td>
                <td><span className={getRiskClass(row.risk_level)}>{row.risk_level}</span></td>
              </tr>
            ))}
            {filteredOlapByBloodType.length === 0 && <tr><td colSpan="6" className="empty-row">Aucune donnée trouvée.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* OLAP par centre */}
      <div className="panel olap-panel">
        <div className="olap-panel-header">
          <div><h2>Analyse OLAP — par centre</h2><p>Comparaison des centres selon les dons, les demandes, les stocks critiques et le stock total.</p></div>
          <div className="olap-filters">
            <select value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)}>
              {centerOptions.map((center) => <option key={center} value={center}>{center}</option>)}
            </select>
          </div>
        </div>
        <table className="reports-table olap-table">
          <thead><tr><th>Centre</th><th>Ville</th><th>Dons</th><th>Demandes</th><th>Stocks critiques</th><th>Stock total</th></tr></thead>
          <tbody>
            {filteredOlapByCenter.map((row) => (
              <tr key={row.center_name}>
                <td><strong>{row.center_name}</strong></td>
                <td>{row.city}</td>
                <td>{row.total_donations}</td>
                <td>{row.total_requests}</td>
                <td><span className={row.critical_stocks > 0 ? 'report-badge priority-critical' : 'report-badge status-completed'}>{row.critical_stocks}</span></td>
                <td>{row.total_stock}</td>
              </tr>
            ))}
            {filteredOlapByCenter.length === 0 && <tr><td colSpan="6" className="empty-row">Aucune donnée trouvée.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* OLAP par période */}
      <div className="panel olap-panel">
        <div className="olap-panel-header">
          <div><h2>Analyse OLAP — par période</h2><p>Évolution des dons, demandes et taux de satisfaction sur plusieurs mois.</p></div>
          <div className="olap-filters">
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
              {periodOptions.map((period) => <option key={period} value={period}>{period}</option>)}
            </select>
          </div>
        </div>
        <table className="reports-table olap-table">
          <thead><tr><th>Période</th><th>Dons</th><th>Demandes</th><th>Satisfaites</th><th>Satisfaction</th></tr></thead>
          <tbody>
            {filteredOlapByPeriod.map((row) => (
              <tr key={row.period}>
                <td><strong>{row.period}</strong></td>
                <td>{row.total_donations}</td>
                <td>{row.total_requests}</td>
                <td>{row.fulfilled_requests}</td>
                <td className={row.satisfaction_rate >= 50 ? 'olap-good' : 'olap-warning'}>{row.satisfaction_rate}%</td>
              </tr>
            ))}
            {filteredOlapByPeriod.length === 0 && <tr><td colSpan="5" className="empty-row">Aucune donnée trouvée.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}