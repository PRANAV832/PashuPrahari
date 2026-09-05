import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockCases } from '../../data/mockCases';
import { THANE_COORDINATES } from '../../utils/constants';

// ── Geospatial distance helper (Haversine formula in meters) ────────────────────
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ── Outbreak Cluster Aggregator ─────────────────────────────────────────────────
// Consolidates nearby High / Critical cases into a single geofence outbreak zone
// while maintaining separate fences for geographically distinct outbreak areas.
const buildOutbreakClusters = (cases) => {
  const highCriticalCases = cases.filter((c) => {
    const r = (c.riskLevel || '').toUpperCase();
    const lat = typeof c.latitude === 'number' ? c.latitude : typeof c.lat === 'number' ? c.lat : null;
    const lng = typeof c.longitude === 'number' ? c.longitude : typeof c.lng === 'number' ? c.lng : null;
    return (r === 'CRITICAL' || r === 'HIGH') && lat !== null && lng !== null;
  });

  // Sort CRITICAL cases first so they serve as primary cluster seeds
  const sortedCases = [...highCriticalCases].sort((a, b) => {
    const isCritA = (a.riskLevel || '').toUpperCase() === 'CRITICAL' ? 1 : 0;
    const isCritB = (b.riskLevel || '').toUpperCase() === 'CRITICAL' ? 1 : 0;
    return isCritB - isCritA;
  });

  const rawClusters = [];

  for (const c of sortedCases) {
    const lat = typeof c.latitude === 'number' ? c.latitude : c.lat;
    const lng = typeof c.longitude === 'number' ? c.longitude : c.lng;
    const isCrit = (c.riskLevel || '').toUpperCase() === 'CRITICAL';

    let assigned = false;
    for (const cluster of rawClusters) {
      const distToCentroid = getDistanceMeters(lat, lng, cluster.centerLat, cluster.centerLng);
      // Group if within the cluster's surveillance radius
      if (distToCentroid <= cluster.radiusMeters) {
        cluster.cases.push(c);
        if (isCrit) {
          cluster.hasCritical = true;
          cluster.radiusMeters = 5000;
        }
        // Update centroid to weighted center of all cases in cluster
        cluster.centerLat =
          cluster.cases.reduce((sum, item) => sum + (typeof item.latitude === 'number' ? item.latitude : item.lat), 0) /
          cluster.cases.length;
        cluster.centerLng =
          cluster.cases.reduce((sum, item) => sum + (typeof item.longitude === 'number' ? item.longitude : item.lng), 0) /
          cluster.cases.length;
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      rawClusters.push({
        id: `CLUSTER-${c.id || c._id || Math.random()}`,
        centerLat: lat,
        centerLng: lng,
        hasCritical: isCrit,
        radiusMeters: isCrit ? 5000 : 3500,
        cases: [c],
      });
    }
  }

  return rawClusters.map((cl, index) => {
    const isCritical = cl.hasCritical;
    const totalAffected = cl.cases.reduce((sum, item) => sum + (Number(item.affectedAnimals) || 1), 0);
    const totalDeaths = cl.cases.reduce((sum, item) => sum + (Number(item.deaths) || 0), 0);
    const villages = [...new Set(cl.cases.map((item) => item.village).filter(Boolean))];
    const primaryVillage = villages[0] || 'Surveillance Sector';
    const title =
      villages.length > 1
        ? `${primaryVillage} & Surrounding Zone`
        : `${primaryVillage} Outbreak Vicinity`;

    return {
      id: `outbreak-cluster-${index}-${cl.centerLat.toFixed(4)}-${cl.centerLng.toFixed(4)}`,
      center: [cl.centerLat, cl.centerLng],
      radius: cl.radiusMeters,
      isCritical,
      riskLevel: isCritical ? 'CRITICAL' : 'HIGH',
      caseCount: cl.cases.length,
      villages,
      title,
      totalAffected,
      totalDeaths,
      cases: cl.cases,
    };
  });
};

// ── Risk colour palette ────────────────────────────────────────────────────────
const RISK_CONFIG = {
  CRITICAL: {
    pin: '#ef4444',       // red-500
    ring: '#fca5a5',      // red-300
    badge: 'background:#fef2f2;color:#b91c1c;border:1px solid #fca5a5',
    pulse: true,
  },
  HIGH: {
    pin: '#f59e0b',       // amber-500
    ring: '#fcd34d',      // amber-300
    badge: 'background:#fffbeb;color:#b45309;border:1px solid #fcd34d',
    pulse: false,
  },
  MODERATE: {
    pin: '#eab308',       // yellow-500
    ring: '#fde68a',      // yellow-200
    badge: 'background:#fefce8;color:#854d0e;border:1px solid #fde68a',
    pulse: false,
  },
  LOW: {
    pin: '#10b981',       // emerald-500
    ring: '#6ee7b7',      // emerald-300
    badge: 'background:#ecfdf5;color:#065f46;border:1px solid #6ee7b7',
    pulse: false,
  },
};

const STATUS_LABELS = {
  REPORTED:            'Reported',
  AI_ASSESSED:         'AI Assessed',
  UNDER_INVESTIGATION: 'Under Investigation',
  SUSPECTED:           'Suspected',
  CONFIRMED:           'Confirmed',
  RESPONSE:            'Response Deployed',
  MONITORING:          'Monitoring',
  RESOLVED:            'Resolved',
};

// ── DivIcon Factory ───────────────────────────────────────────────────────────
const makeIcon = (riskLevel, isAssignedToCurrentVet = false) => {
  const riskKey = (riskLevel || 'LOW').toUpperCase();
  const cfg = RISK_CONFIG[riskKey] ?? RISK_CONFIG.LOW;

  const pulseRing = cfg.pulse
    ? `<span style="
        position:absolute;top:-5px;left:-5px;
        width:30px;height:30px;
        border-radius:50%;
        background:${cfg.pin};
        opacity:0.4;
        animation:leaflet-pulse 1.4s ease-out infinite;
      "></span>`
    : '';

  const assignedMarker = isAssignedToCurrentVet
    ? `<span style="
        position:absolute;top:-8px;right:-8px;
        width:14px;height:14px;
        border-radius:50%;
        background:#059669;
        color:#fff;
        font-size:9px;
        font-weight:900;
        display:flex;
        align-items:center;
        justify-content:center;
        border:2px solid #fff;
        z-index:2;
      ">✓</span>`
    : '';

  const html = `
    <div style="position:relative;width:22px;height:22px;">
      ${pulseRing}
      ${assignedMarker}
      <div style="
        width:22px;height:22px;
        border-radius:50%;
        background:${cfg.pin};
        border:3px solid #ffffff;
        box-shadow:0 2px 8px rgba(0,0,0,0.35),0 0 0 2px ${cfg.ring};
        position:relative;z-index:1;
      "></div>
    </div>`;

  return L.divIcon({
    html,
    className: '',
    iconSize:  [22, 22],
    iconAnchor:[11, 11],
    popupAnchor: [0, -16],
  });
};

// ── Popup HTML Builder ────────────────────────────────────────────────────────
const popupHtml = (c, context = 'ADMIN') => {
  const riskKey = (c.riskLevel || 'LOW').toUpperCase();
  const cfg = RISK_CONFIG[riskKey] ?? RISK_CONFIG.LOW;
  const statusKey = (c.status || 'REPORTED').toUpperCase().replace(/\s+/g, '_');
  const lbl = STATUS_LABELS[statusKey] ?? c.statusLabel ?? c.status ?? 'Reported';
  const caseId = c.id || c._id || 'CASE-UNKNOWN';
  const actionLink =
    context === 'VETERINARIAN'
      ? `/veterinarian/cases/${caseId}`
      : `/admin/cases/${caseId}`;

  const actionText =
    context === 'VETERINARIAN'
      ? 'Open Clinical Investigation ➔'
      : (c.assignedVet ? `Assigned: ${c.assignedVet}` : 'Assign Veterinarian ➔');

  return `
    <div style="font-family:Inter,system-ui,sans-serif;min-width:210px;max-width:250px;color:#0f172a;line-height:1.4">
      
      <!-- Top Row: Case ID & Risk Badge -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-family:monospace;font-size:11px;font-weight:800;color:#334155;background:#f1f5f9;padding:2px 7px;border-radius:6px;border:1px solid #cbd5e1">${caseId}</span>
        <span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;${cfg.badge}">${c.riskLevel || 'LOW'} (${c.riskScore || 75})</span>
      </div>

      <!-- Farmer & Location -->
      <div style="margin-bottom:8px">
        <p style="margin:0;font-size:13px;font-weight:800;color:#0f172a">${c.farmerName || 'Farmer'}</p>
        <p style="margin:0;font-size:11px;color:#64748b;font-weight:500">${c.village || 'Village'}</p>
      </div>

      <!-- Detail Table -->
      <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px">
        <tr style="border-top:1px solid #f1f5f9">
          <td style="padding:4px 0;color:#64748b;font-weight:600">Species:</td>
          <td style="padding:4px 0;color:#0f172a;font-weight:700;text-align:right">${c.species || 'Livestock'}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9">
          <td style="padding:4px 0;color:#64748b;font-weight:600">Status:</td>
          <td style="padding:4px 0;color:#0f172a;font-weight:700;text-align:right">${lbl}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9">
          <td style="padding:4px 0;color:#64748b;font-weight:600">Affected:</td>
          <td style="padding:4px 0;color:#0f172a;font-weight:700;text-align:right">${c.affectedAnimals || 1} head · ${c.deaths || 0} dead</td>
        </tr>
      </table>

      <!-- Action Button -->
      <a
        href="${actionLink}"
        style="
          display:block;width:100%;box-sizing:border-box;text-align:center;
          padding:6px 0;border-radius:8px;font-size:11px;font-weight:800;
          background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;
          text-decoration:none;
        "
      >${actionText}</a>

    </div>`;
};

/**
 * MapView — Reusable React Leaflet map supporting ADMIN and VETERINARIAN operational contexts.
 *
 * Props:
 *   cases {Array} – Array of case items
 *   context {String} – 'ADMIN' | 'VETERINARIAN'
 *   activeVetName {String} – Filter / highlight for assigned cases in Vet mode
 *   showClusters {Boolean} – Whether to render pre-assigned outbreak geofence indicators
 */
export const MapView = ({
  cases = mockCases,
  context = 'ADMIN',
  activeVetName = 'Dr. Anand Deshmukh',
  showClusters = true,
}) => {
  const center = [THANE_COORDINATES.lat, THANE_COORDINATES.lng];
  const zoom = 10;

  // Consolidate nearby High/Critical cases into unified geographic outbreak zones
  const outbreakClusters = useMemo(() => buildOutbreakClusters(cases), [cases]);

  return (
    <div
      style={{ height: '420px', width: '100%' }}
      className="relative z-0 isolate rounded-2xl overflow-hidden border border-slate-200 shadow-xs"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
        scrollWheelZoom={true}
        attributionControl={true}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />

        {/* ── Consolidated Outbreak Geofences (Grouped by geographic proximity) ── */}
        {showClusters &&
          outbreakClusters.map((cluster) => {
            const isCritical = cluster.isCritical;
            const color = isCritical ? '#ef4444' : '#f59e0b';

            return (
              <Circle
                key={cluster.id}
                center={cluster.center}
                radius={cluster.radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.14,
                  weight: 2,
                  dashArray: '6, 6',
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '11px', color: '#0f172a', minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '4px' }}>
                      <span
                        style={{
                          background: isCritical ? '#fee2e2' : '#fef3c7',
                          color: isCritical ? '#991b1b' : '#92400e',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        OUTBREAK GEOFENCE ({cluster.riskLevel})
                      </span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                        {cluster.caseCount} {cluster.caseCount === 1 ? 'Case' : 'Cases'} Consolidated
                      </span>
                    </div>
                    <strong style={{ fontSize: '12px', display: 'block', color: '#0f172a', marginBottom: '2px' }}>
                      {cluster.title}
                    </strong>
                    <p style={{ margin: '3px 0', color: '#475569' }}>
                      Center: {cluster.center[0].toFixed(4)}°N, {cluster.center[1].toFixed(4)}°E · Radius: {(cluster.radius / 1000).toFixed(1)} km
                    </p>
                    <p style={{ margin: '2px 0', color: '#0f172a', fontWeight: 700 }}>
                      Total Impact: {cluster.totalAffected} Affected · {cluster.totalDeaths} Dead
                    </p>
                    {cluster.villages.length > 0 && (
                      <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '10px', lineHeight: 1.3 }}>
                        <strong>Villages:</strong> {cluster.villages.slice(0, 3).join(', ')}
                        {cluster.villages.length > 3 ? ` (+${cluster.villages.length - 3} more)` : ''}
                      </p>
                    )}
                  </div>
                </Popup>
              </Circle>
            );
          })}

        {/* ── Case Incident Markers ── */}
        {cases.map((c) => {
          const caseId = c.id || c._id || `CASE-${Math.random()}`;
          const lat = typeof c.latitude === 'number' ? c.latitude : typeof c.lat === 'number' ? c.lat : null;
          const lng = typeof c.longitude === 'number' ? c.longitude : typeof c.lng === 'number' ? c.lng : null;

          if (lat === null || lng === null) return null;

          const isAssignedToThisVet =
            context === 'VETERINARIAN' &&
            c.assignedVet &&
            c.assignedVet.toLowerCase().includes(activeVetName.toLowerCase());

          return (
            <Marker
              key={caseId}
              position={[lat, lng]}
              icon={makeIcon(c.riskLevel, isAssignedToThisVet)}
            >
              <Popup minWidth={210} maxWidth={260} closeButton={true}>
                <div dangerouslySetInnerHTML={{ __html: popupHtml(c, context) }} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Pulse Keyframe Animation */}
      <style>{`
        @keyframes leaflet-pulse {
          0%   { transform: scale(1);   opacity: 0.4; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
      `}</style>
    </div>
  );
};
