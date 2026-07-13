import React, { useState, useRef, useEffect } from 'react';
import RadarChartWidget from '../components/RadarChartWidget';
import { Search, Loader2, User, Phone, Mail, Star, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './ViewProfile.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function ViewProfile() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [searching, setSearching] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Live search as user types
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setError('');

    clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API_BASE}/api/candidates/search?q=${encodeURIComponent(val.trim())}`);
        const json = await res.json();
        if (json.success) {
          setSuggestions(json.data);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      }
      setSearching(false);
    }, 300);
  };

  const selectCandidate = async (c) => {
    setShowDropdown(false);
    setSearchQuery(c.name || c.email);
    setSuggestions([]);
    setProfileLoading(true);
    setError('');

    try {
      // Fetch full candidate data (including rawText if needed)
      const res = await fetch(`${API_BASE}/api/candidates/search?q=${encodeURIComponent(c.email || c.name)}`);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setCandidate(json.data[0]);
      } else {
        setCandidate(c); // fallback to what we have
      }
    } catch {
      setCandidate(c);
    }
    setProfileLoading(false);
  };

  const chartData = candidate?.skills?.map(s => ({
    subject: s.name,
    candidate: s.score,
    required: 80,
  })) || [];

  const getStatusColor = (status) => {
    if (status === 'Selected') return '#10b981';
    if (status === 'Not Selected') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-lg">My Profile</h1>
          <p className="text-muted">Check your AI analysis results by searching your name or email.</p>
        </div>
      </header>

      {/* Search Box */}
      <div className="profile-search-section" ref={searchRef}>
        <div className="profile-search-box glass-panel">
          <div className="search-icon-wrap">
            {searching ? <Loader2 size={20} className="spin" /> : <Search size={20} />}
          </div>
          <input
            type="text"
            id="profile-search-input"
            placeholder="Search your name or email address..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            autoComplete="off"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => { setSearchQuery(''); setSuggestions([]); setCandidate(null); setShowDropdown(false); }}>
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {showDropdown && suggestions.length > 0 && (
          <div className="search-dropdown glass-panel">
            {suggestions.map(s => (
              <div
                key={s._id}
                className="suggestion-item"
                onMouseDown={() => selectCandidate(s)}
              >
                <div className="suggestion-avatar">
                  {s.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="suggestion-info">
                  <p className="suggestion-name">{s.name || 'Unknown'}</p>
                  <p className="suggestion-email">{s.email}</p>
                </div>
                <div className="suggestion-score">
                  <span style={{ color: getStatusColor(s.status), fontSize: '0.75rem', fontWeight: 700 }}>
                    {s.status}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#00d2c8', fontWeight: 700 }}>
                    {s.matchPercentage || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDropdown && suggestions.length === 0 && !searching && searchQuery.length >= 2 && (
          <div className="search-dropdown glass-panel no-results">
            <User size={24} style={{ opacity: 0.3 }} />
            <p className="text-muted">No profiles found. Try a different name or email.</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: '#f87171', marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {/* Loading profile */}
      {profileLoading && (
        <div style={{ padding: '5rem', textAlign: 'center' }}>
          <Loader2 size={48} className="spin" style={{ margin: '0 auto', color: '#00d2c8' }} />
          <p className="text-muted" style={{ marginTop: '1rem' }}>Loading your profile...</p>
        </div>
      )}

      {/* No candidate selected yet */}
      {!candidate && !profileLoading && !error && (
        <div className="empty-state glass-panel">
          <div className="empty-state-icon">🔍</div>
          <h3 className="heading-md" style={{ fontSize: '1.2rem' }}>Find Your Profile</h3>
          <p className="text-muted">Type your name or the email you submitted your resume with to view your AI analysis results.</p>
        </div>
      )}

      {/* Candidate Profile */}
      {candidate && !profileLoading && (
        <div className="profile-layout fade-in" style={{ marginTop: '2rem' }}>
          {/* Top Bar */}
          <div className="glass-panel profile-top-bar" style={{ marginBottom: '2rem', padding: '1.5rem 2rem', borderTop: `3px solid ${getStatusColor(candidate.status)}` }}>
            <div className="profile-top-left">
              <div className="profile-big-avatar" style={{ background: `${getStatusColor(candidate.status)}20`, color: getStatusColor(candidate.status) }}>
                {candidate.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 className="heading-md" style={{ marginBottom: '0.3rem' }}>{candidate.name}</h2>
                <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <Mail size={14} /> {candidate.email}
                </p>
                {candidate.phone && (
                  <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} /> {candidate.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="profile-top-right">
              <div className="profile-score-ring">
                <span className="score-number">{candidate.matchPercentage || 0}%</span>
                <span className="score-label">Match Score</span>
              </div>
              <div className="profile-status-badge" style={{ color: getStatusColor(candidate.status), background: `${getStatusColor(candidate.status)}15`, border: `1px solid ${getStatusColor(candidate.status)}40` }}>
                {candidate.status === 'Selected' && <CheckCircle2 size={16} />}
                {candidate.status === 'Not Selected' && <AlertTriangle size={16} />}
                {candidate.status === 'Pending' && <Loader2 size={16} />}
                {candidate.status}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="profile-grid">
            {/* Radar Chart */}
            {chartData.length > 0 && (
              <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                <RadarChartWidget
                  data={chartData}
                  title="AI Skill Projection"
                  subtitle={`Skills extracted from ${candidate.name}'s resume`}
                />
              </div>
            )}

            {/* AI Feedback */}
            {candidate.feedbackText && (
              <div className="glass-panel profile-info-card">
                <h3 className="info-card-title">🤖 AI Feedback</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.92rem' }}>
                  {candidate.feedbackText}
                </p>
              </div>
            )}

            {/* Suitable Jobs */}
            {candidate.suitableJobs?.length > 0 && (
              <div className="glass-panel profile-info-card" style={{ borderLeft: '3px solid #10b981' }}>
                <h3 className="info-card-title" style={{ color: '#10b981' }}>✅ Suitable Roles</h3>
                <div className="tag-group">
                  {candidate.suitableJobs.map((j, i) => (
                    <span key={i} className="role-tag">{j}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills to Improve */}
            {candidate.skillsToWorkOn?.length > 0 && (
              <div className="glass-panel profile-info-card" style={{ borderLeft: '3px solid #f59e0b' }}>
                <h3 className="info-card-title" style={{ color: '#f59e0b' }}>⚡ Skills to Improve</h3>
                <div className="tag-group">
                  {candidate.skillsToWorkOn.map((s, i) => (
                    <span key={i} className="improve-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
