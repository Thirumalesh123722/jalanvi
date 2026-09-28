import React, { useState } from 'react';
import { 
  MapPin, Sun, ChevronDown, ChevronRight, Settings, 
  Mic, Send, Fish, Waves, ShieldCheck, 
  Compass, Map, Satellite, Network, 
  Languages, Users, Wind, Crosshair, ShieldAlert, Sparkles
} from 'lucide-react';
import oceanBg from '../assets/orca-ocean-bg.jpg';
import waveTransitionImg from '../assets/orca-wave-transition.png';
import { SUPPORTED_INDIAN_LANGUAGES, getAppTranslation } from '../services/multilingualMarine';

function MarineLogoIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="marineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      {/* Outer spiral wave circle */}
      <circle cx="24" cy="24" r="21" stroke="url(#marineGrad)" strokeWidth="3" fill="#FFFFFF" />
      {/* Ocean curl wave silhouette */}
      <path
        d="M13 25C14 18 19 14 25 14C31 14 35.5 17.5 35.5 23C35.5 28.5 31 33 24 33C18.5 33 14.5 29.5 14.5 25.5C14.5 21.5 17.5 19 21 19C24 19 25.5 21 25.5 23C25.5 25 24 26 22 26"
        stroke="url(#marineGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="21" cy="22" r="2" fill="#0284C7" />
    </svg>
  );
}

