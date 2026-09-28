import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, Mic, Globe, Home, Compass, Map as MapIcon, 
  Navigation, CloudRain, Folder, Brain, TrendingUp, Settings, 
  AlertTriangle, ShieldAlert, Waves, Wind, Sun, Volume2, X, 
  Layers, Ruler, Crosshair, ChevronRight, ChevronLeft, Check, Maximize2, 
  Minimize2, FileText, Info, Eye, EyeOff, Anchor, ShieldCheck, Printer,
  Sliders, ArrowUpRight, Activity, Cpu, Sparkles
} from 'lucide-react';
import { 
  INCOIS_SECTORS, INCOIS_LANDING_CENTRES, 
  INCOIS_PFZ_ADVISORIES, INDIA_EEZ_BOUNDARY, 
  BATHYMETRY_CONTOURS, OCEAN_CURRENTS, SECTOR_BOUNDARIES 
} from '../../data/incoisData';
import { SCREEN1_DATA } from '../../data/mockScreensData';
import MarineApi from '../../services/api';
import ModalPortal from '../ModalPortal';

export default function Screen1ExecutiveBrain({ 
  onNavigateTab, 
  onOpenVoiceModal, 
  onOpenEmergency, 
  onOpenMarineAi,
  initialDockTab = 'layers',
  initialShowBulletin = false,
  initialLandingId = 'rameswaram',
  globalLanguage = 'en',
  translations = {}
}) {
  const t = translations || {};
  const handleOpenAi = onOpenMarineAi;
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const measureLineRef = useRef(null);

  // Search & Language state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState((globalLanguage || 'en').toUpperCase());
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    if (globalLanguage) {
      setSelectedLang(globalLanguage.toUpperCase());
    }
  }, [globalLanguage]);

  // Live Sea State & Ocean Telemetry from Backend
  const [liveSeaState, setLiveSeaState] = useState({
    sst: '28.4 °C',
    waveHeight: '1.2 m',
    windSpeed: '14 kn',
    currentVelocity: '0.38 m/s',
    safetyScore: 92,
    loading: false
  });

  useEffect(() => {
    async function loadLiveSeaData() {
      try {
        const res = await MarineApi.getCurrentMarineData(9.287, 79.312);
        if (res && res.success && res.sea_state) {
          setLiveSeaState({
            sst: `${res.sea_state.sea_surface_temperature_c} °C`,
            waveHeight: `${res.sea_state.wave_height_m} m`,
            windSpeed: `${res.weather?.wind_speed_kn || 14} kn`,
            currentVelocity: `${res.sea_state.ocean_current_velocity_ms || 0.38} m/s`,
            safetyScore: res.safety?.score || 92,
            loading: false
          });
        }
      } catch (err) {
        // Keeps initial reliable state
      }
    }
    loadLiveSeaData();
  }, []);

  // Docked Left Panel State: 'layers' | 'hud' | 'collapsed'
  const [dockTab, setDockTab] = useState(initialDockTab);
  const [isDockOpen, setIsDockOpen] = useState(true);

  // INCOIS Official Geoportal Layer Toggles
  const [incoisLayers, setIncoisLayers] = useState({
    sst: true,
    chlorophyll: true,
    pfzLines: true,
    eez: true,
    sectors: true,
    landingCentres: true,
    bathymetry: true,
    currents: true,
  });

  // Basemap switcher: 'esriImagery' (default INCOIS), 'cartoDark', 'esriTopo', 'osm'
  const [basemapType, setBasemapType] = useState('esriImagery');
  const [selectedSectorId, setSelectedSectorId] = useState('tn');
  const [selectedLandingId, setSelectedLandingId] = useState(initialLandingId);
  const [selectedAdvisory, setSelectedAdvisory] = useState(
    INCOIS_PFZ_ADVISORIES.find(a => a.centreId === initialLandingId) || INCOIS_PFZ_ADVISORIES[0]
  );
  const [mouseCoords, setMouseCoords] = useState({ lat: 9.287, lng: 79.312 });
  const [showLegends, setShowLegends] = useState(true);
  const [showBulletinModal, setShowBulletinModal] = useState(initialShowBulletin);

  // Sync state if initial props change
  useEffect(() => {
    if (initialDockTab) {
      setDockTab(initialDockTab);
      setIsDockOpen(true);
    }
  }, [initialDockTab]);

  useEffect(() => {
    setShowBulletinModal(Boolean(initialShowBulletin));
  }, [initialShowBulletin]);

  useEffect(() => {
    if (initialLandingId) {
      setSelectedLandingId(initialLandingId);
      const adv = INCOIS_PFZ_ADVISORIES.find(a => a.centreId === initialLandingId);
      if (adv) setSelectedAdvisory(adv);
    }
  }, [initialLandingId]);

  // Distance & Bearing Measurement Ruler
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measuredDistance, setMeasuredDistance] = useState(null);

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'TA', name: 'தமிழ் (Tamil)' },
    { code: 'TE', name: 'తెలుగు (Telugu)' },
    { code: 'ML', name: 'മലയാളം (Malayalam)' },
    { code: 'HI', name: 'हिन्दी (Hindi)' },
  ];

  const [mapReady, setMapReady] = useState(false);
  const measureModeRef = useRef(measureMode);
  useEffect(() => {
    measureModeRef.current = measureMode;
  }, [measureMode]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered on South India / Palk Strait / Bay of Bengal
    const map = L.map(mapContainerRef.current, {
      center: [10.2, 80.2],
      zoom: 7,
      minZoom: 5,
      maxZoom: 16,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Mousemove coordinate tracking
    map.on('mousemove', (e) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
      });
    });

    // Distance measure click handler
    map.on('click', (e) => {
      if (!measureModeRef.current) return;

      setMeasurePoints((prev) => {
        if (prev.length >= 2) return [e.latlng];
        const updated = [...prev, e.latlng];
        if (updated.length === 2) {
          const p1 = updated[0];
          const p2 = updated[1];
          const distMeters = map.distance(p1, p2);
          const distKm = (distMeters / 1000).toFixed(2);
          const distNm = (distMeters / 1852).toFixed(2);

          // Calculate initial compass bearing
          const y = Math.sin((p2.lng - p1.lng) * (Math.PI / 180)) * Math.cos(p2.lat * (Math.PI / 180));
          const x =
            Math.cos(p1.lat * (Math.PI / 180)) * Math.sin(p2.lat * (Math.PI / 180)) -
            Math.sin(p1.lat * (Math.PI / 180)) *
              Math.cos(p2.lat * (Math.PI / 180)) *
              Math.cos((p2.lng - p1.lng) * (Math.PI / 180));
          let bearing = (Math.atan2(y, x) * 180) / Math.PI;
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
    setMapReady(true);
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Recalculate and invalidate map size on dock panel state change or window resize
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 150);
    }
  }, [isDockOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Basemap switching & Layer updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing basemap layer & labels
    if (layersRef.current.basemap) {
      map.removeLayer(layersRef.current.basemap);
      layersRef.current.basemap = null;
    }
    if (layersRef.current.basemapLabels) {
      map.removeLayer(layersRef.current.basemapLabels);
      layersRef.current.basemapLabels = null;
    }

    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri World Imagery & INCOIS';
    let labelsUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

    if (basemapType === 'cartoDark') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri Dark Canvas & INCOIS';
      labelsUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
    } else if (basemapType === 'esriTopo') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri Ocean Topography & INCOIS';
      labelsUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}';
    } else if (basemapType === 'osm') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri Street Map & INCOIS';
      labelsUrl = null;
    }

    const basemapLayer = L.tileLayer(tileUrl, { attribution, maxZoom: 18, subdomains: 'abcd' });
    basemapLayer.addTo(map);
    layersRef.current.basemap = basemapLayer;

    if (labelsUrl) {
      const labelsLayer = L.tileLayer(labelsUrl, { maxZoom: 18, subdomains: 'abcd', opacity: 0.9 });
      labelsLayer.addTo(map);
      layersRef.current.basemapLabels = labelsLayer;
    }

    // Helper to safely clear layer group
    const clearGroup = (key) => {
      if (layersRef.current[key]) {
        layersRef.current[key].forEach((layer) => map.removeLayer(layer));
      }
      layersRef.current[key] = [];
    };

    // 1. SST Thermal Gradient Layer
    clearGroup('sst');
    if (incoisLayers.sst) {
      const sstContours = [
        { lat: 9.3, lng: 79.8, temp: 28.6, radius: 55000, color: '#f97316' },
        { lat: 10.1, lng: 80.3, temp: 28.2, radius: 70000, color: '#eab308' },
        { lat: 11.2, lng: 80.5, temp: 27.8, radius: 65000, color: '#1D63ED' },
        { lat: 8.5, lng: 78.8, temp: 29.1, radius: 60000, color: '#ea580c' },
      ];

      sstContours.forEach((c) => {
        const circle = L.circle([c.lat, c.lng], {
          radius: c.radius,
          color: c.color,
          fillColor: c.color,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '3, 4',
        }).bindTooltip(`<b>SST Thermal Boundary: ${c.temp}°C</b><br/>Sensor: Oceansat-3 (SSTM)`, {
          sticky: true,
          className: 'marine-tooltip',
        });
        circle.addTo(map);
        layersRef.current.sst.push(circle);
      });
    }

    // 2. Chlorophyll-a Plumes Layer
    clearGroup('chlorophyll');
    if (incoisLayers.chlorophyll) {
      const chlPlumes = [
        { lat: 9.45, lng: 79.6, chl: '2.4 mg/m³', radius: 35000 },
        { lat: 10.4, lng: 80.1, chl: '1.9 mg/m³', radius: 45000 },
        { lat: 8.8, lng: 78.5, chl: '3.1 mg/m³ (Upwelling)', radius: 38000 },
      ];

      chlPlumes.forEach((p) => {
        const circle = L.circle([p.lat, p.lng], {
          radius: p.radius,
          color: '#059669',
          fillColor: '#10b981',
          fillOpacity: 0.16,
          weight: 1.5,
        }).bindTooltip(`<b>Phytoplankton Bloom (Chl-a): ${p.chl}</b><br/>High Primary Productivity`, {
          sticky: true,
          className: 'marine-tooltip',
        });
        circle.addTo(map);
        layersRef.current.chlorophyll.push(circle);
      });
    }

    // 3. PFZ Lines & Vectors
    clearGroup('pfzLines');
    if (incoisLayers.pfzLines) {
      INCOIS_PFZ_ADVISORIES.forEach((adv) => {
        if (adv.lineCoords && adv.lineCoords.length > 0) {
          const pfzLine = L.polyline(adv.lineCoords, {
            color: '#1D63ED',
            weight: 3.5,
            opacity: 0.95,
          }).bindTooltip(
            `<b>PFZ Vector: ${adv.centreName}</b><br/>Distance: ${adv.distanceKm} km | Bearing: ${adv.bearing}<br/>Depth: ${adv.depthMeters}<br/>Target: ${adv.targetFishes}`,
            { sticky: true, className: 'marine-tooltip' }
          );
          pfzLine.addTo(map);
          layersRef.current.pfzLines.push(pfzLine);

          // Center coordinate marker
          const targetMarker = L.circleMarker(adv.lineCoords[adv.lineCoords.length - 1], {
            radius: 5,
            color: '#FFFFFF',
            fillColor: '#1D63ED',
            fillOpacity: 1,
            weight: 2,
          }).bindTooltip(`<b>PFZ Core Intercept</b><br/>${adv.centreName}`, { className: 'marine-tooltip' });
          targetMarker.addTo(map);
          layersRef.current.pfzLines.push(targetMarker);
        }
      });
    }

    // 4. India 200 NM Exclusive Economic Zone (EEZ)
    clearGroup('eez');
    if (incoisLayers.eez) {
      const eezLine = L.polyline(INDIA_EEZ_BOUNDARY, {
        color: '#d97706',
        weight: 2,
        dashArray: '8, 6',
        opacity: 0.9,
      }).bindTooltip('<b>India Exclusive Economic Zone (EEZ) – 200 NM</b><br/>National Maritime Sovereign Boundary', {
        sticky: true,
        className: 'marine-tooltip',
      });
      eezLine.addTo(map);
      layersRef.current.eez.push(eezLine);
    }

    // 5. GEBCO Bathymetry Depth Contours
    clearGroup('bathymetry');
    if (incoisLayers.bathymetry) {
      BATHYMETRY_CONTOURS.forEach((contour) => {
        if (contour.coordinates && contour.coordinates.length > 0) {
          const line = L.polyline(contour.coordinates, {
            color: contour.color || '#0284c7',
            weight: contour.weight || 1.8,
            opacity: 0.8,
            dashArray: contour.dashArray || undefined,
          }).bindTooltip(`<b>Bathymetry Depth Contour: ${contour.depth}</b>`, {
            sticky: true,
            className: 'marine-tooltip',
          });
          line.addTo(map);
          layersRef.current.bathymetry.push(line);
        }
      });
    }

    // 6. Coastal Landing Centres / Harbours
    clearGroup('landingCentres');
    if (incoisLayers.landingCentres) {
      INCOIS_LANDING_CENTRES.forEach((centre) => {
        const marker = L.circleMarker([centre.lat, centre.lng], {
          radius: 5.5,
          color: '#FFFFFF',
          fillColor: '#0B1E36',
          fillOpacity: 1,
          weight: 2,
        }).bindTooltip(`<b>${centre.name}</b><br/>Sector: ${centre.sector}<br/>Active Craft: ${centre.craftCount}`, {
          className: 'marine-tooltip',
        });

        marker.on('click', () => {
          setSelectedLandingId(centre.id);
          const adv = INCOIS_PFZ_ADVISORIES.find((a) => a.centreId === centre.id);
          if (adv) {
            setSelectedAdvisory(adv);
            setShowBulletinModal(true);
          }
        });

        marker.addTo(map);
        layersRef.current.landingCentres.push(marker);
      });
    }

    // 7. Ocean Surface Currents Layer
    clearGroup('currents');
    if (incoisLayers.currents && OCEAN_CURRENTS) {
      OCEAN_CURRENTS.forEach((c) => {
        const endLat = c.lat + c.v * 0.4;
        const endLng = c.lng + c.u * 0.4;

        const currentLine = L.polyline([[c.lat, c.lng], [endLat, endLng]], {
          color: '#6366f1',
          weight: 2,
          opacity: 0.85,
        }).bindTooltip(`<b>Ocean Current Vector</b><br/>Speed: ${c.speed}<br/>Direction: ${c.dir}`, {
          className: 'marine-tooltip',
        });
        currentLine.addTo(map);
        layersRef.current.currents.push(currentLine);

        const tipMarker = L.circleMarker([endLat, endLng], {
          radius: 2.5,
          color: '#818cf8',
          fillColor: '#818cf8',
          fillOpacity: 1,
          weight: 1,
        });
        tipMarker.addTo(map);
        layersRef.current.currents.push(tipMarker);
      });
    }

    // 8. Sector Inter-State Boundary Lines
    clearGroup('sectors');
    if (incoisLayers.sectors && SECTOR_BOUNDARIES) {
      SECTOR_BOUNDARIES.forEach((sec) => {
        const line = L.polyline(sec.coords, {
          color: sec.color || '#94a3b8',
          weight: 1.5,
          dashArray: '5, 5',
          opacity: 0.7,
        }).bindTooltip(`<b>${sec.name}</b>`, { className: 'marine-tooltip' });
        line.addTo(map);
        layersRef.current.sectors.push(line);
      });
    }

    // 9. Active Vessel Marker (Rameswaram Base)
    clearGroup('vessel');
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
    const vessel = L.marker([9.2876, 79.3129], { icon: vesselIcon })
      .bindTooltip('<b>Vessel IND-TN-04-MM-8842</b><br/>Status: Operational / Monitoring PFZ', {
        permanent: true,
        direction: 'top',
        className: 'marine-tooltip',
      })
      .addTo(map);
    layersRef.current.vessel = [vessel];
  }, [incoisLayers, basemapType, mapReady]);

  // Update Distance Measurement Line on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (measureLineRef.current) {
      map.removeLayer(measureLineRef.current);
      measureLineRef.current = null;
    }

    if (measurePoints.length === 2) {
      measureLineRef.current = L.polyline(measurePoints, {
        color: '#dc2626',
        weight: 2.5,
        dashArray: '5, 5',
      }).addTo(map);
    }
  }, [measurePoints]);

  const toggleIncoisLayer = (key) => {
    setIncoisLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectSector = (sectorId) => {
    setSelectedSectorId(sectorId);
    const sector = INCOIS_SECTORS.find((s) => s.id === sectorId);
    if (sector && mapInstanceRef.current) {
      mapInstanceRef.current.setView(sector.center, sector.zoom, { animate: true });
    }
  };

  const handleSelectLandingCentre = (centreId) => {
    setSelectedLandingId(centreId);
    const centre = INCOIS_LANDING_CENTRES.find((c) => c.id === centreId);
    if (centre && mapInstanceRef.current) {
      mapInstanceRef.current.setView([centre.lat, centre.lng], 9.5, { animate: true });
      const adv = INCOIS_PFZ_ADVISORIES.find((a) => a.centreId === centre.id);
      if (adv) setSelectedAdvisory(adv);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-[#F8FAFC] text-[#0F2942] font-sans">
        {/* Top Header Bar */}
        <header className="h-11 bg-[#FFFFFF] border-b border-[#E2E8F0] px-3 sm:px-4 flex items-center justify-between gap-4 z-20 shrink-0">
          {/* Search bar — Crisp architectural styling */}
          <div className="flex-1 max-w-md relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nautical coordinates, PFZ zones, or ports..."
              className="w-full pl-8.5 pr-20 py-1.5 rounded-[3px] bg-[#F4F8FA] border border-[#E2E8F0] text-xs text-[#0F2942] placeholder-[#64748B] focus:outline-none focus:border-[#1D63ED] transition font-medium"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                onClick={onOpenVoiceModal}
                className="w-5.5 h-5.5 rounded-[2px] bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#1D63ED] border border-[#E2E8F0] flex items-center justify-center transition cursor-pointer"
                title="Voice Assistant"
              >
                <Mic className="w-3 h-3" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen((prev) => !prev)}
                  className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-semibold bg-[#FFFFFF] text-[#0B1E36] border border-[#E2E8F0] hover:bg-[#F0F9FF] transition"
                >
                  {selectedLang} ▾
                </button>
                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[3px] shadow-lg py-1 z-50 text-xs">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setSelectedLang(l.code);
                          setIsLangMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#F0F9FF] text-[#0F2942] text-[11px] flex items-center justify-between"
                      >
                        <span>{l.name}</span>
                        {selectedLang === l.code && <Check className="w-3 h-3 text-[#1D63ED] font-bold" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick status & Live Indicator */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#64748B] text-[11px] hidden sm:inline">Rameswaram Fishing Sector</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#F0F9FF] border border-[#E2E8F0] text-[11px] font-medium text-[#0B1E36] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D63ED]" />
              <span>INCOIS Live</span>
            </div>
          </div>
        </header>

        {/* Center Workspace: 100% Full-Viewport Ocean Map with Floating Overlay Drawer */}
        <div className="flex-1 relative flex flex-col min-w-0 h-full overflow-hidden isolate z-0 bg-[#0B1E36]">
          {/* The Leaflet Map Engine */}
          <div ref={mapContainerRef} className="w-full h-full z-0 map-canvas-container" />

          {/* Floating INCOIS Layers & HUD Drawer */}
          {isDockOpen && (
            <div className="absolute top-3 left-3 bottom-3 z-30 w-80 sm:w-88 bg-[#FFFFFF]/98 backdrop-blur-md rounded-[8px] border border-[#E2E8F0] shadow-2xl flex flex-col overflow-hidden text-left animate-in fade-in duration-200">
              {/* Drawer Header */}
              <div className="p-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[3px] bg-[#0B1E36] text-white flex items-center justify-center font-bold text-xs">
                    <Layers className="w-3.5 h-3.5 text-[#E0F2FE]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0B1E36]">INCOIS Ocean Layers</h3>
                    <p className="text-[10px] text-[#64748B]">Satellite GIS & Marine Advisories</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDockOpen(false)}
                  className="w-6 h-6 rounded-[3px] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0B1E36] flex items-center justify-center text-xs font-bold transition cursor-pointer"
                  title="Close Drawer"
                >
                  ✕
                </button>
              </div>

              {/* Tab Selector Header */}
              <div className="p-2 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-1 bg-[#F0F9FF] p-0.5 rounded-[3px] border border-[#E2E8F0]">
                  <button
                    onClick={() => setDockTab('layers')}
                    className={`px-3 py-1 rounded-[2px] text-xs font-semibold transition flex items-center gap-1.5 ${
                      dockTab === 'layers' 
                        ? 'bg-[#FFFFFF] text-[#0B1E36] border border-[#E2E8F0] shadow-xs' 
                        : 'text-[#64748B] hover:text-[#0F2942]'
                    }`}
                  >
                    <Layers className="w-3 h-3 text-[#1D63ED]" />
                    <span>INCOIS Layers</span>
                  </button>

                  <button
                    onClick={() => setDockTab('hud')}
                    className={`px-3 py-1 rounded-[2px] text-xs font-semibold transition flex items-center gap-1.5 ${
                      dockTab === 'hud' 
                        ? 'bg-[#FFFFFF] text-[#0B1E36] border border-[#E2E8F0] shadow-xs' 
                        : 'text-[#64748B] hover:text-[#0F2942]'
                    }`}
                  >
                    <Waves className="w-3 h-3 text-[#1D63ED]" />
                    <span>Ocean State</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsDockOpen(false)}
                  className="w-6 h-6 rounded-[2px] hover:bg-[#F0F9FF] flex items-center justify-center text-[#64748B] hover:text-[#0F2942] transition"
                  title="Collapse Panel (Maximize Map)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* TAB 1: GIS Layers & Sectors */}
              {dockTab === 'layers' && (
                <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs">
                  {/* Sector Picker */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                      Maritime Sector
                    </label>
                    <select
                      value={selectedSectorId}
                      onChange={(e) => handleSelectSector(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E2E8F0] text-xs text-[#0F2942] rounded-[3px] p-2 focus:outline-none focus:border-[#1D63ED] font-medium"
                    >
                      {INCOIS_SECTORS.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Landing Centre Picker */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                      Landing Centre / Harbour
                    </label>
                    <select
                      value={selectedLandingId}
                      onChange={(e) => handleSelectLandingCentre(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E2E8F0] text-xs text-[#0F2942] rounded-[3px] p-2 focus:outline-none focus:border-[#1D63ED] font-medium"
                    >
                      {INCOIS_LANDING_CENTRES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.sector})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Layer Checkboxes */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block pb-0.5">
                      Active Telemetry Overlays
                    </span>

                    <label className="flex items-center justify-between p-2 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F0F9FF] cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={incoisLayers.sst}
                          onChange={() => toggleIncoisLayer('sst')}
                          className="accent-[#1D63ED] rounded-[2px]"
                        />
                        <span className="text-xs text-[#0F2942] font-medium">Sea Surface Temperature (SST)</span>
                      </div>
                      <span className="w-2 h-2 rounded-[2px] bg-[#f97316]" />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F0F9FF] cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={incoisLayers.chlorophyll}
                          onChange={() => toggleIncoisLayer('chlorophyll')}
                          className="accent-[#1D63ED] rounded-[2px]"
                        />
                        <span className="text-xs text-[#0F2942] font-medium">Chlorophyll-a Plumes</span>
                      </div>
                      <span className="w-2 h-2 rounded-[2px] bg-[#059669]" />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F0F9FF] cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={incoisLayers.pfzLines}
                          onChange={() => toggleIncoisLayer('pfzLines')}
                          className="accent-[#1D63ED] rounded-[2px]"
                        />
                        <span className="text-xs text-[#0F2942] font-medium">PFZ Advisory Vectors</span>
                      </div>
                      <span className="w-2 h-2 rounded-[2px] bg-[#1D63ED]" />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F0F9FF] cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={incoisLayers.eez}
                          onChange={() => toggleIncoisLayer('eez')}
                          className="accent-[#1D63ED] rounded-[2px]"
                        />
                        <span className="text-xs text-[#0F2942] font-medium">India EEZ (200 NM Limit)</span>
                      </div>
                      <span className="w-2 h-2 rounded-[2px] bg-[#d97706]" />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F0F9FF] cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={incoisLayers.landingCentres}
                          onChange={() => toggleIncoisLayer('landingCentres')}
                          className="accent-[#1D63ED] rounded-[2px]"
                        />
                        <span className="text-xs text-[#0F2942] font-medium">Landing Centres / Harbours</span>
                      </div>
                      <span className="w-2 h-2 rounded-[2px] bg-[#0B1E36]" />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F0F9FF] cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={incoisLayers.bathymetry}
                          onChange={() => toggleIncoisLayer('bathymetry')}
                          className="accent-[#1D63ED] rounded-[2px]"
                        />
                        <span className="text-xs text-[#0F2942] font-medium">GEBCO Bathymetry Contours</span>
                      </div>
                      <span className="w-2 h-2 rounded-[2px] bg-[#0284c7]" />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F0F9FF] cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={incoisLayers.currents}
                          onChange={() => toggleIncoisLayer('currents')}
                          className="accent-[#1D63ED] rounded-[2px]"
                        />
                        <span className="text-xs text-[#0F2942] font-medium">Ocean Currents (m/s)</span>
                      </div>
                      <span className="w-2 h-2 rounded-[2px] bg-[#6366f1]" />
                    </label>
                  </div>

                  {/* Active PFZ Advisory Box */}
                  <div className="p-3 rounded-[3px] bg-[#F0F9FF] border border-[#E2E8F0] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#0B1E36] uppercase tracking-wider">
                        PFZ Advisory Summary
                      </span>
                      <button
                        onClick={() => setShowBulletinModal(true)}
                        className="text-[10px] px-1.5 py-0.5 rounded-[2px] bg-[#FFFFFF] text-[#1D63ED] border border-[#E2E8F0] hover:bg-[#E0F2FE] font-semibold"
                      >
                        Full Bulletin →
                      </button>
                    </div>
                    <p className="text-[#0B1E36] font-semibold text-xs">
                      {selectedAdvisory.centreName}: {selectedAdvisory.distanceKm} km {selectedAdvisory.bearing}
                    </p>
                    <p className="text-[11px] text-[#1D63ED] font-mono font-medium">Depth: {selectedAdvisory.depthMeters}</p>
                    <p className="text-[10px] text-[#64748B]">{selectedAdvisory.targetFishes}</p>
                  </div>
                </div>
              )}

              {/* TAB 2: Ocean State & Live Alerts HUD */}
              {dockTab === 'hud' && (
                <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs">
                  {/* Ocean at a Glance Grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                      Live Oceanographic Conditions
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[10px] font-medium">SST (Live Open-Meteo)</span>
                        <span className="font-bold text-[#0B1E36] text-sm font-mono">{liveSeaState.sst}</span>
                        <span className="text-[9px] text-[#1D63ED] font-medium block mt-0.5">ISRO Thermal Front</span>
                      </div>
                      <div className="p-2.5 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[10px] font-medium">Significant Wave</span>
                        <span className="font-bold text-[#0B1E36] text-sm font-mono">{liveSeaState.waveHeight}</span>
                        <span className="text-[9px] text-[#1D63ED] font-medium block mt-0.5">Douglas Sea State</span>
                      </div>
                      <div className="p-2.5 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[10px] font-medium">Surface Wind</span>
                        <span className="font-bold text-[#0B1E36] text-sm font-mono">{liveSeaState.windSpeed}</span>
                        <span className="text-[9px] text-[#64748B] font-medium block mt-0.5">ECMWF High Res</span>
                      </div>
                      <div className="p-2.5 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[10px] font-medium">Current Velocity</span>
                        <span className="font-bold text-[#0B1E36] text-sm font-mono">{liveSeaState.currentVelocity}</span>
                        <span className="text-[9px] text-[#64748B] font-medium block mt-0.5">INCOIS Tidal Model</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Coastal Alerts */}
                  <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                      Active Coastal Warnings (2)
                    </span>
                    <div className="p-2.5 rounded-[3px] bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs flex items-start gap-2">
                      <span className="text-amber-600">⚠️</span>
                      <div>
                        <strong className="block text-[#92400E] font-semibold">High Wind Advisory</strong>
                        <span className="text-[11px] text-[#78350F]">Wind speeds expected to peak at 22 kn near Gulf of Mannar after 16:00 IST.</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-[3px] bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-start gap-2">
                      <span className="text-red-600">🛑</span>
                      <div>
                        <strong className="block text-[#991B1B] font-semibold">Restricted Naval Arc</strong>
                        <span className="text-[11px] text-[#7F1D1D]">Live firing arc active 18 km South-East. Geofenced on map.</span>
                      </div>
                    </div>
                  </div>

                  {/* Satellite Provenance */}
                  <div className="p-2.5 rounded-[3px] bg-[#F0F9FF] border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] font-bold text-[#0B1E36] uppercase tracking-wider block">
                      Data Freshness Guardian
                    </span>
                    <p className="text-[11px] text-[#64748B]">Oceansat-3 SST pass: 06:14 IST (4h ago)</p>
                    <p className="text-[11px] text-[#64748B]">MODIS-Aqua Chl: 04:30 IST (6h ago)</p>
                    <span className="text-[10px] text-[#1D63ED] font-medium block">● High Confidence Evidence</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Floating Top Control Bar — Clean, Structured Toolstrip */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
            {/* Left Drawer Button & Quick Layer Chips */}
            <div className="pointer-events-auto flex items-center gap-2">
              {!isDockOpen && (
                <button
                  onClick={() => setIsDockOpen(true)}
                  className="px-3 py-1.5 rounded-[4px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs text-xs font-semibold text-[#0B1E36] flex items-center gap-1.5 hover:bg-[#F0F9FF] transition cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#1D63ED]" />
                  <span>Layers & HUD</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                </button>
              )}

              {/* Quick layer filter chips */}
              <div className="hidden md:flex items-center gap-1 bg-[#FFFFFF]/95 backdrop-blur-md px-2 py-1 rounded-[4px] border border-[#E2E8F0] shadow-xs text-[11px]">
                <button
                  onClick={() => setIncoisLayers((prev) => ({ ...prev, sst: !prev.sst }))}
                  className={`px-2 py-0.5 rounded-[3px] font-medium transition cursor-pointer ${
                    incoisLayers.sst ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                  }`}
                >
                  SST
                </button>
                <button
                  onClick={() => setIncoisLayers((prev) => ({ ...prev, chlorophyll: !prev.chlorophyll }))}
                  className={`px-2 py-0.5 rounded-[3px] font-medium transition cursor-pointer ${
                    incoisLayers.chlorophyll ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                  }`}
                >
                  Chl-a
                </button>
                <button
                  onClick={() => setIncoisLayers((prev) => ({ ...prev, pfzLines: !prev.pfzLines }))}
                  className={`px-2 py-0.5 rounded-[3px] font-medium transition cursor-pointer ${
                    incoisLayers.pfzLines ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                  }`}
                >
                  PFZ
                </button>
                <button
                  onClick={() => setIncoisLayers((prev) => ({ ...prev, eez: !prev.eez }))}
                  className={`px-2 py-0.5 rounded-[3px] font-medium transition cursor-pointer ${
                    incoisLayers.eez ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                  }`}
                >
                  EEZ
                </button>
                <button
                  onClick={() => setIncoisLayers((prev) => ({ ...prev, bathymetry: !prev.bathymetry }))}
                  className={`px-2 py-0.5 rounded-[3px] font-medium transition cursor-pointer ${
                    incoisLayers.bathymetry ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                  }`}
                >
                  Depth
                </button>
                <button
                  onClick={() => setIncoisLayers((prev) => ({ ...prev, currents: !prev.currents }))}
                  className={`px-2 py-0.5 rounded-[3px] font-medium transition cursor-pointer ${
                    incoisLayers.currents ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                  }`}
                >
                  Currents
                </button>
              </div>
            </div>

            {/* Right Floating GIS Toolstrip */}
            <div className="pointer-events-auto flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-[4px] border border-[#E2E8F0] shadow-xs text-xs">
              {/* Measurement Tool */}
              <button
                onClick={() => {
                  setMeasureMode((prev) => !prev);
                  setMeasurePoints([]);
                  setMeasuredDistance(null);
                }}
                className={`px-2.5 py-1 rounded-[3px] transition flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                  measureMode ? 'bg-[#0B1E36] text-white' : 'text-[#0F2942] hover:bg-[#F0F9FF]'
                }`}
                title="Click 2 points on ocean to measure Nautical Miles & Bearing"
              >
                <Ruler className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span>{measureMode ? 'Measuring...' : 'Measure'}</span>
              </button>

              {/* Legends Toggle */}
              <button
                onClick={() => setShowLegends((prev) => !prev)}
                className={`p-1 rounded-[3px] transition cursor-pointer ${
                  showLegends ? 'bg-[#F0F9FF] text-[#1D63ED]' : 'text-[#64748B] hover:bg-[#F0F9FF]'
                }`}
                title="Toggle Legends"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              {/* Print Bulletin */}
              <button
                onClick={() => setShowBulletinModal(true)}
                className="p-1 rounded-[3px] text-[#64748B] hover:bg-[#F0F9FF] transition cursor-pointer"
                title="Official Bulletin"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {/* Basemap Switcher */}
              <select
                value={basemapType}
                onChange={(e) => setBasemapType(e.target.value)}
                className="bg-[#FFFFFF] text-[#0F2942] border border-[#E2E8F0] text-[11px] rounded-[3px] px-2 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="esriImagery">{t.satellite || 'Satellite'}</option>
                <option value="osm">{t.streets || 'Streets'}</option>
                <option value="esriTopo">{t.ocean || 'Ocean'}</option>
                <option value="cartoDark">{t.dark || 'Dark'}</option>
              </select>

              {/* Coordinate Readout */}
              <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 bg-[#F0F9FF] rounded-[3px] text-[10px] font-mono text-[#0B1E36] border border-[#E2E8F0]">
                <Crosshair className="w-3 h-3 text-[#1D63ED]" />
                <span>{mouseCoords.lat}° N, {mouseCoords.lng}° E</span>
              </div>
            </div>
          </div>

          {/* Distance Measurement Result Banner */}
          {measuredDistance && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-[#FFFFFF] px-3.5 py-1.5 rounded-[4px] border border-[#E2E8F0] shadow-md flex items-center gap-3 text-xs">
              <span className="font-semibold text-[#0B1E36] flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span>Distance:</span>
              </span>
              <span className="font-bold text-[#0B1E36] font-mono text-sm">{measuredDistance.km} km</span>
              <span className="font-bold text-[#1D63ED] font-mono text-sm">({measuredDistance.nm} NM)</span>
              <span className="text-[#64748B] font-mono font-medium">Bearing: {measuredDistance.bearing}°</span>
              <button
                onClick={() => {
                  setMeasurePoints([]);
                  setMeasuredDistance(null);
                }}
                className="text-[#64748B] hover:text-[#0F2942] ml-2 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Floating Legends & Marine AI Cluster at Bottom-Right of Map */}
          <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2 pointer-events-auto max-w-[calc(100%-24px)]">
            {/* Marine AI Floating Panel */}
            <button
              onClick={handleOpenAi || onOpenVoiceModal}
              className="group px-3 py-1.5 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] text-[#0F2942] text-xs shadow-xs border border-[#E2E8F0] hover:border-[#1D63ED] transition-all flex items-center gap-2 cursor-pointer"
              title="Open Marine AI Multi-Agent Intelligence"
            >
              <div className="w-4.5 h-4.5 rounded-[3px] bg-[#0B1E36] flex items-center justify-center text-[#E0F2FE] text-[9px] font-mono font-bold">
                ✦
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[11px] text-[#0B1E36] tracking-tight">{t.marineAi || 'Marine AI'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D63ED]" />
                </div>
                <span className="text-[9px] text-[#1D63ED] font-medium leading-none">16 Agents Operational</span>
              </div>
            </button>

            {/* Colorbar Legends */}
            {showLegends && (
              <div className="flex items-end gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar max-w-full">
                {incoisLayers.sst && (
                  <div className="w-18 sm:w-20 bg-[#FFFFFF] p-1.5 sm:p-2 rounded-[4px] border border-[#E2E8F0] shadow-xs text-[#0F2942] text-center text-xs shrink-0">
                    <div className="font-bold text-[9px] mb-1 text-[#0B1E36]">SST (°C)</div>
                    <div
                      className="h-14 sm:h-16 w-3 mx-auto rounded-[2px] flex flex-col justify-between items-center text-[7px] sm:text-[7.5px] font-mono text-white font-bold"
                      style={{
                        background: 'linear-gradient(to bottom, #ef4444, #f97316, #eab308, #1D63ED, #0B1E36)',
                        padding: '1px 0',
                      }}
                    >
                      <span className="drop-shadow">32°</span>
                      <span className="drop-shadow">28°</span>
                      <span className="drop-shadow">24°</span>
                    </div>
                  </div>
                )}

                {incoisLayers.chlorophyll && (
                  <div className="w-20 sm:w-22 bg-[#FFFFFF] p-1.5 sm:p-2 rounded-[4px] border border-[#E2E8F0] shadow-xs text-[#0F2942] text-center text-xs shrink-0">
                    <div className="font-bold text-[9px] mb-1 text-[#0B1E36] leading-tight">Chl (mg/m³)</div>
                    <div
                      className="h-14 sm:h-16 w-3 mx-auto rounded-[2px] flex flex-col justify-between items-center text-[7px] sm:text-[7.5px] font-mono text-white font-bold"
                      style={{
                        background: 'linear-gradient(to bottom, #ef4444, #eab308, #84cc16, #1D63ED, #0B1E36)',
                        padding: '1px 0',
                      }}
                    >
                      <span className="drop-shadow">10.0</span>
                      <span className="drop-shadow">1.5</span>
                      <span className="drop-shadow">0.05</span>
                    </div>
                  </div>
                )}

                {incoisLayers.bathymetry && (
                  <div className="w-22 sm:w-24 bg-[#FFFFFF] p-1.5 sm:p-2 rounded-[4px] border border-[#E2E8F0] shadow-xs text-[#0F2942] text-center text-xs shrink-0">
                    <div className="font-bold text-[9px] mb-1 text-[#0B1E36] leading-tight">Depth (m)</div>
                    <div className="space-y-1 text-[7.5px] sm:text-[8px] font-mono font-medium text-left px-0.5">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-[2px] bg-[#38bdf8]" />
                        <span>20 m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-[2px] bg-[#0284c7]" />
                        <span>50 m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-[2px] bg-[#1d4ed8]" />
                        <span>200 m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-[2px] bg-[#0B1E36]" />
                        <span>1000 m</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Master Action Strip — Architectural Sleek Action Bar */}
        <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0] px-4 py-2 z-20 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenVoiceModal}
                className="px-3 py-1.5 rounded-[4px] bg-[#1D63ED] hover:bg-[#1550c7] text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{t.talkToMarineAi || 'Talk to Marine AI'}</span>
                <span className="text-[10px] text-blue-100 font-mono hidden sm:inline">• 13 Lang</span>
              </button>

              <button
                onClick={() => setShowBulletinModal(true)}
                className="px-3 py-1.5 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#E2E8F0] text-[#0B1E36] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span>INCOIS Bulletin</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('screen-2')}
                className="px-3 py-1.5 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#E2E8F0] text-[#0B1E36] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#0B1E36]" />
                <span>{t.planMission || 'Plan Mission'} →</span>
              </button>

              <button
                onClick={() => onNavigateTab('screen-5')}
                className="px-3 py-1.5 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#E2E8F0] text-[#0B1E36] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer hidden md:flex"
              >
                <Brain className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span>16 Agents</span>
              </button>

              <button
                onClick={onOpenEmergency}
                className="px-3 py-1.5 rounded-[4px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                <span>SOS 1093</span>
              </button>
            </div>
          </div>
        </footer>

      {/* Official INCOIS PFZ Advisory Bulletin Modal — Executive Document Styling */}
      <ModalPortal isOpen={Boolean(showBulletinModal)} onClose={() => setShowBulletinModal(false)}>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px] w-full max-w-lg shadow-xl overflow-hidden text-[#0F2942] flex flex-col max-h-[90vh]">
            <div className="p-3.5 bg-[#F0F9FF] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[2px] bg-[#0B1E36] text-white flex items-center justify-center font-bold text-xs">
                  🐟
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0B1E36] uppercase tracking-wide">INCOIS PFZ Advisory Bulletin</h3>
                  <p className="text-[10px] text-[#64748B] font-mono">Ministry of Earth Sciences, Govt. of India</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulletinModal(false)}
                className="w-6 h-6 rounded-[2px] hover:bg-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F2942]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-[3px] bg-[#F4F8FA] border border-[#E2E8F0] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#64748B] text-[10px] block font-medium">LANDING CENTRE</span>
                  <span className="font-semibold text-[#0B1E36] text-xs">{selectedAdvisory.centreName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] block font-medium">DIRECTION & BEARING</span>
                  <span className="font-semibold text-[#1D63ED] font-mono text-xs">{selectedAdvisory.bearing}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] block font-medium">DISTANCE OFFSHORE</span>
                  <span className="font-semibold text-[#0B1E36] font-mono text-xs">{selectedAdvisory.distanceKm} km ({selectedAdvisory.distanceNm} NM)</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] block font-medium">BATHYMETRY DEPTH</span>
                  <span className="font-semibold text-[#059669] font-mono text-xs">{selectedAdvisory.depthMeters}</span>
                </div>
              </div>

              <div className="p-3 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold text-[#0B1E36] uppercase tracking-wider block">Target Pelagic Species</span>
                <p className="text-[#0F2942] font-medium">{selectedAdvisory.targetFishes}</p>
                <p className="text-[10px] text-[#64748B] mt-1">Derived from Oceansat-3 & MODIS-Aqua SST/Chlorophyll thermal front synthesis.</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748B] px-1">
                <span>Advisory Validity:</span>
                <span className="font-semibold text-[#0B1E36] font-mono">{selectedAdvisory.validity}</span>
              </div>
            </div>

            <div className="p-3 bg-[#F4F8FA] border-t border-[#E2E8F0] flex justify-end gap-2">
              <button
                onClick={() => setShowBulletinModal(false)}
                className="px-4 py-1.5 rounded-[3px] bg-[#0B1E36] hover:bg-[#1E40AF] text-white font-medium text-xs transition"
              >
                Close Bulletin
              </button>
            </div>
          </div>
      </ModalPortal>
    </div>
  );
}
