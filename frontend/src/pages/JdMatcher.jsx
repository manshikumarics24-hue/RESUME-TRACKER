import React, { useState } from 'react';
import { Target, Search, ChevronRight, Zap } from 'lucide-react';
import './JdMatcher.css';

export default function JdMatcher() {
  const [jdText, setJdText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [results, setResults] = useState(null);

  const MOCK_RESULTS = [
    { id: 1, name: 'Sarah Jenkins', role: 'Senior Frontend Dev', score: 92, status: 'Shortlisted', matchColor: 'green' },
    { id: 2, name: 'Michael Chen', role: 'Fullstack Engineer', score: 74, status: 'Pending', matchColor: 'yellow' },
    { id: 3, name: 'Elena Rodriguez', role: 'React Developer', score: 68, status: 'Pending', matchColor: 'yellow' },
    { id: 4, name: 'David Smith', role: 'Backend Dev', score: 45, status: 'Rejected', matchColor: 'red' },
  ];

  const handleMatch = () => {
    if (!jdText.trim()) return;
    setIsMatching(true);
    setTimeout(() => {
      setResults(MOCK_RESULTS);
      setIsMatching(false);
    }, 1500);
  };

  return (
    <div className="page-container fade-in jd-page">
      <header className="page-header">
        <div>
          <h1 className="heading-lg">Job Description Matcher</h1>
          <p className="text-muted">Paste your Job Description clearly to find the best candidate matches.</p>
        </div>
      </header>

      <div className="matcher-layout">
        <div className="jd-input-section glass-panel">
          <div className="section-header">
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} className="text-blue" /> JD Requirements
            </h3>
          </div>
          <div className="jd-input-wrapper">
            <textarea 
              className="jd-textarea" 
              placeholder="Paste the Job Description here. Ensure you include key skills, experience required, and core responsibilities for better AI matching..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            ></textarea>
            <div className="input-footer">
              <span className="text-muted">{jdText.length} characters</span>
              <button 
                className={`primary-btn match-btn ${!jdText.trim() || isMatching ? 'disabled' : ''}`}
                onClick={handleMatch}
                disabled={!jdText.trim() || isMatching}
              >
                {isMatching ? 'Analyzing...' : <><Zap size={18} /> Find Matches</>}
              </button>
            </div>
          </div>
        </div>

        <div className="results-section glass-panel">
          <div className="section-header">
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={20} className="text-purple" /> Ranked Candidates
            </h3>
          </div>
          
          <div className="results-list">
            {!results && !isMatching ? (
              <div className="empty-state">
                <Target size={48} className="text-muted" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <p className="text-muted">Enter a JD and click "Find Matches" to rank candidates.</p>
              </div>
            ) : isMatching ? (
              <div className="empty-state">
                <div className="loader spin"></div>
                <p className="text-muted" style={{ marginTop: '1rem' }}>AI is ranking the candidates...</p>
              </div>
            ) : (
              results.map((candidate, idx) => (
                <div key={candidate.id} className="candidate-card slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="rank-badge">#{idx + 1}</div>
                  <div className="candidate-info">
                    <h4>{candidate.name}</h4>
                    <p className="text-muted">{candidate.role}</p>
                  </div>
                  <div className="score-area">
                    <div className="score-bar-bg">
                      <div 
                        className={`score-bar-fill bg-${candidate.matchColor}`} 
                        style={{ width: `${candidate.score}%` }}
                      ></div>
                    </div>
                    <span className={`score-text text-${candidate.matchColor}`}>{candidate.score}%</span>
                  </div>
                  <button className="icon-btn">
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
