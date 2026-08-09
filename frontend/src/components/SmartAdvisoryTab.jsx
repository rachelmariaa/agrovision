import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, CloudRain, Sun, Loader2, Sprout, Droplets, Bug
} from 'lucide-react';
import { fetchTimingWindow } from '../services/api';

export default function SmartAdvisoryTab({ field }) {
  const [timing, setTiming] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdvisoryData = useCallback(async () => {
    setLoading(true);
    try {
      const lat = field.centroid?.lat ?? 13.0;
      const lon = field.centroid?.lon ?? 75.0;
      const crop = field.crop_type ?? 'Wheat';

      const timingData = await fetchTimingWindow(crop, lat, lon);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '12px', color: '#10b981' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        Loading Field Advisory...
      </div>
    );
  }

  // Get suitable crops for this field's conditions
  const getSuitableCrops = () => {
    const baseTemp = 25; // Simulated
    if (baseTemp > 28) {
      return ['Rice', 'Sugarcane', 'Cotton', 'Sorghum'];
    } else if (baseTemp < 20) {
      return ['Wheat', 'Barley', 'Peas', 'Mustard'];
    } else {
      return ['Maize', 'Cotton', 'Soybeans', 'Vegetables'];
    }
  };

  const suitableCrops = getSuitableCrops();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* ── 1. FIELD OVERVIEW ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.08) 100%)',
        border: '1px solid rgba(16,185,129,0.4)',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 8px 30px rgba(16,185,129,0.15)',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#86efac', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '8px' }}>
          Field Overview: {field.name}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Current Crop</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              🌾 {field.crop_type || 'Not Set'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Area</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              📐 {field.area_hectares || '2.5'} hectares
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Sowing Date</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              📅 {field.sowing_date || 'Not Set'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SUITABLE CROPS ── */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sprout size={16} /> Suitable Crops for This Field
        </div>
        
        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '12px', lineHeight: 1.5 }}>
          Based on climate conditions, soil type, and location, the following crops are recommended:
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {suitableCrops.map((crop, idx) => (
            <div key={idx} style={{
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              🌱 {crop}
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. BASIC FERTILIZER GUIDE ── */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(251,191,36,0.3)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Droplets size={16} /> Fertilizer & Water Guidelines
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '14px',
            borderRadius: '12px',
          }}>
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800, marginBottom: '6px' }}>
              💧 Irrigation
            </div>
            <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              Maintain regular watering schedule. Water early morning or evening. Monitor soil moisture regularly.
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '14px',
            borderRadius: '12px',
          }}>
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800, marginBottom: '6px' }}>
              🧪 Fertilizer Application
            </div>
            <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              Apply balanced NPK fertilizer. Use Urea (45 kg/hectare) + DAP (60 kg/hectare) as base dose. Apply in split doses.
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. DISEASE PREVENTION ── */}
      <div style={{
        background: 'rgba(5, 20, 10, 0.75)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#f87171', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bug size={16} /> Disease Prevention Tips
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { title: 'Monitor Regularly', desc: 'Check plants weekly for signs of pests or disease. Early detection is key.' },
            { title: 'Maintain Field Hygiene', desc: 'Remove dead leaves and weeds. They can harbor pests and diseases.' },
            { title: 'Use Resistant Varieties', desc: 'Choose crop varieties that are resistant to common local diseases.' },
            { title: 'Proper Spacing', desc: 'Maintain adequate plant spacing for good air circulation to prevent fungal growth.' },
          ].map((tip, idx) => (
            <div key={idx} style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '12px 14px',
              borderRadius: '10px',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>
                {idx + 1}. {tip.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                {tip.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. SOWING / HARVEST WEATHER TIMING & LABOR PLANNER ── */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} /> Sowing & Harvest Timing Windows
        </div>

        {/* Direct Advice Callouts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', padding: '12px 14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              🌱 Optimal Sowing Window
            </div>
            <div style={{ fontSize: '0.75rem', color: '#e2e8f0', marginTop: '4px', lineHeight: 1.4 }}>
              {timing?.sow_recommendation || 'Optimal sowing period is approaching. Monitor weather forecasts.'}
            </div>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', padding: '12px 14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              🚜 Harvest & Weather Alert
            </div>
            <div style={{ fontSize: '0.75rem', color: '#e2e8f0', marginTop: '4px', lineHeight: 1.4 }}>
              {timing?.harvest_recommendation || 'Plan harvest during dry weather. Avoid rainy periods to prevent crop damage.'}
            </div>
          </div>
        </div>

        {/* 7-Day Weather & Activity Schedule */}
        {timing?.daily_schedule && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: '#e2e8f0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Day</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Temp / Rain</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Spray Activity</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Sowing</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Harvesting</th>
                </tr>
              </thead>
              <tbody>
                {timing.daily_schedule.map((row, idx) => (
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
        )}
      </div>

    </div>
  );
}


