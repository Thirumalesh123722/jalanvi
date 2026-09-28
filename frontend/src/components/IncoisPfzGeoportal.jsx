import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  INCOIS_SECTORS, INCOIS_LANDING_CENTRES, 
  INCOIS_PFZ_ADVISORIES, INDIA_EEZ_BOUNDARY, 
  BATHYMETRY_CONTOURS 
} from '../data/incoisData';
import { 
  Layers, Ruler, Printer, Compass, MapPin, 
  Eye, EyeOff, Info, Check, ChevronRight, X, 
  Crosshair, ShieldAlert, Waves, Download, FileText 
} from 'lucide-react';

export default function IncoisPfzGeoportal({ onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});

  // Layer Toggles matching exact INCOIS Geoportal checkboxes
  const [activeLayers, setActiveLayers] = useState({
    sst: true,
    chlorophyll: true,
    pfzLines: true,
    eez: true,
    sectors: true,
    landingCentres: true,
    bathymetry: true,
  });

  const [basemapType, setBasemapType] = useState('esriImagery'); // 'esriImagery' | 'cartoDark' | 'esriStreet' | 'topo'
  const [selectedSectorId, setSelectedSectorId] = useState('ap');
  const [selectedAdvisory, setSelectedAdvisory] = useState(INCOIS_PFZ_ADVISORIES[0]);
  const [mouseCoords, setMouseCoords] = useState({ lat: 17.698, lng: 83.304 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measuredDistance, setMeasuredDistance] = useState(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on India / Bay of Bengal (matching INCOIS default)
    const map = L.map(mapContainerRef.current, {
      center: [16.5, 82.5],
      zoom: 6.5,
      minZoom: 5,
      maxZoom: 16,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Mousemove coordinate tracking
    map.on('mousemove', (e) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
      });
    });

    // Distance measure click handler
    map.on('click', (e) => {
      // In measure mode, record points
      setMeasurePoints(prev => {
        if (prev.length >= 2) return [e.latlng];
        const updated = [...prev, e.latlng];
        if (updated.length === 2) {
          const p1 = updated[0];
          const p2 = updated[1];
          const distMeters = map.distance(p1, p2);
          const distKm = (distMeters / 1000).toFixed(2);
          const distNm = (distMeters / 1852).toFixed(2);

          // Calculate initial bearing
          const y = Math.sin((p2.lng - p1.lng) * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180);
          const x = Math.cos(p1.lat * Math.PI / 180) * Math.sin(p2.lat * Math.PI / 180) -
                    Math.sin(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * Math.cos((p2.lng - p1.lng) * Math.PI / 180);
          let bearing = Math.atan2(y, x) * 180 / Math.PI;
          bearing = (bearing + 360) % 360;

          setMeasuredDistance({
            km: distKm,
            nm: distNm,
            bearing: Math.round(bearing),
          });
        }
        return updated;
      });
    });

    mapInstanceRef.current = map;
  }, []);

  // Update Basemap & Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Basemap Layer Management
    if (layersRef.current.basemap) {
      map.removeLayer(layersRef.current.basemap);
      layersRef.current.basemap = null;
    }
    if (layersRef.current.basemapLabels) {
      map.removeLayer(layersRef.current.basemapLabels);
      layersRef.current.basemapLabels = null;
    }

    let baseTileLayer;
    let labelTileLayer = null;

    if (basemapType === 'esriImagery') {
      baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri World Imagery | INCOIS Geoportal',
        maxZoom: 18,
      });
      labelTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.85
      });
    } else if (basemapType === 'cartoDark' || basemapType === 'esriDark') {
      baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri Dark Canvas | INCOIS Geoportal',
        maxZoom: 18,
      });
      labelTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.95
      });
    } else if (basemapType === 'topo') {
      baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri Ocean & Bathymetry | INCOIS Geoportal',
        maxZoom: 18,
      });
      labelTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.9
      });
    } else {
      baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri Street Map | INCOIS Geoportal',
        maxZoom: 18,
      });
    }
    baseTileLayer.addTo(map);
    layersRef.current.basemap = baseTileLayer;

    if (labelTileLayer) {
      labelTileLayer.addTo(map);
      layersRef.current.basemapLabels = labelTileLayer;
    }

    // Remove existing overlays
    ['eez', 'bathymetry', 'landingCentres', 'pfzLines', 'measureLine'].forEach(key => {
      if (layersRef.current[key]) {
        map.removeLayer(layersRef.current[key]);
        layersRef.current[key] = null;
      }
    });

    // 1. EEZ (Exclusive Economic Zone 200 NM)
    if (activeLayers.eez) {
      const eezLine = L.polyline(INDIA_EEZ_BOUNDARY, {
        color: '#dc2626',
        weight: 2.5,
        dashArray: '8, 8',
        opacity: 0.9,
      }).bindTooltip('<b>India Exclusive Economic Zone (EEZ - 200 NM)</b>', { sticky: true, className: 'marine-tooltip' });
      eezLine.addTo(map);
      layersRef.current.eez = eezLine;
    }

    // 2. GEBCO Bathymetry Contours
    if (activeLayers.bathymetry) {
      const bathyGroup = L.layerGroup();
      BATHYMETRY_CONTOURS.forEach(contour => {
        L.polyline(contour.coordinates, {
          color: contour.color,
          weight: contour.weight,
          dashArray: contour.dashArray || null,
          opacity: 0.85,
        }).bindTooltip(`<b>Bathymetry Depth Contour: ${contour.depth}</b>`, { sticky: true, className: 'marine-tooltip' })
          .addTo(bathyGroup);
      });
      bathyGroup.addTo(map);
      layersRef.current.bathymetry = bathyGroup;
    }

    // 3. Landing Centres
    if (activeLayers.landingCentres) {
      const landingGroup = L.layerGroup();
      INCOIS_LANDING_CENTRES.forEach(centre => {
        const marker = L.circleMarker([centre.lat, centre.lng], {
          radius: 6,
          color: '#ffffff',
          fillColor: '#0284c7',
          fillOpacity: 1,
          weight: 2,
        });

        marker.bindPopup(`
          <div style="font-family:sans-serif; text-align:left;">
            <b style="color:#0284c7; font-size:13px;">${centre.name}</b><br/>
            <span style="font-size:11px; color:#555;">Sector: ${centre.sector}</span><br/>
            <span style="font-size:11px; color:#555;">Active Fishing Craft: <b>${centre.craftCount}</b></span><br/>
            <span style="font-size:10px; color:#777;">Coordinates: ${centre.lat.toFixed(3)}°N, ${centre.lng.toFixed(3)}°E</span>
          </div>
        `);

        marker.on('click', () => {
          const matchingAdvisory = INCOIS_PFZ_ADVISORIES.find(a => a.centreId === centre.id);
          if (matchingAdvisory) setSelectedAdvisory(matchingAdvisory);
        });

        marker.addTo(landingGroup);
      });
      landingGroup.addTo(map);
      layersRef.current.landingCentres = landingGroup;
    }

    // 4. PFZ Advisory Vector Lines & Zones (PFZ_LINES)
    if (activeLayers.pfzLines) {
      const pfzGroup = L.layerGroup();
      INCOIS_PFZ_ADVISORIES.forEach(adv => {
        // Vector polygon
        const polygon = L.polygon(adv.polyCoords, {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.35,
          weight: 2,
        });

        polygon.bindTooltip(`
          <div style="text-align:left;">
            <b style="color:#10b981;">PFZ Advisory: ${adv.centreName}</b><br/>
            <span>Direction: <b>${adv.bearing}</b> (${adv.distanceKm} km)</span><br/>
            <span>Depth: <b>${adv.depthMeters}</b></span>
          </div>
        `, { className: 'marine-tooltip' });

        polygon.on('click', () => setSelectedAdvisory(adv));
        polygon.addTo(pfzGroup);

        // Vector line from landing centre to PFZ
        const matchingCentre = INCOIS_LANDING_CENTRES.find(c => c.id === adv.centreId);
        if (matchingCentre) {
          const vectorLine = L.polyline([
            [matchingCentre.lat, matchingCentre.lng],
            [adv.lat, adv.lng],
          ], {
            color: '#38bdf8',
            weight: 2,
            dashArray: '5, 6',
            opacity: 0.8,
          });

          vectorLine.bindTooltip(`<b>PFZ Bearing: ${adv.bearing} • ${adv.distanceKm} km</b>`, { sticky: true, className: 'marine-tooltip' });
          vectorLine.addTo(pfzGroup);
        }
      });
      pfzGroup.addTo(map);
      layersRef.current.pfzLines = pfzGroup;
    }

  }, [activeLayers, basemapType]);

  // Measurement Ruler Overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.measureLine) {
      map.removeLayer(layersRef.current.measureLine);
      layersRef.current.measureLine = null;
    }

    if (measurePoints.length === 2) {
      const line = L.polyline(measurePoints, {
        color: '#f59e0b',
        weight: 3,
        dashArray: '4, 6',
      }).addTo(map);
      layersRef.current.measureLine = line;
    }
  }, [measurePoints]);

  // Jump to Sector
  const handleSelectSector = (sectorId) => {
    setSelectedSectorId(sectorId);
    const sec = INCOIS_SECTORS.find(s => s.id === sectorId);
    if (sec && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(sec.center, sec.zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070d18] text-slate-100 font-sans overflow-hidden text-left z-50 fixed inset-0">
      {/* 1. Official INCOIS Geoportal Top Navigation Bar */}
      <header className="h-14 bg-[#111827] border-b border-[#1f2937] px-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇳</span>
            <div className="border-l border-slate-700 pl-2.5">
              <h1 className="text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-2 m-0">
                <span>Potential Fishing Zone (PFZ) Advisory</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  INCOIS GEOPORTAL
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 m-0 hidden sm:block">
                Indian National Centre for Ocean Information Services (MoES, Govt. of India)
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">Lat: {mouseCoords.lat.toFixed(3)}° N, Lng: {mouseCoords.lng.toFixed(3)}° E</span>
          </div>

          <button
            onClick={() => setMeasureMode(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              measureMode ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Measure distance on ocean"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{measureMode ? 'Measuring...' : 'Measure Distance'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Close INCOIS Map View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Map Workspace with Left Layers Sidebar & Floating Legends */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left INCOIS Layers Sidebar (id="sidebar") */}
        <div className={`w-72 bg-[#0b1320]/95 backdrop-blur-md border-r border-[#1a2942] flex flex-col justify-between shrink-0 shadow-2xl z-20 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute left-0 h-full'}`}>
          <div className="p-3.5 space-y-4 overflow-y-auto">
            {/* Sidebar Title */}
            <div className="flex items-center justify-between pb-2 border-b border-[#182740]">
              <span className="font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" /> Map Layers & Controls
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Hide ◀
              </button>
            </div>

            {/* Coastal Sector Selector Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Select Coastal Sector:</label>
              <select
                value={selectedSectorId}
                onChange={(e) => handleSelectSector(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-[#111c30] border border-[#1d3154] text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {INCOIS_SECTORS.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>

            {/* Exact INCOIS Layer Checkboxes */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                Thematic Ocean Layers:
              </span>

              {/* 1. SST */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-[#101c30] border border-[#1a2d4e] cursor-pointer hover:bg-[#14233c] transition">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayers.sst}
                    onChange={(e) => setActiveLayers(p => ({ ...p, sst: e.target.checked }))}
                    className="accent-cyan-400 cursor-pointer"
                  />
                  <span>Sea Surface Temperature (SST)</span>
                </div>
                <span className="text-[10px] text-amber-400 font-mono">°C</span>
              </label>

              {/* 2. Chlorophyll */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-[#101c30] border border-[#1a2d4e] cursor-pointer hover:bg-[#14233c] transition">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayers.chlorophyll}
                    onChange={(e) => setActiveLayers(p => ({ ...p, chlorophyll: e.target.checked }))}
                    className="accent-cyan-400 cursor-pointer"
                  />
                  <span>Chlorophyll-a (CHL)</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">mg/m³</span>
              </label>

              {/* 3. PFZ Advisory Lines */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-[#101c30] border border-[#1a2d4e] cursor-pointer hover:bg-[#14233c] transition">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayers.pfzLines}
                    onChange={(e) => setActiveLayers(p => ({ ...p, pfzLines: e.target.checked }))}
                    className="accent-emerald-400 cursor-pointer"
                  />
                  <span className="font-semibold text-white">PFZ Advisory (PFZ_LINES)</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </label>

              {/* 4. EEZ */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-[#101c30] border border-[#1a2d4e] cursor-pointer hover:bg-[#14233c] transition">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayers.eez}
                    onChange={(e) => setActiveLayers(p => ({ ...p, eez: e.target.checked }))}
                    className="accent-rose-500 cursor-pointer"
                  />
                  <span>Exclusive Economic Zone (EEZ)</span>
                </div>
                <span className="text-[10px] text-rose-400 font-mono">200 NM</span>
              </label>

              {/* 5. Landing Centres */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-[#101c30] border border-[#1a2d4e] cursor-pointer hover:bg-[#14233c] transition">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayers.landingCentres}
                    onChange={(e) => setActiveLayers(p => ({ ...p, landingCentres: e.target.checked }))}
                    className="accent-sky-400 cursor-pointer"
                  />
                  <span>Landing Centres (Ports)</span>
                </div>
                <span className="text-sky-400 text-xs">⚓</span>
              </label>

              {/* 6. Bathymetry */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-[#101c30] border border-[#1a2d4e] cursor-pointer hover:bg-[#14233c] transition">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayers.bathymetry}
                    onChange={(e) => setActiveLayers(p => ({ ...p, bathymetry: e.target.checked }))}
                    className="accent-blue-500 cursor-pointer"
                  />
                  <span>GEBCO Bathymetry Contours</span>
                </div>
                <span className="text-[10px] text-blue-300 font-mono">20-1000m</span>
              </label>
            </div>

            {/* Measurement Status */}
            {measureMode && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs space-y-1">
                <span className="font-bold text-amber-300 block">Distance Ruler Active:</span>
                <p className="text-slate-300 text-[11px]">Click any two points on the sea to measure nautical distance & bearing.</p>
                {measuredDistance && (
                  <div className="pt-1 font-mono text-white text-xs">
                    Distance: <strong className="text-amber-400">{measuredDistance.km} km</strong> ({measuredDistance.nm} NM)<br/>
                    Initial Bearing: <strong className="text-cyan-300">{measuredDistance.bearing}°</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Live Cursor Coordinates Display (matching INCOIS #coordinates) */}
          <div className="p-3 bg-[#080e18] border-t border-[#182740] text-[11px] font-mono text-slate-400">
            Latitude: <strong className="text-white">{mouseCoords.lat.toFixed(3)}° N</strong><br/>
            Longitude: <strong className="text-white">{mouseCoords.lng.toFixed(3)}° E</strong>
          </div>
        </div>

        {/* Collapsed Sidebar Restore Button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-20 px-3 py-2 rounded-xl bg-[#0b1320] border border-[#1a2942] text-xs font-bold text-cyan-400 shadow-xl flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" /> Show Layers ▶
          </button>
        )}

        {/* Center Leaflet Map View */}
        <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

        {/* Top-Right Basemap Selector Tool */}
        <div className="absolute top-3 right-3 z-10 bg-[#0a1322]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#1b2f52] shadow-xl flex items-center gap-1 text-xs">
          <span className="text-[10px] text-slate-400 px-1 font-medium">Basemap:</span>
          <button
            onClick={() => setBasemapType('esriImagery')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${basemapType === 'esriImagery' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            ESRI Satellite
          </button>
          <button
            onClick={() => setBasemapType('cartoDark')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${basemapType === 'cartoDark' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Nav Dark
          </button>
          <button
            onClick={() => setBasemapType('esriStreet')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${basemapType === 'esriStreet' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Street Map
          </button>
          <button
            onClick={() => setBasemapType('topo')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${basemapType === 'topo' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Ocean Topo
          </button>
        </div>

        {/* Floating Official INCOIS PFZ Bulletin Card (Bottom-Left) */}
        {selectedAdvisory && (
          <div className="absolute bottom-5 left-80 z-10 w-96 bg-[#0a1322]/95 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/40 shadow-2xl space-y-2 text-left">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#182a48]">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">INCOIS PFZ ADVISORY</span>
                <h4 className="text-sm font-bold text-white">{selectedAdvisory.centreName} Sector</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE BULLETIN
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">DIRECTION & BEARING</span>
                <span className="font-bold text-cyan-300 font-mono text-sm">{selectedAdvisory.bearing}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">DISTANCE OFFSHORE</span>
                <span className="font-bold text-white font-mono text-sm">{selectedAdvisory.distanceKm} km ({selectedAdvisory.distanceNm} NM)</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">DEPTH CONTOUR</span>
                <span className="font-semibold text-emerald-400">{selectedAdvisory.depthMeters}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">VALIDITY PERIOD</span>
                <span className="font-semibold text-purple-300 text-[10px]">{selectedAdvisory.validity}</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-slate-500 block text-[10px]">TARGET PELAGIC SPECIES:</span>
              <span className="font-semibold text-amber-300">{selectedAdvisory.targetFishes}</span>
            </div>
          </div>
        )}

        {/* Floating SST & Chlorophyll Legends (Bottom-Right, matching INCOIS CSS) */}
        <div className="absolute bottom-5 right-4 z-10 flex items-end gap-3 pointer-events-auto">
          {/* SST Colorbar Legend */}
          {activeLayers.sst && (
            <div className="w-28 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-300 shadow-2xl text-slate-800 text-center text-xs">
              <div className="font-bold text-[11px] mb-1.5 text-slate-900">SST (°C)</div>
              <div className="h-28 w-4 mx-auto rounded flex flex-col justify-between items-center text-[10px] font-mono text-slate-800 font-bold"
                style={{
                  background: 'linear-gradient(to bottom, #ef4444, #f97316, #eab308, #10b981, #06b6d4, #1d4ed8)',
                  padding: '2px 0'
                }}>
                <span className="text-white drop-shadow">32°</span>
                <span className="text-white drop-shadow">28°</span>
                <span className="text-white drop-shadow">24°</span>
              </div>
            </div>
          )}

          {/* Chlorophyll Colorbar Legend */}
          {activeLayers.chlorophyll && (
            <div className="w-32 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-300 shadow-2xl text-slate-800 text-center text-xs">
              <div className="font-bold text-[11px] mb-1.5 text-slate-900">Chlorophyll (mg/m³)</div>
              <div className="h-28 w-4 mx-auto rounded flex flex-col justify-between items-center text-[10px] font-mono text-slate-800 font-bold"
                style={{
                  background: 'linear-gradient(to bottom, #ef4444, #eab308, #84cc16, #10b981, #06b6d4, #3b82f6)',
                  padding: '2px 0'
                }}>
                <span className="text-white drop-shadow">10.0</span>
                <span className="text-white drop-shadow">1.5</span>
                <span className="text-white drop-shadow">0.05</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
