import React, { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee, Droplets, Zap, ShieldAlert, Camera, Calendar,
  CheckCircle2, AlertTriangle, CloudRain, Sun, Wind, ArrowRight, Loader2, Sparkles
} from 'lucide-react';
import { fetchSmartAdvisory, fetchPestRisk, diagnosePestPhoto, fetchTimingWindow } from '../services/api';

export default function SmartAdvisoryTab({ field }) {
  const [advisory, setAdvisory] = useState(null);
  const [pestThreats, setPestThreats] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [timing, setTiming] = useState(null);
  const [loading, setLoading] = useState(true);

  // Photo diagnostic selection state
  const [selectedDiseaseKey, setSelectedDiseaseKey] = useState('leaf_blast');
  const [diagnosing, setDiagnosing] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState(null);

  const loadAdvisoryData = useCallback(async () => {
    setLoading(true);
    try {
      const lat = field.centroid?.lat ?? 13.0;
      const lon = field.centroid?.lon ?? 75.0;
      const crop = field.crop_type ?? 'Wheat';
      const area = field.area_hectares ?? 2.0;

      const [advData, pestData, diagData, timingData] = await Promise.all([
        fetchSmartAdvisory({ lat, lon, crop, area }),
        fetchPestRisk(crop, 0.48, 26.0, 82.0, 8.0),
        diagnosePestPhoto('leaf_blast'),
        fetchTimingWindow(crop, lat, lon),
      ]);

      setAdvisory(advData);
      setPestThreats(pestData);
      setDiagnosis(diagData);
      setTiming(timingData);
    } catch (err) {
      console.error('Failed to load advisory data:', err);
    } finally {
      setLoading(false);
    }
  }, [field]);

  useEffect(() => {
    loadAdvisoryData();
  }, [loadAdvisoryData]);

  // Handle Photo Scan Diagnosis Switcher
  const handleSelectDisease = async (key) => {
    setSelectedDiseaseKey(key);
    setDiagnosing(true);
    try {
      const res = await diagnosePestPhoto(key);
      setDiagnosis(res);
    } catch (e) {
      console.error('Diagnosis failed', e);
    } finally {
      setDiagnosing(false);
    }
  };

  // Handle Real Custom Image Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setUploadedPreview(reader.result);
      setDiagnosing(true);
      try {
        const res = await diagnosePestPhoto(file);
        setDiagnosis(res);
      } catch (err) {
        console.error('Diagnosis error:', err);
      } finally {
        setDiagnosing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '12px', color: '#10b981' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        Calculating Rupee Savings & Pest Diagnostics...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* ── 1. RUPEE SAVINGS BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.08) 100%)',
        border: '1px solid rgba(16,185,129,0.4)',
        borderRadius: '16px',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 30px rgba(16,185,129,0.15)',
        animation: 'fadeInUp 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981, #047857)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16,185,129,0.5)',
            flexShrink: 0,
          }}>
            <IndianRupee size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#86efac', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
              Actionable Financial Advisory ({field.name})
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
              Projected Savings: <span style={{ color: '#34d399' }}>₹{advisory?.total_weekly_savings_inr?.toLocaleString('en-IN')}</span> / week
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
              Based on telemetry for {field.crop_type} ({field.area_hectares || 2.0} ha)
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '12px', padding: '10px 16px', textAlign: 'right',
        }}>
          <div style={{ fontSize: '0.65rem', color: '#86efac', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Seasonal ROI Boost
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
            ~₹{(advisory?.total_weekly_savings_inr * 8)?.toLocaleString('en-IN')} Est.
          </div>
        </div>
      </div>

      {/* ── 2. FERTILIZER & IRRIGATION ACTION CARDS ── */}
      <div>
        <div style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} /> Fertilizer & Irrigation Optimizations (Cost Reduction)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px' }}>
          {advisory?.actions?.map((act, idx) => (
            <div key={idx} style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: `1px solid ${act.savings_inr > 0 ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '14px',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>{act.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                      {act.category}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                      {act.title}
                    </div>
                  </div>
                </div>

                <span style={{
                  background: act.savings_inr > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                  border: `1px solid ${act.savings_inr > 0 ? '#10b981' : '#f59e0b'}`,
                  color: act.savings_inr > 0 ? '#34d399' : '#f59e0b',
                  fontSize: '0.75rem', fontWeight: 800,
                  padding: '4px 10px', borderRadius: '20px',
                  whiteSpace: 'nowrap',
                }}>
                  {act.badge}
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px' }}>
                <strong style={{ color: '#34d399' }}>Why: </strong> {act.reason}
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                  {act.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. PEST & DISEASE PHOTO DIAGNOSTIC ADVISOR ── */}
      <div style={{
        background: 'rgba(5, 20, 10, 0.75)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#f87171', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} /> Pest & Disease Photo Diagnostic Advisor
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
              Rule-based telemetry assessment + instant leaf image diagnosis
            </div>
          </div>

          <label style={{
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            color: '#ffffff',
            padding: '8px 16px', borderRadius: '10px',
            fontSize: '0.78rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
          }}>
            <Camera size={15} /> Upload Leaf Photo
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Environmental Threat Indicators */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {pestThreats?.environmental_threats?.map((thr, i) => (
            <div key={i} style={{
              flex: '1 1 200px',
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${thr.color}40`,
              borderRadius: '10px',
              padding: '10px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: thr.color }}>{thr.title}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ffffff', background: thr.color, padding: '1px 7px', borderRadius: '10px' }}>
                  {thr.risk_percent}% Risk
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>{thr.trigger}</div>
            </div>
          ))}
        </div>

        {/* Preset Sample Gallery Switcher */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>
            Select Sample Crop Disease Photo to Analyze:
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {[
              { key: 'leaf_blast', label: '🌾 Leaf Blast', desc: 'Fungal Lesions' },
              { key: 'rust', label: '🍂 Yellow Rust', desc: 'Stripe Pustules' },
              { key: 'stem_borer', label: '🐛 Stem Borer', desc: 'Dead Hearts' },
              { key: 'healthy', label: '🌱 Healthy Leaf', desc: 'Normal Vigor' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => handleSelectDisease(item.key)}
                style={{
                  background: selectedDiseaseKey === item.key ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.4)',
                  border: `1px solid ${selectedDiseaseKey === item.key ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                  color: selectedDiseaseKey === item.key ? '#ffffff' : '#94a3b8',
                  padding: '8px 14px', borderRadius: '10px',
                  fontSize: '0.75rem', fontWeight: 700,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div>{item.label}</div>
                <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Diagnosis Results Card */}
        {diagnosis && (
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${diagnosis.severity_color}50`,
            borderRadius: '14px',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            gap: '16px',
          }}>
            {/* Image Preview */}
            <div style={{ borderRadius: '10px', overflow: 'hidden', height: '140px', background: '#000', position: 'relative' }}>
              <img
                src={uploadedPreview || diagnosis.sample_image}
                alt="Leaf scan"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', bottom: '6px', left: '6px', right: '6px',
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
                padding: '4px 8px', borderRadius: '6px',
                fontSize: '0.65rem', color: diagnosis.severity_color, fontWeight: 800, textAlign: 'center',
              }}>
                {diagnosis.confidence_percent}% Confidence
              </div>
            </div>

            {/* Advisory breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  {diagnosis.diagnosis}
                </div>
                <span style={{
                  background: `${diagnosis.severity_color}20`,
                  color: diagnosis.severity_color,
                  border: `1px solid ${diagnosis.severity_color}`,
                  fontSize: '0.68rem', fontWeight: 800,
                  padding: '2px 8px', borderRadius: '12px',
                }}>
                  {diagnosis.severity}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                <strong>Symptoms: </strong> {diagnosis.symptoms}
                {diagnosis.affected_leaf_area_percent && (
                  <span style={{ marginLeft: '10px', color: '#f59e0b', fontWeight: 700 }}>
                    · {diagnosis.affected_leaf_area_percent}% Affected Leaf Area
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>
                    🌿 Organic Remedy
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#e2e8f0', marginTop: '2px' }}>
                    {diagnosis.organic_remedy}
                  </div>
                </div>

                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase' }}>
                    🧪 Chemical Treatment
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#e2e8f0', marginTop: '2px' }}>
                    {diagnosis.chemical_remedy}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. SOWING / HARVEST WEATHER TIMING & LABOR PLANNER ── */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} /> Sowing & Harvest Timing Windows (Weather Labor Schedule)
        </div>

        {/* Direct Advice Callouts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', padding: '12px 14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              🌱 Optimal Sowing Window
            </div>
            <div style={{ fontSize: '0.75rem', color: '#e2e8f0', marginTop: '4px', lineHeight: 1.4 }}>
              {timing?.sow_recommendation}
            </div>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', padding: '12px 14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              🚜 Harvest & Rain Protection Alert
            </div>
            <div style={{ fontSize: '0.75rem', color: '#e2e8f0', marginTop: '4px', lineHeight: 1.4 }}>
              {timing?.harvest_recommendation}
            </div>
          </div>
        </div>

        {/* 7-Day Labor Matrix Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: '#e2e8f0' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Day</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Temp / Rain</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Chemical Spray</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Sowing Labor</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Harvesting</th>
              </tr>
            </thead>
            <tbody>
              {timing?.daily_schedule?.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px', fontWeight: 800 }}>
                    {row.day} <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 400 }}>({row.date})</span>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {row.temp_c}°C · {row.rain_mm > 0 ? <span style={{ color: '#60a5fa' }}>{row.rain_mm}mm 🌧️</span> : '0mm ☀️'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <span style={{ color: row.spray_color, fontWeight: 700 }}>{row.spray_status}</span>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <span style={{ color: row.sow_color, fontWeight: 700 }}>{row.sow_status}</span>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <span style={{ color: row.harvest_color, fontWeight: 700 }}>{row.harvest_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
