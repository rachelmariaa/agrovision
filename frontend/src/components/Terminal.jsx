import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldAlert } from 'lucide-react';

export default function Terminal({ logs }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColorClass = (msg) => {
    if (msg.includes('[NDVI]')) return '#bef264';
    if (msg.includes('[LOGIN]') || msg.includes('[REGISTER]')) return '#4ade80';
    if (msg.includes('[WEATHER]')) return '#7dd3fc';
    if (msg.includes('[SOIL]')) return '#fdba74';
    if (msg.includes('[ML]')) return '#f472b6';
    if (msg.includes('[API]')) return '#d8b4fe';
    if (msg.includes('[ERR]') || msg.includes('❌') || msg.includes('Error')) return '#fca5a5';
    return '#94a3b8';
  };

  return (
    <div className="sidebar-left glass-panel" style={{ width: '320px', flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div className="pulse-dot"></div>
        <TerminalIcon size={16} /> Server Link Active
      </div>

      <div
        ref={terminalRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.82rem',
          lineHeight: '1.6',
          wordBreak: 'break-all',
          background: 'rgba(0, 0, 0, 0.45)',
          boxShadow: 'inset 0 0 25px rgba(16, 185, 129, 0.05)',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', padding: '10px 0' }}>
            [SYS] Initializing AgroVision socket uplink...
          </div>
        ) : (
          logs.map((log, index) => {
            const color = getLogColorClass(log);
            return (
              <div
                key={index}
                style={{
                  padding: '5px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  color: color,
                  textShadow: `0 0 8px ${color}44`,
                  fontWeight: 500
                }}
              >
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
