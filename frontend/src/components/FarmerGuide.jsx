import React, { useState } from 'react';
import {
  BookOpen, MapPin, Layers, Leaf, Download,
  Languages, ChevronDown, Lightbulb, MousePointerClick,
  Camera, FileBarChart2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const STEP_META = [
  { Icon: MousePointerClick, color: '#10b981' },
  { Icon: Layers,            color: '#3b82f6' },
  { Icon: Leaf,              color: '#22c55e' },
  { Icon: Camera,            color: '#f59e0b' },
  { Icon: FileBarChart2,     color: '#a78bfa' },
  { Icon: Languages,         color: '#34d399' },
];

export default function FarmerGuide({ expanded: defaultExpanded = false }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(defaultExpanded);

  const steps = [
    { titleKey: 'guideStep1Title', descKey: 'guideStep1Desc', ...STEP_META[0] },
    { titleKey: 'guideStep2Title', descKey: 'guideStep2Desc', ...STEP_META[1] },
    { titleKey: 'guideStep3Title', descKey: 'guideStep3Desc', ...STEP_META[2] },
    { titleKey: 'guideStep4Title', descKey: 'guideStep4Desc', ...STEP_META[3] },
    { titleKey: 'guideStep5Title', descKey: 'guideStep5Desc', ...STEP_META[4] },
    { titleKey: 'guideStep6Title', descKey: 'guideStep6Desc', ...STEP_META[5] },
  ];

  // ── Full-width standalone layout (below map) ──────────────────────────────
  if (defaultExpanded) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(5,20,10,0.85) 0%, rgba(2,12,6,0.95) 100%)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '20px',
        padding: '28px 32px',
        position: 'relative',
        overflow: 'clip',
      }}>
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
        }} />

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.1))',
              border: '1px solid rgba(16,185,129,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16,185,129,0.2)',
            }}>
              <BookOpen size={22} color="#34d399" />
            </div>
            <div>
              <div style={{
                fontSize: '1.05rem', fontWeight: 900, color: '#f0fdf4',
                letterSpacing: '0.3px',
              }}>
                {t('guideTitle')}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                {t('guideSubtitle')}
              </div>
            </div>
          </div>
        </div>

        {/* 3-column step grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
          marginBottom: '16px',
        }}>
          {steps.map(({ titleKey, descKey, Icon, color }, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0,0,0,0.28)',
                border: `1px solid ${color}20`,
                borderLeft: `3px solid ${color}`,
                borderRadius: '14px',
                padding: '16px 18px',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                transition: 'border-color 0.25s, box-shadow 0.25s',
                animation: `fadeInUp 0.4s ease ${idx * 0.07}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.boxShadow = `0 0 18px ${color}25`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = `${color}20`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color={color} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.82rem', fontWeight: 800, color: '#f0fdf4',
                  marginBottom: '5px', lineHeight: 1.3,
                }}>
                  {t(titleKey)}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  {t(descKey)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tip banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '12px', padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <Lightbulb size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, lineHeight: 1.5 }}>
            {t('guideTip')}
          </span>
        </div>
      </div>
    );
  }

  // ── Compact collapsible sidebar version ───────────────────────────────────
  return (
    <div style={{
      background: 'rgba(0,0,0,0.32)',
      border: '1px solid rgba(16,185,129,0.2)',
      borderRadius: '14px',
      overflow: 'clip',
      flexShrink: 0,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.08))',
            border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={13} color="#34d399" />
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 800, color: '#34d399',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {t('guideTitle')}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: '1px' }}>
              {t('guideSubtitle')}
            </div>
          </div>
        </div>
        <div style={{
          width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.25s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
        }}>
          <ChevronDown size={12} color="#34d399" />
        </div>
      </button>

      <div style={{
        maxHeight: open ? '1000px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{ padding: '0 12px 14px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ height: '1px', background: 'rgba(16,185,129,0.12)', marginBottom: '4px' }} />
          {steps.map(({ titleKey, descKey, Icon, color }, idx) => (
            <div key={idx} style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              background: 'rgba(0,0,0,0.22)',
              border: `1px solid ${color}18`,
              borderLeft: `3px solid ${color}`,
              borderRadius: '10px', padding: '10px 12px',
            }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '1px',
              }}>
                <Icon size={13} color={color} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f0fdf4', marginBottom: '3px' }}>
                  {t(titleKey)}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.55 }}>
                  {t(descKey)}
                </div>
              </div>
            </div>
          ))}
          <div style={{
            marginTop: '4px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.04))',
            border: '1px solid rgba(16,185,129,0.22)',
            borderRadius: '10px', padding: '10px 12px',
            display: 'flex', alignItems: 'flex-start', gap: '8px',
          }}>
            <Lightbulb size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600, lineHeight: 1.5 }}>
              {t('guideTip')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
