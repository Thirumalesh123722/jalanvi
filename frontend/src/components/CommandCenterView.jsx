import React, { useState } from 'react';
import MarineMap from './MarineMap';
import { 
  Bot, Mic, MicOff, Send, Volume2, VolumeX, Sparkles, 
  Compass, ShieldCheck, AlertTriangle, CheckCircle2, 
  Clock, Waves, Wind, Fuel, ArrowRight, Swords, 
  FileCheck, ShieldAlert, Sliders, Users, ExternalLink, RefreshCw
} from 'lucide-react';
import { 
  ZONES, DEFAULT_VESSEL, COASTAL_BASE, HOURLY_TIMELINE, 
  PRESET_QUERIES, TRANSLATIONS, AGENTS_SYSTEM 
} from '../data/marineData';

export default function CommandCenterView({ 
  currentLang, 
  activeZoneId, 
  onSelectZone, 
  isOffline,
  onOpenWhatIf,
  onOpenFamilyLink
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const activeZone = ZONES.find(z => z.id === activeZoneId) || ZONES[0];

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: currentLang === 'te' 
        ? 'నమస్కారం! నేను మెరైన్ AI మిషన్ కోపైలట్. రేపటి వేట ప్రణాళిక, సురక్షిత మార్గాలు లేదా సంభావ్య చేపల జోన్ల (PFZ) గురించి ఏదైనా అడగవచ్చు.'
        : currentLang === 'hi'
        ? 'नमस्ते! मैं मरीन AI मिशन कोपायलट हूँ। कल की मछली पकड़ने की योजना, सुरक्षित समुद्री मार्ग, मौसम या संभावित मत्स्य पालन क्षेत्रों (PFZ) के बारे में पूछें।'
        : 'Welcome to MarineAI Mission Command. Ask me to plan your fishing voyage, analyze sea conditions, verify geofenced zones, or simulate safe return windows.',
      timestamp: '11:45 AM',
      missionCard: {
        zoneId: 'zone-a',
        zoneName: 'Zone Alpha (Shelf Edge)',
        recommendation: 'RECOMMENDED (Plan A)',
        safeWindow: '05:30 - 13:45 IST',
        fuelNeeded: '62 Liters',
        stability: '89% High',
      }
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Quick What-If simulation delay offset inside the command center
  const [quickDepartureDelay, setQuickDepartureDelay] = useState(0);

  // Audio recording toggle
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const sample = PRESET_QUERIES.find(q => q.lang === currentLang) || PRESET_QUERIES[0];
      setInputText(sample.text);
    }, 2000);
  };

  // Text to speech
  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'te' ? 'te-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Process message send
  const handleSend = (textToSend = inputText) => {
    if (!textToSend.trim()) return;
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      const queryLower = textToSend.toLowerCase();
      let replyText = '';
      let missionCard = null;

      if (queryLower.includes('cyclone') || queryLower.includes('weather') || queryLower.includes('తుఫాను') || queryLower.includes('तूफान')) {
        replyText = currentLang === 'te'
          ? 'ఉపగ్రహ డేటా (INSAT-3DR) ప్రకారం తీరంలో తుఫాను హెచ్చరికలు లేవు. సముద్రపు గాలులు 11 నాట్లు, అలల ఎత్తు 1.2 మీటర్లు. తీరప్రాంతం సాధారణంగా ఉంది.'
          : 'INSAT-3DR satellite observations confirm NO cyclone alerts along the Andhra coastal sector. Sea state is slight-to-moderate at 1.2m waves with 11 kn breezes.';
      } else if (queryLower.includes('why not') || queryLower.includes('bravo') || queryLower.includes('ఎందుకు కాదు')) {
        replyText = currentLang === 'te'
          ? 'రెడ్-టీమ్ చాలెంజర్ పరిశీలన: జోన్ బ్రావోలో చేపల సంభావ్యత 97% ఉన్నప్పటికీ, మధ్యాహ్నం 14:00 తర్వాత అలలు 2.8 మీటర్లకు పెరిగి తిరుగు ప్రయాణం ప్రమాదకరంగా మారుతుంది. అందుకే అది తిరస్కరించబడింది.'
          : 'Adversarial Challenger Finding: While Zone Bravo has 97% catch potential, afternoon swell jumps to 2.8m, exceeding small trawler limits. 88 km transit leaves only 15% fuel reserve.';
      } else {
        replyText = currentLang === 'te'
          ? 'మిషన్ రికమండేషన్ సిద్ధంగా ఉంది: జోన్ ఆల్ఫా (షెల్ఫ్ ఎడ్జ్ - 42 కి.మీ) వద్ద క్లోరోఫిల్ మరియు ఉష్ణోగ్రత ఆధారంగా టూనా మరియు సీర్ ఫిష్ లభ్యత ఎక్కువగా ఉంది. సురక్షిత ప్రయాణ సమయం ఉదయం 5:30 నుండి మధ్యాహ్నం 1:45 వరకు.'
          : 'Mission Approved: Zone Alpha (42 km offshore) presents optimal SST (28.4°C) and chlorophyll front (1.45 mg/m³). Safe operating window confirmed 05:30 - 13:45 IST with 79% fuel reserve.';
        missionCard = {
          zoneId: 'zone-a',
          zoneName: 'Zone Alpha (Shelf Edge)',
          recommendation: 'RECOMMENDED (Plan A)',
          safeWindow: '05:30 - 13:45 IST',
          fuelNeeded: '62 Liters',
          stability: '89% High',
        };
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          missionCard,
        }
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-4 text-left">
      {/* 3-Column Master Command Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: Conversational AI Copilot & Voice Interface */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 flex flex-col h-[750px] bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">AI Mission Assistant</h3>
                <p className="text-[10px] text-slate-400">Multilingual Voice & Chat</p>
              </div>
            </div>
            <button
              onClick={() => setMessages(messages.slice(0, 1))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition text-[11px] flex items-center gap-1"
              title="Reset Chat"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            {PRESET_QUERIES.map(q => (
              <button
                key={q.id}
                onClick={() => handleSend(q.text)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition"
              >
                {q.text.slice(0, 26)}...
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[92%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`p-3 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 border border-slate-700 text-slate-200 rounded-tl-none shadow-md'
                }`}>
                  <p>{msg.text}</p>

                  {msg.sender === 'ai' && (
                    <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium"
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        <span>Voice</span>
                      </button>
                    </div>
                  )}

                  {msg.missionCard && (
                    <div className="mt-2 p-2 rounded-xl bg-slate-950 border border-sky-800/50 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-sky-300">
                        <span>{msg.missionCard.zoneName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {msg.missionCard.recommendation}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                        <div>Safe Window: <strong className="text-white">{msg.missionCard.safeWindow}</strong></div>
                        <div>Stability: <strong className="text-emerald-300">{msg.missionCard.stability}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 p-2.5 bg-slate-800/60 rounded-xl text-xs text-sky-300 border border-slate-700 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Multi-agent correlation in progress...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2.5 rounded-xl transition ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Voice Input"
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRecording ? 'Listening in your language...' : 'Ask question or plan mission...'}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER COLUMN: Interactive Marine Map & Live Agent DAG */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 space-y-3 flex flex-col h-[750px]">
          {/* Top Map Container */}
          <div className="flex-1 min-h-[460px] relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            <MarineMap
              activeZoneId={activeZoneId}
              onSelectZone={onSelectZone}
              isOffline={isOffline}
            />
          </div>

          {/* Bottom of Map: Live Multi-Agent Collaboration Bar */}
          <div className="p-3.5 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" /> Live Multi-Agent Execution DAG (ISRO PS Architecture)
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Autonomous Verification: PASSED
              </span>
            </div>

            {/* Agent Pipeline Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">PLANNER</span>
                  <span className="font-semibold text-slate-200">Plan A (42 km)</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">SATELLITE EO</span>
                  <span className="font-semibold text-slate-200">28.4°C SST / Chl-a</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">GEOFENCE</span>
                  <span className="font-semibold text-slate-200">NOTAM Cleared</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-rose-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-rose-400 block font-bold">RED TEAM ⚔️</span>
                  <span className="font-semibold text-rose-300">Zone Bravo Disq.</span>
                </div>
                <Swords className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>
          </div>

          {/* 24-Hour Marine Risk Timeline Strip */}
          <div className="p-3.5 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white">24-Hour Wave Swell & Marine Risk Timeline</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Safe Window: <strong className="text-emerald-400">05:30 – 13:45 IST</strong>
              </span>
            </div>

            {/* Timeline Bars */}
            <div className="grid grid-cols-10 gap-1 pt-1">
              {HOURLY_TIMELINE.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded-lg text-center border transition ${
                    step.highlight
                      ? 'bg-sky-500/20 border-sky-400 shadow-md'
                      : step.safe
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-rose-950/40 border-rose-800/60'
                  }`}
                  title={`${step.time}: ${step.wave}m waves, ${step.wind} kn wind (${step.label})`}
                >
                  <span className="text-[10px] font-mono text-slate-400 block">{step.time}</span>
                  <span className={`text-[11px] font-bold block ${step.safe ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {step.wave}m
                  </span>
                  <span className={`text-[9px] font-medium block truncate ${step.safe ? 'text-slate-400' : 'text-rose-300'}`}>
                    {step.wind}kn
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Marine Intel, Guardian & Abort Conditions */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-3.5 flex flex-col h-[750px] overflow-y-auto pr-1">
          {/* Live Marine Parameters Card */}
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-cyan-400" /> Marine Hydrodynamics
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live Ocean Buoy #4</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SEA SURFACE TEMP</span>
                <span className="font-semibold text-amber-300 font-mono text-sm">{activeZone.sst}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CHLOROPHYLL-A</span>
                <span className="font-semibold text-emerald-300 font-mono text-sm">{activeZone.chlorophyll}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CURRENT WAVE HEIGHT</span>
                <span className="font-semibold text-cyan-300 font-mono text-sm">{activeZone.waveHeight}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">WINDS & CURRENTS</span>
                <span className="font-semibold text-purple-300 font-mono text-sm">{activeZone.windSpeed}</span>
              </div>
            </div>
          </div>

          {/* AI Decision Guardian & Verification */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-800/40 shadow-xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> AI Decision Guardian
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                RATIFIED
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] pt-1">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Data Agreement:</span>
                <span className="font-mono text-emerald-300 font-semibold">94% (Oceansat + INCOIS)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Forecast Uncertainty:</span>
                <span className="font-mono text-slate-200">LOW (&lt; 0.2m variance)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Decision Stability:</span>
                <span className="font-mono text-emerald-400 font-bold">{activeZone.stability}% Robust</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Independent Check:</span>
                <span className="font-semibold text-sky-300">PASSED (Hydrodynamic Rules)</span>
              </div>
            </div>
          </div>

          {/* Mission Abort Conditions (Flagship Feature from Chat) */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 shadow-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Mission Abort Conditions
              </span>
              <span className="text-[10px] font-mono text-slate-500">AUTO-TRIGGERS</span>
            </div>

            <p className="text-slate-300 text-[11px]">
              Vessel must abort and initiate immediate return if any condition is met:
            </p>

            <ul className="space-y-1.5 text-[11px] text-slate-300 pl-1">
              <li className="flex items-center gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>Wave swell exceeds <strong>2.2 meters</strong></span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>Remaining fuel reserve drops below <strong>20% (60L)</strong></span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>Proximity within <strong>10 NM</strong> of military firing zone</span>
              </li>
            </ul>
          </div>

          {/* Quick What-If & Family Link Access */}
          <div className="grid grid-cols-2 gap-2 text-xs mt-auto pt-2">
            <button
              onClick={onOpenWhatIf}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Full What-If</span>
            </button>

            <button
              onClick={onOpenFamilyLink}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Family Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
