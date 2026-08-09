import React from 'react';
import { Wheat, Sparkles } from 'lucide-react';

export default function CropSuggestions({ ndviData, weatherData, mlData }) {
  // Don't show anything if no data OR if water body detected
  if (!ndviData || !weatherData || (ndviData.ndvi !== null && ndviData.ndvi < 0)) {
    return (
      <div className="modern-card">
        <div className="card-title" style={{ color: '#fbbf24' }}>
          <Wheat size={16} /> AI Crop Suitability
        </div>
        <div style={{
          textAlign: 'center', color: '#64748b', fontSize: '0.78rem',
          padding: '14px 10px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '6px',
        }}>
          <div style={{ fontSize: '1.6rem', opacity: 0.7 }}>🌾</div>
          Scan a field location to get AI-powered crop & suitability recommendations.
        </div>
      </div>
    );
  }

  const temp = weatherData.temperature;
  const moist = weatherData.soil_moisture;
  const ndvi = ndviData.ndvi;

  let crops = [];

  if (mlData && mlData.recommended_crops && mlData.recommended_crops.length > 0) {
    crops = mlData.recommended_crops.map(c => ({
      name: c.crop,
      icon: c.crop === 'Rice' ? '🍚' : c.crop === 'Wheat' ? '🌾' : c.crop === 'Cotton' ? '☁️' : c.crop === 'Corn' ? '🌽' : '🌱',
      score: c.suitability_score
    }));
  } else {
    if (temp === null || moist === null) {
      crops.push({ name: 'Insufficient Data', icon: '⚠️' });
    } else {
      if (temp > 25 && moist > 0.25) crops.push({ name: 'Rice', icon: '🍚' }, { name: 'Sugarcane', icon: '🎋' });
      else if (temp > 22 && moist <= 0.2) crops.push({ name: 'Cotton', icon: '☁️' }, { name: 'Sorghum', icon: '🌾' }, { name: 'Millet', icon: '🌾' });
      else if (temp >= 15 && temp <= 25 && moist > 0.15) crops.push({ name: 'Wheat', icon: '🌾' }, { name: 'Corn', icon: '🌽' }, { name: 'Soybeans', icon: '🫘' });
      else if (temp < 15) crops.push({ name: 'Barley', icon: '🌾' }, { name: 'Oats', icon: '🥣' }, { name: 'Peas', icon: '🫛' });
      else crops.push({ name: 'Drought-Resistant Plants', icon: '🌵' });

      if (ndvi !== null && ndvi < 0.1) {
        crops.push({ name: 'Soil Preparation Needed', icon: '🚜' });
      }
    }
  }

  return (
    <div className="modern-card">
      <div className="card-title" style={{ color: '#fbbf24' }}>
        <Wheat size={16} /> AI Crop Suitability Recommendations
      </div>

      {/* Recommended Crops */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {crops.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(251, 191, 36, 0.12)',
              color: '#fde68a',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            <span>{item.icon}</span> {item.name}
            {item.score && (
              <span style={{ fontSize: '0.7rem', color: '#fbbf24', marginLeft: '2px' }}>
                ({Math.round(item.score * 100)}%)
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Current Conditions Summary */}
      <div style={{
        padding: '10px 12px',
        borderRadius: '8px',
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>
          Current Conditions:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.74rem' }}>
          <div style={{ color: '#94a3b8' }}>
            🌡️ Temperature: <span style={{ color: '#fff', fontWeight: 600 }}>{temp !== null ? `${temp}°C` : 'N/A'}</span>
          </div>
          <div style={{ color: '#94a3b8' }}>
            💧 Soil Moisture: <span style={{ color: '#fff', fontWeight: 600 }}>{moist !== null ? `${(moist * 100).toFixed(0)}%` : 'N/A'}</span>
          </div>
          <div style={{ color: '#94a3b8' }}>
            🌧️ Rainfall: <span style={{ color: '#fff', fontWeight: 600 }}>{weatherData.precipitation !== null ? `${weatherData.precipitation} mm` : 'N/A'}</span>
          </div>
          <div style={{ color: '#94a3b8' }}>
            💨 Wind: <span style={{ color: '#fff', fontWeight: 600 }}>{weatherData.windspeed !== null ? `${weatherData.windspeed} km/h` : 'N/A'}</span>
          </div>
        </div>
      </div>

      {mlData && mlData.predicted_condition && (
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontSize: '0.8rem',
          color: '#6ee7b7',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '8px'
        }}>
          <Sparkles size={14} color="#10b981" />
          <span>ML Predicted Health: <strong>{mlData.predicted_condition}</strong> ({mlData.condition_for_crop})</span>
        </div>
      )}

      <div style={{
        fontSize: '0.72rem',
        color: '#64748b',
        marginTop: '10px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '6px'
      }}>
        Powered by Random Forest ML engine & Sentinel-2 telemetry.
      </div>
    </div>
  );
}
