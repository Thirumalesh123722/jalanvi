import React, { useState, useMemo } from 'react';
import { ZONES, DEFAULT_VESSEL, COASTAL_BASE } from '../data/marineData';
import { 
  Sliders, Shield, AlertTriangle, CheckCircle2, 
  Fuel, Clock, Waves, Wind, Compass, ArrowRight, RotateCcw, 
  Swords, FileText, Anchor
} from 'lucide-react';

export default function MissionSimulator({ activeZoneId, onSelectZone }) {
  // Simulator input parameters
  const [departureOffsetHours, setDepartureOffsetHours] = useState(0); // 0 = 05:30 AM
  const [fuelCapacityLiters, setFuelCapacityLiters] = useState(300);
  const [waveRiskFactor, setWaveRiskFactor] = useState(1.0); // multiplier 0.8x to 1.5x
  const [targetZoneId, setTargetZoneId] = useState(activeZoneId || 'zone-a');
  const [activePlanTab, setActivePlanTab] = useState('plan-a');

  const selectedZone = useMemo(() => {
    return ZONES.find(z => z.id === targetZoneId) || ZONES[0];
  }, [targetZoneId]);

  // Dynamic simulation computations
  const simulation = useMemo(() => {
    const baseDistance = selectedZone.distanceKm;
    const roundTripKm = baseDistance * 2;
    // Fuel consumption: ~0.74 L per km for this trawler + idling fishing reserve
    const transitFuel = roundTripKm * 0.74;
    const fishingReserve = 25; // 25L for 4 hours of slow trolling
    const totalFuelNeeded = Math.round(transitFuel + fishingReserve);
    const fuelRemaining = fuelCapacityLiters - totalFuelNeeded;
    const fuelMarginPercent = Math.max(0, Math.round((fuelRemaining / fuelCapacityLiters) * 100));

    // Base wave height parsed
    const baseWaveNum = parseFloat(selectedZone.waveHeight) || 1.2;
    const simulatedWave = (baseWaveNum * waveRiskFactor).toFixed(1);

    // Departure time math: base departure is 05:30
    const baseDepMinute = 5 * 60 + 30; // 330 mins
    const simulatedDepMinute = baseDepMinute + (departureOffsetHours * 60);
    const depHour = Math.floor(simulatedDepMinute / 60);
    const depMin = simulatedDepMinute % 60;
    const depTimeFormatted = `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`;

    // Operating window closure (afternoon rough sea / swell starts at 14:00 typically)
    const swellClosureMinute = 14 * 60; // 14:00 (840 mins)
    const transitTimeMinutes = Math.round((baseDistance / (DEFAULT_VESSEL.cruiseSpeedKnots * 1.852)) * 60);
    const returnStartMinute = swellClosureMinute - transitTimeMinutes;
    const returnHour = Math.floor(returnStartMinute / 60);
    const returnMin = returnStartMinute % 60;
    const safeReturnDeadline = `${String(returnHour).padStart(2, '0')}:${String(returnMin).padStart(2, '0')}`;

    // Safety margin (hours between return start and dangerous swell)
    const totalAvailableFishingMinutes = Math.max(0, returnStartMinute - simulatedDepMinute - transitTimeMinutes);
    const safetyMarginHours = Math.max(0, (totalAvailableFishingMinutes / 60)).toFixed(1);

    // Decision Stability computation
    let stabilityScore = 88;
    if (departureOffsetHours > 2) stabilityScore -= (departureOffsetHours * 10);
    if (fuelMarginPercent < 25) stabilityScore -= 30;
    if (simulatedWave > 2.0) stabilityScore -= 25;
    if (selectedZone.inRestrictedZone) stabilityScore = 0;
    stabilityScore = Math.max(0, Math.min(98, stabilityScore));

    // Overall Status
    let verdict = 'GO (HIGH CONFIDENCE)';
    let verdictColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/50';
    if (selectedZone.inRestrictedZone) {
      verdict = 'HARD STOP • RESTRICTED ZONE';
      verdictColor = 'text-rose-400 bg-rose-950/40 border-rose-500/50';
    } else if (stabilityScore < 50 || fuelMarginPercent < 20 || simulatedWave > 2.2) {
      verdict = 'ABORT / ADVISE ALTERNATIVE';
      verdictColor = 'text-rose-400 bg-rose-950/40 border-rose-500/50';
    } else if (stabilityScore < 75 || departureOffsetHours >= 2) {
      verdict = 'CONDITIONAL GO (CAUTION)';
      verdictColor = 'text-amber-400 bg-amber-950/40 border-amber-500/50';
    }

    return {
      roundTripKm,
      transitFuel,
      totalFuelNeeded,
      fuelRemaining,
      fuelMarginPercent,
      simulatedWave,
      depTimeFormatted,
      safeReturnDeadline,
      safetyMarginHours,
      stabilityScore,
      verdict,
      verdictColor,
      transitTimeMinutes,
    };
  }, [selectedZone, departureOffsetHours, fuelCapacityLiters, waveRiskFactor]);

  const handleReset = () => {
    setDepartureOffsetHours(0);
    setFuelCapacityLiters(300);
    setWaveRiskFactor(1.0);
    setTargetZoneId('zone-a');
    onSelectZone('zone-a');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner / Core Innovation Concept */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-800/40 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 mb-2">
              <Compass className="w-3.5 h-3.5" /> MISSION DIGITAL TWIN & WHAT-IF SIMULATOR
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Dynamic Ocean Decision Simulator
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Simulate operational conditions before departing harbour. Adjust departure delays, wave variations, and vessel fuel capacity to recalculate mission safety margins in real-time.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default Baseline
          </button>
        </div>
      </div>

      {/* Simulator Layout: Left Controls, Right Twin Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Sliders & Zone Switcher */}
        <div className="lg:col-span-5 space-y-5 bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" /> Mission Controls
            </h3>
            <span className="text-xs text-slate-400">Vessel: {DEFAULT_VESSEL.name}</span>
          </div>

          {/* 1. Target PFZ Selection */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">
              Target Operational Zone:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ZONES.map(zone => (
                <button
                  key={zone.id}
                  onClick={() => {
                    setTargetZoneId(zone.id);
                    onSelectZone(zone.id);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition ${
                    targetZoneId === zone.id
                      ? 'bg-sky-500/20 border-sky-500 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{zone.id.toUpperCase()}</span>
                    {zone.inRestrictedZone ? (
                      <span className="text-[10px] text-rose-400 font-bold">RESTRICTED</span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold">{zone.opportunityScore}% Opp</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{zone.code}</div>
                  <div className="text-[10px] text-slate-500">{zone.distanceKm} km offshore</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Departure Offset Slider */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Departure Time Offset:
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {departureOffsetHours === 0 ? '05:30 AM (Planned)' : `+${departureOffsetHours}h → ${simulation.depTimeFormatted}`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={departureOffsetHours}
              onChange={(e) => setDepartureOffsetHours(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>05:30 AM</span>
              <span>07:30 AM</span>
              <span>09:30 AM</span>
              <span>10:30 AM</span>
            </div>
          </div>

          {/* 3. Fuel Onboard Slider */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-cyan-400" /> Usable Fuel Capacity:
              </span>
              <span className="font-mono text-cyan-300 font-bold">{fuelCapacityLiters} Liters</span>
            </div>
            <input
              type="range"
              min="150"
              max="450"
              step="25"
              value={fuelCapacityLiters}
              onChange={(e) => setFuelCapacityLiters(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>150 L (Emergency min)</span>
              <span>300 L (Normal)</span>
              <span>450 L (Long range)</span>
            </div>
          </div>

          {/* 4. Ocean Swell / Wave Factor */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-purple-400" /> Wave Swell Severity Factor:
              </span>
              <span className="font-mono text-purple-300 font-bold">{waveRiskFactor}x ({simulation.simulatedWave} m)</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={waveRiskFactor}
              onChange={(e) => setWaveRiskFactor(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.8x (Calm)</span>
              <span>1.0x (Forecast)</span>
              <span>1.5x (Severe Swell)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Mission Digital Twin Synthesis & Decision Contract */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Decision Verdict Box */}
          <div className={`p-5 rounded-2xl border ${simulation.verdictColor} backdrop-blur-md`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  AI DECISION STATUS
                </span>
                <h3 className="text-xl md:text-2xl font-black tracking-tight mt-0.5">
                  {simulation.verdict}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Decision Stability</span>
                <span className="text-2xl font-black font-mono">
                  {simulation.stabilityScore}%
                </span>
              </div>
            </div>

            {/* Stability meter bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  simulation.stabilityScore > 75 ? 'bg-emerald-400' : simulation.stabilityScore > 40 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${simulation.stabilityScore}%` }}
              />
            </div>
          </div>

          {/* Key Simulation Outputs (Safe Window, Fuel Reserve, Safety Margin) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-4 h-4 text-sky-400" /> Safe Return Deadline
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {simulation.safeReturnDeadline} IST
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must initiate return before afternoon swell crosses 2.0m.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400" /> Operational Safety Margin
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                +{simulation.safetyMarginHours} Hours
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Buffer available at target zone before weather threshold expires.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Fuel className="w-4 h-4 text-cyan-400" /> Return Fuel Reserve
              </div>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                {simulation.fuelMarginPercent}% ({simulation.fuelRemaining} L)
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {simulation.fuelMarginPercent < 20 ? '⚠️ CRITICAL: Refuel recommended' : 'Guaranteed safe shore return'}
              </p>
            </div>
          </div>

          {/* Adversarial Challenger vs Planner Debate Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Swords className="w-4 h-4 text-rose-400" /> Adversarial AI Challenge / Red-Team Audit
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                Active Verification
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <span className="font-semibold text-emerald-400 block mb-1">
                  🧭 Planner Agent Stance:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Zone {selectedZone.id.toUpperCase()} offers {selectedZone.opportunityScore}% chlorophyll-temperature overlap. Round trip of {simulation.roundTripKm} km fits well within vessel fuel range.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <span className="font-semibold text-rose-400 block mb-1">
                  ⚔️ Challenger Red-Team Finding:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedZone.inRestrictedZone
                    ? 'CRITICAL DEFENSE VIOLATION: Route penetrates Eastern Fleet Firing Sector NOTAM #092.'
                    : departureOffsetHours > 2
                      ? `Delayed departure (${simulation.depTimeFormatted}) reduces safe fishing window to only ${simulation.safetyMarginHours}h. Return transit coincides with peak wave swell.`
                      : `Target zone clear of geofences. Wave height ${simulation.simulatedWave}m acceptable for ${DEFAULT_VESSEL.type}.`}
                </p>
              </div>
            </div>
          </div>

          {/* Decision Contract Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-sky-900/40 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-400" /> Formal Decision Contract (PS Layer 13)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400">Hard Stops:</span>
                <span className="text-rose-400 ml-1 font-medium">Naval Exclusion Zone, Waves &gt; 2.2m, Fuel Reserve &lt; 20%</span>
              </div>
              <div>
                <span className="text-slate-400">Reconsider If:</span>
                <span className="text-amber-400 ml-1 font-medium">Departure delayed past 07:45 AM or swell jumps 0.4m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
