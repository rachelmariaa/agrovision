import React, { useState, useEffect } from 'react';
import { Map, Globe, User, LogOut, FileText, Download, Loader2, Wifi, WifiOff, Leaf, Languages, ChevronDown, Search } from 'lucide-react';
import { downloadCropReport } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ mapLayer, setMapLayer, user, onLogout, activeScan, activeView = 'map', setActiveView, onLocationSearch }) {
  const { langCode, setLangCode, t, currentLangObj, LANGUAGES } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [online, setOnline] = useState(true);
  const [time, setTime] = useState(new Date());
  const [logoError, setLogoError] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Backend heartbeat
  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch('/api/ndvi/stats', { signal: AbortSignal.timeout(2500) });
        setOnline(r.ok);
      } catch { setOnline(false); }
    };
    check();
    const i = setInterval(check, 10000);
    return () => clearInterval(i);
  }, []);

  const handleDownloadReport = () => {
    // Block download for water bodies
    if (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0) {
      alert('🌊 Cannot generate report for water bodies.\n\nPlease select a land area with vegetation for agricultural analysis.');
      return;
    }
    
    // Warn for bare areas
    if (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0.1) {
      const confirmed = window.confirm(
        '⚠️ This area has very low vegetation coverage.\n\n' +
        'The report may not provide accurate recommendations. Continue anyway?'
      );
      if (!confirmed) return;
    }
    
    const lat = activeScan ? activeScan.lat : 13.0;
    const lon = activeScan ? activeScan.lon : 75.0;
    const fieldName = activeScan ? `Field (${lat.toFixed(2)}, ${lon.toFixed(2)})` : 'Primary Field';
    setDownloading(true);
    downloadCropReport(lat, lon, 'Wheat / Paddy', user || 'Farmer', fieldName, langCode);
    setTimeout(() => setDownloading(false), 1200);
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !onLocationSearch) return;
    
    // Use a free geocoding service (Nominatim from OpenStreetMap)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        onLocationSearch(parseFloat(lat), parseFloat(lon), display_name);
        setSearchQuery('');
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search location. Please try again.');
    }
  };

  const fmt = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <nav style={{
      background: 'linear-gradient(90deg, rgba(2,12,6,0.98) 0%, rgba(5,25,12,0.96) 50%, rgba(2,12,6,0.98) 100%)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(16,185,129,0.25)',
      zIndex: 1000,
      flexShrink: 0,
      position: 'relative',
    }}>

      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, #10b981 30%, #34d399 50%, #10b981 70%, transparent 100%)',
        opacity: 0.7,
      }} />

      {/* ── ROW 1: Brand + Right Controls ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '6px 16px',
        gap: '12px',
        borderBottom: '1px solid rgba(16,185,129,0.1)',
        minHeight: '52px',
      }}>

        {/* Brand Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
          cursor: 'pointer', userSelect: 'none',
        }} onClick={() => setActiveView && setActiveView('map')}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden',
            border: '1.5px solid rgba(16,185,129,0.5)',
            boxShadow: '0 0 16px rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #052e16, #064e3b)',
            flexShrink: 0,
            animation: 'glowPulse 3s ease-in-out infinite',
          }}>
            {!logoError ? (
              <img src="/logo.png" alt="AgroVision"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setLogoError(true)} />
            ) : (
              <Leaf size={20} color="#10b981" />
            )}
          </div>
          <div>
            <div style={{
              fontSize: '1rem', fontWeight: 900, lineHeight: 1,
              background: 'linear-gradient(90deg, #34d399 0%, #10b981 60%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>{t('appTitle')}</div>
            <div style={{
              fontSize: '0.55rem', color: 'rgba(16,185,129,0.6)', letterSpacing: '2px',
              fontWeight: 600, textTransform: 'uppercase', lineHeight: 1, marginTop: '2px',
            }}>{t('subtitle')}</div>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* ── MULTI-LANGUAGE SELECTOR DROPDOWN ── */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setLangMenuOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.35)',
              borderRadius: '10px', padding: '5px 12px',
              color: '#34d399', fontSize: '0.76rem', fontWeight: 800,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.2s ease',
              boxShadow: '0 0 10px rgba(16,185,129,0.15)',
            }}
          >
            <Languages size={14} color="#10b981" />
            <span>{currentLangObj.flag} {currentLangObj.native}</span>
            <ChevronDown size={12} style={{ transform: langMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Dropdown Menu */}
          {langMenuOpen && (
            <div
              style={{
                position: 'absolute', top: '115%', right: 0,
                background: 'rgba(2, 16, 8, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(16,185,129,0.4)',
                borderRadius: '14px', padding: '6px',
                display: 'flex', flexDirection: 'column', gap: '3px',
                minWidth: '160px', zIndex: 9999,
                boxShadow: '0 15px 40px rgba(0,0,0,0.85)',
                animation: 'resultReveal 0.2s ease both',
              }}
            >
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 8px' }}>
                🌐 Select Language
              </div>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLangCode(lang.code);
                    setLangMenuOpen(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: '8px',
                    border: 'none',
                    background: langCode === lang.code ? 'rgba(16,185,129,0.2)' : 'transparent',
                    color: langCode === lang.code ? '#34d399' : '#e2e8f0',
                    fontSize: '0.78rem', fontWeight: langCode === lang.code ? 800 : 600,
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: "'Outfit', sans-serif",
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (langCode !== lang.code) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { if (langCode !== lang.code) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{lang.flag} {lang.native}</span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>({lang.label})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Live Clock ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          gap: '1px', flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>
            {fmt}
          </span>
          <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)' }}>
            {dateStr}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'rgba(16,185,129,0.2)', flexShrink: 0 }} />

        {/* ── Backend Status (LIVE / OFFLINE) ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '0.7rem', fontWeight: 800,
          color: online ? '#10b981' : '#f87171',
          flexShrink: 0,
          padding: '4px 10px',
          background: online ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${online ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: '20px',
          letterSpacing: '0.5px',
        }}>
          {online
            ? <Wifi size={13} style={{ filter: 'drop-shadow(0 0 5px #10b981)' }} />
            : <WifiOff size={13} />
          }
          {online ? t('live') : t('offline')}
        </div>

        {/* ── User + Logout ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'rgba(0,0,0,0.45)', padding: '3px 3px 3px 10px',
          borderRadius: '12px',
          border: '1px solid rgba(16,185,129,0.2)', flexShrink: 0,
        }}>
          <User size={13} color="#10b981" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', paddingRight: '6px' }}>
            {user || t('guest')}
          </span>
          <button
            onClick={onLogout}
            title={t('logout')}
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(153,27,27,0.4))',
              color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.4)',
              padding: '5px 12px', borderRadius: '9px',
              fontFamily: 'inherit', fontSize: '0.7rem', fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '5px',
              boxShadow: '0 0 10px rgba(239,68,68,0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239,68,68,0.5), rgba(153,27,27,0.65))';
              e.currentTarget.style.boxShadow = '0 0 18px rgba(239,68,68,0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(153,27,27,0.4))';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(239,68,68,0.25)';
            }}
          >
            <LogOut size={13} /> {t('logout')}
          </button>
        </div>
      </div>

      {/* ── ROW 2: Nav Tabs + Layer Toggle + Report + Active Scan ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '5px 16px',
        gap: '8px',
        minHeight: '44px',
      }}>

        {/* Page navigation tabs */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(0,0,0,0.4)',
          padding: '4px', borderRadius: '12px',
          border: '1px solid rgba(16,185,129,0.25)',
          flexShrink: 0,
        }}>
          {[
            { key: 'map', label: t('liveMap') },
            { key: 'fields', label: t('fieldManager') },
            { key: 'crop_doctor', label: t('cropDoctor') },
            { key: 'quick_guide', label: t('quickGuide') },
          ].map(({ key, label }) => {
            const active = activeView === key;
            return (
              <button
                key={key}
                onClick={() => setActiveView && setActiveView(key)}
                style={{
                  background: active ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  border: 'none',
                  padding: '5px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem', fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  boxShadow: active ? '0 0 16px rgba(16,185,129,0.4)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '26px', background: 'rgba(16,185,129,0.15)', flexShrink: 0 }} />

        {/* Location Search (only when on map view) */}
        {activeView === 'map' && onLocationSearch && (
          <form onSubmit={handleSearchLocation} style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location (e.g., Bangalore, Karnataka)"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '10px',
                  padding: '6px 14px 6px 36px',
                  color: '#e2e8f0',
                  fontSize: '0.76rem',
                  fontFamily: "'Outfit', sans-serif",
                  width: '280px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(16,185,129,0.5)';
                  e.target.style.boxShadow = '0 0 12px rgba(16,185,129,0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(16,185,129,0.25)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Search size={14} color="#10b981" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }} />
            </div>
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              style={{
                background: searchQuery.trim() ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.1)',
                color: searchQuery.trim() ? '#34d399' : '#64748b',
                border: `1px solid ${searchQuery.trim() ? 'rgba(16,185,129,0.35)' : 'rgba(100,116,139,0.2)'}`,
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Go
            </button>
          </form>
        )}

        {/* Map Layer Toggle (only when on map view) */}
        {activeView === 'map' && (
          <div style={{
            display: 'flex', gap: '4px',
            background: 'rgba(0,0,0,0.3)',
            padding: '4px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}>
            {[
              { key: 'street', label: t('street'), icon: <Map size={13} /> },
              { key: 'satellite', label: t('satellite'), icon: <Globe size={13} /> },
            ].map(({ key, label, icon }) => {
              const active = mapLayer === key;
              return (
                <button key={key} onClick={() => setMapLayer(key)} style={{
                  background: active ? 'rgba(16,185,129,0.2)' : 'transparent',
                  color: active ? '#34d399' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${active ? 'rgba(16,185,129,0.35)' : 'transparent'}`,
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.74rem', fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  {icon}{label}
                </button>
              );
            })}
          </div>
        )}

        {/* Download Report Button */}
        <button
          onClick={handleDownloadReport}
          disabled={downloading || (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0)}
          style={{
            background: (downloading || (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0))
              ? 'rgba(100,116,139,0.2)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: (downloading || (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0)) ? '#64748b' : '#fff',
            border: `1px solid ${(downloading || (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0)) ? 'rgba(100,116,139,0.3)' : 'rgba(16,185,129,0.4)'}`,
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '0.76rem', fontWeight: 700,
            cursor: (downloading || (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0)) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: (downloading || (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0)) ? 'none' : '0 0 14px rgba(16,185,129,0.3)',
            fontFamily: "'Outfit', sans-serif",
            flexShrink: 0,
            opacity: (downloading || (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0)) ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!downloading && !(activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0)) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(16,185,129,0.55)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = (downloading || (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0)) ? 'none' : '0 0 14px rgba(16,185,129,0.3)';
          }}
        >
          {downloading ? (
            <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> {t('downloading')}</>
          ) : (activeScan && activeScan.ndvi !== null && activeScan.ndvi < 0) ? (
            <><FileText size={13} /> {t('cropReport')} (Disabled)</>
          ) : (
            <><FileText size={13} /> {t('cropReport')} <Download size={12} /></>
          )}
        </button>

        {/* Active Scan Badge */}
        {activeScan && (
          <div style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '18px',
            padding: '4px 12px',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.72rem', fontWeight: 600, color: '#34d399',
            flexShrink: 0,
            animation: 'fadeInUp 0.3s ease',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#10b981', boxShadow: '0 0 7px #10b981',
              animation: 'pulse 1.5s infinite',
              display: 'inline-block',
            }} />
            NDVI {activeScan.ndvi?.toFixed(3)}
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem' }}>
              {activeScan.lat?.toFixed(3)}°N
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
