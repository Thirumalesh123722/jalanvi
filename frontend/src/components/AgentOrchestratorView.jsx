import React, { useState } from 'react';
import { AGENTS_SYSTEM, DEFAULT_VESSEL, ZONES } from '../data/marineData';
import { 
  Cpu, Compass, Satellite, CloudRain, ShieldAlert, Fuel, 
  Swords, CheckCircle2, Play, Check, AlertCircle, ArrowDown, 
  BrainCircuit, Database, ShieldCheck, FileCheck
} from 'lucide-react';

const ICON_MAP = {
  Brain: BrainCircuit,
  Compass: Compass,
  Satellite: Satellite,
  CloudRain: CloudRain,
  ShieldAlert: ShieldAlert,
  Fuel: Fuel,
  Swords: Swords,
  CheckCircle2: CheckCircle2,
};

export default function AgentOrchestratorView({ activeZoneId }) {
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [executedSteps, setExecutedSteps] = useState([0, 1, 2, 3, 4, 5, 6, 7]);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS_SYSTEM[0]);

  const activeZone = ZONES.find(z => z.id === activeZoneId) || ZONES[0];

  const handleRunPipeline = () => {
    setIsRunningPipeline(true);
    setExecutedSteps([]);

    AGENTS_SYSTEM.forEach((_, idx) => {
      setTimeout(() => {
        setExecutedSteps(prev => [...prev, idx]);
        if (idx === AGENTS_SYSTEM.length - 1) {
          setIsRunningPipeline(false);
        }
      }, (idx + 1) * 350);
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mb-2">
              <Cpu className="w-3.5 h-3.5" /> AGENTIC MULTI-AGENT ORCHESTRATION PIPELINE
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Autonomous Agent Collaboration Directed Acyclic Graph (DAG)
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Specialized agents autonomously discover satellite EO layers, predict hydrodynamics, enforce maritime geofences, and subject candidate plans to adversarial red-teaming.
            </p>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={isRunningPipeline}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 transition"
          >
            {isRunningPipeline ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Coordinating Agents...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Re-Execute Multi-Agent DAG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Agent Flow, Right Agent Deep Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Agent Pipeline Cards */}
        <div className="lg:col-span-7 space-y-3">
          {AGENTS_SYSTEM.map((agent, idx) => {
            const Icon = ICON_MAP[agent.icon] || Cpu;
            const isCompleted = executedSteps.includes(idx);
            const isSelected = selectedAgent.id === agent.id;

            return (
              <div key={agent.id} className="relative">
                <div
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  {/* Status Indicator Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    agent.id === 'challenger-agent'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : isCompleted
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{agent.name}</span>
                        {agent.id === 'challenger-agent' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            RED TEAM
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 shrink-0">
                        <span>{agent.latency}</span>
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{agent.role}</p>

                    <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-indigo-200/90 font-mono">
                      ↳ {agent.lastAction}
                    </div>
                  </div>
                </div>

                {/* Connecting arrow between agents */}
                {idx < AGENTS_SYSTEM.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <div className="w-0.5 h-2 bg-slate-800"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Agent Deep Inspector & Decision Contract */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Agent Detail Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-wider">
                  Agent Inspector
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedAgent.name}</h3>
              </div>
              <span className="px-2 py-1 rounded-lg text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedAgent.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium mb-1">Underlying AI Model / Engine:</span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono">
                  {selectedAgent.model}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-medium mb-1">Core Capability & Mission Objective:</span>
                <p className="text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedAgent.role}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block font-medium mb-1">Live Autonomous Tool Execution:</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300/90 font-mono text-[11px] leading-relaxed">
                  {selectedAgent.lastAction}
                </div>
              </div>
            </div>
          </div>

          {/* Resulting Decision Contract Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-800/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" /> RATIFIED MISSION CONTRACT
              </span>
              <span className="text-[10px] font-mono text-slate-400">ISRO-MAR-2026-902</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Area:</span>
                <span className="font-semibold text-white">{activeZone.code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Overall Recommendation:</span>
                <span className="font-bold text-emerald-300">{activeZone.recommendation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Adversarial Red-Team Status:</span>
                <span className="font-semibold text-sky-300">Reviewed & Ratified</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Decision Stability:</span>
                <span className="font-mono text-emerald-400 font-bold">{activeZone.stability}% High</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Safe Return Contingency:</span>
                <span className="font-semibold text-purple-300">Guaranteed before 13:45 IST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
