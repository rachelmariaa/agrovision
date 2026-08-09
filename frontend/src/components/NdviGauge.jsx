import React, { useState } from 'react';
import { getNdviColor, downloadCropReport } from '../services/api';
import { Sparkles, MapPin, Clock, FileText, Download, Loader2 } from 'lucide-react';

export default function NdviGauge({ data, user }) {
  const [downloading, setDownloading] = useState(false);

  // If no data or water body detected, show empty state
  if (!data || (data.ndvi !== null && data.ndvi < 0)) {
    return (
      <div className="modern-card">
        <div className="card-title">
          <Sparkles size={16} color="#10b981" /> Primary Scan (NDVI)
        </div>
        <div style={{
          textAlign: 'center', color: '#64748b', fontSize: '0.78rem',
          padding: '14px 10px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '6px',
        }}>
          <div style={{ fontSize: '1.6rem', opacity: 0.7 }}>🎯</div>
          Click any point on the map to run a satellite NDVI scan.
        </div>
      </div>
    );
  }

  const v = data.ndvi;
  const color = getNdviColor(v);
  const pct = v !== null && v !== undefined ? ((Math.min(Math.max(v, -1), 1) + 1) / 2) * 100 : 50;
  
  // Check if this is bare area
  const isBareArea = v !== null && v >= 0 && v < 0.1;

  const handleDownloadReport = async () => {
    // Don't allow report generation for water bodies
    if (v !== null && v < 0) {
      alert('🌊 Cannot generate crop report for water bodies.\n\nPlease select a land area with vegetation for agricultural analysis.');
      return;
    }
    
    // Warn for bare areas but allow if user confirms
    if (v !== null && v < 0.1) {
      const confirmed = window.confirm(
        '⚠️ This area has very low vegetation coverage.\n\n' +
        'The report may not provide accurate crop recommendations. Do you want to continue?'
      );
      if (!confirmed) return;
    }

    setDownloading(true);
    try {
      const locationName = `Scan Point (${data.lat.toFixed(4)}°, ${data.lon.toFixed(4)}°)`;
      await downloadCropReport(data.lat, data.lon, 'General Agriculture', user || 'Farmer', locationName);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modern-card" style={{ borderColor: `${color}66` }}>
      <div className="card-title">
        <Sparkles size={16} color={color} /> Primary Scan (NDVI)
      </div>

      {/* Bare Area Warning */}
      {isBareArea && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(251, 191, 36, 0.15)',
          border: '2px solid rgba(251, 191, 36, 0.5)',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>⚠️</div>
          <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
            Low Vegetation Area
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.4 }}>
            Bare soil, rock, or built-up area with little to no plant coverage.
          </div>
        </div>
      )}

      {/* NDVI Value + Badge row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          fontSize: '2.6rem',
          fontWeight: 800,
          lineHeight: 1,
          color: color,
          textShadow: `0 0 18px ${color}66`,
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          {v !== null && v !== undefined ? v.toFixed(4) : 'N/A'}
        </div>
        <div>
          <div style={{
            padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            background: `${color}22`, color: color, border: `1px solid ${color}`,
            marginBottom: '4px', textAlign: 'center'
          }}>
            {data.category || 'Categorized'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center' }}>Vegetation Index</div>
        </div>
      </div>

      {/* Gauge Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          height: '7px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.08)', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            borderRadius: '8px',
            background: 'linear-gradient(90deg, #3b82f6, #84cc16, #22c55e)',
            width: `${pct}%`,
            boxShadow: `0 0 12px ${color}`,
            transition: 'width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }} />
          <div style={{
            position: 'absolute', top: '-5px', width: '4px', height: '17px',
            background: '#fff', borderRadius: '2px',
            transform: 'translateX(-50%)', boxShadow: '0 0 8px #fff',
            left: `${pct}%`,
            transition: 'left 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
          <span>-1.0</span><span>0.0</span><span>+1.0</span>
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '10px', textAlign: 'center', fontStyle: 'italic' }}>
          {data.description}
        </div>
      )}

      {/* Info grid: 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem' }}>
          <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <MapPin size={11} /> Latitude
          </div>
          <div style={{ color: 'white', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            {parseFloat(data.lat).toFixed(4)}°
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem' }}>
          <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <MapPin size={11} /> Longitude
          </div>
          <div style={{ color: 'white', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            {parseFloat(data.lon).toFixed(4)}°
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem', gridColumn: '1 / -1' }}>
          <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <Clock size={11} /> Scan Time
          </div>
          <div style={{ color: 'white', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownloadReport}
        disabled={downloading}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #10b981, #047857)',
          color: '#ffffff',
          border: '1px solid rgba(16,185,129,0.4)',
          padding: '10px 14px',
          borderRadius: '10px',
          fontSize: '0.82rem',
          fontWeight: 700,
          cursor: downloading ? 'wait' : 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
          fontFamily: "'Outfit', sans-serif"
        }}
        onMouseEnter={e => { if (!downloading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(16,185,129,0.45)'; } }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.25)'; }}
      >
        {downloading ? (
          <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating PDF…</>
        ) : (
          <><FileText size={14} /> Download Crop Report <Download size={12} /></>
        )}
      </button>
    </div>
  );
}
