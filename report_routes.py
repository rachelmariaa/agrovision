"""
report_routes.py — AgroVision PDF Report API Router

Provides endpoints to download PDF crop condition reports for fields or map coordinates.
Integrated with AgroVision's simulated NDVI, Weather, Soil, and ML modules.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from io import BytesIO
import math

from report_service import build_crop_report_pdf
from ml_model import agro_ml

router = APIRouter(tags=["reports"])


def compute_telemetry_for_point(lat: float, lon: float, crop: str = "Wheat"):
    """Computes simulated satellite indices, weather and ML recommendations with location variation."""
    
    # Enhanced NDVI calculation with more variation based on lat/lon
    base_ndvi = 0.45 + 0.2 * math.sin(lat * 12.34 + lon * 56.78)
    variation = 0.15 * math.cos(lat * 23.45 - lon * 34.56)
    sim_ndvi = base_ndvi + variation
    ndvi_val = round(max(0.1, min(0.9, sim_ndvi)), 4)

    # Enhanced NDWI with more geographic variation
    base_ndwi = 0.15 + 0.15 * math.cos(lat * 8.9 + lon * 12.3)
    ndwi_variation = 0.1 * math.sin(lat * 15.2 - lon * 8.7)
    sim_ndwi = base_ndwi + ndwi_variation
    ndwi_val = round(max(-0.2, min(0.6, sim_ndwi)), 4)

    # Temperature varies significantly with latitude (cooler in north, warmer in south for India)
    base_temp = 32 - (lat - 10) * 0.8  # Cooler as you go north
    temp_variation = 5 * math.sin(lon * 2.1 + lat * 1.3)
    temp_c = round(max(15, min(42, base_temp + temp_variation)), 1)
    
    # Wind speed varies with coastal proximity and terrain
    wind_base = 10 + 4 * abs(math.cos(lon * 0.47))
    wind_var = 3 * math.sin(lat * 3.2 + lon * 1.8)
    wind_kmh = round(max(2, min(25, wind_base + wind_var)), 1)
    
    # Precipitation varies significantly by region
    # Coastal and southern regions get more rain
    rain_base = 8 + 15 * abs(math.cos(lat * 2.1 + lon * 3.7))
    rain_var = 10 * math.sin(lat * 4.5 - lon * 2.3)
    precip_mm = round(max(0, min(150, rain_base + rain_var)), 1)
    
    # Soil moisture correlates with precipitation and NDWI
    moisture_base = 0.25 + 0.25 * math.sin(lat * 1.8 + lon * 2.3)
    moisture_var = 0.15 * (ndwi_val + 0.2) / 0.8  # Related to NDWI
    soil_moisture = round(max(0.1, min(0.85, moisture_base + moisture_var)), 2)

    # Determine soil condition based on location with more variation
    soil_ph_base = 6.8 + 1.2 * math.sin(lat * 2.1 + lon * 1.3)
    soil_ph_var = 0.5 * math.cos(lat * 3.7 - lon * 2.1)
    soil_ph = round(max(4.5, min(8.5, soil_ph_base + soil_ph_var)), 1)
    
    if soil_ph < 5.5:
        soil_type = "Acidic Soil (Low pH)"
    elif soil_ph < 6.2:
        soil_type = "Slightly Acidic Soil"
    elif soil_ph < 7.3:
        soil_type = "Neutral Soil"
    elif soil_ph < 7.8:
        soil_type = "Slightly Alkaline Soil"
    else:
        soil_type = "Alkaline Soil (High pH)"

    # Get location name from coordinates (improved region detection for India)
    if 8 <= lat <= 13 and 74 <= lon <= 78:
        region = "Karnataka Region"
    elif 13 <= lat <= 18 and 77 <= lon <= 81:
        region = "Telangana/Andhra Pradesh Region"
    elif 18 <= lat <= 22 and 73 <= lon <= 77:
        region = "Maharashtra Region"
    elif 8 <= lat <= 13 and 76 <= lon <= 80:
        region = "Tamil Nadu Region"
    elif 23 <= lat <= 27 and 85 <= lon <= 88:
        region = "Bihar/West Bengal Region"
    elif 28 <= lat <= 32 and 74 <= lon <= 77:
        region = "Punjab/Haryana Region"
    elif 21 <= lat <= 26 and 68 <= lon <= 74:
        region = "Gujarat Region"
    elif 15 <= lat <= 20 and 73 <= lon <= 77:
        region = "Goa/North Karnataka Region"
    elif 24 <= lat <= 28 and 80 <= lon <= 85:
        region = "Uttar Pradesh Region"
    else:
        region = f"Location {lat:.2f}°N, {lon:.2f}°E"

    try:
        rec_list = agro_ml.recommend_crops(ndvi_val, soil_moisture, precip_mm, temp_c, 0.5)
        top_crop = rec_list[0]["crop"] if rec_list else crop
        top_crops = [rec["crop"] for rec in rec_list[:3]] if len(rec_list) >= 3 else [top_crop]
        
        condition = agro_ml.predict_condition(ndvi_val, soil_moisture, precip_mm, temp_c, 0.5, top_crop)
        
        # Simplified recommendation in plain English
        if condition == "Excellent":
            cond_msg = "excellent growth potential"
        elif condition == "Good":
            cond_msg = "good growth conditions"
        elif condition == "Fair":
            cond_msg = "moderate growth conditions"
        else:
            cond_msg = "challenging conditions - needs attention"
        
        ml_advice = (
            f"Location Analysis for {region}: Based on satellite and weather data analysis, "
            f"this area is best suited for growing: {', '.join(top_crops)}. "
            f"The '{top_crop}' crop shows {cond_msg}. "
            f"Current conditions: Temperature is {temp_c}°C, rainfall forecast is {precip_mm}mm, "
            f"and soil moisture level is {int(soil_moisture * 100)}%. "
            f"Soil characteristics: {soil_type} with pH {soil_ph}."
        )
    except Exception as e:
        ml_advice = (
            f"Location: {region}. Current conditions: Temperature {temp_c}°C with {precip_mm}mm rainfall forecast. "
            f"Soil: {soil_type} (pH {soil_ph}), moisture level {int(soil_moisture * 100)}%. "
            f"Please consult local agricultural experts for personalized crop recommendations."
        )

    return {
        "ndvi": ndvi_val,
        "ndwi": ndwi_val,
        "temperature_c": temp_c,
        "windspeed_kmh": wind_kmh,
        "rainfall_mm_forecast": precip_mm,
        "ml_recommendation": ml_advice,
        "location_name": region,
        "soil_type": soil_type,
        "soil_ph": soil_ph,
    }


@router.get("/fields/{field_id}/report")
def download_field_report(field_id: str, lang: str = Query("en", description="Farmer Language Code")):
    """Generates PDF crop report for a specific field ID."""
    field = {
        "farmer_name": "Field Manager",
        "field_name": f"Field #{field_id}",
        "crop_type": "Wheat",
        "area_hectares": 2.5,
        "latitude": 13.0,
        "longitude": 75.0,
    }

    telemetry = compute_telemetry_for_point(field["latitude"], field["longitude"], field["crop_type"])
    field_data = {**field, **telemetry, "report_date": datetime.now()}

    pdf_bytes = build_crop_report_pdf(field_data, lang=lang)
    filename = f"AgroVision_Field{field_id}_report_{datetime.now().strftime('%Y%m%d')}.pdf"

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/report")
def download_coordinate_report(
    lat: float = Query(..., description="Latitude of scan point"),
    lon: float = Query(..., description="Longitude of scan point"),
    crop: str = Query("Wheat", description="Target Crop"),
    farmer: str = Query("Guest Farmer", description="Farmer Name"),
    field_name: str = Query("Scan Point", description="Field label"),
    lang: str = Query("en", description="Farmer Language Code"),
):
    """Generates PDF crop report dynamically for given map coordinates in farmer's language."""
    telemetry = compute_telemetry_for_point(lat, lon, crop)
    
    # Check if this is a water body or non-vegetated area (NDVI < 0.1)
    if telemetry["ndvi"] < 0.1:
        raise HTTPException(
            status_code=400,
            detail="Cannot generate crop report for water bodies or non-vegetated areas (NDVI < 0.1). Please select a vegetated location."
        )

    field_data = {
        "farmer_name": farmer,
        "field_name": field_name,
        "crop_type": crop,
        "area_hectares": 1.5,
        "latitude": lat,
        "longitude": lon,
        **telemetry,
        "report_date": datetime.now(),
    }

    pdf_bytes = build_crop_report_pdf(field_data, lang=lang)
    # Strip ALL characters that break Content-Disposition header
    safe = (
        field_name
        .replace(" ", "_")
        .replace("/", "-")
        .replace("(", "").replace(")", "")
        .replace(",", "")
        .replace(";", "")
        .replace('"', "")
    )
    filename = f"AgroVision_{safe}_{lat:.2f}_{lon:.2f}_{datetime.now().strftime('%Y%m%d')}.pdf"

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
