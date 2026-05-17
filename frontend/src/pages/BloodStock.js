import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

const fallback = [
  {
    id: 1,
    bloodType: 'O_NEG',
    componentType: 'RED_CELLS',
    quantity: 3,
    minThreshold: 10,
    expiryDate: '2026-06-10',
    status: 'CRITICAL',
    center: { name: 'CNTS Casablanca', city: 'Casablanca' }
  },
  {
    id: 2,
    bloodType: 'A_POS',
    componentType: 'PLASMA',
    quantity: 25,
    minThreshold: 10,
    expiryDate: '2026-08-01',
    status: 'NORMAL',
    center: { name: 'CNTS Casablanca', city: 'Casablanca' }
  },
  {
    id: 3,
    bloodType: 'AB_NEG',
    componentType: 'PLATELETS',
    quantity: 2,
    minThreshold: 8,
    expiryDate: '2026-05-20',
    status: 'CRITICAL',
    center: { name: 'Centre de Transfusion Marrakech', city: 'Marrakech' }
  },
  {
    id: 4,
    bloodType: 'O_POS',
    componentType: 'WHOLE_BLOOD',
    quantity: 18,
    minThreshold: 10,
    expiryDate: '2026-06-25',
    status: 'NORMAL',
    center: { name: 'Centre Regional Rabat', city: 'Rabat' }
  },
  {
    id: 5,
    bloodType: 'B_POS',
    componentType: 'RED_CELLS',
    quantity: 9,
    minThreshold: 10,
    expiryDate: '2026-07-02',
    status: 'LOW',
    center: { name: 'Centre El Jadida', city: 'El Jadida' }
  },
  {
    id: 6,
    bloodType: 'AB_POS',
    componentType: 'PLATELETS',
    quantity: 4,
    minThreshold: 6,
    expiryDate: '2026-05-18',
    status: 'LOW',
    center: { name: 'CNTS Casablanca', city: 'Casablanca' }
  },
  {
    id: 7,
    bloodType: 'A_NEG',
    componentType: 'RED_CELLS',
    quantity: 12,
    minThreshold: 10,
    expiryDate: '2026-07-15',
    status: 'NORMAL',
    center: { name: 'Centre Regional Fes', city: 'Fes' }
  }
];

function normalizeStock(stock) {
  return {
    id: stock.id,
    bloodType: stock.bloodType || 'Non défini',
    componentType: stock.componentType || 'Non défini',
    quantity: Number(stock.quantity || 0),
    minThreshold: Number(stock.minThreshold || 0),
    expiryDate: stock.expiryDate || 'Non renseigné',
    status: stock.status || 'NORMAL',
    center: {
      name:
        stock.center?.name ||
        stock.centerName ||
        stock.bloodBankCenter?.name ||
        'Centre non renseigné',
      city:
        stock.center?.city ||
        stock.city ||
        stock.bloodBankCenter?.city ||
        'Ville non renseignée'
    }
  };
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase();

  if (value === 'critical') return 'badge critical';
  if (value === 'low') return 'badge low';
  if (value === 'normal') return 'badge normal';

  return 'badge';
}

export default function BloodStock() {
  const [stocks, setStocks] = useState(fallback);
  const [selectedCity, setSelectedCity] = useState('Toutes villes');
  const [selectedGroup, setSelectedGroup] = useState('Tous groupes');

  useEffect(() => {
    api.get('/stocks')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setStocks(res.data.map(normalizeStock));
        }
      })
      .catch(() => {
        setStocks(fallback);
      });
  }, []);

  const cities = useMemo(() => {
    return [
      'Toutes villes',
      ...new Set(stocks.map((stock) => stock.center?.city).filter(Boolean))
    ];
  }, [stocks]);

  const groups = useMemo(() => {
    return [
      'Tous groupes',
      ...new Set(stocks.map((stock) => stock.bloodType).filter(Boolean))
    ];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesCity =
        selectedCity === 'Toutes villes' || stock.center?.city === selectedCity;

      const matchesGroup =
        selectedGroup === 'Tous groupes' || stock.bloodType === selectedGroup;

      return matchesCity && matchesGroup;
    });
  }, [stocks, selectedCity, selectedGroup]);

  const chartData = useMemo(() => {
    return filteredStocks.map((stock) => ({
      name: `${stock.bloodType} ${stock.center?.city || ''}`,
      quantity: stock.quantity,
      threshold: stock.minThreshold
    }));
  }, [filteredStocks]);

  const handleExport = () => {
    if (!filteredStocks.length) {
      alert('Aucune donnée à exporter.');
      return;
    }

    const headers = [
      'Centre',
      'Ville',
      'Groupe',
      'Composant',
      'Quantité',
      'Seuil',
      'Expire',
      'Statut'
    ];

    const rows = filteredStocks.map((stock) => [
      stock.center?.name || '',
      stock.center?.city || '',
      stock.bloodType || '',
      stock.componentType || '',
      stock.quantity || 0,
      stock.minThreshold || 0,
      stock.expiryDate || '',
      stock.status || ''
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'bloodbi_stocks.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Blood Stock</h1>

      <p className="subtitle">
        Surveillance des stocks par centre, groupe sanguin et composant.
      </p>

      <div className="panel stock-chart-panel">
        <h2>Stocks vs seuils minimaux</h2>

        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1dada" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="quantity"
              name="Quantité"
              fill="#d71920"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="threshold"
              name="Seuil minimal"
              fill="#d8c5c5"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="panel stock-detail-panel">
        <div className="stock-detail-header">
          <h2>Détail des stocks</h2>

          <div className="stock-actions">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <button type="button" className="export-btn" onClick={handleExport}>
              <DownloadIcon fontSize="small" />
              Export
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Centre</th>
              <th>Ville</th>
              <th>Groupe</th>
              <th>Composant</th>
              <th>Quantité</th>
              <th>Seuil</th>
              <th>Expire</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {filteredStocks.map((stock, index) => (
              <tr key={stock.id || index}>
                <td>{stock.center?.name}</td>
                <td>{stock.center?.city}</td>
                <td>
                  <span className="blood-badge">
                    {stock.bloodType}
                  </span>
                </td>
                <td>{stock.componentType}</td>
                <td>
                  <strong>{stock.quantity}</strong>
                </td>
                <td>{stock.minThreshold}</td>
                <td>{stock.expiryDate}</td>
                <td>
                  <span className={getStatusClass(stock.status)}>
                    {stock.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredStocks.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-row">
                  Aucun stock trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}