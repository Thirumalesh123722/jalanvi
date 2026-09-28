import React, { useState } from 'react';
import { 
  Download, X, CheckCircle2, ShieldCheck, 
  MapPin, Fuel, Radio, AlertTriangle, FileJson, Clock, Package
} from 'lucide-react';
import { ZONES, DEFAULT_VESSEL, COASTAL_BASE, GEOFENCES } from '../data/marineData';

import ModalPortal from './ModalPortal';

export default function OfflinePackModal({ isOpen, onClose, isOffline, onToggleOffline }) {
  const [downloadProgress, setDownloadProgress] = useState(100);
  const [isExporting, setIsExporting] = useState(false);

  // Generate downloadable JSON Mission Pack
  const handleDownloadJSON = () => {
    setIsExporting(true);
    const missionPackData = {
      missionPackVersion: '2.4-OFFLINE',
      generatedAt: new Date().toISOString(),
      vessel: DEFAULT_VESSEL,
      departureBase: COASTAL_BASE,
      zones: ZONES,
      geofences: GEOFENCES,
      offlineRuleEngine: {
        maxSafeWaveMeters: 2.2,
        hardStopBoundaryBufferNm: 12,
        contingencyPort: 'Kakinada Harbour / Visakhapatnam Outer Breakwater',
        emergencyCoastGuardMRCC: '+91-891-2565100 / VHF Channel 16',
      },
      cachedDecisionContract: {
        approvedZone: 'Zone Alpha (Shelf Edge)',
        safeReturnDeadline: '13:45 IST',
        fuelMargin: '79% reserve',
        decisionStability: '89%',
      }
    };

    const blob = new Blob([JSON.stringify(missionPackData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MarineAI_MissionPack_${DEFAULT_VESSEL.id}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-[#0B1E36] text-white flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-[#1D63ED]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0B1E36] text-xs">Offline Marine Mission Pack</h3>
              <p className="text-[11px] text-[#64748B]">
                Zero-connectivity tactical cache for high-seas operations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[2px] text-[#64748B] hover:text-[#0F2942] hover:bg-[#F0F9FF] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto text-xs">
          {/* Offline Status Row */}
          <div className="p-3 rounded-[3px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span className="font-semibold text-xs text-[#0B1E36]">
                  {isOffline ? 'OFFLINE MISSION MODE ACTIVE' : 'ONLINE MODE (SATELLITE SYNCED)'}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {isOffline
                  ? 'Operating on pre-departure downloaded cache and local rule engine.'
                  : 'Directly communicating with coastal ground stations and buoys.'}
              </p>
            </div>

            <button
              onClick={onToggleOffline}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-medium transition cursor-pointer border shrink-0 ${
                isOffline
                  ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                  : 'bg-[#FFFFFF] hover:bg-[#F0F9FF] text-[#0F2942] border-[#CBD5E1]'
              }`}
            >
              {isOffline ? 'Switch to Online' : 'Simulate Offline'}
            </button>
          </div>

          {/* Cached Contents - Clean Structured List instead of repetitive card boxes */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Cached Mission Pack Contents
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 p-3 rounded-[3px] bg-[#FFFFFF] border border-[#E2E8F0]">
              {[
                'Nautical Map Tiles (Z7 - Z14)',
                'PFZ Hotspots & Thermal Gradients',
                'Wave Swell Forecast Evolution',
                'Geofences & Border Clearance',
                'Local Offline Rule & Safety Engine',
                'Emergency VHF & Safe Havens'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 py-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1D63ED] shrink-0" />
                  <span className="text-[11px] text-[#172326] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Communication Dead-Zone Advisory */}
          <div className="p-2.5 rounded-[3px] bg-[#F0F9FF] border border-[#E2E8F0] text-xs text-[#0F2942] flex items-start gap-2">
            <Radio className="w-3.5 h-3.5 text-[#1D63ED] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-[#64748B]">
              <strong className="text-[#0B1E36]">Cellular Dead-Zone:</strong> Coastal 4G drops at approximately 14 NM (26 km) offshore. The application transitions into Offline Mode automatically without interrupting GPS tracking or fuel monitoring.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#64748B]">Bundle Size: ~4.2 MB (Cached)</span>
          <button
            onClick={handleDownloadJSON}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-semibold bg-[#0B1E36] hover:bg-[#152e4d] text-[#FFFFFF] transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#1D63ED]" />
            <span>Export Mission Pack (.json)</span>
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
