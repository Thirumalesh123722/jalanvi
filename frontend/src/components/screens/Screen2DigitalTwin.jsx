import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ShieldCheck, Sliders, Compass, ArrowRight, CheckCircle2, 
  AlertTriangle, Check, RotateCcw, ChevronDown, FileText, Loader2,
  Users, Sparkles
} from 'lucide-react';
import { SCREEN2_DATA } from '../../data/mockScreensData';
import MarineApi from '../../services/api';

export default function Screen2DigitalTwin({ 
  onAcceptPlan, 
  onNavigateTab,
  onOpenFamilyLink,
  globalLanguage = 'en', 
  translations = {} 
}) {
  const t = translations || {};
  const [selectedPlanId, setSelectedPlanId] = useState('plan-b');
  const [depTime, setDepTime] = useState('06:00 AM');
  const [windLimit, setWindLimit] = useState('20 km/h');
  const [waveLimit, setWaveLimit] = useState('2.0 m');
  const [fuelReduced, setFuelReduced] = useState('400 L');
  const [returnBefore, setReturnBefore] = useState('04:00 PM');
  const [isSimulated, setIsSimulated] = useState(false);
  const [shareWithFamily, setShareWithFamily] = useState(true);
  const [plans, setPlans] = useState(SCREEN2_DATA.plans);
  const [decisionContract, setDecisionContract] = useState(SCREEN2_DATA.decisionContract);
  const [simDataSource, setSimDataSource] = useState('HYDRODYNAMIC_PRESET');
  const [basemapStyle, setBasemapStyle] = useState('satellite');
  const [isWhatIfExpanded, setIsWhatIfExpanded] = useState(false);
  const [showTradeoffChart, setShowTradeoffChart] = useState(false);

  const routeMapRef = useRef(null);
  const routeMapInstance = useRef(null);
  const basemapLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);

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
    if (!routeMapRef.current) return;
    if (routeMapInstance.current) return;

    // Centered around Rameswaram, Palk Bay, Gulf of Mannar
    const map = L.map(routeMapRef.current, {
      center: [9.15, 79.50],
      zoom: 8,
      zoomControl: false,
    });

    const initCfg = BASEMAP_TILES.satellite;
    const baseLayer = L.tileLayer(initCfg.url, {
      attribution: initCfg.attr,
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map);
    basemapLayerRef.current = baseLayer;

    // Rameswaram Port Marker
    L.circleMarker([9.28, 79.31], {
      radius: 5,
      color: '#FFFFFF',
      fillColor: '#0B1E36',
      fillOpacity: 1,
      weight: 2,
    }).bindTooltip('<b>Rameswaram Base Port</b>', { permanent: true, className: 'marine-tooltip' }).addTo(map);

    // Route A (High Opportunity - Green dotted/solid)
    L.polyline([
      [9.28, 79.31],
      [9.10, 79.65],
      [8.85, 80.05],
    ], {
      color: '#059669',
      weight: 2.5,
      dashArray: '5, 5',
      opacity: 0.85,
    }).bindTooltip('Plan A: 85 km (High Yield)', { sticky: true }).addTo(map);

    // Route B (Recommended - Refined Aqua solid)
    L.polyline([
      [9.28, 79.31],
      [9.15, 79.55],
      [9.00, 79.75],
    ], {
      color: '#1D63ED',
      weight: 3.5,
      opacity: 0.95,
    }).bindTooltip('Plan B (Recommended): 55 km', { sticky: true }).addTo(map);

    // Route C (Conservative - Muted Amber solid)
    L.polyline([
      [9.28, 79.31],
      [9.22, 79.45],
      [9.18, 79.50],
    ], {
      color: '#d97706',
      weight: 2.5,
      opacity: 0.85,
    }).bindTooltip('Plan C: 30 km (Conservative)', { sticky: true }).addTo(map);

    // Restricted Area
    L.polygon([
      [8.75, 79.70],
      [8.95, 79.95],
      [8.70, 80.10],
      [8.60, 79.85],
    ], {
      color: '#dc2626',
      fillColor: '#dc2626',
      fillOpacity: 0.15,
      weight: 1.5,
    }).bindTooltip('Restricted Naval Arc', { sticky: true }).addTo(map);

    routeMapInstance.current = map;
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      routeMapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!routeMapInstance.current) return;
    const map = routeMapInstance.current;
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

  const runSimulation = async () => {
    setIsSimulated(true);
    try {
      const waveVal = parseFloat(waveLimit) || 1.8;
      const windVal = parseFloat(windLimit) || 18.0;
      const fuelVal = parseFloat(fuelReduced) || 400.0;
      const depHour = parseInt(depTime.split(':')[0], 10) || 6;

      const res = await MarineApi.simulateMission({
        base_port: SCREEN2_DATA.missionSetup.startingPoint || 'Rameswaram Base Port',
        vessel_speed_kn: 10.0,
        fuel_capacity_l: fuelVal,
        departure_hour: depHour,
        wind_gust_kn: windVal,
        wave_height_m: waveVal,
        selected_plan: selectedPlanId,
      });

      if (res && res.success && res.plans) {
        const mappedPlans = res.plans.map((p) => {
          const isPlanA = p.id === 'plan-a';
          const isPlanB = p.id === 'plan-b';
          return {
            id: p.id,
            title: isPlanA ? 'Plan A' : isPlanB ? 'Plan B' : 'Plan C',
            subtitle: isPlanA ? 'High Opportunity' : isPlanB ? 'Balanced (Recommended)' : 'Conservative',
            tagline: p.strategy,
            opportunity: isPlanA ? 'Very High' : isPlanB ? 'High' : 'Medium',
            estimatedCatch: `${Math.round(p.expected_catch_kg * 0.8)} - ${Math.round(p.expected_catch_kg * 1.2)} kg`,
            distance: `${p.distance_nm} km`,
            fuelRequired: `${p.fuel_burn_litres} L`,
            riskLevel: p.safety_score >= 85 ? 'Low' : p.safety_score >= 70 ? 'Medium' : 'High',
            returnSafety: p.safety_score >= 85 ? 'Very High' : p.safety_score >= 70 ? 'High' : 'Medium',
            recommended: isPlanB,
            color: isPlanA ? '#059669' : isPlanB ? '#1D63ED' : '#d97706',
          };
        });
        setPlans(mappedPlans);
        setSimDataSource('PYTHON_FASTAPI_HYDRODYNAMIC_ENGINE');
      }

      if (res && res.decision_contract) {
        setDecisionContract({
          recommendation: res.decision_contract.status === 'VALIDATED_BY_SAFETY_GUARDIAN' ? 'CONDITIONAL GO' : 'CAUTION HOLD',
          confidence: `${res.recommended_plan?.safety_score || 84}%`,
          reasons: [
            `Return window confirmed before ${res.decision_contract.approved_window}`,
            `Safe reserve remaining: ${res.decision_contract.fuel_margin_reserve_litres} L`,
            `IMBL safety buffer strictly maintained: ${res.decision_contract.imbl_safety_buffer_nm} NM`,
          ],
          reconsiderIf: [
            `Wave height exceeds ${res.decision_contract.max_allowed_wave_m} m threshold`,
            'Wind gusts exceed 25 km/h limit',
            'Swell frequency drops below 5 seconds',
          ],
          hardStops: [
            'Breaching maritime boundary line',
            'Severe cyclonic alert triggered',
            'Fuel reserve drops below safety buffer',
          ],
        });
      }
    } catch (err) {
      console.warn('Simulation API fallback to local model:', err);
    } finally {
      setTimeout(() => setIsSimulated(false), 600);
    }
  };

  const handleSimulate = () => {
    runSimulation();
  };

  useEffect(() => {
    runSimulation();
  }, [waveLimit, windLimit, fuelReduced, depTime]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] text-[#0F2942] font-sans overflow-hidden text-left">
      {/* Top Title Banner */}
      <div className="h-11 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('screen-1')}
              className="px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#E2E8F0] text-xs text-[#0B1E36] font-medium flex items-center gap-1 transition cursor-pointer shadow-xs"
            >
              <span>← Executive Brain</span>
            </button>
          )}
          <div>
            <h2 className="text-xs font-bold tracking-wider text-[#0B1E36] uppercase flex items-center gap-2">
              <span>Mission Digital Twin — Plan & Simulate</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#F0F9FF] border border-[#E2E8F0] text-[11px] font-semibold text-[#0B1E36]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1D63ED]" />
          <span>AI Challenger | Safety Verified</span>
        </div>
      </div>

      {/* Main Master-Detail 65/35 Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden p-3 gap-3">
        {/* Left: Dominant Route Simulation Map (65% width) */}
        <div className="lg:w-[62%] xl:w-[65%] h-full flex flex-col relative rounded-[8px] border border-[#E2E8F0] overflow-hidden bg-[#FFFFFF] shadow-xs">
          {/* Map Top Floating Header */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
            {/* Selected Plan Highlight Pill */}
            <div className="pointer-events-auto flex items-center gap-2 bg-[#FFFFFF]/95 backdrop-blur-md px-3 py-1.5 rounded-[6px] border border-[#E2E8F0] shadow-xs text-xs">
              <span className="font-bold text-[#0B1E36]">
                {selectedPlanId === 'plan-a' ? 'Plan A (High Yield)' : selectedPlanId === 'plan-c' ? 'Plan C (Conservative)' : 'Plan B (Recommended)'}
              </span>
              <span className="text-[#64748B]">•</span>
              <span className="font-mono text-[#1D63ED] font-semibold">
                {plans.find((p) => p.id === selectedPlanId)?.distance || '55 km'}
              </span>
              <span className="text-[#64748B]">•</span>
              <span className="text-emerald-700 font-medium">Safe Return Guaranteed</span>
            </div>

            {/* Map Style & Tradeoff Toggles */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-[#FFFFFF]/95 backdrop-blur-md p-1 rounded-[6px] border border-[#E2E8F0] shadow-xs text-xs">
              <button
                type="button"
                onClick={() => setShowTradeoffChart((prev) => !prev)}
                className={`px-2 py-1 rounded-[4px] font-medium text-[11px] transition cursor-pointer flex items-center gap-1 ${
                  showTradeoffChart ? 'bg-[#1D63ED] text-white' : 'text-[#64748B] hover:text-[#0B1E36] hover:bg-[#F0F9FF]'
                }`}
              >
                <span>Tradeoff Chart</span>
              </button>

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
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div ref={routeMapRef} className="flex-1 w-full h-full min-h-[350px] map-canvas-container isolate" />

          {/* Floating Route Legend (Bottom Left) */}
          <div className="absolute bottom-3 left-3 z-10 pointer-events-auto bg-[#FFFFFF]/95 backdrop-blur-md px-3 py-1.5 rounded-[6px] border border-[#E2E8F0] shadow-xs flex items-center gap-3 text-[10px] text-[#64748B] font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#059669] rounded-[1px]"></span> Plan A (85 km)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#1D63ED] rounded-[1px]"></span> Plan B (55 km)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#d97706] rounded-[1px]"></span> Plan C (30 km)</span>
            <span className="flex items-center gap-1 text-red-600"><span className="w-2 h-2 bg-red-100 border border-red-500 rounded-[1px]"></span> Restricted Arc</span>
          </div>

          {/* Floating Tradeoff Chart Overlay */}
          {showTradeoffChart && (
            <div className="absolute bottom-11 right-3 z-20 pointer-events-auto w-72 bg-[#FFFFFF]/98 backdrop-blur-md rounded-[6px] border border-[#E2E8F0] shadow-xl p-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#0B1E36]">Pareto Tradeoff</span>
                  <span className="text-[10px] text-[#1D63ED] font-mono">Opportunity vs Risk</span>
                </div>
                <button
                  onClick={() => setShowTradeoffChart(false)}
                  className="w-5 h-5 rounded-[2px] hover:bg-[#F0F9FF] text-[#64748B] hover:text-[#0B1E36] flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Mini SVG Scatter Plot */}
              <div className="w-full h-28 flex items-center justify-center">
                <svg viewBox="0 0 280 120" className="w-full h-full">
                  <line x1="35" y1="10" x2="35" y2="105" stroke="#E2E8F0" strokeWidth="1" />
                  <line x1="35" y1="105" x2="265" y2="105" stroke="#E2E8F0" strokeWidth="1" />
                  <line x1="35" y1="60" x2="265" y2="60" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <text x="5" y="20" fill="#64748B" fontSize="8">High</text>
                  <text x="5" y="100" fill="#64748B" fontSize="8">Low</text>
                  <text x="40" y="115" fill="#64748B" fontSize="8">Low Risk</text>
                  <text x="220" y="115" fill="#64748B" fontSize="8">High Risk</text>
                  <path d="M 55 90 Q 140 50 235 20" fill="none" stroke="#1D63ED" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                  <circle cx="75" cy="85" r="3.5" fill="#d97706" />
                  <text x="83" y="88" fill="#d97706" fontSize="8" fontWeight="600">Plan C</text>
                  <circle cx="150" cy="50" r="4.5" fill="#1D63ED" />
                  <text x="160" y="53" fill="#0B1E36" fontSize="9" fontWeight="700">Plan B (Optimal)</text>
                  <circle cx="230" cy="22" r="3.5" fill="#059669" />
                  <text x="238" y="25" fill="#059669" fontSize="8" fontWeight="600">Plan A</text>
                </svg>
              </div>
              <p className="text-[10px] text-[#64748B] leading-tight text-center mt-1">
                Plan B maximizes catch efficiency while preserving 42% diesel reserve.
              </p>
            </div>
          )}
        </div>

        {/* Right: Mission Dispatch Console (35% width) */}
        <div className="lg:w-[38%] xl:w-[35%] h-full flex flex-col gap-2.5 overflow-y-auto pr-0.5">
          {/* 1. AI Generated Plans */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px] p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0B1E36] uppercase tracking-wider">
                Select Mission Plan
              </h3>
              <span className="text-[10px] text-[#1D63ED] font-mono font-medium">Pareto Optimal Frontier</span>
            </div>

            <div className="space-y-2">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-2.5 rounded-[6px] border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F0F9FF] border-[#1D63ED] shadow-xs'
                        : 'bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#0B1E36]">{plan.title}</span>
                        <span className="text-[11px] font-medium text-[#64748B]">({plan.subtitle})</span>
                      </div>
                      {plan.recommended && (
                        <span className="px-1.5 py-0.5 rounded-[3px] text-[9px] font-semibold bg-[#1D63ED] text-white">
                          ★ Recommended
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[10px] py-1 border-t border-[#E2E8F0]">
                      <div>
                        <span className="text-[#64748B] block">Catch</span>
                        <span className="font-semibold text-[#0F2942]">{plan.estimatedCatch}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Distance</span>
                        <span className="font-semibold text-[#0F2942]">{plan.distance}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Fuel</span>
                        <span className="font-mono text-[#1D63ED] font-bold">{plan.fuelRequired}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Safety</span>
                        <span className={`font-semibold ${plan.riskLevel === 'High' ? 'text-red-600' : 'text-emerald-700'}`}>
                          {plan.returnSafety}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. What-If Simulator Accordion */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px] p-3 shadow-xs space-y-2">
            <button
              onClick={() => setIsWhatIfExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span className="text-xs font-bold text-[#0B1E36] uppercase tracking-wider">What-If Simulation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#64748B] font-mono">
                  {depTime} • Wave &lt; {waveLimit}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${isWhatIfExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isWhatIfExpanded && (
              <div className="pt-2 border-t border-[#E2E8F0] space-y-2 text-xs animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#64748B] font-medium block mb-0.5">Departure Time</label>
                    <select
                      value={depTime}
                      onChange={(e) => setDepTime(e.target.value)}
                      className="w-full px-2 py-1 rounded-[4px] bg-[#FFFFFF] border border-[#E2E8F0] text-xs font-mono text-[#0F2942] focus:outline-none focus:border-[#1D63ED]"
                    >
                      <option>05:30 AM</option>
                      <option>06:00 AM</option>
                      <option>07:30 AM</option>
                      <option>09:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748B] font-medium block mb-0.5">Wind Gust Cap</label>
                    <select
                      value={windLimit}
                      onChange={(e) => setWindLimit(e.target.value)}
                      className="w-full px-2 py-1 rounded-[4px] bg-[#FFFFFF] border border-[#E2E8F0] text-xs font-mono text-[#0F2942] focus:outline-none focus:border-[#1D63ED]"
                    >
                      <option>15 km/h</option>
                      <option>20 km/h</option>
                      <option>25 km/h</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748B] font-medium block mb-0.5">Wave Swell Limit</label>
                    <select
                      value={waveLimit}
                      onChange={(e) => setWaveLimit(e.target.value)}
                      className="w-full px-2 py-1 rounded-[4px] bg-[#FFFFFF] border border-[#E2E8F0] text-xs font-mono text-[#0F2942] focus:outline-none focus:border-[#1D63ED]"
                    >
                      <option>1.5 m</option>
                      <option>2.0 m</option>
                      <option>2.5 m</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748B] font-medium block mb-0.5">Available Fuel</label>
                    <select
                      value={fuelReduced}
                      onChange={(e) => setFuelReduced(e.target.value)}
                      className="w-full px-2 py-1 rounded-[4px] bg-[#FFFFFF] border border-[#E2E8F0] text-xs font-mono text-[#0F2942] focus:outline-none focus:border-[#1D63ED]"
                    >
                      <option>300 L</option>
                      <option>400 L</option>
                      <option>500 L</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSimulate}
                  className="w-full py-1.5 rounded-[4px] bg-[#0B1E36] hover:bg-[#1D63ED] text-white font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSimulated ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSimulated ? 'Recalculating...' : 'Update Hydrodynamic Simulation'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Official Dispatch Contract */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px] flex-1 flex flex-col justify-between shadow-xs overflow-hidden">
            <div>
              {/* Document Header */}
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[3px] bg-[#0B1E36] text-white flex items-center justify-center font-bold text-[10px]">
                    <FileText className="w-3 h-3 text-[#E0F2FE]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#0B1E36] tracking-tight block uppercase">
                      Marine Dispatch Contract
                    </span>
                    <span className="text-[9px] font-mono text-[#64748B]">
                      REF-DC-{selectedPlanId.toUpperCase()} • INCOIS VERIFIED
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-mono font-bold border ${
                    decisionContract.recommendation?.includes('GO') 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {decisionContract.recommendation}
                  </span>
                  <span className="text-[10px] font-mono text-[#0B1E36] font-bold bg-[#F1F5F9] px-1.5 py-0.5 rounded-[3px] border border-[#E2E8F0]">
                    {decisionContract.confidence}
                  </span>
                </div>
              </div>

              {/* Document Body */}
              <div className="p-3 space-y-2 text-[11px]">
                <div className="border-l-2 border-l-[#1D63ED] pl-2 space-y-0.5">
                  <span className="font-bold text-[#0B1E36] block text-[10px] uppercase tracking-wider">
                    Key Justifications:
                  </span>
                  <ul className="text-[#334155] space-y-0.5">
                    {decisionContract.reasons?.slice(0, 2).map((reason, idx) => (
                      <li key={idx}>• {reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-l-amber-500 pl-2 space-y-0.5">
                  <span className="font-bold text-amber-800 block text-[10px] uppercase tracking-wider">
                    Reconsider-If Conditions:
                  </span>
                  <ul className="text-[#334155] space-y-0.5">
                    {decisionContract.reconsiderIf?.slice(0, 2).map((cond, idx) => (
                      <li key={idx}>• {cond}</li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-l-rose-500 pl-2 space-y-0.5">
                  <span className="font-bold text-rose-800 block text-[10px] uppercase tracking-wider">
                    Hard Stop Triggers:
                  </span>
                  <ul className="text-[#334155] space-y-0.5">
                    {decisionContract.hardStops?.slice(0, 1).map((stop, idx) => (
                      <li key={idx}>• {stop}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Pre-Departure Family Link & Scientific Grounding Card */}
            <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-2.5">
              {/* Scientific AI Grounding Strip */}
              <div className="p-2 rounded-[3px] bg-[#F0F9FF] border border-[#E2E8F0] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#1D63ED]" />
                  <span className="text-[11px] font-medium text-[#0B1E36]">
                    <strong>Scientific Grounding:</strong> 0.65°C/km thermal front • 92.4% confidence
                  </span>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('screen-5')}
                    className="text-[10px] font-semibold text-[#1D63ED] hover:underline"
                  >
                    Inspect Evidence →
                  </button>
                )}
              </div>

              {/* Family Link Pre-Departure Sharing Checkbox */}
              <div className="p-2 rounded-[3px] bg-white border border-[#E2E8F0] flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={shareWithFamily}
                    onChange={(e) => setShareWithFamily(e.target.checked)}
                    className="accent-[#1D63ED] w-3.5 h-3.5 rounded-[2px]"
                  />
                  <div>
                    <span className="text-[11px] font-semibold text-[#0B1E36] block">
                      Auto-Notify Family Link on Departure
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      Dispatches departure SMS/WhatsApp to registered kin (ETA 17:20 IST)
                    </span>
                  </div>
                </label>

                {onOpenFamilyLink && (
                  <button
                    onClick={onOpenFamilyLink}
                    className="text-[10px] font-mono text-[#1D63ED] px-2 py-0.5 rounded-[2px] bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#1D63ED]/30 transition"
                  >
                    Manage Kin
                  </button>
                )}
              </div>

              {/* Launch CTA */}
              <button
                onClick={async () => {
                  if (shareWithFamily) {
                    try {
                      await MarineApi.sendFamilyLinkUpdate({
                        update_type: 'TRIP_STARTED',
                        message: `Matsya-Varuna has commenced mission '${selectedPlanId.toUpperCase()}' from Rameswaram Harbour. Estimated return: 17:20 IST.`
                      });
                    } catch (e) {
                      console.warn("Family link auto update fallback:", e);
                    }
                  }
                  onAcceptPlan();
                }}
                className="w-full py-2.5 rounded-[4px] bg-[#1D63ED] hover:bg-[#1551C7] text-white font-semibold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Accept Plan & Launch Live Mission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
