import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import './RadarChartWidget.css';

const RadarChartWidget = ({ data, title, subtitle }) => {
  return (
    <div className="radar-widget glass-panel">
      <div className="widget-header">
        <h3 className="heading-md">{title || "Skill Match Analysis"}</h3>
        <p className="text-muted">{subtitle || "Candidate vs Job Description"}</p>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--border-glass-bright)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false} 
              axisLine={false} 
            />
            
            <Radar
              name="Requirement"
              dataKey="required"
              stroke="var(--accent-blue)"
              fill="var(--accent-blue)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="Candidate"
              dataKey="candidate"
              stroke="var(--accent-purple)"
              fill="var(--accent-purple)"
              fillOpacity={0.5}
              strokeWidth={2}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-card)', 
                borderColor: 'var(--border-glass)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow-glass)'
              }}
              itemStyle={{ color: 'var(--text-main)', fontWeight: 500 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <span className="dot bg-blue"></span> 
          <span>Requirement</span>
        </div>
        <div className="legend-item">
          <span className="dot bg-purple"></span> 
          <span>Candidate Skill</span>
        </div>
      </div>
    </div>
  );
};

export default RadarChartWidget;
