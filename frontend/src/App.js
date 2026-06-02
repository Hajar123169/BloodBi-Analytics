import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Predictions from './components/Predictions';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DonorStats from './pages/DonorStats';
import BloodRequests from './pages/BloodRequests';
import BloodStock from './pages/BloodStock';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Centers from './pages/Centers';
import Appointments from './pages/Appointments';
import DonorMatcher from './pages/DonorMatcher';
export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('bloodbiUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

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
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <SignupPage />
            )
          }
        />

        <Route
          path="/"
          element={
            user ? (
              <Layout user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="donors" element={<DonorStats />} />
          <Route path="requests" element={<BloodRequests />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="stock" element={<BloodStock />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="centers" element={<Centers />} />
           <Route path="matcher" element={<DonorMatcher />} />
            <Route path="predictions" element={<Predictions />} />
        </Route>

        <Route
          path="*"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
  }