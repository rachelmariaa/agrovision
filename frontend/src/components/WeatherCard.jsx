import React from 'react';
import { CloudSun, Thermometer, Wind, CloudRain, Droplets, Mountain } from 'lucide-react';

export default function WeatherCard({ weather, soil }) {
  if (!weather) {
    return (
      <div className="modern-card">
        <div className="card-title" style={{ color: '#38bdf8' }}>
          <CloudSun size={16} /> Atmospheric & Soil Telemetry
        </div>
        <div style={{
          textAlign: 'center', color: '#64748b', fontSize: '0.78rem',
          padding: '14px 10px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '6px',
        }}>
          <div style={{ fontSize: '1.6rem', opacity: 0.7 }}>🌤️</div>
          Click any map coordinate to scan live temperature, rainfall, wind & soil moisture.
        </div>
      </div>
    );
  }

  return (
    <div className="modern-card">
      <div className="card-title" style={{ color: '#38bdf8' }}>
        <CloudSun size={16} /> Atmospheric & Soil Telemetry
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Thermometer size={14} color="#f87171" /> Temperature
          </span>
          <span style={{ color: 'white', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            {weather.temperature !== null ? `${weather.temperature}°C` : 'N/A'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wind size={14} color="#38bdf8" /> Wind Speed
          </span>
          <span style={{ color: 'white', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            {weather.windspeed !== null ? `${weather.windspeed} km/h` : 'N/A'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CloudRain size={14} color="#60a5fa" /> Precipitation
          </span>
          <span style={{ color: 'white', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            {weather.precipitation !== null ? `${weather.precipitation} mm` : 'N/A'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Droplets size={14} color="#34d399" /> Soil Moisture
          </span>
          <span style={{ color: 'white', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            {weather.soil_moisture !== null ? `${weather.soil_moisture} m³/m³` : 'N/A'}
          </span>
        </div>

        {soil && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mountain size={14} color="#fbbf24" /> NDWI Water Index
              </span>
              <span style={{ color: 'white', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                {soil.ndwi !== null ? soil.ndwi.toFixed(4) : 'N/A'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                💧 Moisture Status
              </span>
              <span style={{
                color: soil.moisture_level === 'High' ? '#4ade80' : soil.moisture_level === 'Moderate' ? '#fbbf24' : '#f87171',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                {soil.moisture_level || 'N/A'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
