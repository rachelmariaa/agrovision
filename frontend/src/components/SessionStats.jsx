import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function SessionStats({ stats }) {
  return (
    <div className="modern-card">
      <div className="card-title">
        <BarChart3 size={16} color="#10b981" /> Session Metrics
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { value: stats ? stats.count : 0, label: 'Scans', color: 'white' },
          { value: stats && stats.average != null ? stats.average.toFixed(3) : '—', label: 'Avg NDVI', color: '#38bdf8' },
          { value: stats && stats.max != null ? stats.max.toFixed(3) : '—', label: 'Max Peak', color: '#4ade80' },
          { value: stats && stats.min != null ? stats.min.toFixed(3) : '—', label: 'Min Value', color: '#f87171' },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {item.value}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
