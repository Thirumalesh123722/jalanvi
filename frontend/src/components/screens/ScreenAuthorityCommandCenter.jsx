import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ShieldAlert, AlertTriangle, Radio, Navigation, Wind, Waves, Compass,
  Eye, CheckCircle2, Clock, Users, Anchor, ChevronRight, RefreshCw,
  Activity, Layers, Sparkles, Send, ShieldCheck, FileText, ChevronDown,
  Maximize2, Minimize2, MapPin, Gauge, AlertOctagon, Info, History, Shield,
  Droplets, Thermometer, ArrowUpRight
} from 'lucide-react';
import MarineApi from '../../services/api';

// 12 Operational Command Pillars specified in Marine Authorities architecture
const COMMAND_PILLARS = [
  { id: 'ocean_weather', number: 1, title: 'Live Ocean & Weather', icon: Waves, badge: 'Buoy Realtime' },
  { id: 'hazard_intel', number: 2, title: 'Hazard Intelligence', icon: ShieldAlert, badge: 'VSCS Core' },
  { id: 'risk_analysis', number: 3, title: 'Risk Analysis', icon: Gauge, badge: '88/100 Score' },
  { id: 'affected_zones', number: 4, title: 'Affected Zones', icon: MapPin, badge: 'Landfall Corridor' },
  { id: 'safe_zones', number: 5, title: 'Safe Zones', icon: ShieldCheck, badge: '3 Havens' },
  { id: 'vessel_rescue', number: 6, title: 'Vessel Rescue', icon: Anchor, badge: '2 SOS Craft' },
  { id: 'population_impact', number: 7, title: 'Population Impact', icon: Users, badge: '257k Exposed' },
  { id: 'hazard_movement', number: 8, title: 'Hazard Movement', icon: Compass, badge: '315° NW @ 14kn' },
  { id: 'future_impact', number: 9, title: 'Future Impact', icon: Clock, badge: '+48h Cones' },
  { id: 'response', number: 10, title: 'Response', icon: FileText, badge: 'Directives' },
  { id: 'historical_analysis', number: 11, title: 'Historical Analysis', icon: History, badge: 'Analogs' },
  { id: 'prevention', number: 12, title: 'Prevention', icon: AlertOctagon, badge: 'Bans & Gates' },
];

// Safe custom icon generator for Leaflet
const createCustomIcon = (htmlContent, className = '', iconSize = [32, 32]) => {
  return L.divIcon({
    className: `custom-authority-marker ${className}`,
    html: htmlContent,
    iconSize: iconSize,
    iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
    popupAnchor: [0, -iconSize[1] / 2],
  });
};

