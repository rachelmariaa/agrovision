import React, { useState } from 'react';
import {
  Camera, Upload, Sparkles, ShieldAlert, Leaf,
  Droplets, Thermometer, Globe, TestTube, ArrowRight, Loader2,
  FileImage, FlaskConical, MapPin, CheckCircle2
} from 'lucide-react';
import { diagnosePestPhoto } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const CROP_GROWING_GUIDE = {
  "Leaf Blast / Sheath Blight (Magnaporthe oryzae)": {
    crop: "Rice / Paddy",
    fertilizer_npk: "N:P:K 100:50:50 kg/ha. Cap Nitrogen (Urea) under 120 kg/ha to avoid blast spread.",
    fertilizers: ["Urea (45 kg/ha split dose)", "Single Super Phosphate (SSP 150 kg/ha)", "Zinc Sulphate (25 kg/ha)"],
    soil_type: "Clayey or Clay Loam with high moisture retention",
    soil_ph: "5.5 – 6.5 (Slightly Acidic)",
    ideal_temp: "20°C – 32°C",
    ideal_rainfall: "1000 – 1500 mm",
    growing_regions: "Punjab, West Bengal, Andhra Pradesh, Tamil Nadu, Uttar Pradesh, Odisha"
  },
  "Yellow / Brown Leaf Rust (Puccinia striiformis)": {
    crop: "Wheat",
    fertilizer_npk: "N:P:K 120:60:40 kg/ha. Top dress 50% Nitrogen at 1st crown root stage.",
    fertilizers: ["Urea (65 kg/ha at Crown Root)", "DAP (100 kg/ha at Sowing)", "Muriate of Potash (MOP 35 kg/ha)"],
    soil_type: "Well-drained Fertile Alluvial Loam or Black Cotton Soil",
    soil_ph: "6.0 – 7.5 (Neutral to slightly alkaline)",
    ideal_temp: "15°C – 24°C",
    ideal_rainfall: "450 – 750 mm",
    growing_regions: "Punjab, Haryana, Uttar Pradesh, Madhya Pradesh, Rajasthan, Bihar"
  },
  "Yellow Stem Borer / Armyworm (Scirpophaga incertulas)": {
    crop: "Maize / Corn",
    fertilizer_npk: "N:P:K 150:60:60 kg/ha with 10 kg/ha Zinc Sulphate basal dose.",
    fertilizers: ["Urea (75 kg/ha knee-high stage)", "DAP (130 kg/ha basal)", "Zinc Sulphate (25 kg/ha)"],
    soil_type: "Deep Loamy or Silt Loam rich in organic carbon",
    soil_ph: "5.8 – 7.2 (Well-drained)",
    ideal_temp: "21°C – 30°C",
    ideal_rainfall: "500 – 900 mm",
    growing_regions: "Karnataka, Andhra Pradesh, Maharashtra, Bihar, Rajasthan, Uttar Pradesh"
  },
  "Healthy Foliage — No Major Pathogen Detected": {
    crop: "Wheat / Paddy / Sugarcane / Cotton",
    fertilizer_npk: "Maintain balanced baseline N:P:K 120:60:60 kg/ha. Add organic compost.",
    fertilizers: ["Bio-fertilizers (Azospirillum & PSB @ 5 kg/ha)", "FYM / Vermicompost (5 tonnes/ha)", "MOP (40 kg/ha)"],
    soil_type: "Loamy Alluvial, Black Soil, or Red Clay Loam",
    soil_ph: "6.0 – 7.5",
    ideal_temp: "18°C – 32°C",
    ideal_rainfall: "600 – 1200 mm",
    growing_regions: "Pan-India agricultural belts"
  }
};

