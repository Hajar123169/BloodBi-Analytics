import React, { useEffect, useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import api from '../api';

const bloodTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

const fallbackRequests = [
  { patientName: 'Patient A', bloodType: 'O_NEG', urgency: 'CRITICAL', city: 'Casablanca', hospital: 'CHU Ibn Rochd' },
  { patientName: 'Patient B', bloodType: 'AB_NEG', urgency: 'HIGH', city: 'Casablanca', hospital: 'Hopital Ibn Rochd' },
  { patientName: 'Patient C', bloodType: 'A_POS', urgency: 'MEDIUM', city: 'El Jadida', hospital: 'Hopital Mohammed V' }
];

const compatibleMatrix = {
  A_POS: ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
  A_NEG: ['A_NEG', 'O_NEG'],
  B_POS: ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  B_NEG: ['B_NEG', 'O_NEG'],
  AB_POS: ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'],
  AB_NEG: ['A_NEG', 'B_NEG', 'AB_NEG', 'O_NEG'],
  O_POS: ['O_POS', 'O_NEG'],
  O_NEG: ['O_NEG']
};

function recommendationLabel(value) {
  if (value === 'EXCELLENT') return 'Excellent';
  if (value === 'GOOD') return 'Bon choix';
  return 'Possible';
}

export default function DonorMatcher() {
  const [patientBloodType, setPatientBloodType] = useState('O_NEG');
  const [city, setCity] = useState('Casablanca');
  const [requests, setRequests] = useState(fallbackRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schedulingId, setSchedulingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/requests?status=PENDING')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRequests(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const compatibleTypes = useMemo(() => compatibleMatrix[patientBloodType] || [], [patientBloodType]);

  async function findDonors(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let response;

      if (selectedRequest?.id) {
        response = await api.get(`/matching/requests/${selectedRequest.id}?limit=20`);
      } else {
        const params = new URLSearchParams({
          bloodType: patientBloodType,
          limit: '20'
        });

        if (city.trim()) {
          params.append('city', city.trim());
        }

        response = await api.get(`/matching/search?${params.toString()}`);
      }

      const nextMatches = Array.isArray(response.data?.matches)
        ? response.data.matches
        : [];

      setMatches(nextMatches);

      if (nextMatches.length === 0) {
        setMessage(
          'Aucun donneur compatible disponible. Essayez une autre ville ou vérifiez la disponibilité des donneurs.'
        );
      }
    } catch (error) {
      setMessage(
        'Impossible de charger le matching intelligent. Vérifiez que le backend est lancé.'
      );
    } finally {
      setLoading(false);
    }
  }

  function useRequest(request) {
    setSelectedRequest(request);
    setPatientBloodType(request.bloodType || 'O_NEG');
    setCity(request.city || '');
    setMatches([]);

    setMessage(
      request.id
        ? 'Demande sélectionnée. Cliquez sur Lancer le matching intelligent.'
        : 'Critères copiés depuis la demande. Cliquez sur Rechercher.'
    );
  }

  function clearRequest() {
    setSelectedRequest(null);
    setMatches([]);
    setMessage('Mode recherche libre activé. Choisissez le groupe sanguin et la ville.');
  }

  async function scheduleDonation(donorId) {
  if (!selectedRequest?.id) {
    setMessage('Veuillez sélectionner une demande avant de créer un rendez-vous.');
    return;
  }

  if (!donorId) {
    setMessage('Donneur invalide. Impossible de créer le rendez-vous.');
    return;
  }

  const confirmCreate = window.confirm(
    'Voulez-vous confirmer la création du rendez-vous pour ce donneur ?'
  );

  if (!confirmCreate) {
    setMessage('Création du rendez-vous annulée.');
    return;
  }

  setSchedulingId(donorId);
  setMessage('');

  try {
    await api.post(
      `/matching/requests/${selectedRequest.id}/schedule?donorId=${donorId}`
    );

    setMessage(
      'Rendez-vous planifié avec succès depuis le matching intelligent. Vous pouvez le gérer dans la page Appointments.'
    );
  } catch (error) {
    console.error('Erreur création rendez-vous:', error);

    setMessage(
      'Impossible de planifier le rendez-vous. Vérifiez que le backend est lancé.'
    );
  } finally {
    setSchedulingId(null);
  }
  }
function cancelScheduling() {
  setSchedulingId(null);
  setMessage('Création du rendez-vous annulée.');
}
  return (
    <div>
      <h1>Smart Donor Matching</h1>

      <p className="subtitle">
        Classement intelligent des donneurs selon la compatibilité sanguine, la ville,
        la distance, le centre préféré et le délai depuis le dernier don.
      </p>

      <div className="grid-2 matcher-layout">
        <div className="panel">
          <div className="panel-actions">
            <h2>Critères de matching</h2>

            {selectedRequest && (
              <button
                type="button"
                className="secondary-btn"
                onClick={clearRequest}
              >
                Recherche libre
              </button>
            )}
          </div>

          {selectedRequest && (
            <div className="selected-request-box">
              <strong>Demande sélectionnée</strong>

              <p>
                {selectedRequest.patientName} · {selectedRequest.hospital} · {selectedRequest.city}
              </p>

              <span className={`badge ${selectedRequest.urgency?.toLowerCase()}`}>
                {selectedRequest.urgency}
              </span>

              <span className="blood-chip">
                {selectedRequest.bloodType}
              </span>
            </div>
          )}

          <form className="form-grid" onSubmit={findDonors}>
            <label>
              Groupe sanguin demandé
              <select
                value={patientBloodType}
                disabled={Boolean(selectedRequest)}
                onChange={(e) => setPatientBloodType(e.target.value)}
              >
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Ville
              <input
                value={city}
                disabled={Boolean(selectedRequest)}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Casablanca"
              />
            </label>

            <button type="submit" disabled={loading}>
              <SearchIcon />
              {loading ? 'Analyse...' : 'Lancer le matching intelligent'}
            </button>
          </form>

          <div className="compatibility-box">
            <strong>Groupes compatibles pour {patientBloodType} :</strong>

            <div className="compatibility-tags">
              {compatibleTypes.map((type) => (
                <span key={type} className="badge normal">
                  {type}
                </span>
              ))}
            </div>
          </div>

          {message && (
            <div className="info-message">
              {message}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Demandes en attente</h2>

          <div className="request-short-list">
            {requests.slice(0, 6).map((request, index) => (
              <div
                className={`request-short-card ${
                  selectedRequest?.id === request.id ? 'selected' : ''
                }`}
                key={request.id || index}
              >
                <div>
                  <strong>{request.patientName}</strong>

                  <p>
                    {request.hospital} · {request.city}
                  </p>

                  <span className={`badge ${request.urgency?.toLowerCase()}`}>
                    {request.urgency}
                  </span>

                  <span className="blood-chip">
                    {request.bloodType}
                  </span>
                </div>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => useRequest(request)}
                >
                  Utiliser
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="kpi-grid small matching-kpis">
        <div className="kpi-card">
          <div className="kpi-label">Donneurs trouvés</div>
          <div className="kpi-value">{matches.length}</div>
          <div className="kpi-hint">compatibles et disponibles</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Meilleur score</div>
          <div className="kpi-value">{matches[0]?.score || 0}%</div>
          <div className="kpi-hint">selon les règles de matching</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-actions">
          <h2>Résultats du matching</h2>
          <span className="result-count">{matches.length} donneur(s)</span>
        </div>

        {matches.length === 0 ? (
          <div className="empty-state">
            <VolunteerActivismIcon fontSize="large" />
            <p>Lancez une recherche pour afficher les donneurs classés par priorité.</p>
          </div>
        ) : (
          <div className="match-card-list">
            {matches.map((match, index) => {
              const donor = match.donor || {};

              return (
                <div className="match-card" key={donor.id || index}>
                  <div className="match-score">
                    <strong>{match.score}%</strong>

                    <span
                      className={`recommendation ${String(
                        match.recommendation || ''
                      ).toLowerCase()}`}
                    >
                      {recommendationLabel(match.recommendation)}
                    </span>
                  </div>

                  <div className="match-main">
                    <h3>{donor.fullName}</h3>

                    <div className="match-meta">
                      <span className="blood-chip">
                        {donor.bloodType}
                      </span>

                      <span>{donor.city || '-'}</span>

                      <span>
                        {match.distanceKm != null
                          ? `${match.distanceKm} km`
                          : 'Distance non disponible'}
                      </span>

                      <span>
                        Dernier don: {donor.lastDonationDate || '-'}
                      </span>

                      <span>
                        Total dons: {donor.totalDonations || 0}
                      </span>
                    </div>

                    <div className="reason-list">
                      {(match.reasons || []).map((reason, i) => (
                        <span key={i}>{reason}</span>
                      ))}
                    </div>

                    <div className="contact-line">
                      <strong>Tél:</strong> {donor.phone || '-'}{' '}
                      <strong>Email:</strong> {donor.email || '-'}
                    </div>
                  </div>

                  <div className="match-actions">
  <button
    type="button"
    className="success-btn"
    disabled={!selectedRequest?.id || !donor.id || schedulingId === donor.id}
    onClick={() => scheduleDonation(donor.id)}
  >
    <EventAvailableIcon />
    {schedulingId === donor.id
      ? 'Création...'
      : 'Créer rendez-vous'}
  </button>

  <button
    type="button"
    className="secondary-btn"
    onClick={cancelScheduling}
  >
    Annuler
  </button>

  {!selectedRequest?.id && (
    <small>Choisissez une demande pour planifier.</small>
  )}
</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}