import React, { useState } from 'react';
import {
  BookOpen, MapPin, Layers, Leaf, Download, Languages,
  Sparkles, CheckCircle2, ArrowRight, MousePointerClick,
  Sliders, ShieldCheck, PlayCircle, HelpCircle, FileText,
  Activity, AlertTriangle, Zap, Compass
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function GuidePage() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [testNdvi, setTestNdvi] = useState(0.72);
  const [faqOpen, setFaqOpen] = useState(null);

  // Helper for NDVI health rating
  const getNdviStatus = (val) => {
    if (val >= 0.6) return { label: t('statusExcellent'), color: '#10b981', bg: 'rgba(16,185,129,0.2)', desc: 'Dense, healthy chlorophyll. Crops are thriving.' };
    if (val >= 0.4) return { label: t('statusHealthy'), color: '#34d399', bg: 'rgba(52,211,153,0.2)', desc: 'Good vegetation health. Maintain current irrigation.' };
    if (val >= 0.2) return { label: t('statusModerate'), color: '#f59e0b', bg: 'rgba(245,158,11,0.2)', desc: 'Moderate stress. Check soil moisture and fertilization.' };
    return { label: t('statusStressed'), color: '#ef4444', bg: 'rgba(239,68,68,0.2)', desc: 'Severe crop stress or bare soil. Urgent inspection needed.' };
  };

  const currentNdviInfo = getNdviStatus(testNdvi);

  const STEPS = [
    {
      id: 'step1',
      num: '01',
      titleKey: 'guideStep1Title',
      descKey: 'guideStep1Desc',
      icon: MousePointerClick,
      color: '#10b981',
      detail: 'Click anywhere on the interactive satellite map. AgroVision instantly queries satellite bands to fetch real-time NDVI vegetation index, temperature (°C), soil moisture (m³/m³), and rainfall data for that exact coordinate.',
      demoType: 'map_click'
    },
    {
      id: 'step2',
      num: '02',
      titleKey: 'guideStep2Title',
      descKey: 'guideStep2Desc',
      icon: Layers,
      color: '#3b82f6',
      detail: 'Open Field Manager from the top navbar, tap "Draw New Field Polygon", and plot your farm boundaries directly on the satellite map. Save your field with custom crop type and sowing dates.',
      demoType: 'draw_field'
    },
    {
      id: 'step3',
      num: '03',
      titleKey: 'guideStep3Title',
      descKey: 'guideStep3Desc',
      icon: Leaf,
      color: '#22c55e',
      detail: 'NDVI values range from -1.0 to +1.0. Healthy crops display values between 0.60 and 0.90. Monitor your telemetry gauges weekly to track growth progress.',
      demoType: 'ndvi_calc'
    },
    {
      id: 'step4',
      num: '04',
      titleKey: 'guideStep4Title',
      descKey: 'guideStep4Desc',
      icon: Sparkles,
      color: '#f59e0b',
      detail: 'Switch to the AI Crop Doctor tab. Upload a photo of your leaf or choose a sample preset. Our Computer Vision AI diagnoses fungal & bacterial pathogens, providing precise NPK organic & chemical remedies.',
      demoType: 'crop_doctor'
    },
    {
      id: 'step5',
      num: '05',
      titleKey: 'guideStep5Title',
      descKey: 'guideStep5Desc',
      icon: Download,
      color: '#a78bfa',
      detail: 'Click the "Crop Report" button in the top navbar to generate a professional PDF summary containing telemetry, soil health, weather, and AI diagnoses to present to agricultural officers.',
      demoType: 'report'
    },
    {
      id: 'step6',
      num: '06',
      titleKey: 'guideStep6Title',
      descKey: 'guideStep6Desc',
      icon: Languages,
      color: '#ec4899',
      detail: 'AgroVision supports 8 Indian languages (English, Hindi, Kannada, Telugu, Tamil, Marathi, Punjabi, Bengali). Toggle your language anytime from the top navbar selector.',
      demoType: 'multilingual'
    }
  ];

  const FAQS = [
    {
      q: 'How often is the satellite imagery updated?',
      a: 'AgroVision synchronizes satellite data every 5-7 days using Sentinel-2 and Landsat constellation orbits to give you accurate multi-spectral updates.'
    },
    {
      q: 'Can I use AgroVision without internet connectivity?',
      a: 'AgroVision automatically caches telemetry data for offline viewing. Diagnostic results will sync as soon as internet connection is restored.'
    },
    {
      q: 'How does the AI Crop Doctor diagnose diseases?',
      a: 'Our deep learning computer vision model analyzes leaf chlorophyll degradation, lesion spot geometric patterns, and color spectrum histograms to match known plant pathogens.'
    },
    {
      q: 'Are PDF Crop Reports available in regional languages?',
      a: 'Yes! PDF reports automatically translate into your currently selected language in AgroVision.'
    }
  ];

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '28px 36px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(6, 78, 59, 0.45) 0%, rgba(2, 12, 6, 0.98) 80%)',
    }}>
      {/* ── HERO BANNER ────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(5,150,105,0.05) 100%)',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '20px',
        padding: '22px 28px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', maxWidth: '750px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981, #047857)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(16,185,129,0.5)', flexShrink: 0,
            animation: 'glowPulse 3s ease-in-out infinite',
          }}>
            <Compass size={28} color="#ffffff" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontSize: '0.62rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px',
                background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)',
                color: '#34d399', textTransform: 'uppercase', letterSpacing: '1.2px',
              }}>
                SMART FARMER MANUAL v3.0
              </span>
            </div>
            <h1 style={{
              fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px',
              lineHeight: 1.25, margin: 0,
            }}>
              {t('guideTitle').replace(/^📖\s*/, '')}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.4 }}>
              {t('guideSubtitle')}
            </p>
          </div>
        </div>

        {/* Feature Badges */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '14px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '0.78rem', color: '#34d399', fontWeight: 800
          }}>
            <CheckCircle2 size={16} /> 8 Regional Languages
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '14px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '0.78rem', color: '#60a5fa', fontWeight: 800
          }}>
            <Zap size={16} /> AI Disease Scanner
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE STEP WALKTHROUGH SECTION ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Left Step Selector Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
            ⚡ STEP-BY-STEP INSTRUCTIONS
          </div>
          {STEPS.map((step, idx) => {
            const active = activeStep === idx;
            const IconComponent = step.icon;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className="card-3d-interactive"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(5,150,105,0.12))'
                    : 'rgba(5,20,10,0.65)',
                  border: `1px solid ${active ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '18px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: active
                    ? '0 16px 36px rgba(16,185,129,0.35), 0 0 20px rgba(16,185,129,0.15) inset'
                    : '0 6px 18px rgba(0,0,0,0.3)',
                  transform: active ? 'perspective(1000px) rotateY(-4deg) translateZ(12px)' : 'none',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                  background: `${step.color}20`, border: `1px solid ${step.color}45`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  boxShadow: active ? `0 0 16px ${step.color}60` : 'none',
                }}>
                  {active && <div className="holo-scan-ring" style={{ borderColor: step.color }} />}
                  <IconComponent size={20} color={step.color} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 900, color: step.color, letterSpacing: '1px' }}>
                    STEP {step.num}
                  </div>
                  <div style={{
                    fontSize: '0.88rem', fontWeight: 800, color: active ? '#ffffff' : '#e2e8f0',
                    marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {t(step.titleKey)}
                  </div>
                </div>

                <ArrowRight size={16} color={active ? '#10b981' : '#475569'} />
              </div>
            );
          })}
        </div>

        {/* Right Active Step Detailed Interactive 3D Display */}
        <div
          key={activeStep}
          className="glass-panel"
          style={{
            padding: '36px', borderRadius: '24px', minHeight: '480px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            background: 'linear-gradient(145deg, rgba(5,28,14,0.9) 0%, rgba(2,14,7,0.95) 100%)',
            border: '1px solid rgba(16,185,129,0.35)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
            animation: 'cardFlip3D 0.45s ease both',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Ambient 3D floating orb */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px',
            borderRadius: '50%', background: `radial-gradient(circle, ${STEPS[activeStep].color}25 0%, transparent 70%)`,
            pointerEvents: 'none', animation: 'float3D 6s ease-in-out infinite'
          }} />

          <div>
            {/* Header of Active Step */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <span style={{
                fontSize: '0.82rem', fontWeight: 900, padding: '6px 14px', borderRadius: '12px',
                background: `${STEPS[activeStep].color}25`, border: `1px solid ${STEPS[activeStep].color}`,
                color: STEPS[activeStep].color, letterSpacing: '1px',
                boxShadow: `0 0 18px ${STEPS[activeStep].color}40`,
              }}>
                STEP {STEPS[activeStep].num}
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
                {t(STEPS[activeStep].titleKey)}
              </h2>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '24px' }}>
              {STEPS[activeStep].detail}
            </p>

            {/* Step-specific Interactive Widget / Visual Demonstrator */}
            {STEPS[activeStep].demoType === 'ndvi_calc' && (
              <div style={{
                background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px',
                boxShadow: `0 12px 30px rgba(0,0,0,0.5), 0 0 20px ${currentNdviInfo.color}20 inset`,
                transformStyle: 'preserve-3d', transition: 'box-shadow 0.3s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={16} color="#10b981" /> Interactive 3D NDVI Health Gauge Demo
                  </span>
                  <span style={{
                    fontSize: '0.85rem', fontWeight: 900, color: currentNdviInfo.color,
                    padding: '5px 14px', borderRadius: '12px', background: currentNdviInfo.bg,
                    border: `1px solid ${currentNdviInfo.color}50`,
                    boxShadow: `0 0 16px ${currentNdviInfo.color}40`,
                  }}>
                    NDVI {testNdvi.toFixed(2)} — {currentNdviInfo.label}
                  </span>
                </div>

                <input
                  type="range" min="0" max="1" step="0.01" value={testNdvi}
                  onChange={e => setTestNdvi(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: currentNdviInfo.color, cursor: 'pointer', height: '6px' }}
                />

                <div style={{
                  padding: '14px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${currentNdviInfo.color}40`, fontSize: '0.82rem', color: '#e2e8f0',
                  boxShadow: `inset 0 0 15px ${currentNdviInfo.color}15`,
                }}>
                  <strong style={{ color: currentNdviInfo.color }}>3D Recommendation Guidance: </strong>
                  {currentNdviInfo.desc}
                </div>
              </div>
            )}

            {STEPS[activeStep].demoType !== 'ndvi_calc' && (
              <div style={{
                background: 'rgba(0,0,0,0.38)', border: '1px dashed rgba(16,185,129,0.3)',
                borderRadius: '20px', padding: '32px', textAlign: 'center', display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)',
              }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '22px', background: `${STEPS[activeStep].color}18`,
                  border: `1px solid ${STEPS[activeStep].color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', boxShadow: `0 0 28px ${STEPS[activeStep].color}35`,
                  animation: 'float3D 4s ease-in-out infinite',
                }}>
                  <div className="holo-scan-ring" style={{ borderColor: STEPS[activeStep].color }} />
                  {React.createElement(STEPS[activeStep].icon, { size: 34, color: STEPS[activeStep].color })}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '440px', lineHeight: 1.6 }}>
                  {t(STEPS[activeStep].descKey)}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginTop: '24px'
          }}>
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(s => Math.max(0, s - 1))}
              style={{
                background: 'rgba(255,255,255,0.06)', color: activeStep === 0 ? '#475569' : '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px',
                fontSize: '0.82rem', fontWeight: 800, cursor: activeStep === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Previous Step
            </button>

            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
              {activeStep + 1} of {STEPS.length} Steps
            </span>

            <button
              disabled={activeStep === STEPS.length - 1}
              onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff',
                border: 'none', padding: '10px 22px', borderRadius: '12px',
                fontSize: '0.82rem', fontWeight: 800, cursor: activeStep === STEPS.length - 1 ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 16px rgba(16,185,129,0.35)'
              }}
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>

      {/* ── FREQUENTLY ASKED QUESTIONS (FAQ) ──────────────────── */}
      <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(5,20,10,0.7)' }}>
        <div style={{
          fontSize: '0.9rem', fontWeight: 800, color: '#34d399', letterSpacing: '1.5px',
          textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <HelpCircle size={20} /> FREQUENTLY ASKED FARMER QUESTIONS
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', padding: '20px', transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                ❓ {faq.q}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
