import React, { useState } from 'react';
import ScreenScientificAiPage from './ScreenScientificAiPage';
import ScreenFamilyLinkPage from './ScreenFamilyLinkPage';
import { Sparkles, Users, Columns, Maximize2 } from 'lucide-react';

export default function ScreenScientificAndFamily({
  initialView = 'scientific', // 'scientific' | 'family' | 'dual'
  onNavigateTab,
  onOpenEmergency
}) {
  const [viewMode, setViewMode] = useState(initialView);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F8FA] overflow-hidden text-left">
      {/* Top Floating View Switcher Bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 py-2 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mr-1">
            Display Mode:
          </span>

          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-[6px] border border-[#CBD5E1]">
            <button
              onClick={() => setViewMode('scientific')}
              className={`px-3 py-1 rounded-[4px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'scientific'
                  ? 'bg-white text-[#1D63ED] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B1E36]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1D63ED]" />
              <span>Scientific AI</span>
            </button>

            <button
              onClick={() => setViewMode('family')}
              className={`px-3 py-1 rounded-[4px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'family'
                  ? 'bg-white text-[#1D63ED] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B1E36]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#1D63ED]" />
              <span>Family Link</span>
            </button>

            <button
              onClick={() => setViewMode('dual')}
              className={`px-3 py-1 rounded-[4px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'dual'
                  ? 'bg-[#1D63ED] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B1E36]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual View (Both Pages Side-by-Side)</span>
            </button>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#64748B]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Telemetry & ISRO Grounding Active</span>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {viewMode === 'scientific' && (
          <ScreenScientificAiPage
            onNavigateTab={onNavigateTab}
            onToggleDualView={() => setViewMode('dual')}
            isDualView={false}
          />
        )}

        {viewMode === 'family' && (
          <ScreenFamilyLinkPage
            onNavigateTab={onNavigateTab}
            onOpenEmergency={onOpenEmergency}
            onToggleDualView={() => setViewMode('dual')}
            isDualView={false}
          />
        )}

        {viewMode === 'dual' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4 h-full">
            {/* Left Column: Scientific AI */}
            <div className="bg-white border border-[#CBD5E1] rounded-[12px] shadow-sm overflow-hidden flex flex-col h-full">
              <ScreenScientificAiPage
                onNavigateTab={onNavigateTab}
                onToggleDualView={() => setViewMode('scientific')}
                isDualView={true}
              />
            </div>

            {/* Right Column: Family Link */}
            <div className="bg-white border border-[#CBD5E1] rounded-[12px] shadow-sm overflow-hidden flex flex-col h-full">
              <ScreenFamilyLinkPage
                onNavigateTab={onNavigateTab}
                onOpenEmergency={onOpenEmergency}
                onToggleDualView={() => setViewMode('family')}
                isDualView={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
