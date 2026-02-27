import { useState, useEffect, useRef } from 'react';
import { DARK, CARD, BORDER, TEXT, MUTED, GOLD, GREEN } from '../../styles/tokens.js';
import { fmt, getStageColors, getStageLabel } from '../../engine/formatters.js';
import L from 'leaflet';

// Leaflet CSS injected at runtime (avoids bundler CSS import issues)
const LEAFLET_CSS_ID = 'bbi-leaflet-css';
function ensureLeafletCSS() {
  if (document.getElementById(LEAFLET_CSS_ID)) return;
  const link = document.createElement('link');
  link.id = LEAFLET_CSS_ID;
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  link.crossOrigin = '';
  document.head.appendChild(link);
}

// Nevada bounding box
const NV_CENTER = [38.8, -116.4];
const NV_BOUNDS = [[35.0, -120.0], [42.0, -114.0]];

// Custom circle marker factory
function makeMarker(company, stageColors, sl) {
  const sc = stageColors[company.stage] || '#706C64';
  const r = Math.max(6, Math.min(16, 6 + (company.momentum || 50) / 100 * 10));

  const marker = L.circleMarker([company.lat, company.lng], {
    radius: r,
    fillColor: sc,
    fillOpacity: 0.7,
    color: sc,
    weight: 1.5,
    opacity: 0.9,
  });

  const fundingStr = company.funding ? fmt(company.funding) : 'N/A';
  const mwStr = company.capacityMW ? `${company.capacityMW.toLocaleString()} MW` : '';
  const storageStr = company.storageMWh ? ` / ${company.storageMWh.toLocaleString()} MWh` : '';

  marker.bindPopup(`
    <div style="font-family:inherit;min-width:180px">
      <div style="font-weight:700;font-size:13px;margin-bottom:4px">${company.name}</div>
      <div style="font-size:10px;color:#888;margin-bottom:6px">${sl(company.stage)} · ${company.city || company.region || ''}</div>
      ${mwStr ? `<div style="font-size:11px;margin-bottom:2px"><b>Capacity:</b> ${mwStr}${storageStr}</div>` : ''}
      <div style="font-size:11px;margin-bottom:2px"><b>${company.capacityMW ? 'Investment' : 'Funding'}:</b> ${fundingStr}</div>
      <div style="font-size:11px;margin-bottom:2px"><b>Momentum:</b> ${company.momentum}/100</div>
      ${company.sector ? `<div style="font-size:10px;color:#888;margin-top:4px">${company.sector.join(' · ')}</div>` : ''}
    </div>
  `, { className: 'bbi-popup' });

  return marker;
}

