import React, { useState, useEffect } from 'react';
import { 
  X, Settings, Anchor, Languages, Volume2, Map as MapIcon, 
  Gauge, ShieldAlert, Check, RotateCcw, Save, Sliders, Globe
} from 'lucide-react';
import { SUPPORTED_INDIAN_LANGUAGES } from '../services/multilingualMarine';
import ModalPortal from './ModalPortal';

export const DEFAULT_SETTINGS = {
  basePort: 'rameswaram',
  basePortName: 'Rameswaram Fishing Harbor (TN)',
  vesselType: '28-ft Fiber Trawler',
  language: 'en',
  autoReadAloud: false,
  voiceSpeed: '0.95',
  defaultBasemap: 'esriImagery',
  showBathymetry: true,
  showCurrentVectors: true,
  speedUnit: 'knots', // 'knots' | 'kmh'
  waveUnit: 'm', // 'm' | 'ft'
  tempUnit: 'c', // 'c' | 'f'
  distUnit: 'nm', // 'nm' | 'km'
  maxWaveThreshold: 2.0, // meters
  maxWindGustThreshold: 22, // knots
  imblBufferNm: 2.5, // nautical miles
};

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  currentSettings = DEFAULT_SETTINGS, 
  onSaveSettings 
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({ ...DEFAULT_SETTINGS, ...currentSettings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('marine_ai_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch {
          // ignore error
        }
      }
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('marine_ai_settings', JSON.stringify(formData));
    if (formData.language) {
      localStorage.setItem('marine_ai_language', formData.language);
    }
    onSaveSettings?.(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  const handleReset = () => {
    setFormData(DEFAULT_SETTINGS);
  };

  const PORTS = [
    { id: 'rameswaram', name: 'Rameswaram Fishing Harbor (Tamil Nadu)' },
    { id: 'chennai', name: 'Kasimedu / Chennai Fishing Harbor (Tamil Nadu)' },
    { id: 'visakhapatnam', name: 'Visakhapatnam Harbor (Andhra Pradesh)' },
    { id: 'kochi', name: 'Kochi Thoppumpady Harbor (Kerala)' },
    { id: 'mumbai', name: 'Sassoon Docks / Mumbai (Maharashtra)' },
    { id: 'veraval', name: 'Veraval Commercial Fishing Port (Gujarat)' },
    { id: 'mangaluru', name: 'Mangaluru Old Port / Bunder (Karnataka)' },
    { id: 'paradip', name: 'Paradip Marine Fishing Harbor (Odisha)' }
  ];

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#DCE6E4] rounded-[4px] shadow-[0_12px_40px_rgba(11,30,54,0.18)] overflow-hidden flex flex-col max-h-[90vh] text-left">
        {/* Modal Top Header */}
        <div className="px-4 py-3 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[3px] bg-[#1D63ED]/10 border border-[#1D63ED]/20 flex items-center justify-center text-[#1D63ED]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0B1E36] tracking-tight">
                Marine Intelligence System Settings
              </h2>
              <p className="text-[11px] text-slate-500">
                Configure coastal base port, global multilingual dialect, telemetry units, and safety thresholds
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-[3px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left Tab strip + Right Content area */}
        <div className="flex flex-1 min-h-[380px] overflow-hidden">
          {/* Vertical Tabs Sidebar */}
          <div className="w-44 bg-[#F8FAFC] border-r border-[#E2E8F0] p-2 flex flex-col gap-1 text-xs">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full px-2.5 py-2 rounded-[3px] text-left flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-[#FFFFFF] text-[#1D63ED] font-bold shadow-xs border border-[#E2E8F0]'
                  : 'text-slate-600 hover:bg-[#EEF2F6] font-medium'
              }`}
            >
              <Anchor className="w-3.5 h-3.5" />
              <span>Base Port & Vessel</span>
            </button>

            <button
              onClick={() => setActiveTab('language')}
              className={`w-full px-2.5 py-2 rounded-[3px] text-left flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'language'
                  ? 'bg-[#FFFFFF] text-[#1D63ED] font-bold shadow-xs border border-[#E2E8F0]'
                  : 'text-slate-600 hover:bg-[#EEF2F6] font-medium'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Language & Voice</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`w-full px-2.5 py-2 rounded-[3px] text-left flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-[#FFFFFF] text-[#1D63ED] font-bold shadow-xs border border-[#E2E8F0]'
                  : 'text-slate-600 hover:bg-[#EEF2F6] font-medium'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map & Overlays</span>
            </button>

            <button
              onClick={() => setActiveTab('units')}
              className={`w-full px-2.5 py-2 rounded-[3px] text-left flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'units'
                  ? 'bg-[#FFFFFF] text-[#1D63ED] font-bold shadow-xs border border-[#E2E8F0]'
                  : 'text-slate-600 hover:bg-[#EEF2F6] font-medium'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Telemetry Units</span>
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`w-full px-2.5 py-2 rounded-[3px] text-left flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'safety'
                  ? 'bg-[#FFFFFF] text-[#1D63ED] font-bold shadow-xs border border-[#E2E8F0]'
                  : 'text-slate-600 hover:bg-[#EEF2F6] font-medium'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safety Thresholds</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-[#FFFFFF]">
            {/* TAB 1: Base Port & Vessel */}
            {activeTab === 'general' && (
              <div className="space-y-3.5">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Primary Coastal Base Port / Harbor
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    Sets default landing coordinates for INCOIS advisory alerts and geospatial route origin.
                  </p>
                  <select
                    value={formData.basePort}
                    onChange={(e) => {
                      const selected = PORTS.find(p => p.id === e.target.value);
                      handleChange('basePort', e.target.value);
                      if (selected) handleChange('basePortName', selected.name);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-[3px] border border-[#CBD5E1] bg-[#FFFFFF] text-slate-800 text-xs focus:outline-none focus:border-[#1D63ED]"
                  >
                    {PORTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Vessel Hull & Class Profile
                  </label>
                  <select
                    value={formData.vesselType}
                    onChange={(e) => handleChange('vesselType', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[3px] border border-[#CBD5E1] bg-[#FFFFFF] text-slate-800 text-xs focus:outline-none focus:border-[#1D63ED]"
                  >
                    <option value="28-ft Fiber Trawler">28-ft Fiber Trawler (Inboard Diesel, 60-90 HP)</option>
                    <option value="32-ft Mechanized Gillnetter">32-ft Mechanized Gillnetter (110 HP, Multiday)</option>
                    <option value="45-ft Deep Sea Longliner">45-ft Deep Sea Tuna Longliner (180 HP, Chilled Hold)</option>
                    <option value="Artisanal Motorized Canoe">Artisanal Motorized Canoe (Outboard OBM, 9.9 HP)</option>
                  </select>
                </div>

                <div className="p-3 rounded-[3px] bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-[#0B1E36]">Active Harbor Telemetry Sync:</span>{' '}
                  Ocean hydrodynamics, tidal current velocities, and weather forecasts will auto-calibrate to your chosen port.
                </div>
              </div>
            )}

            {/* TAB 2: Language & Voice */}
            {activeTab === 'language' && (
              <div className="space-y-3.5">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Global Application Language (Coastal Dialects)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    Applies universally to navigation, chat drawer, AI scientist reports, and voice guidance.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-[3px]">
                    {SUPPORTED_INDIAN_LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleChange('language', lang.code)}
                        className={`px-2.5 py-1.5 rounded-[2px] text-left text-xs flex items-center justify-between transition cursor-pointer ${
                          formData.language === lang.code
                            ? 'bg-[#1D63ED] text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{lang.nativeName} ({lang.name})</span>
                        <span className="text-[10px] opacity-75 font-mono">{lang.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">Voice Auto Read-Out</span>
                      <span className="text-[11px] text-slate-500">
                        Automatically speak out AI safety bulletins and advisories when received
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoReadAloud}
                        onChange={(e) => handleChange('autoReadAloud', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1D63ED]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Voice Speech Rate</span>
                    <select
                      value={formData.voiceSpeed}
                      onChange={(e) => handleChange('voiceSpeed', e.target.value)}
                      className="px-2 py-1 rounded-[3px] border border-slate-200 text-xs font-mono"
                    >
                      <option value="0.85">0.85x (Calm Nautical)</option>
                      <option value="0.95">0.95x (Standard Radio)</option>
                      <option value="1.10">1.10x (Quick Advisory)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Map & Overlays */}
            {activeTab === 'map' && (
              <div className="space-y-3.5">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Default Ocean Basemap Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'esriImagery', label: 'Satellite (Esri World Imagery)', desc: 'High resolution coastal & reef imagery' },
                      { id: 'esriTopo', label: 'Ocean Topography (Esri Ocean)', desc: 'Detailed bathymetric depth contours' },
                      { id: 'osm', label: 'Streets / Ports (Esri Street Map)', desc: 'Harbor infrastructure, roads & navigation ports' },
                      { id: 'cartoDark', label: 'Dark Canvas (Esri Dark Marine)', desc: 'High-contrast nocturnal bridge view' }
                    ].map(style => (
                      <div
                        key={style.id}
                        onClick={() => handleChange('defaultBasemap', style.id)}
                        className={`p-2.5 rounded-[3px] border cursor-pointer transition ${
                          formData.defaultBasemap === style.id
                            ? 'border-[#1D63ED] bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold text-slate-800 block text-xs">{style.label}</span>
                        <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{style.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showBathymetry}
                      onChange={(e) => handleChange('showBathymetry', e.target.checked)}
                      className="rounded text-[#1D63ED]"
                    />
                    <span className="text-xs text-slate-700 font-medium">Show 10m/50m Bathymetric Depth Contours by default</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showCurrentVectors}
                      onChange={(e) => handleChange('showCurrentVectors', e.target.checked)}
                      className="rounded text-[#1D63ED]"
                    />
                    <span className="text-xs text-slate-700 font-medium">Display Surface Ocean Current Drift Vectors</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: Units of Measurement */}
            {activeTab === 'units' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">Vessel & Wind Speed</label>
                    <select
                      value={formData.speedUnit}
                      onChange={(e) => handleChange('speedUnit', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-[3px] border border-slate-200 text-xs"
                    >
                      <option value="knots">Knots (kn / kt)</option>
                      <option value="kmh">Kilometers per Hour (km/h)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">Wave & Swell Height</label>
                    <select
                      value={formData.waveUnit}
                      onChange={(e) => handleChange('waveUnit', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-[3px] border border-slate-200 text-xs"
                    >
                      <option value="m">Meters (m)</option>
                      <option value="ft">Feet (ft)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">Sea Surface Temperature</label>
                    <select
                      value={formData.tempUnit}
                      onChange={(e) => handleChange('tempUnit', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-[3px] border border-slate-200 text-xs"
                    >
                      <option value="c">Celsius (°C)</option>
                      <option value="f">Fahrenheit (°F)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">Offshore Distance</label>
                    <select
                      value={formData.distUnit}
                      onChange={(e) => handleChange('distUnit', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-[3px] border border-slate-200 text-xs"
                    >
                      <option value="nm">Nautical Miles (NM)</option>
                      <option value="km">Kilometers (km)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Safety Thresholds */}
            {activeTab === 'safety' && (
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-800">
                      Wave Swell Advisory Trigger Cap
                    </label>
                    <span className="font-mono font-bold text-[#1D63ED]">{formData.maxWaveThreshold} m</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="4.0"
                    step="0.5"
                    value={formData.maxWaveThreshold}
                    onChange={(e) => handleChange('maxWaveThreshold', parseFloat(e.target.value))}
                    className="w-full accent-[#1D63ED]"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Triggers amber hazard indicator when wave swells exceed this height.</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-800">
                      Wind Gust Return Warning Limit
                    </label>
                    <span className="font-mono font-bold text-[#1D63ED]">{formData.maxWindGustThreshold} kn</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="35"
                    step="1"
                    value={formData.maxWindGustThreshold}
                    onChange={(e) => handleChange('maxWindGustThreshold', parseInt(e.target.value))}
                    className="w-full accent-[#1D63ED]"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Instructs AI Challenger to prompt immediate return voyage recommendation.</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-800">
                      IMBL (Maritime Boundary) Proximity Warning Buffer
                    </label>
                    <span className="font-mono font-bold text-red-600">{formData.imblBufferNm} NM</span>
                  </div>
                  <select
                    value={formData.imblBufferNm}
                    onChange={(e) => handleChange('imblBufferNm', parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-[3px] border border-slate-200 text-xs font-mono"
                  >
                    <option value="1.0">1.0 NM (Near boundary)</option>
                    <option value="2.5">2.5 NM (Standard INCOIS recommendation)</option>
                    <option value="5.0">5.0 NM (Conservative safety buffer)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-[3px] text-slate-500 hover:text-slate-800 hover:bg-slate-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Saved & Synchronized!
              </span>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-[3px] bg-white border border-[#CBD5E1] text-slate-700 hover:bg-slate-50 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-[3px] bg-[#1D63ED] hover:bg-[#1551C7] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
