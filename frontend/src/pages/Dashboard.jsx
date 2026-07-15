import React, { useState, useEffect, Suspense } from 'react';
import { Target, AlertTriangle, RefreshCw, BarChart3, Users, CheckCircle2, Box } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import ErrorBoundary from '../components/ErrorBoundary';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_BASE = 'http://127.0.0.1:5001';

const SplineFallback = () => (
  <div className="flex flex-col items-center justify-center h-full text-muted" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
    <Box size={64} className="float" style={{ opacity: 0.2 }} />
    <p style={{ opacity: 0.5, fontWeight: 500 }}>Initializing Neural Workspace...</p>
  </div>
);

export default function Dashboard() {
  const { token, isAuthenticated } = useAuth();
  const [insights, setInsights] = useState({
    readyFor: [],
    needsWork: [],
    domain: 'Loading...',
    totalAnalyzed: 0,
    selectedCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchInsights = async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        const candidates = json.data;
        const allRoles = candidates.flatMap(c => c.suitableJobs || []);
        const allGaps = candidates.flatMap(c => c.skillsToWorkOn || []);
        
        const uniqueRoles = [...new Set(allRoles)].slice(0, 3);
        const uniqueGaps = [...new Set(allGaps)].slice(0, 3);
        const selected = candidates.filter(c => c.status === 'Selected').length;

        setInsights({
          readyFor: uniqueRoles.length > 0 ? uniqueRoles : ['No candidates yet'],
          needsWork: uniqueGaps.length > 0 ? uniqueGaps : ['Awaiting more data'],
          domain: uniqueRoles[0] || 'your profile',
          totalAnalyzed: candidates.length,
          selectedCount: selected
        });
      }
    } catch (e) {
      console.error('Insight fetch error:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights(true);
  }, []);



  return (
    <div className="dashboard-page fade-in">
      <header className="page-header">
        <div>
          <h1 className="heading-lg text-gradient">Recruitment Command Center</h1>
          <p className="text-muted">High-level intelligence & candidate selection metrics.</p>
        </div>
        <button className="primary-btn" onClick={() => fetchInsights(false)} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} /> Sync Pipeline
        </button>
      </header>

      <div className="dashboard-main-content">
        
        {/* Spline 3D Section */}
        <div className="spline-container glass-panel">
          <ErrorBoundary fallback={<SplineFallback />}>
            <Suspense fallback={<SplineFallback />}>
              <Spline scene="https://prod.spline.design/J3yS57U8T8W27N5O/scene.splinecode" />
            </Suspense>
          </ErrorBoundary>
          <div className="spline-overlay"></div>
          
          <div style={{ position: 'absolute', bottom: '2rem', left: '2.5rem', zIndex: 2 }}>
            <h2 className="heading-lg" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {isAuthenticated ? insights.totalAnalyzed : ''}
            </h2>
            <p className="text-muted" style={{ fontSize: '1.1rem', letterSpacing: '0.1em', fontWeight: 600 }}>CANDIDATES ANALYZED</p>
          </div>

          <div style={{ position: 'absolute', bottom: '2rem', right: '2.5rem', zIndex: 2, textAlign: 'right' }}>
            <h2 className="heading-lg" style={{ fontSize: '3rem', marginBottom: '0.5rem', color: '#10b981' }}>
              {isAuthenticated ? insights.selectedCount : ''}
            </h2>
            <p className="text-muted" style={{ fontSize: '1.1rem', letterSpacing: '0.1em', fontWeight: 600 }}>SELECTED FOR NEXT ROUND</p>
          </div>
        </div>

        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem', minHeight: '160px' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
            <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Users size={32} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Processed</p>
              <h4 className="heading-md" style={{ marginBottom: 0, fontSize: '2.5rem' }}>{isAuthenticated ? insights.totalAnalyzed : ''}</h4>
            </div>
          </div>
          <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
            <div style={{ width: '100%', height: '100%', minHeight: '160px', backgroundImage: 'url(/dashboard_ai.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.9 }} />
          </div>
        </div>

        <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-panel insight-card" style={{ borderTop: '4px solid #10b981', padding: '2rem' }}>
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', marginBottom: '1rem' }}>
              <Target size={28} /> In-Demand Roles
            </h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {insights.readyFor.map((role, idx) => <li key={idx} className="fade-in" style={{ animationDelay: `${idx * 0.1}s` }}><strong>{role}</strong></li>)}
            </ul>
          </div>
          
          <div className="glass-panel insight-card" style={{ borderTop: '4px solid #f59e0b', padding: '2rem' }}>
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f59e0b', marginBottom: '1rem' }}>
              <AlertTriangle size={28} /> Skill Deficiencies
            </h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {insights.needsWork.map((skill, idx) => <li key={idx} className="fade-in" style={{ animationDelay: `${idx * 0.1}s` }}><strong>{skill}</strong></li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
