import React, { useState, useEffect } from 'react';
import RadarChartWidget from '../components/RadarChartWidget';
import { Search, Loader2, User } from 'lucide-react';
import './ViewProfile.css';

export default function ViewProfile() {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async (name = '') => {
    setLoading(true);
    setError('');
    try {
      // If name is empty, we get all and pick the first one (most recent)
      const url = name 
        ? `http://localhost:5001/api/candidates?name=${encodeURIComponent(name)}`
        : `http://localhost:5001/api/candidates`;
      
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.success && json.data && json.data.length > 0) {
        // Simple search filter if we fetched all
        const found = name 
          ? json.data.find(c => c.name.toLowerCase().includes(name.toLowerCase()))
          : json.data[0];
        
        if (found) {
          setCandidate(found);
        } else {
          setError('No candidate found with that name.');
        }
      } else {
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
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.95rem' }}
          />
        </form>
      </header>

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
        <div className="profile-layout" style={{ marginTop: '2rem' }}>
          <div className="glass-panel profile-top-bar" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
            <div className="avatar heading-lg" style={{ width: '60px', height: '60px', background: 'var(--accent-purple)' }}>
              {candidate.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="heading-md" style={{ color: 'var(--text-bright)' }}>{candidate.name}</h2>
              <p className="text-muted" style={{ marginTop: '0.2rem' }}>{candidate.email} | Match Score: <strong style={{color: 'var(--accent-blue)'}}>{candidate.matchPercentage}%</strong></p>
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
        </div>
      )}
    </div>
  );
}
