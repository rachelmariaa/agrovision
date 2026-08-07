import React from 'react';
import { getNdviColor } from '../services/api';
import { History, Palette } from 'lucide-react';

export function NdviLegend() {
  const legendItems = [
    { color: '#3b82f6', label: 'Water / No Veg.' },
    { color: '#d97706', label: 'Bare Soil' },
    { color: '#eab308', label: 'Sparse Veg.' },
    { color: '#84cc16', label: 'Moderate Veg.' },
    { color: '#22c55e', label: 'Dense Veg.' },
    { color: '#166534', label: 'Very Dense' },
  ];

  return (
    <div className="modern-card">
      <div className="card-title">
        <Palette size={16} color="#10b981" /> Color Calibration
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
        {legendItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.73rem', color: '#94a3b8',
              background: 'rgba(0,0,0,0.18)',
              padding: '5px 8px', borderRadius: '7px'
            }}
          >
            <div style={{
              width: '10px', height: '10px', borderRadius: '3px',
              background: item.color, flexShrink: 0,
              boxShadow: `0 0 6px ${item.color}`
            }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScanHistory({ history, onSelectRecord }) {
  return (
    <div className="modern-card">
      <div className="card-title">
        <History size={16} color="#10b981" /> Scan History
      </div>

      {!history || history.length === 0 ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', fontSize: '0.85rem', fontStyle: 'italic' }}>
          Awaiting initial scan...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr>
                <th style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', padding: '6px', textAlign: 'left' }}>Lat</th>
                <th style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', padding: '6px', textAlign: 'left' }}>Lon</th>
                <th style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', padding: '6px', textAlign: 'left' }}>NDVI</th>
                <th style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', padding: '6px', textAlign: 'left' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 8).map((row, idx) => {
                const c = getNdviColor(row.ndvi);
                const t = new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                return (
                  <tr
                    key={idx}
                    onClick={() => onSelectRecord && onSelectRecord(row)}
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                  >
                    <td style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 6px', fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace", borderRadius: '6px 0 0 6px' }}>
                      {parseFloat(row.lat).toFixed(2)}
                    </td>
                    <td style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 6px', fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace" }}>
                      {parseFloat(row.lon).toFixed(2)}
                    </td>
                    <td style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 6px', fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace", color: c, fontWeight: 700, textShadow: `0 0 5px ${c}` }}>
                      {row.ndvi !== null && row.ndvi !== undefined ? row.ndvi.toFixed(3) : 'N/A'}
                    </td>
                    <td style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 6px', fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace", borderRadius: '0 6px 6px 0', color: '#94a3b8' }}>
                      {t}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
