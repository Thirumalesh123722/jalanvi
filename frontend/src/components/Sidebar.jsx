import React from 'react';
import { 
  Compass, Sliders, Cpu, HelpCircle, Microscope, 
  Users, Download, Anchor, Fuel, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { DEFAULT_VESSEL, TRANSLATIONS } from '../data/marineData';

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  currentLang,
  isOffline 
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const navItems = [
    { id: 'command', label: t.tabCommand || 'Dashboard', icon: Compass, badge: 'LIVE' },
    { id: 'twin', label: t.tabTwin || 'What-If Simulator', icon: Sliders, badge: 'FLAGSHIP' },
    { id: 'agents', label: t.tabAgents || 'Multi-Agent DAG', icon: Cpu },
    { id: 'explain', label: t.tabExplain || 'Why / Why-Not', icon: HelpCircle },
    { id: 'scientist', label: t.tabScientist || 'AI Marine Scientist', icon: Microscope },
    { id: 'family', label: t.tabFamily || 'Family Link', icon: Users },
    { id: 'offline', label: t.tabOffline || 'Offline Pack', icon: Download },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen shrink-0 text-left">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
          <Anchor className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-black tracking-tight text-white m-0">MarineAI</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            ISRO Marine Platform
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition duration-200 ${
                isActive
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  item.badge === 'FLAGSHIP'
                    ? 'bg-amber-400 text-slate-950 font-mono'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Vessel Telemetry Box */}
      <div className="p-3.5 m-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-semibold text-white flex items-center gap-1">
            <Anchor className="w-3.5 h-3.5 text-sky-400" /> {DEFAULT_VESSEL.name}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>
        </div>

        <div className="text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Hull:</span>
            <span className="text-slate-200">14m Trawler</span>
          </div>
          <div className="flex justify-between">
            <span>Fuel Onboard:</span>
            <span className="text-cyan-300 font-mono font-bold">{DEFAULT_VESSEL.currentFuelLiters} L (79%)</span>
          </div>
          <div className="flex justify-between">
            <span>Engine:</span>
            <span className="text-slate-300 truncate">110 HP Diesel</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>{isOffline ? 'OFFLINE LOCAL BRAIN' : 'NAVIC 12 SATS'}</span>
          <span>{DEFAULT_VESSEL.id.slice(0, 10)}</span>
        </div>
      </div>
    </aside>
  );
}
