import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Columns, User, Sun, Moon, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [isLightMode, setIsLightMode] = useState(false);
  const { admin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.body.classList.add('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    if (!isLightMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  };

  const navItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/profile', name: 'My Profile', icon: <User size={20} /> },
    { path: '/matcher', name: 'Job Matcher', icon: <Briefcase size={20} /> },
    { path: '/board', name: 'Candidate Pipeline', icon: <Columns size={20} /> },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo">
        <div className="logo-icon">CT</div>
        <h2 className="heading-md text-gradient" style={{ fontSize: '1.2rem', marginBottom: 0 }}>CareerTrack</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" />

      {/* Admin section */}
      <div className="sidebar-admin-section">
        {isAuthenticated ? (
          <>
            <NavLink to="/admin" className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon"><Shield size={20} /></span>
              <span className="nav-text">Admin Panel</span>
            </NavLink>
            <button className="nav-item logout-nav-item" onClick={() => { logout(); navigate('/'); }}>
              <span className="nav-icon"><LogOut size={20} /></span>
              <span className="nav-text">Logout</span>
            </button>
          </>
        ) : (
          <NavLink to="/admin/login" className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><Shield size={20} /></span>
            <span className="nav-text">Admin Login</span>
          </NavLink>
        )}
      </div>

      <div className="sidebar-footer">
        <button onClick={toggleTheme} className="theme-toggle glass-panel">
          {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          {isLightMode ? 'Dark Mode' : 'Light Mode'}
        </button>

        <div className="interviewer-profile">
          <div className="avatar" style={{ background: isAuthenticated ? 'linear-gradient(135deg, #00d2c8, #8b5cf6)' : undefined }}>
            {isAuthenticated ? admin?.name?.charAt(0)?.toUpperCase() : 'G'}
          </div>
          <div className="info">
            <span className="name">{isAuthenticated ? admin?.name : 'Guest'}</span>
            <span className="role">{isAuthenticated ? 'Admin' : 'Candidate View'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
