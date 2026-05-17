import React, { useEffect, useMemo, useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import api from '../api';

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

const olapByCityFallback = [
  {
    city: 'Casablanca',
    requests: 2,
    pending: 2,
    fulfilled: 0,
    satisfaction: 0,
    totalStock: 32
  },
  {
    city: 'Rabat',
    requests: 1,
    pending: 0,
    fulfilled: 1,
    satisfaction: 100,
    totalStock: 18
  },
  {
    city: 'Marrakech',
    requests: 1,
    pending: 1,
    fulfilled: 0,
    satisfaction: 0,
    totalStock: 2
  },
  {
    city: 'El Jadida',
    requests: 1,
    pending: 0,
    fulfilled: 1,
    satisfaction: 100,
    totalStock: 9
  },
  {
    city: 'Fes',
    requests: 1,
    pending: 1,
    fulfilled: 0,
    satisfaction: 0,
    totalStock: 12
  }
];

const olapByBloodTypeFallback = [
  {
    bloodType: 'O_NEG',
    requests: 2,
    donors: 1,
    availableDonors: 1,
    stock: 3,
    risk: 'HIGH'
  },
  {
    bloodType: 'A_POS',
    requests: 1,
    donors: 1,
    availableDonors: 1,
    stock: 25,
    risk: 'LOW'
  },
  {
    bloodType: 'AB_NEG',
    requests: 1,
    donors: 1,
    availableDonors: 0,
    stock: 2,
    risk: 'HIGH'
  },
  {
    bloodType: 'B_POS',
    requests: 1,
    donors: 1,
    availableDonors: 1,
    stock: 9,
    risk: 'MEDIUM'
  },
  {
    bloodType: 'O_POS',
    requests: 0,
    donors: 1,
    availableDonors: 1,
    stock: 18,
    risk: 'LOW'
  }
];

const olapByCenterFallback = [
  {
    centerName: 'CNTS Casablanca',
    city: 'Casablanca',
    donations: 2,
    requests: 2,
    criticalStocks: 1,
    totalStock: 32
  },
  {
    centerName: 'Centre Régional Rabat',
    city: 'Rabat',
    donations: 1,
    requests: 1,
    criticalStocks: 0,
    totalStock: 18
  },
  {
    centerName: 'Centre de Transfusion Marrakech',
    city: 'Marrakech',
    donations: 0,
    requests: 1,
    criticalStocks: 1,
    totalStock: 2
  },
  {
    centerName: 'Centre El Jadida',
    city: 'El Jadida',
    donations: 1,
    requests: 1,
    criticalStocks: 0,
    totalStock: 9
  }
];

const olapByPeriodFallback = [
  {
    period: 'Janvier',
    donations: 38,
    requests: 45,
    fulfilled: 18,
    satisfaction: 40
  },
  {
    period: 'Février',
    donations: 44,
    requests: 52,
    fulfilled: 22,
    satisfaction: 42
  },
  {
    period: 'Mars',
    donations: 51,
    requests: 60,
    fulfilled: 25,
    satisfaction: 42
  },
  {
    period: 'Avril',
    donations: 66,
    requests: 72,
    fulfilled: 34,
    satisfaction: 47
  },
  {
    period: 'Mai',
    donations: 78,
    requests: 95,
    fulfilled: 40,
    satisfaction: 42
  },
  {
    period: 'Juin',
    donations: 89,
    requests: 110,
    fulfilled: 44,
    satisfaction: 40
  }
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

  const [cityFilter, setCityFilter] = useState('Toutes villes');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('Tous groupes');
  const [centerFilter, setCenterFilter] = useState('Tous centres');
  const [periodFilter, setPeriodFilter] = useState('Toutes périodes');

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

  const totalReports = reports.length;

  const criticalReports = reports.filter(
    (report) => report.priority?.toLowerCase() === 'critical'
  ).length;

  const averageSatisfaction = useMemo(() => {
    const rates = reports
      .map((report) => Number(report.satisfactionRate || 0))
      .filter((rate) => rate > 0);

    if (rates.length === 0) {
      return 40;
    }

    const total = rates.reduce((sum, rate) => sum + rate, 0);
    return Math.round(total / rates.length);
  }, [reports]);

  const cityOptions = useMemo(() => {
    return ['Toutes villes', ...new Set(olapByCityFallback.map((row) => row.city))];
  }, []);

  const bloodTypeOptions = useMemo(() => {
    return ['Tous groupes', ...new Set(olapByBloodTypeFallback.map((row) => row.bloodType))];
  }, []);

  const centerOptions = useMemo(() => {
    return ['Tous centres', ...new Set(olapByCenterFallback.map((row) => row.centerName))];
  }, []);

  const periodOptions = useMemo(() => {
    return ['Toutes périodes', ...new Set(olapByPeriodFallback.map((row) => row.period))];
  }, []);

  const filteredOlapByCity = useMemo(() => {
    return olapByCityFallback.filter((row) => {
      return cityFilter === 'Toutes villes' || row.city === cityFilter;
    });
  }, [cityFilter]);

  const filteredOlapByBloodType = useMemo(() => {
    return olapByBloodTypeFallback.filter((row) => {
      return bloodTypeFilter === 'Tous groupes' || row.bloodType === bloodTypeFilter;
    });
  }, [bloodTypeFilter]);

  const filteredOlapByCenter = useMemo(() => {
    return olapByCenterFallback.filter((row) => {
      return centerFilter === 'Tous centres' || row.centerName === centerFilter;
    });
  }, [centerFilter]);

  const filteredOlapByPeriod = useMemo(() => {
    return olapByPeriodFallback.filter((row) => {
      return periodFilter === 'Toutes périodes' || row.period === periodFilter;
    });
  }, [periodFilter]);

  const handleExport = () => {
    if (!reports || reports.length === 0) {
      alert('Aucun rapport à exporter.');
      return;
    }

    const headers = [
      'Type',
      'Centre',
      'Ville',
      'Statut',
      'Priorité',
      'Findings',
      'Date',
      'Satisfaction'
    ];

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
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(';')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

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

  return (
    <div>
      <h1>Reports</h1>

      <p className="subtitle">
        Reporting BI avancé avec analyse OLAP, export et impression.
      </p>

      <div className="reports-kpi-grid">
        <div className="report-kpi-card">
          <div>
            <div className="report-kpi-label">TOTAL RAPPORTS</div>
            <div className="report-kpi-value">{totalReports}</div>
          </div>

          <div className="report-kpi-icon icon-red">
            <DescriptionIcon />
          </div>
        </div>

        <div className="report-kpi-card">
          <div>
            <div className="report-kpi-label">CRITIQUES</div>
            <div className="report-kpi-value">{criticalReports}</div>
          </div>

          <div className="report-kpi-icon icon-orange">
            <WarningAmberIcon />
          </div>
        </div>

        <div className="report-kpi-card">
          <div>
            <div className="report-kpi-label">SATISFACTION MOYENNE</div>
            <div className="report-kpi-value">{averageSatisfaction}%</div>
          </div>

          <div className="report-kpi-icon icon-green">
            <AssignmentTurnedInIcon />
          </div>
        </div>
      </div>

      <div className="panel reports-panel report-print-zone">
        <div className="reports-panel-header">
          <h2>Rapports BI</h2>

          <div className="reports-actions no-print">
            <button
              type="button"
              className="report-export-btn"
              onClick={handleExport}
            >
              <DownloadIcon fontSize="small" />
              Export
            </button>

            <button
              type="button"
              className="report-print-btn"
              onClick={handlePrint}
            >
              <PrintIcon fontSize="small" />
              Print
            </button>
          </div>
        </div>

        <table className="reports-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Centre</th>
              <th>Ville</th>
              <th>Statut</th>
              <th>Priorité</th>
              <th>Findings</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report, index) => (
              <tr key={report.id || index}>
                <td>{report.reportType}</td>
                <td>{report.centerName}</td>
                <td>{report.city}</td>

                <td>
                  <span className={getStatusClass(report.status)}>
                    {String(report.status).toUpperCase()}
                  </span>
                </td>

                <td>
                  <span className={getPriorityClass(report.priority)}>
                    {String(report.priority).toUpperCase()}
                  </span>
                </td>

                <td>{report.findings}</td>
                <td>{report.reportDate}</td>
              </tr>
            ))}

            {reports.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">
                  Aucun rapport trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel olap-panel">
        <div className="olap-panel-header">
          <div>
            <h2>Analyse OLAP — par ville</h2>
            <p>Analyse croisée des demandes, demandes satisfaites et stocks par ville.</p>
          </div>

          <div className="olap-filters">
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="reports-table olap-table">
          <thead>
            <tr>
              <th>Ville</th>
              <th>Demandes</th>
              <th>En attente</th>
              <th>Satisfaites</th>
              <th>Satisfaction</th>
              <th>Stock total</th>
            </tr>
          </thead>

          <tbody>
            {filteredOlapByCity.map((row) => (
              <tr key={row.city}>
                <td>
                  <strong>{row.city}</strong>
                </td>
                <td>{row.requests}</td>
                <td>{row.pending}</td>
                <td>{row.fulfilled}</td>
                <td className={row.satisfaction >= 50 ? 'olap-good' : 'olap-bad'}>
                  {row.satisfaction}%
                </td>
                <td>{row.totalStock}</td>
              </tr>
            ))}

            {filteredOlapByCity.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  Aucune donnée trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel olap-panel">
        <div className="olap-panel-header">
          <div>
            <h2>Analyse OLAP — par groupe sanguin</h2>
            <p>Analyse du risque selon les demandes, les donneurs disponibles et le stock.</p>
          </div>

          <div className="olap-filters">
            <select
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
            >
              {bloodTypeOptions.map((bloodType) => (
                <option key={bloodType} value={bloodType}>
                  {bloodType}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="reports-table olap-table">
          <thead>
            <tr>
              <th>Groupe</th>
              <th>Demandes</th>
              <th>Donneurs</th>
              <th>Donneurs disponibles</th>
              <th>Stock</th>
              <th>Risque</th>
            </tr>
          </thead>

          <tbody>
            {filteredOlapByBloodType.map((row) => (
              <tr key={row.bloodType}>
                <td>
                  <span className="blood-badge">{row.bloodType}</span>
                </td>
                <td>{row.requests}</td>
                <td>{row.donors}</td>
                <td>{row.availableDonors}</td>
                <td>{row.stock}</td>
                <td>
                  <span className={getRiskClass(row.risk)}>
                    {row.risk}
                  </span>
                </td>
              </tr>
            ))}

            {filteredOlapByBloodType.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  Aucune donnée trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel olap-panel">
        <div className="olap-panel-header">
          <div>
            <h2>Analyse OLAP — par centre</h2>
            <p>Comparaison des centres selon les dons, les demandes, les stocks critiques et le stock total.</p>
          </div>

          <div className="olap-filters">
            <select value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)}>
              {centerOptions.map((center) => (
                <option key={center} value={center}>
                  {center}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="reports-table olap-table">
          <thead>
            <tr>
              <th>Centre</th>
              <th>Ville</th>
              <th>Dons</th>
              <th>Demandes</th>
              <th>Stocks critiques</th>
              <th>Stock total</th>
            </tr>
          </thead>

          <tbody>
            {filteredOlapByCenter.map((row) => (
              <tr key={row.centerName}>
                <td>
                  <strong>{row.centerName}</strong>
                </td>
                <td>{row.city}</td>
                <td>{row.donations}</td>
                <td>{row.requests}</td>
                <td>
                  <span
                    className={
                      row.criticalStocks > 0
                        ? 'report-badge priority-critical'
                        : 'report-badge status-completed'
                    }
                  >
                    {row.criticalStocks}
                  </span>
                </td>
                <td>{row.totalStock}</td>
              </tr>
            ))}

            {filteredOlapByCenter.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  Aucune donnée trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel olap-panel">
        <div className="olap-panel-header">
          <div>
            <h2>Analyse OLAP — par période</h2>
            <p>Évolution des dons, demandes et taux de satisfaction sur plusieurs mois.</p>
          </div>

          <div className="olap-filters">
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
              {periodOptions.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="reports-table olap-table">
          <thead>
            <tr>
              <th>Période</th>
              <th>Dons</th>
              <th>Demandes</th>
              <th>Satisfaites</th>
              <th>Satisfaction</th>
            </tr>
          </thead>

          <tbody>
            {filteredOlapByPeriod.map((row) => (
              <tr key={row.period}>
                <td>
                  <strong>{row.period}</strong>
                </td>
                <td>{row.donations}</td>
                <td>{row.requests}</td>
                <td>{row.fulfilled}</td>
                <td className={row.satisfaction >= 50 ? 'olap-good' : 'olap-warning'}>
                  {row.satisfaction}%
                </td>
              </tr>
            ))}

            {filteredOlapByPeriod.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-row">
                  Aucune donnée trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}