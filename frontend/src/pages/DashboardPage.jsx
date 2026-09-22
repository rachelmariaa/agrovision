import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Terminal from '../components/Terminal';
import MapComponent from '../components/MapComponent';
import NdviGauge from '../components/NdviGauge';
import WeatherCard from '../components/WeatherCard';
import CropSuggestions from '../components/CropSuggestions';
import SessionStats from '../components/SessionStats';
import ScanHistory, { NdviLegend } from '../components/ScanHistory';
import FarmerGuide from '../components/FarmerGuide';
import FieldManager from '../components/FieldManager';
import FieldDetailModal from '../components/FieldDetailModal';
import WaterDetectionModal from '../components/WaterDetectionModal';
import CropDoctorPage from './CropDoctorPage';
import GuidePage from './GuidePage';
import {
  fetchNdvi, fetchWeather, fetchSoil, fetchMlPredictions,
  fetchStats, fetchHistory, connectLogWebSocket,
  fetchFields, createField,
} from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Crosshair, ShieldCheck } from 'lucide-react';

// ── New Field Save Modal ─────────────────────────────────────────────────────
function NewFieldModal({ geojson, onSave, onCancel }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [crop, setCrop] = useState('Wheat');
  const [sowDate, setSowDate] = useState('');
  const [area, setArea] = useState('');
  const [saving, setSaving] = useState(false);

  const crops = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Wheat / Paddy', 'Paddy'];

  const handleSave = async () => {
    if (!name.trim()) { alert('Please enter a field name'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), crop_type: crop, sowing_date: sowDate || undefined, area_hectares: area ? parseFloat(area) : undefined, geojson });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9500,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(5,25,12,0.98), rgba(2,12,6,0.99))',
        border: '1px solid rgba(16,185,129,0.45)',
        borderRadius: '24px', padding: '32px', width: '440px',
        boxShadow: '0 25px 70px rgba(0,0,0,0.9), 0 0 30px rgba(16,185,129,0.2)',
        animation: 'resultReveal 0.3s cubic-bezier(0.22,1,0.36,1) both',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
        }} />

        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f0fdf4', marginBottom: '4px', letterSpacing: '0.5px' }}>
          {t('saveFieldTitle')}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', marginBottom: '22px' }}>
          {t('dashboardSubtitle')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={formGroupStyle}>
            <label style={formLabelStyle}>{t('fieldNameLabel')}</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. North Plot A"
              style={formInputStyle} autoFocus />
          </div>
          <div style={formGroupStyle}>
            <label style={formLabelStyle}>{t('cropTypeLabel')}</label>
            <select value={crop} onChange={e => setCrop(e.target.value)} style={formInputStyle}>
              {crops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{ ...formGroupStyle, flex: 1 }}>
              <label style={formLabelStyle}>{t('sowingDateLabel')}</label>
              <input type="date" value={sowDate} onChange={e => setSowDate(e.target.value)} style={formInputStyle} />
            </div>
            <div style={{ ...formGroupStyle, flex: 1 }}>
              <label style={formLabelStyle}>{t('areaLabel')}</label>
              <input type="number" step="0.1" value={area} onChange={e => setArea(e.target.value)}
                placeholder="e.g. 2.5" style={formInputStyle} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none', borderRadius: '12px', padding: '12px',
            color: '#fff', fontFamily: "'Outfit', sans-serif",
            fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 0 20px rgba(16,185,129,0.4)',
          }}>
            {saving ? 'Saving Field...' : t('saveBtn')}
          </button>
          <button onClick={onCancel} style={{
            flex: 1, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px',
            color: 'rgba(255,255,255,0.6)', fontFamily: "'Outfit', sans-serif",
            fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
          }}>
            {t('cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

const formGroupStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };
const formLabelStyle = { fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 };
const formInputStyle = {
  background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(16,185,129,0.3)',
  borderRadius: '10px', padding: '11px 14px', color: '#f0fdf4',
  fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', outline: 'none',
  transition: 'border-color 0.2s',
};

// ── Dashboard floating particles ─────────────────────────────────────────────
function WheatParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i, icon: ['🌾', '🌿', '🍃', '🌱'][i % 4],
      left: `${Math.random() * 100}%`,
      duration: `${12 + Math.random() * 14}s`,
      delay: `${Math.random() * 10}s`,
      size: `${0.9 + Math.random() * 0.8}rem`,
      opacity: 0.1 + Math.random() * 0.1,
    }))
  );
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      {particles.map(p => (
        <span key={p.id} style={{
          position: 'absolute', left: p.left, top: '-5vh',
          fontSize: p.size, opacity: p.opacity,
          animation: `grainFloat ${p.duration} ${p.delay} linear infinite`,
          filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.4))',
          userSelect: 'none',
        }}>{p.icon}</span>
      ))}
    </div>
  );
}

