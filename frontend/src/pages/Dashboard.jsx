import React from 'react';
import { Target, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ userInsights }) {
  const insights = userInsights || {
    readyFor: ['Frontend React Developer', 'SDE I'],
    needsWork: ['Backend architecture', 'System Design', 'More complex API integrations'],
    domain: 'Software Engineering'
  };

  return (
    <div className="dashboard-page fade-in">
      <header className="page-header">
        <div>
          <h1 className="heading-lg">Welcome to CareerTrack</h1>
          <p className="text-muted">Your centralized hub for resume parsing and skill progression.</p>
        </div>
      </header>

      <div className="dashboard-main-content">
        <div className="glass-panel central-3d-graphic" style={{ textAlign: 'center', padding: '4rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Placeholder for 3D graphic / illustration */}
          <div className="graphic-placeholder" style={{ animation: 'float 6s ease-in-out infinite' }}>
            <span style={{ fontSize: '100px', filter: 'drop-shadow(0px 10px 20px rgba(59, 130, 246, 0.4))' }}>🚀</span>
            <h2 className="heading-lg" style={{ marginTop: '1.5rem', background: 'linear-gradient(to right, var(--accent-blue), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your Career Progression Visualized
            </h2>
          </div>
        </div>

        <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
          <div className="glass-panel insight-card" style={{ borderTop: '4px solid #10b981', padding: '2rem' }}>
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', marginBottom: '1rem' }}>
              <Target size={28} /> Interview Ready
            </h3>
            <p className="text-muted" style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
              Based on your latest parsed resume and JD matching, you are a strong candidate for:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {insights.readyFor.map((role, idx) => <li key={idx}><strong>{role}</strong></li>)}
            </ul>
          </div>
          
          <div className="glass-panel insight-card" style={{ borderTop: '4px solid #f59e0b', padding: '2rem' }}>
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f59e0b', marginBottom: '1rem' }}>
              <AlertTriangle size={28} /> Areas for Improvement
            </h3>
            <p className="text-muted" style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
              To clear technical rounds in the {insights.domain} domain, we recommend building projects in:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {insights.needsWork.map((skill, idx) => <li key={idx}><strong>{skill}</strong></li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
