import React from 'react';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';

export default function Navbar({ user }) {
  return (
    <header className="topbar">
      <div className="brand-inline"><BloodtypeIcon /> BloodBI Analytics Dashboard</div>
      <div className="welcome">Bienvenue, {user?.username || 'admin'}</div>
    </header>
  );
}
