import React from 'react';
import { Waves, AlertTriangle, MapPin, X } from 'lucide-react';

export default function WaterDetectionModal({ isOpen, onClose, onConfirm, type = 'water' }) {
  if (!isOpen) return null;

  const isWater = type === 'water';
  const needsConfirmation = type === 'bare';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      animation: 'fadeIn 0.2s ease-out',
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      {/* Modal Container */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(5,25,12,0.98), rgba(2,12,6,0.99))',
        border: isWater ? '2px solid rgba(59, 130, 246, 0.5)' : '2px solid rgba(251, 191, 36, 0.5)',
        borderRadius: '24px',
        padding: '0',
        width: '480px',
        maxWidth: '90vw',
        boxShadow: isWater 
          ? '0 25px 70px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)'
          : '0 25px 70px rgba(251, 191, 36, 0.4), 0 0 60px rgba(251, 191, 36, 0.2)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'hidden',
        position: 'relative',
      }}
      onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <X size={18} color="#94a3b8" />
        </button>

        {/* Top Glow Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: isWater
            ? 'linear-gradient(90deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent)'
            : 'linear-gradient(90deg, transparent, #fbbf24, #fde047, #fbbf24, transparent)',
          animation: 'shimmer 3s ease-in-out infinite',
        }} />

        {/* Icon Section */}
        <div style={{
          padding: '32px 32px 20px',
          textAlign: 'center',
          background: isWater
            ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15), transparent)'
            : 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15), transparent)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isWater
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.3))'
              : 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.3))',
            border: isWater
              ? '3px solid rgba(59, 130, 246, 0.4)'
              : '3px solid rgba(251, 191, 36, 0.4)',
            boxShadow: isWater
              ? '0 0 30px rgba(59, 130, 246, 0.3)'
              : '0 0 30px rgba(251, 191, 36, 0.3)',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            {isWater ? (
              <Waves size={40} color="#60a5fa" strokeWidth={2.5} />
            ) : (
              <AlertTriangle size={40} color="#fbbf24" strokeWidth={2.5} />
            )}
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '0 32px 32px' }}>
          {/* Title */}
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            color: isWater ? '#60a5fa' : '#fbbf24',
            textAlign: 'center',
            marginBottom: '12px',
            letterSpacing: '0.5px',
            fontFamily: "'Outfit', sans-serif",
            textTransform: 'uppercase',
          }}>
            {isWater ? '🌊 Water Body Detected!' : '⚠️ Low Vegetation Area'}
          </h2>

          {/* Message */}
          <p style={{
            fontSize: '0.95rem',
            color: '#e2e8f0',
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: '16px',
            fontFamily: "'Outfit', sans-serif",
          }}>
            {isWater ? (
              <>
                Please select a <strong style={{ color: '#10b981' }}>land area with vegetation</strong> for agricultural analysis.
              </>
            ) : (
              <>
                This area has <strong style={{ color: '#fbbf24' }}>very little plant coverage</strong>. The analysis may not provide accurate crop recommendations.
              </>
            )}
          </p>

          {/* Info Box */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: isWater
              ? '1px solid rgba(59, 130, 246, 0.3)'
              : '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '20px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}>
              <MapPin size={16} color={isWater ? '#60a5fa' : '#fbbf24'} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{
                fontSize: '0.82rem',
                color: '#94a3b8',
                lineHeight: 1.5,
                fontFamily: "'Outfit', sans-serif",
              }}>
                {isWater ? (
                  <>
                    <strong style={{ color: '#cbd5e1' }}>Tip:</strong> Water bodies like seas, oceans, rivers, and lakes cannot be analyzed for crop suitability. Please click on agricultural land areas.
                  </>
                ) : (
                  <>
                    <strong style={{ color: '#cbd5e1' }}>Note:</strong> Bare soil, rock, sand, or built-up areas may not provide reliable agricultural insights.
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          {needsConfirmation ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: '0 8px 20px rgba(251, 191, 36, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(251, 191, 36, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(251, 191, 36, 0.4)';
                }}
              >
                Continue Anyway
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 24px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
              }}
            >
              Understood
            </button>
          )}
        </div>
      </div>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
