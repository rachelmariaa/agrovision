"""
fields_routes.py — AgroVision Field Management API

Provides CRUD for named GeoJSON polygon fields, per-field NDVI/NDWI
12-week simulated time-series, and crop calendar growth-stage tracking.

Data persisted in fields.json (same pattern as users.json).
No external DB dependency.
"""

import json
import math
import os
import uuid
from datetime import datetime, timedelta, date
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/fields", tags=["fields"])

FIELDS_FILE = "fields.json"

# ── Crop growth-stage library ───────────────────────────────────────────────
CROP_STAGES = {
    "Wheat": [
        {"stage": "Germination",  "days": 10, "ndvi_range": [0.05, 0.15], "emoji": "🌱"},
        {"stage": "Tillering",    "days": 25, "ndvi_range": [0.20, 0.40], "emoji": "🌿"},
        {"stage": "Jointing",     "days": 20, "ndvi_range": [0.45, 0.65], "emoji": "🌾"},
        {"stage": "Heading",      "days": 15, "ndvi_range": [0.60, 0.80], "emoji": "🌾"},
        {"stage": "Grain Fill",   "days": 25, "ndvi_range": [0.55, 0.75], "emoji": "🌾"},
        {"stage": "Maturity",     "days": 15, "ndvi_range": [0.25, 0.45], "emoji": "🟡"},
        {"stage": "Harvest",      "days": 5,  "ndvi_range": [0.10, 0.25], "emoji": "🚜"},
    ],
    "Rice": [
        {"stage": "Nursery",      "days": 25, "ndvi_range": [0.10, 0.25], "emoji": "🌱"},
        {"stage": "Transplanting","days": 15, "ndvi_range": [0.20, 0.35], "emoji": "🌿"},
        {"stage": "Tillering",    "days": 30, "ndvi_range": [0.45, 0.65], "emoji": "🌾"},
        {"stage": "Panicle Init", "days": 20, "ndvi_range": [0.60, 0.78], "emoji": "🌾"},
        {"stage": "Heading",      "days": 15, "ndvi_range": [0.55, 0.75], "emoji": "🌾"},
        {"stage": "Grain Fill",   "days": 25, "ndvi_range": [0.40, 0.60], "emoji": "🟡"},
        {"stage": "Harvest",      "days": 10, "ndvi_range": [0.10, 0.30], "emoji": "🚜"},
    ],
    "Maize": [
        {"stage": "Germination",  "days": 8,  "ndvi_range": [0.05, 0.15], "emoji": "🌱"},
        {"stage": "Seedling",     "days": 20, "ndvi_range": [0.20, 0.40], "emoji": "🌿"},
        {"stage": "Vegetative",   "days": 30, "ndvi_range": [0.55, 0.80], "emoji": "🌽"},
        {"stage": "Tasseling",    "days": 15, "ndvi_range": [0.70, 0.85], "emoji": "🌽"},
        {"stage": "Silking",      "days": 10, "ndvi_range": [0.65, 0.80], "emoji": "🌽"},
        {"stage": "Grain Fill",   "days": 35, "ndvi_range": [0.40, 0.65], "emoji": "🟡"},
        {"stage": "Harvest",      "days": 7,  "ndvi_range": [0.10, 0.30], "emoji": "🚜"},
    ],
    "Cotton": [
        {"stage": "Germination",  "days": 12, "ndvi_range": [0.05, 0.18], "emoji": "🌱"},
        {"stage": "Seedling",     "days": 25, "ndvi_range": [0.20, 0.40], "emoji": "🌿"},
        {"stage": "Squaring",     "days": 25, "ndvi_range": [0.45, 0.65], "emoji": "🌸"},
        {"stage": "Flowering",    "days": 30, "ndvi_range": [0.55, 0.75], "emoji": "🌸"},
        {"stage": "Boll Dev.",    "days": 40, "ndvi_range": [0.40, 0.60], "emoji": "☁️"},
        {"stage": "Harvest",      "days": 20, "ndvi_range": [0.10, 0.25], "emoji": "🚜"},
    ],
    "Sugarcane": [
        {"stage": "Germination",  "days": 30, "ndvi_range": [0.10, 0.25], "emoji": "🌱"},
        {"stage": "Tillering",    "days": 60, "ndvi_range": [0.35, 0.55], "emoji": "🌿"},
        {"stage": "Grand Growth", "days": 120,"ndvi_range": [0.60, 0.85], "emoji": "🎋"},
        {"stage": "Maturation",   "days": 60, "ndvi_range": [0.45, 0.65], "emoji": "🟡"},
        {"stage": "Harvest",      "days": 15, "ndvi_range": [0.15, 0.35], "emoji": "🚜"},
    ],
}
# Default fallback crop stages
CROP_STAGES["Wheat / Paddy"] = CROP_STAGES["Wheat"]
CROP_STAGES["Paddy"] = CROP_STAGES["Rice"]


