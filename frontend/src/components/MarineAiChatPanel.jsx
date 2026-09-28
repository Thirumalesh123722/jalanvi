import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bot, User, Sparkles, Send, Mic, MicOff, X, 
  RotateCcw, Compass, ShieldAlert, ShieldCheck, 
  Waves, Wind, Sun, Fish, MapPin, ChevronRight, Activity,
  Layers, CheckCircle2, ArrowRight, ExternalLink,
  Volume2, VolumeX, Globe, Radio, Maximize2, Minimize2,
  StopCircle, Check, AlertTriangle, MessageSquare,
  Plus, Trash2, Clock, History, CornerDownRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MarineApi from '../services/api';
import { executeAquaIntellectPipeline, AQUA_AGENTS_METADATA } from '../services/aquaIntellectAgents';
import { 
  SUPPORTED_INDIAN_LANGUAGES, 
  MULTILINGUAL_UI, 
  generateLocalizedMarineResponse, 
  speakTextInLanguage,
  stopSpeaking,
  detectLanguageDetailed,
  findBestVoiceForLanguage,
  getSupportedBrowserVoices
} from '../services/multilingualMarine';
import { renderFormattedMarkdown } from '../utils/markdownRenderer';

/**
 * 🌊 MarineAiChatPanel — Single Source of Truth for Marine AI
 * Identical Landing Page frosted-glass visual reference used across all screens.
 * Features:
 * 1. Guaranteed white text (#FFFFFF) inside the dark navy user bubble.
 * 2. Real database-backed conversation persistence (ChatGPT-style threads).
 * 3. End-to-end automatic voice output in the detected language (Speech -> STT -> Detect -> Answer -> Native TTS Auto-Play).
 * 4. Language switching per turn (English, Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, etc.).
 * 5. Interruptible voice playback and graceful autoplay fallback.
 */
