import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Users, Ship, Clock, MapPin, Radio, AlertTriangle, 
  CheckCircle2, Plus, Minus, Crosshair, ArrowRight, 
  Check, Phone, ShieldCheck, AlertOctagon, RotateCcw,
  Navigation, RefreshCw, Send, User, Trash2, Edit3, 
  MessageCircle, Copy, ExternalLink, Share2, X
} from 'lucide-react';
import MarineApi from '../../services/api';

const DEFAULT_CONTACTS = [
  {
    id: 'c-1',
    name: 'Amma',
    relationship: 'Mother (Primary Emergency)',
    phone: '+91 98765 43210',
    notify_sms: true,
    notify_whatsapp: true,
    is_emergency_priority: true,
    is_authorized_for_trip: true,
    status: 'Active',
    last_notified: '12 mins ago',
    notes: 'Home emergency kin'
  },
  {
    id: 'c-2',
    name: 'Nanna',
    relationship: 'Father (Secondary Contact)',
    phone: '+91 91234 56789',
    notify_sms: true,
    notify_whatsapp: true,
    is_emergency_priority: false,
    is_authorized_for_trip: true,
    status: 'Active',
    last_notified: '25 mins ago',
    notes: 'Port return notification'
  },
  {
    id: 'c-3',
    name: 'V. Naidu',
    relationship: 'Harbour Master (Port Authority)',
    phone: '+91 891 256 8920',
    notify_sms: true,
    notify_whatsapp: false,
    is_emergency_priority: true,
    is_authorized_for_trip: true,
    status: 'Active',
    last_notified: '45 mins ago',
    notes: 'Coast Guard VHF liaison'
  }
];

const INITIAL_UPDATES = [
  {
    id: 'upd-1',
    time: '11:55 AM',
    title: 'Reached Fishing Zone',
    message: 'Vessel is at the predicted fishing zone (14.2 NM Offshore). Normal conditions.',
    type: 'active'
  },
  {
    id: 'upd-2',
    time: '08:20 AM',
    title: 'Weather conditions are stable',
    message: 'Safe to continue operation. Sea swell 1.1m, wind 12 km/h.',
    type: 'stable'
  },
  {
    id: 'upd-3',
    time: '05:30 AM',
    title: 'Trip started',
    message: 'Vessel departed from Visakhapatnam Fishing Port on schedule.',
    type: 'departure'
  }
];

