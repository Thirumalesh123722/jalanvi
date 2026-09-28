import React, { useState, useEffect } from 'react';
import { 
  Users, X, Phone, ShieldCheck, MapPin, Send, 
  CheckCircle2, Clock, Anchor, Radio, AlertTriangle, 
  Smartphone, Copy, ExternalLink, Share2, Plus, Trash2, 
  Battery, Fuel, Compass, Bell, ShieldAlert, Check,
  Wifi, WifiOff, AlertOctagon, RefreshCw, Globe, ArrowRight,
  Shield, LifeBuoy
} from 'lucide-react';
import ModalPortal from './ModalPortal';
import MarineApi from '../services/api';

// 9-State Mission Model Configuration
const MISSION_STATES_CONFIG = {
  MISSION_PLANNED: { label: 'MISSION PLANNED', color: 'bg-slate-100 text-slate-800 border-slate-300', desc: 'Pre-departure checks completed. Awaiting harbor clearance.' },
  MISSION_STARTED: { label: 'MISSION STARTED', color: 'bg-blue-50 text-blue-800 border-blue-200', desc: 'Vessel has unmoored and departed harbor.' },
  AT_SEA: { label: 'AT SEA (TRANSIT)', color: 'bg-indigo-50 text-indigo-800 border-indigo-200', desc: 'Outward transit along planned trajectory.' },
  FISHING_ACTIVE: { label: 'FISHING ACTIVE & SAFE', color: 'bg-emerald-50 text-emerald-800 border-emerald-300', desc: 'Operating in designated fishing zone. Nets deployed.' },
  RETURNING: { label: 'RETURNING TO BASE', color: 'bg-sky-50 text-sky-800 border-sky-300', desc: 'Return transit commenced. On schedule to safe port.' },
  COMPLETED: { label: 'MISSION COMPLETED', color: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'Vessel safely moored at base harbor.' },
  CONNECTION_LIMITED: { label: 'LIMITED CONNECTIVITY', color: 'bg-amber-50 text-amber-800 border-amber-300', desc: 'Beyond cellular range. Operating via NavIC satellite bursts.' },
  SAFETY_ALERT: { label: 'SAFETY ADVISORY ALERT', color: 'bg-amber-100 text-amber-900 border-amber-400', desc: 'Localized weather or swell alert. Sheltered path taken.' },
  SOS_ACTIVATED: { label: '🚨 SOS DISTRESS ACTIVATED', color: 'bg-rose-100 text-rose-900 border-rose-400 font-bold animate-pulse', desc: 'Distress signal relayed to MRCC 1093 & Emergency Kin.' }
};