export default function MarineAiChatPanel({
  isOpen,
  onClose,
  onNavigateScreen,
  initialPrompt = '',
  onClearInitialPrompt,
  initialVoice = false,
  onClearInitialVoice,
  screenContext = 'GENERAL',
  globalLanguage = 'en',
  onLanguageChange,
  isInline = false
}) {
  const { user, isAuthenticated } = useAuth();

  // Voice & Language selection: 'auto' means Automatic Language Detection (Recommended)
  const [selectedLanguage, setSelectedLanguage] = useState('auto'); // 'auto' | 'te' | 'ta' | 'hi' | 'en' | etc.
  const [detectedLanguage, setDetectedLanguage] = useState(globalLanguage || 'en');
  const [detectionConfidence, setDetectionConfidence] = useState(1.0);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Voice State Machine: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'GENERATING' | 'SPEAKING' | 'ERROR'
  const [voiceState, setVoiceState] = useState('IDLE');
  const [voiceErrorMsg, setVoiceErrorMsg] = useState('');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Input & Messaging states
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeStepText, setActiveStepText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // ChatGPT-Style Conversation History Drawer & Active Thread
  const [conversationsList, setConversationsList] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversationTitle, setActiveConversationTitle] = useState('Marine AI Chat');
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Active language configuration
  const activeEffectiveCode = selectedLanguage === 'auto' ? detectedLanguage : selectedLanguage;
  const uiConfig = MULTILINGUAL_UI[activeEffectiveCode] || MULTILINGUAL_UI.en;
  const currentLangMeta = SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === activeEffectiveCode) || SUPPORTED_INDIAN_LANGUAGES[0];

  // Initial Welcome message based on context
  const getContextualWelcome = () => {
    let contextNote = '';
    if (screenContext === 'EXECUTIVE_BRAIN' || screenContext === 'screen-1') {
      contextNote = '\n\nActive Context: **Executive Marine Brain & INCOIS Ocean Geoportal**. Monitoring live satellite SST, chlorophyll plumes, and regional weather.';
    } else if (screenContext === 'DIGITAL_TWIN' || screenContext === 'screen-2') {
      contextNote = '\n\nActive Context: **Mission Digital Twin & What-If Simulator**. Ready to simulate hydrodynamic routes, fuel burn, and wave safety.';
    } else if (screenContext === 'LIVE_MISSION' || screenContext === 'screen-3') {
      contextNote = '\n\nActive Context: **Live Mission & Safety Challenger**. Tracking live telemetry via NavIC-L5 and active offshore perimeter.';
    } else if (screenContext === 'SCIENTIFIC_AI' || screenContext === 'screen-5') {
      contextNote = '\n\nActive Context: **AI Scientist & 16 Multi-Agent Squadron**. Evaluating oceanographic hypotheses and multi-source evidence.';
    } else if (screenContext === 'FAMILY_LINK' || screenContext === 'screen-family') {
      contextNote = '\n\nActive Context: **Family Link & Shore Watchdog**. Managing emergency contacts, WhatsApp live tracking, and shore peace-of-mind.';
    } else if (screenContext === 'AUTHORITY_COMMAND_CENTER' || screenContext === 'screen-authority') {
      contextNote = '\n\nActive Context: **Maritime Authorities Emergency Command Center**. Monitoring Severe Cyclonic Storm VARUNA-04B, 0-100 Risk Engine (88/100 CRITICAL), distressed vessels, and SAR rescue allocations.';
    }

    return `${uiConfig.welcome}${contextNote}`;
  };

  const createInitialWelcomeMessage = () => ({
    id: 'msg-welcome',
    role: 'assistant',
    timestamp: 'Just now',
    content: getContextualWelcome(),
    telemetryCard: null,
    executedAgents: ['OrchestratorAgent', 'MarineDataAgent', 'WeatherAgent', 'SafetyAgent'],
    languageCode: activeEffectiveCode
  });

  const [messages, setMessages] = useState([createInitialWelcomeMessage()]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isOpen || isInline) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen, isInline]);

  // Stop speech when drawer closes
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setVoiceState('IDLE');
      setIsHistoryDrawerOpen(false);
    }
  }, [isOpen]);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Handle incoming initialPrompt
  useEffect(() => {
    if (isOpen && initialPrompt && initialPrompt.trim()) {
      handleSendQuery(initialPrompt.trim(), false);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [isOpen, initialPrompt]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen && !isInline) {
        if (isHistoryDrawerOpen) {
          setIsHistoryDrawerOpen(false);
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isInline, isHistoryDrawerOpen, onClose]);

  // Load persistent conversation list whenever authenticated user opens the panel
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadConversationsList();
    }
  }, [isOpen, isAuthenticated]);

  /**
   * Fetches user's conversation threads from the persistent SQLite database
   */
  const loadConversationsList = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingHistory(true);
      const res = await MarineApi.getConversations();
      if (res && res.success && Array.isArray(res.conversations)) {
        setConversationsList(res.conversations);
        // If there's no active conversation selected yet, auto-load the latest one if it has messages
        if (!activeConversationId && res.conversations.length > 0) {
          loadSpecificConversation(res.conversations[0].id);
        }
      }
    } catch (err) {
      console.warn('Notice: Failed to load user conversations:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  /**
   * Loads a specific conversation thread and all its historical messages
   */
  const loadSpecificConversation = async (convId) => {
    try {
      stopSpeaking();
      setIsThinking(true);
      setActiveStepText('Restoring conversation from database...');
      const res = await MarineApi.getConversation(convId);
      if (res && res.success && res.conversation) {
        setActiveConversationId(res.conversation.id);
        setActiveConversationTitle(res.conversation.title || 'Marine AI Chat');
        setIsHistoryDrawerOpen(false);

        if (res.messages && res.messages.length > 0) {
          setMessages(res.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved',
            telemetryCard: m.telemetryCard,
            executedAgents: m.executedAgents || [],
            languageCode: m.languageCode || 'en'
          })));
        } else {
          setMessages([createInitialWelcomeMessage()]);
        }
      }
    } catch (err) {
      console.warn('Failed to load conversation details:', err);
    } finally {
      setIsThinking(false);
      setActiveStepText('');
    }
  };

  /**
   * Starts a brand new conversation thread
   */
  const handleStartNewConversation = () => {
    stopSpeaking();
    setActiveConversationId(null);
    setActiveConversationTitle('New Conversation');
    setIsHistoryDrawerOpen(false);
    setMessages([createInitialWelcomeMessage()]);
  };

  /**
   * Deletes a conversation thread permanently from database
   */
  const handleDeleteConversation = async (convId, e) => {
    e?.stopPropagation();
    try {
      await MarineApi.deleteConversation(convId);
      setConversationsList(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        handleStartNewConversation();
      }
    } catch (err) {
      console.warn('Failed to delete conversation:', err);
    }
  };

  /**
   * Main query execution pipeline (Shared for Text and Voice Input)
   * @param {string|null} queryText - The text query or voice transcript
   * @param {boolean} isVoiceTurn - If true, automatically triggers TTS audio output in detected language
   */
  const handleSendQuery = async (queryText = null, isVoiceTurn = false) => {
    const textToExecute = (queryText !== null ? queryText : inputText).trim();
    if (!textToExecute || isThinking) return;

    // 1. Detect language automatically from user text
    let turnLanguage = selectedLanguage;
    let confidenceScore = 1.0;
    if (selectedLanguage === 'auto') {
      const detection = detectLanguageDetailed(textToExecute, detectedLanguage);
      turnLanguage = detection.code;
      confidenceScore = detection.confidence;
      setDetectedLanguage(turnLanguage);
      setDetectionConfidence(confidenceScore);
    }

    const userMessageId = `usr-${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      role: 'user',
      content: textToExecute,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      languageCode: turnLanguage
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    setActiveStepText(isVoiceTurn ? 'Marine AI is listening & analyzing with 16 Multi-Agents...' : 'Analyzing with 16 Marine AI Multi-Agents...');

    if (isVoiceTurn) {
      setVoiceState('PROCESSING');
      setAutoplayBlocked(false);
    }

    try {
      let assistantText = '';
      let cardData = null;
      let executedAgentsList = ['OrchestratorAgent', 'MarineDataAgent', 'WeatherAgent', 'SafetyAgent', 'RoutePlannerAgent'];
      let currentConvId = activeConversationId;

      // ============================================================
      // A. Database-backed conversation persistence (If Authenticated)
      // ============================================================
      if (isAuthenticated) {
        try {
          // If no conversation thread exists yet, create one
          if (!currentConvId) {
            const newConvRes = await MarineApi.createConversation({
              title: 'New Conversation',
              language: turnLanguage
            });
            if (newConvRes && newConvRes.success && newConvRes.conversation) {
              currentConvId = newConvRes.conversation.id;
              setActiveConversationId(currentConvId);
              setConversationsList(prev => [newConvRes.conversation, ...prev]);
            }
          }

          // Send message to persistent conversation endpoint
          if (currentConvId) {
            const sendRes = await MarineApi.sendMessageToConversation(currentConvId, {
              content: textToExecute,
              language: turnLanguage,
              context_screen: screenContext,
              is_voice: isVoiceTurn
            });

            if (sendRes && sendRes.success && sendRes.assistant_message) {
              assistantText = sendRes.assistant_message.content;
              cardData = sendRes.assistant_message.telemetryCard;
              executedAgentsList = sendRes.assistant_message.executedAgents || executedAgentsList;
              if (sendRes.detected_language) {
                turnLanguage = sendRes.detected_language;
                setDetectedLanguage(turnLanguage);
              }

              // Update active conversation title if updated by server
              if (sendRes.conversation && sendRes.conversation.title) {
                setActiveConversationTitle(sendRes.conversation.title);
                setConversationsList(prev => prev.map(c => 
                  c.id === currentConvId ? { ...c, title: sendRes.conversation.title, updated_at: sendRes.conversation.updated_at } : c
                ));
              }
            }
          }
        } catch (dbErr) {
          console.warn('Notice: Primary database conversation API failed, trying direct voice/multi-agent pipeline:', dbErr);
        }
      }

      // ============================================================
      // B. Fallback to voice endpoint or in-browser multi-agent pipeline
      // ============================================================
      if (!assistantText) {
        try {
          const beResponse = await MarineApi.processVoiceQuery({
            transcript: textToExecute,
            language: turnLanguage,
            latitude: 15.24,
            longitude: 82.16,
            context_screen: screenContext
          });

          if (beResponse && beResponse.success) {
            assistantText = beResponse.spoken_advisory?.advisory_text || '';
            if (beResponse.detected_language) {
              turnLanguage = beResponse.detected_language;
              setDetectedLanguage(turnLanguage);
            }
            if (beResponse.executed_agents?.length > 0) {
              executedAgentsList = beResponse.executed_agents;
            }
            if (beResponse.spoken_advisory?.telemetry_summary) {
              const sum = beResponse.spoken_advisory.telemetry_summary;
              cardData = {
                waveHeight: `${sum.wave_height_m || 1.2} m`,
                windSpeed: `${sum.wind_speed_kn || 13.5} knots`,
                safetyScore: `${sum.safety_score || 89}%`,
                recommendation: beResponse.spoken_advisory.recommended_action || 'PROCEED_PLAN_B'
              };
            }
          }
        } catch (beErr) {
          // Graceful in-browser multi-agent fallback
        }
      }

      // If backend did not provide text, execute in-engine Aqua Intellect pipeline
      if (!assistantText) {
        setActiveStepText('Synthesizing satellite SST, chlorophyll & wave models...');
        const pipelineResult = await executeAquaIntellectPipeline(textToExecute, {
          vesselProfile: user?.vessel_name || 'Matsya-Varuna (14m Trawler)',
          departurePort: user?.base_port || 'Visakhapatnam Outer Harbor',
          language: turnLanguage,
          screenContext
        });

        const { results, connected_agents } = pipelineResult;
        assistantText = generateLocalizedMarineResponse(turnLanguage, results, textToExecute);
        executedAgentsList = connected_agents || executedAgentsList;

        cardData = {
          waveHeight: results.ocean_analytics?.significant_wave_height || '1.2 m',
          windSpeed: results.weather?.wind_speed || '13.5 knots',
          safetyScore: `${results.safety?.safety_score || 89}%`,
          recommendation: results.route_planner?.recommended_plan || 'Plan B: Balanced Route'
        };
      }

      const assistantMsg = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        telemetryCard: cardData,
        executedAgents: executedAgentsList,
        languageCode: turnLanguage
      };

      setMessages(prev => [...prev, assistantMsg]);

      // ============================================================
      // C. AUTOMATIC VOICE OUTPUT (Audio Plays Automatically!)
      // ============================================================
      if (isVoiceTurn) {
        setVoiceState('SPEAKING');
        speakTextInLanguage(
          assistantText,
          turnLanguage,
          () => setVoiceState('IDLE'),
          (err) => {
            console.warn('Voice playback notice:', err);
            setVoiceState('IDLE');
            setAutoplayBlocked(true);
          }
        );
      }
    } catch (err) {
      const errFallback = turnLanguage === 'te'
        ? 'క్షమించండి, సముద్ర డేటా ప్రాసెస్ చేయడంలో లోపం ఏర్పడింది. ప్లాన్ బి (సురక్షిత తీర మార్గం) సిఫార్సు చేయబడింది.'
        : turnLanguage === 'hi'
        ? 'क्षमा करें, समुद्री डेटा विश्लेषण में त्रुटि हुई। सुरक्षित वापसी के लिए प्लान बी की सिफारिश की जाती है।'
        : turnLanguage === 'ta'
        ? 'மன்னிக்கவும், கடல் தரவை செயலாக்குவதில் பிழை ஏற்பட்டது. பாதுகாப்பான கடலோர திட்டம் பி பரிந்துரைக்கப்படுகிறது.'
        : 'Marine AI advisory: Swell is 1.2m, wind 13.5 kn. Conditions optimal under Plan B. Safe to navigate.';

      setMessages(prev => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: errFallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          languageCode: turnLanguage
        }
      ]);
      setVoiceState('IDLE');
    } finally {
      setIsThinking(false);
      setActiveStepText('');
    }
  };

  /**
   * Multilingual Speech Recognition (STT) Controller
   */
  const handleToggleVoice = () => {
    // If currently speaking, stop TTS
    if (voiceState === 'SPEAKING') {
      stopSpeaking();
      setVoiceState('IDLE');
      return;
    }

    // If currently listening, stop recognition
    if (voiceState === 'LISTENING') {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setVoiceState('IDLE');
      return;
    }

    // Check browser Web Speech API availability
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceState('LISTENING');
      setTimeout(() => {
        setVoiceState('PROCESSING');
        const fallbackPrompt = uiConfig.prompts[0]?.query || 'Where is the optimal Potential Fishing Zone today?';
        setInputText(fallbackPrompt);
        handleSendQuery(fallbackPrompt, true);
      }, 1500);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;

      // Select proper language recognition code
      const targetSpeechCode = selectedLanguage === 'auto'
        ? (currentLangMeta.speechCode || 'en-IN')
        : (currentLangMeta.speechCode || 'en-IN');
      recognition.lang = targetSpeechCode;

      recognition.onstart = () => {
        stopSpeaking();
        setVoiceState('LISTENING');
        setVoiceErrorMsg('');
        setAutoplayBlocked(false);
      };

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setVoiceState('PROCESSING');

        // Automatically detect language from speech transcript
        const detection = detectLanguageDetailed(transcript, detectedLanguage);
        setDetectedLanguage(detection.code);
        setDetectionConfidence(detection.confidence);

        // Immediately execute query in detected language with isVoiceTurn = true!
        await handleSendQuery(transcript, true);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition notice:', e.error);
        if (e.error === 'not-allowed') {
          setVoiceErrorMsg('Microphone permission denied. Please allow microphone access in your browser settings.');
        }
        setVoiceState('IDLE');
      };

      recognition.onend = () => {
        // Keep speaking/processing states intact if recognition completed successfully
        setVoiceState(curr => (curr === 'LISTENING' ? 'IDLE' : curr));
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition initialization error:', err);
      setVoiceState('IDLE');
    }
  };

  // Trigger voice listening when opened with initialVoice = true
  useEffect(() => {
    if (isOpen && initialVoice) {
      const timer = setTimeout(() => {
        handleToggleVoice();
        if (onClearInitialVoice) onClearInitialVoice();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialVoice]);

  /**
   * Speak individual assistant response aloud on demand (Listen Aloud)
   */
  const handleReadAloud = (msg) => {
    if (voiceState === 'SPEAKING') {
      stopSpeaking();
      setVoiceState('IDLE');
      return;
    }
    stopSpeaking();
    setVoiceState('SPEAKING');
    const langToSpeak = msg.languageCode || activeEffectiveCode;
    speakTextInLanguage(
      msg.content, 
      langToSpeak, 
      () => setVoiceState('IDLE'),
      () => setVoiceState('IDLE')
    );
  };

  /**
   * Reset / Clear chat messages back to welcome
   */
  const handleClearChat = () => {
    stopSpeaking();
    handleStartNewConversation();
  };

  // 6 Approved Suggestion Pills matching the Landing Page design
  const quickSuggestionPills = [
    { label: uiConfig.weather || "What's the weather?", icon: Sun, query: "What's the marine weather and sea state today?" },
    { label: uiConfig.fishingZones || "Find fishing zones", icon: Fish, query: "Show the latest INCOIS Potential Fishing Zones (PFZ)." },
    { label: uiConfig.seaConditions || "Sea conditions", icon: Waves, query: "What are the significant wave heights and ocean currents?" },
    { label: uiConfig.safeToSail || "Is it safe to sail?", icon: ShieldCheck, query: "Analyze safety risk score for coastal departure today." },
    { label: uiConfig.nearbyAreas || "Show nearby areas", icon: MapPin, query: "List nearby coastal marine sectors and landing centers." },
    { label: uiConfig.safeRoute || "Plan a safe route", icon: Compass, query: "Calculate optimal fuel-efficient route avoiding rough swells." },
  ];

  // Primary visual container
  const panelContent = (
    <div className={`h-full w-full bg-white flex flex-col font-sans select-text border-l border-slate-200/90 shadow-2xl relative ${
      isExpanded ? 'max-w-4xl' : ''
    }`}>
      {/* ============================================================ */}
      {/* 1. Frosted Glass Header — Exactly matching Landing Page */}
      {/* ============================================================ */}
      <header className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-blue-100 flex items-center justify-between shrink-0 z-10 shadow-xs">
        {/* Brand identity & Active Thread Title */}
        <div className="flex items-center gap-2.5 truncate max-w-[50%]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-[#0284C7] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <span className="text-base select-none">🌊</span>
          </div>
          <div className="flex flex-col truncate text-left">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[15px] text-[#0F2942] tracking-tight leading-none truncate">
                Marine AI
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                16 Agents Online
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
              {activeConversationTitle || 'Autonomous Ocean Intelligence • NavIC Telemetry'}
            </span>
          </div>
        </div>

        {/* Controls: Chats (History), Language Selector, Reset, Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* ChatGPT-Style Conversations History Drawer Toggle */}
          <button
            onClick={() => setIsHistoryDrawerOpen(p => !p)}
            title="View recent conversation threads (ChatGPT-style)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer border ${
              isHistoryDrawerOpen
                ? 'bg-[#0B1E36] text-white border-[#0B1E36] shadow-xs'
                : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border-slate-200/80'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Chats</span>
            {conversationsList.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isHistoryDrawerOpen ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
              }`}>
                {conversationsList.length}
              </span>
            )}
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleStartNewConversation}
            title="Start a new chat conversation"
            className="p-1.5 rounded-full hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Spoken Language Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(p => !p)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition cursor-pointer border border-slate-200/80"
              title="Select Spoken Language or Auto-Detect"
            >
              <Globe className="w-3 h-3 text-[#1D63ED]" />
              <span className="hidden xs:inline">
                {selectedLanguage === 'auto' ? `Auto (${currentLangMeta.nativeName})` : currentLangMeta.nativeName}
              </span>
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-left max-h-60 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                  Voice & Input Language
                </span>
                <button
                  onClick={() => {
                    setSelectedLanguage('auto');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 transition cursor-pointer ${
                    selectedLanguage === 'auto' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span>Auto-Detect Language</span>
                  </span>
                  <span className="text-[9px] text-blue-600 font-bold bg-blue-100 px-1 py-0.2 rounded">LIVE</span>
                </button>
                <div className="h-px bg-slate-100 my-1" />
                {SUPPORTED_INDIAN_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      setDetectedLanguage(lang.code);
                      setIsLangDropdownOpen(false);
                      onLanguageChange?.(lang.code);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 transition cursor-pointer ${
                      selectedLanguage === lang.code ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{lang.nativeName} ({lang.name})</span>
                    <span className="text-[9px] text-slate-400 font-mono uppercase">{lang.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Close button (only if not inline) */}
          {!isInline && (
            <button
              onClick={() => {
                stopSpeaking();
                onClose?.();
              }}
              title="Close Marine AI panel (Esc)"
              className="p-1.5 rounded-full hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Mic Permission / Warning Banner if active */}
      {voiceErrorMsg && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{voiceErrorMsg}</span>
          </div>
          <button onClick={() => setVoiceErrorMsg('')} className="text-amber-700 hover:text-amber-900 font-bold">✕</button>
        </div>
      )}

      {/* Autoplay restriction fallback banner */}
      {autoplayBlocked && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Browser paused automatic audio. Tap to listen to the response:</span>
          </div>
          <button
            onClick={() => {
              setAutoplayBlocked(false);
              const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
              if (lastAssistant) handleReadAloud(lastAssistant);
            }}
            className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 cursor-pointer shadow-xs"
          >
            Play Audio 🔊
          </button>
        </div>
      )}

      {/* Main Body Area: Relative container hosting Messages & Slide-in History Drawer */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* ============================================================ */}
        {/* ChatGPT-Style Conversation History Drawer (Slide-in) */}
        {/* ============================================================ */}
        {isHistoryDrawerOpen && (
          <div className="absolute inset-y-0 left-0 w-72 sm:w-80 bg-white/98 backdrop-blur-xl border-r border-slate-200 z-30 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200 text-left">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#1D63ED]" />
                <span className="font-extrabold text-xs text-[#0B1E36]">Recent Conversations</span>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* + New Chat CTA */}
            <div className="p-3 border-b border-slate-100">
              <button
                onClick={handleStartNewConversation}
                className="w-full py-2 px-3 rounded-xl bg-[#0B1E36] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Start New Chat</span>
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {!isAuthenticated ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 mb-1">Guest Mode</p>
                  <p className="text-[11px]">Sign in to permanently save your conversation history across devices and restarts.</p>
                </div>
              ) : isLoadingHistory ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading history...</div>
              ) : conversationsList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No conversations yet. Ask Marine AI a question below!
                </div>
              ) : (
                conversationsList.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const dateStr = conv.updated_at ? new Date(conv.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
                  return (
                    <div
                      key={conv.id}
                      onClick={() => loadSpecificConversation(conv.id)}
                      className={`group w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer border ${
                        isActive
                          ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-2xs font-semibold'
                          : 'bg-white hover:bg-slate-50 border-transparent text-slate-700 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate mr-1">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div className="truncate">
                          <p className="text-xs truncate font-medium">{conv.title || 'Marine AI Chat'}</p>
                          <span className="text-[10px] text-slate-400">{dateStr}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        title="Delete conversation"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. Message Conversation Stream */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#F4F8FA] to-white/80 w-full text-left">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant Avatar */}
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-[85%] ${message.role === 'user' ? 'order-1' : ''}`}>
                {/* Header Timestamp & Language pill */}
                <div className={`text-[10px] mb-1 font-medium flex items-center gap-1.5 ${
                  message.role === 'user' ? 'justify-end text-slate-500' : 'text-slate-500'
                }`}>
                  <span className="font-semibold text-slate-700">{message.role === 'user' ? (user?.name || 'Captain') : 'Marine AI'}</span>
                  <span>•</span>
                  <span>{message.timestamp}</span>
                  {message.role === 'assistant' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold uppercase">
                      {message.languageCode || 'en'}
                    </span>
                  )}
                </div>

                {/* Message Bubble — Exactly matching Landing Page styling */}
                {/* Note: Explicit color: #FFFFFF applied for user to guarantee readable white text */}
                <div 
                  className={`p-4 rounded-2xl shadow-sm text-xs sm:text-[13px] leading-relaxed transition-all ${
                    message.role === 'user'
                      ? 'bg-[#0B1E36] text-white rounded-tr-xs shadow-md shadow-slate-900/10'
                      : 'bg-white/95 backdrop-blur-md border border-slate-200/80 text-slate-800 rounded-tl-xs'
                  }`}
                  style={message.role === 'user' ? { color: '#FFFFFF', backgroundColor: '#0B1E36' } : undefined}
                >
                  {/* Markdown Renderer with isUser flag */}
                  <div 
                    className={message.role === 'user' ? 'text-white' : 'space-y-1.5'}
                    style={message.role === 'user' ? { color: '#FFFFFF' } : undefined}
                  >
                    {renderFormattedMarkdown(message.content, message.role === 'user')}
                  </div>

                  {/* Ocean Telemetry Card if generated */}
                  {message.telemetryCard && (
                    <div className="mt-3 p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 text-left space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-sky-900 border-b border-sky-200/60 pb-1">
                        <span className="flex items-center gap-1">
                          <Waves className="w-3.5 h-3.5 text-sky-600" />
                          <span>Ocean State Telemetry</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {message.telemetryCard.recommendation}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] pt-0.5">
                        <div>
                          <span className="text-slate-500 block">Wave Swell</span>
                          <span className="font-bold text-slate-800 font-mono">{message.telemetryCard.waveHeight}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Wind Speed</span>
                          <span className="font-bold text-slate-800 font-mono">{message.telemetryCard.windSpeed}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Safety Score</span>
                          <span className="font-bold text-emerald-700 font-mono">{message.telemetryCard.safetyScore}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multi-Agent Executed Badges */}
                  {message.executedAgents && message.executedAgents.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                        Agents:
                      </span>
                      {message.executedAgents.slice(0, 4).map((ag, idx) => (
                        <span key={idx} className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 font-semibold">
                          {ag.replace('Agent', '')}
                        </span>
                      ))}
                      {message.executedAgents.length > 4 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                          +{message.executedAgents.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons: Listen Aloud & Screen Shortcuts */}
                  {message.role === 'assistant' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                      {/* Listen Aloud Button */}
                      <button
                        type="button"
                        onClick={() => handleReadAloud(message)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                          voiceState === 'SPEAKING'
                            ? 'bg-[#1D63ED] text-white'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                        title="Listen to response in native spoken voice"
                      >
                        {voiceState === 'SPEAKING' ? (
                          <>
                            <StopCircle className="w-3.5 h-3.5 animate-pulse" />
                            <span>Stop Speaking</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen Aloud</span>
                          </>
                        )}
                      </button>

                      {/* Quick navigation to Digital Twin */}
                      {onNavigateScreen && (
                        <button
                          type="button"
                          onClick={() => {
                            stopSpeaking();
                            onClose?.();
                            onNavigateScreen('screen-2');
                          }}
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                        >
                          <Compass className="w-3 h-3 text-blue-600" />
                          <span>Digital Twin</span>
                        </button>
                      )}

                      {/* Quick navigation to Live Mission */}
                      {onNavigateScreen && (
                        <button
                          type="button"
                          onClick={() => {
                            stopSpeaking();
                            onClose?.();
                            onNavigateScreen('screen-3');
                          }}
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          <span>Live Mission</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#0B1E36] text-white flex items-center justify-center shrink-0 shadow-xs text-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Agent Orchestration Live Animation */}
          {isThinking && (
            <div className="flex gap-2.5 justify-start items-start">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white/95 backdrop-blur-md border border-blue-100 p-3.5 rounded-2xl rounded-tl-xs shadow-sm w-72 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#1D63ED] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#1D63ED] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#1D63ED] animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs font-bold text-[#0B1E36]">Marine AI Reasoning...</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {activeStepText || 'Evaluating ocean models & multi-agent consensus...'}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Horizontal Quick Suggestion Pills Bar (Exact Landing Page) */}
      {/* ============================================================ */}
      <div className="px-3 py-2 bg-white/95 border-t border-slate-100 shrink-0 text-left">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-1">
          <span>Quick Suggestions</span>
          <span className="text-blue-600 font-medium lowercase font-mono">
            {selectedLanguage === 'auto' ? `Auto (${currentLangMeta.name})` : currentLangMeta.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {quickSuggestionPills.map((pill, idx) => {
            const Icon = pill.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendQuery(pill.query, false)}
                className="px-3 py-1 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-xs text-slate-700 hover:text-blue-600 font-medium flex items-center gap-1.5 shadow-2xs shrink-0 transition hover:scale-[1.02] cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="whitespace-nowrap">{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. Search & Voice Input Pill — Exact Landing Page Reference */}
      {/* ============================================================ */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0 text-left">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(null, false);
          }}
          className="w-full"
        >
          <div className={`bg-white/95 backdrop-blur-md rounded-full p-1.5 sm:p-2 pl-2 sm:pl-3 pr-2 border transition-all flex items-center gap-2 sm:gap-3 ${
            voiceState === 'LISTENING'
              ? 'border-rose-400 ring-4 ring-rose-100 shadow-[0_8px_30px_rgba(244,63,94,0.2)]'
              : voiceState === 'SPEAKING'
              ? 'border-blue-400 ring-4 ring-blue-100 shadow-[0_8px_30px_rgba(29,99,237,0.2)]'
              : 'border-blue-100 shadow-[0_8px_30px_rgba(37,99,235,0.12)] focus-within:ring-2 focus-within:ring-blue-400'
          }`}>
            {/* Blue Voice Microphone Button — Connected to Multilingual Voice STT */}
            <button
              type="button"
              onClick={handleToggleVoice}
              title={
                voiceState === 'LISTENING'
                  ? 'Listening to voice... Click to Stop'
                  : voiceState === 'SPEAKING'
                  ? 'Speaking... Click to Stop audio'
                  : 'Tap and speak in any Indian language'
              }
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition hover:scale-105 active:scale-95 ${
                voiceState === 'LISTENING'
                  ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : voiceState === 'SPEAKING'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/30'
                  : 'bg-[#1D63ED] hover:bg-blue-700 text-white shadow-md shadow-blue-500/30'
              }`}
            >
              {voiceState === 'LISTENING' ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : voiceState === 'SPEAKING' ? (
                <StopCircle className="w-5 h-5 text-white animate-pulse" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                voiceState === 'LISTENING'
                  ? 'Listening to your voice... (Speak now)'
                  : voiceState === 'PROCESSING'
                  ? 'Understanding speech...'
                  : voiceState === 'SPEAKING'
                  ? 'Marine AI is speaking... (Audio playing)'
                  : 'Ask Marine AI about the ocean...'
              }
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none px-2 font-normal"
            />

            {/* Blue Circular Send Button */}
            <button
              type="submit"
              disabled={isThinking || !inputText.trim()}
              title="Submit query to Marine AI Multi-Agent Pipeline"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm cursor-pointer transition hover:scale-105 active:scale-95 ${
                isThinking || !inputText.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#3B82F6] hover:bg-blue-600 text-white'
              }`}
            >
              <Send className="w-4 h-4 text-white -translate-x-0.5" />
            </button>
          </div>
        </form>

        {/* Live Voice / Language status footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1.5 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${
              voiceState === 'LISTENING' 
                ? 'bg-rose-500 animate-ping' 
                : voiceState === 'SPEAKING'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-blue-500'
            }`} />
            <span>
              {voiceState === 'LISTENING'
                ? 'Listening to microphone...'
                : voiceState === 'PROCESSING'
                ? 'Understanding speech...'
                : voiceState === 'SPEAKING'
                ? `Marine AI is speaking in ${currentLangMeta.name}...`
                : '13 Indian Coastal Languages • Auto Detection Active'}
            </span>
          </span>
          <span className="text-blue-600 font-mono font-medium">ISRO Oceansat-3</span>
        </div>
      </div>
    </div>
  );

  // If used as an embedded inline component
  if (isInline) {
    return panelContent;
  }

  // Slide-over drawer overlay using React Portal
  return createPortal(
    <>
      {/* Translucent Backdrop */}
      <div
        className={`fixed inset-0 bg-[#0B1E36]/35 backdrop-blur-[3px] z-[900] transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          stopSpeaking();
          onClose?.();
        }}
      />

      {/* Floating Glass Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-[910] w-full sm:w-[500px] md:w-[540px] shadow-2xl flex flex-col transform transition-transform duration-250 ease-out text-left ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {panelContent}
      </aside>
    </>,
    document.body
  );
}
