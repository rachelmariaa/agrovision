import React, { useState, useEffect } from 'react';
import { Leaf, Satellite, Cpu, Activity } from 'lucide-react';

export default function Footer({ activeScan }) {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setUptime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtUptime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const links = ['Docs', 'API Ref', 'Field Guide', 'Support'];

  return (
    <footer className="app-footer">
      {/* Brand */}
      <div className="footer-brand">
        <Leaf size={14} color="#10b981" style={{ filter: 'drop-shadow(0 0 6px #10b981)' }} />
        AgroVision
        <span style={{ color: 'rgba(16,185,129,0.4)', fontWeight: 400, fontSize: '0.68rem', letterSpacing: '1px' }}>
          v2.0
        </span>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {links.map(l => (
          <span key={l} style={{
            fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer', transition: 'color 0.2s',
            letterSpacing: '0.5px',
          }}
            onMouseEnter={(e) => e.target.style.color = '#10b981'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
          >{l}</span>
        ))}
      </div>

      {/* Status cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Scan coords if active */}
        {activeScan && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'rgba(16,185,129,0.7)', fontFamily: "'JetBrains Mono', monospace" }}>
            <Satellite size={12} />
            {activeScan.lat?.toFixed(4)}°N · {activeScan.lon?.toFixed(4)}°E
          </div>
        )}

        {/* Uptime */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>
          <Activity size={11} />
          UP {fmtUptime(uptime)}
        </div>

        {/* Powered by */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5px' }}>
          <Cpu size={11} />
          Powered by FastAPI · Leaflet · React
        </div>

        <div className="footer-copy">
          © 2026 AgroVision. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
