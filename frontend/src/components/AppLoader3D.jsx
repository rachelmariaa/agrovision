import React, { useState, useEffect } from 'react';
import { Sprout, Satellite, Wifi, Shield, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/* ── Loader CSS Animations Injector ── */
const injectLoaderStyles = () => {
  if (document.getElementById('loader-3d-styles')) return;
  const s = document.createElement('style');
  s.id = 'loader-3d-styles';
  s.textContent = `
    @keyframes globeSpin {
      0%   { transform: rotateX(65deg) rotateZ(0deg);   }
      100% { transform: rotateX(65deg) rotateZ(360deg); }
    }
    @keyframes satelliteOrbit {
      0%   { transform: rotateZ(0deg)   translateX(160px) rotateZ(0deg);   }
      100% { transform: rotateZ(360deg) translateX(160px) rotateZ(-360deg); }
    }
    @keyframes ringPulse {
      0%, 100% { transform: scale(1);   opacity: 0.4; }
      50%       { transform: scale(1.1); opacity: 0.8; }
    }
    @keyframes floatSprout {
      0%, 100% { transform: translateY(0px)  rotateY(0deg);   }
      50%       { transform: translateY(-16px) rotateY(180deg); }
    }
    @keyframes laserScan {
      0%   { top: 0%;   opacity: 0.8; }
      50%  { opacity: 1; }
      100% { top: 100%; opacity: 0;   }
    }
    @keyframes shimmerBar {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0;  }
    }
    @keyframes fadeZoomOut {
      0%   { opacity: 1; transform: scale(1) translateZ(0); }
      100% { opacity: 0; transform: scale(1.15) translateZ(300px); filter: blur(10px); }
    }
  `;
  document.head.appendChild(s);
};

const LOADING_STEPS = [
  { pct: 15, text: 'Establishing Sentinel-2 Satellite Uplink...' },
  { pct: 35, text: 'Calibrating NDVI & Soil Water Telemetry...' },
  { pct: 60, text: 'Loading AI Crop Pathogen Neural Engine...' },
  { pct: 85, text: 'Syncing Indian Agricultural Field Records...' },
  { pct: 100, text: 'AgroVision System Ready.' },
];

export default function AppLoader3D({ onComplete }) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState(LOADING_STEPS[0].text);
  const [closing, setClosing] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    injectLoaderStyles();

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 4) + 2;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);
        setCurrentStepText(LOADING_STEPS[LOADING_STEPS.length - 1].text);

        setTimeout(() => {
          setClosing(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 700);
        }, 400);
      } else {
        setProgress(current);
        const match = LOADING_STEPS.find(s => current <= s.pct);
        if (match) setCurrentStepText(match.text);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'radial-gradient(ellipse at 50% 40%, #064e3b 0%, #022c22 65%, #011a14 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', perspective: '1200px',
      fontFamily: "'Outfit', sans-serif",
      animation: closing ? 'fadeZoomOut 0.7s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
    }}>

      {/* ── 3D Grid Floor ── */}
      <div style={{
        position: 'absolute', bottom: '-30vh', left: '-50vw', width: '200vw', height: '100vh',
        backgroundImage: `
          linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        transform: 'rotateX(75deg)',
        animation: 'moveField 12s linear infinite',
        maskImage: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.9), transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.9), transparent 80%)',
        pointerEvents: 'none',
      }} />

      {/* ── 3D Orbiting Satellite Scene ── */}
      <div style={{
        position: 'relative', width: '320px', height: '320px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transformStyle: 'preserve-3d', marginBottom: '36px',
      }}>

        {/* Outer Ring 1 */}
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          border: '1.5px dashed rgba(16,185,129,0.35)',
          animation: 'ringPulse 3s ease-in-out infinite',
        }} />

        {/* Outer Ring 2 */}
        <div style={{
          position: 'absolute', width: '240px', height: '240px', borderRadius: '50%',
          border: '1px solid rgba(52,211,153,0.25)',
          boxShadow: '0 0 30px rgba(16,185,129,0.2)',
        }} />

        {/* 3D Wireframe Earth Disk */}
        <div style={{
          position: 'absolute', width: '280px', height: '280px', borderRadius: '50%',
          border: '2px solid rgba(16,185,129,0.3)',
          backgroundImage: 'radial-gradient(circle, transparent 60%, rgba(16,185,129,0.1) 100%)',
          animation: 'globeSpin 16s linear infinite',
          boxShadow: '0 0 40px rgba(16,185,129,0.25) inset',
        }} />

        {/* Orbiting Satellite Container */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'satelliteOrbit 6s linear infinite',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            padding: '8px', borderRadius: '10px',
            boxShadow: '0 0 20px #10b981, 0 0 40px rgba(16,185,129,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Satellite size={20} color="#fff" />
          </div>
        </div>

        {/* Center Glowing 3D AgroVision Logo */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '28px',
          background: 'linear-gradient(135deg, #052e16 0%, #064e3b 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 60px rgba(16,185,129,0.8), 0 0 100px rgba(16,185,129,0.4)',
          animation: 'floatSprout 3s ease-in-out infinite',
          border: '2px solid rgba(16,185,129,0.6)',
          overflow: 'hidden',
          zIndex: 10,
        }}>
          {!logoError ? (
            <img
              src="/logo.png"
              alt="AgroVision Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setLogoError(true)}
            />
          ) : (
            <Sprout size={50} color="#10b981" />
          )}
        </div>

        {/* Vertical Laser Scan Line */}
        <div style={{
          position: 'absolute', left: '10%', right: '10%', height: '2px',
          background: 'linear-gradient(90deg, transparent, #10b981, #a7f3d0, #10b981, transparent)',
          boxShadow: '0 0 15px #10b981',
          animation: 'laserScan 2.5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Brand Title ── */}
      <div style={{ textAlign: 'center', zIndex: 10, marginBottom: '24px' }}>
        <div style={{
          fontSize: '2.4rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase',
          background: 'linear-gradient(90deg, #34d399 0%, #10b981 50%, #a7f3d0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}>
          AgroVision
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(16,185,129,0.7)', letterSpacing: '5px', textTransform: 'uppercase', marginTop: '6px', fontWeight: 700 }}>
          Satellite Intelligence Engine
        </div>
      </div>

      {/* ── Progress Bar & Counter ── */}
      <div style={{
        width: '380px', maxWidth: '90vw', zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        {/* Progress Bar Container */}
        <div style={{
          height: '10px', background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(16,185,129,0.35)',
          borderRadius: '20px', padding: '2px',
          boxShadow: '0 0 20px rgba(0,0,0,0.8), inset 0 2px 4px rgba(0,0,0,0.5)',
          overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #059669 0%, #10b981 60%, #34d399 100%)',
            borderRadius: '20px',
            boxShadow: '0 0 16px #10b981',
            transition: 'width 0.1s linear',
          }} />
        </div>

        {/* Percentage + Status Text */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%', background: '#10b981',
              boxShadow: '0 0 8px #10b981', animation: 'pulse 1s infinite', inlineSize: 'auto',
            }} />
            {currentStepText}
          </div>
          <div style={{
            fontSize: '1rem', fontWeight: 900, color: '#34d399',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {progress}%
          </div>
        </div>
      </div>

      {/* Footer Chips */}
      <div style={{
        position: 'absolute', bottom: '24px',
        display: 'flex', gap: '20px', opacity: 0.5,
        fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wifi size={12} color="#10b981" /> Sentinel-2 Link</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Cpu size={12} color="#10b981" /> AI Vision Engine</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={12} color="#10b981" /> Encrypted Protocol</span>
      </div>
    </div>
  );
}