# ── Pydantic models ─────────────────────────────────────────────────────────
class FieldCreate(BaseModel):
    name: str
    crop_type: str = "Wheat"
    sowing_date: Optional[str] = None          # ISO date string YYYY-MM-DD
    area_hectares: Optional[float] = None
    geojson: dict                               # GeoJSON Polygon Feature


class FieldUpdate(BaseModel):
    name: Optional[str] = None
    crop_type: Optional[str] = None
    sowing_date: Optional[str] = None
    area_hectares: Optional[float] = None
    geojson: Optional[dict] = None


# ── Persistence helpers ─────────────────────────────────────────────────────
def load_fields() -> List[dict]:
    if not os.path.exists(FIELDS_FILE):
        return []
    with open(FIELDS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_fields(fields: List[dict]) -> None:
    with open(FIELDS_FILE, "w", encoding="utf-8") as f:
        json.dump(fields, f, indent=2, ensure_ascii=False)


def get_centroid(geojson: dict) -> tuple[float, float]:
    """Compute rough centroid of a GeoJSON Polygon or Feature."""
    try:
        coords = geojson
        if coords.get("type") == "Feature":
            coords = coords["geometry"]
        ring = coords["coordinates"][0]
        lats = [c[1] for c in ring]
        lons = [c[0] for c in ring]
        return sum(lats) / len(lats), sum(lons) / len(lons)
    except Exception:
        return 13.0, 75.0


# ── NDVI simulation ─────────────────────────────────────────────────────────
def sim_ndvi(lat: float, lon: float, week_offset: int = 0) -> float:
    """Deterministic simulated NDVI for a coordinate + week offset."""
    val = 0.45 + 0.28 * math.sin(lat * 12.34 + lon * 56.78 + week_offset * 0.6)
    return round(max(0.05, min(0.92, val)), 4)


def sim_ndwi(lat: float, lon: float, week_offset: int = 0) -> float:
    val = 0.18 + 0.22 * math.cos(lat * 8.9 + lon * 12.3 + week_offset * 0.45)
    return round(max(-0.2, min(0.65, val)), 4)


# ── CRUD endpoints ──────────────────────────────────────────────────────────
@router.get("")
def list_fields():
    return load_fields()


@router.post("", status_code=201)
def create_field(body: FieldCreate):
    fields = load_fields()
    lat, lon = get_centroid(body.geojson)
    field = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "crop_type": body.crop_type,
        "sowing_date": body.sowing_date or date.today().isoformat(),
        "area_hectares": body.area_hectares,
        "geojson": body.geojson,
        "centroid": {"lat": round(lat, 4), "lon": round(lon, 4)},
        "created_at": datetime.now().isoformat(),
    }
    fields.append(field)
    save_fields(fields)
    return field


@router.get("/{field_id}")
def get_field(field_id: str):
    for f in load_fields():
        if f["id"] == field_id:
            return f
    raise HTTPException(404, "Field not found")


@router.put("/{field_id}")
def update_field(field_id: str, body: FieldUpdate):
    fields = load_fields()
    for f in fields:
        if f["id"] == field_id:
            if body.name is not None:         f["name"] = body.name
            if body.crop_type is not None:    f["crop_type"] = body.crop_type
            if body.sowing_date is not None:  f["sowing_date"] = body.sowing_date
            if body.area_hectares is not None: f["area_hectares"] = body.area_hectares
            if body.geojson is not None:
                f["geojson"] = body.geojson
                lat, lon = get_centroid(body.geojson)
                f["centroid"] = {"lat": round(lat, 4), "lon": round(lon, 4)}
            save_fields(fields)
            return f
    raise HTTPException(404, "Field not found")