export default function ScreenAuthorityCommandCenter({
  onNavigateTab,
  onOpenMarineAi,
  globalLanguage = 'en'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef({});

  // Intelligence State
  const [tacticalData, setTacticalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(30); // 10, 30, 60, 0 (paused)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState(null);

  // 12-Pillar Navigation State
  const [activePillar, setActivePillar] = useState('hazard_intel');
  const [futureTimelineHour, setFutureTimelineHour] = useState(12);

  // Active Console Tab ('hud' | 'risk' | 'vessels' | 'directives' | 'agents' | 'history')
  const [activeTab, setActiveTab] = useState('hud');
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

  // Map Layer Visibility
  const [visibleLayers, setVisibleLayers] = useState({
    hazardCore: true,
    trajectoryTrack: true,
    impactZones: true,
    safeZones: true,
    vessels: true,
    sarAssets: true,
    satelliteOverlay: false
  });

  const [baseMapStyle, setBaseMapStyle] = useState('dark'); // 'dark' | 'osm' | 'satellite'

  // Selected entities for drill-down
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // 1. Fetch Tactical Overview Data
  const fetchOverview = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const data = await MarineApi.getAuthorityOverview();
      setTacticalData(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch authority overview:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview(true);
  }, []);

  // Polling Effect
  useEffect(() => {
    if (pollingInterval <= 0) return;
    const interval = setInterval(() => {
      fetchOverview(false);
    }, pollingInterval * 1000);
    return () => clearInterval(interval);
  }, [pollingInterval]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on West-Central Bay of Bengal / Andhra Coast
    const map = L.map(mapContainerRef.current, {
      center: [16.2, 83.2],
      zoom: 7,
      minZoom: 5,
      maxZoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Store map instance
    mapInstanceRef.current = map;

    // Create layer groups for selective toggling
    layerGroupRef.current = {
      baseTiles: L.layerGroup().addTo(map),
      hazard: L.layerGroup().addTo(map),
      zones: L.layerGroup().addTo(map),
      safeZones: L.layerGroup().addTo(map),
      vessels: L.layerGroup().addTo(map),
      sarAssets: L.layerGroup().addTo(map)
    };

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Update Tile Layer on baseMapStyle change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current.baseTiles) return;
    layerGroupRef.current.baseTiles.clearLayers();

    if (baseMapStyle === 'osm') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; Esri Street Map'
      }).addTo(layerGroupRef.current.baseTiles);
    } else if (baseMapStyle === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; Esri World Imagery'
      }).addTo(layerGroupRef.current.baseTiles);
      // Coastal boundaries and place names overlay
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        subdomains: 'abcd',
        opacity: 0.85
      }).addTo(layerGroupRef.current.baseTiles);
    } else {
      // Default / 'dark': Watermark-free, high-performance Esri Dark Canvas with reference labels
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; Esri Dark Canvas'
      }).addTo(layerGroupRef.current.baseTiles);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        subdomains: 'abcd',
        opacity: 0.95
      }).addTo(layerGroupRef.current.baseTiles);
    }
  }, [baseMapStyle]);

  // 4. Render Tactical Map Overlays whenever data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tacticalData) return;

    const { hazard, tracks, affected_zones, safe_zones, vessels, rescue_resources } = tacticalData;
    const groups = layerGroupRef.current;

    // Clear previous vector layers
    groups.hazard.clearLayers();
    groups.zones.clearLayers();
    groups.safeZones.clearLayers();
    groups.vessels.clearLayers();
    groups.sarAssets.clearLayers();

    // ----------------------------------------------------
    // A. Hazard Center, Core Radius, & Trajectory Tracks
    // ----------------------------------------------------
    if (visibleLayers.hazardCore && hazard) {
      const hazardLat = hazard.current_lat;
      const hazardLon = hazard.current_lon;

      // Outer Core Gale Circle (45 NM ~ 83 km)
      L.circle([hazardLat, hazardLon], {
        radius: (hazard.core_radius_nm || 45) * 1852,
        color: '#EF4444',
        weight: 1.5,
        fillColor: '#EF4444',
        fillOpacity: 0.12,
        dashArray: '4, 4'
      }).addTo(groups.hazard);

      // Inner Eye Wall (24 km diameter -> 12 km radius)
      L.circle([hazardLat, hazardLon], {
        radius: 12000,
        color: '#DC2626',
        weight: 2,
        fillColor: '#991B1B',
        fillOpacity: 0.35
      }).addTo(groups.hazard);

      // Animated Cyclone Eye Marker
      const eyeIcon = createCustomIcon(`
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-red-600/40 animate-ping"></div>
          <div class="absolute w-7 h-7 rounded-full bg-red-500/60 animate-pulse"></div>
          <div class="w-5 h-5 rounded-full bg-red-700 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
            🌀
          </div>
        </div>
      `, '', [40, 40]);

      const eyeMarker = L.marker([hazardLat, hazardLon], { icon: eyeIcon }).addTo(groups.hazard);
      eyeMarker.bindPopup(`
        <div class="p-2 text-slate-800 text-xs font-sans">
          <div class="font-bold text-red-600 text-sm flex items-center gap-1">
            <span>🌀</span> ${hazard.name}
          </div>
          <div class="text-[11px] text-slate-600 mb-1">${hazard.category_name}</div>
          <div class="border-t border-slate-200 pt-1 space-y-0.5">
            <div><b>Center:</b> ${hazardLat}°N, ${hazardLon}°E</div>
            <div><b>Translation:</b> ${hazard.current_speed_knots} kn @ ${hazard.direction_text}</div>
            <div><b>Central Pressure:</b> ${hazard.central_pressure_hpa} hPa</div>
            <div><b>Max Sustained Wind:</b> ${hazard.max_sustained_wind_kmh} km/h (Gusts: ${hazard.max_gust_kmh} km/h)</div>
            <div><b>Significant Wave:</b> ${hazard.significant_wave_height_m}m | Surge: ${hazard.storm_surge_m}m</div>
          </div>
        </div>
      `);
    }

    // Trajectory Tracks
    if (visibleLayers.trajectoryTrack && tracks && tracks.length > 0) {
      const historicalPoints = tracks
        .filter(t => t.track_type === 'HISTORICAL' || t.track_type === 'CURRENT')
        .map(t => [t.latitude, t.longitude]);

      const forecastPoints = tracks
        .filter(t => t.track_type === 'CURRENT' || t.track_type.startsWith('PREDICTED'))
        .map(t => [t.latitude, t.longitude]);

      // Historical track (solid blue-grey line)
      if (historicalPoints.length > 1) {
        L.polyline(historicalPoints, {
          color: '#38BDF8',
          weight: 3,
          opacity: 0.8
        }).addTo(groups.hazard);
      }

      // Forecast track (dashed red/amber line)
      if (forecastPoints.length > 1) {
        L.polyline(forecastPoints, {
          color: '#F87171',
          weight: 3.5,
          dashArray: '6, 6',
          opacity: 0.95
        }).addTo(groups.hazard);
      }

      // Track Waypoints & Cones
      tracks.forEach(trk => {
        const isCurrent = trk.track_type === 'CURRENT';
        const isPred = trk.track_type.startsWith('PREDICTED');
        
        // Draw uncertainty cone radius for predicted points
        if (isPred && trk.cone_radius_nm) {
          L.circle([trk.latitude, trk.longitude], {
            radius: trk.cone_radius_nm * 1852,
            color: '#F87171',
            weight: 1,
            fillColor: '#EF4444',
            fillOpacity: 0.08,
            dashArray: '3, 3'
          }).addTo(groups.hazard);
        }

        const pointIcon = createCustomIcon(`
          <div class="w-3.5 h-3.5 rounded-full border border-white shadow-sm flex items-center justify-center ${
            isCurrent ? 'bg-red-600 ring-2 ring-red-400' : isPred ? 'bg-amber-500' : 'bg-sky-500'
          }">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        `, '', [14, 14]);

        const mark = L.marker([trk.latitude, trk.longitude], { icon: pointIcon }).addTo(groups.hazard);
        mark.bindPopup(`
          <div class="p-1.5 text-xs text-slate-800">
            <b class="text-slate-900">${trk.track_type}</b>
            <div class="text-[11px] text-slate-500">${new Date(trk.timestamp_iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</div>
            <div class="mt-1">Wind: <b>${trk.wind_kmh} km/h</b> | Wave: <b>${trk.wave_m}m</b></div>
            <div>Pressure: <b>${trk.pressure_hpa} hPa</b></div>
          </div>
        `);
      });
    }

    // ----------------------------------------------------
    // B. Coastal Impact Zones (Active vs Next Predicted)
    // ----------------------------------------------------
    if (visibleLayers.impactZones && affected_zones) {
      affected_zones.forEach(zone => {
        const isActive = zone.zone_type === 'ACTIVE_IMPACT';
        const isNext = zone.zone_type === 'NEXT_PREDICTED';

        const color = isActive ? '#DC2626' : isNext ? '#EA580C' : '#EAB308';

        if (zone.polygon_coords && zone.polygon_coords.length > 0) {
          const poly = L.polygon(zone.polygon_coords, {
            color: color,
            weight: 2,
            fillColor: color,
            fillOpacity: isActive ? 0.28 : isNext ? 0.20 : 0.12,
            dashArray: isActive ? null : '5, 5'
          }).addTo(groups.zones);

          poly.bindPopup(`
            <div class="p-2 text-xs text-slate-800">
              <div class="font-bold text-sm ${isActive ? 'text-red-700' : 'text-orange-700'}">
                ${zone.zone_name}
              </div>
              <div class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                isActive ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
              }">
                ${zone.zone_type.replace('_', ' ')} • ETA: ${zone.eta_hours} hrs
              </div>
              <div class="mt-2 space-y-0.5">
                <div><b>Warning Signal:</b> ${zone.harbor_warning_signal.replace(/_/g, ' ')}</div>
                <div><b>Evacuation:</b> ${zone.evacuation_status.replace(/_/g, ' ')}</div>
                <div><b>Expected Wind:</b> ${zone.expected_wind_kmh} km/h</div>
                <div><b>Projected Surge:</b> ${zone.expected_surge_m}m (Wave: ${zone.expected_wave_m}m)</div>
                <div><b>Exposed Population:</b> ${zone.population_exposed?.toLocaleString()} residents</div>
                <div><b>Vessels in Sector:</b> ${zone.vessels_in_zone} craft</div>
              </div>
            </div>
          `);
        }
      });
    }

    // ----------------------------------------------------
    // C. Safe Zones & Sheltered Lee Ports
    // ----------------------------------------------------
    if (visibleLayers.safeZones && safe_zones) {
      safe_zones.forEach(sz => {
        const safeIcon = createCustomIcon(`
          <div class="p-1 rounded-full bg-emerald-600 border border-white text-white shadow-md flex items-center justify-center">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        `, '', [26, 26]);

        const marker = L.marker([sz.latitude, sz.longitude], { icon: safeIcon }).addTo(groups.safeZones);
        marker.bindPopup(`
          <div class="p-2 text-xs text-slate-800">
            <div class="font-bold text-emerald-700 text-sm">⚓ ${sz.zone_name}</div>
            <div class="text-[11px] text-slate-500">${sz.harbor_type.replace(/_/g, ' ')}</div>
            <div class="mt-1.5 space-y-0.5">
              <div><b>Capacity:</b> ${sz.current_occupancy} / ${sz.capacity_vessels} craft berthed</div>
              <div><b>Sea State:</b> Calm (${sz.sea_state_calm_m}m swell)</div>
              <div><b>Wind Protection:</b> ${sz.wind_protection_rating}</div>
              <div><b>Clearance from Storm:</b> ${sz.distance_nm_from_hazard} NM</div>
              <div><b>VHF Channel:</b> ${sz.contact_channel}</div>
            </div>
          </div>
        `);
      });
    }

    // ----------------------------------------------------
    // D. Tracked Vessels (Distress, High Risk, In Port)
    // ----------------------------------------------------
    if (visibleLayers.vessels && vessels) {
      vessels.forEach(v => {
        const isDistress = v.category === 'CRITICAL_DISTRESS';
        const isHighRisk = v.category === 'HIGH_RISK';
        const isSafe = v.category === 'SAFE_IN_PORT';
        const isRescue = v.category === 'RESCUE_VESSEL';

        let badgeColor = 'bg-slate-600';
        let ringColor = '';
        if (isDistress) {
          badgeColor = 'bg-red-600 animate-pulse';
          ringColor = 'ring-4 ring-red-400/50';
        } else if (isHighRisk) {
          badgeColor = 'bg-amber-600';
        } else if (isSafe) {
          badgeColor = 'bg-emerald-600';
        } else if (isRescue) {
          badgeColor = 'bg-blue-600';
        }

        const vesselIcon = createCustomIcon(`
          <div class="w-6 h-6 rounded-full ${badgeColor} ${ringColor} border-2 border-white shadow-md flex items-center justify-center text-white text-[10px]">
            ${isDistress ? '⚠️' : isRescue ? '🛡️' : '⛵'}
          </div>
        `, '', [24, 24]);

        const marker = L.marker([v.latitude, v.longitude], { icon: vesselIcon }).addTo(groups.vessels);
        marker.bindPopup(`
          <div class="p-2 text-xs text-slate-800 min-w-[200px]">
            <div class="font-bold text-sm ${isDistress ? 'text-red-700' : isHighRisk ? 'text-amber-700' : 'text-blue-700'}">
              ${v.vessel_name}
            </div>
            <div class="text-[11px] text-slate-500 font-mono">${v.registration} • ${v.vessel_type}</div>
            
            <div class="mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
              isDistress ? 'bg-red-100 text-red-800' : isHighRisk ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }">
              ${v.category.replace(/_/g, ' ')} (Risk: ${v.risk_score}/100)
            </div>

            ${v.distress_reason ? `
              <div class="mt-1.5 p-1 rounded bg-red-50 border border-red-200 text-red-800 text-[11px]">
                <b>Distress Reason:</b> ${v.distress_reason}
              </div>
            ` : ''}

            <div class="mt-1.5 space-y-0.5 border-t border-slate-200 pt-1">
              <div><b>Crew on Board:</b> ${v.crew_count} souls (Skipper: ${v.skipper_name})</div>
              <div><b>Speed / Heading:</b> ${v.speed_knots} kn @ ${v.heading_deg}°</div>
              <div><b>Distance to Cyclone:</b> ${v.distance_to_hazard_nm} NM</div>
              <div><b>ETA to Shelter:</b> ${v.eta_to_safe_port}</div>
              <div><b>VHF Liaison:</b> ${v.vhf_channel} (${v.contact_phone})</div>
            </div>
          </div>
        `);
      });
    }

    // ----------------------------------------------------
    // E. SAR Rescue Cutters & Intercept Vectors
    // ----------------------------------------------------
    if (visibleLayers.sarAssets && rescue_resources) {
      rescue_resources.forEach(res => {
        const sarIcon = createCustomIcon(`
          <div class="p-1 rounded-full bg-blue-700 border-2 border-white shadow-lg text-white flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
        `, '', [28, 28]);

        const marker = L.marker([res.current_lat, res.current_lon], { icon: sarIcon }).addTo(groups.sarAssets);
        marker.bindPopup(`
          <div class="p-2 text-xs text-slate-800">
            <div class="font-bold text-blue-800 text-sm">🛡️ ${res.asset_name}</div>
            <div class="text-[11px] text-slate-500">${res.asset_type.replace(/_/g, ' ')} • Base: ${res.base_station}</div>
            <div class="mt-1.5 space-y-0.5">
              <div><b>Operational Status:</b> <span class="text-emerald-700 font-bold">${res.status.replace(/_/g, ' ')}</span></div>
              <div><b>Max Sprint Speed:</b> ${res.speed_max_knots} knots</div>
              <div><b>Combat / SAR Crew:</b> ${res.crew_complement}</div>
              <div><b>Commanding Officer:</b> ${res.commanding_officer}</div>
              <div><b>Response Time:</b> <b class="text-red-700">${res.response_eta_min} minutes</b></div>
            </div>
          </div>
        `);

        // Draw intercept line if targeted vessel is assigned
        if (res.assigned_target_vessel_id && vessels) {
          const target = vessels.find(v => v.id === res.assigned_target_vessel_id);
          if (target) {
            L.polyline(
              [[res.current_lat, res.current_lon], [target.latitude, target.longitude]],
              {
                color: '#3B82F6',
                weight: 2,
                dashArray: '4, 4',
                opacity: 0.85
              }
            ).addTo(groups.sarAssets);
          }
        }
      });
    }

  }, [tacticalData, visibleLayers]);

  // Center Map on Coordinates
  const centerMapOn = (lat, lon, zoom = 9) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], zoom, { duration: 1.2 });
    }
  };

  // Run 12-Agent Orchestration Pipeline
  const handleRunPipeline = async () => {
    setPipelineRunning(true);
    try {
      const res = await MarineApi.runAuthorityPipeline('COMMAND_CENTER_MANUAL');
      setPipelineResult(res);
      // Re-fetch tactical overview after pipeline completes
      await fetchOverview(false);
      setActiveTab('agents');
    } catch (err) {
      console.error('Pipeline run failed:', err);
    } finally {
      setPipelineRunning(false);
    }
  };

  // Approve Recommendation Action
  const handleApproveRecommendation = async (recId) => {
    try {
      await MarineApi.approveAuthorityRecommendation(recId, 'Authorized by Command Operations Duty Officer');
      await fetchOverview(false);
    } catch (err) {
      console.error('Failed to approve recommendation:', err);
    }
  };

  // Select and interact with one of the 12 Operational Command Pillars
  const handleSelectPillar = (pillarId) => {
    setActivePillar(pillarId);
    setIsConsoleCollapsed(false);

    const hazard = tacticalData?.hazard;
    const activeZone = tacticalData?.active_impact_zone;
    const vessels = tacticalData?.vessels || [];

    switch (pillarId) {
      case 'ocean_weather':
        centerMapOn(15.5, 84.2, 7);
        break;
      case 'hazard_intel':
      case 'hazard_movement':
        if (hazard) centerMapOn(hazard.current_lat, hazard.current_lon, 8);
        break;
      case 'risk_analysis':
        if (hazard) centerMapOn(hazard.current_lat, hazard.current_lon, 7);
        break;
      case 'affected_zones':
      case 'population_impact':
        if (activeZone?.polygon_coords?.[0]) {
          centerMapOn(activeZone.polygon_coords[0][0], activeZone.polygon_coords[0][1], 9);
        } else {
          centerMapOn(16.98, 82.25, 9);
        }
        break;
      case 'safe_zones':
        centerMapOn(20.26, 86.67, 8); // Paradip Safe Haven
        break;
      case 'vessel_rescue':
        const distressed = vessels.find(v => v.category === 'CRITICAL_DISTRESS');
        if (distressed) {
          centerMapOn(distressed.latitude, distressed.longitude, 10);
        } else {
          centerMapOn(16.12, 83.15, 9);
        }
        break;
      case 'future_impact':
        centerMapOn(17.2, 82.8, 7);
        break;
      case 'response':
      case 'historical_analysis':
      case 'prevention':
        centerMapOn(16.5, 82.8, 8);
        break;
      default:
        break;
    }
  };

  const hazard = tacticalData?.hazard;
  const riskIndex = tacticalData?.risk_index;
  const summary = tacticalData?.summary_counters;
  const activeZone = tacticalData?.active_impact_zone;
  const nextZone = tacticalData?.next_predicted_zone;
  const vessels = tacticalData?.vessels || [];
  const resources = tacticalData?.rescue_resources || [];
  const recommendations = tacticalData?.recommendations || [];
  const history = tacticalData?.history_analogs || [];
  const alerts = tacticalData?.alerts || [];

  return (
    <div className="relative w-full h-[calc(100vh-88px)] bg-[#F4F8FA] text-[#0F2942] flex flex-col overflow-hidden select-none font-sans">
      
      {/* ============================================================== */}
      {/* 1. TOP TACTICAL INTELLIGENCE STRIP (Matching Landing Page UI) */}
      {/* ============================================================== */}
      <header className="h-13 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 flex items-center justify-between gap-3 shrink-0 z-30 shadow-xs">
        {/* Left: Active Hazard Badge & Trajectory */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[#0B1E36] tracking-wide">
                  {hazard?.name || 'MONITORING BAY OF BENGAL'}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                  {hazard?.category_name || 'VSCS'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {hazard?.direction_text || '315° NW'} • {hazard?.current_speed_knots || 14.2} kn • Central P: {hazard?.central_pressure_hpa || 978} hPa
              </span>
            </div>
          </div>

          <div className="hidden lg:block h-6 w-px bg-slate-200" />

          {/* Risk Score Pill with Direct Drill-Down Click */}
          <button
            onClick={() => { setActiveTab('risk'); setIsConsoleCollapsed(false); }}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100/80 border border-red-200 transition cursor-pointer text-left shadow-2xs"
            title="Click for full 6-factor risk breakdown"
          >
            <Gauge className="w-4 h-4 text-red-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-red-700 font-semibold uppercase leading-none">Risk Index</span>
              <span className="text-xs font-black text-red-600 leading-tight">
                {riskIndex?.score || 88} / 100 <span className="text-[10px] font-normal text-red-500">[{riskIndex?.severity || 'CRITICAL'}]</span>
              </span>
            </div>
          </button>

          {/* Quick Metrics Pills */}
          <div className="hidden xl:flex items-center gap-2 text-[11px]">
            <div 
              onClick={() => { setActiveTab('vessels'); setIsConsoleCollapsed(false); }}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium transition"
              title="Click to view distressed vessels"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Distress: <b className="text-red-600">{summary?.critical_distress_vessels || 2}</b> | Risk: <b className="text-[#0B1E36]">{summary?.high_risk_vessels || 2}</b></span>
            </div>

            <div 
              onClick={() => { setActiveTab('hud'); setIsConsoleCollapsed(false); }}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium transition"
              title="Click to view affected coastal zones"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Exposed Pop: <b className="text-[#0B1E36]">{(summary?.total_coastal_population_at_risk || 257000).toLocaleString()}</b></span>
            </div>

            <div className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/90 shadow-2xs flex items-center gap-1.5 text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SAR Units: <b className="text-emerald-700">{summary?.active_rescue_assets || 4} Ready</b></span>
            </div>

            <div className="px-2.5 py-1 rounded-xl bg-red-50 border border-red-200 shadow-2xs flex items-center gap-1.5 text-red-700 font-bold">
              <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
              <span>Port Signal No. 9</span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Polling Interval Select */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200/90 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Poll:</span>
            <select
              value={pollingInterval}
              onChange={(e) => setPollingInterval(Number(e.target.value))}
              className="bg-transparent text-slate-800 text-[11px] font-semibold focus:outline-none cursor-pointer"
            >
              <option value={10} className="bg-white text-slate-800">10s</option>
              <option value={30} className="bg-white text-slate-800">30s</option>
              <option value={60} className="bg-white text-slate-800">60s</option>
              <option value={0} className="bg-white text-slate-800">Paused</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchOverview(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-2xs transition cursor-pointer"
            title="Refresh Live Ocean & Hazard Feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Run 12-Agent Pipeline Trigger */}
          <button
            onClick={handleRunPipeline}
            disabled={pipelineRunning}
            className="px-3 py-1.5 rounded-xl bg-[#1D63ED] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Execute 12-Agent Hazard Orchestration Pipeline"
          >
            <Activity className={`w-3.5 h-3.5 ${pipelineRunning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {pipelineRunning ? 'Executing 12 Agents...' : 'Run 12 Agents'}
            </span>
          </button>

          {/* Launch Authority Marine AI */}
          <button
            onClick={() => onOpenMarineAi && onOpenMarineAi('Provide operational summary of distressed vessels and recommend SAR asset dispatch.')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50/70 border border-blue-200 hover:border-blue-400 text-[#1D63ED] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Consult Authority Marine AI Decision Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1D63ED]" />
            <span className="hidden sm:inline">Authority AI</span>
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 1.5. 12 OPERATIONAL COMMAND PILLARS RIBBON                     */}
      {/* ============================================================== */}
      <div className="bg-[#FFFFFF] border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 z-25 shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1 pr-2 shrink-0 flex items-center gap-1 border-r border-slate-200">
          <ShieldAlert className="w-3.5 h-3.5 text-[#1D63ED]" />
          <span>12 Pillars</span>
        </span>

        {COMMAND_PILLARS.map((p) => {
          const Icon = p.icon;
          const isActive = activePillar === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPillar(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#0B1E36] text-white shadow-xs font-bold ring-1 ring-amber-400/40'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:text-[#0B1E36]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
              }`}>
                {p.number}
              </span>
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="whitespace-nowrap">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN WORKSPACE: Central Map + Floating Intelligence Console  */}
      {/* ============================================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        
        {/* LEAFLET MAP CONTAINER (DOMINANT CENTRAL INTELLIGENCE SURFACE) */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 bg-[#E0F2FE]" />

        {/* FLOATING MAP TOOLBOX (TOP LEFT OVERLAY) */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {/* Base Layer Switcher */}
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center gap-1">
            <button
              onClick={() => setBaseMapStyle('dark')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                baseMapStyle === 'dark' ? 'bg-[#1D63ED] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Nav Dark
            </button>
            <button
              onClick={() => setBaseMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                baseMapStyle === 'satellite' ? 'bg-[#1D63ED] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setBaseMapStyle('osm')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                baseMapStyle === 'osm' ? 'bg-[#1D63ED] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Streets
            </button>
          </div>

          {/* Layer Visibility Toggles */}
          <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-[11px] space-y-1.5 w-48 text-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Map Layers</span>
              <Layers className="w-3 h-3 text-slate-400" />
            </div>

            <label className="flex items-center justify-between cursor-pointer hover:text-blue-600 text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Cyclone & Cone
              </span>
              <input
                type="checkbox"
                checked={visibleLayers.hazardCore}
                onChange={(e) => setVisibleLayers(prev => ({ ...prev, hazardCore: e.target.checked, trajectoryTrack: e.target.checked }))}
                className="rounded accent-[#1D63ED]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-blue-600 text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Impact Sectors
              </span>
              <input
                type="checkbox"
                checked={visibleLayers.impactZones}
                onChange={(e) => setVisibleLayers(prev => ({ ...prev, impactZones: e.target.checked }))}
                className="rounded accent-[#1D63ED]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-blue-600 text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe Havens
              </span>
              <input
                type="checkbox"
                checked={visibleLayers.safeZones}
                onChange={(e) => setVisibleLayers(prev => ({ ...prev, safeZones: e.target.checked }))}
                className="rounded accent-[#1D63ED]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-blue-600 text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Tracked Vessels
              </span>
              <input
                type="checkbox"
                checked={visibleLayers.vessels}
                onChange={(e) => setVisibleLayers(prev => ({ ...prev, vessels: e.target.checked }))}
                className="rounded accent-[#1D63ED]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-blue-600 text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> SAR Cutters
              </span>
              <input
                type="checkbox"
                checked={visibleLayers.sarAssets}
                onChange={(e) => setVisibleLayers(prev => ({ ...prev, sarAssets: e.target.checked }))}
                className="rounded accent-[#1D63ED]"
              />
            </label>
          </div>

          {/* Quick Camera Navigation Buttons */}
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col gap-1 w-48">
            <button
              onClick={() => centerMapOn(hazard?.current_lat || 15.85, hazard?.current_lon || 83.42, 8)}
              className="text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50/80 text-[11px] text-slate-700 hover:text-[#1D63ED] font-medium flex items-center justify-between transition cursor-pointer"
            >
              <span>Center Cyclone Eye</span>
              <Compass className="w-3 h-3 text-red-500" />
            </button>
            <button
              onClick={() => centerMapOn(16.12, 83.15, 9)}
              className="text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50/80 text-[11px] text-slate-700 hover:text-[#1D63ED] font-medium flex items-center justify-between transition cursor-pointer"
            >
              <span>Focus Distressed Trawler</span>
              <AlertTriangle className="w-3 h-3 text-amber-500" />
            </button>
            <button
              onClick={() => centerMapOn(16.98, 82.25, 9)}
              className="text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50/80 text-[11px] text-slate-700 hover:text-[#1D63ED] font-medium flex items-center justify-between transition cursor-pointer"
            >
              <span>Focus Landfall Corridor</span>
              <MapPin className="w-3 h-3 text-orange-500" />
            </button>
          </div>
        </div>

        {/* FLOATING MAP LEGEND (BOTTOM LEFT OVERLAY) */}
        <div className="absolute bottom-6 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-[10px] text-slate-700 font-medium flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span>Distress SOS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>High Risk Fleet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Coast Guard SAR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Safe Haven / Lee Port</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t border-dashed border-red-500" />
            <span>Forecast Track Cone</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. RIGHT FLOATING INTELLIGENCE CONSOLE (COLLAPSIBLE / MODULAR) */}
        {/* ============================================================== */}
        <div 
          className={`absolute top-4 right-4 bottom-4 z-20 transition-all duration-300 flex flex-col bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden text-[#0F2942] ${
            isConsoleCollapsed ? 'w-12' : 'w-96 md:w-[440px]'
          }`}
        >
          {/* Console Header: Active Pillar Display & Quick Switcher */}
          <div className="h-11 bg-slate-50/90 border-b border-slate-200 px-3 flex items-center justify-between shrink-0">
            {!isConsoleCollapsed ? (
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                <span className="w-5 h-5 rounded-md bg-[#0B1E36] text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">
                  {COMMAND_PILLARS.find(p => p.id === activePillar)?.number || '✦'}
                </span>
                <span className="font-extrabold text-xs text-[#0B1E36] truncate">
                  {COMMAND_PILLARS.find(p => p.id === activePillar)?.title}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">
                  [{COMMAND_PILLARS.find(p => p.id === activePillar)?.badge}]
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-400 mx-auto">✦</span>
            )}

            <button
              onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
              className="p-1 rounded-lg hover:bg-white text-slate-500 hover:text-slate-900 transition cursor-pointer shrink-0 ml-1 border border-transparent hover:border-slate-200 shadow-2xs"
              title={isConsoleCollapsed ? 'Expand Tactical Console' : 'Collapse Console for Map Dominance'}
            >
              {isConsoleCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Console Body Content: 12 Dedicated Pillar Panels */}
          {!isConsoleCollapsed && (
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs text-slate-700 custom-scrollbar">

              {/* ==================================================== */}
              {/* PILLAR 1: LIVE OCEAN & WEATHER                       */}
              {/* ==================================================== */}
              {activePillar === 'ocean_weather' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-[#0B1E36] text-xs">INCOIS Moored Buoy BD-08</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                        LIVE 10s STREAM
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Location: 15.50°N, 84.50°E • West-Central Bay of Bengal
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Wave Height (Hs)</span>
                      <div className="text-base font-extrabold text-[#0B1E36] mt-0.5">{hazard?.significant_wave_height_m || 4.8} m</div>
                      <span className="text-[10px] text-sky-600 font-medium">Period (Tp): {hazard?.peak_wave_period_s || 11.2}s</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Sea Surface Temp (SST)</span>
                      <div className="text-base font-extrabold text-[#0B1E36] mt-0.5">{hazard?.details?.sea_surface_temp_c || 30.6}°C</div>
                      <span className="text-[10px] text-red-600 font-medium">Anomaly: +{hazard?.details?.sst_anomaly_c || 1.8}°C</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Surface Current</span>
                      <div className="text-base font-extrabold text-[#0B1E36] mt-0.5">1.8 knots</div>
                      <span className="text-[10px] text-blue-600 font-medium">Vector: 075° ENE</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Barometric Pressure</span>
                      <div className="text-base font-extrabold text-[#0B1E36] mt-0.5">{hazard?.central_pressure_hpa || 978} hPa</div>
                      <span className="text-[10px] text-red-600 font-medium">Trend: -3.2 hPa/hr</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                    <div className="text-[11px] font-bold text-[#0B1E36] flex items-center justify-between">
                      <span>Atmospheric Boundary Layer</span>
                      <span className="text-[10px] text-slate-500 font-mono">14 AWS Active</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex justify-between"><span>Sustained Surface Wind:</span> <b className="text-slate-900">{hazard?.max_sustained_wind_kmh || 125} km/h (68 kn)</b></div>
                      <div className="flex justify-between"><span>Maximum Recorded Gust:</span> <b className="text-amber-700">{hazard?.max_gust_kmh || 150} km/h</b></div>
                      <div className="flex justify-between"><span>Convective Rainfall:</span> <b className="text-blue-700">28 mm/hr</b></div>
                      <div className="flex justify-between"><span>Relative Humidity:</span> <b className="text-slate-900">96%</b></div>
                    </div>
                  </div>

                  <button
                    onClick={() => centerMapOn(15.5, 84.5, 8)}
                    className="w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Focus Buoy BD-08 Station on Map</span>
                  </button>
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 2: HAZARD INTELLIGENCE                        */}
              {/* ==================================================== */}
              {activePillar === 'hazard_intel' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-red-700 text-xs flex items-center gap-1">
                        <span>🌀</span> {hazard?.name || 'Cyclone Maya'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white shadow-2xs">
                        {hazard?.category_name || 'VSCS'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>Center: <b>{hazard?.current_lat}°N, {hazard?.current_lon}°E</b></div>
                      <div>Central P: <b className="text-red-700">{hazard?.central_pressure_hpa} hPa</b></div>
                      <div>Dvorak Rating: <b className="text-blue-700">{hazard?.details?.convective_banding_intensity || 'T-4.5'}</b></div>
                      <div>Pressure Deficit: <b className="text-red-600">-{hazard?.details?.central_pressure_deficit_hpa || 24} hPa</b></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Eyewall Diameter</span>
                      <div className="text-sm font-bold text-[#0B1E36] mt-0.5">{hazard?.details?.eye_diameter_km || 24} km</div>
                      <span className="text-[10px] text-slate-500 font-medium">Stadium structure</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Radius of Max Wind</span>
                      <div className="text-sm font-bold text-[#0B1E36] mt-0.5">{hazard?.details?.radius_of_maximum_winds_km || 32} km</div>
                      <span className="text-[10px] text-slate-500 font-medium">Peak energy ring</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Gale Wind Radius (34kn)</span>
                      <div className="text-sm font-bold text-[#0B1E36] mt-0.5">{hazard?.core_radius_nm || 45} NM</div>
                      <span className="text-[10px] text-amber-600 font-medium">~83 km perimeter</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Storm Surge Inundation</span>
                      <div className="text-sm font-bold text-[#0B1E36] mt-0.5">+{hazard?.storm_surge_m || 2.8} m</div>
                      <span className="text-[10px] text-red-600 font-medium">Total: {hazard?.details?.total_inundation_water_level_m || 4.05}m</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => centerMapOn(hazard?.current_lat || 15.85, hazard?.current_lon || 83.42, 8)}
                      className="flex-1 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Center Eye</span>
                    </button>
                    <button
                      onClick={handleRunPipeline}
                      disabled={pipelineRunning}
                      className="flex-1 py-2 rounded-xl bg-[#1D63ED] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <Activity className={`w-3.5 h-3.5 ${pipelineRunning ? 'animate-spin' : ''}`} />
                      <span>{pipelineRunning ? 'Running...' : 'Run 12 Agents'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 3: RISK ANALYSIS                              */}
              {/* ==================================================== */}
              {activePillar === 'risk_analysis' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-center shadow-2xs">
                    <span className="text-[10px] text-red-700 uppercase font-bold tracking-wider">Composite Normalized Risk</span>
                    <div className="text-3xl font-black text-red-600 mt-0.5">
                      {riskIndex?.score || 88} <span className="text-base font-normal text-slate-500">/ 100</span>
                    </div>
                    <div className="text-[11px] text-red-700 font-extrabold mt-1">
                      CLASSIFICATION: {riskIndex?.severity || 'CRITICAL'} (RED ALERT)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-[#0B1E36]">
                      Multi-Factor Mathematical Contributions:
                    </div>

                    {riskIndex?.factors?.sub_scores && Object.entries(riskIndex.factors.sub_scores).map(([key, data]) => {
                      const weight = riskIndex.factors.weights[`${key === 'wind' ? 'wind_severity' : key === 'wave' ? 'wave_height' : key}_pct`] || 15;
                      return (
                        <div key={key} className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-800 capitalize">
                              {key.replace('_', ' ')} ({weight}%)
                            </span>
                            <span className="font-mono text-red-600 font-bold">
                              +{data.weighted_contribution} pts
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="bg-red-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, data.normalized_score)}%` }} 
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-medium">
                            <span>Telemetry: {data.raw_value}</span>
                            <span>Normalized: {data.normalized_score}/100</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[11px] text-slate-600">
                    Formula: <span className="font-mono text-slate-800 font-semibold">R = 0.25·Wind + 0.25·Wave + 0.15·ΔP + 0.15·Prox + 0.10·Fleet + 0.10·Pop</span>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 4: AFFECTED ZONES                             */}
              {/* ==================================================== */}
              {activePillar === 'affected_zones' && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-[#0B1E36] uppercase tracking-wide">
                    Coastal Impact Zones (Landfall Corridor)
                  </div>

                  {activeZone && (
                    <div 
                      onClick={() => centerMapOn(activeZone.polygon_coords?.[0]?.[0] || 16.8, activeZone.polygon_coords?.[0]?.[1] || 82.2, 9)}
                      className="p-3 rounded-xl bg-red-50/90 border border-red-200 hover:bg-red-100/70 shadow-2xs transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-700 text-xs">{activeZone.zone_name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shadow-2xs">
                          ACTIVE IMPACT
                        </span>
                      </div>
                      <div className="mt-1.5 text-[11px] text-slate-700 space-y-0.5">
                        <div>Landfall ETA: <b className="text-[#0B1E36]">{activeZone.eta_hours} hrs</b> • Wind: <b>{activeZone.expected_wind_kmh} km/h</b></div>
                        <div>Surge: <b className="text-red-600">+{activeZone.expected_surge_m}m</b> • Signal: <b>{activeZone.harbor_warning_signal.replace(/_/g, ' ')}</b></div>
                        <div>Exposed Population: <b>{activeZone.population_exposed?.toLocaleString()}</b></div>
                        <div>Evacuation: <b className="text-red-700">{activeZone.evacuation_status.replace(/_/g, ' ')}</b></div>
                      </div>
                    </div>
                  )}

                  {nextZone && (
                    <div 
                      onClick={() => centerMapOn(nextZone.polygon_coords?.[0]?.[0] || 17.6, nextZone.polygon_coords?.[0]?.[1] || 83.3, 9)}
                      className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 hover:bg-amber-100/70 shadow-2xs transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-800 text-xs">{nextZone.zone_name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-2xs">
                          NEXT PREDICTED
                        </span>
                      </div>
                      <div className="mt-1.5 text-[11px] text-slate-700 space-y-0.5">
                        <div>ETA: <b className="text-[#0B1E36]">{nextZone.eta_hours} hrs</b> • Wind: <b>{nextZone.expected_wind_kmh} km/h</b></div>
                        <div>Surge: <b>+{nextZone.expected_surge_m}m</b> • Signal: <b>{nextZone.harbor_warning_signal.replace(/_/g, ' ')}</b></div>
                        <div>Exposed Population: <b>{nextZone.population_exposed?.toLocaleString()}</b></div>
                        <div>Evacuation: <b>{nextZone.evacuation_status.replace(/_/g, ' ')}</b></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 5: SAFE ZONES                                 */}
              {/* ==================================================== */}
              {activePillar === 'safe_zones' && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide flex items-center justify-between">
                    <span>Designated Safe Maritime Havens (3)</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded">CALM WATERS</span>
                  </div>

                  <div className="space-y-2">
                    {(tacticalData?.safe_zones || [
                      { id: 'safe-1', name: 'Paradip North Port Deep Haven', current_lat: 20.26, current_lon: 86.67, wave_height_m: 0.8, distance_nm: 185, berth_capacity: 14, pilotage: 'ACTIVE' },
                      { id: 'safe-2', name: 'Chennai Outer Anchorage Haven', current_lat: 13.08, current_lon: 80.30, wave_height_m: 0.9, distance_nm: 210, berth_capacity: 8, pilotage: 'STANDBY' },
                      { id: 'safe-3', name: 'Dhamra Protected Inland Reach', current_lat: 20.80, current_lon: 86.95, wave_height_m: 0.6, distance_nm: 235, berth_capacity: 22, pilotage: 'ACTIVE' },
                    ]).map(sz => (
                      <div 
                        key={sz.id}
                        onClick={() => centerMapOn(sz.current_lat, sz.current_lon, 9)}
                        className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100/70 shadow-2xs transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900 text-xs">{sz.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                            Hs: {sz.wave_height_m}m
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-600 flex items-center justify-between">
                          <span>Distance: <b>{sz.distance_nm} NM</b></span>
                          <span>Berths: <b className="text-emerald-800">{sz.berth_capacity} available</b></span>
                          <span className="font-mono text-[10px] text-slate-500">Pilot: {sz.pilotage}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                    📡 Coordinates broadcast over <b>NavIC 1176.45 MHz</b> and coastal VHF Ch 16 every 15 minutes.
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 6: VESSEL RESCUE                              */}
              {/* ==================================================== */}
              {activePillar === 'vessel_rescue' && (
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-bold text-red-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                      <span>Distressed Craft ({vessels.filter(v => v.category === 'CRITICAL_DISTRESS').length})</span>
                      <span className="text-[10px] text-red-700 font-mono font-bold bg-red-100 px-1.5 py-0.5 rounded">SOS ACTIVE</span>
                    </div>

                    <div className="space-y-2">
                      {vessels.filter(v => v.category === 'CRITICAL_DISTRESS').map(v => (
                        <div 
                          key={v.id}
                          onClick={() => centerMapOn(v.latitude, v.longitude, 10)}
                          className="p-3 rounded-xl bg-red-50/90 border border-red-200 hover:bg-red-100/70 shadow-2xs transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0B1E36] text-xs">{v.vessel_name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shadow-2xs">
                              Risk: {v.risk_score}/100
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-600 mt-0.5">{v.registration} • {v.crew_count} souls on board</div>
                          
                          <div className="mt-1.5 p-1.5 rounded-lg bg-red-100 text-red-800 text-[11px] font-medium">
                            {v.distress_reason}
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 border-t border-red-200 pt-1 font-medium">
                            <span>Pos: {v.latitude}°N, {v.longitude}°E</span>
                            <span className="text-red-700 font-bold">{v.distance_to_hazard_nm} NM from Eye</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wide mb-1.5">
                      Coast Guard SAR Cutters & Aircraft ({resources.length})
                    </div>

                    <div className="space-y-1.5">
                      {resources.map(res => (
                        <div 
                          key={res.id}
                          onClick={() => centerMapOn(res.current_lat, res.current_lon, 10)}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 shadow-2xs transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0B1E36]">{res.asset_name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {res.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-medium">
                            <span>Base: {res.base_station} • Max: {res.speed_max_knots} kn</span>
                            <span className="text-emerald-600 font-bold">ETA: {res.response_eta_min} min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 7: POPULATION IMPACT                          */}
              {/* ==================================================== */}
              {activePillar === 'population_impact' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center shadow-2xs">
                    <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider">Total Coastal Exposure</span>
                    <div className="text-2xl font-black text-[#0B1E36] mt-0.5">
                      {(summary?.total_coastal_population_at_risk || 257000).toLocaleString()} Residents
                    </div>
                    <div className="text-[11px] text-blue-700 font-semibold mt-1">
                      Evacuated: 58,400 (22.7%) • 42 MPCS Shelters Active
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-[#0B1E36]">Sector-Wise Breakdown:</div>
                    {[
                      { sector: 'Kakinada Coringa Fisher Belt', exposed: 142000, evac: '41,200', risk: 'CRITICAL', shelters: 18 },
                      { sector: 'Uppada Coastal Hamlet Mesh', exposed: 68000, evac: '12,800', risk: 'HIGH', shelters: 12 },
                      { sector: 'Visakhapatnam Harbor Environs', exposed: 35000, evac: '3,400', risk: 'MODERATE', shelters: 8 },
                      { sector: 'Bheemunipatnam Shoreline', exposed: 12000, evac: '1,000', risk: 'WATCH', shelters: 4 },
                    ].map((sec, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{sec.sector}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${sec.risk === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {sec.risk}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Exposed: <b>{sec.exposed.toLocaleString()}</b></span>
                          <span>Evacuated: <b className="text-emerald-700">{sec.evac}</b></span>
                          <span>Shelters: <b>{sec.shelters}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                    🚑 12 NDRF search & rescue battalions pre-positioned with inflatable motorized Zodiacs.
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 8: HAZARD MOVEMENT                            */}
              {/* ==================================================== */}
              {activePillar === 'hazard_movement' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900">Current Steering Vector</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-mono font-bold text-[10px]">
                        {hazard?.direction_text || '315° NW'}
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-amber-950">
                      {hazard?.current_speed_knots || 14.2} knots <span className="text-xs font-normal text-slate-600">(~26.3 km/h)</span>
                    </div>
                    <p className="text-[10px] text-amber-800 mt-1">
                      Translation motion steered by mid-tropospheric subtropical ridge over Myanmar/East Bay.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Coriolis Beta Drift</span>
                      <div className="font-bold text-slate-800 mt-0.5">+2.4 kn Northward</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Vertical Wind Shear</span>
                      <div className="font-bold text-emerald-700 mt-0.5">8 - 12 knots (Low)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="font-bold text-slate-800 text-xs">Landfall Projected Window:</div>
                    <div className="text-[11px] text-slate-600">
                      Between <b>06:00 UTC</b> and <b>10:00 UTC</b> tomorrow between Kakinada and Visakhapatnam.
                    </div>
                  </div>

                  <button
                    onClick={() => centerMapOn(hazard?.current_lat || 15.85, hazard?.current_lon || 83.42, 8)}
                    className="w-full py-2 rounded-xl bg-[#0B1E36] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Track Steering Axis on Map</span>
                  </button>
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 9: FUTURE IMPACT                              */}
              {/* ==================================================== */}
              {activePillar === 'future_impact' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Interactive Forecast Scrubber:</span>
                    <div className="flex gap-1">
                      {[6, 12, 24, 48].map(hr => (
                        <button
                          key={hr}
                          onClick={() => setFutureTimelineHour(hr)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            futureTimelineHour === hr ? 'bg-[#1D63ED] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          +{hr}h
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-900 text-xs">+{futureTimelineHour} Hours Projected State</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono font-bold text-[10px]">
                        Cone: {futureTimelineHour === 6 ? '15 NM' : futureTimelineHour === 12 ? '30 NM' : futureTimelineHour === 24 ? '55 NM' : '90 NM'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>Pos: <b>{futureTimelineHour === 6 ? '16.4°N, 82.9°E' : futureTimelineHour === 12 ? '16.8°N, 82.4°E' : futureTimelineHour === 24 ? '17.5°N, 81.7°E' : '18.8°N, 80.8°E'}</b></div>
                      <div>Intensity: <b>{futureTimelineHour <= 12 ? '135 km/h' : futureTimelineHour === 24 ? '85 km/h' : '45 km/h'}</b></div>
                      <div>Wave Hs: <b>{futureTimelineHour <= 12 ? '5.4 m' : futureTimelineHour === 24 ? '2.8 m' : '1.2 m'}</b></div>
                      <div>Status: <b className="text-red-700">{futureTimelineHour === 12 ? 'LANDFALL' : futureTimelineHour < 12 ? 'APPROACH' : 'INLAND'}</b></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Forecast Cone Milestones:</div>
                    {(tacticalData?.tracks || []).filter(t => t.track_type.startsWith('PREDICTED')).map((trk, i) => (
                      <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-[11px]">
                        <div>
                          <b className="text-slate-800">{trk.track_type.replace(/_/g, ' ')}</b>
                          <div className="text-[10px] text-slate-500 font-mono">{trk.latitude}°N, {trk.longitude}°E</div>
                        </div>
                        <div className="text-right">
                          <span className="text-red-600 font-bold">{trk.wind_kmh} km/h</span>
                          <div className="text-[10px] text-slate-500">Wave: {trk.wave_m}m</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 10: RESPONSE DIRECTIVES                       */}
              {/* ==================================================== */}
              {activePillar === 'response' && (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold text-[#0B1E36] flex items-center justify-between">
                    <span>Decision Support Directives ({recommendations.length})</span>
                    <span className="text-[10px] text-slate-500 font-medium">1-Click Authorization</span>
                  </div>

                  {recommendations.map(rec => {
                    const isApproved = rec.status === 'APPROVED';
                    return (
                      <div key={rec.id} className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.priority === 'IMMEDIATE' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {rec.priority} • {rec.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Confidence: {rec.confidence_score}%</span>
                        </div>

                        <div className="font-bold text-[#0B1E36] text-xs leading-snug">
                          {rec.action_directive}
                        </div>

                        <p className="text-[11px] text-slate-600 leading-normal">
                          {rec.rationale}
                        </p>

                        <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-mono">ID: {rec.id}</span>
                          {isApproved ? (
                            <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authorized
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveRecommendation(rec.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#1D63ED] hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                            >
                              Authorize Directive
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 11: HISTORICAL ANALYSIS                       */}
              {/* ==================================================== */}
              {activePillar === 'historical_analysis' && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-[#0B1E36] uppercase tracking-wide">
                    Historical Cyclonic Analogs & Lessons Learned
                  </div>

                  <div className="space-y-2">
                    {history.map(hist => (
                      <div key={hist.id} className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0284C7] text-xs">{hist.event_name} ({hist.year})</span>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {hist.analog_similarity_pct}% Similarity
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium">
                          Landfall: {hist.landfall_location} • Peak: {hist.peak_wind_kmh} km/h • Surge: {hist.max_surge_m}m
                        </div>
                        {hist.lessons_learned && (
                          <ul className="mt-1 space-y-0.5 text-[10px] text-slate-600 list-disc list-inside">
                            {hist.lessons_learned.map((lesson, lIdx) => (
                              <li key={lIdx}>{lesson}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* PILLAR 12: PREVENTION & PRECAUTIONARY SAFEGUARDS     */}
              {/* ==================================================== */}
              {activePillar === 'prevention' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-rose-600" />
                        <span className="font-bold text-rose-900 text-xs">Active Fishery Ban Imposed</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono font-bold text-[10px]">
                        ENFORCED
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-800 mt-1.5 leading-relaxed">
                      Complete ban on mechanized, motorized, and traditional fishing operations across Andhra & Odisha coastal waters.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-[#0B1E36]">Harbor & Coastal Barrier Safeguards:</div>
                    {[
                      { measure: 'Lock Gates Closure', status: 'LOCKED', detail: 'Kakinada Canal & Visakhapatnam Inner Basin sluice gates closed' },
                      { measure: '4-Point Storm Moorings', status: 'ENFORCED', detail: 'All berthed trawlers secured with high-tensile nylon hawsers' },
                      { measure: 'NavIC Broadcast Pulse', status: 'TRANSMITTING', detail: 'Priority alert beacon pinging every 15 min on 1176.45 MHz' },
                      { measure: 'Shoreline Sandbagging', status: 'COMPLETED', detail: '20,000 geotextile bags placed at low-lying beach landing ramps' },
                      { measure: 'Bunkering & Fuel Cutoff', status: 'SHUTDOWN', detail: 'Coastal marine fuel jetties sealed to prevent fuel spills' },
                    ].map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{m.measure}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{m.detail}</div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700">
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
