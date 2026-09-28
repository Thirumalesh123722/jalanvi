import React from 'react';
import { 
  Globe, AlertOctagon, Download, Wifi, WifiOff, 
  Search, Bell, ChevronDown, Satellite, ShieldAlert 
} from 'lucide-react';
import { LANGUAGES, TRANSLATIONS, DEFAULT_VESSEL, COASTAL_BASE } from '../data/marineData';

export default function Header({ 
  currentLang, 
  onChangeLang, 
  isOffline, 
  onToggleOffline, 
  onOpenOfflineModal, 
  onOpenSOS 
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-5 py-2.5 flex items-center justify-between gap-4 text-left">
      {/* Left: Quick Search Bar */}
      <div className="flex-1 max-w-md relative hidden sm:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search coordinates, PFZ zones, weather advisories..."
          className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
        />
      </div>

      {/* Middle: Live Satellite & Ground Station Ticker */}
      <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-slate-400">
        <Satellite className="w-3.5 h-3.5 text-sky-400" />
        <span>Oceansat-3 OCM • INSAT-3DR IR • INCOIS SWH Synced • Base: {COASTAL_BASE.portName}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Connectivity Mode */}
        <button
          onClick={onToggleOffline}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isOffline
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
          title="Toggle Online / Offline Mode"
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isOffline ? 'OFFLINE (LOCAL BRAIN)' : 'ONLINE LIVE'}</span>
        </button>

        {/* Language Selector */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={currentLang}
            onChange={(e) => onChangeLang(e.target.value)}
            className="pl-8 pr-6 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                {lang.native} ({lang.label})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Emergency SOS Button */}
        <button
          onClick={onOpenSOS}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/40 transition animate-pulse"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>SOS</span>
        </button>
      </div>
    </header>
  );
}
