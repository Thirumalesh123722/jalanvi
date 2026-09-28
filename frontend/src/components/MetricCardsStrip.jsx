import React from 'react';
import { Waves, Wind, Compass, Clock, ShieldCheck, Fuel } from 'lucide-react';
import { ZONES, DEFAULT_VESSEL } from '../data/marineData';

export default function MetricCardsStrip({ activeZoneId }) {
  const activeZone = ZONES.find(z => z.id === activeZoneId) || ZONES[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 text-left">
      {/* 1. Sea State & Waves */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Waves className="w-3.5 h-3.5 text-cyan-400" /> Sea State
          </span>
          <span className="text-[10px] font-mono text-emerald-400">SLIGHT</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-black text-white font-mono">{activeZone.waveHeight.split(' ')[0]}</span>
          <span className="text-xs text-slate-400">m waves</span>
        </div>
        <span className="text-[10px] text-slate-500 block truncate">Max safe hull: {DEFAULT_VESSEL.maxSafeWaveMeters}m</span>
      </div>

      {/* 2. Wind & Direction */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Wind className="w-3.5 h-3.5 text-purple-400" /> Wind Speed
          </span>
          <span className="text-[10px] font-mono text-slate-400">SW</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-black text-white font-mono">{activeZone.windSpeed.split(' ')[0]}</span>
          <span className="text-xs text-slate-400">knots</span>
        </div>
        <span className="text-[10px] text-slate-500 block truncate">Gusts up to 15 kn</span>
      </div>

      {/* 3. Nearest PFZ */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Compass className="w-3.5 h-3.5 text-emerald-400" /> Optimal PFZ
          </span>
          <span className="text-[10px] font-bold text-emerald-400">{activeZone.opportunityScore}%</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-black text-white font-mono">{activeZone.distanceKm}</span>
          <span className="text-xs text-slate-400">km offshore</span>
        </div>
        <span className="text-[10px] text-slate-500 block truncate">{activeZone.code}</span>
      </div>

      {/* 4. Safe Operating Window */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Safe Window
          </span>
          <span className="text-[10px] font-mono text-emerald-400">+2.8h</span>
        </div>
        <div className="mt-1 text-sm font-black text-white font-mono truncate">
          05:30 – 13:45
        </div>
        <span className="text-[10px] text-amber-400/90 block truncate">Return before swell peak</span>
      </div>

      {/* 5. Decision Stability */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Stability
          </span>
          <span className="text-[10px] font-bold text-sky-300">ROBUST</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-black text-emerald-400 font-mono">{activeZone.stability}%</span>
          <span className="text-xs text-slate-400">confidence</span>
        </div>
        <span className="text-[10px] text-slate-500 block truncate">Red-Team Audited</span>
      </div>

      {/* 6. Fuel & Return Feasibility */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Fuel className="w-3.5 h-3.5 text-cyan-400" /> Fuel Reserve
          </span>
          <span className="text-[10px] font-mono text-emerald-400">SAFE</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-black text-cyan-300 font-mono">79%</span>
          <span className="text-xs text-slate-400">(238L)</span>
        </div>
        <span className="text-[10px] text-slate-500 block truncate">Return-to-shore guaranteed</span>
      </div>
    </div>
  );
}
