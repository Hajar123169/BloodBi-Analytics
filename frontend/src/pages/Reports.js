import React, { useEffect, useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import api from '../api';

const fallback = [
  {
    reportType: 'Rapport de stock',
    centerName: 'CNTS Casablanca',
    city: 'Casablanca',
    status: 'Completed',
    priority: 'Critical',
    findings: 'Stock O- inférieur au seuil minimal',
    reportDate: '2026-05-13'
  },
  {
    reportType: 'Rapport des demandes',
    centerName: 'Hopital Ibn Rochd',
    city: 'Casablanca',
    status: 'Pending',
    priority: 'High',
    findings: 'Demande urgente AB- non encore satisfaite',
    reportDate: '2026-05-13'
  },
  {
    reportType: 'Rapport des donations',
    centerName: 'Centre El Jadida',
    city: 'El Jadida',
    status: 'Completed',
    priority: 'Medium',
    findings: 'Taux de satisfaction des demandes stable',
    reportDate: '2026-05-12'
  }
];

export default function Reports() {
  const [reports, setReports] = useState(fallback);

  useEffect(() => {
    api.get('/reports')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setReports(res.data);
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des rapports :', error);
      });
  }, []);

  const criticalReports = reports.filter(
    (report) => report.priority?.toLowerCase() === 'critical'
  ).length;

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
      'Date'
    ];

    const rows = reports.map((report) => [
      report.reportType || '',
      report.centerName || '',
      report.city || '',
      report.status || '',
      report.priority || '',
      report.findings || '',
      report.reportDate || ''
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

      <div className="kpi-grid small">
        <div className="kpi-card">
          <div className="kpi-label">Total rapports</div>
          <div className="kpi-value">{reports.length}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Critiques</div>
          <div className="kpi-value">{criticalReports}</div>
        </div>
      </div>

      <div className="panel report-print-zone">
        <div className="panel-actions">
          <h2>Rapports BI</h2>

          <div className="no-print">
            <button type="button" onClick={handleExport}>
              <DownloadIcon />
              Export
            </button>

            <button type="button" onClick={handlePrint}>
              <PrintIcon />
              Print
            </button>
          </div>
        </div>

        <table>
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
                <td>{report.status}</td>
                <td>{report.priority}</td>
                <td>{report.findings}</td>
                <td>{report.reportDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}