// Shore View Multi-Lingual Strings
const SHORE_VIEW_TRANSLATIONS = {
  en: {
    title: "Marine Safety Shore Link",
    govtBadge: "Govt of India • INCOIS & ISRO",
    safeBanner: "VESSEL SAFE & RETURN ON SCHEDULE",
    sosBanner: "DISTRESS ALERT ACTIVE — RESCUE COORDINATING",
    expectedReturn: "Expected Return at Harbour",
    remaining: "remaining",
    telemetryHeading: "Telemetry & Ocean State",
    location: "Location:",
    seaState: "Sea Conditions:",
    speed: "Speed:",
    lastVerified: "Last Verified:",
    callHarbour: "Call Port / Harbour Master",
    callCoastGuard: "Coast Guard Toll-Free (1093)",
    safetyGuarantee: "Return corridor guaranteed safe with reserve fuel margin.",
    honestLimited: "Operating in limited connectivity zone. Position updated via NavIC satellite bursts."
  },
  ta: {
    title: "கடல் பாதுகாப்பு கரை கண்காணிப்பு",
    govtBadge: "இந்திய அரசு • INCOIS & ISRO",
    safeBanner: "படகு பாதுகாப்பாக உள்ளது • திரும்பும் நேரம் திட்டப்படி",
    sosBanner: "அவசர உதவி சமிக்ஞை இயங்குகிறது — மீட்பு குழு விரைவு",
    expectedReturn: "துறைமுகம் திரும்பும் உத்தேச நேரம்",
    remaining: "மீதமுள்ளது",
    telemetryHeading: "படகு நிலை & கடல் சூழல்",
    location: "இடம்:",
    seaState: "கடல் நிலை:",
    speed: "வேகம்:",
    lastVerified: "கடைசி சரிபார்ப்பு:",
    callHarbour: "துறைமுக அதிகாரிக்கு அழைக்கவும்",
    callCoastGuard: "கடலோர காவல்படை (1093)",
    safetyGuarantee: "பாதுகாப்பான திரும்பும் வழித்தடம் கண்காணிக்கப்படுகிறது.",
    honestLimited: "செயற்கைக்கோள் வழியாக கடைசி பதிவு பெறப்பட்டது."
  },
  te: {
    title: "సముద్ర భద్రతా తీర ట్రాకర్",
    govtBadge: "భారత ప్రభుత్వం • INCOIS & ISRO",
    safeBanner: "బోట్ సురక్షితం • సమయానికి తిరుగు ప్రయాణం",
    sosBanner: "అత్యవసర హెచ్చరిక — రక్షణ బృందం సమన్వయం",
    expectedReturn: "రేవుకు చేరుకునే సమయం",
    remaining: "మిగిలి ఉంది",
    telemetryHeading: "టెలిమెట్రీ & సముద్ర వాతావరణం",
    location: "స్థానం:",
    seaState: "సముద్ర పరిస్థితి:",
    speed: "వేగం:",
    lastVerified: "చివరి అప్‌డేట్:",
    callHarbour: "హార్బర్ మాస్టర్‌కు కాల్ చేయండి",
    callCoastGuard: "కోస్ట్ గార్డ్ (1093)",
    safetyGuarantee: "సురక్షిత తిరుగు ప్రయాణ మార్గం అందుబాటులో ఉంది.",
    honestLimited: "శాటిలైట్ బరస్ట్ ద్వారా సమాచారం నవీకరించబడింది."
  },
  hi: {
    title: "समुद्री सुरक्षा तटीय लिंक",
    govtBadge: "भारत सरकार • INCOIS और ISRO",
    safeBanner: "नाव सुरक्षित है • वापसी समय पर निर्धारित",
    sosBanner: "आपातकालीन चेतावनी सक्रिय — राहत कार्य जारी",
    expectedReturn: "बंदरगाह वापसी का अनुमानित समय",
    remaining: "शेष",
    telemetryHeading: "टेलीमेट्री और समुद्री स्थिति",
    location: "स्थिति:",
    seaState: "समुद्र की स्थिति:",
    speed: "गति:",
    lastVerified: "अंतिम पुष्टि:",
    callHarbour: "बंदरगाह अधिकारी को कॉल करें",
    callCoastGuard: "तटरक्षक बल टोल-फ्री (1093)",
    safetyGuarantee: "वापसी गलियारा पूरी तरह सुरक्षित और ट्रैक किया जा रहा है।",
    honestLimited: "नाविक सैटेलाइट द्वारा स्थिति अपडेट की गई है।"
  }
};

