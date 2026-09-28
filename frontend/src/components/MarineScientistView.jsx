import React, { useState } from 'react';
import { ECOSYSTEM_HYPOTHESES } from '../data/marineData';
import { 
  Microscope, Sparkles, CheckCircle2, XCircle, 
  HelpCircle, ArrowRight, BarChart3, Waves, TrendingDown 
} from 'lucide-react';

export default function MarineScientistView() {
  const [selectedHypothesis, setSelectedHypothesis] = useState(ECOSYSTEM_HYPOTHESES[0]);

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-800/40 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40 mb-2">
              <Microscope className="w-3.5 h-3.5" /> AI MARINE SCIENTIST & ECOSYSTEM REASONING
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Ecosystem Causal Reasoning & Competing Hypotheses
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Answers complex scientific queries like "Why has fish catch dropped along this coastal sector?" by formulating competing causal hypotheses and evaluating empirical satellite, oceanographic, and acoustic data.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Target Region: Godavari-Visakhapatnam Shelf</span>
          </div>
        </div>
      </div>

      {/* Query Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
          <TrendingDown className="w-5 h-5" />
        </div>
        <div>
          <span className="text-slate-400 text-xs">Investigated Problem:</span>
          <h3 className="text-sm font-bold text-white">
            "Why has pelagic fish productivity declined by 40% in coastal Andhra waters over the last 30 days?"
          </h3>
        </div>
      </div>

      {/* Hypotheses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ranked Hypotheses */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Formulated Hypotheses Ranked by Evidence:
          </h4>

          {ECOSYSTEM_HYPOTHESES.map((hyp) => {
            const isSelected = selectedHypothesis.id === hyp.id;
            return (
              <div
                key={hyp.id}
                onClick={() => setSelectedHypothesis(hyp)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                      #{hyp.rank}
                    </span>
                    <h5 className="font-bold text-xs text-white truncate">{hyp.title}</h5>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-400 shrink-0">
                    {hyp.confidence}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{hyp.summary}</p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Evidence Evaluation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-teal-400 uppercase font-bold tracking-wider">
                  Hypothesis Deep-Dive
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">{selectedHypothesis.title}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Support Confidence</span>
                <span className="text-xl font-bold font-mono text-teal-400">
                  {selectedHypothesis.confidence}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
              {selectedHypothesis.summary}
            </p>

            {/* Evidence For */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Supporting Empirical Observations:
              </span>
              <ul className="space-y-1.5 pl-2">
                {selectedHypothesis.evidenceFor.map((item, i) => (
                  <li key={i} className="text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence Against */}
            <div className="space-y-2 text-xs pt-2">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Contradicting Observations / Unresolved Discrepancies:
              </span>
              <ul className="space-y-1.5 pl-2">
                {selectedHypothesis.evidenceAgainst.map((item, i) => (
                  <li key={i} className="text-slate-300 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendation to Fishers & Scientists */}
            <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-800/40 text-xs space-y-1">
              <span className="font-bold text-teal-300">Actionable Guidance for Coastal Fishers:</span>
              <p className="text-slate-300 leading-relaxed">
                Pelagic stocks are temporarily concentrated seaward of the 90-meter shelf slope (Zone Alpha & Outer Swatch). Avoid shallow inshore grounds (&lt;30m) until the warm eddy dissipates next week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