export default function OrcaLandingPage({ 
  onExploreMap, 
  onOpenWeather,
  onOpenFishingZones,
  onOpenSeaConditions,
  onOpenSafety,
  onOpenMarineAreas,
  onOpenSafeRoute,
  onOpenAiAgents,
  onOpenAuthorities,
  onOpenVoiceModal, 
  onOpenMarineAiWithQuery,
  onOpenFamilyLink,
  onOpenSettings,
  globalLanguage = 'en',
  onLanguageChange,
  translations,
  user,
  isAuthenticated,
  onOpenLogin,
  onOpenRegister,
  onOpenProfile,
  onLogout
}) {
  const t = translations || getAppTranslation(globalLanguage);
  const openAiHandler = onOpenMarineAiWithQuery;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Visakhapatnam, AP');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  React.useEffect(() => {
    if (globalLanguage) {
      const match = SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === globalLanguage);
      if (match) setSelectedLanguage(match.nativeName);
    }
  }, [globalLanguage]);

  const locations = [
    { id: 'vizag', name: 'Visakhapatnam, AP', fullName: 'Visakhapatnam, Andhra Pradesh', temp: '28°C', condition: 'Clear', wind: '12 km/h', waves: '0.8 m' },
    { id: 'rameswaram', name: 'Rameswaram, TN', fullName: 'Rameswaram, Tamil Nadu', temp: '29°C', condition: 'Sunny', wind: '14 km/h', waves: '1.1 m' },
    { id: 'kochi', name: 'Kochi, KL', fullName: 'Kochi Harbour, Kerala', temp: '27°C', condition: 'Partly Cloudy', wind: '16 km/h', waves: '1.2 m' },
    { id: 'chennai', name: 'Chennai, TN', fullName: 'Chennai Port, Tamil Nadu', temp: '30°C', condition: 'Clear', wind: '11 km/h', waves: '0.7 m' },
    { id: 'kakinada', name: 'Kakinada, AP', fullName: 'Kakinada Deepwater Port, AP', temp: '28°C', condition: 'Clear', wind: '10 km/h', waves: '0.6 m' },
  ];

  const currentLocationData = locations.find(l => l.name === selectedLocation) || locations[0];

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      onExploreMap?.(currentLocationData.id);
      return;
    }
    openAiHandler?.(searchQuery);
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between font-sans bg-[#F4F8FA] text-[#0F172A] relative overflow-y-auto lg:overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Background Ocean Photo Image with Atmospheric Sunlight Gradient */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ 
          backgroundImage: `url(${oceanBg})`,
          backgroundPosition: 'center 35%'
        }}
      >
        {/* Soft sunlight gradient overlay transitioning from clean white at the top */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/50 to-transparent" />
      </div>

      {/* Top Header Navbar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/60 bg-white/70 backdrop-blur-md shrink-0">
        {/* Left: Brand Identity - Exact reference typography */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none" 
          onClick={() => onExploreMap?.(currentLocationData.id)}
          title="Marine Intelligence - Explore Marine Map"
        >
          <MarineLogoIcon className="w-8 h-8 sm:w-9 sm:h-9" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[15px] sm:text-base tracking-wide text-[#0F2942] leading-none">
              Marine Intelligence
            </span>
          </div>
        </div>

        {/* Right: Controls & Selectors */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-slate-700">
          {/* Location Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLocationDropdownOpen(p => !p);
                setIsLangDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-white/80 transition cursor-pointer"
              title="Select Base Coastal Port"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden xs:inline text-slate-800 font-semibold">{selectedLocation}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isLocationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                  Select Base Port
                </span>
                {locations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => {
                      setSelectedLocation(loc.name);
                      setIsLocationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition cursor-pointer ${
                      selectedLocation === loc.name ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{loc.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{loc.temp}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Weather Chip — Connected to Weather Feature */}
          <button 
            onClick={() => onOpenWeather?.()}
            title="Click to Open Live Sea State & Weather HUD"
            className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-white/80 transition cursor-pointer"
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-slate-900">{currentLocationData.temp}</span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">{currentLocationData.condition}</span>
            </div>
          </button>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLangDropdownOpen(p => !p);
                setIsLocationDropdownOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-white/80 transition cursor-pointer"
              title="Select Indian Coastal Dialect"
            >
              <Languages className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline text-slate-800">{selectedLanguage}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-left max-h-64 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                  Select Language
                </span>
                {SUPPORTED_INDIAN_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.nativeName);
                      setIsLangDropdownOpen(false);
                      onLanguageChange?.(lang.code);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 transition cursor-pointer ${
                      selectedLanguage === lang.nativeName ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{lang.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Family Safety Link button */}
          <button 
            onClick={() => onOpenFamilyLink ? onOpenFamilyLink() : onOpenSafety?.()}
            title="Family & Crew Safety Link (Layer 29)"
            className="p-1.5 rounded-full hover:bg-white/80 text-blue-600 hover:text-blue-800 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">{t.familyLink || 'Family Link'}</span>
          </button>

          {/* Settings button — Opens real system Settings modal */}
          <button 
            onClick={() => onOpenSettings ? onOpenSettings() : onExploreMap?.(currentLocationData.id)}
            title="Marine Intelligence System Settings"
            className="p-1.5 rounded-full hover:bg-white/80 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Marine Authorities Portal Access */}
          <button
            onClick={() => onOpenAuthorities?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B1E36] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition hover:scale-[1.02] cursor-pointer"
            title="Marine Authorities Command Center (Coast Guard / SDMA / INCOIS)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Marine Authorities</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-600 text-white font-extrabold uppercase ml-0.5 tracking-wider">HQ</span>
          </button>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          {/* User Authentication / Profile Badge */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => onOpenProfile ? onOpenProfile() : null}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 transition cursor-pointer shadow-2xs"
                title="View Master Fisher Profile & Vessel Details"
              >
                <div className="w-6 h-6 rounded-full bg-[#0B1E36] text-white flex items-center justify-center font-bold text-[10px]">
                  {user.name?.charAt(0) || 'M'}
                </div>
                <div className="flex flex-col text-left hidden sm:flex">
                  <span className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-[110px]">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-[#1D63ED] font-mono leading-none mt-0.5">
                    {user.role === 'authority' ? 'Authority Officer' : user.vessel_name || 'Vessel Active'}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenLogin?.()}
                className="px-3 py-1 rounded-full text-xs font-semibold text-slate-700 hover:text-[#1D63ED] hover:bg-white/80 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenRegister?.()}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1D63ED] hover:bg-[#1552C6] text-white shadow-2xs transition cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero Container — Proportioned exactly to the reference */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 text-center max-w-5xl mx-auto w-full min-h-0">
        {/* Eyebrow badge */}
        <div className="mb-2">
          <span className="text-[11px] sm:text-[11.5px] tracking-[0.24em] font-bold text-[#1D63ED] uppercase font-mono">
            MARINE INTELLIGENCE, · SIMPLY SPOKEN.
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-[46px] font-black text-[#0B1E36] tracking-tight leading-tight mb-2">
          How can <span className="text-[#1D63ED]">Marine AI</span> help you today?
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-normal leading-relaxed mb-5 sm:mb-6">
          Ask about weather, fishing zones, sea conditions, marine life, safety or routes.
        </p>

        {/* Search & Voice Input Pill Container — Exact Glowing Aura */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-[660px] mx-auto mb-4 sm:mb-5">
          <div className="bg-white/95 backdrop-blur-md rounded-full p-1.5 sm:p-2 pl-2 sm:pl-2.5 pr-2 sm:pr-2.5 border border-blue-100 shadow-[0_12px_40px_rgba(37,99,235,0.14)] flex items-center gap-2 sm:gap-3 transition focus-within:ring-2 focus-within:ring-blue-400">
            {/* Blue Voice Microphone Button — Connected to Voice Modal */}
            <button
              type="button"
              onClick={onOpenVoiceModal}
              title="Speak to Marine AI Voice Assistant (13 Languages)"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1D63ED] hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0 cursor-pointer transition hover:scale-105 active:scale-95"
            >
              <Mic className="w-5 h-5 text-white" />
            </button>

            {/* Input field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask Marine AI about the ocean..."
              className="flex-1 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none px-2 font-normal"
            />

            {/* Blue Circular Send Button */}
            <button
              type="submit"
              title="Submit query to Marine AI Multi-Agent Pipeline"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#3B82F6] hover:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer transition hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4 text-white -translate-x-0.5" />
            </button>
          </div>
        </form>

        {/* 7 Quick Suggestion Pills in a SINGLE Horizontal Row — Exactly matching reference & diagram branches */}
        <div className="flex flex-nowrap items-center justify-center gap-2 max-w-5xl mx-auto mb-5 sm:mb-6 overflow-x-auto no-scrollbar py-0.5 px-2">
          {/* Branch 5: Marine Authorities (Prominent Badge) */}
          <button
            onClick={() => onOpenAuthorities?.()}
            className="px-3.5 py-1.5 rounded-full bg-[#0B1E36] hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0 transition hover:scale-[1.03] cursor-pointer"
            title="Open Marine Authorities Command Center (Coast Guard / SDMA / INCOIS)"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Marine Authorities</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-600 text-white font-extrabold uppercase ml-0.5">HQ</span>
          </button>

          {/* Branch 2: Marine AI */}
          <button
            onClick={() => openAiHandler?.('What is the current oceanographic and hazard status across Indian coastal waters?')}
            className="px-3.5 py-1.5 rounded-full bg-blue-50/90 hover:bg-blue-100 border border-blue-200 text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1.5 shadow-xs shrink-0 transition hover:scale-[1.02] cursor-pointer"
            title="Consult Marine AI Multi-Agent Copilot"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Marine AI</span>
          </button>

          {/* Branch 3: Weather */}
          <button
            onClick={() => onOpenWeather?.()}
            className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 text-xs text-slate-700 hover:text-blue-600 font-medium flex items-center gap-1.5 shadow-xs shrink-0 transition hover:scale-[1.02] cursor-pointer"
            title="Open Live Ocean Weather & Sea State HUD"
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>{t.weather || "What's the weather?"}</span>
          </button>

          {/* Branch 4: Fishing Zones */}
          <button
            onClick={() => onOpenFishingZones?.()}
            className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 text-xs text-slate-700 hover:text-blue-600 font-medium flex items-center gap-1.5 shadow-xs shrink-0 transition hover:scale-[1.02] cursor-pointer"
            title="Open INCOIS Potential Fishing Zones (PFZ) Advisories"
          >
            <Fish className="w-4 h-4 text-blue-500" />
            <span>{t.fishingZones || "Find fishing zones"}</span>
          </button>

          {/* Sea Conditions */}
          <button
            onClick={() => onOpenSeaConditions?.()}
            className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 text-xs text-slate-700 hover:text-blue-600 font-medium flex items-center gap-1.5 shadow-xs shrink-0 transition hover:scale-[1.02] cursor-pointer"
            title="Open Hydrodynamic Wave Height & Current Conditions"
          >
            <Waves className="w-4 h-4 text-blue-500" />
            <span>{t.seaConditions || "Sea conditions"}</span>
          </button>

          {/* Safety */}
          <button
            onClick={() => onOpenSafety?.()}
            className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 text-xs text-slate-700 hover:text-blue-600 font-medium flex items-center gap-1.5 shadow-xs shrink-0 transition hover:scale-[1.02] cursor-pointer"
            title="Open Live Mission & Safety Challenger Watchdog"
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>{t.safeToSail || "Is it safe to sail?"}</span>
          </button>

          {/* Route Planning */}
          <button
            onClick={() => onOpenSafeRoute?.()}
            className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 text-xs text-slate-700 hover:text-blue-600 font-medium flex items-center gap-1.5 shadow-xs shrink-0 transition hover:scale-[1.02] cursor-pointer"
            title="Open Mission Digital Twin & Route Planning What-If"
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span>{t.safeRoute || "Plan safe route"}</span>
          </button>
        </div>

        {/* Dual Telemetry Cards — Clean side-by-side matching reference */}
        <div className="grid grid-cols-2 gap-4 max-w-[510px] mx-auto w-full mb-4 sm:mb-5 text-left">
          {/* Card 1: Current Location — Connected to Marine Map Centered on Port */}
          <div 
            onClick={() => onExploreMap?.(currentLocationData.id)}
            className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between transition cursor-pointer group"
            title="Click to view port on Marine Map"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-1">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-slate-800">Current Location</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="font-bold text-xs sm:text-sm text-[#0F2942]">
                {currentLocationData.fullName}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExploreMap?.(currentLocationData.id);
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0284C7] text-xs font-semibold flex items-center justify-center gap-1.5 mt-2 transition cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Use my location</span>
            </button>
          </div>

          {/* Card 2: Current Marine Weather — Connected to Weather HUD */}
          <div 
            onClick={() => onOpenWeather?.()}
            className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between transition cursor-pointer group"
            title="Click to open full Live Weather & Sea State HUD"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-1">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-slate-800">{t.weather ? `${t.weather} (${currentLocationData.name})` : "Current Marine Weather"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
              </div>

              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] tracking-tight">
                  {currentLocationData.temp}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                  {currentLocationData.condition}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium pt-1.5 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-blue-500" />
                <span>Wind {currentLocationData.wind}</span>
              </div>
              <div className="flex items-center gap-1">
                <Waves className="w-3.5 h-3.5 text-blue-500" />
                <span>Waves {currentLocationData.waves}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA Buttons Row — Explicit Marine Map and Marine Authorities Command */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
          {/* Branch 1: Explore Marine Map */}
          <button
            onClick={() => onExploreMap?.(currentLocationData.id)}
            className="px-6 py-2.5 rounded-full bg-white/95 hover:bg-blue-50/90 border-2 border-[#38BDF8] hover:border-blue-500 text-[#0284C7] hover:text-blue-700 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(2,132,199,0.18)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Open Interactive Marine AI Map & Geoportal"
          >
            <Map className="w-4 h-4 text-blue-600" />
            <span>{t.exploreMarineMap || 'Explore Marine Map'} →</span>
          </button>

          {/* Branch 5: Marine Authorities Command Center */}
          <button
            onClick={() => onOpenAuthorities?.()}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0B1E36] to-[#163558] hover:from-[#081729] hover:to-[#122c4a] border border-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(11,30,54,0.25)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Open Maritime Authority Command Center (Joint Operations & Hazard Ops)"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Marine Authorities Command →</span>
          </button>
        </div>
      </main>

      {/* Decorative Wave Transition Layer — Exact reference wave */}
      <div className="relative w-full z-10 -mb-1 pointer-events-none select-none overflow-hidden">
        <img 
          src={waveTransitionImg} 
          alt="Ocean wave transition" 
          className="w-full h-16 sm:h-20 object-cover object-bottom block"
        />
      </div>

      {/* Bottom Feature Bar (5 Architecture Branches) — Pure White, Exact Typography & Icons */}
      <footer className="relative z-20 bg-white border-t border-slate-100 py-3.5 sm:py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 text-left">
          {/* Branch 1: Explore Marine Map */}
          <div 
            onClick={() => onExploreMap?.(currentLocationData.id)}
            className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-xl hover:bg-slate-50 transition"
            title="Open Interactive Marine Map & Geoportal"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Map className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition truncate">Explore Marine Map</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Satellite & Bathymetry</p>
            </div>
          </div>

          {/* Branch 2: Marine AI */}
          <div 
            onClick={() => openAiHandler?.('What is the current oceanographic and hazard status across Indian coastal waters?')}
            className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-xl hover:bg-slate-50 transition"
            title="Open Marine AI Multi-Agent Copilot"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition truncate">Marine AI</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Multi-agent voice & text</p>
            </div>
          </div>

          {/* Branch 3: Weather */}
          <div 
            onClick={() => onOpenWeather?.()}
            className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-xl hover:bg-slate-50 transition"
            title="Open Live Ocean Weather & Sea State HUD"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition truncate">Weather</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Wave, wind & swell HUD</p>
            </div>
          </div>

          {/* Branch 4: Fishing Zones */}
          <div 
            onClick={() => onOpenFishingZones?.()}
            className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-xl hover:bg-slate-50 transition"
            title="Open INCOIS Potential Fishing Zones (PFZ)"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Fish className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition truncate">Fishing Zones</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">INCOIS PFZ Advisories</p>
            </div>
          </div>

          {/* Branch 5: Marine Authorities */}
          <div 
            onClick={() => onOpenAuthorities?.()}
            className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-200/80 transition"
            title="Open Maritime Authority Command Center (Emergency Ops & Hazard Intelligence)"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0B1E36] text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#0B1E36] leading-tight group-hover:text-blue-600 transition truncate flex items-center gap-1">
                <span>Marine Authorities</span>
              </h4>
              <p className="text-[10px] text-red-600 font-bold mt-0.5 truncate">Command Center HQ</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