export default function MapView({ viewProps }) {
  const {
    config, data, isMobile,
    setSelectedCompany, mapHover, setMapHover,
  } = viewProps;

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);
  const [filterStage, setFilterStage] = useState('all');

  const sc = getStageColors(config);
  const sl = getStageLabel(config);
  const L_labels = config?.labels || {};
  const COMPANIES = data.companies || [];

  // Initialize map
  useEffect(() => {
    ensureLeafletCSS();

    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: NV_CENTER,
      zoom: 7,
      minZoom: 6,
      maxZoom: 15,
      maxBounds: [[33.0, -122.0], [44.0, -112.0]],
      maxBoundsViscosity: 0.8,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark-themed tile layer (CartoDB Dark Matter — free, no API key)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Nevada state outline (simplified GeoJSON)
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(r => r.json())
      .then(geojson => {
        const nv = geojson.features.find(f =>
          f.properties.name === 'Nevada' || f.properties.NAME === 'Nevada'
        );
        if (nv) {
          L.geoJSON(nv, {
            style: {
              color: GOLD,
              weight: 2,
              fillColor: GOLD,
              fillOpacity: 0.03,
              dashArray: '4 4',
            },
          }).addTo(map);
        }
      })
      .catch(() => {
        // Fallback: no outline, map still works
      });

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Update markers when data or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    const filtered = filterStage === 'all'
      ? COMPANIES
      : COMPANIES.filter(c => c.stage === filterStage);

    filtered.forEach(c => {
      if (!c.lat || !c.lng) return;

      const marker = makeMarker(c, sc, sl);
      marker.addTo(map);

      marker.on('click', () => {
        setSelectedCompany(c);
      });

      marker.on('mouseover', () => {
        setMapHover(c.id);
        marker.setStyle({ weight: 3, fillOpacity: 0.95 });
      });

      marker.on('mouseout', () => {
        setMapHover(null);
        marker.setStyle({ weight: 1.5, fillOpacity: 0.7 });
      });

      markersRef.current[c.id] = marker;
    });
  }, [COMPANIES, mapReady, filterStage, sc]);

  // Highlight hovered marker from external source
  useEffect(() => {
    if (!mapReady) return;
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (id == mapHover) {
        marker.setStyle({ weight: 3, fillOpacity: 0.95 });
        marker.openPopup();
      } else {
        marker.setStyle({ weight: 1.5, fillOpacity: 0.7 });
      }
    });
  }, [mapHover, mapReady]);

  const stages = config?.stages?.list || [];
  const stageLabels = config?.stages?.labels || {};

  // Stats for current filter
  const filteredCompanies = filterStage === 'all'
    ? COMPANIES
    : COMPANIES.filter(c => c.stage === filterStage);
  const totalMW = filteredCompanies.reduce((s, c) => s + (c.capacityMW || 0), 0);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, color: TEXT }}>
            {L_labels.mapTitle || 'Nevada Map'}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {filteredCompanies.length} {L_labels.entityPlural?.toLowerCase() || 'entities'} mapped
            {totalMW > 0 ? ` · ${totalMW.toLocaleString()} MW total` : ''}
          </div>
        </div>
      </div>

      {/* Stage Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <button
          onClick={() => setFilterStage('all')}
          style={{
            background: filterStage === 'all' ? `${GOLD}25` : 'transparent',
            border: `1px solid ${filterStage === 'all' ? GOLD : BORDER}`,
            color: filterStage === 'all' ? GOLD : MUTED,
            borderRadius: 16, padding: '3px 10px', fontSize: 10, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          All ({COMPANIES.length})
        </button>
        {stages.map(s => {
          const count = COMPANIES.filter(c => c.stage === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setFilterStage(filterStage === s ? 'all' : s)}
              style={{
                background: filterStage === s ? `${sc[s] || MUTED}25` : 'transparent',
                border: `1px solid ${filterStage === s ? (sc[s] || MUTED) : BORDER}`,
                color: filterStage === s ? (sc[s] || MUTED) : MUTED,
                borderRadius: 16, padding: '3px 10px', fontSize: 10, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {stageLabels[s] || s} ({count})
            </button>
          );
        })}
      </div>

      {/* Map Container */}
      <div style={{
        borderRadius: 10,
        border: `1px solid ${BORDER}`,
        overflow: 'hidden',
        position: 'relative',
        height: isMobile ? 400 : 550,
      }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10,
        padding: '8px 12px', background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: 8,
      }}>
        {stages.map(s => {
          const count = COMPANIES.filter(c => c.stage === s).length;
          if (count === 0) return null;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: (sc[s] || MUTED) + '80',
                border: `1.5px solid ${sc[s] || MUTED}`,
              }} />
              <span style={{ fontSize: 10, color: MUTED }}>
                {stageLabels[s] || s} ({count})
              </span>
            </div>
          );
        })}
      </div>

      {/* Popup styling override for dark theme */}
      <style>{`
        .bbi-popup .leaflet-popup-content-wrapper {
          background: #1E1D1A;
          color: #E8E6E1;
          border-radius: 8px;
          border: 1px solid #3A3830;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .bbi-popup .leaflet-popup-tip {
          background: #1E1D1A;
          border: 1px solid #3A3830;
        }
        .bbi-popup .leaflet-popup-close-button {
          color: #706C64 !important;
        }
        .leaflet-control-zoom a {
          background: #1E1D1A !important;
          color: #E8E6E1 !important;
          border-color: #3A3830 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #2A2820 !important;
        }
        .leaflet-control-attribution {
          background: rgba(30,29,26,0.8) !important;
          color: #706C64 !important;
        }
        .leaflet-control-attribution a {
          color: #C49A38 !important;
        }
      `}</style>
    </div>
  );
}
