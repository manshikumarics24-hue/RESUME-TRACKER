import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, CheckCircle2, XCircle, Clock, Search, Phone, Mail,
  TrendingUp, AlertTriangle, Trash2, RefreshCw, LogOut, ChevronDown
} from 'lucide-react';
import './AdminDashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminDashboard() {
  const { admin, token, logout } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState('');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/candidates`, { headers: authHeaders });
      if (res.status === 401) { logout(); return; }
      const json = await res.json();
      if (json.success) {
        setCandidates(json.data);
        setFiltered(json.data);
      }
    } catch (e) {
      setError('Failed to load candidates. Is the backend running?');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCandidates(); }, []);

  useEffect(() => {
    let data = [...candidates];
    if (statusFilter !== 'All') data = data.filter(c => c.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [searchQuery, statusFilter, candidates]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/candidates/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setCandidates(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
        if (selectedCandidate?._id === id) setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
      }
    } catch { alert('Failed to update status.'); }
  };

  const deleteCandidate = async (id) => {
    if (!window.confirm('Delete this candidate? This cannot be undone.')) return;
    try {
      await fetch(`${API_BASE}/api/candidates/${id}`, { method: 'DELETE', headers: authHeaders });
      setCandidates(prev => prev.filter(c => c._id !== id));
      if (selectedCandidate?._id === id) setSelectedCandidate(null);
    } catch { alert('Failed to delete candidate.'); }
  };

  // Stats
  const total = candidates.length;
  const selected = candidates.filter(c => c.status === 'Selected').length;
  const notSelected = candidates.filter(c => c.status === 'Not Selected').length;
  const pending = candidates.filter(c => c.status === 'Pending').length;

  const getStatusColor = (status) => {
    if (status === 'Selected') return '#10b981';
    if (status === 'Not Selected') return '#ef4444';
    return '#f59e0b';
  };

  const getStatusIcon = (status) => {
    if (status === 'Selected') return <CheckCircle2 size={14} />;
    if (status === 'Not Selected') return <XCircle size={14} />;
    return <Clock size={14} />;
  };

  return (
    <div className="admin-dashboard fade-in">
      {/* Header */}
      <header className="admin-header glass-panel">
        <div>
          <h1 className="heading-md" style={{ marginBottom: '0.1rem' }}>
            🏢 Admin Dashboard
          </h1>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Welcome back, <strong>{admin?.name}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="primary-btn" onClick={fetchCandidates} disabled={loading} style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button onClick={logout} className="logout-btn glass-panel">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Stats row */}
      <div className="admin-stats-grid">
        {[
          { label: 'Total Applicants', value: total, color: '#00d2c8', icon: <Users size={22} /> },
          { label: 'Selected', value: selected, color: '#10b981', icon: <CheckCircle2 size={22} /> },
          { label: 'Not Selected', value: notSelected, color: '#ef4444', icon: <XCircle size={22} /> },
          { label: 'Pending Review', value: pending, color: '#f59e0b', icon: <Clock size={22} /> },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel stat-card">
            <div className="stat-icon" style={{ color: stat.color, background: `${stat.color}18` }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>{stat.label}</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-main-grid">
        {/* Left: Candidate List */}
        <div className="candidate-list-panel glass-panel">
          <div className="list-toolbar">
            <div className="search-wrapper">
              <Search size={16} className="s-icon" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
            </div>
            <div className="filter-tabs">
              {['All', 'Pending', 'Selected', 'Not Selected'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', padding: '1rem' }}>{error}</p>}

          <div className="candidate-items">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <RefreshCw size={32} className="spin" style={{ color: '#00d2c8', margin: '0 auto' }} />
                <p className="text-muted" style={{ marginTop: '1rem' }}>Loading candidates...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p className="text-muted">No candidates found.</p>
              </div>
            ) : (
              filtered.map(c => (
                <div
                  key={c._id}
                  className={`candidate-item ${selectedCandidate?._id === c._id ? 'selected' : ''}`}
                  onClick={() => setSelectedCandidate(c)}
                >
                  <div className="candidate-avatar" style={{ background: `${getStatusColor(c.status)}30`, color: getStatusColor(c.status) }}>
                    {c.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="candidate-info">
                    <p className="candidate-name">{c.name || 'Unknown'}</p>
                    <p className="candidate-email">{c.email}</p>
                    {c.phone && <p className="candidate-phone"><Phone size={11} /> {c.phone}</p>}
                  </div>
                  <div className="candidate-meta">
                    <span className="score-badge">{c.matchPercentage || 0}%</span>
                    <span className="status-chip" style={{ color: getStatusColor(c.status), background: `${getStatusColor(c.status)}18` }}>
                      {getStatusIcon(c.status)} {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Candidate Detail */}
        <div className="candidate-detail-panel">
          {!selectedCandidate ? (
            <div className="glass-panel no-selection">
              <Users size={48} style={{ opacity: 0.2, margin: '0 auto' }} />
              <p className="text-muted" style={{ marginTop: '1rem' }}>Select a candidate to view full details</p>
            </div>
          ) : (
            <div className="detail-content">
              {/* Profile Card */}
              <div className="glass-panel detail-card" style={{ borderTop: `3px solid ${getStatusColor(selectedCandidate.status)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="big-avatar" style={{ background: `${getStatusColor(selectedCandidate.status)}25`, color: getStatusColor(selectedCandidate.status) }}>
                      {selectedCandidate.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="heading-md" style={{ marginBottom: '0.25rem' }}>{selectedCandidate.name}</h2>
                      <p className="text-muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={13} /> {selectedCandidate.email}
                      </p>
                      {selectedCandidate.phone && (
                        <p className="text-muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <Phone size={13} /> {selectedCandidate.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteCandidate(selectedCandidate._id)} className="delete-btn" title="Delete candidate">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Score + Status */}
                <div className="detail-stats-row">
                  <div className="detail-stat">
                    <TrendingUp size={18} style={{ color: '#00d2c8' }} />
                    <div>
                      <p className="text-muted" style={{ fontSize: '0.75rem' }}>Match Score</p>
                      <p style={{ fontWeight: 700, fontSize: '1.4rem', color: '#00d2c8' }}>{selectedCandidate.matchPercentage || 0}%</p>
                    </div>
                  </div>
                  <div className="detail-stat">
                    <div style={{ color: getStatusColor(selectedCandidate.status) }}>
                      {getStatusIcon(selectedCandidate.status)}
                    </div>
                    <div>
                      <p className="text-muted" style={{ fontSize: '0.75rem' }}>Current Status</p>
                      <p style={{ fontWeight: 700, fontSize: '1rem', color: getStatusColor(selectedCandidate.status) }}>
                        {selectedCandidate.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Update Status */}
                <div className="status-update-row">
                  <p className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Update Status:</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Pending', 'Selected', 'Not Selected'].map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selectedCandidate._id, s)}
                        className={`status-update-btn ${selectedCandidate.status === s ? 'active' : ''}`}
                        style={{
                          borderColor: selectedCandidate.status === s ? getStatusColor(s) : 'var(--border-glass)',
                          color: selectedCandidate.status === s ? getStatusColor(s) : 'var(--text-muted)',
                          background: selectedCandidate.status === s ? `${getStatusColor(s)}18` : 'transparent',
                        }}
                      >
                        {getStatusIcon(s)} {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Feedback */}
              {selectedCandidate.feedbackText && (
                <div className="glass-panel detail-card">
                  <h3 className="heading-sm">🤖 AI Feedback</h3>
                  <p style={{ lineHeight: 1.7, color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                    {selectedCandidate.feedbackText}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedCandidate.skills?.length > 0 && (
                <div className="glass-panel detail-card">
                  <h3 className="heading-sm">💡 Skills</h3>
                  <div className="skills-grid">
                    {selectedCandidate.skills.map((skill, i) => (
                      <div key={i} className="skill-pill">
                        <span>{skill.name}</span>
                        <span className="skill-score" style={{ color: skill.score >= 70 ? '#10b981' : '#f59e0b' }}>
                          {skill.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills to Improve */}
              {selectedCandidate.skillsToWorkOn?.length > 0 && (
                <div className="glass-panel detail-card" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <h3 className="heading-sm" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={18} /> Skills to Improve
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    {selectedCandidate.skillsToWorkOn.map((s, i) => (
                      <span key={i} className="improve-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suitable Jobs */}
              {selectedCandidate.suitableJobs?.length > 0 && (
                <div className="glass-panel detail-card" style={{ borderLeft: '3px solid #10b981' }}>
                  <h3 className="heading-sm" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} /> Suitable Roles
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    {selectedCandidate.suitableJobs.map((j, i) => (
                      <span key={i} className="role-tag">{j}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
