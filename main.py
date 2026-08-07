import sys
import io

# Force UTF-8 stdout so emoji in print() works on Windows terminals
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from fastapi import FastAPI, HTTPException, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import json
import os
import ee
import datetime
import httpx
from typing import List
from ml_model import agro_ml
from report_routes import router as report_router
from fields_routes import router as fields_router
from advisory_routes import router as advisory_router

app = FastAPI(title="AgroVision API", version="2.0")

app.include_router(report_router)
app.include_router(fields_router)
app.include_router(advisory_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/app")
async def serve_app():
    if os.path.exists("frontend/dist/index.html"):
        from fastapi.responses import FileResponse
        return FileResponse("frontend/dist/index.html")
    return RedirectResponse(url="/static/index.html")

@app.get("/login-page")
async def serve_login():
    if os.path.exists("frontend/dist/index.html"):
        from fastapi.responses import FileResponse
        return FileResponse("frontend/dist/index.html")
    return RedirectResponse(url="/static/login.html")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    from fastapi.responses import Response
    return Response(status_code=204)


# ---------------------------
# INIT GOOGLE EARTH ENGINE
# ---------------------------
EE_INITIALIZED = False
try:
    ee.Initialize(project='agrovision-project')
    EE_INITIALIZED = True
    print("[OK] Google Earth Engine initialized.")
except Exception as e:
    print(f"[WARN] Google Earth Engine not available: {e}")
    print("[INFO] Server starting without Earth Engine. Satellite features will be disabled.")

# ---------------------------
# WEBSOCKET LOG BROADCASTER
# ---------------------------
class LogBroadcaster:
    def __init__(self):
        self.connections: List[WebSocket] = []
        self.log_buffer: List[str] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)
        for msg in self.log_buffer[-50:]:
            try:
                await websocket.send_text(msg)
            except:
                pass

    def disconnect(self, websocket: WebSocket):
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, message: str):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        full_msg = f"[{timestamp}] {message}"
        self.log_buffer.append(full_msg)
        if len(self.log_buffer) > 200:
            self.log_buffer = self.log_buffer[-200:]
        # Print ASCII-safe version to terminal
        safe = full_msg.encode('ascii', errors='replace').decode('ascii')
        print(safe)
        dead = []
        for ws in self.connections:
            try:
                await ws.send_text(full_msg)
            except:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

broadcaster = LogBroadcaster()

@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    await broadcaster.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        broadcaster.disconnect(websocket)

# ---------------------------
# USER SYSTEM
# ---------------------------
USERS_FILE = "users.json"

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f)

# ---------------------------
# REGISTER
# ---------------------------
@app.post("/register")
async def register(username: str = Form(...), password: str = Form(...)):
    users = load_users()
    if username in users:
        await broadcaster.broadcast(f"[REGISTER] ❌ Username '{username}' already exists.")
        raise HTTPException(status_code=400, detail="User already exists")
    users[username] = password
    save_users(users)
    await broadcaster.broadcast(f"[REGISTER] ✅ New user registered: {username}")
    return {"message": "User registered successfully"}

# ---------------------------
# LOGIN
# ---------------------------
@app.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    users = load_users()
    if username not in users:
        await broadcaster.broadcast(f"[LOGIN] ❌ User not found: {username}")
        raise HTTPException(status_code=401, detail="User not found")
    if users[username] != password:
        await broadcaster.broadcast(f"[LOGIN] ❌ Wrong password for: {username}")
        raise HTTPException(status_code=401, detail="Wrong password")
    await broadcaster.broadcast(f"[LOGIN] ✅ User logged in: {username}")
    return {"message": "Login successful", "username": username}

