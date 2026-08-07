# 🌾 AgroVision — Legendary Satellite Intelligence Platform

AgroVision is a modern agricultural monitoring application featuring Sentinel-2 NDVI satellite telemetry, AI leaf disease diagnostics, soil/weather analytics, and multi-language support (8 Indian languages).

---

## 🚀 Setup Instructions for New Developers

Follow these steps after running `git clone <repo-url>` or `git pull`:

---

### 1. 🐍 Backend Setup (Python / FastAPI)

Open Terminal / PowerShell in the project root folder (`AgroVision`):

```bash
# 1. Create a virtual environment
python -m venv .venv

# 2. Activate virtual environment
# On Windows (PowerShell):
.venv\Scripts\activate

# On macOS / Linux:
source .venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Start Backend Server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 2. ⚡ Frontend Setup (React / Vite)

Open a **second** Terminal tab / window in the `frontend` folder:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start Frontend Dev Server
npm run dev
```

---

### 🌐 Accessing the App

Once both servers are running:

- 📊 **AgroVision Web App**: [http://localhost:5173](http://localhost:5173)
- 🔌 **FastAPI Backend API**: [http://localhost:8000](http://localhost:8000)
- 📖 **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ⚡ Key Features
- 🛰️ **Live Satellite NDVI Telemetry**: Instant vegetation health & soil moisture lookup via map click.
- 🔬 **AI Crop Doctor (Computer Vision)**: Leaf photo diagnostic scanner with NPK fertilizer dosage & care plans.
- 🌾 **Field Manager**: Interactive polygon mapping & custom farm field boundary registration.
- 📖 **Quick Guide**: Step-by-step interactive manual & NDVI health simulator.
- 🌐 **Multi-Language Support**: 8 Indian languages (English, Hindi, Kannada, Telugu, Tamil, Marathi, Punjabi, Bengali).
- 📄 **PDF Crop Reports**: Instant localized PDF telemetry report generation.
