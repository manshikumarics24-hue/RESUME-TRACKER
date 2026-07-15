import React, { useState, useEffect } from 'react';
import { GripVertical, RefreshCw, Users, X, Trash2, Briefcase, TrendingUp, Star, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './KanbanBoard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

const READY_THRESHOLD = 70;

// ── Candidate Detail Modal ──────────────────────────────────────────────────
function CandidateModal({ candidate, onClose, onDelete, token }) {
  if (!candidate) return null;

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${candidate.name} from the pipeline?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/candidates/${candidate.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        onDelete(candidate.id);
        onClose();
      } else {
        alert('Failed to delete candidate.');
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert('Could not connect to server.');
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(6px)', padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            borderRadius: '50%', width: '36px', height: '36px',
            cursor: 'pointer', color: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 700, color: '#fff', flexShrink: 0
          }}>
            {(candidate.name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{candidate.name}</h2>
            <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={13} /> {candidate.email || 'No email provided'}
            </p>
          </div>
          <div style={{
            marginLeft: 'auto',
            background: `${scoreColor(candidate.score)}22`,
            border: `1px solid ${scoreColor(candidate.score)}66`,
            color: scoreColor(candidate.score),
            borderRadius: '12px', padding: '0.4rem 1rem',
            fontWeight: 700, fontSize: '1.1rem', flexShrink: 0
          }}>
            {candidate.score}% Match
          </div>
        </div>

        {/* AI Feedback */}
        {candidate.feedbackText && (
          <div style={{
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem'
          }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🤖 CareerTrack AI Analysis
            </h3>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {candidate.feedbackText}
            </p>
          </div>
        )}

        {/* Suitable Jobs */}
        {candidate.suitableJobs?.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Briefcase size={14} /> Best Matching Roles
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {candidate.suitableJobs.map((job, i) => (
                <span key={i} style={{
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10b981', borderRadius: '20px', padding: '0.3rem 0.9rem', fontSize: '0.8rem', fontWeight: 500
                }}>{job}</span>
              ))}
            </div>
          </div>
        )}

        {/* Skills to Work On */}
        {candidate.skillsToWorkOn?.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={14} /> Skills to Develop
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {candidate.skillsToWorkOn.map((skill, i) => (
                <span key={i} style={{
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                  color: '#f59e0b', borderRadius: '20px', padding: '0.3rem 0.9rem', fontSize: '0.8rem', fontWeight: 500
                }}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Skills Breakdown */}
        {candidate.skills?.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={14} /> Skill Scores
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {candidate.skills.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{s.name}</span>
                    <span style={{ color: scoreColor(s.score), fontSize: '0.8rem', fontWeight: 600 }}>{s.score}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${s.score}%`,
                      background: `linear-gradient(90deg, ${scoreColor(s.score)}, ${scoreColor(s.score)}88)`,
                      borderRadius: '4px', transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          style={{
            width: '100%', padding: '0.75rem', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px',
            color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        >
          <Trash2 size={16} /> Remove from Pipeline
        </button>
      </div>
    </div>
  );
}

// ── Main KanbanBoard ────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const { token, isAuthenticated } = useAuth();
  const [columns, setColumns] = useState([
    { id: 'col-ready', title: 'Selected for Next Round', color: '#10b981', cards: [] },
    { id: 'col-needs-work', title: 'Not Selected', color: '#ef4444', cards: [] }
  ]);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedColId, setDraggedColId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const fetchCandidates = async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        const mapCard = (c) => ({
          id: c._id,
          name: c.name || 'Unknown',
          score: c.matchPercentage,
          status: c.status || 'Pending',
          email: c.email,
          feedbackText: c.feedbackText || '',
          suitableJobs: c.suitableJobs || [],
          skillsToWorkOn: c.skillsToWorkOn || [],
          skills: c.skills || [],
          matchColor: c.matchPercentage >= 85 ? 'green' : c.matchPercentage >= 70 ? 'yellow' : 'red'
        });
        setColumns([
          { id: 'col-ready', title: 'Selected for Next Round', color: '#10b981', cards: json.data.filter(c => c.status === 'Selected').map(mapCard) },
          { id: 'col-needs-work', title: 'Not Selected', color: '#ef4444', cards: json.data.filter(c => c.status === 'Not Selected').map(mapCard) }
        ]);
      }
    } catch (e) {
      console.error('Failed to fetch candidates:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCandidates(true); }, []);

  const handleDeleteFromView = (deletedId) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.filter(c => c.id !== deletedId)
    })));
  };

  const handleDragStart = (e, card, colId) => {
    setDraggedCard(card);
    setDraggedColId(colId);
    e.currentTarget.classList.add('dragging');
  };
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedCard(null);
    setDraggedColId(null);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e, targetColId) => {
    e.preventDefault();
    if (!draggedCard || draggedColId === targetColId) return;
    
    const newStatus = targetColId === 'col-ready' ? 'Selected' : 'Not Selected';

    setColumns(prev => prev.map(col => {
      if (col.id === draggedColId) return { ...col, cards: col.cards.filter(c => c.id !== draggedCard.id) };
      if (col.id === targetColId) return { ...col, cards: [...col.cards, { ...draggedCard, status: newStatus }] };
      return col;
    }));

    try {
      await fetch(`${API_BASE}/api/candidates/${draggedCard.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update candidate status', err);
    }
  };

  return (
    <div className="page-container fade-in">
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onDelete={handleDeleteFromView}
          token={token}
        />
      )}

      <header className="page-header">
        <div>
          <h1 className="heading-lg">Candidate Pipeline</h1>
          <p className="text-muted">Click a card to view full AI analysis. Drag to move between columns.</p>
        </div>
        <button className="primary-btn flex items-center gap-2" onClick={fetchCandidates}>
          <RefreshCw size={18} /> Refresh
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>Loading candidates...</p>
        </div>
      ) : !isAuthenticated ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Admin Access Required</h3>
          <p>Please log in to view the Candidate Pipeline.</p>
        </div>
      ) : (
        <div className="board-scroll-container">
          <div className="kanban-board">
            {columns.map(col => (
              <div
                key={col.id}
                className="kanban-column glass-panel"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="column-header">
                  <div className="column-title">
                    <span className="column-dot" style={{ backgroundColor: col.color }}></span>
                    <h3 className="heading-md" style={{ margin: 0, fontSize: '1.1rem' }}>{col.title}</h3>
                    <span className="card-count">{col.cards.length}</span>
                  </div>
                </div>
                <div className="column-cards">
                  {col.cards.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>
                      No candidates yet. Analyze a resume to see results here.
                    </p>
                  ) : col.cards.map((card, idx) => (
                    <div
                      key={card.id}
                      className="kanban-card fade-in"
                      draggable
                      onDragStart={(e) => handleDragStart(e, card, col.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedCandidate(card)}
                      style={{ 
                        cursor: 'pointer',
                        animationDelay: `${idx * 0.05}s`
                      }}
                    >
                      <div className="card-drag-handle">
                        <GripVertical size={14} className="text-muted" />
                      </div>
                      <div className="card-content">
                        <div className="card-header">
                          <h4>{card.name}</h4>
                          <span style={{ color: col.color, fontWeight: 600, fontSize: '0.85rem' }}>
                            {card.score}% Match
                          </span>
                        </div>
                        <p className="text-muted text-sm" style={{ fontSize: '0.78rem' }}>{card.email}</p>
                        <div className="card-footer">
                          <div className="avatar text-xs">{(card.name || '?').charAt(0).toUpperCase()}</div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                            Click to view profile →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
