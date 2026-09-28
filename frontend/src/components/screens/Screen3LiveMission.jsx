import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ShieldCheck, AlertTriangle, AlertOctagon, Navigation, 
  RotateCcw, Download, WifiOff, CheckCircle2, Clock, 
  Fuel, Waves, Wind, Compass, Radio, ChevronRight, ChevronLeft, Layers, Users, Sparkles 
} from 'lucide-react';
import { SCREEN3_DATA } from '../../data/mockScreensData';
import MarineApi from '../../services/api';

export default function Screen3LiveMission({ 
  onOpenEmergency, 
  onOpenOfflineModal, 
  onOpenFamilyLink,
  onNavigateTab, 
  onCompleteMission,
  globalLanguage = 'en',
  translations = {}
}) {
  const t = translations || {};
  const [isGuardianOpen, setIsGuardianOpen] = useState(true);
  const [activeGuardianView, setActiveGuardianView] = useState('challenger'); // 'planner' | 'challenger'
  const [layers, setLayers] = useState({
    liveTracking: true,
    weather: true,
    waves: true,
    wind: true,
    pfz: true,
    currents: false,
    geofences: true,
    routeRiskHeatmap: true,
    fleetCoordination: true,
  });

  const [liveData, setLiveData] = useState({
    wave: SCREEN3_DATA.liveWave,
    wind: SCREEN3_DATA.liveWind,
    sst: SCREEN3_DATA.liveSst,
    chlorophyll: SCREEN3_DATA.liveChlorophyll,
    currentSpeed: SCREEN3_DATA.liveCurrentSpeed,
    safetyScore: 92,
    safetyStatus: 'SAFE TO RETURN',
    source: 'INITIAL_TELEMETRY',
  });

  const fetchLiveTelemetry = async () => {
    try {
      const res = await MarineApi.getCurrentMarineData(9.12, 79.65);
      if (res && res.success) {
        const sea = res.sea_state || {};
        const wx = res.weather || {};
        const sft = res.safety || {};
        setLiveData({
          wave: `${sea.wave_height_m || 1.8} m (${sea.wave_period_s ? `${sea.wave_period_s}s swell` : 'moderate'})`,
          wind: `${wx.wind_speed_kn || 18} kn (${wx.wind_gusts_kn ? `gusts ${wx.wind_gusts_kn} kn` : 'NE'})`,
          sst: `${sea.sea_surface_temperature_c || 28.7} °C`,
          chlorophyll: '2.1 mg/m³',
          currentSpeed: `${sea.ocean_current_velocity_ms ? (sea.ocean_current_velocity_ms * 1.94384).toFixed(1) : '1.2'} knots`,
          safetyScore: sft.score || 92,
          safetyStatus: sft.is_safe_to_fish ? 'SAFE TO RETURN' : 'CAUTION HIGH SWELLS',
          source: 'LIVE_PYTHON_OPEN_METEO',
        });
      }
    } catch (err) {
      console.warn('Live telemetry fallback:', err);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  const [basemapStyle, setBasemapStyle] = useState('satellite');
  const liveMapRef = useRef(null);
  const liveMapInstance = useRef(null);
  const basemapLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const routeRiskGroupRef = useRef(null);
  const fleetCoordGroupRef = useRef(null);

  const BASEMAP_TILES = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; Esri World Imagery'
    },
    streets: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; Esri Street Map'
    },
    ocean: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; INCOIS &copy; Esri Ocean'
    },
    dark: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; Esri Dark Canvas'
    }
  };

  useEffect(() => {
    if (!liveMapRef.current) return;
    if (liveMapInstance.current) return;

    // Centered along active vessel trajectory (Palk Strait / Gulf of Mannar)
    const map = L.map(liveMapRef.current, {
      center: [9.15, 79.55],
      zoom: 9,
      zoomControl: false,
    });

    const initCfg = BASEMAP_TILES.satellite;
    const baseLayer = L.tileLayer(initCfg.url, {
      attribution: initCfg.attr,
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map);
    basemapLayerRef.current = baseLayer;

    // Route Risk Heatmap and Fleet Coordination layer groups
    routeRiskGroupRef.current = L.layerGroup().addTo(map);
    fleetCoordGroupRef.current = L.layerGroup().addTo(map);

    // Planned Route (Solid line)
    const plannedRoute = [
      [9.28, 79.31], // Rameswaram
      [9.20, 79.48], // Pamban Channel exit
      [9.12, 79.65], // Active vessel location
      [9.00, 79.80], // Target PFZ
    ];
    L.polyline(plannedRoute, {
      color: '#1D63ED',
      weight: 3.5,
      opacity: 0.95,
    }).bindTooltip('Planned Route to PFZ Zone B', { sticky: true }).addTo(map);

    // Alternative Route (Dashed cyan)
    const altRoute = [
      [9.12, 79.65],
      [9.05, 79.50],
      [9.28, 79.31],
    ];
    L.polyline(altRoute, {
      color: '#6366f1',
      weight: 2.5,
      dashArray: '5, 6',
      opacity: 0.8,
    }).bindTooltip('Alternative Return Route (Safe Lee of Island)', { sticky: true }).addTo(map);

    // Active Vessel Icon (Live position 9.12° N, 79.65° E)
    const vesselIcon = L.divIcon({
      className: 'vessel-marker',
      html: `
        <div style="background:#0B1E36; width:22px; height:22px; border-radius:3px; border:2px solid #FFFFFF; box-shadow:0 1px 6px rgba(18,52,59,0.3); display:flex; align-items:center; justify-content:center;">
          <span style="font-size:11px;">🚢</span>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker([9.12, 79.65], { icon: vesselIcon })
      .bindTooltip('<b>Vessel Position: 9.12° N, 79.65° E</b><br/>Speed: 12 kn • Status: Active', { permanent: true, direction: 'top', className: 'marine-tooltip' })
      .addTo(map);

    // Target PFZ Zone Marker
    L.circle([9.00, 79.80], {
      radius: 8000,
      color: '#1D63ED',
      fillColor: '#1D63ED',
      fillOpacity: 0.2,
      weight: 1.5,
    }).bindTooltip('<b>Target PFZ Zone B</b><br/>ETA: 11:20 AM', { permanent: true, className: 'marine-tooltip' }).addTo(map);

    // Restricted Area Polygon
    L.polygon([
      [8.85, 79.40],
      [9.00, 79.55],
      [8.80, 79.65],
      [8.70, 79.45],
    ], {
      color: '#dc2626',
      fillColor: '#dc2626',
      fillOpacity: 0.15,
      weight: 1.5,
      dashArray: '4, 4',
    }).bindTooltip('<b>Restricted Defense Area</b>', { className: 'marine-tooltip' }).addTo(map);

    liveMapInstance.current = map;
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      liveMapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!liveMapInstance.current) return;
    const map = liveMapInstance.current;
    if (basemapLayerRef.current) {
      map.removeLayer(basemapLayerRef.current);
    }
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
      labelsLayerRef.current = null;
    }

    const cfg = BASEMAP_TILES[basemapStyle] || BASEMAP_TILES.satellite;
    basemapLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attr,
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map);

    if (basemapStyle === 'ocean') {
      labelsLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.9,
      }).addTo(map);
    } else if (basemapStyle === 'dark') {
      labelsLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.9,
      }).addTo(map);
    }
  }, [basemapStyle]);

  // Dynamic Route Risk Heatmap & Fleet Coordination rendering
  useEffect(() => {
    if (!liveMapInstance.current || !routeRiskGroupRef.current || !fleetCoordGroupRef.current) return;

    routeRiskGroupRef.current.clearLayers();
    fleetCoordGroupRef.current.clearLayers();

    if (layers.routeRiskHeatmap) {
      // Segment 1 (Low Risk - Green): Sheltered Coastal Passage (0-6 NM)
      L.polyline([[9.28, 79.31], [9.20, 79.48]], {
        color: '#10B981',
        weight: 6,
        opacity: 0.95
      }).bindTooltip('<b>🟢 Route Risk Heatmap: Low Risk (0–6 NM)</b><br/>Sheltered Pamban coastal corridor<br/>Swell: 0.5m • Current: 0.8 kn • Calm passage', { sticky: true }).addTo(routeRiskGroupRef.current);

      // Segment 2 (Moderate Risk - Amber): Open Strait Cross-Currents (6-12 NM)
      L.polyline([[9.20, 79.48], [9.12, 79.65]], {
        color: '#F59E0B',
        weight: 6,
        opacity: 0.95
      }).bindTooltip('<b>🟡 Route Risk Heatmap: Moderate Risk (6–12 NM)</b><br/>Open strait cross-current zone<br/>Swell: 1.1m (Threshold: 1.8m) • Wind: 16 kn', { sticky: true }).addTo(routeRiskGroupRef.current);

      // Segment 3 (High Yield Safe Approach - Blue): Deep Oceanic Front (12-16 NM)
      L.polyline([[9.12, 79.65], [9.00, 79.80]], {
        color: '#0284C7',
        weight: 6,
        opacity: 0.95
      }).bindTooltip('<b>🔵 Route Risk Heatmap: PFZ Approach (12–16 NM)</b><br/>Optimal thermal boundary entry<br/>Chlorophyll: 2.1 mg/m³ • High Pelagic Yield', { sticky: true }).addTo(routeRiskGroupRef.current);

      // Hazard Zone Avoided (Severe Danger - Red Dashed): Shallow coral shoals
      L.polyline([[9.05, 79.40], [8.96, 79.52]], {
        color: '#EF4444',
        weight: 4,
        dashArray: '5, 5',
        opacity: 0.85
      }).bindTooltip('<b>🔴 Route Risk Heatmap: Severe Hazard (AVOIDED)</b><br/>Shallow Coral Shoal & 2.4m Breaking Surge<br/>Risk Score: 88/100 • Automated bypass active', { sticky: true }).addTo(routeRiskGroupRef.current);
    }

    if (layers.fleetCoordination) {
      // Zone A: Crowded Competitor Cluster
      const crowdIcon = L.divIcon({
        className: 'fleet-crowd-marker',
        html: `<div style="background:#EF4444; color:#FFFFFF; width:26px; height:26px; border-radius:50%; border:2px solid #FFFFFF; box-shadow:0 2px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold;">7</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      L.marker([9.14, 79.42], { icon: crowdIcon })
        .bindTooltip('<b>⚠️ Fleet Coordination: Zone A Crowded (7 Trawlers)</b><br/>High gear conflict risk & depleted catch per unit effort.<br/><i>Advisory: Diverted to Zone B</i>', { sticky: true })
        .addTo(fleetCoordGroupRef.current);

      // Zone B: Coordinated Target (Zero vessels)
      const coordTargetIcon = L.divIcon({
        className: 'fleet-optimal-marker',
        html: `<div style="background:#10B981; color:#FFFFFF; width:26px; height:26px; border-radius:50%; border:2px solid #FFFFFF; box-shadow:0 2px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:13px;">⭐</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      L.marker([9.00, 79.80], { icon: coordTargetIcon })
        .bindTooltip('<b>✅ Fleet Coordination: Zone B Target (0 Competitors)</b><br/>Anti-crowding coordination optimal.<br/>Free pelagic waters & maximum CPUE.', { sticky: true })
        .addTo(fleetCoordGroupRef.current);
    }
  }, [layers.routeRiskHeatmap, layers.fleetCoordination]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] text-[#0F2942] font-sans overflow-hidden text-left">
      {/* Top Banner / Header Bar */}
      <header className="h-11 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('screen-2')}
              className="px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#E2E8F0] text-xs text-[#0B1E36] font-medium flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              <span>← Digital Twin</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold tracking-wider text-[#0B1E36] uppercase">
              Live Mission Bridge
            </h2>
            <span className="text-[#CBD5E1]">|</span>
            <span className="font-mono text-xs font-semibold text-[#0B1E36]">{SCREEN3_DATA.missionId}</span>
            <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-semibold bg-[#F0F9FF] text-[#1D63ED] border border-[#E2E8F0] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D63ED] animate-pulse" />
              LIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#64748B] text-[11px] hidden sm:inline">Elapsed: <strong className="text-[#0F2942] font-semibold">{SCREEN3_DATA.elapsed}</strong></span>
          
          <button
            onClick={() => onCompleteMission ? onCompleteMission() : (onNavigateTab && onNavigateTab('screen-4'))}
            className="px-3 py-1 rounded-[4px] bg-[#0B1E36] hover:bg-[#1E40AF] text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1D63ED]" />
            <span>Complete & Debrief</span>
          </button>
        </div>
      </header>

      {/* Bridge Telemetry HUD Bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#1D63ED]" />
            <span className="text-[#64748B] text-[11px]">Position:</span>
            <span className="font-mono font-bold text-[#0B1E36]">{SCREEN3_DATA.currentPosition}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#0B1E36]" />
            <span className="text-[#64748B] text-[11px]">Speed:</span>
            <span className="font-mono font-bold text-[#1D63ED]">{SCREEN3_DATA.speed}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-[#64748B] text-[11px]">ETA PFZ:</span>
            <span className="font-mono font-bold text-[#0B1E36]">{SCREEN3_DATA.estimatedArrival}</span>
          </div>

          <div className="flex items-center gap-2">
            <Fuel className="w-3.5 h-3.5 text-[#1D63ED]" />
            <span className="text-[#64748B] text-[11px]">Fuel:</span>
            <span className="font-mono font-bold text-[#0B1E36]">{SCREEN3_DATA.fuelCurrent}</span>
            <div className="w-16 h-1.5 bg-[#E2E8F0] rounded-[2px] overflow-hidden inline-block">
              <div className="w-[63%] h-full bg-[#1D63ED]" />
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold font-mono">+{SCREEN3_DATA.fuelReserve} res</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-[#0284c7]" />
            <span className="text-[#64748B] text-[11px]">Swell:</span>
            <span className="font-mono font-bold text-[#0B1E36]">{liveData.wave}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Family Link Shore Button */}
          {onOpenFamilyLink && (
            <button
              onClick={onOpenFamilyLink}
              className="px-2.5 py-1 rounded-[3px] bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#1D63ED]/30 text-[#0B1E36] text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Open Family Safety Link & Dispatch Shore Check-in"
            >
              <Users className="w-3.5 h-3.5 text-[#1D63ED]" />
              <span className="hidden sm:inline">Family Link</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}

          {/* Scientific AI Reasoning Link */}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('screen-5')}
              className="px-2.5 py-1 rounded-[3px] bg-white hover:bg-[#F0F9FF] border border-[#E2E8F0] text-[#0B1E36] text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Inspect Multi-Source Scientific AI Reasoning"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1D63ED]" />
              <span className="hidden sm:inline">Scientific AI</span>
            </button>
          )}

          <div className={`px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold flex items-center gap-1.5 ${
            liveData.safetyScore >= 75
              ? 'bg-[#F0F9FF] border-[#E2E8F0] text-[#0B1E36]'
              : 'bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]'
          }`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${liveData.safetyScore >= 75 ? 'text-[#1D63ED]' : 'text-amber-600'}`} />
            <span>{liveData.safetyStatus} ({liveData.safetyScore}%)</span>
          </div>
        </div>
      </div>

      {/* Main Bridge Workspace: Dominant Tactical Map + Slide-out Guardian Console */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Tactical Ocean Map */}
        <div className="flex-1 h-full relative isolate z-0 bg-[#0B1E36]">
          {/* Leaflet Map Engine */}
          <div ref={liveMapRef} className="w-full h-full min-h-[350px] map-canvas-container isolate" />

          {/* Floating Top Controls Bar over Map */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
            {/* Quick Layer Filter Chips */}
            <div className="pointer-events-auto flex items-center gap-1 bg-[#FFFFFF]/95 backdrop-blur-md px-2 py-1 rounded-[6px] border border-[#E2E8F0] shadow-xs text-[11px]">
              <button
                onClick={() => setLayers(p => ({ ...p, liveTracking: !p.liveTracking }))}
                className={`px-2 py-0.5 rounded-[4px] font-medium transition cursor-pointer ${
                  layers.liveTracking ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                }`}
              >
                Tracking
              </button>
              <button
                onClick={() => setLayers(p => ({ ...p, weather: !p.weather }))}
                className={`px-2 py-0.5 rounded-[4px] font-medium transition cursor-pointer ${
                  layers.weather ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                }`}
              >
                Weather
              </button>
              <button
                onClick={() => setLayers(p => ({ ...p, waves: !p.waves }))}
                className={`px-2 py-0.5 rounded-[4px] font-medium transition cursor-pointer ${
                  layers.waves ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                }`}
              >
                Waves
              </button>
              <button
                onClick={() => setLayers(p => ({ ...p, wind: !p.wind }))}
                className={`px-2 py-0.5 rounded-[4px] font-medium transition cursor-pointer ${
                  layers.wind ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                }`}
              >
                Wind
              </button>
              <button
                onClick={() => setLayers(p => ({ ...p, pfz: !p.pfz }))}
                className={`px-2 py-0.5 rounded-[4px] font-medium transition cursor-pointer ${
                  layers.pfz ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                }`}
              >
                PFZ
              </button>
              <button
                onClick={() => setLayers(p => ({ ...p, geofences: !p.geofences }))}
                className={`px-2 py-0.5 rounded-[4px] font-medium transition cursor-pointer ${
                  layers.geofences ? 'bg-red-600 text-white' : 'text-[#64748B] hover:text-red-700 hover:bg-red-50'
                }`}
              >
                Geofences
              </button>
              <button
                onClick={() => setLayers(p => ({ ...p, routeRiskHeatmap: !p.routeRiskHeatmap }))}
                className={`px-2 py-0.5 rounded-[4px] font-medium transition cursor-pointer flex items-center gap-1 ${
                  layers.routeRiskHeatmap ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#64748B] hover:text-emerald-700 hover:bg-emerald-50'
                }`}
                title="Route Risk Heatmap: Highlights safer and riskier route segments"
              >
                <span>Risk Heatmap</span>
              </button>
              <button
                onClick={() => setLayers(p => ({ ...p, fleetCoordination: !p.fleetCoordination }))}
                className={`px-2 py-0.5 rounded-[4px] font-medium transition cursor-pointer flex items-center gap-1 ${
                  layers.fleetCoordination ? 'bg-indigo-600 text-white shadow-xs' : 'text-[#64748B] hover:text-indigo-700 hover:bg-indigo-50'
                }`}
                title="Fleet Coordination: Real-time anti-crowding allocation"
              >
                <span>Fleet Coord</span>
              </button>
            </div>

            {/* Right Controls: Basemap Style & Guardian Toggle */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-[#FFFFFF]/95 backdrop-blur-md p-1 rounded-[6px] border border-[#E2E8F0] shadow-xs text-xs">
              <select
                value={basemapStyle}
                onChange={(e) => setBasemapStyle(e.target.value)}
                className="bg-[#FFFFFF] text-[#0F2942] border border-[#E2E8F0] text-[11px] rounded-[4px] px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="satellite">{t.satellite || 'Satellite'}</option>
                <option value="streets">{t.streets || 'Streets'}</option>
                <option value="ocean">{t.ocean || 'Ocean'}</option>
                <option value="dark">{t.dark || 'Dark'}</option>
              </select>

              {!isGuardianOpen && (
                <button
                  onClick={() => setIsGuardianOpen(true)}
                  className="px-2.5 py-1 rounded-[4px] bg-[#1D63ED] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#1551C7] transition cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Show Guardian</span>
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Floating Route Legend (Bottom Left) */}
          <div className="absolute bottom-3 left-3 z-10 pointer-events-auto bg-[#FFFFFF]/95 backdrop-blur-md px-3 py-1.5 rounded-[6px] border border-[#E2E8F0] shadow-xs flex flex-wrap items-center gap-3 text-[10px] text-[#64748B] font-medium">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#1D63ED] rounded-[1px]"></span> Planned Track</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#6366f1] border-dashed border-b border-indigo-500"></span> Safe Lee Vector</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-100 border border-blue-500 rounded-full"></span> Target PFZ</span>
            <span className="flex items-center gap-1 text-red-600"><span className="w-2 h-2 bg-red-100 border border-red-500 rounded-[1px]"></span> Defense Geofence</span>
            <span className="h-3 w-[1px] bg-slate-200"></span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold" title="Route Risk Heatmap">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe (0–6 NM)
            </span>
            <span className="flex items-center gap-1 text-amber-700 font-semibold" title="Route Risk Heatmap">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate (6–12 NM)
            </span>
            <span className="flex items-center gap-1 text-red-700 font-semibold" title="Route Risk Heatmap">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Shoal Danger (Avoided)
            </span>
          </div>
        </div>

        {/* Right: Slide-out / Docked Safety Guardian Console */}
        {isGuardianOpen && (
          <aside className="w-80 sm:w-88 xl:w-96 h-full bg-[#FFFFFF] border-l border-[#E2E8F0] flex flex-col justify-between shrink-0 shadow-lg z-20 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-3.5 space-y-3">
              {/* Guardian Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[4px] bg-[#0B1E36] text-white flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1D63ED]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0B1E36]">Safety Guardian Watchdog</h3>
                    <p className="text-[10px] text-[#64748B]">AI Challenger & Stress Test</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsGuardianOpen(false)}
                  className="w-6 h-6 rounded-[3px] hover:bg-[#F0F9FF] text-[#64748B] hover:text-[#0B1E36] flex items-center justify-center text-xs font-bold cursor-pointer transition"
                  title="Collapse Guardian to Maximize Map"
                >
                  ✕
                </button>
              </div>

              {/* View Switcher: Planner vs Challenger */}
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#F0F9FF] rounded-[4px] border border-[#E2E8F0] text-xs font-medium">
                <button
                  onClick={() => setActiveGuardianView('planner')}
                  className={`py-1 rounded-[3px] transition cursor-pointer ${
                    activeGuardianView === 'planner' 
                      ? 'bg-[#FFFFFF] text-[#0B1E36] font-semibold shadow-xs' 
                      : 'text-[#64748B] hover:text-[#0F2942]'
                  }`}
                >
                  Planner View
                </button>
                <button
                  onClick={() => setActiveGuardianView('challenger')}
                  className={`py-1 rounded-[3px] transition cursor-pointer ${
                    activeGuardianView === 'challenger' 
                      ? 'bg-[#FFFFFF] text-[#0B1E36] font-semibold shadow-xs' 
                      : 'text-[#64748B] hover:text-[#0F2942]'
                  }`}
                >
                  Challenger View
                </button>
              </div>

              {/* Challenger Stress Analysis Warning Box */}
              <div className="p-3 rounded-[6px] bg-[#FFFBEB] border border-[#FDE68A] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[#92400E] font-semibold">
                  <span>Challenger Stress Analysis</span>
                  <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] bg-[#FDE68A] text-[#92400E] font-mono font-bold">
                    {liveData.safetyScore >= 80 ? 'OPTIMAL' : 'REVIEW'}
                  </span>
                </div>
                <ul className="text-[#78350F] space-y-1 text-[11px] font-medium">
                  <li>• Live Sea Swell: {liveData.wave}</li>
                  <li>• Surface Wind Vector: {liveData.wind}</li>
                  <li>• Sea Surface Temp: {liveData.sst} | Chl: {liveData.chlorophyll}</li>
                </ul>
              </div>

              {/* Fleet Coordination (Anti-Crowding Engine) */}
              <div className="p-3 rounded-[6px] bg-[#F0FDF4] border border-[#BBF7D0] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[#166534] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Fleet Coordination (Anti-Crowding)</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] bg-[#DCFCE7] text-[#166534] font-mono font-bold">
                    ZONE B ALLOCATED
                  </span>
                </div>
                <p className="text-[#14532D] text-[11px] leading-relaxed">
                  <strong>Crowd Avoidance Active:</strong> AIS monitors 7 competitor trawlers crowded into Zone A. The AI Fleet Coordinator automatically routed your craft to Zone B, avoiding gear entanglement and securing uncompeted high-density pelagic biomass.
                </p>
              </div>

              {/* Recalculate Button */}
              <button 
                onClick={fetchLiveTelemetry}
                className="w-full py-2 rounded-[4px] bg-[#0B1E36] hover:bg-[#1E40AF] text-white font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span>Recalculate with Live Telemetry</span>
              </button>

              {/* Real-time Advisory Feed */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Real-time Advisory Feed
                </span>
                {SCREEN3_DATA.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] space-y-0.5"
                  >
                    <p className="text-[#0F2942] font-medium leading-tight">{alert.text}</p>
                    <span className="text-[10px] text-[#64748B] font-mono block">{alert.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Mission Pack & Family Safety Link Footer in Drawer */}
            <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-2">
              <button
                onClick={onOpenFamilyLink}
                className="w-full py-2 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#CBD5E1] text-[#0B1E36] font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Family Safety Link & Shore Watchdog</span>
              </button>

              <button
                onClick={onOpenOfflineModal}
                className="w-full py-2 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#E2E8F0] text-[#0B1E36] font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span>Offline Marine Mission Pack</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Master Action Bar — Sleek Modern Action Strip */}
      <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0] px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEmergency}
            className="px-3.5 py-1.5 rounded-[4px] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <AlertOctagon className="w-4 h-4 text-white shrink-0" />
            <span>EMERGENCY SOS 1093</span>
          </button>

          <button
            onClick={onOpenFamilyLink}
            className="px-3 py-1.5 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#E2E8F0] text-[#0B1E36] font-medium text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Dispatch Safe Check-in SMS & WhatsApp to Family"
          >
            <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Family Check-in</span>
          </button>

          <button
            className="px-3 py-1.5 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#E2E8F0] text-[#0B1E36] font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#0B1E36] shrink-0" />
            <span>Return to Shore | Safe Vector</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLiveTelemetry}
            className="px-3 py-1.5 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#E2E8F0] text-[#0B1E36] font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#1D63ED] shrink-0" />
            <span>Recalculate Telemetry</span>
          </button>

          <button
            onClick={() => onCompleteMission ? onCompleteMission() : (onNavigateTab && onNavigateTab('screen-4'))}
            className="px-3.5 py-1.5 rounded-[4px] bg-[#1D63ED] hover:bg-[#1551C7] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete Mission & Debrief →</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
