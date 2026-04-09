import React, { useState } from 'react';
import { MoreHorizontal, Plus, GripVertical } from 'lucide-react';
import './KanbanBoard.css';

const initialColumns = [
  {
    id: 'col-1',
    title: 'New Applied',
    color: 'var(--accent-blue)',
    cards: [
      { id: 'c1', name: 'James Wilson', role: 'Frontend Dev', score: 65, matchColor: 'yellow' },
      { id: 'c2', name: 'Maria Garcia', role: 'React Dev', score: 40, matchColor: 'red' }
    ]
  },
  {
    id: 'col-2',
    title: 'Shortlisted',
    color: 'var(--accent-purple)',
    cards: [
      { id: 'c3', name: 'Sarah Jenkins', role: 'Senior Frontend Dev', score: 92, matchColor: 'green' },
      { id: 'c4', name: 'Michael Chen', role: 'Fullstack Engineer', score: 74, matchColor: 'yellow' }
    ]
  },
  {
    id: 'col-3',
    title: 'Interviewing',
    color: '#f59e0b',
    cards: [
      { id: 'c5', name: 'Priya Patel', role: 'UI Engineer', score: 88, matchColor: 'green' }
    ]
  },
  {
    id: 'col-4',
    title: 'Offered',
    color: '#10b981',
    cards: [
      { id: 'c6', name: 'Alex Thompson', role: 'Backend Lead', score: 95, matchColor: 'green' }
    ]
  },
  {
    id: 'col-5',
    title: 'Rejected',
    color: '#ef4444',
    cards: []
  }
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedColId, setDraggedColId] = useState(null);

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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    if (!draggedCard || draggedColId === targetColId) return;

    const newColumns = columns.map(col => {
      if (col.id === draggedColId) {
        return { ...col, cards: col.cards.filter(c => c.id !== draggedCard.id) };
      }
      if (col.id === targetColId) {
        return { ...col, cards: [...col.cards, draggedCard] };
      }
      return col;
    });

    setColumns(newColumns);
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <div>
          <h1 className="heading-lg">Candidates Pipeline</h1>
          <p className="text-muted">Manage candidates across different interview stages with drag & drop.</p>
        </div>
        <button className="primary-btn flex items-center gap-2">
          <Plus size={18} /> Add Candidate
        </button>
      </header>

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
                <button className="icon-btn"><MoreHorizontal size={18} /></button>
              </div>

              <div className="column-cards">
                {col.cards.map(card => (
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
                        <span className={`badge text-${card.matchColor}`} style={{ background: 'transparent', padding: 0 }}>
                          {card.score}% Match
                        </span>
                      </div>
                      <p className="text-muted text-sm">{card.role}</p>
                      <div className="card-footer">
                        <div className="avatar text-xs">{card.name.charAt(0)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