@router.delete("/{field_id}", status_code=204)
def delete_field(field_id: str):
    fields = load_fields()
    new = [f for f in fields if f["id"] != field_id]
    if len(new) == len(fields):
        raise HTTPException(404, "Field not found")
    save_fields(new)
    return None


# ── NDVI/NDWI 12-week history ────────────────────────────────────────────────
@router.get("/{field_id}/ndvi-history")
def get_field_ndvi_history(field_id: str):
    field = None
    for f in load_fields():
        if f["id"] == field_id:
            field = f
            break
    if not field:
        raise HTTPException(404, "Field not found")

    lat  = field["centroid"]["lat"]
    lon  = field["centroid"]["lon"]
    today = date.today()
    series = []

    for w in range(12):
        week_date = today - timedelta(weeks=11 - w)
        ndvi = sim_ndvi(lat, lon, w)
        ndwi = sim_ndwi(lat, lon, w)
        series.append({
            "week": w + 1,
            "date": week_date.strftime("%b %d"),
            "ndvi": ndvi,
            "ndwi": ndwi,
        })

    # Compute simple linear trend (slope)
    ndvi_vals = [p["ndvi"] for p in series]
    n = len(ndvi_vals)
    x_mean = (n - 1) / 2
    y_mean = sum(ndvi_vals) / n
    slope_num = sum((i - x_mean) * (ndvi_vals[i] - y_mean) for i in range(n))
    slope_den = sum((i - x_mean) ** 2 for i in range(n)) or 1
    slope = round(slope_num / slope_den, 5)
    trend = "improving" if slope > 0.005 else ("declining" if slope < -0.005 else "stable")

    return {
        "field_id": field_id,
        "field_name": field["name"],
        "series": series,
        "trend": trend,
        "slope": slope,
        "current_ndvi": ndvi_vals[-1],
        "peak_ndvi": max(ndvi_vals),
    }


# ── Crop calendar ─────────────────────────────────────────────────────────────
@router.get("/{field_id}/calendar")
def get_field_calendar(field_id: str):
    field = None
    for f in load_fields():
        if f["id"] == field_id:
            field = f
            break
    if not field:
        raise HTTPException(404, "Field not found")

    crop = field.get("crop_type", "Wheat")
    stages_def = CROP_STAGES.get(crop, CROP_STAGES["Wheat"])

    try:
        sow = date.fromisoformat(field.get("sowing_date", date.today().isoformat()))
    except ValueError:
        sow = date.today()

    today = date.today()
    days_since_sow = (today - sow).days

    stages = []
    cursor = 0
    current_stage = None

    for s in stages_def:
        start_day  = cursor
        end_day    = cursor + s["days"]
        start_date = sow + timedelta(days=start_day)
        end_date   = sow + timedelta(days=end_day)

        is_current = start_day <= days_since_sow < end_day
        is_past    = days_since_sow >= end_day
        is_future  = days_since_sow < start_day

        stage_rec = {
            "stage":        s["stage"],
            "emoji":        s["emoji"],
            "start_day":    start_day,
            "end_day":      end_day,
            "duration_days":s["days"],
            "start_date":   start_date.isoformat(),
            "end_date":     end_date.isoformat(),
            "ndvi_range":   s["ndvi_range"],
            "status":       "current" if is_current else ("past" if is_past else "future"),
        }
        if is_current:
            current_stage = stage_rec
            stage_rec["days_remaining"] = end_day - days_since_sow

        stages.append(stage_rec)
        cursor = end_day

    total_days = cursor
    harvest_date = sow + timedelta(days=total_days)
    days_to_harvest = (harvest_date - today).days

    return {
        "field_id":       field_id,
        "field_name":     field["name"],
        "crop_type":      crop,
        "sowing_date":    sow.isoformat(),
        "harvest_date":   harvest_date.isoformat(),
        "days_since_sow": days_since_sow,
        "days_to_harvest":max(0, days_to_harvest),
        "total_days":     total_days,
        "current_stage":  current_stage,
        "stages":         stages,
    }
