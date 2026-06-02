//Ce dossier contient la configuration des appels vers le backend.
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8082/api',
});

export default api;
