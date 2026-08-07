import React from 'react';

const STAGE_COLORS = {
  past:    { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#10b981', bar: '#059669' },
  current: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.5)', text: '#f59e0b', bar: '#f59e0b' },
  future:  { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', text: '#64748b', bar: '#1e293b' },
};

export default function CropCalendarTimeline({ calendar }) {
  if (!calendar) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: '#4ade80', fontSize: '0.8rem' }}>
        🌱 No calendar data — set a sowing date for this field
      </div>
    );
  }

  const { stages, crop_type, sowing_date, harvest_date, days_since_sow, days_to_harvest, current_stage } = calendar;
  const totalDays = stages.reduce((s, st) => s + st.duration_days, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header summary ── */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {[
          { label: 'Crop', value: crop_type, icon: '🌾' },
          { label: 'Sown', value: new Date(sowing_date).toLocaleDateString('en-IN', { day:'2-digit',month:'short',year:'numeric' }), icon: '📅' },
          { label: 'Harvest ETA', value: new Date(harvest_date).toLocaleDateString('en-IN', { day:'2-digit',month:'short',year:'numeric' }), icon: '🚜' },
          { label: 'Days Left', value: days_to_harvest > 0 ? `${days_to_harvest}d` : 'Harvest Due!', icon: '⏳' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            flex: '1 1 120px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '10px',
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              {icon} {label}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0fdf4' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Overall progress bar ── */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
          <span style={{ fontSize:'0.68rem', color:'#64748b', letterSpacing:'1px', textTransform:'uppercase' }}>Season Progress</span>
          <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#10b981' }}>
            Day {Math.min(days_since_sow, totalDays)} / {totalDays}
          </span>
        </div>
        <div style={{ height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'4px', overflow:'hidden' }}>
          <div style={{
            height:'100%',
            width:`${Math.min(100, (days_since_sow / totalDays) * 100)}%`,
            background:'linear-gradient(90deg, #059669, #10b981, #34d399)',
            borderRadius:'4px',
            transition:'width 0.8s ease',
            boxShadow:'0 0 8px rgba(16,185,129,0.6)',
          }} />
        </div>
      </div>

      {/* ── Current stage highlight ── */}
      {current_stage && (
        <div style={{
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.4)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'fadeInUp 0.4s ease',
        }}>
          <span style={{ fontSize: '1.8rem' }}>{current_stage.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>
              Current Stage
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{current_stage.stage}</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
              NDVI target: {current_stage.ndvi_range[0].toFixed(2)} – {current_stage.ndvi_range[1].toFixed(2)}
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            background: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.35)',
            borderRadius: '8px',
            padding: '8px 12px',
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f59e0b' }}>
              {current_stage.days_remaining}
            </div>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>days left</div>
          </div>
        </div>
      )}

      {/* ── Stage timeline ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {stages.map((stage, i) => {
          const colors = STAGE_COLORS[stage.status];
          const widthPct = (stage.duration_days / totalDays) * 100;
          return (
            <div key={i} style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
              opacity: stage.status === 'future' ? 0.6 : 1,
            }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{stage.emoji}</span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: colors.text }}>
                    {stage.stage}
                    {stage.status === 'current' && (
                      <span style={{
                        marginLeft: '8px', fontSize: '0.6rem', background: 'rgba(245,158,11,0.2)',
                        border: '1px solid rgba(245,158,11,0.5)', color: '#f59e0b',
                        padding: '1px 7px', borderRadius: '20px', verticalAlign: 'middle',
                      }}>ACTIVE</span>
                    )}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{stage.duration_days}d</span>
                </div>
                {/* Mini progress bar showing duration proportion */}
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: stage.status !== 'future' ? `${widthPct}%` : '0%',
                    background: colors.bar,
                    borderRadius: '2px',
                    boxShadow: stage.status === 'current' ? `0 0 6px ${colors.bar}` : 'none',
                  }} />
                </div>
                <div style={{ fontSize: '0.63rem', color: '#475569', marginTop: '4px' }}>
                  {new Date(stage.start_date).toLocaleDateString('en-IN', { day:'2-digit',month:'short' })}
                  {' → '}
                  {new Date(stage.end_date).toLocaleDateString('en-IN', { day:'2-digit',month:'short' })}
                  <span style={{ marginLeft: '8px', color: '#334155' }}>
                    NDVI {stage.ndvi_range[0].toFixed(2)}–{stage.ndvi_range[1].toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkmark for completed */}
              {stage.status === 'past' && (
                <span style={{ color: '#10b981', fontSize: '1rem', flexShrink: 0 }}>✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
