import React, { useState, useEffect } from 'react';
import OrcaLandingPage from './components/OrcaLandingPage';
import Screen1ExecutiveBrain from './components/screens/Screen1ExecutiveBrain';
import Screen2DigitalTwin from './components/screens/Screen2DigitalTwin';
import Screen3LiveMission from './components/screens/Screen3LiveMission';
import Screen4MissionReplay from './components/screens/Screen4MissionReplay';
import Screen5AiScientist from './components/screens/Screen5AiScientist';
import ScreenScientificAndFamily from './components/screens/ScreenScientificAndFamily';
import ScreenAuthorityCommandCenter from './components/screens/ScreenAuthorityCommandCenter';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import EmergencyModal from './components/EmergencyModal';
import OfflinePackModal from './components/OfflinePackModal';
import FamilyLinkModal from './components/FamilyLinkModal';
import MarineAiChatPanel from './components/MarineAiChatPanel';
import SettingsModal, { DEFAULT_SETTINGS } from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { SUPPORTED_INDIAN_LANGUAGES, NAV_TRANSLATIONS, getAppTranslation } from './services/multilingualMarine';
import { 
  Waves, Compass, Navigation, Activity, Cpu, 
  Download, AlertOctagon, Sparkles, Radio, Settings, Users, Columns,
  User, LogOut, ChevronDown, Lock, ShieldAlert, Shield
} from 'lucide-react';

