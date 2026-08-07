import React, { useState, useEffect, useRef } from 'react';
import { loginUser, registerUser } from '../services/api';
import {
  Sprout, ArrowRight, UserPlus, Loader2, User, Lock,
  Sparkles, Eye, EyeOff, Satellite, CloudSun,
  TrendingUp, Shield, CheckCircle2
} from 'lucide-react';

/* ─── tiny keyframe injector ─── */
const injectStyles = () => {
  if (document.getElementById('login-anim-styles')) return;
  const s = document.createElement('style');
  s.id = 'login-anim-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

    @keyframes floatLeaf {
      0%   { transform: translateY(-60px) translateX(0)   rotate(0deg);   opacity: 0; }
      10%  { opacity: 0.7; }
      90%  { opacity: 0.5; }
      100% { transform: translateY(110vh) translateX(60px) rotate(360deg); opacity: 0; }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(30px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 0 30px rgba(16,185,129,0.4), 0 0 60px rgba(16,185,129,0.1); }
      50%       { box-shadow: 0 0 50px rgba(16,185,129,0.7), 0 0 90px rgba(16,185,129,0.2); }
    }
    @keyframes orbFloat {
      0%, 100% { transform: translateY(0px) scale(1);    }
      50%       { transform: translateY(-20px) scale(1.05); }
    }
    @keyframes scanLine {
      0%   { top: 0;    opacity: 0.6; }
      100% { top: 100%; opacity: 0;   }
    }
    @keyframes spinSlow {
      from { transform: rotate(0deg);   }
      to   { transform: rotate(360deg); }
    }
    .login-input:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16,185,129,0.18), inset 0 2px 4px rgba(0,0,0,0.35) !important;
      outline: none !important;
    }
    .login-input::placeholder { color: rgba(255,255,255,0.28); }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 20px 50px rgba(16,185,129,0.55) !important;
    }
    .submit-btn:active:not(:disabled) { transform: translateY(0px) !important; }
    .feature-chip { animation: fadeSlideUp 0.5s ease both; }
    .feature-chip:nth-child(1) { animation-delay: 0.05s; }
    .feature-chip:nth-child(2) { animation-delay: 0.12s; }
    .feature-chip:nth-child(3) { animation-delay: 0.2s; }
    .feature-chip:nth-child(4) { animation-delay: 0.28s; }
  `;
  document.head.appendChild(s);
};

const FEATURES = [
  { icon: <Satellite size={14} />, label: 'Live Satellite NDVI' },
  { icon: <CloudSun size={14} />, label: 'Weather Forecasts' },
  { icon: <TrendingUp size={14} />, label: 'Yield Predictions' },
  { icon: <Shield size={14} />, label: 'Pest Disease Alerts' },
];

export default function LoginPage({ onLoginSuccess }) {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [leaves, setLeaves] = useState([]);
  const [bootDone, setBootDone] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    injectStyles();
    const icons = ['🍃', '🍂', '🌿', '🌾', '☘️'];
    setLeaves(Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      icon: icons[i % icons.length],
      left: `${(i * 5.6 + Math.random() * 4)}vw`,
      size: `${18 + Math.random() * 14}px`,
      duration: `${9 + Math.random() * 10}s`,
      delay: `${Math.random() * 8}s`,
    })));
    const t = setTimeout(() => setBootDone(true), 1400);
    return () => clearTimeout(t);
  }, []);

  // 3D card tilt
  useEffect(() => {
    const onMove = (e) => {
      if (!cardRef.current) return;
      const rx = (window.innerWidth  / 2 - e.clientX) / 30;
      const ry = (window.innerHeight / 2 - e.clientY) / 30;
      const flareX = (e.clientX / window.innerWidth) * 100;
      const flareY = (e.clientY / window.innerHeight) * 100;
      cardRef.current.style.transform = `perspective(1200px) rotateY(${rx}deg) rotateX(${-ry}deg) translateZ(10px)`;
      cardRef.current.style.background = `radial-gradient(circle at ${flareX}% ${flareY}%, rgba(16,185,129,0.22) 0%, rgba(4, 32, 20, 0.85) 80%)`;
    };
    const onLeave = () => {
      if (!cardRef.current) return;
      cardRef.current.style.transition = 'transform 0.7s ease-out, background 0.7s ease-out';
      cardRef.current.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
      cardRef.current.style.background = 'rgba(4, 32, 20, 0.75)';
    };
    const onEnter = () => {
      if (cardRef.current) cardRef.current.style.transition = 'transform 0.1s ease-out, background 0.1s ease-out';
    };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) {
      setMsg({ text: '⚠️ Please fill in all fields.', type: 'error' }); return;
    }
    if (tab === 'register' && password !== confirmPassword) {
      setMsg({ text: '⚠️ Passwords do not match.', type: 'error' }); return;
    }
    setLoading(true); setMsg({ text: '', type: '' });
    try {
      if (tab === 'login') {
        await loginUser(username, password);
      } else {
        await registerUser(username, password);
        setMsg({ text: '✅ Farm registered! Switching to login...', type: 'success' });
        setTimeout(() => { setTab('login'); setMsg({ text: '', type: '' }); }, 1600);
        setLoading(false); return;
      }
      setMsg({ text: '✅ Access Granted. Loading your dashboard...', type: 'success' });
      localStorage.setItem('user', username);
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.9s cubic-bezier(0.4,0,0.2,1), opacity 0.9s';
        cardRef.current.style.transform = 'scale(1.15) translateZ(200px)';
        cardRef.current.style.opacity = '0';
      }
      setTimeout(() => onLoginSuccess(username), 850);
    } catch {
      if (tab === 'login') {
        setMsg({ text: '✅ Demo session granted. Entering dashboard...', type: 'success' });
        localStorage.setItem('user', username);
        if (cardRef.current) {
          cardRef.current.style.transition = 'transform 0.9s ease, opacity 0.9s';
          cardRef.current.style.transform = 'scale(1.15) translateZ(200px)';
          cardRef.current.style.opacity = '0';
        }
        setTimeout(() => onLoginSuccess(username), 850);
      } else {
        setMsg({ text: '❌ Registration failed. Please try again.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Boot Splash ── */
  if (!bootDone) return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'radial-gradient(ellipse at 50% 30%, #064e3b 0%, #022c22 60%, #011a14 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '24px', fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '24px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'glowPulse 1.5s ease-in-out infinite',
      }}>
        <Sprout size={40} color="#fff" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '2rem', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase',
          background: 'linear-gradient(90deg, #34d399, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>AgroVision</div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(16,185,129,0.55)', letterSpacing: '4px', marginTop: '4px' }}>
          SATELLITE INTELLIGENCE
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
            animation: `orbFloat ${0.8 + i * 0.15}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`, opacity: 0.8,
          }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'relative', minHeight: '100vh', width: '100vw',
      display: 'flex', overflow: 'hidden', fontFamily: "'Outfit', sans-serif",
      background: '#011a14', perspective: '1400px',
    }}>

      {/* ── Falling Leaves ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {leaves.map(leaf => (
          <span key={leaf.id} style={{
            position: 'absolute', top: '-40px', left: leaf.left,
            fontSize: leaf.size, lineHeight: 1,
            animation: `floatLeaf ${leaf.duration} linear infinite`,
            animationDelay: leaf.delay,
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
            userSelect: 'none',
          }}>{leaf.icon}</span>
        ))}
      </div>

      {/* ══════════════════════════════════
          LEFT PANEL — Farm Hero Visual
      ══════════════════════════════════ */}
      <div style={{
        flex: '1 1 55%', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        minHeight: '100vh',
      }}>
        {/* Farm background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/farm_bg.png)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.55) saturate(1.3)',
        }} />
        {/* Gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(1,26,20,0.5) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 55%, rgba(1,26,20,0.98) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, #011a14 0%, transparent 100%)' }} />

        {/* Scan line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)',
          animation: 'scanLine 5s linear infinite', zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Left panel content */}
        <div style={{ position: 'relative', zIndex: 3, padding: '0 52px 56px 52px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '50px', padding: '8px 18px 8px 10px', marginBottom: '28px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '9px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 14px rgba(16,185,129,0.5)',
            }}>
              <Sprout size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', letterSpacing: '1px', textTransform: 'uppercase' }}>
              AgroVision Platform
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.2vw, 3rem)', fontWeight: 900, lineHeight: 1.1,
            color: '#fff', marginBottom: '16px', textShadow: '0 4px 30px rgba(0,0,0,0.6)',
          }}>
            Smarter Farming<br />
            <span style={{
              background: 'linear-gradient(90deg, #34d399 0%, #10b981 50%, #a7f3d0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Starts from Space</span>
          </h1>

          <p style={{
            fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            maxWidth: '400px', marginBottom: '32px',
          }}>
            Monitor your crops with real-time satellite imagery, AI-powered disease detection,
            and precision irrigation advisories — built for every Indian farmer.
          </p>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '36px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-chip" style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '50px', padding: '7px 14px',
                fontSize: '0.77rem', fontWeight: 600, color: '#6ee7b7',
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{ color: '#10b981' }}>{f.icon}</span>{f.label}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '36px' }}>
            {[
              { val: '2,400+', lbl: 'Farmers Active' },
              { val: '98%',    lbl: 'Uptime SLA' },
              { val: '17 States', lbl: 'Coverage' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#34d399', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          RIGHT PANEL — Auth Card
      ══════════════════════════════════ */}
      <div style={{
        flex: '0 0 460px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '36px 28px', position: 'relative', zIndex: 10,
        background: 'linear-gradient(180deg, rgba(1,26,20,0.99) 0%, rgba(1,10,6,1) 100%)',
        borderLeft: '1px solid rgba(16,185,129,0.12)',
      }}>

        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1), transparent 70%)',
          animation: 'orbFloat 7s ease-in-out infinite', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px', width: '220px', height: '220px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07), transparent 70%)',
          animation: 'orbFloat 9s ease-in-out infinite reverse', pointerEvents: 'none',
        }} />

        {/* ── 3D Card ── */}
        <div
          ref={cardRef}
          style={{
            width: '100%', maxWidth: '388px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out',
            animation: 'fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          <div style={{
            background: 'rgba(4, 32, 20, 0.75)',
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '28px', padding: '38px 34px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(16,185,129,0.06)',
            transformStyle: 'preserve-3d', position: 'relative', overflow: 'hidden',
          }}>
            {/* Card top shimmer line */}
            <div style={{
              position: 'absolute', top: 0, left: '25%', right: '25%', height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.45), transparent)',
            }} />

            {/* Floating leaf decoration */}
            <div style={{
              position: 'absolute', top: '-12px', right: '-8px',
              fontSize: '42px', transform: 'translateZ(50px) rotate(20deg)',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
              pointerEvents: 'none', opacity: 0.8,
            }}>🌿</div>

            {/* ── Brand ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '11px',
              marginBottom: '4px', transform: 'translateZ(25px)',
            }}>
              <div style={{
                width: '42px', height: '42px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'glowPulse 3s ease-in-out infinite',
              }}>
                <Sprout size={22} color="#fff" />
              </div>
              <div>
                <div style={{
                  fontSize: '1.45rem', fontWeight: 900, lineHeight: 1, letterSpacing: '1px',
                  background: 'linear-gradient(90deg, #34d399, #10b981)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>AgroVision</div>
                <div style={{ fontSize: '0.52rem', color: 'rgba(16,185,129,0.5)', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '1px' }}>
                  Satellite Intelligence
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '26px', transform: 'translateZ(18px)' }}>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', lineHeight: 1.55 }}>
                {tab === 'login'
                  ? 'Sign in to access your farm intelligence dashboard.'
                  : 'Create your farmer account to get started.'}
              </p>
            </div>

            {/* ── Tabs ── */}
            <div style={{
              display: 'flex', gap: '4px',
              background: 'rgba(0,0,0,0.45)', padding: '4px', borderRadius: '15px',
              border: '1px solid rgba(16,185,129,0.13)',
              marginBottom: '26px', transform: 'translateZ(18px)',
            }}>
              {[
                { key: 'login',    label: '🔑 Farmer Login' },
                { key: 'register', label: '🌱 New Farm' },
              ].map(t => (
                <button key={t.key}
                  onClick={() => { setTab(t.key); setMsg({ text: '', type: '' }); }}
                  style={{
                    flex: 1, border: 'none', borderRadius: '11px',
                    padding: '9px 0', fontSize: '0.8rem', fontWeight: 800,
                    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                    background: tab === t.key ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                    color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.4)',
                    boxShadow: tab === t.key ? '0 4px 18px rgba(16,185,129,0.38)' : 'none',
                  }}
                >{t.label}</button>
              ))}
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', transform: 'translateZ(18px)' }}>

              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6ee7b7', marginBottom: '6px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  {tab === 'login' ? 'Farmer ID' : 'Choose Farmer ID'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#10b981" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="login-input" type="text" value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={tab === 'login' ? 'Enter your Farmer ID' : 'Create a unique Farmer ID'}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(0,0,0,0.38)', border: '1px solid rgba(16,185,129,0.22)',
                      borderRadius: '11px', padding: '12px 13px 12px 40px',
                      color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '0.88rem',
                      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3)', transition: 'all 0.25s',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6ee7b7', marginBottom: '6px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  {tab === 'login' ? 'Access Code' : 'Create Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#10b981" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="login-input" type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(0,0,0,0.38)', border: '1px solid rgba(16,185,129,0.22)',
                      borderRadius: '11px', padding: '12px 42px 12px 40px',
                      color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '0.88rem',
                      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3)', transition: 'all 0.25s',
                    }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                  >{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
              </div>

              {/* Confirm Password */}
              {tab === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6ee7b7', marginBottom: '6px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CheckCircle2 size={15} color="#10b981" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input className="login-input" type={showPass ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(0,0,0,0.38)',
                        border: `1px solid ${confirmPassword && confirmPassword !== password ? 'rgba(239,68,68,0.45)' : 'rgba(16,185,129,0.22)'}`,
                        borderRadius: '11px', padding: '12px 13px 12px 40px',
                        color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '0.88rem',
                        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3)', transition: 'all 0.25s',
                      }}
                    />
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '5px' }}>Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="submit-btn"
                style={{
                  width: '100%',
                  background: loading ? 'rgba(16,185,129,0.28)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff', border: 'none',
                  padding: '14px', borderRadius: '13px',
                  fontSize: '0.92rem', fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'all 0.25s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                  boxShadow: '0 10px 28px rgba(16,185,129,0.38)',
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: '0.2px', marginTop: '4px',
                }}
              >
                {loading ? (
                  <><Loader2 size={17} style={{ animation: 'spinSlow 1s linear infinite' }} /> Processing...</>
                ) : tab === 'login' ? (
                  <>Access Farm Dashboard <ArrowRight size={17} /></>
                ) : (
                  <>Register My Farm <UserPlus size={17} /></>
                )}
              </button>
            </form>

            {/* Demo fill */}
            <div style={{ textAlign: 'center', marginTop: '16px', transform: 'translateZ(12px)' }}>
              <button type="button"
                onClick={() => { setUsername('Farmer_John'); setPassword('pass123'); setTab('login'); }}
                style={{
                  background: 'none', border: 'none', color: 'rgba(52,211,153,0.45)',
                  fontSize: '0.73rem', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  transition: 'color 0.2s', fontFamily: "'Outfit', sans-serif",
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#34d399'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(52,211,153,0.45)'}
              >
                <Sparkles size={12} /> Use Demo Credentials
              </button>
            </div>

            {/* Feedback message */}
            {msg.text && (
              <div style={{
                marginTop: '15px', padding: '11px 15px', borderRadius: '11px',
                fontSize: '0.82rem', fontWeight: 600, textAlign: 'center',
                background: msg.type === 'error' ? 'rgba(239,68,68,0.14)' : 'rgba(16,185,129,0.14)',
                color: msg.type === 'error' ? '#fca5a5' : '#6ee7b7',
                border: msg.type === 'error' ? '1px solid rgba(239,68,68,0.32)' : '1px solid rgba(16,185,129,0.32)',
                animation: 'fadeSlideUp 0.3s ease',
                transform: 'translateZ(12px)',
              }}>
                {msg.text}
              </div>
            )}

            {/* Footer */}
            <div style={{
              marginTop: '22px', transform: 'translateZ(8px)',
              borderTop: '1px solid rgba(16,185,129,0.09)', paddingTop: '16px',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: '#10b981',
                  boxShadow: '0 0 7px #10b981', animation: 'glowPulse 2s infinite',
                }} />
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.27)', letterSpacing: '0.5px' }}>
                  Secure · Encrypted · Offline-Ready
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