const SAMPLES = [
  { key: 'leaf_blast',  emoji: '🌾', name: 'Rice / Paddy',   desc: 'Leaf Blast & Sheath Blight',  url: 'https://images.unsplash.com/photo-1599598425947-020645542813?w=500&auto=format&fit=crop&q=60' },
  { key: 'rust',        emoji: '🌻', name: 'Wheat',          desc: 'Stripe Rust Yellow Pustules',  url: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a9f?w=500&auto=format&fit=crop&q=60' },
  { key: 'stem_borer',  emoji: '🌽', name: 'Maize / Corn',   desc: 'Dead Hearts & Whorl Damage',  url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=500&auto=format&fit=crop&q=60' },
  { key: 'healthy',     emoji: '🎋', name: 'Healthy Crop',   desc: 'Optimal Chlorophyll Vigor',   url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop&q=60' },
];

// ── Small reusable info row ──────────────────────────────────────
function InfoRow({ label, value, color = '#fff' }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(0,0,0,0.28)', padding: '9px 14px', borderRadius: '10px', fontSize: '0.8rem',
    }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export default function CropDoctorPage() {
  const { t } = useLanguage();
  const [selectedKey,   setSelectedKey]   = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [diagnosis,     setDiagnosis]     = useState(null);
  const [loading,       setLoading]       = useState(false);

  const runDiagnosis = async (keyOrFile, previewUrl) => {
    setImagePreview(previewUrl);
    setSelectedKey(typeof keyOrFile === 'string' ? keyOrFile : 'uploaded');
    setLoading(true);
    setDiagnosis(null);
    try {
      const res = await diagnosePestPhoto(keyOrFile);
      setDiagnosis(res);
    } catch (e) {
      console.error('Diagnosis failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => runDiagnosis(file, reader.result);
    reader.readAsDataURL(file);
  };

  const guide = diagnosis
    ? (CROP_GROWING_GUIDE[diagnosis.diagnosis] || CROP_GROWING_GUIDE["Healthy Foliage — No Major Pathogen Detected"])
    : null;

  const healthScore = diagnosis
    ? Math.round(Math.max(5, Math.min(100, 100 - (diagnosis.affected_leaf_area_percent || 20))))
    : 0;

  const hColor = healthScore > 75 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: '20px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(6,78,59,0.35) 0%, rgba(2,12,6,0.98) 75%)',
      minHeight: 0,
    }}>

      {/* ── Header Banner ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(5,150,105,0.05) 100%)',
        border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '18px 28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
            background: 'linear-gradient(135deg, #10b981, #047857)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(16,185,129,0.5)',
          }}>
            <TestTube size={26} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {t('cropDoctorTitle')}
              <span style={{ fontSize: '0.62rem', padding: '3px 9px', borderRadius: '20px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399', fontWeight: 800, letterSpacing: '1px' }}>
                COMPUTER VISION v2.4
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginTop: '3px' }}>{t('cropDoctorSubtitle')}</div>
          </div>
        </div>
        <label style={{
          background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
          border: '1px solid rgba(16,185,129,0.5)', padding: '11px 22px', borderRadius: '14px',
          fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(16,185,129,0.4)',
          transition: 'all 0.22s', flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Camera size={16} /> {t('uploadPhotoBtn')}
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* ── Main 2-Column Layout ───────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 340px) 1fr',
        gap: '20px',
        alignItems: 'start',
        flex: 1,
        minHeight: 0,
      }}>

        {/* ── LEFT: Leaf Scanner + Sample Presets ─────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Image Preview */}
          <div style={{
            background: 'rgba(5,20,10,0.7)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '20px', padding: '18px', backdropFilter: 'blur(20px)',
          }}>
            <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={14} /> {t('leafScannerTitle')}
            </div>

            {/* Image box */}
            <div style={{
              width: '100%', aspectRatio: '4/3', borderRadius: '14px', overflow: 'hidden',
              background: '#020d06', border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', boxShadow: 'inset 0 0 24px rgba(0,0,0,0.6)',
            }}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Leaf scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }} />
                  {loading && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(2,12,6,0.82)', backdropFilter: 'blur(6px)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      color: '#34d399', gap: '10px', fontSize: '0.82rem', fontWeight: 800,
                    }}>
                      <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                      Extracting Lesion Features…
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#475569', padding: '20px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px', margin: '0 auto 10px',
                    background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileImage size={26} color="#10b981" />
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#cbd5e1' }}>{t('noImageLoaded')}</div>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>{t('noImageDesc')}</div>
                </div>
              )}
            </div>

            {/* Drop zone */}
            <label style={{
              marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '14px', cursor: 'pointer',
              border: '2px dashed rgba(16,185,129,0.35)', borderRadius: '12px',
              background: 'rgba(16,185,129,0.03)', transition: 'all 0.22s',
              animation: 'uploadPulse 3s ease-in-out infinite',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.03)'}
            >
              <Upload size={20} color="#10b981" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>{t('dropzoneTitle')}</span>
              <span style={{ fontSize: '0.66rem', color: '#64748b', marginTop: '2px' }}>{t('dropzoneSub')}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Sample Presets */}
          <div style={{
            background: 'rgba(5,20,10,0.7)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px', padding: '18px', backdropFilter: 'blur(20px)',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              {t('samplePresetsTitle')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SAMPLES.map(item => {
                const active = selectedKey === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => runDiagnosis(item.key, item.url)}
                    style={{
                      background: active ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.08))' : 'rgba(0,0,0,0.28)',
                      border: `1px solid ${active ? '#10b981' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '12px', padding: '10px 14px', textAlign: 'left',
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      boxShadow: active ? '0 0 14px rgba(16,185,129,0.25)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: active ? '#34d399' : '#f0fdf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <div style={{ fontSize: '0.66rem', color: '#64748b', marginTop: '1px' }}>{item.desc}</div>
                    </div>
                    <ArrowRight size={13} color={active ? '#10b981' : '#334155'} style={{ flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Results / Awaiting State ─────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>

          {!diagnosis ? (
            /* Awaiting upload */
            <div style={{
              background: 'rgba(5,20,10,0.7)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '20px', padding: '48px 32px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)',
            }}>
              <div style={{
                position: 'absolute', width: '260px', height: '260px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.1), transparent 70%)',
                animation: 'orbFloat 6s ease-in-out infinite', pointerEvents: 'none',
              }} />
              <div style={{
                width: '80px', height: '80px', borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.05))',
                border: '1.5px solid rgba(16,185,129,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px', boxShadow: '0 0 32px rgba(16,185,129,0.25)',
                animation: 'glowPulse 3s infinite',
              }}>
                <TestTube size={40} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>{t('emptyRevealTitle')}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px', maxWidth: '460px', lineHeight: 1.7 }}>
                {t('emptyRevealDesc')}
              </div>
              <label style={{
                marginTop: '24px', background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', border: '1px solid rgba(16,185,129,0.5)',
                padding: '12px 28px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: '0 0 24px rgba(16,185,129,0.4)', transition: 'all 0.22s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Upload size={18} /> {t('selectFileToScan')}
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          ) : (
            <>
              {/* ── Card 1: Health Score & Pathogen ────────────── */}
              <div style={{
                background: 'rgba(5,20,10,0.7)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '20px', padding: '22px 24px', backdropFilter: 'blur(20px)',
                animation: 'resultReveal 0.4s ease both',
              }}>
                {/* Diagnosis header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.65rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
                      {t('pathogenResultTitle')}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginTop: '4px', lineHeight: 1.3 }}>
                      {diagnosis.diagnosis}
                    </div>
                  </div>
                  <span style={{
                    background: `${diagnosis.severity_color}22`, color: diagnosis.severity_color,
                    border: `1.5px solid ${diagnosis.severity_color}`, fontSize: '0.78rem',
                    fontWeight: 900, padding: '6px 14px', borderRadius: '20px',
                    boxShadow: `0 0 14px ${diagnosis.severity_color}40`, flexShrink: 0,
                  }}>
                    {diagnosis.severity}
                  </span>
                </div>

                {/* Health arc + metrics */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '20px',
                }}>
                  {/* Circular gauge */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: '82px', height: '82px', borderRadius: '50%',
                      background: `conic-gradient(${hColor} ${healthScore * 3.6}deg, rgba(255,255,255,0.07) 0deg)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 20px ${hColor}44`,
                    }}>
                      <div style={{
                        width: '66px', height: '66px', borderRadius: '50%', background: '#041d10',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: hColor, lineHeight: 1 }}>{healthScore}%</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px', fontWeight: 700 }}>
                      {t('cropHealthIndex')}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#94a3b8' }}>
                        {t('diagnosisConfidence')}: <strong style={{ color: '#fff' }}>{diagnosis.confidence_percent}%</strong>
                      </span>
                      <span style={{ color: '#94a3b8' }}>
                        {t('affectedLeafArea')}: <strong style={{ color: '#f59e0b' }}>{diagnosis.affected_leaf_area_percent || 24.5}%</strong>
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${healthScore}%`, borderRadius: '4px',
                        background: `linear-gradient(90deg, ${hColor}, #34d399)`,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                    {/* Symptoms */}
                    <div style={{
                      fontSize: '0.78rem', color: '#e2e8f0', marginTop: '12px', lineHeight: 1.6,
                      background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                      padding: '10px 14px', borderRadius: '10px',
                    }}>
                      <strong style={{ color: '#34d399' }}>{t('symptomsObserved')}: </strong>{diagnosis.symptoms}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Card 2: NPK & Fertilizer Guide ─────────────── */}
              {guide && (
                <div style={{
                  background: 'rgba(5,20,10,0.7)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '20px', padding: '20px 24px', backdropFilter: 'blur(20px)',
                  animation: 'resultReveal 0.45s ease both',
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={14} /> {t('npkGuideTitle')}
                  </div>

                  <div style={{
                    fontSize: '0.82rem', color: '#f0fdf4', marginBottom: '14px', lineHeight: 1.6,
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                    padding: '12px 16px', borderRadius: '12px',
                  }}>
                    <strong style={{ color: '#34d399' }}>{t('npkTarget')}: </strong>{guide.fertilizer_npk}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
                    {guide.fertilizers.map((fert, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px',
                      }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                        }}>🧪</div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f0fdf4', lineHeight: 1.4 }}>{fert}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Card 3: Soil, Climate & Regions (2-col) ─────── */}
              {guide && (
                <div style={{
                  background: 'rgba(5,20,10,0.7)', border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '20px', padding: '20px 24px', backdropFilter: 'blur(20px)',
                  animation: 'resultReveal 0.5s ease both',
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={14} /> {t('soilGuideTitle')}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '14px', padding: '14px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '6px' }}>{t('idealSoilPh')}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>{guide.soil_type}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
                        {t('optimalPh')}: <strong style={{ color: '#34d399' }}>{guide.soil_ph}</strong>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '14px', padding: '14px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '6px' }}>{t('tempRainfall')}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Temp: {guide.ideal_temp}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
                        {t('annualRainfall')}: <strong style={{ color: '#60a5fa' }}>{guide.ideal_rainfall}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={14} color="#34d399" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>{t('growingRegions')}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f0fdf4', marginTop: '3px' }}>{guide.growing_regions}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Card 4: Treatment Plan ──────────────────────── */}
              <div style={{
                background: 'rgba(5,20,10,0.7)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '20px', padding: '20px 24px', backdropFilter: 'blur(20px)',
                animation: 'resultReveal 0.55s ease both',
              }}>
                <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={14} /> {t('carePlanTitle')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('organicRemedy')}</div>
                    <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.55 }}>{diagnosis.organic_remedy}</div>
                  </div>
                  <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('chemicalTreatment')}</div>
                    <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.55 }}>{diagnosis.chemical_remedy}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