// ── HUD Header Strip ────────────────────────────────────────────────────────
function DashboardHeader({ activeScan, loading }) {
  const { t } = useLanguage();
  return (
    <div style={{
      padding: '7px 22px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid rgba(16,185,129,0.15)',
      background: 'rgba(1,10,5,0.7)', backdropFilter: 'blur(12px)',
      flexShrink: 0, zIndex: 100, position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '20px', padding: '3px 10px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#10b981',
            boxShadow: '0 0 8px #10b981', animation: 'pulse 1.5s infinite',
          }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#34d399' }}>
            {t('dashboardHeader')}
          </span>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>
          {t('dashboardSubtitle')}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {loading && (
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b', display: 'inline-block', animation: 'pulse 0.8s infinite' }} />
            {t('scanning')}
          </span>
        )}
        {activeScan && !loading && (
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'JetBrains Mono', monospace" }}>
            <Crosshair size={13} color="#10b981" />
            NDVI {activeScan.ndvi?.toFixed(4)} ({activeScan.lat?.toFixed(3)}°N, {activeScan.lon?.toFixed(3)}°E)
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>
          <ShieldCheck size={12} color="#10b981" />
          {t('sysNominal')}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage({ user, onLogout }) {
  const { t } = useLanguage();
  const [activeView, setActiveView]   = useState('map'); // 'map' | 'fields' | 'crop_doctor'
  const [mapLayer, setMapLayer]       = useState('street');
  const [activeScan, setActiveScan]   = useState(null);
  const [weather, setWeather]         = useState(null);
  const [soil, setSoil]               = useState(null);
  const [mlData, setMlData]           = useState(null);
  const [stats, setStats]             = useState(null);
  const [history, setHistory]         = useState([]);
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(false);

  // Field management state
  const [fields, setFields]               = useState([]);
  const [fieldManagerOpen, setFieldManagerOpen] = useState(false);
  const [drawingMode, setDrawingMode]     = useState(false);
  const [pendingGeoJSON, setPendingGeoJSON] = useState(null);
  const [selectedField, setSelectedField] = useState(null);

  // Water detection modal state
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [waterModalType, setWaterModalType] = useState('water'); // 'water' or 'bare'

  // Synchronize Navbar activeView with FieldManager drawer
  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'fields') {
      setFieldManagerOpen(true);
    } else {
      setFieldManagerOpen(false);
    }
  };

  // Load fields from backend
  const refreshFields = useCallback(async () => {
    try { setFields(await fetchFields()); } catch (e) { console.error('Failed to load fields', e); }
  }, []);

  useEffect(() => { refreshFields(); }, [refreshFields]);

  // Polygon drawn → open save modal
  const handleFieldDrawn = useCallback((geojson) => {
    setDrawingMode(false);
    setPendingGeoJSON(geojson);
  }, []);

  // Save new field
  const handleSaveField = useCallback(async (data) => {
    try {
      await createField(data);
      await refreshFields();
      setPendingGeoJSON(null);
    } catch (e) {
      alert('Failed to save field: ' + e.message);
    }
  }, [refreshFields]);

  // Field deleted from modal
  const handleFieldDeleted = useCallback(async (fieldId) => {
    await refreshFields();
    setSelectedField(null);
  }, [refreshFields]);

  // Field updated from modal
  const handleFieldUpdated = useCallback(async (updatedField) => {
    setSelectedField(updatedField);
    await refreshFields();
  }, [refreshFields]);

  // Stats & history polling
  const refreshStatsAndHistory = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([fetchStats(), fetchHistory()]);
      setStats(s);
      if (h?.history) setHistory(h.history);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    refreshStatsAndHistory();
    const iv = setInterval(refreshStatsAndHistory, 15000);
    return () => clearInterval(iv);
  }, [refreshStatsAndHistory]);

  // WebSocket log broadcaster
  useEffect(() => {
    const addLog = (msg) => setLogs((p) => [...p.slice(-150), msg]);
    addLog('[SYS] Establishing secure uplink to AgroVision Sentinel Core...');
    const ws = connectLogWebSocket(
      (msg) => addLog(msg),
      () => addLog('[ERR] Uplink degraded.'),
      () => addLog('[SYS] Connection closed.')
    );
    return () => { if (ws) ws.close(); };
  }, []);

  // Map click → point NDVI scan
  const handleMapClick = useCallback(async (lat, lon) => {
    if (drawingMode) return;
    setLoading(true);
    
    // Clear previous data first
    setActiveScan(null);
    setWeather(null);
    setSoil(null);
    setMlData(null);
    
    try {
      const ndviData = await fetchNdvi(lat, lon);
      
      // Check if this is water body (NDVI < 0) - BLOCK IMMEDIATELY
      if (ndviData.ndvi !== null && ndviData.ndvi < 0) {
        setLoading(false);
        setWaterModalType('water');
        setWaterModalOpen(true);
        return; // Stop here - don't set any state or proceed
      }
      
      // Check if this is bare/non-vegetated area (NDVI < 0.1)
      if (ndviData.ndvi !== null && ndviData.ndvi < 0.1) {
        // Show warning modal
        setLoading(false);
        setWaterModalType('bare');
        setWaterModalOpen(true);
        // Store the scan data temporarily so we can use it if user confirms
        window.tempScanData = { ndviData, lat, lon };
        return;
      }
      
      // Proceed with normal scan for valid land areas
      setActiveScan(ndviData);
      const [wxData, soilData] = await Promise.all([
        fetchWeather(lat, lon).catch(() => null),
        fetchSoil(lat, lon).catch(() => null),
      ]);
      setWeather(wxData);
      setSoil(soilData);
      if (wxData && soilData && ndviData.ndvi !== null) {
        try {
          const ml = await fetchMlPredictions(ndviData.ndvi, wxData.soil_moisture, wxData.precipitation, wxData.temperature);
          setMlData(ml);
        } catch (e) { console.warn('ML bypassed:', e); }
      }
      refreshStatsAndHistory();
    } catch (err) { 
      console.error('Scan Error:', err);
      alert('❌ Failed to scan location. Please try again.');
    }
    finally { setLoading(false); }
  }, [drawingMode, refreshStatsAndHistory]);

  // Handle modal close
  const handleWaterModalClose = useCallback(() => {
    setWaterModalOpen(false);
    // Clear temporary scan data
    window.tempScanData = null;
  }, []);

  // Handle bare area confirmation
  const handleBareAreaConfirm = useCallback(async () => {
    setWaterModalOpen(false);
    const tempData = window.tempScanData;
    if (!tempData) return;
    
    setLoading(true);
    try {
      const { ndviData, lat, lon } = tempData;
      setActiveScan(ndviData);
      const [wxData, soilData] = await Promise.all([
        fetchWeather(lat, lon).catch(() => null),
        fetchSoil(lat, lon).catch(() => null),
      ]);
      setWeather(wxData);
      setSoil(soilData);
      if (wxData && soilData && ndviData.ndvi !== null) {
        try {
          const ml = await fetchMlPredictions(ndviData.ndvi, wxData.soil_moisture, wxData.precipitation, wxData.temperature);
          setMlData(ml);
        } catch (e) { console.warn('ML bypassed:', e); }
      }
      refreshStatsAndHistory();
    } catch (err) {
      console.error('Scan Error:', err);
    } finally {
      setLoading(false);
      window.tempScanData = null;
    }
  }, [refreshStatsAndHistory]);

  // Location search → center map and scan
  const handleLocationSearch = useCallback((lat, lon, displayName) => {
    // Trigger a scan at the searched location
    handleMapClick(lat, lon);
    // Note: MapComponent will need a prop to center/zoom to these coordinates
  }, [handleMapClick]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <WheatParticles />

      <Navbar
        mapLayer={mapLayer}
        setMapLayer={setMapLayer}
        user={user}
        onLogout={onLogout}
        activeScan={activeScan}
        activeView={activeView}
        setActiveView={handleViewChange}
        onLocationSearch={handleLocationSearch}
      />

      {activeView === 'crop_doctor' ? (
        <CropDoctorPage />
      ) : activeView === 'quick_guide' ? (
        <GuidePage />
      ) : (
        <>
          <DashboardHeader activeScan={activeScan} loading={loading} />

          {/* Main workspace */}
          <div style={{ flex: 1, display: 'flex', gap: '16px', padding: '0 18px 12px 18px', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

            {/* LEFT: Terminal */}
            <Terminal logs={logs} />

            {/* CENTER: Map (with FieldManager overlay) */}
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
              <FieldManager
                fields={fields}
                open={fieldManagerOpen}
                onToggle={() => setFieldManagerOpen(o => !o)}
                onDrawNewField={() => { setDrawingMode(true); setFieldManagerOpen(false); }}
                onFieldSelect={(f) => setSelectedField(f)}
                onFieldDeleted={handleFieldDeleted}
              />

              <MapComponent
                mapLayer={mapLayer}
                onMapClick={handleMapClick}
                activeScan={activeScan}
                loading={loading}
                fields={fields}
                onFieldDrawn={handleFieldDrawn}
                onFieldClick={(f) => setSelectedField(f)}
                drawingMode={drawingMode}
              />
            </div>

            {/* RIGHT: Telemetry sidebar */}
            <div className="glass-panel" style={{
              width: '420px', minWidth: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '22px',
              border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            }}>
              <div className="panel-header" style={{ borderRadius: '22px 22px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display:'inline-block', width:'8px', height:'8px', borderRadius:'50%',
                    background: activeScan ? '#10b981' : '#64748b',
                    boxShadow: activeScan ? '0 0 10px #10b981' : 'none',
                    animation: activeScan ? 'pulse 1.5s infinite' : 'none',
                  }} />
                  <span>{t('telemetryTitle')}</span>
                </div>
                {activeScan && (
                  <span style={{ fontSize:'0.65rem', color:'#34d399', fontFamily:"'JetBrains Mono', monospace", fontWeight:700 }}>
                    {activeScan.lat?.toFixed(3)}°, {activeScan.lon?.toFixed(3)}°
                  </span>
                )}
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'14px', minHeight: 0 }}>
                <NdviGauge data={activeScan} user={user} />
                <WeatherCard weather={weather} soil={soil} />
                <CropSuggestions ndviData={activeScan} weatherData={weather} mlData={mlData} />
                <SessionStats stats={stats} />
                <NdviLegend />
                <ScanHistory history={history} onSelectRecord={(rec) => handleMapClick(rec.lat, rec.lon)} />
              </div>
            </div>
          </div>
        </>
      )}

      <Footer activeScan={activeScan} />

      {/* ── Water/Bare Area Detection Modal ── */}
      <WaterDetectionModal
        isOpen={waterModalOpen}
        onClose={handleWaterModalClose}
        onConfirm={handleBareAreaConfirm}
        type={waterModalType}
      />

      {/* ── New Field save modal ── */}
      {pendingGeoJSON && (
        <NewFieldModal
          geojson={pendingGeoJSON}
          onSave={handleSaveField}
          onCancel={() => { setPendingGeoJSON(null); setDrawingMode(false); }}
        />
      )}

      {/* ── Field Detail Modal ── */}
      {selectedField && (
        <FieldDetailModal
          field={selectedField}
          onClose={() => setSelectedField(null)}
          onFieldUpdated={handleFieldUpdated}
          onFieldDeleted={handleFieldDeleted}
        />
      )}
    </div>
  );
}
