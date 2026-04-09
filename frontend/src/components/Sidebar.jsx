import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Columns, User } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
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
      
      <div className="sidebar-footer">
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