export default function App() {
  // Authentication state
  const { 
    user, 
    isAuthenticated, 
    isLoading: isAuthLoading, 
    openLogin, 
    openRegister, 
    openProfile, 
    openAuthorityAuth,
    logout 
  } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Persistent activeScreen state ('landing' | 'screen-authority' | 'screen-1' to '5' | 'screen-family' | 'screen-dual')
  const [activeScreen, setActiveScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = (window.location.hash || '').toLowerCase();
      if (hash.includes('authority/command-center') || hash === '#authority') {
        return 'screen-authority';
      }
      const saved = localStorage.getItem('marine_ai_active_screen');
      if (saved && saved !== 'authority-auth') return saved;
    }
    return 'landing';
  });
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isOfflineOpen, setIsOfflineOpen] = useState(false);
  const [isFamilyLinkOpen, setIsFamilyLinkOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState('');
  const [chatInitialVoice, setChatInitialVoice] = useState(false);

  // Global Multilingual State (synced across landing, chat, screens, voice, settings)
  const [globalLanguage, setGlobalLanguage] = useState(() => {
    return localStorage.getItem('marine_ai_language') || 'en';
  });

  // Persistent System Settings
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('marine_ai_settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Sync user profile with settings
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        basePortName: user.base_port || prev.basePortName,
        vesselName: user.vessel_name || prev.vesselName,
        vesselRegistration: user.vessel_reg || prev.vesselRegistration,
        vesselType: user.vessel_type || prev.vesselType,
      }));
    }
  }, [user]);

  const handleLanguageChange = (langCode) => {
    setGlobalLanguage(langCode);
    localStorage.setItem('marine_ai_language', langCode);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    if (newSettings.language && newSettings.language !== globalLanguage) {
      handleLanguageChange(newSettings.language);
    }
  };

  const t = getAppTranslation(globalLanguage);

  // URL Hash synchronization for direct navigation
  useEffect(() => {
    const handleHashSync = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const allowedRoles = ['authority', 'admin', 'coast_guard', 'disaster_management', 'incois_officer', 'harbor_master'];
      const userRole = (user?.role || '').toLowerCase();

      if (hash === '#authority/login' || hash === '#/authority/login' || hash === '#authority-auth') {
        if (isAuthenticated && allowedRoles.includes(userRole)) {
          setActiveScreen('screen-authority');
        } else {
          openAuthorityAuth('screen-authority');
        }
      } else if (hash === '#authority/command-center' || hash === '#/authority/command-center' || hash === '#authority') {
        if (isAuthenticated && allowedRoles.includes(userRole)) {
          setActiveScreen('screen-authority');
        } else {
          openAuthorityAuth('screen-authority');
        }
      }
    };

    if (!isAuthLoading) {
      handleHashSync();
    }
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [isAuthenticated, user, isAuthLoading]);

  useEffect(() => {
    if (activeScreen && activeScreen !== 'authority-auth') {
      localStorage.setItem('marine_ai_active_screen', activeScreen);
    }
  }, [activeScreen]);

  useEffect(() => {
    if (activeScreen === 'screen-authority') {
      if (window.location.hash !== '#authority/command-center') {
        window.history.replaceState(null, '', '#authority/command-center');
      }
    } else if (activeScreen === 'landing') {
      if (window.location.hash && window.location.hash.includes('authority')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [activeScreen]);

  // Session guard for authority screen once auth finishes loading
  useEffect(() => {
    if (!isAuthLoading && activeScreen === 'screen-authority') {
      const allowedRoles = ['authority', 'admin', 'coast_guard', 'disaster_management', 'incois_officer', 'harbor_master'];
      const userRole = (user?.role || '').toLowerCase();
      if (!isAuthenticated || !allowedRoles.includes(userRole)) {
        openAuthorityAuth('screen-authority');
      }
    }
  }, [isAuthLoading, activeScreen, isAuthenticated, user]);

  // Protected route navigation guard
  const handleNavigateTab = (tabName) => {
    if (tabName === 'landing') {
      setActiveScreen('landing');
      return;
    }
    if (tabName === 'screen-authority') {
      const allowedRoles = ['authority', 'admin', 'coast_guard', 'disaster_management', 'incois_officer', 'harbor_master'];
      const userRole = (user?.role || '').toLowerCase();
      if (!isAuthenticated || !allowedRoles.includes(userRole)) {
        openAuthorityAuth('screen-authority');
        return;
      }
    }
    if (!isAuthenticated) {
      openLogin(tabName, 'Please sign in to access live mission intelligence & vessel controls.');
      return;
    }
    setActiveScreen(tabName);
  };

  const [screen1Config, setScreen1Config] = useState({
    dockTab: 'layers',
    showBulletin: false,
    landingId: settings.basePort || 'rameswaram'
  });

  const handleExploreMap = (landingId = settings.basePort || 'rameswaram') => {
    if (!isAuthenticated) {
      openLogin('screen-1', 'Sign in to access interactive ocean geoportal & thermal satellite mesh.');
      return;
    }
    setScreen1Config({ dockTab: 'layers', showBulletin: false, landingId });
    setActiveScreen('screen-1');
  };

  const handleOpenWeather = () => {
    if (!isAuthenticated) {
      openLogin('screen-1', 'Sign in to access live sea state & weather forecast HUD.');
      return;
    }
    setScreen1Config(prev => ({ ...prev, dockTab: 'hud', showBulletin: false }));
    setActiveScreen('screen-1');
  };

  const handleOpenFishingZones = () => {
    if (!isAuthenticated) {
      openLogin('screen-1', 'Sign in to access official INCOIS Potential Fishing Zones (PFZ).');
      return;
    }
    setScreen1Config(prev => ({ ...prev, dockTab: 'layers', showBulletin: true }));
    setActiveScreen('screen-1');
  };

  const handleOpenSeaConditions = () => {
    if (!isAuthenticated) {
      openLogin('screen-1', 'Sign in to access ocean current, swell, and bathymetry data.');
      return;
    }
    setScreen1Config(prev => ({ ...prev, dockTab: 'hud', showBulletin: false }));
    setActiveScreen('screen-1');
  };

  const handleOpenMarineAreas = () => {
    if (!isAuthenticated) {
      openLogin('screen-1', 'Sign in to view sensitive marine zones & coastal boundaries.');
      return;
    }
    setScreen1Config(prev => ({ ...prev, dockTab: 'layers', showBulletin: false }));
    setActiveScreen('screen-1');
  };

  const handleOpenSafety = () => {
    if (!isAuthenticated) {
      openLogin('screen-3', 'Sign in to access live vessel safety challenger & capsize risk index.');
      return;
    }
    setActiveScreen('screen-3');
  };

  const handleOpenSafeRoute = () => {
    if (!isAuthenticated) {
      openLogin('screen-2', 'Sign in to access hydrodynamic Digital Twin & optimal route planning.');
      return;
    }
    setActiveScreen('screen-2');
  };

  const handleOpenAiAgents = () => {
    if (!isAuthenticated) {
      openLogin('screen-5', 'Sign in to access Scientific AI reasoning & multi-agent fleet.');
      return;
    }
    setActiveScreen('screen-5');
  };

  const handleOpenMarineAiWithQuery = (query = '') => {
    setChatInitialPrompt(query || '');
    setChatInitialVoice(false);
    setIsChatOpen(true);
  };

  const handleOpenVoiceAssistant = () => {
    setIsVoiceOpen(true);
  };

  const handleOpenAuthorities = () => {
    const allowedRoles = ['authority', 'admin', 'coast_guard', 'disaster_management', 'incois_officer', 'harbor_master'];
    const userRole = (user?.role || '').toLowerCase();
    if (isAuthenticated && allowedRoles.includes(userRole)) {
      setActiveScreen('screen-authority');
    } else {
      openAuthorityAuth('screen-authority');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F4F8FA] text-[#172326] flex flex-col font-sans overflow-hidden selection:bg-[#DDF2EF] selection:text-[#12343B]">
      {/* If activeScreen is 'landing', show full landing page view */}
      {activeScreen === 'landing' ? (
        <div className="flex-1 h-full overflow-hidden">
          <OrcaLandingPage
            onExploreMap={handleExploreMap}
            onOpenWeather={handleOpenWeather}
            onOpenFishingZones={handleOpenFishingZones}
            onOpenSeaConditions={handleOpenSeaConditions}
            onOpenSafety={handleOpenSafety}
            onOpenMarineAreas={handleOpenMarineAreas}
            onOpenSafeRoute={handleOpenSafeRoute}
            onOpenAiAgents={handleOpenAiAgents}
            onOpenAuthorities={handleOpenAuthorities}
            onOpenVoiceModal={handleOpenVoiceAssistant}
            onOpenMarineAiWithQuery={handleOpenMarineAiWithQuery}
            onOpenFamilyLink={() => handleNavigateTab('screen-family')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            globalLanguage={globalLanguage}
            onLanguageChange={handleLanguageChange}
            user={user}
            isAuthenticated={isAuthenticated}
            onOpenLogin={() => openLogin()}
            onOpenRegister={() => openRegister()}
            onOpenProfile={() => openProfile()}
            onLogout={() => { logout(); setActiveScreen('landing'); }}
          />
        </div>
      ) : (
        <>
          {/* Header Row 1: Top Brand, Base Port, and Global Utility Strip (h-12) */}
          <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 flex items-center justify-between gap-3 shrink-0 z-40 h-12 shadow-[0_1px_3px_rgba(11,30,54,0.03)]">
            {/* Left: Brand Identity + Base Port Indicator */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveScreen('landing')}
                className="flex items-center gap-2.5 text-left cursor-pointer group select-none"
                title="Return to Marine Intelligence Homepage"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold group-hover:scale-105 transition shadow-xs shrink-0">
                  🌊
                </div>
                <span className="font-black text-[15px] sm:text-[16px] tracking-wider text-[#0B1E36] leading-none uppercase font-sans">
                  MARINE INTELLIGENCE
                </span>
              </button>

              <div className="h-5 w-px bg-slate-200 hidden md:block" />

              {/* Base Port Quick Indicator */}
              <div 
                onClick={() => setIsSettingsOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-blue-400 text-slate-700 text-xs font-medium cursor-pointer transition"
                title="Click to configure coastal base port in Settings"
              >
                <span className="text-blue-600 font-bold">⚓</span>
                <span className="font-semibold text-slate-800">{settings.basePortName || 'Rameswaram Fishing Harbor'}</span>
                <span className="text-[10px] text-slate-400 font-mono">({settings.vesselType || 'Trawler'})</span>
              </div>
            </div>

            {/* Right: Global Utilities (Language, Settings, Marine AI, Offline, SOS) */}
            <div className="flex items-center gap-2">
              {/* Global Multilingual Selector Dropdown */}
              <div className="relative">
                <select
                  value={globalLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B1E36] text-xs font-semibold rounded-[3px] px-2.5 py-1.5 outline-none focus:border-[#1D63ED] transition cursor-pointer shadow-xs"
                  title="Select Global Coastal Language"
                >
                  {SUPPORTED_INDIAN_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
                      {lang.flag} {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* User Profile Menu / Auth Button */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(p => !p)}
                    className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-[3px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#1D63ED] transition cursor-pointer shadow-xs"
                    title="User Profile & Vessel"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#0B1E36] text-white flex items-center justify-center font-bold text-[10px]">
                      {user.name?.charAt(0) || 'M'}
                    </div>
                    <span className="text-xs font-bold text-slate-800 hidden sm:inline truncate max-w-[110px]">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-left animate-in fade-in duration-100">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="font-bold text-xs text-slate-900 truncate">{user.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{user.email}</div>
                        <div className="text-[9px] text-[#1D63ED] font-semibold mt-0.5">
                          {user.vessel_name || 'Matsya-Varuna'}
                        </div>
                      </div>

                      <button
                        onClick={() => { setIsUserMenuOpen(false); openProfile(); }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>My Profile & Vessel</span>
                      </button>

                      <button
                        onClick={() => { setIsUserMenuOpen(false); setIsSettingsOpen(true); }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>System Settings</span>
                      </button>

                      <div className="h-px bg-slate-100 my-1" />

                      <button
                        onClick={() => { setIsUserMenuOpen(false); logout(); setActiveScreen('landing'); }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition flex items-center gap-2 cursor-pointer font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openLogin()}
                    className="px-2.5 py-1 rounded-[3px] text-xs font-semibold text-slate-700 hover:text-[#1D63ED] hover:bg-[#F8FAFC] border border-[#CBD5E1] transition cursor-pointer shadow-xs"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openRegister()}
                    className="px-3 py-1 rounded-[3px] text-xs font-bold bg-[#1D63ED] hover:bg-[#1552C6] text-white shadow-xs transition cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Settings Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 rounded-[3px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#1D63ED] text-slate-700 hover:text-[#1D63ED] text-xs font-medium transition cursor-pointer shadow-xs flex items-center gap-1.5"
                title="Marine Intelligence System Settings"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span className="hidden lg:inline">{t.settings || 'Settings'}</span>
              </button>

              {/* Marine AI Assistant Button */}
              <button
                onClick={() => setIsChatOpen(true)}
                className="px-2.5 py-1.5 rounded-[3px] bg-[#FFFFFF] hover:bg-[#EEF4F3] border border-[#CBD5E1] hover:border-[#1D63ED] text-[#0B1E36] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Open Marine AI Assistant (16 Multi-Agents)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span className="hidden sm:inline">{t.marineAi || 'Marine AI'}</span>
              </button>

              {/* Family Safety Link Button */}
              <button
                onClick={() => handleNavigateTab('screen-family')}
                className={`px-2.5 py-1.5 rounded-[3px] text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition shadow-xs ${
                  activeScreen === 'screen-family'
                    ? 'bg-[#E0F2FE] text-[#1D63ED] border-[#1D63ED] font-bold'
                    : 'bg-[#FFFFFF] hover:bg-[#F8FAFC] text-slate-600 hover:text-slate-900 border-[#CBD5E1]'
                }`}
                title="Family Safety Link & Shore Watchdog"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">{t.familyLink || 'Family Link'}</span>
              </button>

              {/* Offline Edge Pack Button */}
              <button
                onClick={() => setIsOfflineOpen(true)}
                className="px-2.5 py-1.5 rounded-[3px] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-slate-600 hover:text-slate-900 text-xs font-medium border border-[#CBD5E1] flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                title="Offline Edge Map Pack & Cache"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">{t.offlinePack || 'Offline Pack'}</span>
              </button>

              {/* Emergency SOS Button */}
              <button
                onClick={() => setIsEmergencyOpen(true)}
                className="px-3 py-1.5 rounded-[3px] bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                title="Emergency Coast Guard Hotline 1093"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-white" />
                <span>{t.sos || 'SOS 1093'}</span>
              </button>
            </div>
          </header>

          {/* Header Row 2: Clean Sub-Nav Strip Below Top Row (h-10) */}
          <nav className="h-10 bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 flex items-center justify-between gap-3 shrink-0 z-30">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {/* Home Button */}
              <button
                onClick={() => setActiveScreen('landing')}
                className="px-2.5 py-1 rounded-[3px] text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-white transition flex items-center gap-1.5 mr-1 cursor-pointer"
                title="Return to Landing Page"
              >
                <span>🏠</span>
                <span>{t.home || 'Home'}</span>
              </button>

              <div className="h-4 w-px bg-slate-300 mr-1" />

              {/* Clean Screen Tabs */}
              <button
                onClick={() => handleNavigateTab('screen-1')}
                className={`px-3 py-1 rounded-[3px] transition flex items-center gap-1.5 shrink-0 text-xs cursor-pointer ${
                  activeScreen === 'screen-1'
                    ? 'bg-[#FFFFFF] text-[#0B1E36] font-bold border border-[#CBD5E1] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeScreen === 'screen-1' ? 'bg-[#1D63ED]' : 'bg-slate-400'}`} />
                <span>{t.executiveBrain || 'Executive Brain'}</span>
              </button>

              <button
                onClick={() => handleNavigateTab('screen-2')}
                className={`px-3 py-1 rounded-[3px] transition flex items-center gap-1.5 shrink-0 text-xs cursor-pointer ${
                  activeScreen === 'screen-2'
                    ? 'bg-[#FFFFFF] text-[#0B1E36] font-bold border border-[#CBD5E1] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.digitalTwin || 'Digital Twin & What-If'}</span>
              </button>

              <button
                onClick={() => handleNavigateTab('screen-3')}
                className={`px-3 py-1 rounded-[3px] transition flex items-center gap-1.5 shrink-0 text-xs cursor-pointer ${
                  activeScreen === 'screen-3'
                    ? 'bg-[#FFFFFF] text-[#0B1E36] font-bold border border-[#CBD5E1] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.liveMission || 'Live Mission & Safety'}</span>
              </button>

              <button
                onClick={() => handleNavigateTab('screen-4')}
                className={`px-3 py-1 rounded-[3px] transition flex items-center gap-1.5 shrink-0 text-xs cursor-pointer ${
                  activeScreen === 'screen-4'
                    ? 'bg-[#FFFFFF] text-[#0B1E36] font-bold border border-[#CBD5E1] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
                }`}
              >
                <Navigation className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.missionReplay || 'Mission Replay'}</span>
              </button>

              <button
                onClick={() => handleNavigateTab('screen-5')}
                className={`px-3 py-1 rounded-[3px] transition flex items-center gap-1.5 shrink-0 text-xs cursor-pointer ${
                  activeScreen === 'screen-5'
                    ? 'bg-[#FFFFFF] text-[#0B1E36] font-bold border border-[#CBD5E1] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span>Scientific AI</span>
              </button>

              <button
                onClick={() => handleNavigateTab('screen-family')}
                className={`px-3 py-1 rounded-[3px] transition flex items-center gap-1.5 shrink-0 text-xs cursor-pointer ${
                  activeScreen === 'screen-family'
                    ? 'bg-[#FFFFFF] text-[#0B1E36] font-bold border border-[#CBD5E1] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Family Link</span>
              </button>

              <button
                onClick={() => handleNavigateTab('screen-dual')}
                className={`px-2.5 py-1 rounded-[3px] transition flex items-center gap-1.5 shrink-0 text-xs cursor-pointer ${
                  activeScreen === 'screen-dual'
                    ? 'bg-[#1D63ED] text-white font-bold shadow-xs'
                    : 'bg-[#F0F9FF] text-[#1D63ED] hover:bg-[#E0F2FE] font-semibold border border-[#1D63ED]/30'
                }`}
                title="View Both Pages Side-by-Side as in Design Reference"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Dual View</span>
              </button>

              {/* Authority Command Center Tab (High Visibility) */}
              <button
                onClick={() => handleNavigateTab('screen-authority')}
                className={`px-3 py-1 rounded-[3px] transition flex items-center gap-1.5 shrink-0 text-xs cursor-pointer ${
                  activeScreen === 'screen-authority'
                    ? 'bg-[#FFFFFF] text-[#0B1E36] font-bold border border-[#CBD5E1] shadow-xs'
                    : user?.role === 'authority'
                    ? 'bg-red-50 text-red-700 hover:bg-red-100 font-bold border border-red-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
                }`}
                title="Maritime Authorities Emergency Command Center"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>Command Center</span>
                <span className="px-1 py-0.2 rounded text-[9px] font-extrabold uppercase bg-red-600 text-white ml-0.5">
                  HQ
                </span>
              </button>
            </div>

            {/* Right Status Badge */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.statusBadge || '16 Agents Synchronized'}</span>
              </span>
            </div>
          </nav>

          {/* Main Workspace (5 Distinct Screens) */}
          <main className="flex-1 min-h-0 relative overflow-hidden bg-[#F4F8FA]">
            {/* Screen 1: Executive Marine Brain (HUD & INCOIS Geoportal Map) */}
            {activeScreen === 'screen-1' && (
              <Screen1ExecutiveBrain
                onNavigateTab={setActiveScreen}
                onOpenVoiceModal={handleOpenVoiceAssistant}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onOpenMarineAi={() => handleOpenMarineAiWithQuery('')}
                initialDockTab={screen1Config.dockTab}
                initialShowBulletin={screen1Config.showBulletin}
                initialLandingId={screen1Config.landingId}
                globalLanguage={globalLanguage}
                translations={t}
              />
            )}

            {/* Screen 2: Mission Digital Twin & What-If Simulation */}
            {activeScreen === 'screen-2' && (
              <Screen2DigitalTwin
                onNavigateTab={setActiveScreen}
                onAcceptPlan={() => setActiveScreen('screen-3')}
                onOpenFamilyLink={() => setIsFamilyLinkOpen(true)}
                globalLanguage={globalLanguage}
                translations={t}
              />
            )}

            {/* Screen 3: Live Mission Tracking & Safety Challenger */}
            {activeScreen === 'screen-3' && (
              <Screen3LiveMission
                onNavigateTab={setActiveScreen}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onOpenOfflineModal={() => setIsOfflineOpen(true)}
                onOpenFamilyLink={() => setIsFamilyLinkOpen(true)}
                onCompleteMission={() => setActiveScreen('screen-4')}
                globalLanguage={globalLanguage}
                translations={t}
              />
            )}

            {/* Screen 4: Mission Replay & Continuous Learning Debrief */}
            {activeScreen === 'screen-4' && (
              <Screen4MissionReplay
                onNavigateTab={setActiveScreen}
                onPlanNewMission={() => setActiveScreen('screen-2')}
                globalLanguage={globalLanguage}
                translations={t}
              />
            )}

            {/* Screen 5: Scientific AI (Matching Reference Design) */}
            {activeScreen === 'screen-5' && (
              <ScreenScientificAndFamily
                initialView="scientific"
                onNavigateTab={setActiveScreen}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {/* Screen Family: Family Link (Matching Reference Design) */}
            {activeScreen === 'screen-family' && (
              <ScreenScientificAndFamily
                initialView="family"
                onNavigateTab={setActiveScreen}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {/* Screen Dual: Both Pages Side-by-Side (Exact Reference Layout) */}
            {activeScreen === 'screen-dual' && (
              <ScreenScientificAndFamily
                initialView="dual"
                onNavigateTab={setActiveScreen}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {/* Screen Authority: Maritime Emergency Command Center */}
            {activeScreen === 'screen-authority' && (
              <ScreenAuthorityCommandCenter
                onNavigateTab={setActiveScreen}
                onOpenMarineAi={(query) => handleOpenMarineAiWithQuery(query)}
                globalLanguage={globalLanguage}
              />
            )}
          </main>
        </>
      )}

      {/* Persistent Global Architectural Intelligence Status / Marine AI Trigger (Screens 2-5) */}
      {activeScreen !== 'screen-1' && activeScreen !== 'landing' && (
        <div className="fixed bottom-5 right-5 z-30">
          <button
            onClick={() => handleOpenMarineAiWithQuery('')}
            className="group px-3.5 py-2 rounded-[3px] bg-[#FFFFFF] hover:bg-[#EEF4F3] text-[#172326] text-xs shadow-[0_2px_12px_rgba(18,52,59,0.08)] border border-[#DCE6E4] hover:border-[#1D63ED] transition-all flex items-center gap-2.5 cursor-pointer"
            title="Open Marine AI Assistant"
          >
            <div className="w-5 h-5 rounded-[2px] bg-[#0B1E36] flex items-center justify-center text-[#FFFFFF] text-[10px] font-mono font-bold">
              ✦
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-[#0B1E36] tracking-tight">{t.marineAi || 'Marine AI'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D63ED]" />
              </div>
              <span className="text-[10px] text-[#1D63ED] font-medium">{t.statusBadge || '16 Agents Operational'}</span>
            </div>
          </button>
        </div>
      )}

      {/* Unified Marine AI Chat & Multilingual Voice Panel (Single Source of Truth) */}
      <MarineAiChatPanel
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatInitialVoice(false);
          setChatInitialPrompt('');
        }}
        onNavigateScreen={setActiveScreen}
        initialPrompt={chatInitialPrompt}
        onClearInitialPrompt={() => setChatInitialPrompt('')}
        initialVoice={chatInitialVoice}
        onClearInitialVoice={() => setChatInitialVoice(false)}
        screenContext={activeScreen}
        globalLanguage={globalLanguage}
        onLanguageChange={handleLanguageChange}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <OfflinePackModal
        isOpen={isOfflineOpen}
        onClose={() => setIsOfflineOpen(false)}
        isOffline={true}
        onToggleOffline={() => {}}
      />

      <FamilyLinkModal
        isOpen={isFamilyLinkOpen}
        onClose={() => setIsFamilyLinkOpen(false)}
        globalLanguage={globalLanguage}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Dedicated Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onNavigateMission={() => {
          setIsVoiceOpen(false);
          setActiveScreen('screen-2');
        }}
        globalLanguage={globalLanguage}
        onLanguageChange={handleLanguageChange}
        user={user}
      />

      <AuthModal 
        onLoginSuccess={(target) => setActiveScreen(target || 'screen-authority')} 
        onNavigateToAuthorityAuth={() => openAuthorityAuth('screen-authority')}
      />
    </div>
  );
}