# ---------------------------
# NDVI CATEGORY HELPER
# ---------------------------
def classify_ndvi(ndvi_value):
    if ndvi_value is None:
        return {"category": "Unknown", "color": "#888888", "description": "No data available"}
    if ndvi_value < 0.0:
        return {"category": "Water / Non-vegetated", "color": "#1E90FF", "description": "Water bodies or non-vegetated surfaces"}
    elif ndvi_value < 0.1:
        return {"category": "Bare Soil / Rock", "color": "#CD853F", "description": "Bare soil, rock, or built-up areas"}
    elif ndvi_value < 0.2:
        return {"category": "Sparse Vegetation", "color": "#DAA520", "description": "Sparse or stressed vegetation"}
    elif ndvi_value < 0.4:
        return {"category": "Moderate Vegetation", "color": "#9ACD32", "description": "Moderate vegetation coverage"}
    elif ndvi_value < 0.6:
        return {"category": "Dense Vegetation", "color": "#32CD32", "description": "Dense, healthy vegetation"}
    else:
        return {"category": "Very Dense Vegetation", "color": "#006400", "description": "Very dense, highly productive vegetation"}

# ---------------------------
# NDVI HISTORY (IN-MEMORY)
# ---------------------------
ndvi_history: List[dict] = []

# ---------------------------
# NDVI ENDPOINT
# ---------------------------
@app.get("/ndvi")
async def get_ndvi(lat: float, lon: float):
    await broadcaster.broadcast(f"[NDVI] 📍 Request — Lat: {lat:.4f}, Lon: {lon:.4f}")
    try:
        if not EE_INITIALIZED:
            await broadcaster.broadcast(f"[NDVI] ℹ️ EE offline. Generating simulated Sentinel-2 telemetry...")
            # Generate deterministic pseudo-random NDVI value between 0.25 and 0.78 based on coordinates
            import math
            sim_val = 0.45 + 0.25 * math.sin(lat * 12.34 + lon * 56.78)
            ndvi_val = round(max(0.1, min(0.9, sim_val)), 4)
        else:
            point = ee.Geometry.Point([lon, lat])
            await broadcaster.broadcast(f"[NDVI] 🛰️ Querying Sentinel-2 SR Harmonized...")

            image = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(point)
                .filterDate("2023-01-01", "2023-12-31")
                .sort("CLOUDY_PIXEL_PERCENTAGE")
                .first()
            )

            ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
            value = ndvi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=10
            ).get("NDVI")

            ndvi_val = value.getInfo()

        classification = classify_ndvi(ndvi_val)

        record = {
            "lat": round(lat, 4),
            "lon": round(lon, 4),
            "ndvi": round(ndvi_val, 4) if ndvi_val is not None else None,
            "category": classification["category"],
            "color": classification["color"],
            "description": classification["description"],
            "timestamp": datetime.datetime.now().isoformat()
        }

        ndvi_history.insert(0, record)
        if len(ndvi_history) > 100:
            ndvi_history.pop()

        ndvi_str = f"{ndvi_val:.4f}" if ndvi_val is not None else "N/A"
        mode_str = "[SIMULATED]" if not EE_INITIALIZED else "[EE SATELLITE]"
        await broadcaster.broadcast(
            f"[NDVI] ✅ {mode_str} Value: {ndvi_str} | "
            f"Category: {classification['category']} | "
            f"Lat: {lat:.4f}, Lon: {lon:.4f}"
        )
        return record

    except Exception as e:
        await broadcaster.broadcast(f"[NDVI] ❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------
# NDVI HISTORY
# ---------------------------
@app.get("/ndvi/history")
async def get_ndvi_history():
    return {"history": ndvi_history[:20]}

# ---------------------------
# NDVI STATS
# ---------------------------
@app.get("/ndvi/stats")
async def get_ndvi_stats():
    values = [r["ndvi"] for r in ndvi_history if r["ndvi"] is not None]
    if not values:
        return {"count": 0, "min": None, "max": None, "average": None}
    return {
        "count": len(values),
        "min": round(min(values), 4),
        "max": round(max(values), 4),
        "average": round(sum(values) / len(values), 4)
    }

# ---------------------------
# WEATHER (Open-Meteo, free)
# ---------------------------
@app.get("/weather")
async def get_weather(lat: float, lon: float):
    await broadcaster.broadcast(f"[WEATHER] 🌤️ Fetching weather — Lat: {lat:.4f}, Lon: {lon:.4f}")
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current_weather=true"
        f"&hourly=precipitation,soil_moisture_0_1cm"
        f"&forecast_days=1"
    )
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            data = resp.json()
        cw = data.get("current_weather", {})
        hourly = data.get("hourly", {})
        precip = hourly.get("precipitation", [None])[0]
        soil_moisture = hourly.get("soil_moisture_0_1cm", [None])[0]
        result = {
            "temperature": cw.get("temperature"),
            "windspeed": cw.get("windspeed"),
            "precipitation": precip,
            "soil_moisture": soil_moisture,
            "weather_code": cw.get("weathercode"),
            "is_day": cw.get("is_day"),
        }
        await broadcaster.broadcast(
            f"[WEATHER] ✅ Temp: {result['temperature']}C | "
            f"Wind: {result['windspeed']} km/h | "
            f"Precip: {result['precipitation']} mm"
        )
        return result
    except Exception as e:
        await broadcaster.broadcast(f"[WEATHER] ❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------
# SOIL MOISTURE (NDWI via Sentinel-2)
# ---------------------------
@app.get("/soil")
async def get_soil(lat: float, lon: float):
    await broadcaster.broadcast(f"[SOIL] 💧 Fetching NDWI — Lat: {lat:.4f}, Lon: {lon:.4f}")
    try:
        if not EE_INITIALIZED:
            await broadcaster.broadcast(f"[SOIL] ℹ️ EE offline. Generating simulated soil moisture data...")
            import math
            ndwi_val = round(0.15 + 0.2 * math.cos(lat * 8.9 + lon * 12.3), 4)
        else:
            point = ee.Geometry.Point([lon, lat])
            image = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(point)
                .filterDate("2023-01-01", "2023-12-31")
                .sort("CLOUDY_PIXEL_PERCENTAGE")
                .first()
            )
            ndwi = image.normalizedDifference(["B8A", "B11"]).rename("NDWI")
            value = ndwi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=20
            ).get("NDWI")
            ndwi_val = value.getInfo()

        if ndwi_val is not None:
            moisture_level = "High" if ndwi_val > 0.3 else ("Moderate" if ndwi_val > 0.0 else "Low")
        else:
            moisture_level = "Unknown"

        ndwi_str = f"{ndwi_val:.4f}" if ndwi_val is not None else "N/A"
        await broadcaster.broadcast(f"[SOIL] ✅ NDWI: {ndwi_str} | Moisture: {moisture_level}")
        return {
            "ndwi": round(ndwi_val, 4) if ndwi_val is not None else None,
            "moisture_level": moisture_level
        }
    except Exception as e:
        await broadcaster.broadcast(f"[SOIL] ❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------
# ML PREDICTIONS
# ---------------------------
@app.get("/ml/predict")
async def get_ml_predictions(
    ndvi: float, 
    soil_moisture: float, 
    precipitation: float, 
    temperature: float, 
    hist_ndvi: float = 0.5, # Default fallback
    crop_type: str = "Wheat" # Default fallback
):
    await broadcaster.broadcast("[ML] 🧠 Running Random Forest Model predictions...")
    try:
        # Get Crop Recommendations
        recommendations = agro_ml.recommend_crops(ndvi, soil_moisture, precipitation, temperature, hist_ndvi)
        
        # Predict Condition for the top recommended crop
        top_crop = recommendations[0]["crop"] if recommendations else crop_type
        condition = agro_ml.predict_condition(ndvi, soil_moisture, precipitation, temperature, hist_ndvi, top_crop)
        
        result = {
            "recommended_crops": recommendations,
            "predicted_condition": condition,
            "condition_for_crop": top_crop
        }
        await broadcaster.broadcast(f"[ML] ✅ Top Crop: {top_crop} ({condition} Condition)")
        return result
    except Exception as e:
        await broadcaster.broadcast(f"[ML] ❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------
# HEALTH CHECK
# ---------------------------
@app.get("/")
async def root():
    await broadcaster.broadcast("[API] 🌱 AgroVision API health check ping")
    return {
        "status": "running",
        "version": "2.0",
        "ee_initialized": EE_INITIALIZED,
        "endpoints": ["/ndvi", "/ndvi/history", "/ndvi/stats", "/weather", "/soil", "/login", "/register", "/ws/logs"]
    }

if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
app.mount("/static", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)