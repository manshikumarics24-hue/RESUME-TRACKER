import React, { useState, useEffect } from 'react';
import RadarChartWidget from '../components/RadarChartWidget';
import { Search, Loader2, User } from 'lucide-react';
import './ViewProfile.css';

export default function ViewProfile() {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async (name = '') => {
    setLoading(true);
    setError('');
    try {
      const url = `http://localhost:5001/api/candidates`;
      
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.success && json.data && json.data.length > 0) {
        setAllCandidates(json.data);
        const filtered = name 
          ? json.data.filter(c => c.name.toLowerCase().includes(name.toLowerCase()))
          : json.data;
        
        if (filtered.length > 0) {
          setCandidate(filtered[0]);
        } else {
          setCandidate(null);
          setError('No candidate found with that name.');
        }
      } else {
        setAllCandidates([]);
        setCandidate(null);
        setError('No profiles available. Please analyze a resume first.');
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setError('Connection refused. Is the backend running?');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProfile(searchQuery);
  };

  // Map candidate skills to Radar Chart format
  const chartData = candidate?.skills?.map(s => ({
    subject: s.name,
    candidate: s.score,
    required: 80 // Default baseline for comparison
  })) || [];

  return (
    <div className="page-container fade-in">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-lg">View Profile</h1>
          <p className="text-muted">Explore AI-extracted candidate metrics.</p>
        </div>
        
        <form onSubmit={handleSearch} className="search-bar glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 1.2rem', borderRadius: '30px', minWidth: '300px' }}>
          <Search size={20} className="text-muted" style={{ marginRight: '0.75rem' }} />
          <input 
            type="text" 
            placeholder="Search candidate name..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.95rem' }}
          />
        </form>
      </header>

      {allCandidates.length > 0 && !loading && (
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="text-muted" style={{ marginRight: '0.5rem' }}>Select Profile:</span>
          {allCandidates.map(c => (
            <button 
              key={c._id} 
              onClick={() => setCandidate(c)}
              className="glass-panel"
              style={{
                padding: '0.5rem 1rem',
                border: candidate?._id === c._id ? '1px solid var(--accent-blue)' : '1px solid var(--border-glass)',
                background: candidate?._id === c._id ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                borderRadius: '20px',
                transition: 'var(--transition)'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '5rem', textAlign: 'center' }}>
          <Loader2 size={48} className="spin text-gradient" style={{ margin: '0 auto' }} />
          <p className="text-muted mt-4">Fetching profile data...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: 'var(--accent-red)' }}>{error}</p>
        </div>
      ) : (
        <div className="profile-layout" style={{ marginTop: '1rem' }}>
          {candidate && (
            <>
              <div className="glass-panel profile-top-bar" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
                <div className="avatar heading-lg" style={{ width: '60px', height: '60px', background: 'var(--accent-purple)' }}>
                  {candidate.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="heading-md" style={{ color: 'var(--text-main)' }}>{candidate.name}</h2>
                  <p className="text-muted" style={{ marginTop: '0.2rem' }}>{candidate.email} | Match Score: <strong style={{color: 'var(--accent-blue)'}}>{candidate.matchPercentage || 0}%</strong></p>
                </div>
              </div>

              <div className="chart-wrapper glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '450px' }}>
                <div style={{ width: '100%', maxWidth: '700px' }}>
                  <RadarChartWidget 
                    data={chartData} 
                    title="AI Skill Projection" 
                    subtitle={`Direct mapping of ${candidate.name}'s extracted skills scores.`}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
