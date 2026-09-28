import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Brain, Search, Sparkles, Send, Waves, Wind, 
  CheckCircle2, ArrowRight, TrendingUp, Info, ChevronDown, 
  Plus, Minus, Crosshair, MapPin, FileText, Check,
  Thermometer, Droplets, Navigation, RefreshCw, Layers, X, Database
} from 'lucide-react';
import MarineApi from '../../services/api';

export default function ScreenScientificAiPage({
  onNavigateTab,
  onOpenFamilyLink,
  isDualView = false,
  onToggleDualView
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeLayer, setActiveLayer] = useState('SST');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Quick stats state
  const [opportunityLevel, setOpportunityLevel] = useState('High');
  const [confidence, setConfidence] = useState(82);
  const [sstValue, setSstValue] = useState('26.8 °C');
  const [chlorophyllLevel, setChlorophyllLevel] = useState('High');
  const [windSpeed, setWindSpeed] = useState('12 km/h');

  // Analysis narrative
  const [analysisText, setAnalysisText] = useState(
    'The selected area shows high fishing opportunity based on favorable sea surface temperature, elevated chlorophyll concentration, and active PFZ conditions. The convergence zone suggests increased biological productivity, attracting pelagic fish aggregations. Current weather and sea state are suitable for safe trawler operation.'
  );

  // What-If state
  const [whatIfCondition, setWhatIfCondition] = useState('Increase Wind Speed');
  const [whatIfValue, setWhatIfValue] = useState('+10 km/h');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(
    'Fishing opportunity may decrease to Moderate (56%) due to increased wind and higher wave swell (+0.8m).'
  );

  // Modals for progressive disclosure
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);

  // Map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const overlayLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Bay of Bengal / Andhra Coast (15.24 N, 82.16 E)
    const map = L.map(mapContainerRef.current, {
      center: [15.24, 82.16],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    // Satellite basemap
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 17,
    }).addTo(map);

    // Thermal color contours overlay
    const thermalBounds = [
      [13.8, 80.5],
      [16.8, 84.0]
    ];

    const thermalSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%" style="opacity: 0.72; mix-blend-mode: color-dodge;">
        <defs>
          <radialGradient id="thermalPlume" cx="58%" cy="48%" r="45%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9" />
            <stop offset="25%" stop-color="#f59e0b" stop-opacity="0.85" />
            <stop offset="50%" stop-color="#10b981" stop-opacity="0.75" />
            <stop offset="75%" stop-color="#06b6d4" stop-opacity="0.65" />
            <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.2" />
          </radialGradient>
          <radialGradient id="coolerPocket" cx="30%" cy="30%" r="35%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.8" />
            <stop offset="70%" stop-color="#1e3a8a" stop-opacity="0.3" />
            <stop offset="100%" stop-color="transparent" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="600" fill="url(#thermalPlume)" />
        <circle cx="280" cy="220" r="260" fill="url(#coolerPocket)" />
      </svg>
    `;
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(thermalSvg);
    const overlay = L.imageOverlay(svgUrl, thermalBounds, { opacity: 0.78 }).addTo(map);
    overlayLayerRef.current = overlay;

    // Custom Marker for "High Fishing Opportunity" Tooltip at 15.24, 82.16
    const customPinIcon = L.divIcon({
      className: 'custom-opportunity-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            background: #0f172a; 
            color: #ffffff; 
            padding: 5px 9px; 
            border-radius: 6px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.4); 
            border: 1px solid #334155; 
            white-space: nowrap; 
            margin-bottom: 4px;
            text-align: left;
            font-family: system-ui, -apple-system, sans-serif;
          ">
            <div style="display: flex; align-items: center; gap: 5px; font-weight: 700; font-size: 10px; color: #f8fafc;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22c55e;"></span>
              High Fishing Opportunity
            </div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 1px;">
              Confidence: <strong style="color: #38bdf8;">82%</strong> • <span style="font-family: monospace; font-size: 8px;">15.24° N, 82.16° E</span>
            </div>
          </div>
          <div style="
            width: 12px; 
            height: 12px; 
            background: #ffffff; 
            border: 2.5px solid #1d4ed8; 
            border-radius: 50%; 
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
          "></div>
        </div>
      `,
      iconSize: [150, 60],
      iconAnchor: [75, 55]
    });

    L.marker([15.24, 82.16], { icon: customPinIcon }).addTo(map);

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Map Layer
  const handleLayerChange = (layerName) => {
    setActiveLayer(layerName);
    if (!mapInstanceRef.current || !overlayLayerRef.current) return;

    let svgContent = '';
    if (layerName === 'Chlorophyll') {
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%" style="opacity: 0.65;">
          <defs>
            <radialGradient id="chloro" cx="55%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#15803d" stop-opacity="0.85" />
              <stop offset="35%" stop-color="#22c55e" stop-opacity="0.75" />
              <stop offset="70%" stop-color="#86efac" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#0284c7" stop-opacity="0.2" />
            </radialGradient>
          </defs>
          <rect width="800" height="600" fill="url(#chloro)" />
        </svg>
      `;
    } else if (layerName === 'PFZ') {
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%" style="opacity: 0.7;">
          <circle cx="450" cy="300" r="180" fill="#f59e0b" fill-opacity="0.45" stroke="#f59e0b" stroke-width="4" stroke-dasharray="8,4" />
          <circle cx="450" cy="300" r="90" fill="#ef4444" fill-opacity="0.5" />
        </svg>
      `;
    } else {
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%" style="opacity: 0.72;">
          <defs>
            <radialGradient id="thermal" cx="58%" cy="48%" r="45%">
              <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9" />
              <stop offset="25%" stop-color="#f59e0b" stop-opacity="0.85" />
              <stop offset="50%" stop-color="#10b981" stop-opacity="0.75" />
              <stop offset="75%" stop-color="#06b6d4" stop-opacity="0.65" />
              <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.2" />
            </radialGradient>
          </defs>
          <rect width="800" height="600" fill="url(#thermal)" />
        </svg>
      `;
    }

    const newUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
    overlayLayerRef.current.setUrl(newUrl);
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetLocation = () => mapInstanceRef.current?.setView([15.24, 82.16], 7);

  // Search handler
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await MarineApi.analyzeScientificQuery({
        query: searchQuery,
        latitude: 15.24,
        longitude: 82.16
      });
      if (res && res.structured_assessment) {
        setAnalysisText(res.structured_assessment.observation + ' ' + res.structured_assessment.reasoning);
        setConfidence(Math.round(res.structured_assessment.confidence || 82));
      }
    } catch (err) {
      console.warn('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // What-If handler
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      let windKt = 12;
      let waveM = 1.2;
      if (whatIfValue === '+10 km/h') {
        windKt = 22;
        waveM = 2.1;
      } else if (whatIfValue === '+20 km/h') {
        windKt = 30;
        waveM = 2.8;
      }

      const res = await MarineApi.simulateScientificWhatIf({
        wind_speed_knots: windKt,
        wave_height_m: waveM,
        distance_km: 45
      });

      if (res && res.simulation) {
        setSimulationResult(
          `Fishing opportunity may decrease to Moderate (${Math.max(45, Math.round(100 - (res.simulation.capsize_risk_index * 100)))}%) due to ${whatIfCondition.toLowerCase()} (${whatIfValue}) and wave elevation to ${waveM}m.`
        );
      } else {
        setSimulationResult(
          `Fishing opportunity may decrease to Moderate (56%) due to ${whatIfCondition.toLowerCase()} (${whatIfValue}) and higher wave conditions.`
        );
      }
    } catch (err) {
      setSimulationResult(
        `Fishing opportunity may decrease to Moderate (56%) due to increased wind (+10 km/h) and higher wave conditions.`
      );
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] text-[#0F2942] font-sans overflow-y-auto p-3.5 sm:p-4 md:p-5 space-y-3 text-left w-full">
      {/* 1. Header Bar with Search Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-[#1D63ED] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#0B1E36] tracking-tight leading-tight">
              Scientific AI
            </h1>
            <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5">
              Evidence-based marine insights for better decisions.
            </p>
          </div>
        </div>

        {/* Right Search Input Pill */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask a scientific question about marine conditions..."
              className="w-full pl-8 pr-7 py-1.5 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0B1E36] placeholder-[#94A3B8] focus:outline-none focus:border-[#1D63ED] focus:bg-white transition"
            />
            <Sparkles className="w-3 h-3 text-[#1D63ED] absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-8 h-8 rounded-full bg-[#1D63ED] hover:bg-[#1552C6] text-white flex items-center justify-center shrink-0 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Ask Scientific AI"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Send className="w-3.5 h-3.5 text-white" />
            )}
          </button>

          {onToggleDualView && (
            <button
              type="button"
              onClick={onToggleDualView}
              className="hidden lg:flex px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#F0F9FF] text-[#1D63ED] border border-[#1D63ED]/30 hover:bg-[#E0F2FE] transition cursor-pointer"
            >
              {isDualView ? 'Full Page' : 'Compare with Family Link'}
            </button>
          )}
        </form>
      </div>

      {/* 2. Sub-tabs Bar */}
      <div className="flex items-center gap-6 border-b border-[#E2E8F0] text-xs font-medium overflow-x-auto no-scrollbar">
        {['Overview', 'AI Analysis', 'Data Layers', 'What-If Simulation', 'Recommendations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 transition relative cursor-pointer font-medium whitespace-nowrap ${
              activeTab === tab
                ? 'text-[#1D63ED] font-bold'
                : 'text-[#64748B] hover:text-[#0B1E36]'
            }`}
          >
            <span>{tab}</span>
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1D63ED] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 3. Balanced 2-Column Desktop Layout (Solves Viewport Stacking & Scrolling) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* ================= LEFT COLUMN (Col 7): Map + 4 Metric Stat Cards ================= */}
        <div className="lg:col-span-7 space-y-3">
          {/* Interactive Satellite Ocean Map (Constrained to ~270px) */}
          <div className="relative rounded-[10px] overflow-hidden border border-[#E2E8F0] shadow-2xs bg-[#0B1E36] h-[270px] sm:h-[285px]">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Layer Selector Pill Stack (Top Left) */}
            <div className="absolute top-2.5 left-2.5 z-[400] flex flex-col bg-[#0F172A]/90 backdrop-blur-md rounded-[8px] p-1 border border-[#334155] shadow-md text-xs space-y-0.5 text-white min-w-[115px]">
              {[
                { id: 'SST', label: 'SST (°C)', icon: '🌡️' },
                { id: 'Chlorophyll', label: 'Chlorophyll', icon: '🌿' },
                { id: 'PFZ', label: 'PFZ Active', icon: '🐟' },
                { id: 'Currents', label: 'Currents', icon: '🌊' },
                { id: 'Wind', label: 'Wind Field', icon: '💨' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLayerChange(item.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-[5px] text-[10px] font-medium transition cursor-pointer text-left ${
                    activeLayer === item.id
                      ? 'bg-[#1D63ED] text-white font-semibold shadow-2xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-[11px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* SST Color Bar Scale (Top Right) */}
            {activeLayer === 'SST' && (
              <div className="absolute top-2.5 right-2.5 z-[400] bg-[#0F172A]/90 backdrop-blur-md rounded-[6px] p-1.5 border border-[#334155] shadow-md text-white flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-200 mb-1">SST (°C)</span>
                <div className="flex items-center gap-1 text-[8px] font-mono">
                  <div 
                    className="w-2.5 h-20 rounded-full" 
                    style={{
                      background: 'linear-gradient(to bottom, #ef4444, #f59e0b, #10b981, #06b6d4, #1d4ed8)'
                    }} 
                  />
                  <div className="flex flex-col justify-between h-20 text-slate-300 leading-none">
                    <span>32</span>
                    <span>28</span>
                    <span>24</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
            )}

            {/* Map Zoom Controls (Bottom Right) */}
            <div className="absolute bottom-2.5 right-2.5 z-[400] flex flex-col bg-white rounded-[6px] border border-[#CBD5E1] shadow-sm overflow-hidden text-[#0F2942]">
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-[#F1F5F9] transition border-b border-[#E2E8F0] cursor-pointer"
                title="Zoom in"
              >
                <Plus className="w-3.5 h-3.5 text-[#0F2942]" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-[#F1F5F9] transition border-b border-[#E2E8F0] cursor-pointer"
                title="Zoom out"
              >
                <Minus className="w-3.5 h-3.5 text-[#0F2942]" />
              </button>
              <button
                onClick={handleResetLocation}
                className="p-1.5 hover:bg-[#F1F5F9] transition cursor-pointer"
                title="Reset position"
              >
                <Crosshair className="w-3.5 h-3.5 text-[#1D63ED]" />
              </button>
            </div>
          </div>

          {/* 4 Metric Quick-Stat Cards Directly Underneath Map */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Card 1: Fishing Opportunity */}
            <div className="p-2.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#E0F2FE] text-[#1D63ED] flex items-center justify-center shrink-0">
                <span className="text-base">🐟</span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#64748B] block font-medium truncate">Opportunity</span>
                <span className="text-xs sm:text-sm font-bold text-[#0B1E36] block leading-tight">{opportunityLevel}</span>
                <span className="text-[9px] text-[#1D63ED] font-semibold">{confidence}% confidence</span>
              </div>
            </div>

            {/* Card 2: Sea Surface Temperature */}
            <div className="p-2.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                <Waves className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#64748B] block font-medium truncate">Sea Temp</span>
                <span className="text-xs sm:text-sm font-bold text-[#0B1E36] block leading-tight">{sstValue}</span>
                <span className="text-[9px] text-[#64748B]">Normal range</span>
              </div>
            </div>

            {/* Card 3: Chlorophyll */}
            <div className="p-2.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                <span className="text-base">🌿</span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#64748B] block font-medium truncate">Chlorophyll</span>
                <span className="text-xs sm:text-sm font-bold text-[#0B1E36] block leading-tight">{chlorophyllLevel}</span>
                <span className="text-[9px] text-[#16A34A] font-semibold">Above average</span>
              </div>
            </div>

            {/* Card 4: Wind Speed */}
            <div className="p-2.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#F0FDF4] text-[#0D9488] flex items-center justify-center shrink-0">
                <Wind className="w-4 h-4 text-[#0D9488]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#64748B] block font-medium truncate">Wind Speed</span>
                <span className="text-xs sm:text-sm font-bold text-[#0B1E36] block leading-tight">{windSpeed}</span>
                <span className="text-[9px] text-[#64748B]">Moderate</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (Col 5): AI Analysis + Evidence + What-If ================= */}
        <div className="lg:col-span-5 space-y-3">
          {/* AI Scientific Analysis Card */}
          <div className="p-3.5 rounded-[10px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#1D63ED]" />
                <h3 className="font-bold text-xs text-[#0B1E36] uppercase tracking-wide">
                  AI Scientific Analysis
                </h3>
              </div>
              <button 
                onClick={() => setShowDetailsModal(true)}
                className="text-[10px] font-semibold text-[#1D63ED] hover:underline cursor-pointer"
              >
                View Deep Reasoning
              </button>
            </div>

            <p className="text-[11px] text-[#334155] leading-relaxed">
              {analysisText}
            </p>

            {/* Confidence Progress Bar */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] font-medium text-[#64748B]">Confidence Level</span>
                <span className="font-bold font-mono text-[#0B1E36] text-[11px]">{confidence}%</span>
              </div>
              <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#10B981] rounded-full transition-all duration-500" 
                  style={{ width: `${confidence}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Supporting Evidence Card */}
          <div className="p-3 rounded-[10px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#1D63ED]" />
                <h3 className="font-bold text-xs text-[#0B1E36] uppercase tracking-wide">
                  Supporting Evidence
                </h3>
              </div>
              <button
                onClick={() => setShowSourcesModal(true)}
                className="text-[10px] font-semibold text-[#1D63ED] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Sources</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-[#0F2942]">
              <div className="flex items-center gap-1.5 truncate">
                <span>🌡️</span>
                <span><strong>SST:</strong> 26.8 °C (favorable)</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span>🌿</span>
                <span><strong>Chlorophyll:</strong> High</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span>🐟</span>
                <span><strong>PFZ:</strong> Active Sector</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span>🌊</span>
                <span><strong>Currents:</strong> Frontal Edge</span>
              </div>
            </div>
          </div>

          {/* What-If Simulation Sandbox Card */}
          <div className="p-3.5 rounded-[10px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1D63ED]" />
                <h3 className="font-bold text-xs text-[#0B1E36] uppercase tracking-wide">
                  What-If Simulation Sandbox
                </h3>
              </div>
              <span className="text-[9px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                Predictive Model
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={whatIfCondition}
                onChange={(e) => setWhatIfCondition(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F2942] font-medium focus:outline-none focus:border-[#1D63ED]"
              >
                <option>Increase Wind Speed</option>
                <option>Increase Wave Swell</option>
                <option>Water Temp Drop</option>
                <option>Tidal Shear Shift</option>
              </select>

              <select
                value={whatIfValue}
                onChange={(e) => setWhatIfValue(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F2942] font-medium focus:outline-none focus:border-[#1D63ED]"
              >
                <option>+5 km/h</option>
                <option>+10 km/h</option>
                <option>+15 km/h</option>
                <option>+20 km/h</option>
              </select>

              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="px-3.5 py-1.5 rounded-[6px] bg-[#1D63ED] hover:bg-[#1552C6] text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Simulate</span>
              </button>
            </div>

            {/* Simulation Result Container */}
            <div className="p-2.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#0B1E36]">
                <Info className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span className="font-bold text-[10px] uppercase tracking-wide">
                  Simulation Outcome
                </span>
              </div>
              <p className="text-[11px] text-[#475569] leading-snug">
                {simulationResult}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: DEEP SCIENTIFIC REASONING ================= */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-5 max-w-lg w-full space-y-3.5 shadow-2xl border border-[#E2E8F0] text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#1D63ED]" />
                <h4 className="font-bold text-sm text-[#0B1E36]">
                  Deep Scientific Reasoning & Hypothesis Evaluation
                </h4>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#334155] max-h-80 overflow-y-auto pr-1">
              <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-[#0B1E36] block">Hypothesis A (Score 0.88 - Supported):</span>
                <p className="text-[11px] text-slate-600">
                  Thermal convergence front between 26.5°C and 27.2°C water masses concentrates phytoplankton, creating an active feeding ground for pelagic shoals (Mackerel & Tuna).
                </p>
              </div>

              <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-[#0B1E36] block">Hypothesis B (Score 0.62 - Moderate):</span>
                <p className="text-[11px] text-slate-600">
                  Coastal upwelling plume driven by south-westerly wind stress. Chlorophyll levels remain high at 1.4 mg/m³, validating biological productivity.
                </p>
              </div>

              <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-[#0B1E36] block">Operational Safety Corroboration:</span>
                <p className="text-[11px] text-slate-600">
                  Significant wave height of 1.1m is well within the 1.8m maximum safety threshold for 14-meter wooden mechanized trawlers. No capsize risk detected for the planned voyage.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full py-1.5 bg-[#1D63ED] text-white rounded-[6px] text-xs font-semibold cursor-pointer"
            >
              Close Reasoning
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: DATA SOURCES ================= */}
      {showSourcesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-5 max-w-md w-full space-y-3 shadow-2xl border border-[#E2E8F0] text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#1D63ED]" />
                <h4 className="font-bold text-sm text-[#0B1E36]">
                  Verified Oceanographic Data Feeds
                </h4>
              </div>
              <button 
                onClick={() => setShowSourcesModal(false)} 
                className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <strong className="block text-[#0B1E36]">INCOIS Ocean State Forecast</strong>
                <span className="text-[11px] text-slate-600">Synoptic swell, current velocity, and coastal bathymetry bulletins.</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <strong className="block text-[#0B1E36]">Copernicus Sentinel-3 OLCI & SLSTR</strong>
                <span className="text-[11px] text-slate-600">Thermal infrared sea surface temperature and ocean color chlorophyll concentration.</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <strong className="block text-[#0B1E36]">NavIC Marine Satellite Mesh</strong>
                <span className="text-[11px] text-slate-600">Sub-GHz position telemetry and emergency transponder mesh.</span>
              </div>
            </div>

            <button
              onClick={() => setShowSourcesModal(false)}
              className="w-full py-1.5 bg-[#1D63ED] text-white rounded-[6px] text-xs font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
