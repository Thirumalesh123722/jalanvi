import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZONES, GEOFENCES, COASTAL_BASE } from '../data/marineData';
import { ShieldAlert, Compass, Navigation, Waves, Wind, Layers, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function MarineMap({ activeZoneId, onSelectZone, activePlan, isOffline }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const [activeLayers, setActiveLayers] = useState({
    pfz: true,
    waves: true,
    wind: true,
    geofences: true,
    route: true,
  });
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [mapMode, setMapMode] = useState('opportunity'); // opportunity, safety, mission, changelog

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [17.40, 83.40],
        zoom: 9,
        minZoom: 7,
        maxZoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean Esri Ocean Basemap & Reference (100% watermark-free, no API key required)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; INCOIS &copy; Esri Ocean Topography',
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(map);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.9,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous dynamic layers
    Object.values(layersRef.current).forEach(layerGroup => {
      if (layerGroup) map.removeLayer(layerGroup);
    });
    layersRef.current = {};

    // 1. Geofences & Boundaries Layer
    if (activeLayers.geofences) {
      const geofenceGroup = L.layerGroup();
      GEOFENCES.forEach(fence => {
        if (fence.type === 'DEAD_ZONE_LINE' || fence.type === 'BORDER_CORRIDOR') {
          const polyline = L.polyline(fence.coordinates, {
            color: fence.color,
            weight: 3,
            dashArray: '8, 8',
            opacity: 0.85,
          });
          polyline.bindTooltip(`<b>${fence.name}</b><br/><span style="font-size:11px">${fence.advisory}</span>`, {
            permanent: false,
            className: 'marine-tooltip',
          });
          polyline.addTo(geofenceGroup);
        } else {
          const polygon = L.polygon(fence.coordinates, {
            color: fence.color,
            fillColor: fence.color,
            fillOpacity: fence.type === 'RESTRICTED_DEFENCE' ? 0.35 : 0.2,
            weight: 2,
            dashArray: fence.type === 'RESTRICTED_DEFENCE' ? '4, 4' : null,
          });
          polygon.bindTooltip(`<b>${fence.name}</b><br/><span style="color:#ef4444; font-weight:bold;">${fence.advisory}</span>`, {
            permanent: false,
            className: 'marine-tooltip',
          });
          polygon.addTo(geofenceGroup);
        }
      });
      geofenceGroup.addTo(map);
      layersRef.current.geofences = geofenceGroup;
    }

    // 2. Base Port / Harbour Marker
    const portIcon = L.divIcon({
      className: 'port-marker',
      html: `
        <div style="background:#0284c7; color:#fff; border:2px solid #fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(2,132,199,0.8);">
          ⚓
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const portMarker = L.marker([COASTAL_BASE.lat, COASTAL_BASE.lng], { icon: portIcon })
      .bindPopup(`<b>${COASTAL_BASE.portName}</b><br/>Base Port & Maritime Command Station`);
    portMarker.addTo(map);

    // 3. PFZ Zones Markers
    if (activeLayers.pfz) {
      const pfzGroup = L.layerGroup();
      ZONES.forEach(zone => {
        const isSelected = zone.id === activeZoneId;
        const color = zone.inRestrictedZone
          ? '#ef4444'
          : zone.opportunityScore > 85
            ? '#10b981'
            : '#f59e0b';

        // Outer pulse circle
        const circle = L.circle([zone.lat, zone.lng], {
          radius: 5500,
          color: color,
          fillColor: color,
          fillOpacity: isSelected ? 0.35 : 0.15,
          weight: isSelected ? 3 : 1.5,
          dashArray: zone.inRestrictedZone ? '5,5' : null,
        });

        circle.on('click', () => {
          onSelectZone(zone.id);
          setSelectedFeature(zone);
        });

        circle.addTo(pfzGroup);

        // Center Pin
        const markerIcon = L.divIcon({
          className: 'zone-marker',
          html: `
            <div style="background:${color}; color:#fff; border:2px solid #ffffff; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; box-shadow:0 0 12px ${color};">
              ${zone.id === 'zone-d' ? '🛑' : '🐟'}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([zone.lat, zone.lng], { icon: markerIcon });
        marker.on('click', () => {
          onSelectZone(zone.id);
          setSelectedFeature(zone);
        });
        marker.addTo(pfzGroup);
      });
      pfzGroup.addTo(map);
      layersRef.current.pfz = pfzGroup;
    }

    // 4. Mission Route & Safe Corridor
    if (activeLayers.route) {
      const activeZone = ZONES.find(z => z.id === activeZoneId) || ZONES[0];
      const routeGroup = L.layerGroup();

      // Waypoint trajectory
      const waypoints = [
        [COASTAL_BASE.lat, COASTAL_BASE.lng],
        [17.61, 83.45], // Safe navigation waypoint avoiding harbor shoals
        [activeZone.lat, activeZone.lng],
      ];

      const routeLine = L.polyline(waypoints, {
        color: activeZone.inRestrictedZone ? '#ef4444' : '#06b6d4',
        weight: 4,
        opacity: 0.9,
      });

      // Animated dashed return route
      const returnWaypoints = [
        [activeZone.lat, activeZone.lng],
        [17.65, 83.38],
        [COASTAL_BASE.lat, COASTAL_BASE.lng],
      ];

      const returnLine = L.polyline(returnWaypoints, {
        color: '#22c55e',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.8,
      });

      routeLine.bindTooltip(`<b>Outbound Safe Route</b>: ${activeZone.distanceKm} km`, { sticky: true });
      returnLine.bindTooltip(`<b>Return Safe Corridor</b>: ${activeZone.returnSafety}`, { sticky: true });

      routeLine.addTo(routeGroup);
      returnLine.addTo(routeGroup);

      // Active Vessel Location on route
      const vesselIcon = L.divIcon({
        className: 'vessel-marker',
        html: `
          <div style="position:relative;">
            <div style="background:#f97316; width:22px; height:22px; border-radius:50%; border:2px solid #fff; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px #f97316;">
              <span style="font-size:12px;">🚢</span>
            </div>
            <div style="position:absolute; top:-6px; left:-6px; width:34px; height:34px; border:2px solid #f97316; border-radius:50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity:0.6;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      L.marker([17.61, 83.45], { icon: vesselIcon })
        .bindPopup(`<b>Vessel: Matsya-Varuna (IND-AP-09)</b><br/>Speed: 8.5 kn • Heading: 125° • Fuel: 300L`)
        .addTo(routeGroup);

      routeGroup.addTo(map);
      layersRef.current.route = routeGroup;
    }

  }, [activeZoneId, activeLayers, mapMode]);

  const activeZone = ZONES.find(z => z.id === activeZoneId) || ZONES[0];

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Bar: Map Layers & Modes */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Layer Toggles */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/70 shadow-lg text-xs">
          <button
            onClick={() => setActiveLayers(p => ({ ...p, pfz: !p.pfz }))}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeLayers.pfz ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🐟</span> PFZ Zones
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, route: !p.route }))}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeLayers.route ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" /> Mission Route
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, geofences: !p.geofences }))}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeLayers.geofences ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Geofences
          </button>
        </div>

        {/* Satellite Sync Badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/70 shadow-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-mono">
            {isOffline ? 'OFFLINE CACHED TILES' : 'ISRO Oceansat-3 • INSAT-3DR LIVE'}
          </span>
        </div>
      </div>

      {/* Floating Bottom Card: Active Zone Intel */}
      <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-10 pointer-events-auto bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-2xl text-left">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{activeZone.code}</span>
              {activeZone.inRestrictedZone && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  RESTRICTED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Distance: <strong className="text-slate-200">{activeZone.distanceKm} km</strong> • Bearing: <strong className="text-slate-200">{activeZone.bearingDeg}°</strong>
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-emerald-400">{activeZone.opportunityScore}% Opp.</div>
            <div className="text-[11px] text-slate-400">Safety: {activeZone.safetyScore}%</div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Sea Surface Temp (SST)</span>
            <span className="font-semibold text-amber-300">{activeZone.sst}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Chlorophyll Concentration</span>
            <span className="font-semibold text-emerald-300">{activeZone.chlorophyll}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Significant Wave Height</span>
            <span className="font-semibold text-cyan-300">{activeZone.waveHeight}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Return Window</span>
            <span className="font-semibold text-purple-300">{activeZone.returnSafety}</span>
          </div>
        </div>

        {/* Rationale / Alert */}
        <div className={`p-2 rounded-lg text-xs ${
          activeZone.inRestrictedZone
            ? 'bg-rose-950/40 border border-rose-600/50 text-rose-300'
            : activeZone.whyNotReason
              ? 'bg-amber-950/40 border border-amber-600/50 text-amber-300'
              : 'bg-emerald-950/40 border border-emerald-600/50 text-emerald-300'
        }`}>
          {activeZone.inRestrictedZone ? (
            <div className="flex items-start gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{activeZone.whyNotReason}</span>
            </div>
          ) : activeZone.whyNotReason ? (
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{activeZone.whyNotReason}</span>
            </div>
          ) : (
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{activeZone.whyRecommended}</span>
            </div>
          )}
        </div>

        {/* Data Provenance Stamp */}
        <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Freshness: {activeZone.freshness}</span>
          <span>Depth: {activeZone.depth}</span>
        </div>
      </div>
    </div>
  );
}
