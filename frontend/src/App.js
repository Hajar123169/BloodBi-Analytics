import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DonorStats from './pages/DonorStats';
import BloodRequests from './pages/BloodRequests';
import BloodStock from './pages/BloodStock';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Centers from './pages/Centers';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('bloodbiUser') || 'null'));
  const handleLogin = (data) => {
    localStorage.setItem('bloodbiUser', JSON.stringify(data));
    setUser(data);
  };
  const logout = () => {
    localStorage.removeItem('bloodbiUser');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/" element={user ? <Layout user={user} onLogout={logout} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="donors" element={<DonorStats />} />
          <Route path="requests" element={<BloodRequests />} />
          <Route path="stock" element={<BloodStock />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="centers" element={<Centers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
