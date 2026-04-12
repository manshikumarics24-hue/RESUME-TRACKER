import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Columns, User, Sun, Moon } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [isLightMode, setIsLightMode] = useState(false);

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
    { path: '/profile', name: 'View Profile', icon: <User size={20} /> },
    { path: '/matcher', name: 'Job Matcher', icon: <Briefcase size={20} /> },
    { path: '/board', name: 'Candidate Pipeline', icon: <Columns size={20} /> },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo">
        <h2 className="heading-md text-gradient">CareerTrack</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle glass-panel" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '0.75rem', 
            background: 'var(--bg-card)', 
            color: 'var(--text-main)', 
            border: '1px solid var(--border-glass)', 
            borderRadius: 'var(--radius-md)', 
            cursor: 'pointer',
            gap: '0.5rem',
            width: '100%',
            fontWeight: '500'
          }}>
          {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          {isLightMode ? 'Dark Mode' : 'Light Mode'}
        </button>
        <div className="interviewer-profile">
          <div className="avatar">A</div>
          <div className="info">
            <span className="name">Admin User</span>
            <span className="role">Interviewer</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
