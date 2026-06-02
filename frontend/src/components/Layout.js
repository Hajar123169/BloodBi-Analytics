import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
//organise la structure générale de l’application.
export default function Layout({ user, onLogout }) {
  return (
    <div className="app-shell">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        <Navbar user={user} />
        <section className="page-container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
