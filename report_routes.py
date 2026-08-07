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
    """Computes simulated satellite indices, weather and ML recommendations."""
    sim_ndvi = 0.45 + 0.25 * math.sin(lat * 12.34 + lon * 56.78)
    ndvi_val = round(max(0.1, min(0.9, sim_ndvi)), 4)

    sim_ndwi = 0.15 + 0.2 * math.cos(lat * 8.9 + lon * 12.3)
    ndwi_val = round(max(-0.2, min(0.6, sim_ndwi)), 4)

    temp_c = round(22 + 8 * math.sin(lat * 0.5), 1)
    wind_kmh = round(8 + 6 * abs(math.cos(lon * 0.3)), 1)
    precip_mm = round(max(0, 5 * math.cos(lat * 3.1 + lon * 1.7)), 1)
    soil_moisture = round(max(0.1, min(0.8, 0.3 + 0.2 * math.sin(lat + lon))), 2)

    try:
        rec_list = agro_ml.recommend_crops(ndvi_val, soil_moisture, precip_mm, temp_c, 0.5)
        top_crop = rec_list[0]["crop"] if rec_list else crop
        condition = agro_ml.predict_condition(ndvi_val, soil_moisture, precip_mm, temp_c, 0.5, top_crop)
        ml_advice = (
            f"AI Random Forest analysis recommends '{top_crop}' as the most suitable crop "
            f"with '{condition}' projected condition. "
            f"NDVI coverage is {ndvi_val:.3f}, soil moisture is {soil_moisture} m³/m³. "
            f"Temperature {temp_c}°C with {precip_mm} mm precipitation forecast."
        )
    except Exception as e:
        ml_advice = (
            f"NDVI index is {ndvi_val:.3f} and NDWI soil water index is {ndwi_val:.3f}. "
            f"Continue regular field monitoring and consult local agronomist."
        )

    return {
        "ndvi": ndvi_val,
        "ndwi": ndwi_val,
        "temperature_c": temp_c,
        "windspeed_kmh": wind_kmh,
        "rainfall_mm_forecast": precip_mm,
        "ml_recommendation": ml_advice,
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