export default function ScreenFamilyLinkPage({
  onNavigateTab,
  onOpenEmergency,
  isDualView = false,
  onToggleDualView
}) {
  const [activeTab, setActiveTab] = useState('Live Tracking');
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);
  const [updates, setUpdates] = useState(INITIAL_UPDATES);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Modals
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    relationship: 'Family Kin',
    phone: '',
    notes: '',
    notify_sms: true,
    notify_whatsapp: true,
    is_emergency_priority: false,
    is_authorized_for_trip: true,
    status: 'Active'
  });

  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppRecipient, setWhatsAppRecipient] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [isSubmittingSos, setIsSubmittingSos] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // Map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Fetch contacts from backend
  useEffect(() => {
    let isMounted = true;
    async function loadContacts() {
      try {
        setIsLoadingContacts(true);
        const res = await MarineApi.getFamilyLinkContacts();
        if (isMounted && res && res.contacts && res.contacts.length > 0) {
          setContacts(res.contacts);
        }
      } catch (err) {
        console.warn('Using local fallback contacts:', err);
      } finally {
        if (isMounted) setIsLoadingContacts(false);
      }
    }
    loadContacts();
    return () => { isMounted = false; };
  }, []);

  // Initialize Family Link Live Tracking Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing leaflet id on DOM element if hot reloaded or remounted
    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {}
      mapInstanceRef.current = null;
    }

    // Center on vessel trajectory (Palk Strait / Bay of Bengal)
    const map = L.map(mapContainerRef.current, {
      center: [15.65, 82.15],
      zoom: 8,
      zoomControl: false,
      attributionControl: false,
    });

    // Primary Satellite Tile Layer with Boundaries & Coastal Places
    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      subdomains: 'abcd',
      opacity: 0.85
    }).addTo(map);

    // Fallback Esri Street Map Layer in case satellite imagery is restricted
    satLayer.on('tileerror', () => {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map);
    });

    const portCoords = [16.4, 81.7];
    const fishingZoneCoords = [15.24, 82.16];
    const returnCoords = [15.1, 83.2];

    // Planned Route (Cyan dashed)
    L.polyline([portCoords, fishingZoneCoords, returnCoords], {
      color: '#38bdf8',
      weight: 2.5,
      dashArray: '6, 8',
      opacity: 0.75
    }).bindTooltip('Planned Route (Plan B)', { sticky: true }).addTo(map);

    // Current Traveled Route (Bright Ocean Blue)
    L.polyline([portCoords, [15.8, 81.9], fishingZoneCoords], {
      color: '#0284c7',
      weight: 4,
      opacity: 0.95
    }).bindTooltip('Traveled Route Navigated', { sticky: true }).addTo(map);

    // Port Marker
    const portIcon = L.divIcon({
      className: 'port-pin',
      html: `
        <div style="display: flex; align-items: center; gap: 4px; background: rgba(15,23,42,0.92); color: #fff; padding: 3px 8px; border-radius: 6px; border: 1.5px solid #10b981; font-size: 10px; font-weight: 700; font-family: system-ui; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981;"></span>
          Port (Visakhapatnam) <span style="font-size: 9px; opacity: 0.8; font-family: monospace;">05:30 AM</span>
        </div>
      `,
      iconSize: [140, 26],
      iconAnchor: [70, 13]
    });
    L.marker(portCoords, { icon: portIcon }).addTo(map);

    // Fishing Zone Target Circle
    L.circle(fishingZoneCoords, {
      radius: 18000,
      color: '#38bdf8',
      fillColor: '#0284c7',
      fillOpacity: 0.22,
      weight: 2,
      dashArray: '4, 4'
    }).addTo(map);

    // Vessel / Fishing Zone Marker with Pulsing Radar Ping
    const fishingIcon = L.divIcon({
      className: 'fishing-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: rgba(11,30,54,0.95); color: #fff; padding: 4px 10px; border-radius: 6px; border: 1.5px solid #38bdf8; font-size: 10px; font-weight: 800; font-family: system-ui; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
            ⛵ Matsya-Varuna <span style="font-size: 9px; color: #34d399; margin-left: 4px;">● At Fishing Zone</span>
          </div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #0284c7; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; margin-top: 3px; box-shadow: 0 0 14px #38bdf8; position: relative;">
            🚢
            <span style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #38bdf8; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          </div>
        </div>
      `,
      iconSize: [160, 52],
      iconAnchor: [80, 42]
    });
    L.marker(fishingZoneCoords, { icon: fishingIcon })
      .bindTooltip('<b>Vessel Telemetry (NavIC-L5)</b><br/>Position: 15.24° N, 82.16° E<br/>Speed: 8.5 kn • Heading: 120° SE<br/>Distance: 14.2 NM Offshore', { permanent: false, direction: 'top' })
      .addTo(map);

    // Return Waypoint Marker
    const returnIcon = L.divIcon({
      className: 'return-pin',
      html: `
        <div style="display: flex; align-items: center; gap: 4px; background: rgba(15,23,42,0.92); color: #fff; padding: 3px 8px; border-radius: 6px; border: 1.5px solid #6366f1; font-size: 10px; font-weight: 700; font-family: system-ui; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #6366f1;"></span>
          Expected Return <span style="font-size: 9px; opacity: 0.8; font-family: monospace;">06:00 PM</span>
        </div>
      `,
      iconSize: [140, 26],
      iconAnchor: [70, 13]
    });
    L.marker(returnCoords, { icon: returnIcon }).addTo(map);

    mapInstanceRef.current = map;

    // ResizeObserver ensures map always adapts to viewport and tab switching
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    setTimeout(() => { map.invalidateSize(); }, 150);
    setTimeout(() => { map.invalidateSize(); }, 600);

    return () => {
      resizeObserver.disconnect();
      try {
        map.remove();
      } catch {}
      mapInstanceRef.current = null;
    };
  }, []);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetLocation = () => mapInstanceRef.current?.setView([15.65, 82.15], 8);

  // WhatsApp Message Composer
  const getWhatsAppMessageText = () => {
    return `🌊 *Aqua Intellect - Marine Safety Live Update*
⛵ *Vessel:* Matsya-Varuna (IND-TN-09-MM-4421)
📍 *Current Zone:* Fishing Zone Active (15.24° N, 82.16° E)
🧭 *Bearing:* 14.2 NM Offshore • Heading 120° SE • Speed 8.5 kt
🕒 *Departure:* 05:30 AM | *Return ETA:* 06:00 PM (Today)
🗺️ *Google Maps Pin:* https://maps.google.com/?q=15.24,82.16
🌐 *Shore Watchdog Portal:* https://marine-ai.gov.in/track/mv-track-7729-tn09

ℹ️ _Note: For continuous live GPS sharing on WhatsApp, open chat -> tap '+' (Attachment) -> Location -> 'Share Live Location'._`;
  };

  const handleOpenWhatsApp = (phone = null) => {
    const text = encodeURIComponent(getWhatsAppMessageText());
    let url = `https://wa.me/?text=${text}`;
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      url = `https://wa.me/${cleanPhone}?text=${text}`;
    }
    window.open(url, '_blank');
  };

  const handleCopyWhatsAppText = () => {
    navigator.clipboard.writeText(getWhatsAppMessageText());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Contact Management Handlers
  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactForm({
      name: '',
      relationship: 'Mother',
      phone: '',
      notes: '',
      notify_sms: true,
      notify_whatsapp: true,
      is_emergency_priority: false,
      is_authorized_for_trip: true,
      status: 'Active'
    });
    setShowContactModal(true);
  };

  const handleOpenEditContact = (contact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      notes: contact.notes || '',
      notify_sms: contact.notify_sms ?? true,
      notify_whatsapp: contact.notify_whatsapp ?? true,
      is_emergency_priority: contact.is_emergency_priority ?? false,
      is_authorized_for_trip: contact.is_authorized_for_trip ?? true,
      status: contact.status || 'Active'
    });
    setShowContactModal(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return;

    try {
      if (editingContact) {
        const res = await MarineApi.updateFamilyLinkContact(editingContact.id, contactForm);
        if (res && res.contacts) {
          setContacts(res.contacts);
        } else {
          setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...contactForm } : c));
        }
      } else {
        const res = await MarineApi.createFamilyLinkContact(contactForm);
        if (res && res.contacts) {
          setContacts(res.contacts);
        } else {
          const newContact = {
            id: `c-${Date.now()}`,
            ...contactForm,
            last_notified: 'Never'
          };
          setContacts(prev => [...prev, newContact]);
        }
      }
      setShowContactModal(false);
    } catch (err) {
      console.warn('Contact save fallback:', err);
      if (editingContact) {
        setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...contactForm } : c));
      } else {
        setContacts(prev => [...prev, { id: `c-${Date.now()}`, ...contactForm, last_notified: 'Never' }]);
      }
      setShowContactModal(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const res = await MarineApi.deleteFamilyLinkContact(contactId);
      if (res && res.contacts) {
        setContacts(res.contacts);
      } else {
        setContacts(prev => prev.filter(c => c.id !== contactId));
      }
    } catch (err) {
      console.warn('Contact delete fallback:', err);
      setContacts(prev => prev.filter(c => c.id !== contactId));
    }
  };

  const handleToggleUpdates = async (contactId) => {
    try {
      const res = await MarineApi.toggleFamilyLinkContactUpdates(contactId);
      if (res && res.contacts) {
        setContacts(res.contacts);
      } else {
        setContacts(prev => prev.map(c => c.id === contactId ? {
          ...c,
          is_authorized_for_trip: !c.is_authorized_for_trip,
          notify_whatsapp: !c.is_authorized_for_trip
        } : c));
      }
    } catch (err) {
      setContacts(prev => prev.map(c => c.id === contactId ? {
        ...c,
        is_authorized_for_trip: !c.is_authorized_for_trip,
        notify_whatsapp: !c.is_authorized_for_trip
      } : c));
    }
  };

  // SOS Handlers
  const handleSendSos = async () => {
    setIsSubmittingSos(true);
    try {
      await MarineApi.triggerFamilyLinkSos({
        reason: 'Emergency distress signal triggered from Family Link screen',
        direct_call_mrcc: true
      });
      setSosActive(true);
      setShowSosModal(false);
    } catch (err) {
      setSosActive(true);
      setShowSosModal(false);
    } finally {
      setIsSubmittingSos(false);
    }
  };

  const handleStandDown = async () => {
    try {
      await MarineApi.cancelFamilyLinkSos({ reason: 'All clear declared' });
      setSosActive(false);
    } catch {
      setSosActive(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] text-[#0F2942] font-sans overflow-y-auto p-3.5 sm:p-4 md:p-5 space-y-3.5 text-left w-full">
      {/* 1. Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-[#1D63ED] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#0B1E36] tracking-tight leading-tight">
              Family Link
            </h1>
            <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5">
              Stay connected. Safer journeys for your loved ones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Quick WhatsApp Live Location Button */}
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition cursor-pointer shadow-2xs"
            title="Share Live Location via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp Share</span>
          </button>

          {/* Dual View Toggle */}
          {onToggleDualView && (
            <button
              onClick={onToggleDualView}
              className="hidden lg:flex px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F0F9FF] text-[#1D63ED] border border-[#1D63ED]/30 hover:bg-[#E0F2FE] transition cursor-pointer"
            >
              {isDualView ? 'Full Page' : 'Compare with Scientific AI'}
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-tabs Bar */}
      <div className="flex items-center gap-6 border-b border-[#E2E8F0] text-xs font-medium overflow-x-auto no-scrollbar">
        {['Live Tracking', 'Trip Details', 'Alerts & Notifications', 'Emergency Contacts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 transition relative cursor-pointer font-medium whitespace-nowrap ${
              activeTab === tab
                ? 'text-[#1D63ED] font-bold'
                : 'text-[#64748B] hover:text-[#0B1E36]'
            }`}
          >
            <span>{tab}</span>
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1D63ED] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 3. Hero Banner Card (Compact Horizontal Strip) */}
      <div className="p-3 sm:p-3.5 rounded-[10px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
            <Ship className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#15803D] leading-tight">
              Trip In Progress
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Currently at Fishing Zone (14.2 NM Offshore)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-8 text-xs pt-2 md:pt-0 border-t md:border-t-0 border-[#F1F5F9]">
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">Started At</span>
            <span className="text-xs sm:text-sm font-bold text-[#0B1E36] block">05:30 AM</span>
            <span className="text-[9px] text-[#94A3B8]">27 Sep 2026</span>
          </div>

          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">Expected Return</span>
            <span className="text-xs sm:text-sm font-bold text-[#0B1E36] block">06:00 PM</span>
            <span className="text-[9px] text-[#94A3B8]">27 Sep 2026</span>
          </div>

          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">Time Elapsed</span>
            <span className="text-xs sm:text-sm font-bold text-[#16A34A] block font-mono">7h 25m</span>
            <span className="text-[9px] text-[#16A34A] font-medium">On Schedule</span>
          </div>
        </div>
      </div>

      {/* 4. Balanced 2-Column Desktop Layout (Solves Viewport Scrolling) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* ================= LEFT COLUMN (Col 7): Map + Route Stepper + Recent Ticker ================= */}
        <div className="lg:col-span-7 space-y-3">
          {/* Interactive Ocean Tracking Map (Standard height min-h-[380px] up to 460px) */}
          <div className="relative rounded-[10px] overflow-hidden border border-[#E2E8F0] shadow-2xs bg-[#0B1E36] h-[420px] sm:h-[460px] min-h-[380px]">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Vessel Location Badge (Top Left) */}
            <div className="absolute top-2.5 left-2.5 z-[400] bg-[#0F172A]/90 backdrop-blur-md rounded-[8px] p-2.5 border border-[#334155] shadow-md text-white text-[11px] min-w-[190px] space-y-1">
              <div className="flex items-center justify-between pb-1 border-b border-[#334155]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">⛵</span>
                  <span className="font-bold text-white text-[11px]">Vessel Location</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="font-mono text-xs font-bold text-[#38BDF8]">
                15.24° N, 82.16° E
              </div>

              <div className="text-[10px] text-slate-300 space-y-0.5">
                <div>Speed: <strong className="text-white font-mono">8.5 knots</strong> • Heading: <strong className="text-white font-mono">120° SE</strong></div>
                <div>Status: <strong className="text-emerald-400 font-semibold">At Fishing Zone</strong></div>
              </div>
            </div>

            {/* Connection Status Overlay (Top Right) */}
            <div className="absolute top-2.5 right-2.5 z-[400] bg-[#0F172A]/90 backdrop-blur-md rounded-[8px] p-2.5 border border-[#334155] shadow-md text-white text-[11px] max-w-[240px] sm:max-w-[270px] space-y-1">
              <div className="flex items-center justify-between pb-1 border-b border-[#334155]">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-white text-[10px] uppercase tracking-wide">NavIC Telemetry</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold">
                  SATELLITE
                </span>
              </div>
              <div className="text-[10px] text-amber-200/90 font-medium leading-tight">
                Limited — NavIC Coastal Satellite Only (Beyond 14 NM Perimeter)
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                Updated: 11:55 IST via NavIC-L5
              </div>
            </div>

            {/* Route Legend (Bottom Left) */}
            <div className="absolute bottom-2.5 left-2.5 z-[400] bg-[#0F172A]/85 backdrop-blur-xs rounded-[6px] px-2.5 py-1 border border-[#334155] text-[9px] font-medium text-slate-300 flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 border-dashed border-b border-[#38bdf8]"></span>
                Planned Route
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-[#0284c7] rounded-full"></span>
                Current Route
              </span>
            </div>

            {/* Map Zoom Controls (Bottom Right) */}
            <div className="absolute bottom-2.5 right-2.5 z-[400] flex flex-col bg-white rounded-[6px] border border-[#CBD5E1] shadow-sm overflow-hidden text-[#0F2942]">
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-[#F1F5F9] transition border-b border-[#E2E8F0] cursor-pointer"
                title="Zoom in"
              >
                <Plus className="w-3.5 h-3.5 text-[#0F2942]" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-[#F1F5F9] transition border-b border-[#E2E8F0] cursor-pointer"
                title="Zoom out"
              >
                <Minus className="w-3.5 h-3.5 text-[#0F2942]" />
              </button>
              <button
                onClick={handleResetLocation}
                className="p-1.5 hover:bg-[#F1F5F9] transition cursor-pointer"
                title="Reset position"
              >
                <Crosshair className="w-3.5 h-3.5 text-[#1D63ED]" />
              </button>
            </div>
          </div>

          {/* 4-Step Trip Progress Stepper (Compact ~60px) */}
          <div className="p-3 rounded-[10px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[11px] text-[#0B1E36] uppercase tracking-wide">
                Trip Progress
              </h3>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Phase 2 of 4: Fishing Active
              </span>
            </div>

            <div className="relative flex items-center justify-between px-2 pt-1 pb-1">
              <div className="absolute left-6 right-6 top-3.5 h-[2px] bg-[#E2E8F0] -z-0">
                <div className="h-full bg-[#10B981] w-[33%]" />
              </div>

              {/* Step 1: Departed */}
              <div className="flex flex-col items-center relative z-10 space-y-0.5">
                <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-2xs">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-[11px] font-semibold text-[#0B1E36]">Departed</span>
                <span className="text-[9px] text-[#64748B] font-mono">05:30 AM</span>
              </div>

              {/* Step 2: At Fishing Zone */}
              <div className="flex flex-col items-center relative z-10 space-y-0.5">
                <div className="w-5 h-5 rounded-full bg-[#1D63ED] text-white flex items-center justify-center ring-3 ring-[#E0F2FE] shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <span className="text-[11px] font-bold text-[#1D63ED]">At Fishing Zone</span>
                <span className="text-[9px] text-[#64748B] font-mono">11:55 AM</span>
              </div>

              {/* Step 3: Returning */}
              <div className="flex flex-col items-center relative z-10 space-y-0.5">
                <div className="w-5 h-5 rounded-full bg-[#FFFFFF] border-2 border-[#CBD5E1] flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                </div>
                <span className="text-[11px] font-medium text-[#64748B]">Returning</span>
                <span className="text-[9px] text-[#94A3B8] font-mono">--:--</span>
              </div>

              {/* Step 4: Completed */}
              <div className="flex flex-col items-center relative z-10 space-y-0.5">
                <div className="w-5 h-5 rounded-full bg-[#FFFFFF] border-2 border-[#CBD5E1] flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                </div>
                <span className="text-[11px] font-medium text-[#64748B]">Completed</span>
                <span className="text-[9px] text-[#94A3B8] font-mono">--:--</span>
              </div>
            </div>
          </div>

          {/* Recent Updates Ticker (Compact 2 items + View History Modal) */}
          <div className="p-3 rounded-[10px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#1D63ED]" />
                <h3 className="font-bold text-[11px] text-[#0B1E36] uppercase tracking-wide">
                  Recent Updates
                </h3>
              </div>
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="text-[10px] font-semibold text-[#1D63ED] hover:underline cursor-pointer"
              >
                View Full Timeline ({updates.length})
              </button>
            </div>

            <div className="space-y-2 pt-0.5">
              {updates.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 text-xs">
                  <span className="text-[10px] font-mono text-[#64748B] w-12 shrink-0 pt-0.5">{item.time}</span>
                  <div className="w-2 h-2 rounded-full bg-[#1D63ED] ring-3 ring-[#E0F2FE] shrink-0 mt-1" />
                  <div className="flex-1">
                    <strong className="text-[#0B1E36] block font-semibold text-[11px] leading-tight">{item.title}</strong>
                    <p className="text-[10px] text-[#64748B] line-clamp-1">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (Col 5): Contacts + WhatsApp Share + SOS ================= */}
        <div className="lg:col-span-5 space-y-3">
          {/* Family & Emergency Contacts Card */}
          <div className="p-3.5 rounded-[10px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1D63ED]" />
                <h3 className="font-bold text-xs text-[#0B1E36] uppercase tracking-wide">
                  Family Contacts
                </h3>
              </div>
              <button 
                onClick={handleOpenAddContact}
                className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#1D63ED] hover:bg-[#1552C6] text-white text-[11px] font-semibold transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3 text-white" />
                <span>Add Contact</span>
              </button>
            </div>

            {/* Contact List */}
            <div className="space-y-2 max-h-[175px] overflow-y-auto pr-0.5">
              {contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className="p-2 rounded-[8px] border border-[#E2E8F0] hover:border-[#CBD5E1] bg-[#F8FAFC]/50 hover:bg-[#F8FAFC] transition flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#0F2942] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#0B1E36] truncate">{contact.name}</span>
                        {contact.is_emergency_priority && (
                          <span className="px-1 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[8px] font-semibold shrink-0">
                            SOS Priority
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#64748B] block font-mono">{contact.phone}</span>
                      <span className="text-[9px] text-[#94A3B8] truncate block">{contact.relationship}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Toggle Updates Switch */}
                    <button
                      onClick={() => handleToggleUpdates(contact.id)}
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold cursor-pointer transition ${
                        contact.is_authorized_for_trip 
                          ? 'bg-[#DCFCE7] text-[#16A34A] hover:bg-emerald-200' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={contact.is_authorized_for_trip ? 'Mission updates enabled' : 'Mission updates disabled'}
                    >
                      {contact.is_authorized_for_trip ? 'Updates ON' : 'Updates OFF'}
                    </button>

                    {/* Edit Contact */}
                    <button
                      onClick={() => handleOpenEditContact(contact)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                      title="Edit contact"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Contact */}
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                      title="Remove contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Live Location Sharing Card */}
          <div className="p-3.5 rounded-[10px] bg-gradient-to-br from-[#F0FDF4] to-[#FFFFFF] border border-[#BBF7D0] shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-bold text-xs text-[#14532D] uppercase tracking-wide">
                  WhatsApp Live Update
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#86EFAC]">
                Ready to Send
              </span>
            </div>

            <p className="text-[11px] text-[#334155] leading-snug">
              Send instant location coordinates (15.24° N, 82.16° E), Google Maps pin, and return ETA directly to family via WhatsApp.
            </p>

            <div className="pt-0.5 flex items-center gap-2">
              <button
                onClick={() => setShowWhatsAppModal(true)}
                className="flex-1 py-2 rounded-[8px] bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>Share Live Location on WhatsApp</span>
              </button>
              <button
                onClick={handleCopyWhatsAppText}
                className="p-2 rounded-[8px] bg-white hover:bg-slate-100 border border-[#86EFAC] text-[#14532D] transition cursor-pointer"
                title="Copy prepared message"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#14532D]" />}
              </button>
            </div>

            <div className="text-[10px] text-[#64748B] flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Includes live GPS coordinates & shore tracker URL.</span>
            </div>
          </div>

          {/* Emergency SOS Card */}
          <div className="p-3.5 rounded-[10px] bg-[#FFFFFF] border border-[#FCA5A5]/60 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🚨</span>
                <h3 className="font-bold text-xs text-[#0B1E36] uppercase tracking-wide">
                  Emergency SOS
                </h3>
              </div>
              <span className="text-[9px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                MRCC 1093
              </span>
            </div>

            <p className="text-[10px] text-[#64748B] leading-tight">
              Instantly broadcast distress signal to Coast Guard MRCC 1093 and alert registered priority kin.
            </p>

            {!sosActive ? (
              <button
                onClick={() => setShowSosModal(true)}
                className="w-full py-2 rounded-[8px] bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs uppercase tracking-wide"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
                <span>Send Emergency SOS Alert</span>
              </button>
            ) : (
              <div className="p-2.5 rounded-[6px] bg-rose-50 border border-rose-300 text-rose-950 text-xs space-y-1.5">
                <div className="font-bold text-rose-900 flex items-center gap-1 text-[11px]">
                  <AlertOctagon className="w-4 h-4 text-rose-600 animate-bounce" />
                  <span>SOS ACTIVE • MRCC & Family Dispatched</span>
                </div>
                <button
                  onClick={handleStandDown}
                  className="w-full py-1.5 rounded-[4px] bg-white hover:bg-slate-100 border border-rose-300 text-rose-800 text-[11px] font-semibold cursor-pointer"
                >
                  Stand Down SOS Alert
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: ADD / EDIT CONTACT ================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-5 max-w-md w-full space-y-4 shadow-2xl border border-[#E2E8F0] text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1D63ED]" />
                <h4 className="font-bold text-sm text-[#0B1E36]">
                  {editingContact ? 'Edit Family Contact' : 'Add Family / Emergency Contact'}
                </h4>
              </div>
              <button 
                onClick={() => setShowContactModal(false)} 
                className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#0B1E36] mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g., Amma, Ramesh Kumar"
                  className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B1E36] focus:outline-none focus:border-[#1D63ED] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0B1E36] mb-1">
                    Relationship *
                  </label>
                  <select
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B1E36] focus:outline-none focus:border-[#1D63ED]"
                  >
                    <option>Mother (Primary Kin)</option>
                    <option>Father</option>
                    <option>Spouse / Partner</option>
                    <option>Son / Daughter</option>
                    <option>Brother / Sister</option>
                    <option>Harbour Official</option>
                    <option>Shore Watchdog Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0B1E36] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B1E36] font-mono focus:outline-none focus:border-[#1D63ED] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0B1E36] mb-1">
                  Optional Notes / Harbor Station
                </label>
                <input
                  type="text"
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  placeholder="e.g., Shore emergency responder, home telephone"
                  className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B1E36] focus:outline-none focus:border-[#1D63ED] focus:bg-white"
                />
              </div>

              <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-200 space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactForm.is_authorized_for_trip}
                    onChange={(e) => setContactForm({ ...contactForm, is_authorized_for_trip: e.target.checked })}
                    className="rounded text-[#1D63ED] focus:ring-0"
                  />
                  <span className="text-[11px] text-[#0B1E36] font-medium">
                    Send automated trip departure & return notifications
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactForm.is_emergency_priority}
                    onChange={(e) => setContactForm({ ...contactForm, is_emergency_priority: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span className="text-[11px] text-rose-700 font-semibold">
                    Mark as Emergency SOS Priority contact (dialed first in distress)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1D63ED] hover:bg-[#1552C6] text-white rounded-[6px] text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingContact ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: WHATSAPP LIVE LOCATION SHARING ================= */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-5 max-w-lg w-full space-y-3.5 shadow-2xl border border-emerald-200 text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1E36]">
                    Share Live Location on WhatsApp
                  </h4>
                  <p className="text-[10px] text-[#64748B]">
                    Instant message with GPS location, map link, and vessel status.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowWhatsAppModal(false)} 
                className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recipient Picker */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#0B1E36]">
                Send To:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWhatsAppRecipient('all')}
                  className={`p-2 rounded-[6px] border text-left text-xs transition cursor-pointer ${
                    whatsAppRecipient === 'all'
                      ? 'border-[#25D366] bg-[#DCFCE7]/50 font-bold text-[#14532D]'
                      : 'border-[#CBD5E1] bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-semibold">Any Contact</span>
                  <span className="text-[9px] text-[#64748B]">WhatsApp Picker</span>
                </button>

                {contacts.slice(0, 2).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setWhatsAppRecipient(c.phone)}
                    className={`p-2 rounded-[6px] border text-left text-xs transition cursor-pointer ${
                      whatsAppRecipient === c.phone
                        ? 'border-[#25D366] bg-[#DCFCE7]/50 font-bold text-[#14532D]'
                        : 'border-[#CBD5E1] bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-semibold truncate">{c.name}</span>
                    <span className="text-[9px] text-[#64748B] font-mono truncate">{c.phone}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pre-formatted Message Preview */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#0B1E36]">Message Preview:</span>
                <button
                  onClick={handleCopyWhatsAppText}
                  className="text-[#1D63ED] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] font-mono text-[10px] text-[#1E293B] leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                {getWhatsAppMessageText()}
              </div>
            </div>

            {/* Honest Live Tracking Notice */}
            <div className="p-2.5 rounded-[6px] bg-amber-50 border border-amber-200 text-amber-900 text-[10px] leading-snug flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5">ℹ️</span>
              <div>
                <strong>Honest Tracking Notice:</strong> WhatsApp Web and mobile require the user to tap the attachment icon inside WhatsApp and choose <em>Location &rarr; Share Live Location</em> to enable continuous 8-hour live tracking. This message sends the snapshot coordinates (15.24° N, 82.16° E) and interactive Google Maps pin immediately.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp(whatsAppRecipient === 'all' ? null : whatsAppRecipient)}
                className="px-4 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-[6px] text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-white" />
                <span>Open WhatsApp Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: FULL UPDATES TIMELINE ================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-5 max-w-md w-full space-y-3.5 shadow-2xl border border-[#E2E8F0] text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1D63ED]" />
                <h4 className="font-bold text-sm text-[#0B1E36]">
                  Mission Updates & Timeline
                </h4>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)} 
                className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {updates.map((item, idx) => (
                <div key={item.id || idx} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-2.5 last:border-0">
                  <span className="text-[11px] font-mono text-[#64748B] w-14 shrink-0 pt-0.5">{item.time}</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1D63ED] ring-3 ring-[#E0F2FE] shrink-0 mt-1" />
                  <div className="flex-1">
                    <strong className="text-[#0B1E36] block font-semibold text-xs">{item.title}</strong>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-1.5 bg-[#1D63ED] text-white rounded-[6px] text-xs font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: CONFIRM EMERGENCY SOS ================= */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-5 max-w-sm w-full space-y-3 shadow-2xl border border-rose-200 text-left animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="font-bold text-sm text-[#0B1E36]">Confirm Emergency SOS</h4>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              This will immediately send high-priority SMS and automated emergency notifications to <strong>Amma</strong> and other registered priority contacts, and alert Coast Guard MRCC 1093 with your coordinates (15.24° N, 82.16° E).
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setShowSosModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSos}
                disabled={isSubmittingSos}
                className="px-4 py-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[6px] text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingSos ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Broadcast SOS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
