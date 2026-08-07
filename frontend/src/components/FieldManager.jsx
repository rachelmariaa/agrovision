import React, { useState, useMemo } from 'react';
import { Plus, Layers, ChevronLeft, ChevronRight, Eye, Activity, Map, Sprout } from 'lucide-react';
import { deleteField, getNdviColor } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function FieldManager({ fields, onDrawNewField, onFieldSelect, onFieldDeleted, open, onToggle }) {
  const { t } = useLanguage();
  const [hoveredId, setHoveredId] = useState(null);

  const ndviStatus = (ndvi) => {
    if (ndvi === null || ndvi === undefined) return { label: t('statusNoData'), color: '#64748b', icon: '❓', bg: 'rgba(100,116,139,0.15)' };
    if (ndvi < 0.2) return { label: t('statusStressed'), color: '#f87171', icon: '🔴', bg: 'rgba(248,113,113,0.12)' };
    if (ndvi < 0.4) return { label: t('statusModerate'), color: '#f59e0b', icon: '🟡', bg: 'rgba(245,158,11,0.12)'  };
    if (ndvi < 0.6) return { label: t('statusHealthy'),  color: '#22c55e', icon: '🟢', bg: 'rgba(34,197,94,0.12)'   };
    return               { label: t('statusExcellent'),color: '#10b981', icon: '⭐', bg: 'rgba(16,185,129,0.15)'  };
  };

  const CROP_ICONS = {
    Wheat: '🌾', Rice: '🍚', Maize: '🌽', Cotton: '🪴',
    Sugarcane: '🎋', Paddy: '🌾', 'Wheat / Paddy': '🌾',
  };

  const stats = useMemo(() => {
    const totalArea = fields.reduce((s, f) => s + (f.area_hectares || 0), 0);
    const ndviFields = fields.filter(f => f.centroid_ndvi != null);
    const avgNdvi = ndviFields.length ? (ndviFields.reduce((s, f) => s + f.centroid_ndvi, 0) / ndviFields.length) : null;
    return { totalArea: totalArea.toFixed(1), avgNdvi };
  }, [fields]);

  return (
    <>
      {/* ── Toggle tab ── */}
      <button
        onClick={onToggle}
        title={open ? 'Close Field Manager' : 'Open Field Manager'}
        style={{
          position: 'absolute',
          left: open ? '340px' : '0px',
          top: '50%', transform: 'translateY(-50%)',
          zIndex: 500,
          background: open
            ? 'linear-gradient(180deg, #065f46, #047857)'
            : 'linear-gradient(180deg, #10b981, #059669)',
          border: 'none',
          borderRadius: '0 14px 14px 0',
          padding: '16px 7px',
          color: '#fff', cursor: 'pointer',
          transition: 'left 0.38s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        }}
      >
        <Layers size={15} />
        <span style={{
          fontSize: '0.5rem', fontWeight: 900, letterSpacing: '1.5px',
          writingMode: 'vertical-rl', textOrientation: 'mixed',
          transform: 'rotate(180deg)', textTransform: 'uppercase',
        }}>
          {open ? 'CLOSE' : 'FIELDS'}
        </span>
        {open ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
      </button>

      {/* ── Slide-out drawer ── */}
      <div style={{
        position: 'absolute',
        left: open ? '0' : '-340px',
        top: 0, bottom: 0,
        width: '340px',
        zIndex: 400,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'left 0.38s cubic-bezier(0.4,0,0.2,1)',
        background: 'linear-gradient(180deg, rgba(1,14,8,0.98) 0%, rgba(2,10,5,0.99) 100%)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderRight: '1px solid rgba(16,185,129,0.2)',
        boxShadow: '12px 0 50px rgba(0,0,0,0.75)',
      }}>

        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
          opacity: 0.7,
        }} />

        {/* ── Header ── */}
        <div style={{
          padding: '18px 20px 14px',
          background: 'rgba(0,0,0,0.35)',
          borderBottom: '1px solid rgba(16,185,129,0.12)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16,185,129,0.5)',
              animation: 'glowPulse 3s ease-in-out infinite',
            }}>
              <Map size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: '#34d399' }}>
                {t('fieldManager')}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
                {fields.length} {t('fieldsRegistered')}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { val: fields.length,           label: t('fieldsCount'), color: '#10b981' },
              { val: `${stats.totalArea} ha`, label: t('totalArea'),   color: '#f59e0b' },
              { val: stats.avgNdvi != null ? stats.avgNdvi.toFixed(2) : '—', label: t('avgNdvi'), color: '#60a5fa' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px', padding: '8px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Draw New Field Button ── */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
          <button
            onClick={onDrawNewField}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.07))',
              border: '1.5px dashed rgba(16,185,129,0.45)',
              borderRadius: '12px', padding: '13px 18px',
              color: '#10b981', fontFamily: "'Outfit', sans-serif",
              fontSize: '0.82rem', fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.22s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              letterSpacing: '0.5px', animation: 'borderGlow 3s ease-in-out infinite',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(16,185,129,0.18)';
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.07))';
              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.45)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={17} /> {t('drawNewField')}
          </button>
        </div>

        {/* ── Field List ── */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '10px 14px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {fields.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '50px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '18px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'orbFloat 4s ease-in-out infinite',
              }}>
                <Sprout size={30} color="rgba(16,185,129,0.5)" />
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4b6b5a' }}>{t('noFieldsYet')}</div>
              <div style={{ fontSize: '0.72rem', color: '#334a3e', lineHeight: 1.6, maxWidth: '220px' }}>
                {t('noFieldsDesc')}
              </div>
            </div>
          ) : (
            fields.map((field, idx) => {
              const ndvi = field.centroid_ndvi ?? null;
              const status = ndviStatus(ndvi);
              const color = getNdviColor(ndvi);
              const cropIcon = CROP_ICONS[field.crop_type] || '🌱';
              const isHovered = hoveredId === field.id;

              return (
                <div
                  key={field.id}
                  onClick={() => onFieldSelect(field)}
                  onMouseEnter={() => setHoveredId(field.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    background: isHovered
                      ? `linear-gradient(135deg, ${status.bg}, rgba(0,0,0,0.5))`
                      : 'rgba(0,0,0,0.38)',
                    border: `1px solid ${isHovered ? color + '60' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '14px',
                    padding: '13px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    transform: isHovered ? 'translateX(5px)' : 'none',
                    boxShadow: isHovered ? `0 4px 20px ${color}25, 0 0 0 1px ${color}20` : 'none',
                    animation: `cardSlideIn 0.3s ease ${idx * 0.05}s both`,
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Left accent bar */}
                  <div style={{
                    position: 'absolute', left: 0, top: '12px', bottom: '12px',
                    width: '3px', borderRadius: '0 2px 2px 0',
                    background: color, boxShadow: `0 0 8px ${color}`,
                    opacity: isHovered ? 1 : 0.5,
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingLeft: '8px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '11px',
                      background: `${color}18`, border: `1.5px solid ${color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem', flexShrink: 0,
                    }}>
                      {cropIcon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.87rem', fontWeight: 800, color: '#f0fdf4',
                        lineHeight: 1, marginBottom: '3px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {field.name}
                      </div>
                      <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
                        {field.crop_type}{field.area_hectares ? ` · ${field.area_hectares} ha` : ''}
                        {field.sowing_date && (
                          <span style={{ marginLeft: '5px', color: '#475569' }}>
                            · {t('sownOn')} {new Date(field.sowing_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>

                      {/* NDVI bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: ndvi !== null ? `${Math.min(100, ndvi * 100)}%` : '0%',
                            background: `linear-gradient(90deg, ${color}aa, ${color})`,
                            borderRadius: '3px', boxShadow: `0 0 8px ${color}80`,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 800, color: status.color, flexShrink: 0,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {ndvi !== null ? ndvi.toFixed(3) : '—'}
                        </span>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, marginTop: '2px', opacity: isHovered ? 1 : 0.3, color: '#10b981' }}>
                      <Eye size={14} />
                    </div>
                  </div>

                  {/* Status badge */}
                  <div style={{
                    marginTop: '10px', marginLeft: '8px',
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: status.bg, border: `1px solid ${status.color}30`,
                    borderRadius: '20px', padding: '3px 10px',
                    fontSize: '0.62rem', fontWeight: 800, color: status.color,
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                  }}>
                    <Activity size={9} />
                    {status.label}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
