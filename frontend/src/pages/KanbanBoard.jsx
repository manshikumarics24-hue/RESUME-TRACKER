import React, { useState, useEffect } from 'react';
import { GripVertical, RefreshCw, Users } from 'lucide-react';
import './KanbanBoard.css';

const READY_THRESHOLD = 70; // Score >= 70 → Ready for Interview

export default function KanbanBoard() {
  const [columns, setColumns] = useState([
    { id: 'col-ready', title: 'Ready for Interview', color: '#10b981', cards: [] },
    { id: 'col-needs-work', title: 'Needs More Work', color: '#f59e0b', cards: [] }
  ]);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedColId, setDraggedColId] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/candidates');
      const json = await res.json();
      if (json.success && json.data) {
        const ready = json.data
          .filter(c => c.matchPercentage >= READY_THRESHOLD)
          .map(c => ({
            id: c._id,
            name: c.name || 'Unknown',
            score: c.matchPercentage,
            email: c.email,
            matchColor: c.matchPercentage >= 85 ? 'green' : 'yellow'
          }));
        const needsWork = json.data
          .filter(c => c.matchPercentage < READY_THRESHOLD)
          .map(c => ({
            id: c._id,
            name: c.name || 'Unknown',
            score: c.matchPercentage,
            email: c.email,
            matchColor: 'red'
          }));
        setColumns([
          { id: 'col-ready', title: 'Ready for Interview', color: '#10b981', cards: ready },
          { id: 'col-needs-work', title: 'Needs More Work', color: '#f59e0b', cards: needsWork }
        ]);
      }
    } catch (e) {
      console.error('Failed to fetch candidates:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCandidates(); }, []);

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
  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    if (!draggedCard || draggedColId === targetColId) return;
    const newColumns = columns.map(col => {
      if (col.id === draggedColId) return { ...col, cards: col.cards.filter(c => c.id !== draggedCard.id) };
      if (col.id === targetColId) return { ...col, cards: [...col.cards, draggedCard] };
      return col;
    });
    setColumns(newColumns);
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <div>
          <h1 className="heading-lg">Candidate Pipeline</h1>
          <p className="text-muted">Candidates auto-sorted by AI match score (≥{READY_THRESHOLD}% = Interview Ready)</p>
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
                  ) : col.cards.map(card => (
                    <div
                      key={card.id}
                      className="kanban-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, card, col.id)}
                      onDragEnd={handleDragEnd}
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
