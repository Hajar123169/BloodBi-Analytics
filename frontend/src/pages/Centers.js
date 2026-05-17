import React, { useEffect, useState } from 'react';
import api from '../api';

const fallback = [
  {
    name: 'CNTS Casablanca',
    city: 'Casablanca',
    address: 'Rue des Hopitaux',
    phone: '0522000001',
    active: true
  },
  {
    name: 'Centre Regional Rabat',
    city: 'Rabat',
    address: 'Avenue Mohammed V',
    phone: '0537000002',
    active: true
  },
  {
    name: 'Centre de Transfusion Marrakech',
    city: 'Marrakech',
    address: 'Gueliz',
    phone: '0524000003',
    active: true
  }
];

export default function Centers() {
  const [centers, setCenters] = useState(fallback);

  useEffect(() => {
    api.get('/centers')
      .then((res) => setCenters(res.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1>Donation Centers</h1>

      <p className="subtitle">
        Centres de collecte et banques de sang suivis par BloodBI.
      </p>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Centre</th>
              <th>Ville</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Actif</th>
            </tr>
          </thead>

          <tbody>
            {centers.map((center, index) => (
              <tr key={center.id || index}>
                <td>{center.name}</td>
                <td>{center.city}</td>
                <td>{center.address}</td>
                <td>{center.phone}</td>
                <td>
                  <span className={center.active ? 'center-active-badge' : 'center-inactive-badge'}>
                    {center.active ? 'Oui' : 'Non'}
                  </span>
                </td>
              </tr>
            ))}

            {centers.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-row">
                  Aucun centre trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}