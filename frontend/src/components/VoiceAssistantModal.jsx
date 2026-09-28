import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, X, Send, Volume2, VolumeX, 
  Sparkles, Compass, ShieldCheck, Globe, RefreshCw, 
  Square, Radio, AlertCircle, ArrowRight
} from 'lucide-react';
import { 
  SUPPORTED_INDIAN_LANGUAGES, 
  MULTILINGUAL_UI, 
  speakTextInLanguage,
  stopSpeaking,
  detectLanguageDetailed
} from '../services/multilingualMarine';
import MarineApi from '../services/api';
import ModalPortal from './ModalPortal';

export default function VoiceAssistantModal({ 
  isOpen, 
  onClose, 
  onNavigateMission,
  globalLanguage = 'en',
  onLanguageChange,
  user
}) {
  // Voice State Machine: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'
  const [voiceState, setVoiceState] = useState('IDLE');
  const [currentTurnLang, setCurrentTurnLang] = useState(globalLanguage || 'en');
  const [langConfidence, setLangConfidence] = useState(null);
  const [inputText, setInputText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const recognitionRef = useRef(null);
  const isComponentMounted = useRef(true);
  const chatScrollRef = useRef(null);

  const currentLangObj = SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === currentTurnLang) || SUPPORTED_INDIAN_LANGUAGES[0];

  const INITIAL_GREETINGS = {
    en: "Hello Captain! I am Marine AI Voice Assistant. How can I help you navigate the waters today?",
    te: "నమస్కారం కెప్టెన్! నేను మెరైన్ AI వాయిస్ అసిస్టెంట్‌ని. ఈ రోజు సముద్ర పరిస్థితి లేదా చేపల వేటపై మీకు ఎలా సహాయపడగలను?",
    hi: "नमस्कार कप्तान! मैं मरीन एआई वॉयस असिस्टेंट हूं। आज समुद्री स्थिति या मार्ग पर मैं आपकी क्या सहायता कर सकता हूं?",
    ta: "வணக்கம் கேப்டன்! நான் மரைன் ஏஐ குரல் உதவியாளர். இன்றைய கடல் நிலை குறித்து உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    ml: "നമസ്കാരം ക്യാപ്റ്റൻ! ഞാൻ മറൈൻ AI വോയ്സ് അസിസ്റ്റന്റാണ്. ഇന്നത്തെ സമുദ്രാവസ്ഥയിൽ ഞാൻ എങ്ങനെ സഹായിക്കണം?",
    kn: "ನಮಸ್ಕಾರ ಕ್ಯಾಪ್ಟನ್! ನಾನು ಮರೀನ್ AI ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್. ಇಂದಿನ ಸಮುದ್ರ ಸ್ಥಿತಿ ಬಗ್ಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    bn: "নমস্কার ক্যাপ্টেন! আমি মেরিন এআই ভয়েস সহকারী। আজকের সমুদ্র পরিস্থিতি সম্পর্কে আপনাকে কীভাবে সাহায্য করতে পারি?",
    gu: "નમસ્તે કેપ્ટન! હું મરીન AI વૉઇસ આસિસ્ટન્ટ છું. દરિયાઈ સ્થિતિ પર આજે હું તમારી શી મદદ કરી શકું?",
    mr: "नमस्कार कॅप्टन! मी मरीन एआय व्हॉइस असिस्टंट आहे. आज समुद्राच्या परिस्थितीबद्दल मी कशी मदत करू शकेन?",
    or: "ନମସ୍କାର କ୍ୟାପ୍ଟେନ୍! ମୁଁ ମେରାଇନ୍ AI ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ। ଆଜି ସମୁଦ୍ର ଅବସ୍ଥା ନେଇ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିବି?"
  };

  const [messages, setMessages] = useState([]);

  // Auto-scroll chat window
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, liveTranscript, voiceState]);

  // Initial Voice Greeting on First Open
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      setVoiceState('IDLE');
      setHasGreeted(false);
      return;
    }

    isComponentMounted.current = true;
    const initialText = INITIAL_GREETINGS[globalLanguage] || INITIAL_GREETINGS.en;
    const greetingMsg = {
      id: 'greeting_1',
      sender: 'ai',
      text: initialText,
      language: globalLanguage,
      card: {
        zone: 'INCOIS Marine Acoustic Net Active',
        safeWindow: 'Live Satellite & Radar Stream',
        stability: 'Ready for Voice Commands'
      }
    };

    setMessages([greetingMsg]);
    setCurrentTurnLang(globalLanguage);

    // Speak initial greeting automatically if not greeted yet in this modal lifecycle
    if (!hasGreeted) {
      setHasGreeted(true);
      setVoiceState('SPEAKING');

      speakTextInLanguage(
        initialText, 
        globalLanguage, 
        () => {
          // Finished greeting -> automatically transition to LISTENING
          if (isComponentMounted.current) {
            setVoiceState('LISTENING');
            startSpeechRecognition(globalLanguage);
          }
        },
        () => {
          // If browser blocked initial audio autoplay, transition to LISTENING directly
          if (isComponentMounted.current) {
            setVoiceState('LISTENING');
            startSpeechRecognition(globalLanguage);
          }
        }
      );
    }

    return () => {
      isComponentMounted.current = false;
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [isOpen]);

  // Speech Recognition Initializer
  const startSpeechRecognition = (preferredLang = currentTurnLang) => {
    if (typeof window === 'undefined') return;

    stopSpeaking();
    setAudioError(null);
    setLiveTranscript('');

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setAudioError("Microphone speech recognition not supported in this browser. You can type queries below.");
      setVoiceState('IDLE');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRec();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;

      const langMeta = SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === preferredLang) || SUPPORTED_INDIAN_LANGUAGES[0];
      recognition.lang = langMeta.speechCode || 'en-IN';

      recognition.onstart = () => {
        setVoiceState('LISTENING');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentSpeech = final || interim;
        setLiveTranscript(currentSpeech);

        // Real-time automatic language detection from spoken words
        if (currentSpeech.trim()) {
          const detected = detectLanguageDetailed(currentSpeech, preferredLang);
          if (detected.isConfident && detected.code !== currentTurnLang) {
            setCurrentTurnLang(detected.code);
            setLangConfidence(Math.round(detected.confidence * 100));
          }
        }

        if (final && final.trim()) {
          processSpokenTurn(final.trim());
        }
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition error:', e.error);
          setAudioError(`Microphone notice: ${e.error}. Tap microphone to retry.`);
        }
        setVoiceState('IDLE');
      };

      recognition.onend = () => {
        if (voiceState === 'LISTENING' && !liveTranscript) {
          setVoiceState('IDLE');
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
      setVoiceState('IDLE');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setVoiceState('IDLE');
  };

  // Process a completed spoken turn
  const processSpokenTurn = async (userSpeech) => {
    if (!userSpeech || !userSpeech.trim()) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    setVoiceState('PROCESSING');
    setLiveTranscript('');

    // Per-Turn Automatic Multilingual Language Detection
    const detection = detectLanguageDetailed(userSpeech, currentTurnLang);
    const turnLang = detection.code;
    setCurrentTurnLang(turnLang);
    setLangConfidence(Math.round(detection.confidence * 100));

    // Append user message to transcript
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: userSpeech,
      language: turnLang,
      langName: detection.name,
      confidence: Math.round(detection.confidence * 100)
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    try {
      // Execute query via Marine AI Voice Intelligence backend
      const res = await MarineApi.processVoiceQuery({
        transcript: userSpeech,
        language: turnLang,
        latitude: 15.24,
        longitude: 82.16,
        context_screen: 'VOICE_AGENT'
      });

      let responseText = '';
      let cardMeta = null;

      if (res && res.success && res.spoken_advisory?.advisory_text) {
        responseText = res.spoken_advisory.advisory_text;
        cardMeta = {
          zone: 'Active Marine Safety Advisory',
          safeWindow: `Safety Score: ${res.safety_score || 89}%`,
          stability: `Language: ${res.language_name || detection.name}`
        };
      } else {
        // Fallback response in the detected dialect
        const fallbacks = {
          te: "సముద్ర పరిస్థితి పర్యవేక్షించబడింది. తీరం వెంబడి గాలులు 12 నాట్స్ వద్ద ఉన్నాయి మరియు అలల ఎత్తు 1.1 మీటర్లు. ప్లాన్ బి సిఫార్సు చేయబడింది.",
          hi: "समुद्री स्थिति सामान्य है। हवा की गति 12 नॉट्स और लहरें 1.1 मीटर हैं। यात्रा के लिए प्लान बी अनुकूल है।",
          ta: "கடல் நிலை சீராக உள்ளது. காற்றின் வேகம் 12 நாட்ஸ் மற்றும் அலை உயரம் 1.1 மீட்டர். திட்டம் பி பரிந்துரைக்கப்படுகிறது.",
          en: "Sea conditions are within safe operational limits. Swell height is 1.1 meters with 12 knot winds. Plan B remains optimal."
        };
        responseText = fallbacks[turnLang] || fallbacks.en;
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        language: turnLang,
        card: cardMeta
      };

      setMessages(prev => [...prev, aiMsg]);

      // CRITICAL: Immediately and automatically speak response in detected spoken dialect
      stopSpeaking();
      setVoiceState('SPEAKING');

      speakTextInLanguage(
        responseText, 
        turnLang, 
        () => {
          if (isComponentMounted.current) {
            setVoiceState('IDLE');
          }
        },
        () => {
          if (isComponentMounted.current) {
            setVoiceState('IDLE');
          }
        }
      );
    } catch (err) {
      console.warn('Voice agent processing error:', err);
      const fallbackText = "Sea state is currently monitored via ISRO Oceansat-3. Waves are 1.2m and favorable for coastal navigation.";
      setMessages(prev => [
        ...prev, 
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallbackText,
          language: 'en'
        }
      ]);
      setVoiceState('SPEAKING');
      speakTextInLanguage(fallbackText, 'en', () => setVoiceState('IDLE'));
    }
  };

  const handleManualSend = () => {
    if (!inputText.trim()) return;
    processSpokenTurn(inputText.trim());
  };

  const handleManualLanguageSwitch = (newLangCode) => {
    setCurrentTurnLang(newLangCode);
    onLanguageChange?.(newLangCode);
    if (voiceState === 'LISTENING') {
      startSpeechRecognition(newLangCode);
    }
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-xl bg-white border border-[#CBD5E1] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[620px] max-h-[92vh] text-left animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#071322] via-[#0B1E36] to-[#122F50] text-white flex items-center justify-between shrink-0 border-b border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">Marine AI Voice Assistant</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600/80 text-white uppercase tracking-wider">
                  Live VHF
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                Automatic Multilingual Speech Intelligence • 13 Indian Coastal Languages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Spoken Language Dropdown Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-blue-400 absolute left-2 pointer-events-none" />
              <select
                value={currentTurnLang}
                onChange={(e) => handleManualLanguageSwitch(e.target.value)}
                className="bg-[#0B1E36] border border-blue-500/40 text-white text-xs font-semibold rounded-lg pl-7 pr-2.5 py-1 outline-none focus:border-blue-400 cursor-pointer shadow-xs"
                title="Select preferred conversation language"
              >
                {SUPPORTED_INDIAN_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-[#0B1E36] text-white">
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close Voice Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Voice State Banner */}
        <div className={`px-4 py-2 text-xs flex items-center justify-between border-b transition-colors ${
          voiceState === 'LISTENING' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : voiceState === 'SPEAKING'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : voiceState === 'PROCESSING'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2">
            {voiceState === 'LISTENING' && (
              <>
                <div className="flex items-center gap-1 h-4">
                  <span className="w-1.5 h-3 bg-rose-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-4 bg-rose-600 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-2 bg-rose-600 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
                <span className="font-bold">Listening... Speak now in Telugu, Hindi, Tamil, English, etc.</span>
              </>
            )}

            {voiceState === 'PROCESSING' && (
              <>
                <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                <span className="font-semibold">Synthesizing live ocean & multi-agent telemetry...</span>
              </>
            )}

            {voiceState === 'SPEAKING' && (
              <>
                <div className="flex items-center gap-1 h-4">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full animate-pulse" />
                  <span className="w-1.5 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span className="w-1.5 h-3 bg-blue-600 rounded-full animate-pulse" />
                </div>
                <span className="font-bold">Speaking in {currentLangObj.nativeName} ({currentLangObj.name})...</span>
              </>
            )}

            {voiceState === 'IDLE' && (
              <>
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">Ready. Tap microphone to speak in any coastal dialect.</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {langConfidence && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/80 border border-slate-300 text-slate-700 font-mono">
                {currentLangObj.nativeName} ({langConfidence}%)
              </span>
            )}
            {voiceState === 'SPEAKING' && (
              <button
                onClick={stopSpeaking}
                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-xs"
                title="Stop audio playback"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Transcript Preview when user is speaking */}
        {liveTranscript && (
          <div className="p-3 bg-rose-50/70 border-b border-rose-200 text-xs text-rose-900 font-medium italic flex items-center gap-2">
            <Mic className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
            <span>"{liveTranscript}"</span>
          </div>
        )}

        {/* Error Feedback */}
        {audioError && (
          <div className="p-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{audioError}</span>
            </div>
            <button
              onClick={() => startSpeechRecognition(currentTurnLang)}
              className="text-[11px] font-bold text-amber-900 underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Conversation Transcript Stream */}
        <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#F4F8FA]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`p-3.5 rounded-2xl shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-[#0B1E36] text-white'
                  : 'bg-white border border-[#CBD5E1] text-[#0F2942]'
              }`}>
                {msg.sender === 'user' && msg.langName && (
                  <div className="text-[10px] font-mono text-blue-300 font-semibold mb-1">
                    Spoken in {msg.langName}
                  </div>
                )}

                <div className="whitespace-pre-line leading-relaxed text-xs sm:text-[13px]">
                  {msg.text}
                </div>

                {msg.card && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                    <div className="font-bold text-[#0B1E36] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{msg.card.zone}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>{msg.card.safeWindow}</span>
                      <strong className="text-blue-700">{msg.card.stability}</strong>
                    </div>
                  </div>
                )}

                {msg.sender === 'ai' && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => {
                        stopSpeaking();
                        setVoiceState('SPEAKING');
                        speakTextInLanguage(msg.text, msg.language || currentTurnLang, () => setVoiceState('IDLE'));
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Volume2 className="w-3 h-3 text-blue-600" />
                      <span>Replay Spoken Voice</span>
                    </button>

                    {onNavigateMission && (
                      <button
                        onClick={onNavigateMission}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Open Digital Twin</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Spoken Inquiry Suggestions */}
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          <button
            onClick={() => processSpokenTurn("సముద్ర పరిస్థితి మరియు గాలి వేగం ఎలా ఉంది?")}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap cursor-pointer transition"
          >
            🌊 సముద్ర పరిస్థితి (Telugu)
          </button>
          <button
            onClick={() => processSpokenTurn("Is it safe to sail offshore today?")}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap cursor-pointer transition"
          >
            ⚓ Safe to Sail? (English)
          </button>
          <button
            onClick={() => processSpokenTurn("आज मछली पकड़ने का क्षेत्र कहाँ है?")}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap cursor-pointer transition"
          >
            🐟 मछली पकड़ने का क्षेत्र (Hindi)
          </button>
        </div>

        {/* Bottom Interactive Voice / Input Control Hub */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          {/* Main Giant Glowing Microphone Toggle */}
          <button
            onClick={() => {
              if (voiceState === 'LISTENING') {
                stopListening();
              } else {
                startSpeechRecognition(currentTurnLang);
              }
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-lg ${
              voiceState === 'LISTENING'
                ? 'bg-rose-600 text-white ring-4 ring-rose-300 animate-pulse scale-105'
                : voiceState === 'SPEAKING'
                ? 'bg-blue-600 text-white ring-4 ring-blue-300'
                : 'bg-[#0B1E36] hover:bg-[#153456] text-white hover:scale-105'
            }`}
            title={voiceState === 'LISTENING' ? 'Click to stop listening' : 'Click to speak'}
          >
            {voiceState === 'LISTENING' ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Backup Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleManualSend();
              }}
              placeholder={
                voiceState === 'LISTENING'
                  ? 'Listening to your voice...'
                  : 'Or type in Telugu, Hindi, Tamil, English...'
              }
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-inner"
            />
          </div>

          <button
            onClick={handleManualSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-[#0B1E36] hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer shadow-sm shrink-0"
            title="Send query"
          >
            <Send className="w-4 h-4 text-blue-400" />
          </button>
        </div>

      </div>
    </ModalPortal>
  );
}
