import React, { useState } from 'react';
import { ZONES } from '../data/marineData';
import { 
  HelpCircle, CheckCircle2, XCircle, AlertTriangle, 
  Satellite, ArrowRight, ShieldCheck, Database, 
  GitFork, Layers, FileText
} from 'lucide-react';

export default function ExplainabilityView({ activeZoneId, onSelectZone }) {
  const [selectedZoneId, setSelectedZoneId] = useState(activeZoneId || 'zone-a');
  const [activeTab, setActiveTab] = useState('why-matrix'); // 'why-matrix' | 'provenance' | 'counterfactual'

  const activeZone = ZONES.find(z => z.id === selectedZoneId) || ZONES[0];
  const alternativeZones = ZONES.filter(z => z.id !== selectedZoneId);

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/40 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
              <HelpCircle className="w-3.5 h-3.5" /> EXPLAINABLE AI & EVIDENCE PROVENANCE
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Why / Why-Not Explainability & Audit Engine
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Understand the exact empirical evidence behind every decision. Transparent trade-offs show why a candidate zone was approved and why higher-yield alternatives were disqualified on safety grounds.
            </p>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('why-matrix')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'why-matrix' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Why vs Why-Not Matrix
            </button>
            <button
              onClick={() => setActiveTab('provenance')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'provenance' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite Provenance
            </button>
            <button
              onClick={() => setActiveTab('counterfactual')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'counterfactual' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Counterfactual Reasoning
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'why-matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Primary Recommendation: WHY THIS? */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Primary Recommendation
                    </span>
                    <h3 className="text-base font-bold text-white">WHY ZONE ALPHA?</h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  APPROVED (89% STABILITY)
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <span className="text-emerald-400 font-semibold block">
                    1. Optimal Ocean Thermal-Biological Coupling:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    SST front at 28.4°C correlates with a dense chlorophyll bloom (1.45 mg/m³) derived from Oceansat-3 OCM, providing prime pelagic feeding conditions.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <span className="text-emerald-400 font-semibold block">
                    2. Manageable Wave & Sea State:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Significant wave height is 1.2m, safely below the vessel's 2.2m hydrodynamic ceiling. Wind is moderate at 11 knots from SW.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <span className="text-emerald-400 font-semibold block">
                    3. Guaranteed Shore Return Window:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Distance is 42 km (approx 2.7 hours transit each way). Total fuel required is 62L, leaving 79% (238L) reserve in the 300L fuel tank.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <span className="text-emerald-400 font-semibold block">
                    4. Zero Geofence & Boundary Conflicts:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Position lies 148 km away from the International Maritime Boundary Line and completely outside naval exercise arcs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Candidates: WHY NOT? */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    ✕
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      Disqualified Alternatives
                    </span>
                    <h3 className="text-base font-bold text-white">WHY NOT THE OTHERS?</h3>
                  </div>
                </div>
                <span className="text-xs text-slate-400">Rejected on Risk & Constraints</span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Zone Bravo */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Zone Bravo (Outer Swatch - 88 km)</span>
                    <span className="text-rose-400 font-bold text-[11px]">Opportunity: 97% (Very High)</span>
                  </div>
                  <p className="text-rose-300/90 font-medium">
                    Why Rejected:
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Despite having the highest fish productivity indicators, the 88 km offshore transit demands 145L fuel. The Adversarial Challenger flagged that swell builds to 2.8m by 14:00, creating an unacceptable capsizing risk for small mechanized trawlers.
                  </p>
                </div>

                {/* Zone Charlie */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Zone Charlie (Kakinada Bight - 65 km)</span>
                    <span className="text-amber-400 font-bold text-[11px]">Opportunity: 78% (Moderate)</span>
                  </div>
                  <p className="text-amber-300/90 font-medium">
                    Why Sub-optimal:
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Extremely safe (0.8m waves in the lee of the spit), but chlorophyll concentration (0.95 mg/m³) is 34% lower than Zone Alpha. Designated as fallback conservative Plan C if weather unexpectedly degrades.
                  </p>
                </div>

                {/* Zone Delta */}
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300">Zone Delta (Naval Firing Range)</span>
                    <span className="text-rose-400 font-bold text-[11px]">GEOFENCE HARD STOP</span>
                  </div>
                  <p className="text-rose-300 font-medium">
                    Why Blocked:
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Prohibited by Coastal Defense Authority Notice NOTAM #092 (Eastern Fleet live-fire exercise). Civilian craft strictly forbidden.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'provenance' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white">Satellite Evidence Provenance Tree (PS Layer 19)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Trace how raw satellite Earth Observation telemetry is converted step-by-step into operational decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Satellite className="w-4 h-4" /> 1. Raw Telemetry
              </div>
              <p className="text-slate-400">
                Oceansat-3 Ocean Colour Monitor (OCM-3) spectral bands + INSAT-3DR Thermal IR channels.
              </p>
              <div className="text-[10px] font-mono text-slate-500">Latency: 28 mins ago</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Layers className="w-4 h-4" /> 2. Derived Geophysical
              </div>
              <p className="text-slate-400">
                L3 Chlorophyll-a (1.45 mg/m³) algorithm + Level 4 blended Sea Surface Temperature (28.4°C).
              </p>
              <div className="text-[10px] font-mono text-slate-500">Spatial Res: 1 km grid</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Database className="w-4 h-4" /> 3. Thermal Edge Extraction
              </div>
              <p className="text-slate-400">
                Ocean Analytics Agent detects 0.8°C horizontal thermal gradient coinciding with chlorophyll ridge.
              </p>
              <div className="text-[10px] font-mono text-slate-500">PFZ Confidence: 92%</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> 4. Decision Contract
              </div>
              <p className="text-slate-400">
                Correlated with wave forecast (1.2m) & fuel margin to ratify Plan A departure at 05:30 AM.
              </p>
              <div className="text-[10px] font-mono text-slate-500">Action: CONDITIONAL GO</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'counterfactual' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Counterfactual Decision Engine (PS Layer 11)</h3>
            <p className="text-xs text-slate-400 mt-1">
              "What caused the recommendation to change?" and "Under what hypothetical conditions would the alternative be chosen?"
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-sky-400">Scenario 1: If wave forecast at Zone Bravo had remained at 1.2m:</span>
              <p className="text-slate-300 leading-relaxed">
                → The recommendation <strong>would have switched to Zone Bravo</strong> because its 97% fishing opportunity outweighs the longer transit, provided the vessel carried &gt; 250L fuel.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400">Scenario 2: If departure was delayed from 05:30 to 09:30 AM:</span>
              <p className="text-slate-300 leading-relaxed">
                → The recommendation <strong>would abort Zone Alpha and divert to Zone Charlie</strong> (nearshore Kakinada Bight) because the return deadline would not allow safe fishing offshore before the afternoon swell.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
