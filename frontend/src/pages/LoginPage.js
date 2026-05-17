import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const isAllowedRole = (role) => {
    return role === 'ADMIN' || role === 'CENTER_MANAGER';
  };

  async function submit(e) {
    e.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/auth/login', { username, password });

      if (!isAllowedRole(data.role)) {
        setError("Accès refusé. Cette plateforme est réservée à l'administrateur et au responsable de santé.");
        return;
      }

      onLogin(data);
    } catch (err) {
      setError('Identifiants invalides. Test : admin / password');
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">
          <BloodtypeIcon fontSize="large" />
        </div>

        <h1>BloodBI Analytics</h1>

        <p>
          Connexion réservée aux administrateurs et responsables de santé.
        </p>

        <label>Nom d'utilisateur</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="error">{error}</div>}

        <button type="submit">
          Se connecter
        </button>

        <div className="auth-link">
          Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
        </div>
      </form>
    </div>
  );
}