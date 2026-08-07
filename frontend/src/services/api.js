const API_BASE = '/api';

export async function fetchNdvi(lat, lon) {
  const res = await fetch(`${API_BASE}/ndvi?lat=${lat}&lon=${lon}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch NDVI' }));
    throw new Error(err.detail || 'NDVI scan failed');
  }
  return res.json();
}

export async function fetchWeather(lat, lon) {
  const res = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

export async function fetchSoil(lat, lon) {
  const res = await fetch(`${API_BASE}/soil?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Soil moisture fetch failed');
  return res.json();
}

export async function fetchMlPredictions(ndvi, soilMoisture, precipitation, temperature) {
  const params = new URLSearchParams({
    ndvi: ndvi ?? 0.5,
    soil_moisture: soilMoisture ?? 0.2,
    precipitation: precipitation ?? 0,
    temperature: temperature ?? 25,
  });
  const res = await fetch(`${API_BASE}/ml/predict?${params.toString()}`);
  if (!res.ok) throw new Error('ML prediction failed');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/ndvi/stats`);
  if (!res.ok) return { count: 0, min: null, max: null, average: null };
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/ndvi/history`);
  if (!res.ok) return { history: [] };
  return res.json();
}

export async function loginUser(username, password) {
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);

  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

export async function registerUser(username, password) {
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);

  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Registration failed');
  return data;
}

export function connectLogWebSocket(onMessage, onError, onClose) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}/ws/logs`;

  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    onMessage(event.data);
  };

  if (onError) ws.onerror = onError;
  if (onClose) ws.onclose = onClose;

  return ws;
}

// Download Crop Condition PDF Report
// Uses direct backend URL to avoid Vite proxy issues — browser handles the download natively
const BACKEND_URL = 'http://127.0.0.1:8000';

export function getReportDownloadUrl(lat, lon, crop = 'Wheat', farmer = 'Guest Farmer', fieldName = 'Scan Point', lang = 'en') {
  const params = new URLSearchParams({
    lat: lat,
    lon: lon,
    crop: crop,
    farmer: farmer,
    field_name: fieldName,
    lang: lang,
  });
  return `${BACKEND_URL}/report?${params.toString()}`;
}

export function downloadCropReport(lat, lon, crop = 'Wheat', farmer = 'Guest Farmer', fieldName = 'Scan Point', lang = 'en') {
  // Open the PDF URL directly — browser triggers download via Content-Disposition header
  const url = getReportDownloadUrl(lat, lon, crop, farmer, fieldName, lang);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Utility helpers for NDVI color mapping
export function getNdviColor(v) {
  if (v === null || v === undefined) return '#94a3b8';
  if (v < 0) return '#3b82f6';
  if (v < 0.1) return '#d97706';
  if (v < 0.2) return '#eab308';
  if (v < 0.4) return '#84cc16';
  if (v < 0.6) return '#22c55e';
  return '#166534';
}

// ── Field Management API ─────────────────────────────────────────────────────

export async function fetchFields() {
  const res = await fetch(`${API_BASE}/fields`);
  if (!res.ok) return [];
  return res.json();
}

export async function createField(data) {
  const res = await fetch(`${API_BASE}/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create field' }));
    throw new Error(err.detail || 'Failed to create field');
  }
  return res.json();
}

export async function updateField(fieldId, data) {
  const res = await fetch(`${API_BASE}/fields/${fieldId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update field');
  return res.json();
}

export async function deleteField(fieldId) {
  const res = await fetch(`${API_BASE}/fields/${fieldId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete field');
}

export async function fetchFieldNdviHistory(fieldId) {
  const res = await fetch(`${API_BASE}/fields/${fieldId}/ndvi-history`);
  if (!res.ok) throw new Error('Failed to fetch NDVI history');
  return res.json();
}

export async function fetchFieldCalendar(fieldId) {
  const res = await fetch(`${API_BASE}/fields/${fieldId}/calendar`);
  if (!res.ok) throw new Error('Failed to fetch crop calendar');
  return res.json();
}

// ── Advisory API (₹ Savings, Pest Diagnostics, Weather Windows) ──────────────

export async function fetchSmartAdvisory(params) {
  const query = new URLSearchParams({
    lat: params.lat ?? 13.0,
    lon: params.lon ?? 75.0,
    crop: params.crop ?? 'Wheat',
    area: params.area ?? 2.0,
    ndvi: params.ndvi ?? 0.55,
    ndwi: params.ndwi ?? 0.20,
    soil_moisture: params.soil_moisture ?? 0.35,
    precip_forecast: params.precip_forecast ?? 12.0,
    temp: params.temp ?? 27.5,
  });
  const res = await fetch(`${API_BASE}/advisory/smart-actions?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch smart advisory');
  return res.json();
}

export async function fetchPestRisk(crop, ndvi, temp, humidity, precip) {
  const query = new URLSearchParams({
    crop: crop || 'Wheat',
    ndvi: ndvi ?? 0.48,
    temp: temp ?? 26.0,
    humidity: humidity ?? 82.0,
    precip: precip ?? 8.0,
  });
  const res = await fetch(`${API_BASE}/advisory/pest-risk?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch pest risk');
  return res.json();
}

export async function diagnosePestPhoto(input) {
  const formData = new FormData();
  if (input instanceof File) {
    formData.append('file', input);
  } else if (typeof input === 'string') {
    formData.append('disease_code', input);
  } else {
    formData.append('disease_code', 'leaf_blast');
  }
  const res = await fetch(`${API_BASE}/advisory/pest-diagnose`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to diagnose pest photo');
  return res.json();
}

export async function fetchTimingWindow(crop, lat, lon) {
  const query = new URLSearchParams({
    crop: crop || 'Wheat',
    lat: lat ?? 13.0,
    lon: lon ?? 75.0,
  });
  const res = await fetch(`${API_BASE}/advisory/timing-window?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch timing window');
  return res.json();
}