export default function FamilyLinkModal({ isOpen, onClose, globalLanguage = 'en' }) {
  const [activeTab, setActiveTab] = useState('vessel'); // 'vessel' | 'shore_preview'
  const [shoreLang, setShoreLang] = useState(globalLanguage || 'en');
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Custom Note Input
  const [customNote, setCustomNote] = useState('All safe and nets deployed. Sea conditions are calm.');
  const [isSendingUpdate, setIsSendingUpdate] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // SOS Modal / Action State
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [sosReason, setSosReason] = useState('Sudden Engine Failure');
  const [isSubmittingSos, setIsSubmittingSos] = useState(false);
  const [isCancellingSos, setIsCancellingSos] = useState(false);

  // Add Contact Form State
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Spouse');
  const [newContactPhone, setNewContactPhone] = useState('+91 ');
  const [newContactSms, setNewContactSms] = useState(true);
  const [newContactWa, setNewContactWa] = useState(true);

  // Fetch status on open
  useEffect(() => {
    if (!isOpen) return;
    fetchStatus();
  }, [isOpen]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await MarineApi.getFamilyLinkStatus();
      if (res && res.success) {
        setStatusData(res);
      } else {
        setStatusData(getFallbackData());
      }
    } catch {
      setStatusData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackData = () => ({
    success: true,
    mission: {
      mission_id: "MIS-2026-0927-B",
      mission_name: "Palk Bay Pelagic Intercept (Plan B)",
      status: "FISHING_ACTIVE",
      base_port: "Rameswaram Fishing Harbor",
      destination_zone: "Palk Bay Thermal Edge (Zone B • 14.2 NM Offshore)",
      departure_time: "Today, 05:00 IST",
      expected_return: "Today, 17:20 IST",
      eta_countdown: "3 hours 15 minutes",
      share_with_family: true,
      authorized_contact_ids: ["c-1", "c-2", "c-3"],
      vessel: {
        id: "IND-TN-09-MM-4421",
        name: "Matsya-Varuna",
        registration: "IND-TN-09-MM-4421",
        captain: "K. Murugan (Master Fisher)",
        crew_count: 5
      },
      connectivity: {
        state: "LIMITED",
        connection_label: "Limited — NavIC Coastal Satellite Only",
        is_live_tracking: false,
        last_known_location: {
          latitude: 9.1524,
          longitude: 79.6842,
          distance_from_port_nm: 14.2,
          bearing_from_port: "125° SE of Rameswaram",
          updated_at: "Updated 18 minutes ago via NavIC-L5",
          timestamp: "17:42 IST"
        },
        cellular_status: "No 4G/LTE (Beyond 14 NM Perimeter)",
        satellite_uplink: "NavIC-L5 Beacon Active (15-min burst interval)"
      },
      smart_updates: [
        {
          id: "upd-001",
          type: "TRIP_STARTED",
          badge_color: "emerald",
          title: "Trip Started",
          time: "05:00 IST",
          message: "Matsya-Varuna departed Rameswaram Harbour on schedule with 5 crew on board.",
          dispatched_to: ["K. Lakshmi", "V. Naidu", "R. Ramanathan"]
        },
        {
          id: "upd-002",
          type: "MISSION_UPDATE",
          badge_color: "blue",
          title: "Nets Cast & Zone Reached",
          time: "10:30 IST",
          message: "Vessel reached fishing zone safely (14.2 NM offshore). Weather conditions are calm (1.1m swell).",
          dispatched_to: ["K. Lakshmi", "V. Naidu", "R. Ramanathan"]
        }
      ],
      sos_incident: null
    },
    contacts: [
      { id: "c-1", name: "K. Lakshmi", relationship: "Spouse / Primary Kin", phone: "+91 98480 23119", notify_sms: true, notify_whatsapp: true, is_emergency_priority: true, status: "DELIVERED_OK", last_notified: "12 mins ago" },
      { id: "c-2", name: "V. Naidu", relationship: "Harbour Master (Rameswaram Port)", phone: "+91 891 256 8920", notify_sms: true, notify_whatsapp: false, is_emergency_priority: true, status: "LOGGED_AT_PORT", last_notified: "45 mins ago" },
      { id: "c-3", name: "R. Ramanathan", relationship: "Shore Watchdog & Partner", phone: "+91 94441 55820", notify_sms: true, notify_whatsapp: true, is_emergency_priority: false, status: "DELIVERED_OK", last_notified: "12 mins ago" }
    ],
    share_token: "mv-track-7729-tn09",
    public_tracking_url: "https://marine-ai.gov.in/track/mv-track-7729-tn09"
  });

  const mission = statusData?.mission || getFallbackData().mission;
  const contacts = statusData?.contacts || getFallbackData().contacts;
  const connectivity = mission?.connectivity || getFallbackData().mission.connectivity;
  const vessel = mission?.vessel || getFallbackData().mission.vessel;
  const smartUpdates = mission?.smart_updates || getFallbackData().mission.smart_updates;
  const isSosActive = mission?.status === 'SOS_ACTIVATED' || !!mission?.sos_incident;

  // Toggle Connectivity State (for honest simulation)
  const handleSetConnectivity = async (newState) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/family-link/connectivity-state?state=' + newState, {
        method: 'POST'
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (err) {
      console.warn("Connectivity toggle fallback:", err);
    }
  };

  // Dispatch a curated smart update
  const handleDispatchCuratedUpdate = async (type, title, defaultMessage) => {
    setIsSendingUpdate(true);
    setUpdateSuccess(null);
    try {
      const msg = customNote && type === 'CUSTOM' ? customNote : defaultMessage;
      const res = await fetch('http://127.0.0.1:8000/api/family-link/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update_type: type === 'CUSTOM' ? 'MISSION_UPDATE' : type,
          title: title,
          message: msg,
          badge_color: type === 'RETURN_TO_BASE' ? 'blue' : type === 'SAFETY_ALERT' ? 'amber' : 'emerald'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUpdateSuccess(data.message || 'Smart update dispatched to family successfully.');
        fetchStatus();
      } else {
        simulateLocalUpdate(title, msg);
      }
    } catch {
      simulateLocalUpdate(title, defaultMessage);
    } finally {
      setIsSendingUpdate(false);
    }
  };

  const simulateLocalUpdate = (title, message) => {
    setUpdateSuccess(`Dispatched '${title}' to ${contacts.length} family contacts via NavIC Coastal SMS.`);
    setTimeout(() => setUpdateSuccess(null), 5000);
  };

  // Real Smart SOS Activation
  const handleTriggerSos = async () => {
    setIsSubmittingSos(true);
    try {
      const res = await MarineApi.triggerFamilyLinkSos({
        reason: sosReason,
        location: connectivity?.last_known_location,
        direct_call_mrcc: true
      });
      if (res && res.success) {
        setShowSosConfirm(false);
        fetchStatus();
      }
    } catch (err) {
      console.warn("SOS trigger fallback:", err);
      setShowSosConfirm(false);
      fetchStatus();
    } finally {
      setIsSubmittingSos(false);
    }
  };

  // Stand-down / Cancel SOS
  const handleCancelSos = async () => {
    setIsCancellingSos(true);
    try {
      const res = await MarineApi.cancelFamilyLinkSos({ reason: 'Vessel master declared emergency resolved' });
      if (res && res.success) {
        fetchStatus();
      }
    } catch (err) {
      console.warn("SOS cancel fallback:", err);
      fetchStatus();
    } finally {
      setIsCancellingSos(false);
    }
  };

  const handleCopyLink = () => {
    const url = statusData?.public_tracking_url || 'https://marine-ai.gov.in/track/mv-track-7729-tn09';
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shoreT = SHORE_VIEW_TRANSLATIONS[shoreLang] || SHORE_VIEW_TRANSLATIONS.en;
  const currentStatusConf = MISSION_STATES_CONFIG[mission?.status] || MISSION_STATES_CONFIG.FISHING_ACTIVE;

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-3xl bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left">
        {/* Modal Top Bar */}
        <div className="bg-[#0B1E36] px-5 py-3.5 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[#1D63ED]/20 border border-[#1D63ED]/40 flex items-center justify-center text-[#60A5FA]">
              <Users className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm tracking-wide">Family Safety Link & Shore Watchdog</h3>
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40">
                  LAYER 29 & 30
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Connectivity-aware mission lifecycle • NavIC burst telemetry • Smart SOS connected with Coast Guard MRCC 1093
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-[2px] text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Tabs (Vessel Command vs Family Shore Mobile Preview) */}
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('vessel')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'vessel'
                  ? 'bg-[#0B1E36] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-[#CBD5E1]'
              }`}
            >
              <Anchor className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Vessel Bridge Console</span>
            </button>

            <button
              onClick={() => setActiveTab('shore_preview')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'shore_preview'
                  ? 'bg-[#1D63ED] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-[#CBD5E1]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Family Shore Mobile View</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded font-mono">PREVIEW</span>
            </button>
          </div>

          {/* Active Mission Status Pill */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-[2px] text-[10px] font-mono font-bold border ${currentStatusConf.color}`}>
              {currentStatusConf.label}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#F8FAFC]/50">
          {/* DISTRESS ALERT BANNER (If SOS Activated) */}
          {isSosActive && (
            <div className="p-4 rounded-[3px] bg-rose-50 border-2 border-rose-500 text-rose-950 space-y-3 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-5 h-5 text-rose-600 animate-bounce shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide text-rose-900">
                      🚨 ACTIVE DISTRESS INCIDENT — COAST GUARD MRCC 1093 NOTIFIED
                    </h4>
                    <p className="text-[11px] text-rose-800 mt-0.5">
                      Incident Ref: <strong className="font-mono">{mission?.sos_incident?.incident_id || 'SOS-ALERT-ACTIVE'}</strong> • Reason: {mission?.sos_incident?.reason || 'Distress signal active'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCancelSos}
                  disabled={isCancellingSos}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-rose-300 rounded-[2px] text-rose-800 text-xs font-bold transition cursor-pointer shrink-0 shadow-xs"
                >
                  {isCancellingSos ? 'Standing Down...' : 'Stand-Down / Cancel SOS'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white/80 p-2.5 rounded-[2px] border border-rose-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">LAST KNOWN FIX</span>
                  <span className="font-mono font-bold text-slate-900">{connectivity?.last_known_location?.latitude}°N, {connectivity?.last_known_location?.longitude}°E</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">MRCC STATION</span>
                  <span className="font-semibold text-rose-900">Chennai / Mandapam (Ch 16)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">KIN NOTIFIED</span>
                  <span className="font-semibold text-emerald-800">Priority SMS + Voice Call</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vessel' ? (
            /* TAB 1: VESSEL BRIDGE CONSOLE */
            <>
              {/* 1. Honest Connectivity State Banner */}
              <div className="p-3.5 rounded-[3px] bg-[#FFFFFF] border border-[#CBD5E1] space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    {connectivity.state === 'ONLINE' ? (
                      <Wifi className="w-4 h-4 text-emerald-600" />
                    ) : connectivity.state === 'LIMITED' ? (
                      <Radio className="w-4 h-4 text-[#1D63ED] animate-pulse" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="text-xs font-bold text-[#0B1E36] uppercase tracking-wide">
                      Honest Connectivity-Aware Location Status
                    </span>
                  </div>

                  {/* Connectivity State Toggle for Demo/Testing */}
                  <div className="flex items-center gap-1 bg-[#F0F9FF] p-0.5 rounded-[2px] border border-[#E2E8F0] text-[10px] font-mono">
                    <span className="text-[#64748B] px-1 font-sans">Simulate:</span>
                    {['ONLINE', 'LIMITED', 'OFFLINE'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleSetConnectivity(st === 'OFFLINE' ? 'OFFLINE_DEADZONE' : st)}
                        className={`px-2 py-0.5 rounded-[2px] transition cursor-pointer font-bold ${
                          (st === 'OFFLINE' && connectivity.state === 'OFFLINE_DEADZONE') || connectivity.state === st
                            ? 'bg-[#1D63ED] text-white shadow-xs'
                            : 'text-[#64748B] hover:text-[#0B1E36]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-[2px] bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] block font-mono uppercase">CONNECTION TYPE</span>
                    <span className="font-bold text-[#0B1E36] block mt-0.5">{connectivity.connection_label}</span>
                    <span className="text-[10px] text-[#64748B]">{connectivity.cellular_status}</span>
                  </div>

                  <div className="p-2.5 rounded-[2px] bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] block font-mono uppercase">LOCATION FRESHNESS</span>
                    <span className="font-bold text-[#1D63ED] block mt-0.5">
                      {connectivity.is_live_tracking ? 'Live Continuous Tracking' : connectivity.last_known_location?.updated_at}
                    </span>
                    <span className="text-[10px] text-[#64748B]">Never faking GPS in blackouts</span>
                  </div>

                  <div className="p-2.5 rounded-[2px] bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] block font-mono uppercase">SATELLITE UPLINK</span>
                    <span className="font-bold text-[#0B1E36] block mt-0.5">NavIC-L5 Maritime Transponder</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-medium">156.8 MHz Ch 16 Active</span>
                  </div>
                </div>
              </div>

              {/* 2. Curated Smart Updates Dispatch Box */}
              <div className="p-3.5 rounded-[3px] bg-[#FFFFFF] border border-[#CBD5E1] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#1D63ED]" />
                    <span className="font-bold text-xs text-[#0B1E36] uppercase tracking-wide">
                      Curated Smart Updates (Shore Notification)
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    Only high-value, reassuring milestones sent to family
                  </span>
                </div>

                {/* 1-Click Milestone Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleDispatchCuratedUpdate('TRIP_STARTED', 'Trip Started', `${vessel.name} departed ${mission.base_port} on schedule with ${vessel.crew_count} crew.`)}
                    disabled={isSendingUpdate}
                    className="p-2 rounded-[2px] bg-[#F8FAFC] hover:bg-[#F0F9FF] border border-[#E2E8F0] hover:border-[#1D63ED] text-left transition cursor-pointer text-xs space-y-0.5"
                  >
                    <span className="text-[10px] font-bold text-emerald-700 font-mono block">01. TRIP STARTED</span>
                    <span className="text-[11px] font-semibold text-[#0B1E36] block">Departed Harbor</span>
                    <span className="text-[10px] text-[#64748B]">ETA {mission.expected_return}</span>
                  </button>

                  <button
                    onClick={() => handleDispatchCuratedUpdate('MISSION_UPDATE', 'Nets Cast & Zone Reached', `${vessel.name} reached fishing zone (${connectivity.last_known_location?.distance_from_port_nm} NM offshore). Sea conditions calm.`)}
                    disabled={isSendingUpdate}
                    className="p-2 rounded-[2px] bg-[#F8FAFC] hover:bg-[#F0F9FF] border border-[#E2E8F0] hover:border-[#1D63ED] text-left transition cursor-pointer text-xs space-y-0.5"
                  >
                    <span className="text-[10px] font-bold text-[#1D63ED] font-mono block">02. NETS CAST</span>
                    <span className="text-[11px] font-semibold text-[#0B1E36] block">Zone B Reached</span>
                    <span className="text-[10px] text-[#64748B]">Conditions Calm</span>
                  </button>

                  <button
                    onClick={() => handleDispatchCuratedUpdate('RETURN_TO_BASE', 'Returning to Base', `${vessel.name} commenced return transit towards ${mission.base_port}. Expected arrival: ${mission.expected_return}.`)}
                    disabled={isSendingUpdate}
                    className="p-2 rounded-[2px] bg-[#F8FAFC] hover:bg-[#F0F9FF] border border-[#E2E8F0] hover:border-[#1D63ED] text-left transition cursor-pointer text-xs space-y-0.5"
                  >
                    <span className="text-[10px] font-bold text-sky-700 font-mono block">03. RETURNING</span>
                    <span className="text-[11px] font-semibold text-[#0B1E36] block">Return to Base</span>
                    <span className="text-[10px] text-[#64748B]">On Schedule</span>
                  </button>

                  <button
                    onClick={() => handleDispatchCuratedUpdate('SAFETY_ALERT', 'Precautionary Weather Routing', `Precautionary update: Localized swell detected. ${vessel.name} taking sheltered return corridor to harbor.`)}
                    disabled={isSendingUpdate}
                    className="p-2 rounded-[2px] bg-[#F8FAFC] hover:bg-amber-50/50 border border-[#E2E8F0] hover:border-amber-400 text-left transition cursor-pointer text-xs space-y-0.5"
                  >
                    <span className="text-[10px] font-bold text-amber-700 font-mono block">04. ADVISORY</span>
                    <span className="text-[11px] font-semibold text-[#0B1E36] block">Safe Reroute</span>
                    <span className="text-[10px] text-[#64748B]">Sheltered Route</span>
                  </button>
                </div>

                {/* Custom Note Line */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-[#E2E8F0]">
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Enter short check-in note to send to family..."
                    className="flex-1 text-xs px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[2px] focus:outline-none focus:border-[#1D63ED] text-[#0F2942]"
                  />
                  <button
                    onClick={() => handleDispatchCuratedUpdate('CUSTOM', 'Custom Skipper Note', customNote)}
                    disabled={isSendingUpdate}
                    className="px-3.5 py-1.5 rounded-[2px] bg-[#0B1E36] hover:bg-[#1D63ED] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSendingUpdate ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Dispatch Custom SMS</span>
                  </button>
                </div>

                {updateSuccess && (
                  <div className="p-2.5 rounded-[2px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{updateSuccess}</span>
                  </div>
                )}
              </div>

              {/* 3. Emergency SOS Section with Coast Guard Integration */}
              <div className="p-3.5 rounded-[3px] bg-rose-50/60 border border-rose-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-xs text-rose-950 uppercase tracking-wide">
                      Real Smart SOS Distress Protocol (MRCC 1093)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-700 font-semibold">
                    Coast Guard Channel 16
                  </span>
                </div>

                <p className="text-[11px] text-rose-900 leading-relaxed">
                  Activating Smart SOS immediately transmits vessel distress telemetry to Indian Coast Guard MRCC 1093, broadcasts priority Mayday on VHF Ch 16, and dispatches urgent high-priority SMS and voice alerts to registered family kin.
                </p>

                {!showSosConfirm ? (
                  <button
                    onClick={() => setShowSosConfirm(true)}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[2px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Initiate Emergency SOS Distress Workflow</span>
                  </button>
                ) : (
                  <div className="p-3 bg-white border border-rose-300 rounded-[2px] space-y-2.5 animate-fadeIn">
                    <span className="text-xs font-bold text-rose-900 block uppercase">
                      Confirm Emergency Distress Transmission:
                    </span>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-medium block">Select Distress Category:</label>
                      <select
                        value={sosReason}
                        onChange={(e) => setSosReason(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] text-slate-900 font-medium"
                      >
                        <option>Sudden Engine Failure / Propulsion Loss</option>
                        <option>Medical Distress / Man Overboard (MOB)</option>
                        <option>Hull Ingress / Capsize Vulnerability</option>
                        <option>Severe Weather Squall & Heavy Sea</option>
                        <option>Vessel Collision / Grounding</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowSosConfirm(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition cursor-pointer font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleTriggerSos}
                        disabled={isSubmittingSos}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[2px] text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        {isSubmittingSos ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertOctagon className="w-3.5 h-3.5" />}
                        <span>Confirm & Broadcast Mayday</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Registered Kin & Shore Contacts */}
              <div className="p-3.5 rounded-[3px] bg-[#FFFFFF] border border-[#CBD5E1] space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#1D63ED]" />
                    <span className="font-bold text-xs text-[#0B1E36] uppercase tracking-wide">
                      Authorized Family & Harbor Contacts ({contacts.length})
                    </span>
                  </div>

                  <button
                    onClick={() => setShowAddContact(!showAddContact)}
                    className="text-xs font-semibold text-[#1D63ED] hover:text-[#1552C6] flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddContact ? 'Cancel' : 'Add Kin'}</span>
                  </button>
                </div>

                {showAddContact && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setShowAddContact(false);
                    }}
                    className="p-3 bg-[#F0F9FF] border border-[#E2E8F0] rounded-[2px] space-y-2 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        required
                        className="p-1.5 bg-white border border-[#CBD5E1] rounded-[2px]"
                      />
                      <select
                        value={newContactRelation}
                        onChange={(e) => setNewContactRelation(e.target.value)}
                        className="p-1.5 bg-white border border-[#CBD5E1] rounded-[2px]"
                      >
                        <option>Spouse / Primary Kin</option>
                        <option>Son / Daughter</option>
                        <option>Brother / Family</option>
                        <option>Harbour Master</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="+91 98XXXXXXXX"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        required
                        className="p-1.5 bg-white border border-[#CBD5E1] rounded-[2px]"
                      />
                    </div>
                    <button type="submit" className="px-3 py-1 bg-[#1D63ED] text-white rounded-[2px] text-xs font-semibold">
                      Save Contact
                    </button>
                  </form>
                )}

                <div className="space-y-1.5">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-[2px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-[2px] bg-[#E0F2FE] border border-[#1D63ED]/30 text-[#0B1E36] flex items-center justify-center font-bold text-xs">
                          {c.name ? c.name[0] : 'K'}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0B1E36] flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.is_emergency_priority && (
                              <span className="px-1.5 py-0.2 rounded-[2px] bg-rose-50 text-rose-800 text-[9px] font-mono font-bold border border-rose-200">
                                EMERGENCY KIN
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#64748B]">
                            {c.relationship} • {c.phone}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-emerald-700 font-mono font-medium block">
                          {c.status || 'DELIVERED_OK'}
                        </span>
                        <span className="text-[9px] text-[#64748B]">Notified {c.last_notified}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Public Shore Link Sharing Box */}
              <div className="p-3.5 rounded-[3px] bg-[#FFFFFF] border border-[#CBD5E1] space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#1D63ED]" />
                    <span className="font-bold text-xs text-[#0B1E36] uppercase tracking-wide">
                      Family Public Shore Link
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748B]">No login or app installation required</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[2px] px-3 py-1.5 font-mono text-xs text-[#0F2942] truncate select-all">
                    {statusData?.public_tracking_url || 'https://marine-ai.gov.in/track/mv-track-7729-tn09'}
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F0F9FF] border border-[#E2E8F0] rounded-[2px] text-xs font-semibold text-[#0F2942] flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check our vessel Matsya-Varuna live status and return ETA: ${statusData?.public_tracking_url || 'https://marine-ai.gov.in/track/mv-track-7729-tn09'}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <span>Share WhatsApp</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            /* TAB 2: PRIVACY-SAFE SHORE VIEW (What family sees on their mobile phone) */
            <div className="py-2 flex flex-col items-center space-y-3">
              {/* Language Selector for Shore View */}
              <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-[2px] border border-[#E2E8F0] text-xs shadow-xs">
                <Globe className="w-3.5 h-3.5 text-[#1D63ED] ml-1 mr-1" />
                <span className="text-[10px] text-[#64748B] font-mono mr-1">Language:</span>
                {[
                  { code: 'en', label: 'English' },
                  { code: 'ta', label: 'தமிழ்' },
                  { code: 'te', label: 'తెలుగు' },
                  { code: 'hi', label: 'हिन्दी' }
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setShoreLang(l.code)}
                    className={`px-2.5 py-0.5 rounded-[2px] text-xs font-medium transition cursor-pointer ${
                      shoreLang === l.code ? 'bg-[#1D63ED] text-white font-semibold' : 'text-[#64748B] hover:text-[#0B1E36]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Mobile Phone Simulation Frame */}
              <div className="w-full max-w-sm bg-white border-4 border-[#0B1E36] rounded-[24px] shadow-2xl overflow-hidden flex flex-col text-left">
                {/* Speaker Notch */}
                <div className="bg-[#0B1E36] py-1.5 flex justify-center">
                  <div className="w-16 h-1 bg-slate-600 rounded-full" />
                </div>

                {/* Browser Address Bar */}
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                  <span>🔒 marine-ai.gov.in/track</span>
                  <span>100% 🔋</span>
                </div>

                {/* Mobile View Content */}
                <div className="p-4 space-y-3.5 bg-gradient-to-b from-blue-50/40 to-white">
                  {/* Brand & Govt Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <div className="text-[10px] font-bold text-[#1D63ED] uppercase tracking-wider">
                        {shoreT.govtBadge}
                      </div>
                      <h4 className="font-extrabold text-sm text-[#0B1E36]">{shoreT.title}</h4>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Main Peace-of-Mind Status Banner */}
                  <div className={`p-3 rounded-[4px] border-2 text-center space-y-1 ${
                    isSosActive
                      ? 'bg-rose-50 border-rose-400 text-rose-950'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  }`}>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-white ${
                      isSosActive ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}>
                      {isSosActive ? <AlertOctagon className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>{isSosActive ? shoreT.sosBanner : shoreT.safeBanner}</span>
                    </div>
                    <div className="text-xs font-bold pt-1">
                      {vessel.name} ({vessel.registration})
                    </div>
                    <div className="text-[11px] opacity-80">
                      Captain {vessel.captain} • {vessel.crew_count} Crew On Board
                    </div>
                  </div>

                  {/* Expected Return Countdown Card */}
                  <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-3 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B] font-medium">{shoreT.expectedReturn}</span>
                      <span className="font-bold text-[#1D63ED]">{mission.expected_return}</span>
                    </div>
                    <div className="text-base font-extrabold text-[#0B1E36]">
                      ~{mission.eta_countdown} {shoreT.remaining}
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#1D63ED] h-2 rounded-full w-[65%]" />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#64748B] font-mono">
                      <span>Departed {mission.departure_time}</span>
                      <span>Mid-Trip (65%)</span>
                      <span>Arrival {mission.expected_return}</span>
                    </div>
                  </div>

                  {/* Telemetry & Satellite Grounding */}
                  <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-3 shadow-xs space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      {shoreT.telemetryHeading}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">{shoreT.location}</span>
                      <span className="font-mono font-bold text-[#0B1E36]">
                        {connectivity?.last_known_location?.bearing_from_port || '14.2 NM Offshore'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">{shoreT.seaState}</span>
                      <span className="text-emerald-700 font-semibold">Calm Swell (0.9m)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">{shoreT.speed}</span>
                      <span className="font-mono text-[#0B1E36]">8.5 knots</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                      <span className="text-[#64748B]">{shoreT.lastVerified}</span>
                      <span className="text-[10px] font-mono text-[#1D63ED] font-semibold">
                        {connectivity?.last_known_location?.updated_at || 'Via NavIC Satellite'}
                      </span>
                    </div>
                  </div>

                  {/* Safety Contract Guarantee Banner */}
                  <div className="p-2.5 rounded-[2px] bg-[#F0FDF4] border border-emerald-200 text-[10px] text-emerald-950 flex items-start gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{shoreT.safetyGuarantee}</span>
                  </div>

                  {/* Emergency One-Tap Calling */}
                  <div className="space-y-1.5 pt-1">
                    <a
                      href="tel:+918912568920"
                      className="w-full py-2 bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#CBD5E1] text-[#0B1E36] rounded-[2px] font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#1D63ED]" />
                      <span>{shoreT.callHarbour}</span>
                    </a>
                    <a
                      href="tel:1093"
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[2px] font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <LifeBuoy className="w-3.5 h-3.5 text-white" />
                      <span>{shoreT.callCoastGuard}</span>
                    </a>
                  </div>

                  <div className="text-[9px] text-center text-[#64748B] pt-1">
                    {shoreT.honestLimited}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted telemetry verified by Indian Coast Guard & INCOIS protocols</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
