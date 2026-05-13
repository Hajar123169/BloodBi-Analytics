import React from 'react';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';

const items = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/donors', label: 'Donor Stats', icon: <PeopleIcon /> },
  { to: '/requests', label: 'Blood Requests', icon: <BloodtypeIcon /> },
  { to: '/stock', label: 'Blood Stock', icon: <InventoryIcon /> },
  { to: '/alerts', label: 'Alerts', icon: <WarningIcon /> },
  { to: '/reports', label: 'Reports', icon: <AssessmentIcon /> },
  { to: '/centers', label: 'Centers', icon: <LocalHospitalIcon /> },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title"><BloodtypeIcon /> BloodBI</div>
      <nav>
        {items.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {item.icon}<span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="logout" onClick={onLogout}><LogoutIcon /> Logout</button>
    </aside>
  );
}
