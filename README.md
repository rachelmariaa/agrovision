# 🌾 AgroVision — AI & Satellite Farming Dashboard

AgroVision is an agricultural monitoring platform using FastAPI, Machine Learning (Random Forest), and Sentinel-2 Satellite Telemetry.

---

## 🚀 Quick Start (How to Run)

### 1. Create & Activate Virtual Environment

**Windows (PowerShell / CMD):**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 3. Start the Server

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🌐 Open in Browser

Once the server is running:

| Page | URL |
|---|---|
| 🏠 **Login Page** | [http://localhost:8000/login-page](http://localhost:8000/login-page) |
| 📊 **Dashboard** | [http://localhost:8000/app](http://localhost:8000/app) |
| 📖 **Interactive API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## ⚡ Features
- 🛰️ **NDVI Satellite Telemetry** (Sentinel-2 with automated offline simulation fallback)
- 💧 **NDWI Soil Moisture Analysis**
- 🌤️ **Real-time Weather Integration** (Open-Meteo API)
- 🧠 **ML Crop Recommendation & Health Model** (Random Forest)
- 🔌 **Live WebSocket Terminal Logs** (`ws://localhost:8000/ws/logs`)
