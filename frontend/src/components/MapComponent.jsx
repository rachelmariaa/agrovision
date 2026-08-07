import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { getNdviColor } from '../services/api';
import { Loader2 } from 'lucide-react';

// ── NDVI field fill colours ──────────────────────────────────────────────────
function fieldColor(ndvi) {
  if (ndvi === null || ndvi === undefined) return '#10b981';
  if (ndvi < 0.2) return '#d97706';
  if (ndvi < 0.4) return '#84cc16';
  if (ndvi < 0.6) return '#22c55e';
  return '#166534';
}

export default function MapComponent({
  mapLayer, onMapClick, activeScan, loading,
  fields = [], onFieldDrawn, onFieldClick, drawingMode,
}) {
  const mapRef      = useRef(null);
  const leaflet     = useRef(null);
  const streetLayer = useRef(null);
  const satLayer    = useRef(null);
  const markerRef   = useRef(null);
  const drawnItems  = useRef(null);
  const drawControl = useRef(null);
  const fieldLayers = useRef({});   // fieldId → L.Polygon

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leaflet.current) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView([13, 75], 7);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const street = L.tileLayer(
      'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      { maxZoom: 19, attribution: '© OpenStreetMap contributors' }
    );
    const sat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Esri World Imagery' }
    );

    street.addTo(map);
    streetLayer.current = street;
    satLayer.current    = sat;
    leaflet.current     = map;

    // FeatureGroup that leaflet-draw stores drawn shapes into
    const drawn = new L.FeatureGroup();
    drawn.addTo(map);
    drawnItems.current = drawn;

    // Draw-created handler → lift to parent
    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      // Convert to GeoJSON Feature
      const geojson = {
        type: 'Feature',
        geometry: layer.toGeoJSON().geometry,
        properties: {},
      };
      if (onFieldDrawn) onFieldDrawn(geojson);
      // Don't keep it on the map — we'll render it via the `fields` prop
      drawn.clearLayers();
    });

    // Click on blank map → point scan (only when not in draw mode)
    map.on('click', (e) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      if (leaflet.current) { leaflet.current.remove(); leaflet.current = null; }
    };
  }, []);                         // eslint-disable-line react-hooks/exhaustive-deps

  // ── Toggle map layer ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = leaflet.current;
    if (!map) return;
    if (mapLayer === 'street') {
      if (satLayer.current)    map.removeLayer(satLayer.current);
      if (streetLayer.current) streetLayer.current.addTo(map);
    } else {
      if (streetLayer.current) map.removeLayer(streetLayer.current);
      if (satLayer.current)    satLayer.current.addTo(map);
    }
  }, [mapLayer]);

  // ── Toggle draw control ───────────────────────────────────────────────────
  useEffect(() => {
    const map = leaflet.current;
    if (!map) return;

    // Remove any existing draw control
    if (drawControl.current) {
      map.removeControl(drawControl.current);
      drawControl.current = null;
    }

    if (drawingMode) {
      const dc = new L.Control.Draw({
        draw: {
          polygon:   { shapeOptions: { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.25, weight: 2 } },
          polyline:  false,
          rectangle: false,
          circle:    false,
          circlemarker: false,
          marker:    false,
        },
        edit: { featureGroup: drawnItems.current, remove: false },
      });
      dc.addTo(map);
      drawControl.current = dc;

      // Auto-start the polygon tool
      new L.Draw.Polygon(map, dc.options.draw.polygon).enable();
    }
  }, [drawingMode]);

  // ── Render saved field polygons ──────────────────────────────────────────
  useEffect(() => {
    const map = leaflet.current;
    if (!map) return;

    // IDs currently rendered
    const renderedIds = new Set(Object.keys(fieldLayers.current));
    const currentIds  = new Set(fields.map(f => f.id));

    // Remove deleted fields
    renderedIds.forEach(id => {
      if (!currentIds.has(id)) {
        map.removeLayer(fieldLayers.current[id]);
        delete fieldLayers.current[id];
      }
    });

    // Add / update each field polygon
    fields.forEach(field => {
      const ndvi  = field.centroid_ndvi ?? null;
      const color = fieldColor(ndvi);

      if (fieldLayers.current[field.id]) {
        // Already rendered — remove and re-add to refresh style/tooltip
        map.removeLayer(fieldLayers.current[field.id]);
      }

      const geojson = field.geojson;
      if (!geojson) return;

      const layer = L.geoJSON(geojson, {
        style: {
          color,
          weight: 2.5,
          fillColor: color,
          fillOpacity: 0.2,
          dashArray: '4 4',
        },
      }).addTo(map);

      layer.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onFieldClick) onFieldClick(field);
      });

      layer.bindTooltip(`
        <div style="background:rgba(5,20,10,0.95);border:1px solid ${color};padding:8px 12px;border-radius:8px;color:#fff;text-align:center;">
          <div style="color:${color};font-weight:700;font-size:0.82rem;">${field.name}</div>
          <div style="color:#94a3b8;font-size:0.72rem;margin-top:2px;">${field.crop_type}</div>
          ${ndvi !== null ? `<div style="font-size:0.78rem;margin-top:4px;">NDVI <b style="color:${color};">${ndvi.toFixed(3)}</b></div>` : ''}
        </div>
      `, { permanent: false, direction: 'top', opacity: 1, className: 'field-tooltip' });

      fieldLayers.current[field.id] = layer;
    });
  }, [fields, onFieldClick]);

  // ── Active scan marker ────────────────────────────────────────────────────
  useEffect(() => {
    const map = leaflet.current;
    if (!map || !activeScan) return;

    const { lat, lon, ndvi, category } = activeScan;
    const hex = getNdviColor(ndvi);

    if (markerRef.current) map.removeLayer(markerRef.current);

    const popup = `
      <div style="background:#050f08;padding:12px;border-radius:10px;border:1px solid ${hex};color:#fff;text-align:center;min-width:140px;">
        <div style="color:${hex};font-size:0.82rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${category || 'Scan Point'}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:1.35rem;font-weight:800;margin-top:4px;color:${hex};">
          ${ndvi != null ? ndvi.toFixed(4) : 'N/A'}
        </div>
        <div style="font-size:0.73rem;color:#94a3b8;margin-top:4px;">${lat.toFixed(4)}°, ${lon.toFixed(4)}°</div>
      </div>
    `;

    const m = L.circleMarker([lat, lon], {
      radius: 13, color: '#fff', weight: 2,
      fillColor: hex, fillOpacity: 0.85,
    }).addTo(map).bindPopup(popup, { className: 'custom-popup' }).openPopup();

    markerRef.current = m;
  }, [activeScan]);

  return (
    <div style={{
      flex: 1, height: '100%', borderRadius: '20px', overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(16,185,129,0.25)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Draw mode badge */}
      {drawingMode && (
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid #10b981',
          borderRadius: '20px', padding: '6px 18px',
          color: '#10b981', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '1px',
          backdropFilter: 'blur(8px)',
          animation: 'glowPulse 2s ease-in-out infinite',
          pointerEvents: 'none',
        }}>
          ✏️ DRAW FIELD — Click to place polygon vertices, double-click to finish
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', zIndex: 1000,
          background: 'rgba(5,20,10,0.9)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(16,185,129,0.5)',
          borderRadius: '20px', padding: '18px 36px',
          color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 0 40px rgba(0,0,0,0.8)',
        }}>
          <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', color: '#10b981' }} />
          Scanning Coordinates & Telemetry...
        </div>
      )}
    </div>
  );
}
