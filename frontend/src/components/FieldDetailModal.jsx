import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer
} from 'recharts';
import { X, Leaf, Calendar, TrendingUp, TrendingDown, Minus, Trash2, Edit3, Save, Loader2 } from 'lucide-react';
import CropCalendarTimeline from './CropCalendarTimeline';
import SmartAdvisoryTab from './SmartAdvisoryTab';
import { fetchFieldNdviHistory, fetchFieldCalendar, updateField, deleteField } from '../services/api';

const CROP_OPTIONS = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Wheat / Paddy', 'Paddy'];

// ── Custom recharts tooltip ───────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(5,20,10,0.96)', border: '1px solid rgba(16,185,129,0.35)',
      borderRadius: '10px', padding: '10px 14px', fontSize: '0.78rem',
    }}>
      <div style={{ color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 700, marginBottom: '2px' }}>
          {p.name}: {p.value?.toFixed(4)}
        </div>
      ))}
    </div>
  );
}

export default function FieldDetailModal({ field, onClose, onFieldUpdated, onFieldDeleted }) {
  const [tab, setTab] = useState('advisory');
  const [history, setHistory] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(field.name);
  const [editCrop, setEditCrop] = useState(field.crop_type || 'Wheat');
  const [editSowDate, setEditSowDate] = useState(field.sowing_date || '');
  const [editArea, setEditArea] = useState(field.area_hectares || '');

  // Load chart + calendar data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [hist, cal] = await Promise.all([
        fetchFieldNdviHistory(field.id),
        fetchFieldCalendar(field.id),
      ]);
      setHistory(hist);
      setCalendar(cal);
    } catch (e) {
      console.error('Failed to load field data:', e);
    } finally {
      setLoading(false);
    }
  }, [field.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateField(field.id, {
        name: editName,
        crop_type: editCrop,
        sowing_date: editSowDate || undefined,
        area_hectares: editArea ? parseFloat(editArea) : undefined,
      });
      setEditing(false);
      onFieldUpdated?.(updated);
      loadData();   // refresh calendar
    } catch (e) {
      alert('Failed to save: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    try {
      await deleteField(field.id);
      onFieldDeleted?.(field.id);
      onClose();
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    }
  };

  const trendIcon = history?.trend === 'improving'
    ? <TrendingUp size={14} color="#10b981" />
    : history?.trend === 'declining'
    ? <TrendingDown size={14} color="#f87171" />
    : <Minus size={14} color="#f59e0b" />;
  const trendColor = history?.trend === 'improving' ? '#10b981' : history?.trend === 'declining' ? '#f87171' : '#f59e0b';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      animation: 'fadeInUp 0.25s ease',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: '100%', maxWidth: '860px', maxHeight: '90vh',
        background: 'linear-gradient(135deg, rgba(5,20,10,0.98) 0%, rgba(2,10,6,0.99) 100%)',
        border: '1px solid rgba(16,185,129,0.35)',
        borderRadius: '24px',
        boxShadow: '0 20px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(16,185,129,0.1) inset',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Modal header ── */}
        <div style={{
          padding: '18px 24px',
          background: 'rgba(0,0,0,0.4)',
          borderBottom: '1px solid rgba(16,185,129,0.15)',
          display: 'flex', alignItems: 'center', gap: '14px',
          flexShrink: 0,
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #052e16, #064e3b)',
            border: '1px solid rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', flexShrink: 0,
          }}>🌾</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)',
                  borderRadius: '8px', padding: '4px 12px',
                  color: '#fff', fontSize: '1.1rem', fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif", width: '100%',
                }}
              />
            ) : (
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0fdf4', lineHeight: 1 }}>
                {field.name}
              </div>
            )}
            <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '3px' }}>
              {field.crop_type} · {field.centroid?.lat?.toFixed(3)}°N, {field.centroid?.lon?.toFixed(3)}°E
              {field.area_hectares && ` · ${field.area_hectares} ha`}
            </div>
          </div>

          {/* Trend badge */}
          {history && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: `${trendColor}18`, border: `1px solid ${trendColor}40`,
              borderRadius: '20px', padding: '5px 12px',
              fontSize: '0.72rem', fontWeight: 700, color: trendColor,
              flexShrink: 0,
            }}>
              {trendIcon} {history.trend?.toUpperCase()}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} style={actionBtnStyle('#10b981')}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  Save
                </button>
                <button onClick={() => setEditing(false)} style={actionBtnStyle('#64748b')}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} style={actionBtnStyle('#3b82f6')}>
                  <Edit3 size={14} /> Edit
                </button>
                <button onClick={handleDelete} style={actionBtnStyle(confirmDelete ? '#ef4444' : '#7f1d1d')}>
                  <Trash2 size={14} /> {confirmDelete ? 'Confirm' : 'Delete'}
                </button>
              </>
            )}
            <button onClick={onClose} style={actionBtnStyle('#374151')}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Edit form (when editing) ── */}
        {editing && (
          <div style={{
            display: 'flex', gap: '12px', padding: '14px 24px',
            background: 'rgba(16,185,129,0.05)',
            borderBottom: '1px solid rgba(16,185,129,0.1)',
            flexWrap: 'wrap',
          }}>
            <label style={labelStyle}>
              <span>Crop Type</span>
              <select value={editCrop} onChange={e => setEditCrop(e.target.value)} style={inputStyle}>
                {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label style={labelStyle}>
              <span>Sowing Date</span>
              <input type="date" value={editSowDate} onChange={e => setEditSowDate(e.target.value)} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              <span>Area (ha)</span>
              <input type="number" step="0.1" value={editArea} onChange={e => setEditArea(e.target.value)} style={inputStyle} placeholder="e.g. 2.5" />
            </label>
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: '4px', padding: '14px 24px 0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          {[
            { key: 'advisory', label: '💡 Smart Advisory & ₹ Savings' },
            { key: 'chart', label: '📈 NDVI History' },
            { key: 'calendar', label: '📅 Crop Calendar' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: tab === key ? 'rgba(16,185,129,0.15)' : 'transparent',
              border: 'none',
              borderBottom: tab === key ? '2px solid #10b981' : '2px solid transparent',
              color: tab === key ? '#10b981' : '#64748b',
              padding: '8px 18px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.8rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
              letterSpacing: '0.5px',
            }}>{label}</button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', gap:'12px', color:'#4ade80', fontSize:'0.85rem' }}>
              <Loader2 size={22} style={{ animation:'spin 1s linear infinite' }} />
              Loading field intelligence...
            </div>
          ) : tab === 'advisory' ? (
            <SmartAdvisoryTab field={field} />
          ) : tab === 'chart' ? (
            <NdviChartTab history={history} />
          ) : (
            <CropCalendarTimeline calendar={calendar} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── NDVI/NDWI Chart Tab ──────────────────────────────────────────────────── */
function NdviChartTab({ history }) {
  if (!history) return null;

  const { series, trend, current_ndvi, peak_ndvi } = history;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {[
          { label: 'Current NDVI', value: current_ndvi?.toFixed(4), color: '#10b981' },
          { label: 'Peak NDVI', value: peak_ndvi?.toFixed(4), color: '#34d399' },
          { label: '12-Week Trend', value: trend?.toUpperCase(), color: trend === 'improving' ? '#10b981' : trend === 'declining' ? '#f87171' : '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: 1, background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${color}30`,
            borderRadius: '12px', padding: '12px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* NDVI Area Chart */}
      <div>
        <div style={{ fontSize: '0.7rem', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', fontWeight: 700 }}>
          📊 NDVI & NDWI — 12-Week Time Series
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={series} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="ndwiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[-0.2, 1]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }}
              formatter={(v) => v === 'ndvi' ? 'NDVI (Vegetation)' : 'NDWI (Water/Soil)'}
            />
            <ReferenceLine y={0.4} stroke="rgba(16,185,129,0.3)" strokeDasharray="4 4" label={{ value: 'Good', fill: '#10b981', fontSize: 10 }} />
            <Area type="monotone" dataKey="ndvi" name="ndvi" stroke="#10b981" strokeWidth={2.5}
              fill="url(#ndviGrad)" dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#34d399', strokeWidth: 0 }} />
            <Line type="monotone" dataKey="ndwi" name="ndwi" stroke="#3b82f6" strokeWidth={2}
              strokeDasharray="5 3" dot={{ r: 2, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* NDWI-only bar reference */}
      <div style={{
        background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: '10px', padding: '10px 14px', fontSize: '0.73rem', color: '#94a3b8',
        lineHeight: 1.6,
      }}>
        <span style={{ color: '#3b82f6', fontWeight: 700 }}>NDWI</span> (Water Index) ranges: &nbsp;
        <span style={{ color: '#22c55e' }}>{'> 0.3'} = High moisture</span> · &nbsp;
        <span style={{ color: '#f59e0b' }}>0–0.3 = Moderate</span> · &nbsp;
        <span style={{ color: '#f87171' }}>{'< 0'} = Dry / stressed</span>
      </div>
    </div>
  );
}

/* ── Shared style helpers ─────────────────────────────────────────────────── */
function actionBtnStyle(color) {
  return {
    background: `${color}18`, border: `1px solid ${color}40`,
    color: color === '#374151' ? '#94a3b8' : color,
    padding: '7px 14px', borderRadius: '8px',
    fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 700,
    cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '5px',
  };
}
const labelStyle = {
  display: 'flex', flexDirection: 'column', gap: '4px',
  fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px',
};
const inputStyle = {
  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(16,185,129,0.3)',
  borderRadius: '8px', padding: '6px 12px',
  color: '#f0fdf4', fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem',
  outline: 'none',
};
