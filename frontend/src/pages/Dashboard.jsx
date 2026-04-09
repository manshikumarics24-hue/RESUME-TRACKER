import React from 'react';
import RadarChartWidget from '../components/RadarChartWidget';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const MOCK_DATA_1 = [
  { subject: 'React', required: 90, candidate: 85 },
  { subject: 'Node.js', required: 80, candidate: 60 },
  { subject: 'System Design', required: 70, candidate: 50 },
  { subject: 'CSS/UI', required: 75, candidate: 90 },
  { subject: 'Databases', required: 60, candidate: 70 },
  { subject: 'Communication', required: 80, candidate: 85 }
];

const MOCK_DATA_2 = [
  { subject: 'React', required: 90, candidate: 95 },
  { subject: 'Node.js', required: 80, candidate: 85 },
  { subject: 'System Design', required: 70, candidate: 80 },
  { subject: 'CSS/UI', required: 75, candidate: 70 },
  { subject: 'Databases', required: 60, candidate: 80 },
  { subject: 'Leadership', required: 85, candidate: 90 }
];

export default function Dashboard() {
  const stats = [
    { label: 'Total Candidates', value: '142', icon: <Users size={24} />, color: 'var(--accent-blue)' },
    { label: 'Shortlisted', value: '38', icon: <UserCheck size={24} />, color: '#10b981' },
    { label: 'Interviews Scheduled', value: '12', icon: <Calendar size={24} />, color: 'var(--accent-purple)' },
    { label: 'Current Offer Rate', value: '18%', icon: <TrendingUp size={24} />, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-page fade-in">
      <header className="page-header">
        <div>
          <h1 className="heading-lg">Dashboard Overview</h1>
          <p className="text-muted">Analyze your candidate pipeline and skill matches clearly.</p>
        </div>
        <button className="primary-btn">Download PDF Report</button>
      </header>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card glass-panel">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <RadarChartWidget 
          data={MOCK_DATA_2} 
          title="Top Candidate: Sarah Jenkins" 
          subtitle="Match Score: 92% | Role: Senior Frontend Dev"
        />
        <RadarChartWidget 
          data={MOCK_DATA_1} 
          title="Recent Review: Michael Chen" 
          subtitle="Match Score: 74% | Role: Fullstack Engineer"
        />
      </div>
      
      <div className="recent-activity glass-panel mt-2">
        <h3 className="heading-md" style={{ marginBottom: '1.5rem' }}>Recent AI Parsed Resumes</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Applied Role</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sarah Jenkins</td>
                <td>Senior Frontend Dev</td>
                <td><span className="badge success">92%</span></td>
                <td><span className="status-dot green"></span> Shortlisted</td>
                <td><button className="text-btn">View Profile</button></td>
              </tr>
              <tr>
                <td>Michael Chen</td>
                <td>Fullstack Engineer</td>
                <td><span className="badge warning">74%</span></td>
                <td><span className="status-dot yellow"></span> Pending Review</td>
                <td><button className="text-btn">View Profile</button></td>
              </tr>
              <tr>
                <td>David Smith</td>
                <td>Backend Dev</td>
                <td><span className="badge danger">45%</span></td>
                <td><span className="status-dot red"></span> Rejected</td>
                <td><button className="text-btn">View Profile</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
