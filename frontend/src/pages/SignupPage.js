import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import api from '../api';

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'CENTER_MANAGER'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validateRole = (role) => {
    return role === 'ADMIN' || role === 'CENTER_MANAGER';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username || !form.email || !form.password || !form.role) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (!validateRole(form.role)) {
      setError("Le rôle choisi n'est pas autorisé.");
      return;
    }

    try {
      await api.post('/auth/register', form);

      setSuccess('Compte créé avec succès. Redirection vers la connexion...');

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("HEY,Erreur lors de la création du compte. Vérifiez l'API backend.");
    }
  };

  return (
    <div className="login-page">
      <form className="login-card signup-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <BloodtypeIcon fontSize="large" />
        </div>

        <h1>Créer un compte</h1>

        <p>
          Inscription réservée aux administrateurs et responsables de santé.
        </p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <label>Nom d'utilisateur</label>
        <input
          type="text"
          name="username"
          placeholder="Ex : responsable_centre"
          value={form.username}
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Ex : responsable@bloodbi.ma"
          value={form.email}
          onChange={handleChange}
        />

        <label>Mot de passe</label>
        <input
          type="password"
          name="password"
          placeholder="Créer un mot de passe"
          value={form.password}
          onChange={handleChange}
        />

        <label>Rôle</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="CENTER_MANAGER">Responsable de santé</option>
          <option value="ADMIN">Administrateur</option>
        </select>

        <button type="submit">
          S'inscrire
        </button>

        <div className="auth-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </div>
      </form>
    </div>
  );
}