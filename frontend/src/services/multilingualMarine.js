/**
 * Multilingual Marine Intelligence Service
 * Supporting 12+ Indian Coastal & National Languages
 * Designed for Indian Fishermen, Vessel Masters, and Coast Guard Operators
 */

export const SUPPORTED_INDIAN_LANGUAGES = [
  {
    code: 'en',
    speechCode: 'en-IN',
    name: 'English',
    nativeName: 'English',
    region: 'Maritime Standard / Pan-India',
    flag: '🇮🇳'
  },
  {
    code: 'hi',
    speechCode: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'National Official / Coast Guard',
    flag: '🇮🇳'
  },
  {
    code: 'te',
    speechCode: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'Andhra Pradesh & Telangana Coast',
    flag: '🌊'
  },
  {
    code: 'ta',
    speechCode: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'Tamil Nadu & Puducherry Coast',
    flag: '⚓'
  },
  {
    code: 'ml',
    speechCode: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    region: 'Kerala & Lakshadweep Coast',
    flag: '🌴'
  },
  {
    code: 'kn',
    speechCode: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    region: 'Karnataka Coastal Belt (Mangaluru/Karwar)',
    flag: '🚢'
  },
  {
    code: 'mr',
    speechCode: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    region: 'Maharashtra & Konkan Coast (Mumbai/Ratnagiri)',
    flag: '⛵'
  },
  {
    code: 'gu',
    speechCode: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    region: 'Gujarat Coast (Veraval/Porbandar/Kandla)',
    flag: '🐟'
  },
  {
    code: 'bn',
    speechCode: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'West Bengal & Sundarbans (Digha/Kakdwip)',
    flag: '🚤'
  },
  {
    code: 'or',
    speechCode: 'or-IN',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    region: 'Odisha Coast (Paradip/Gopalpur/Puri)',
    flag: '🐚'
  },
  {
    code: 'kok',
    speechCode: 'kok-IN',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    region: 'Goa & Coastal Karnataka',
    flag: '🏝️'
  },
  {
    code: 'pa',
    speechCode: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    region: 'Northern India Inland & Maritime Commerce',
    flag: '🌾'
  },
  {
    code: 'as',
    speechCode: 'as-IN',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    region: 'Brahmaputra Inland Waterways',
    flag: '🛶'
  }
];

export const MULTILINGUAL_UI = {
  en: {
    welcome: 'Hello Captain! I am Marine AI, your marine intelligence assistant powered by 16 collaborative multi-agents.\n\nI continuously monitor real-time ISRO Oceansat-3 satellite SST, MODIS chlorophyll, IMD Doppler winds, and INCOIS coastal buoys. How can I assist your voyage today?',
    placeholder: 'Ask Marine AI in your language (conditions, PFZ, routes, alerts)...',
    listening: 'Listening to your voice...',
    quickInquiries: 'Quick Inquiries',
    speaking: 'Speaking out advisory...',
    listenAloud: 'Read Aloud in Your Language',
    agentStatus: '16 Collaborative Agents Online & Synced',
    pressKey: 'Press Enter to send, Shift+Enter for newline',
    prompts: [
      { label: '🌊 Sea conditions tomorrow', query: 'What are the sea conditions, wave swell, and wind tomorrow morning?' },
      { label: '🐟 Optimal PFZ fishing zone', query: 'Where is the highest payoff Potential Fishing Zone today with safe return guarantee?' },
      { label: '🗺️ Plan a safe route', query: 'Plan a safe navigation route avoiding high swell and naval restricted arcs.' },
      { label: '⚠️ Check marine alerts', query: 'Check current coastal alerts, squall lines, and IMBL boundaries near Palk Strait.' },
      { label: '🛡️ Safety Challenger check', query: 'Run AI Challenger adversarial stress-test on our return voyage under 22 knot winds.' }
    ]
  },
  hi: {
    welcome: 'नमस्ते कप्तान साहब! मैं आपका मरीन एआई (Marine AI) समुद्री इंटेलिजेंस सहायक हूँ, जो 16 बहु-एजेंटों द्वारा संचालित है।\n\nमैं वास्तविक समय में इसरो (ISRO) ओशनसैट-3, इनकॉइस (INCOIS) महासागरीय डेटा और मौसम रडार की निगरानी करता हूँ। आज आपकी समुद्री यात्रा में मैं क्या सहायता कर सकता हूँ?',
    placeholder: 'अपनी भाषा में मरीन एआई से पूछें (समुद्री स्थिति, मछली पकड़ने का क्षेत्र, सुरक्षित मार्ग)...',
    listening: 'आपकी आवाज़ सुन रहा हूँ...',
    quickInquiries: 'त्वरित प्रश्न',
    speaking: 'सलाह पढ़ रहा हूँ...',
    listenAloud: 'हिंदी में सुनें',
    agentStatus: '16 सहयोगी एजेंट ऑनलाइन और सिंक हैं',
    pressKey: 'भेजने के लिए Enter दबाएं, नई पंक्ति के लिए Shift+Enter',
    prompts: [
      { label: '🌊 कल समुद्र की स्थिति', query: 'कल सुबह समुद्र की स्थिति, लहरों की ऊंचाई और हवा की गति क्या होगी?' },
      { label: '🐟 संभावित मत्स्य क्षेत्र (PFZ)', query: 'आज सबसे अधिक मछली मिलने वाला सुरक्षित क्षेत्र कहाँ है?' },
      { label: '🗺️ सुरक्षित नौवहन मार्ग', query: 'ऊंची लहरों और प्रतिबंधित नौसेना क्षेत्र से बचते हुए सुरक्षित मार्ग बनाएं।' },
      { label: '⚠️ तटीय चेतावनी और तूफान', query: 'क्या आज समुद्र में कोई आंधी या तटीय चेतावनी जारी की गई है?' },
      { label: '🛡️ सुरक्षा परीक्षक (AI Challenger)', query: 'वापसी यात्रा में 22 नॉट हवा के तहत हमारी सुरक्षा की जांच करें।' }
    ]
  },
  te: {
    welcome: 'నమస్కారం కెప్టెన్! నేను మీ మెరైన్ ఏఐ (Marine AI) సముద్ర నావిగేషన్ అసిస్టెంట్. 16 కృత్రిమ మేధస్సు ఏజెంట్ల ద్వారా నడుస్తున్నాను.\n\nఇస్రో ఓషన్శాట్-3 ఉపగ్రహం, ఇన్‌కోయిస్ (INCOIS) బాయ్ సమాచారం, పవన వేగాలను ఎప్పటికప్పుడు గమనిస్తున్నాను. ఈరోజు మీ సముద్ర ప్రయాణానికి ఎలా సహాయపడగలను?',
    placeholder: 'మీ తెలుగులో మెరైన్ ఏఐని అడగండి (సముద్ర స్థితి, చేపల వేట జోన్ PFZ, సురక్షిత మార్గం)...',
    listening: 'మీ స్వరం వింటున్నాను...',
    quickInquiries: 'శీఘ్ర ప్రశ్నలు',
    speaking: 'తెలుగులో చదువుతున్నాను...',
    listenAloud: 'తెలుగులో వినండి',
    agentStatus: '16 ఏజెంట్లు ఆన్‌లైన్‌లో సిద్ధంగా ఉన్నాయి',
    pressKey: 'పంపడానికి Enter నొక్కండి, కొత్త లైన్ కోసం Shift+Enter',
    prompts: [
      { label: '🌊 రేపటి సముద్ర పరిస్థితి', query: 'రేపు ఉదయం సముద్రం ఎలా ఉంది? అలల ఎత్తు మరియు గాలి వేగం ఎంత?' },
      { label: '🐟 చేపలు ఎక్కువగా ఉండే జోన్ (PFZ)', query: 'ఈరోజు అత్యధిక చేపల వేట లభించే సురక్షిత పొటెన్షియల్ ఫిషింగ్ జోన్ ఎక్కడ ఉంది?' },
      { label: '🗺️ సురక్షిత ప్రయాణ మార్గం', query: 'పెద్ద అలలు, నౌకాదళ ఆంక్షలు లేని సురక్షితమైన మార్గాన్ని ప్లాన్ చేయండి.' },
      { label: '⚠️ సముద్ర హెచ్చరికలు', query: 'ఈరోజు సముద్రంలో తుఫాను లేదా ఆకస్మిక గాలుల హెచ్చరికలు ఉన్నాయా?' },
      { label: '🛡️ భద్రతా పరీక్ష (AI Challenger)', query: '22 నాట్ల ఎదురుగాలిలో మన బోట్ తిరిగి సురక్షితంగా రేవుకు చేరుకోగలదా?' }
    ]
  },
  ta: {
    welcome: 'வணக்கம் கேப்டன்! நான் அக்வா ஏஐ (Marine AI) கடல் நுண்ணறிவு வழிகாட்டி. 16 கூட்டு ஏஜென்ட்களால் இயக்கப்படுகிறேன்.\n\nஇஸ்ரோ ஓசன்சாட்-3 செயற்கைக்கோள், இன்கோயிஸ் (INCOIS) கடல் மிதவை தகவல்கள் மற்றும் காற்றின் வேகத்தை தொடர்ந்து கண்காணிக்கிறேன். இன்று உங்கள் கடல் பயணத்திற்கு நான் எவ்வாறு உதவட்டும்?',
    placeholder: 'தமிழில் கேளுங்கள் (கடல் நிலை, மீன்பிடி மண்டலம் PFZ, பாதுகாப்பான பாதை)...',
    listening: 'உங்கள் குரலைக் கேட்கிறேன்...',
    quickInquiries: 'விரைவு வினாக்கள்',
    speaking: 'தமிழில் குரல் ஒலிக்கிறது...',
    listenAloud: 'தமிழில் கேட்க',
    agentStatus: '16 ஏஜென்ட்கள் முழுமையாக தயாராக உள்ளன',
    pressKey: 'அனுப்ப Enter அழுத்தவும், புதிய வரிக்கு Shift+Enter',
    prompts: [
      { label: '🌊 நாளைய கடல் அலை நிலை', query: 'நாளை காலை கடல் அலை உயரம் மற்றும் காற்றின் வேகம் என்ன?' },
      { label: '🐟 சிறந்த மீன்பிடி மண்டலம் (PFZ)', query: 'இன்று அதிக மீன்கள் கிடைக்கும் பாதுகாப்பான மீன்பிடி மண்டலம் எங்கே உள்ளது?' },
      { label: '🗺️ பாதுகாப்பான கடல் பாதை', query: 'உயர்ந்த அலைகள் மற்றும் கடற்படை எல்லைகளைத் தவிர்த்து பாதுகாப்பான பாதை அமையுங்கள்.' },
      { label: '⚠️ புயல் & வானிலை எச்சரிக்கைகள்', query: 'பாக் ஜலசந்தி பகுதியில் ஏதேனும் கடல் எச்சரிக்கை உள்ளதா?' },
      { label: '🛡️ பாதுகாப்பு சவால் சோதனை', query: '22 நாட் எதிர்க் காற்றில் படகு திரும்பும் போது எரிபொருள் போதுமானதா?' }
    ]
  },
  ml: {
    welcome: 'നമസ്കാരം ക്യാപ്റ്റൻ! ഞാൻ അക്വാ എഐ (Marine AI) മറൈൻ ഇന്റലിജൻസ് കോപൈലറ്റ്. 16 ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ് ഏജന്റുകൾ ചേർന്ന് പ്രവർത്തിക്കുന്നു.\n\nഐഎസ്ആർഒ ഓഷ്യൻസാറ്റ്-3 ഉപഗ്രഹം, ഇൻകോയിസ് (INCOIS) തത്സമയ സമുദ്ര വിവരങ്ങൾ നിരീക്ഷിക്കുന്നു. ഇന്നത്തെ യാത്രയ്ക്ക് എന്ത് സഹായമാണ് വേണ്ടത്?',
    placeholder: 'മലയാളത്തിൽ ചോദിക്കൂ (കടൽ കാലാവസ്ഥ, മത്സ്യബന്ധന മേഖല PFZ, സുരക്ഷിത റൂട്ട്)...',
    listening: 'നിങ്ങളുടെ ശബ്ദം കേൾക്കുന്നു...',
    quickInquiries: 'പ്രധാന ചോദ്യങ്ങൾ',
    speaking: 'മലയാളത്തിൽ വായിക്കുന്നു...',
    listenAloud: 'മലയാളത്തിൽ കേൾക്കൂ',
    agentStatus: '16 ഏജന്റുകളും സജ്ജമാണ്',
    pressKey: 'അയക്കാൻ Enter അമർത്തുക, പുതിയ വരിക്ക് Shift+Enter',
    prompts: [
      { label: '🌊 നാളത്തെ കടൽ സ്ഥിതി', query: 'നാളെ രാവിലത്തെ തിരമാലകളുടെ ഉയരവും കാറ്റിന്റെ വേഗതയും എത്രയാണ്?' },
      { label: '🐟 മികച്ച മത്സ്യ ലഭ്യതയുള്ള മേഖല (PFZ)', query: 'ഇന്ന് ഏറ്റവും കൂടുതൽ മത്സ്യം ലഭിക്കുന്ന സുരക്ഷിതമായ മേഖല എവിടെയാണ്?' },
      { label: '🗺️ സുരക്ഷിതമായ റൂട്ട്', query: 'ശക്തമായ തിരമാലകൾ ഒഴിവാക്കി തുറമുഖത്തേക്ക് മടങ്ങാൻ സുരക്ഷിത പാത കാണിക്കൂ.' },
      { label: '⚠️ കാറ്റും മുന്നറിയിപ്പുകളും', query: 'ഇന്ന് കടലിൽ എന്തെങ്കിലും ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ് ഉണ്ടോ?' },
      { label: '🛡️ സുരക്ഷാ പരിശോധന (AI Challenger)', query: '22 നോട്ട് എതിർ കാറ്റിൽ ബോട്ട് സുരക്ഷിതമായി തിരിച്ചെത്തുമോ?' }
    ]
  },
  kn: {
    welcome: 'ನಮಸ್ಕಾರ ಕ್ಯಾಪ್ಟನ್! ನಾನು ಆಕ್ವಾ ಎಐ (Marine AI) ಸಾಗರ ಗುಪ್ತಚರ ಸಹಾಯಕ. 16 ಬುದ್ಧಿವಂತ ಏಜೆಂಟ್‌ಗಳಿಂದ ಚಾಲಿತನಾಗಿದ್ದೇನೆ.\n\nಇಸ್ರೋ ಸಾಗರ ಉಪಗ್ರಹ ಮತ್ತು ಇನ್‌ಕೋಯಿಸ್ (INCOIS) ರಿಯಲ್-ಟೈಮ್ ಸಾಗರ ದತ್ತಾಂಶವನ್ನು ಸತತವಾಗಿ ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇನೆ. ಇಂದು ನಿಮ್ಮ ಸಮುದ್ರಯಾನಕ್ಕೆ ಯಾವ ನೆರವು ಬೇಕು?',
    placeholder: 'ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ (ಸಮುದ್ರ ಸ್ಥಿತಿ, ಮೀನುಗಾರಿಕೆ ವಲಯ PFZ, ಸುರಕ್ಷಿತ ಮಾರ್ಗ)...',
    listening: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸುತ್ತಿದ್ದೇನೆ...',
    quickInquiries: 'ತ್ವರಿತ ವಿಚಾರಣೆಗಳು',
    speaking: 'ಕನ್ನಡದಲ್ಲಿ ಧ್ವನಿ ಓದುತ್ತಿದೆ...',
    listenAloud: 'ಕನ್ನಡದಲ್ಲಿ ಆಲಿಸಿ',
    agentStatus: '16 ಏಜೆಂಟ್‌ಗಳು ಸಕ್ರಿಯವಾಗಿವೆ',
    pressKey: 'ಕಳುಹಿಸಲು Enter ಒತ್ತಿರಿ',
    prompts: [
      { label: '🌊 ನಾಳೆಯ ಸಮುದ್ರ ಪರಿಸ್ಥಿತಿ', query: 'ನಾಳೆ ಮುಂಜಾನೆ ಅಲೆಗಳ ಎತ್ತರ ಮತ್ತು ಗಾಳಿಯ ವೇಗ ಹೇಗಿದೆ?' },
      { label: '🐟 ಉತ್ತಮ ಮೀನುಗಾರಿಕೆ ವಲಯ (PFZ)', query: 'ಇಂದು ಗರಿಷ್ಠ ಮೀನು ಲಭ್ಯವಿರುವ ಸುರಕ್ಷಿತ ಸಂಭಾವ್ಯ ಮೀನುಗಾರಿಕೆ ವಲಯ ಎಲ್ಲಿದೆ?' },
      { label: '🗺️ ಸುರಕ್ಷಿತ ನೌಕಾಯಾನ ಮಾರ್ಗ', query: 'ಅಪಾಯಕಾರಿ ಅಲೆಗಳನ್ನು ತಪ್ಪಿಸಿ ಸುರಕ್ಷಿತ ಬಂದರು ಮಾರ್ಗವನ್ನು ಯೋಜಿಸಿ.' },
      { label: '⚠️ ಕರಾವಳಿ ಎಚ್ಚರಿಕೆಗಳು', query: 'ಇಂದು ಸಮುದ್ರದಲ್ಲಿ ಯಾವುದೇ ಬಿರುಗಾಳಿ ಅಥವಾ ಪ್ರಕ್ಷುಬ್ಧತೆಯ ಎಚ್ಚರಿಕೆ ಇದೆಯೇ?' }
    ]
  },
  mr: {
    welcome: 'नमस्कार कॅप्टन! मी एक्वा एआय (Marine AI) सागरी गुप्तचर सहाय्यक आहे. 16 कृत्रिम बुद्धिमत्ता एजंट्सद्वारे मी सज्ज आहे.\n\nइस्रो (ISRO) ओशनसॅट-3 उपग्रह आणि इनकोईस (INCOIS) रिअल-टाइम सागरी हवामानाचे निरीक्षण करतो. आज आपल्या प्रवासात मी कशी मदत करू?',
    placeholder: 'मराठीत विचारा (समुद्राची स्थिती, मासेमारी क्षेत्र PFZ, सुरक्षित मार्ग)...',
    listening: 'तुमचा आवाज ऐकत आहे...',
    quickInquiries: 'जलद प्रश्न',
    speaking: 'मराठीत ऐकवत आहे...',
    listenAloud: 'मराठीत ऐका',
    agentStatus: '16 एजंट्स ऑनलाइन आणि सक्रिय आहेत',
    pressKey: 'पाठवण्यासाठी Enter दाबा',
    prompts: [
      { label: '🌊 उद्या समुद्राची स्थिती', query: 'उद्या सकाळी समुद्राच्या लाटांची उंची आणि वाऱ्याचा वेग किती असेल?' },
      { label: '🐟 संभाव्य मासेमारी क्षेत्र (PFZ)', query: 'आज सर्वाधिक मासळी मिळणारे सुरक्षित क्षेत्र कोठे आहे?' },
      { label: '🗺️ सुरक्षित नौकानयन मार्ग', query: 'मोठ्या लाटा टाळून बंदरावर परतण्याचा सुरक्षित मार्ग दाखवा.' },
      { label: '⚠️ वादळ आणि सागरी इशारे', query: 'आज समुद्रात काही वादळी वारे किंवा धोक्याचा इशारा आहे का?' }
    ]
  },
  gu: {
    welcome: 'નમસ્તે કપ્તાન! હું એક્વા એઆઈ (Marine AI) મરીન ઇન્ટેલિજન્સ સહાયક છું. 16 આર્ટિફિશિયલ ઇન્ટેલિજન્સ એજન્ટો દ્વારા સંચાલિત છું.\n\nઇસરો (ISRO) ઓશનસેટ-3 અને ઇનકોઇસ (INCOIS) દરિયાઈ મોજાં અને પવનની ગતિનું લાઇવ નિરીક્ષણ કરું છું. આજે તમારા દરિયાઈ પ્રવાસ માટે શું માહિતી જોઈએ?',
    placeholder: 'ગુજરાતીમાં પૂછો (દરિયાની સ્થિતિ, માછીમારી ઝોન PFZ, સુરક્ષિત રૂટ)...',
    listening: 'તમારો અવાજ સાંભળી રહ્યો છું...',
    quickInquiries: 'ઝડપી પ્રશ્નો',
    speaking: 'ગુજરાતીમાં સંભળાવી રહ્યું છે...',
    listenAloud: 'ગુજરાતીમાં સાંભળો',
    agentStatus: '16 સહયોગી એજન્ટો સક્રિય છે',
    pressKey: 'મોકલવા માટે Enter દબાવો',
    prompts: [
      { label: '🌊 આવતીકાલે દરિયાની સ્થિતિ', query: 'આવતીકાલે સવારે દરિયાના મોજાંની ઊંચાઈ અને પવનની ગતિ કેવી રહેશે?' },
      { label: '🐟 શ્રેષ્ઠ માછીમારી વિસ્તાર (PFZ)', query: 'આજે સૌથી વધુ માછલીઓ ધરાવતો સુરક્ષિત વિસ્તાર ક્યાં છે?' },
      { label: '🗺️ સુરક્ષિત નેવિગેશન રૂટ', query: 'તોફાની મોજાં ટાળીને બંદર પર પાછા ફરવા માટેનો સલામત રૂટ બતાવો.' },
      { label: '⚠️ દરિયાઈ ચેતવણીઓ', query: 'આજે દરિયામાં પવન કે વાવાઝોડાની કોઈ ચેતવણી છે?' }
    ]
  },
  bn: {
    welcome: 'নমস্কার ক্যাপ্টেন! আমি অ্যাকোয়া এআই (Marine AI) সামুদ্রিক গোয়েন্দা সহকারী। 16টি বহু-এজেন্ট দ্বারা পরিচালিত।\n\nইসরো ওশনস্যাট-৩ এবং ইনকোইসের (INCOIS) রিয়েল-টাইম সমুদ্রের তরঙ্গ, বাতাস ও মাছের ঝাঁকের অবস্থান পর্যবেক্ষণ করছি। আজ আপনার সমুদ্রযাত্রায় কীভাবে সাহায্য করতে পারি?',
    placeholder: 'বাংলায় জিজ্ঞাসা করুন (সমুদ্রের অবস্থা, মাছ ধরার এলাকা PFZ, নিরাপদ রুট)...',
    listening: 'আপনার কণ্ঠস্বর শুনছি...',
    quickInquiries: 'দ্রুত অনুসন্ধান',
    speaking: 'বাংলায় বলছি...',
    listenAloud: 'বাংলায় শুনুন',
    agentStatus: '১৬টি এজেন্ট অনলাইন ও সক্রিয়',
    pressKey: 'পাঠাতে Enter চাপুন',
    prompts: [
      { label: '🌊 আগামীকালের সমুদ্রের অবস্থা', query: 'কাল সকালে ঢেউয়ের উচ্চতা এবং বাতাসের গতিবেগ কেমন থাকবে?' },
      { label: '🐟 সম্ভাব্য মৎস্য অঞ্চল (PFZ)', query: 'আজ সর্বাধিক মাছ পাওয়ার উপযোগী নিরাপদ এলাকাটি কোথায়?' },
      { label: '🗺️ নিরাপদ সমুদ্রপথ', query: 'উঁচু ঢেউ এবং বিপজ্জনক সীমানা এড়িয়ে একটি নিরাপদ নৌপথ দেখান।' },
      { label: '⚠️ আবহাওয়ার সতর্কতা', query: 'উপকূলীয় অঞ্চলে কি কোনো ঝড় বা নিম্নচাপের সতর্কতা আছে?' }
    ]
  },
  or: {
    welcome: 'ନମସ୍କାର କ୍ୟାପଟେନ! ମୁଁ ଆକ୍ୱା ଏଆଇ (Marine AI) ସାମୁଦ୍ରିକ ଗୁଇନ୍ଦା ସହାୟକ। ୧୬ଟି ମଲ୍ଟି-ଏଜେଣ୍ଟ ଦ୍ୱାରା ପରିଚାଳିତ।\n\nଇସ୍ରୋ (ISRO) ଓସେନସାଟ୍-୩ ଏବଂ ଇନକୋଇସ (INCOIS) ତଥ୍ୟ ଆଧାରରେ ତରଙ୍ଗର ଉଚ୍ଚତା ଓ ପବନର ଗତି ନିରୀକ୍ଷଣ କରୁଛି। ଆଜି ଆପଣଙ୍କୁ କି ସାହାଯ୍ୟ କରିପାରିବି?',
    placeholder: 'ଓଡ଼ିଆରେ ପଚାରନ୍ତୁ (ସମୁଦ୍ରର ଅବସ୍ଥା, ମାଛ ଧରିବା ଅଞ୍ଚଳ PFZ, ନିରାପଦ ରୁଟ୍)...',
    listening: 'ଆପଣଙ୍କ ସ୍ୱର ଶୁଣୁଛି...',
    quickInquiries: 'ତୁରନ୍ତ ପ୍ରଶ୍ନ',
    speaking: 'ଓଡ଼ିଆରେ ପଢୁଛି...',
    listenAloud: 'ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ',
    agentStatus: '୧୬ଟି ଏଜେଣ୍ଟ ଅନଲାଇନରେ ପ୍ରସ୍ତୁତ',
    pressKey: 'ପଠାଇବା ପାଇଁ Enter ଦବାନ୍ତୁ',
    prompts: [
      { label: '🌊 କାଲି ସମୁଦ୍ରର ସ୍ଥିତି', query: 'କାଲି ସକାଳେ ଢେଉର ଉଚ୍ଚତା ଏବଂ ପବନର ବେଗ କେତେ ରହିବ?' },
      { label: '🐟 ସମ୍ଭାବ୍ୟ ମତ୍ସ୍ୟ ଧରିବା ଅଞ୍ଚଳ (PFZ)', query: 'ଆଜି ସର୍ବାଧିକ ମାଛ ମିଳିବା ଭଳି ନିରାପଦ ସ୍ଥାନ କେଉଁଠି ଅଛି?' },
      { label: '🗺️ ନିରାପଦ ସାମୁଦ୍ରିକ ପଥ', query: 'ବଡ଼ ଢେଉକୁ ଏଡ଼ାଇ ବନ୍ଦରକୁ ଫେରିବାର ନିରାପଦ ପଥ ଦର୍ଶାନ୍ତୁ।' },
      { label: '⚠️ ଝଡ଼ ଓ ବର୍ଷା ସତର୍କତା', query: 'ଆଜି ସମୁଦ୍ରରେ କୌଣସି ଝଡ଼ କିମ୍ବା ବାତ୍ୟା ସତର୍କତା ଅଛି କି?' }
    ]
  },
  kok: {
    welcome: 'नमस्कार कॅप्टन! हांव आक्वा एआय (Marine AI) दर्या गुप्तचर मार्गदर्शक. 16 कृत्रिम बुद्धीमत्ता एजंटांनी चालता.\n\nइस्रो (ISRO) उपग्रह आनी दर्यांतल्या ल्हारांची स्थिती हांव पळयता. आयज तुमच्या दर्या प्रवासाक म्हाका कशी मदत करूंक जाय?',
    placeholder: 'कोंकणींत विचारूंक जाय (दर्याची स्थिती, नुस्तें मेळपाचो जागो PFZ)...',
    listening: 'तुमचो आवाज आयकता...',
    quickInquiries: 'सोंपे प्रस्न',
    speaking: 'कोंकणींत सांगता...',
    listenAloud: 'कोंकणींत आयकात',
    agentStatus: '16 एजंट सज्ज आसात',
    pressKey: 'धाडपाक Enter दाबा',
    prompts: [
      { label: '🌊 फाल्यांची दर्याची स्थिती', query: 'फाल्या सकाळीं दर्यांत ल्हारांची उंचाय आनी वाऱ्याचो वेग कितलो आसा?' },
      { label: '🐟 बरो नुस्तें मेळपाचो जागो (PFZ)', query: 'आयज चड नुस्तें मेळपाचो सुरक्षित जागो खंय आसा?' },
      { label: '🗺️ सुरक्षित वाट', query: 'व्हड ल्हारां आडवून बंदराक वचपाची बरी वाट दाखयात.' }
    ]
  },
  pa: {
    welcome: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਪਤਾਨ ਸਾਹਿਬ! ਮੈਂ ਐਕਵਾ ਏਆਈ (Marine AI) ਸਮੁੰਦਰੀ ਖੁਫੀਆ ਸਹਾਇਕ ਹਾਂ, ਜੋ 16 ਬੁੱਧੀਮਾਨ ਏਜੰਟਾਂ ਦੁਆਰਾ ਸੰਚਾਲਿਤ ਹੈ।\n\nਮੈਂ ਇਸਰੋ (ISRO) ਉਪਗ੍ਰਹਿ ਅਤੇ ਸਮੁੰਦਰੀ ਲਹਿਰਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰਦਾ ਹਾਂ। ਅੱਜ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
    placeholder: 'ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਪੁੱਛੋ (ਸਮੁੰਦਰ ਦੀ ਸਥਿਤੀ, ਸੁਰੱਖਿਅਤ ਰਸਤਾ)...',
    listening: 'ਤੁਹਾਡੀ ਆਵਾਜ਼ ਸੁਣ ਰਿਹਾ ਹਾਂ...',
    quickInquiries: 'ਜ਼ਰੂਰੀ ਸਵਾਲ',
    speaking: 'ਪੰਜਾਬੀ ਵਿੱਚ ਸੁਣਾ ਰਿਹਾ ਹਾਂ...',
    listenAloud: 'ਪੰਜਾਬੀ ਵਿੱਚ ਸੁਣੋ',
    agentStatus: '16 ਏਜੰਟ ਆਨਲਾਈਨ ਹਨ',
    pressKey: 'ਭੇਜਣ ਲਈ Enter ਦਬਾਓ',
    prompts: [
      { label: '🌊 ਕੱਲ੍ਹ ਸਮੁੰਦਰ ਦੀ ਸਥਿਤੀ', query: 'ਕੱਲ੍ਹ ਸਵੇਰੇ ਸਮੁੰਦਰ ਦੀਆਂ ਲਹਿਰਾਂ ਦੀ ਉਚਾਈ ਅਤੇ ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ ਕਿੰਨੀ ਹੋਵੇਗੀ?' },
      { label: '🗺️ ਸੁਰੱਖਿਅਤ ਨੇਵੀਗੇਸ਼ਨ ਰਸਤਾ', query: 'ਉੱਚੀਆਂ ਲਹਿਰਾਂ ਤੋਂ ਬਚਦੇ ਹੋਏ ਇੱਕ ਸੁਰੱਖਿਅਤ ਰਸਤਾ ਤਿਆਰ ਕਰੋ।' }
    ]
  },
  as: {
    welcome: 'নমস্কাৰ কেপ্টেইন! মই একুৱা এআই (Marine AI) সামুদ্ৰিক বুদ্ধিমত্তা সহায়ক। ১৬টা সহযোগী এজেণ্টেৰে চালিত।\n\nইছৰো উপগ্ৰহ আৰু নদী-সাগৰৰ তৰংগৰ স্থিতি নিৰীক্ষণ কৰি আছো। আজি আপোনাক কিদৰে সহায় কৰিব পাৰো?',
    placeholder: 'অসমীয়াত সোধক (পানীৰ স্থিতি, সুৰক্ষিত পথ)...',
    listening: 'আপোনাৰ কণ্ঠ শুনি আছো...',
    quickInquiries: 'দ্ৰুত প্ৰশ্ন',
    speaking: 'অসমীয়াত কওঁ...',
    listenAloud: 'অসমীয়াত শুনক',
    agentStatus: '১৬টা এজেণ্ট সক্ৰিয় হৈ আছে',
    pressKey: 'প্ৰেৰণ কৰিবলৈ Enter টিপক',
    prompts: [
      { label: '🌊 কাইলৈৰ জল অৱস্থা', query: 'কাইলৈ পুৱা ঢৌৰ উচ্চতা আৰু বতাহৰ গতি কেনেকুৱা হ\'ব?' },
      { label: '🗺️ সুৰক্ষিত নৌপথ', query: 'বিপদজনক তৰংগ এৰাই সুৰক্ষিত পথ নিৰ্ধাৰণ কৰক।' }
    ]
  }
};

/**
 * Synthesizes a localized marine intelligence report in the selected Indian language
 */
export function generateLocalizedMarineResponse(languageCode, results, promptText = '') {
  const p = promptText.toLowerCase();
  const isFishing = p.includes('fishing') || p.includes('pfz') || p.includes('catch') || p.includes('zone') || p.includes('చేప') || p.includes('மீன்') || p.includes('मछली') || p.includes('മത്സ്യം') || p.includes('ಮತ್ಸ್ಯ') || p.includes('मासे') || p.includes('માછલી') || p.includes('মাছ');
  const isChallenger = p.includes('challenger') || p.includes('risk') || p.includes('stress') || p.includes('భద్రత') || p.includes('பாதுகாப்பு') || p.includes('सुरक्षा') || p.includes('വിപത്ത്');

  switch (languageCode) {
    case 'te':
      if (isFishing) {
        return `### 🐟 పొటెన్షియల్ ఫిషింగ్ జోన్ (PFZ) నివేదిక\n` +
          `• **లక్ష్య చేపల రకాలు:** ${results.opportunity.target_species}\n` +
          `• **అంచనా వేసిన వేట:** **${results.opportunity.expected_catch}** (విలువ: **${results.opportunity.market_value_inr}**)\n` +
          `• **డీజిల్ ఖర్చు:** ~${results.opportunity.diesel_cost_inr}\n` +
          `• **లాభదాయక నిష్పత్తి:** **${results.opportunity.payoff_ratio}**\n` +
          `• **అనుకూల వేట సమయం:** **${results.opportunity.optimal_strike_window}**\n\n` +
          `**శాస్త్రీయ వివరణ:** ${results.explainability.why_this_route}`;
      } else if (isChallenger) {
        return `### 🛡️ ఏఐ ఛాలెంజర్ భద్రతా పరిశీలన\n` +
          `• **రెడ్-టీమ్ తీర్పు:** **${results.ai_challenger.verdict}** (ఆమోదించబడింది)\n` +
          `• **పరీక్షించిన ముప్పు:** ${results.ai_challenger.threat_tested}\n` +
          `• **తప్పనిసరి జాగ్రత్త:** ${results.ai_challenger.safeguard_required}\n` +
          `• **బోట్ బోల్తా సూచిక:** ${results.safety.capsize_risk_index} (చాలా సురక్షితం)`;
      } else {
        return `### 🌊 సముద్ర మరియు వాతావరణ తాజా సమాచారం\n` +
          `• **అలల ఎత్తు:** ${results.ocean_analytics.significant_wave_height} (${results.ocean_analytics.sea_state})\n` +
          `• **ఉపరితల గాలి వేగం:** ${results.weather.wind_speed}, తుఫాను గాలులు: ${results.weather.wind_gusts}\n` +
          `• **సముద్ర ఉష్ణోగ్రత (SST):** ${results.marine_data.sea_surface_temp}\n` +
          `• **ప్రస్తుత ప్రవాహం:** ${results.ocean_analytics.surface_current}\n` +
          `• **కార్యాచరణ స్థితి:** **${results.safety.operational_status}** (రక్షణ స్కోరు: **${results.safety.safety_score}/100**)\n\n` +
          `**మత్స్యకారుల సలహా:** ${results.safety.fisher_recommendation}`;
      }

    case 'ta':
      if (isFishing) {
        return `### 🐟 சாத்தியமான மீன்பிடி மண்டலம் (PFZ) அறிக்கை\n` +
          `• **இலக்கு மீன் இனங்கள்:** ${results.opportunity.target_species}\n` +
          `• **எதிர்பார்க்கப்படும் மீன் பிடிப்பு:** **${results.opportunity.expected_catch}** (சந்தை மதிப்பு: **${results.opportunity.market_value_inr}**)\n` +
          `• **டீசல் செலவு:** ~${results.opportunity.diesel_cost_inr}\n` +
          `• **வருவாய் விகிதம்:** **${results.opportunity.payoff_ratio}**\n` +
          `• **சிறந்த மீன்பிடி நேரம்:** **${results.opportunity.optimal_strike_window}**\n\n` +
          `**கடலியல் விளக்கம்:** ${results.explainability.why_this_route}`;
      } else if (isChallenger) {
        return `### 🛡️ AI பாதுகாப்பு சவால் அறிக்கை\n` +
          `• **பாதுகாப்பு முடிவு:** **${results.ai_challenger.verdict}**\n` +
          `• **சோதிக்கப்பட்ட அச்சுறுத்தல்:** ${results.ai_challenger.threat_tested}\n` +
          `• **கட்டாய பாதுகாப்பு:** ${results.ai_challenger.safeguard_required}\n` +
          `• **கவிழும் ஆபத்து குறியீடு:** ${results.safety.capsize_risk_index}`;
      } else {
        return `### 🌊 கடல் மற்றும் வானிலை நிலை அறிக்கை\n` +
          `• **அலைகளின் உயரம்:** ${results.ocean_analytics.significant_wave_height} (${results.ocean_analytics.sea_state})\n` +
          `• **காற்றின் வேகம்:** ${results.weather.wind_speed}, சுழல்காற்று: ${results.weather.wind_gusts}\n` +
          `• **கடல் மேற்பரப்பு வெப்பநிலை (SST):** ${results.marine_data.sea_surface_temp}\n` +
          `• **கடல் நீரோட்டம்:** ${results.ocean_analytics.surface_current}\n` +
          `• **செயல்பாட்டு நிலை:** **${results.safety.operational_status}** (பாதுகாப்பு மதிப்பீடு: **${results.safety.safety_score}/100**)\n\n` +
          `**மீனவர் வழிகாட்டல்:** ${results.safety.fisher_recommendation}`;
      }

    case 'hi':
      if (isFishing) {
        return `### 🐟 संभावित मत्स्य क्षेत्र (PFZ) रिपोर्ट\n` +
          `• **लक्षित मछली प्रजातियां:** ${results.opportunity.target_species}\n` +
          `• **अपेक्षित पैदावार:** **${results.opportunity.expected_catch}** (बाजार मूल्य: **${results.opportunity.market_value_inr}**)\n` +
          `• **डीजल खपत लागत:** ~${results.opportunity.diesel_cost_inr}\n` +
          `• **लाभ अनुपात:** **${results.opportunity.payoff_ratio}**\n` +
          `• **सर्वोत्तम समय खिड़की:** **${results.opportunity.optimal_strike_window}**\n\n` +
          `**वैज्ञानिक कारण:** ${results.explainability.why_this_route}`;
      } else if (isChallenger) {
        return `### 🛡️ एआई सुरक्षा चैलेंजर तनाव परीक्षण\n` +
          `• **सुरक्षा निष्कर्ष:** **${results.ai_challenger.verdict}**\n` +
          `• **परीक्षित जोखिम:** ${results.ai_challenger.threat_tested}\n` +
          `• **अनिवार्य सुरक्षा शर्त:** ${results.ai_challenger.safeguard_required}\n` +
          `• **नाव पलटने का जोखिम:** ${results.safety.capsize_risk_index}`;
      } else {
        return `### 🌊 समुद्री और मौसम की स्थिति\n` +
          `• **लहरों की ऊंचाई:** ${results.ocean_analytics.significant_wave_height} (${results.ocean_analytics.sea_state})\n` +
          `• **सतही हवा की गति:** ${results.weather.wind_speed}, झोंके: ${results.weather.wind_gusts}\n` +
          `• **समुद्र सतह तापमान (SST):** ${results.marine_data.sea_surface_temp}\n` +
          `• **धारा प्रवाह:** ${results.ocean_analytics.surface_current}\n` +
          `• **सुरक्षा स्थिति:** **${results.safety.operational_status}** (सुरक्षा स्कोर: **${results.safety.safety_score}/100**)\n\n` +
          `**नाविकों के लिए सलाह:** ${results.safety.fisher_recommendation}`;
      }

    case 'ml':
      return `### 🌊 സമുദ്ര കാലാവസ്ഥ & PFZ ഉപദേശം\n` +
        `• **തിരമാല ഉയരം:** ${results.ocean_analytics.significant_wave_height}\n` +
        `• **കാറ്റിന്റെ വേഗത:** ${results.weather.wind_speed} (ശക്തി: ${results.weather.wind_gusts})\n` +
        `• **ലക്ഷ്യ മത്സ്യം:** ${results.opportunity.target_species}\n` +
        `• **പ്രതീക്ഷിക്കുന്ന ലഭ്യത:** **${results.opportunity.expected_catch}** (~${results.opportunity.market_value_inr})\n` +
        `• **സുരക്ഷാ നില:** **${results.safety.operational_status}** (സ്കോർ: **${results.safety.safety_score}%**)\n\n` +
        `**നിർദ്ദേശം:** ${results.safety.fisher_recommendation}`;

    case 'kn':
      return `### 🌊 ಸಮುದ್ರ ಹವಾಮಾನ ಮತ್ತು ಮೀನುಗಾರಿಕೆ ಮಾಹಿತಿ\n` +
        `• **ಅಲೆಗಳ ಎತ್ತರ:** ${results.ocean_analytics.significant_wave_height}\n` +
        `• **ಗಾಳಿಯ ವೇಗ:** ${results.weather.wind_speed} (ಝಳಪ ಗಾಳಿ: ${results.weather.wind_gusts})\n` +
        `• **ನಿರೀಕ್ಷಿತ ಮೀನುಗಾರಿಕೆ:** **${results.opportunity.expected_catch}** (${results.opportunity.target_species})\n` +
        `• **ಆದಾಯ ಮೌಲ್ಯ:** **${results.opportunity.market_value_inr}**\n` +
        `• **ಸುರಕ್ಷತಾ ಸ್ಥಿತಿ:** **${results.safety.operational_status}** (ಅಂಕ: **${results.safety.safety_score}/100**)\n\n` +
        `**ಸಲಹೆ:** ${results.safety.fisher_recommendation}`;

    case 'mr':
      return `### 🌊 सागरी हवामान व मासेमारी सल्ला\n` +
        `• **लाटांची उंची:** ${results.ocean_analytics.significant_wave_height}\n` +
        `• **वाऱ्याचा वेग:** ${results.weather.wind_speed} (झोके: ${results.weather.wind_gusts})\n` +
        `• **अपेक्षित मासळी उत्पादन:** **${results.opportunity.expected_catch}** (${results.opportunity.target_species})\n` +
        `• **अपेक्षित बाजार मूल्य:** **${results.opportunity.market_value_inr}**\n` +
        `• **सुरक्षा स्थिती:** **${results.safety.operational_status}** (सुरक्षा गुण: **${results.safety.safety_score}/100**)\n\n` +
        `**खलाशांसाठी सल्ला:** ${results.safety.fisher_recommendation}`;

    case 'gu':
      return `### 🌊 દરિયાઈ હવામાન અને માછીમારી માર્ગદર્શન\n` +
        `• **મોજાંની ઊંચાઈ:** ${results.ocean_analytics.significant_wave_height}\n` +
        `• **પવનની ગતિ:** ${results.weather.wind_speed} (ઝોંકા: ${results.weather.wind_gusts})\n` +
        `• **અપેક્ષિત પકડ:** **${results.opportunity.expected_catch}** (${results.opportunity.target_species})\n` +
        `• **અંદાજિત આવક:** **${results.opportunity.market_value_inr}**\n` +
        `• **સુરક્ષા સ્થિતિ:** **${results.safety.operational_status}** (સ્કોર: **${results.safety.safety_score}/100**)\n\n` +
        `**માછીમારો માટે સલાહ:** ${results.safety.fisher_recommendation}`;

    case 'bn':
      return `### 🌊 সামুদ্রিক আবহাওয়া ও মৎস্য ক্ষেত্র (PFZ) বুলেটিন\n` +
        `• **ঢেউয়ের উচ্চতা:** ${results.ocean_analytics.significant_wave_height}\n` +
        `• **বাতাসের বেগ:** ${results.weather.wind_speed} (দমকা বাতাস: ${results.weather.wind_gusts})\n` +
        `• **সম্ভাব্য মাছ:** **${results.opportunity.expected_catch}** (${results.opportunity.target_species})\n` +
        `• **আনুমানিক বাজারমূল্য:** **${results.opportunity.market_value_inr}**\n` +
        `• **নিরাপত্তা স্থিতি:** **${results.safety.operational_status}** (স্কোর: **${results.safety.safety_score}/100**)\n\n` +
        `**উপদেশ:** ${results.safety.fisher_recommendation}`;

    case 'or':
      return `### 🌊 ସାମୁଦ୍ରିକ ପାଣିପାଗ ଓ ମତ୍ସ୍ୟ ସୂଚନା\n` +
        `• **ଢେଉର ଉଚ୍ଚତା:** ${results.ocean_analytics.significant_wave_height}\n` +
        `• **ପବନର ଗତି:** ${results.weather.wind_speed} (ଝଟକା: ${results.weather.wind_gusts})\n` +
        `• **ସମ୍ଭାବ୍ୟ ମାଛ ଉତ୍ପାଦନ:** **${results.opportunity.expected_catch}** (${results.opportunity.target_species})\n` +
        `• **ଆନୁମାନିକ ମୂଲ୍ୟ:** **${results.opportunity.market_value_inr}**\n` +
        `• **ନିରାପତ୍ତା ସ୍ଥିତି:** **${results.safety.operational_status}** (ସ୍କୋର: **${results.safety.safety_score}/100**)\n\n` +
        `**ମତ୍ସ୍ୟଜୀବୀ ପରାମର୍ଶ:** ${results.safety.fisher_recommendation}`;

    case 'kok':
      return `### 🌊 दर्या हवामान आनी नुस्तें बुलेटीन\n` +
        `• **ल्हारांची उंचाय:** ${results.ocean_analytics.significant_wave_height}\n` +
        `• **वाऱ्याचो नेट:** ${results.weather.wind_speed}\n` +
        `• **अपेक्षित नुस्तें:** **${results.opportunity.expected_catch}** (${results.opportunity.target_species})\n` +
        `• **सुरक्षितताय:** **${results.safety.operational_status}** (गुण: **${results.safety.safety_score}/100**)\n\n` +
        `**सल्ला:** ${results.safety.fisher_recommendation}`;

    case 'pa':
      return `### 🌊 ਸਮੁੰਦਰੀ ਮੌਸਮ ਅਤੇ ਸੁਰੱਖਿਆ ਰਿਪੋਰਟ\n` +
        `• **ਲਹਿਰਾਂ ਦੀ ਉਚਾਈ:** ${results.ocean_analytics.significant_wave_height}\n` +
        `• **ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ:** ${results.weather.wind_speed}\n` +
        `• **ਸੰਭਾਵੀ ਮੱਛੀ ਫੜਨਾ:** **${results.opportunity.expected_catch}** (${results.opportunity.target_species})\n` +
        `• **ਸੁਰੱਖਿਆ ਸਕੋਰ:** **${results.safety.safety_score}/100** (${results.safety.operational_status})\n\n` +
        `**ਸਲਾਹ:** ${results.safety.fisher_recommendation}`;

    case 'as':
      return `### 🌊 সামুদ্ৰিক বতৰ আৰু সুৰক্ষা নিৰ্দেশনা\n` +
        `• **ঢৌৰ উচ্চতা:** ${results.ocean_analytics.significant_wave_height}\n` +
        `• **বতাহৰ বেগ:** ${results.weather.wind_speed}\n` +
        `• **সম্ভাব্য মাছ উৎপাদন:** **${results.opportunity.expected_catch}**\n` +
        `• **সুৰক্ষা মানদণ্ড:** **${results.safety.operational_status}** (নম্বৰ: **${results.safety.safety_score}/100**)\n\n` +
        `**পৰামৰ্শ:** ${results.safety.fisher_recommendation}`;

    default: // English
      if (isFishing) {
        return `### 🐟 Potential Fishing Zone (PFZ) Intelligence\n` +
          `• **Target Pelagic Species:** ${results.opportunity.target_species}\n` +
          `• **Expected Yield:** **${results.opportunity.expected_catch}** (Est. Market Value: **${results.opportunity.market_value_inr}**)\n` +
          `• **Fuel Consumption:** ~${results.opportunity.diesel_cost_inr}\n` +
          `• **Payoff Ratio:** **${results.opportunity.payoff_ratio}**\n` +
          `• **Recommended Strike Window:** **${results.opportunity.optimal_strike_window}**\n\n` +
          `**Oceanographic Rationale:** ${results.explainability.why_this_route}`;
      } else if (isChallenger) {
        return `### 🛡️ AI Challenger Adversarial Stress Test\n` +
          `• **Red-Team Verdict:** **${results.ai_challenger.verdict}**\n` +
          `• **Threat Vector Tested:** ${results.ai_challenger.threat_tested}\n` +
          `• **Mandatory Safeguard:** ${results.ai_challenger.safeguard_required}\n` +
          `• **Hard-Stop Trigger:** ${results.ai_challenger.hard_stop_condition}\n` +
          `• **Capsize Risk Index:** ${results.safety.capsize_risk_index}`;
      } else {
        return `### 🌊 Marine & Weather Assessment\n` +
          `• **Significant Wave Height:** ${results.ocean_analytics.significant_wave_height} (${results.ocean_analytics.sea_state})\n` +
          `• **Surface Wind:** ${results.weather.wind_speed}, Gusts to ${results.weather.wind_gusts}\n` +
          `• **Sea Surface Temperature (SST):** ${results.marine_data.sea_surface_temp} (Anomaly: ${results.marine_data.sst_anomaly})\n` +
          `• **Current Velocity:** ${results.ocean_analytics.surface_current}\n` +
          `• **Safety Status:** **${results.safety.operational_status}** (Score: **${results.safety.safety_score}/100**)\n\n` +
          `**Advisory:** ${results.safety.fisher_recommendation}`;
      }
  }
}

/**
 * Preloads and retrieves all available browser TTS voices
 */
export function getSupportedBrowserVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices() || [];
}

/**
 * Finds the highest-fidelity TTS voice installed in the browser/OS for the given language
 */
export function findBestVoiceForLanguage(languageCode) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const langObj = SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === languageCode);
  const targetSpeechCode = (langObj?.speechCode || languageCode || 'en-IN').toLowerCase().replace('_', '-');
  const targetPrefix = languageCode.toLowerCase();

  // 1. Exact match on speechCode (e.g., 'te-in', 'hi-in', 'ta-in')
  let match = voices.find(v => (v.lang || '').toLowerCase().replace('_', '-') === targetSpeechCode);
  if (match) return match;

  // 2. Prefix match on language code (e.g. starts with 'te', 'hi', 'ta')
  match = voices.find(v => (v.lang || '').toLowerCase().startsWith(targetPrefix));
  if (match) return match;

  // 3. Name-based match (e.g. voice name contains "Telugu", "Hindi", "Tamil", "Kannada")
  if (langObj?.name) {
    match = voices.find(v => (v.name || '').toLowerCase().includes(langObj.name.toLowerCase()));
    if (match) return match;
  }

  // 4. For English language code, return Indian English or default English
  if (languageCode === 'en') {
    const inEnglish = voices.find(v => (v.lang || '').toLowerCase().includes('en-in') || (v.lang || '').toLowerCase().includes('en_in'));
    if (inEnglish) return inEnglish;
    return voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voices[0] || null;
  }

  // 5. If no voice matching this specific Indian language is installed, return null
  // so that utterance.lang can direct the browser/OS synthesizer to use its native locale engine
  // rather than forcing an English or mismatched language voice to mispronounce it.
  return null;
}

/**
 * Text-to-Speech in the selected Indian language with dynamic voice matching and completion tracking
 */
export function speakTextInLanguage(text, languageCode, onEndCallback = null, onErrorCallback = null) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this environment.');
    if (onErrorCallback) onErrorCallback(new Error('SpeechSynthesis not supported'));
    if (onEndCallback) onEndCallback();
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // cancel any active speech immediately

    if (!text || !text.trim()) {
      if (onEndCallback) onEndCallback();
      return false;
    }

    // Clean markdown symbols, hashtags, asterisks for natural voice flow
    const cleanText = text
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*{1,3}/g, '')
      .replace(/_{1,3}/g, '')
      .replace(/`{1,3}/g, '')
      .replace(/[•\-\*]\s+/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.__currentUtterance = utterance; // Prevent garbage collection bug in Chrome/Edge

    const langObj = SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === languageCode);
    const bestVoice = findBestVoiceForLanguage(languageCode);

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else if (langObj) {
      utterance.lang = langObj.speechCode;
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95; // deliberate, authoritative pacing for maritime radio clarity
    utterance.pitch = 1.0;

    let hasEnded = false;
    const safeEnd = () => {
      if (!hasEnded) {
        hasEnded = true;
        window.__currentUtterance = null;
        if (onEndCallback) onEndCallback();
      }
    };

    utterance.onend = safeEnd;
    utterance.onerror = (err) => {
      console.warn('Speech synthesis playback notice:', err);
      if (onErrorCallback) onErrorCallback(err);
      safeEnd();
    };

    // Safety timeout in case browser TTS event stalls
    setTimeout(() => {
      if (!hasEnded && !window.speechSynthesis.speaking) {
        safeEnd();
      }
    }, Math.max(5000, cleanText.length * 90));

    // Chromium resume unlock if audio context was suspended
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);

    // Watchdog to resume if Chromium engine paused immediately on queue
    setTimeout(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 50);

    return true;
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    if (onErrorCallback) onErrorCallback(err);
    if (onEndCallback) onEndCallback();
    return false;
  }
}

/**
 * Halts any active speech synthesis immediately
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Automatic Multilingual Language Detection Engine:
 * 1. Unicode Script Analysis (100% confidence for native Indian scripts: Telugu, Tamil, Malayalam, Kannada, Bengali, Odia, Gujarati, Gurmukhi, Devanagari)
 * 2. Coastal Vocabulary & Maritime Heuristics (for transliterated/Romanized speech)
 * 3. Confidence scoring and structured metadata
 */
export function detectLanguageDetailed(text, fallback = 'en') {
  if (!text || typeof text !== 'string' || !text.trim()) {
    const fbObj = SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === fallback) || SUPPORTED_INDIAN_LANGUAGES[0];
    return {
      code: fallback,
      confidence: 0.5,
      isConfident: false,
      method: 'DEFAULT_FALLBACK',
      name: fbObj.name,
      nativeName: fbObj.nativeName,
      speechCode: fbObj.speechCode
    };
  }

  const raw = text.trim();

  // Tier 1: Native Script Unicode Blocks (Highest Accuracy > 98%)
  if (/[\u0C00-\u0C7F]/.test(raw)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'te');
    return { code: 'te', confidence: 0.99, isConfident: true, method: 'UNICODE_SCRIPT', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }
  if (/[\u0B80-\u0BFF]/.test(raw)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'ta');
    return { code: 'ta', confidence: 0.99, isConfident: true, method: 'UNICODE_SCRIPT', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }
  if (/[\u0D00-\u0D7F]/.test(raw)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'ml');
    return { code: 'ml', confidence: 0.99, isConfident: true, method: 'UNICODE_SCRIPT', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }
  if (/[\u0C80-\u0CFF]/.test(raw)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'kn');
    return { code: 'kn', confidence: 0.99, isConfident: true, method: 'UNICODE_SCRIPT', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }
  if (/[\u0980-\u09FF]/.test(raw)) {
    if (/[\u09F0\u09F1]/.test(raw)) {
      const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'as');
      return { code: 'as', confidence: 0.98, isConfident: true, method: 'UNICODE_SCRIPT', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
    }
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'bn');
    return { code: 'bn', confidence: 0.99, isConfident: true, method: 'UNICODE_SCRIPT', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }
  if (/[\u0A80-\u0AFF]/.test(raw)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'gu');
    return { code: 'gu', confidence: 0.99, isConfident: true, method: 'UNICODE_SCRIPT', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }
  if (/[\u0B00-\u0B7F]/.test(raw)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'or');
    return { code: 'or', confidence: 0.99, isConfident: true, method: 'UNICODE_SCRIPT', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }
  if (/[\u0A00-\u0A7F]/.test(raw)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'pa');
    return { code: 'pa', confidence: 0.99, isConfident: true, method: 'UNICODE_SCRIPT', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }
  if (/[\u0900-\u097F]/.test(raw)) {
    if (/(आहे|आहोत|करा|नका|लाटा|मासे|हवामान|कॅप्टन|सांगा)/i.test(raw)) {
      const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'mr');
      return { code: 'mr', confidence: 0.96, isConfident: true, method: 'UNICODE_SCRIPT_LEXICAL', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
    }
    if (/(आसात|नुस्तें|दर्या|ल्हारां)/i.test(raw)) {
      const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'kok') || SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'hi');
      return { code: 'kok', confidence: 0.94, isConfident: true, method: 'UNICODE_SCRIPT_LEXICAL', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
    }
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'hi');
    return { code: 'hi', confidence: 0.98, isConfident: true, method: 'UNICODE_SCRIPT', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }

  // Tier 2: Transliterated / Romanized Coastal Vocabulary Analysis
  const lower = raw.toLowerCase();

  // Telugu coastal vocabulary
  if (/\b(chepalu|chepala|chepa|ekkada|samudra|samudram|samudramu|alalu|gaali|gaalulu|vellacha|prayanam|undi|unnayi|ela|telugu|nanna|amma|kavali|bhadram|namaskaram|namaskaramu|namaskaramandi|namaste|bavundi)\b/i.test(lower)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'te');
    return { code: 'te', confidence: 0.92, isConfident: true, method: 'COASTAL_VOCABULARY', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }

  // Tamil coastal vocabulary
  if (/\b(meen|meengal|enga|engae|kadal|alai|kaatru|pogalama|paathukaapu|solla|vanakkam|illai|nalla|kadarkarai)\b/i.test(lower)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'ta');
    return { code: 'ta', confidence: 0.88, isConfident: true, method: 'COASTAL_VOCABULARY', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }

  // Hindi coastal vocabulary
  if (/\b(machli|machhli|kahan|samundar|samudra|toofan|lehar|lehrein|hawa|mausam|kaisa|surakshit|batao|chalo|namaste|sahayata)\b/i.test(lower)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'hi');
    return { code: 'hi', confidence: 0.88, isConfident: true, method: 'COASTAL_VOCABULARY', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }

  // Malayalam coastal vocabulary
  if (/\b(meen|evide|kadal|thiramala|kaattu|surakshitham|povaamo|undo|alla|namaskaram|vanchy|vallam)\b/i.test(lower)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'ml');
    return { code: 'ml', confidence: 0.86, isConfident: true, method: 'COASTAL_VOCABULARY', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }

  // Kannada coastal vocabulary
  if (/\b(meenu|elli|samudra|ale|gali|surakshita|hegide|namaskara|beku|illa|doni)\b/i.test(lower)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'kn');
    return { code: 'kn', confidence: 0.86, isConfident: true, method: 'COASTAL_VOCABULARY', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }

  // Bengali coastal vocabulary
  if (/\b(mach|macher|kothay|somudro|dheu|hawa|jhor|bipod|kemon|jabo|bhalo)\b/i.test(lower)) {
    const l = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === 'bn');
    return { code: 'bn', confidence: 0.86, isConfident: true, method: 'COASTAL_VOCABULARY', name: l.name, nativeName: l.nativeName, speechCode: l.speechCode };
  }

  // English fallback or explicitly recognized English words
  const defaultObj = SUPPORTED_INDIAN_LANGUAGES.find(x => x.code === fallback) || SUPPORTED_INDIAN_LANGUAGES[0];
  return {
    code: fallback,
    confidence: fallback === 'en' ? 0.80 : 0.60,
    isConfident: false,
    method: 'LATIN_FALLBACK',
    name: defaultObj.name,
    nativeName: defaultObj.nativeName,
    speechCode: defaultObj.speechCode
  };
}

/**
 * Returns simple language code from detected text
 */
export function detectLanguageFromText(text, fallback = 'en') {
  const result = detectLanguageDetailed(text, fallback);
  return result.code;
}

export const NAV_TRANSLATIONS = {
  en: {
    home: 'Home',
    executiveBrain: 'Executive Brain',
    digitalTwin: 'Digital Twin & What-If',
    liveMission: 'Live Mission & Safety',
    missionReplay: 'Mission Replay',
    aiScientist: 'AI Scientist & Agents',
    marineAi: 'Marine AI',
    copilotChat: 'Marine AI',
    talkToMarineAi: 'Talk to Marine AI',
    askMarineAi: 'Ask Marine AI',
    marineAiVoice: 'Marine AI Voice',
    planMission: 'Plan a Mission',
    exploreMarineMap: 'Explore Marine Map',
    weather: 'Weather',
    fishingZones: 'Fishing Zones',
    seaConditions: 'Sea Conditions',
    safeToSail: 'Safe to Sail',
    safeRoute: 'Safe Route',
    nearbyAreas: 'Nearby Marine Areas',
    liveTelemetry: 'Live Vessel Telemetry',
    missionSetup: 'Mission Setup',
    missionParameters: 'Mission Parameters',
    generatedPlans: 'Generated Mission Plans',
    whatIfSimulator: 'What-If Simulator',
    simulationMap: 'Simulation Map',
    riskOpportunity: 'Risk / Opportunity Analysis',
    decisionRecommendation: 'Decision / Recommendation',
    activeVesselMap: 'Active Vessel Map',
    safetyGuardian: 'Safety Guardian',
    realTimeAdvisories: 'Real-Time Advisory Feed',
    emergencyActions: 'Emergency Actions',
    overview: 'Overview',
    timeline: 'Timeline',
    whyWhyNot: 'Why / Why Not',
    dataEvidence: 'Data & Evidence',
    outcomeLearning: 'Outcome & Learning',
    agentSquadron: '16-Agent Squadron',
    task: 'Task',
    processing: 'Processing',
    result: 'Result',
    evidence: 'Evidence',
    settings: 'Settings',
    offlinePack: 'Offline Pack',
    familyLink: 'Family Link',
    sos: 'SOS 1093',
    statusBadge: '16 Agents Synchronized',
    satellite: 'Satellite',
    streets: 'Streets',
    ocean: 'Ocean',
    dark: 'Dark'
  },
  hi: {
    home: 'होम',
    executiveBrain: 'कार्यकारी मस्तिष्क',
    digitalTwin: 'डिजिटल ट्विन व सिमुलेशन',
    liveMission: 'लाइव मिशन और सुरक्षा',
    missionReplay: 'मिशन रीप्ले व समीक्षा',
    aiScientist: 'एआई वैज्ञानिक व 16 एजेंट',
    marineAi: 'मरीन एआई',
    copilotChat: 'मरीन एआई',
    talkToMarineAi: 'मरीन एआई से बात करें',
    askMarineAi: 'मरीन एआई से पूछें',
    marineAiVoice: 'मरीन एआई वॉइस',
    planMission: 'मिशन योजना बनाएं',
    exploreMarineMap: 'समुद्री मानचित्र देखें',
    weather: 'मौसम',
    fishingZones: 'मत्स्य क्षेत्र',
    seaConditions: 'समुद्री स्थिति',
    safeToSail: 'क्या यात्रा सुरक्षित है?',
    safeRoute: 'सुरक्षित मार्ग',
    nearbyAreas: 'निकटवर्ती समुद्री क्षेत्र',
    liveTelemetry: 'लाइव नौका टेलीमेट्री',
    missionSetup: 'मिशन सेटअप',
    missionParameters: 'मिशन पैरामीटर',
    generatedPlans: 'उत्पन्न मिशन योजनाएं',
    whatIfSimulator: 'व्हाट-इफ सिमुलेटर',
    simulationMap: 'सिमुलेशन मानचित्र',
    riskOpportunity: 'जोखिम व अवसर विश्लेषण',
    decisionRecommendation: 'निर्णय व सिफारिश',
    activeVesselMap: 'सक्रिय नौका मानचित्र',
    safetyGuardian: 'सुरक्षा गार्जियन',
    realTimeAdvisories: 'रीयल-टाइम सलाह फ़ीड',
    emergencyActions: 'आपातकालीन कार्रवाई',
    overview: 'अवलोकन',
    timeline: 'समयरेखा',
    whyWhyNot: 'क्यों और क्यों नहीं',
    dataEvidence: 'डेटा और साक्ष्य',
    outcomeLearning: 'परिणाम व सीख',
    agentSquadron: '16-एजेंट स्क्वाड्रन',
    task: 'कार्य',
    processing: 'प्रक्रिया जारी',
    result: 'परिणाम',
    evidence: 'साक्ष्य',
    settings: 'सेटिंग्स',
    offlinePack: 'ऑफलाइन पैक',
    familyLink: 'फैमिली लिंक',
    sos: 'आपातकालीन 1093',
    statusBadge: '16 एजेंट सक्रिय',
    satellite: 'सैटेलाइट',
    streets: 'सड़कें/मानचित्र',
    ocean: 'महासागर',
    dark: 'डार्क'
  },
  te: {
    home: 'హోమ్',
    executiveBrain: 'ఎగ్జిక్యూటివ్ బ్రెయిన్',
    digitalTwin: 'డిజిటల్ ట్విన్ & వాట్-ఇఫ్',
    liveMission: 'లైవ్ మిషన్ & భద్రత',
    missionReplay: 'మిషన్ రీప్లే సమీక్ష',
    aiScientist: 'ఏఐ సైంటిస్ట్ & ఏజెంట్లు',
    marineAi: 'మెరైన్ ఏఐ',
    copilotChat: 'మెరైన్ ఏఐ',
    talkToMarineAi: 'మెరైన్ ఏఐతో మాట్లాడండి',
    askMarineAi: 'మెరైన్ ఏఐని అడగండి',
    marineAiVoice: 'మెరైన్ ఏఐ వాయిస్',
    planMission: 'మిషన్ ప్లాన్ చేయండి',
    exploreMarineMap: 'సముద్ర మ్యాప్ అన్వేషించండి',
    weather: 'వాతావరణం',
    fishingZones: 'చేపల వేట జోన్లు',
    seaConditions: 'సముద్ర పరిస్థితులు',
    safeToSail: 'సముద్రయానం సురక్షితమా?',
    safeRoute: 'సురక్షిత మార్గం',
    nearbyAreas: 'సమీప సముద్ర ప్రాంతాలు',
    liveTelemetry: 'లైవ్ బోట్ టెలిమెట్రీ',
    missionSetup: 'మిషన్ సెటప్',
    missionParameters: 'మిషన్ పారామితులు',
    generatedPlans: 'రూపొందించిన మిషన్ ప్లాన్లు',
    whatIfSimulator: 'వాట్-ఇఫ్ సిమ్యులేటర్',
    simulationMap: 'సిమ్యులేషన్ మ్యాప్',
    riskOpportunity: 'రిస్క్ & అవకాశ విశ్లేషణ',
    decisionRecommendation: 'నిర్ణయం & సిఫార్సు',
    activeVesselMap: 'యాక్టివ్ బోట్ మ్యాప్',
    safetyGuardian: 'భద్రతా గార్డియన్',
    realTimeAdvisories: 'రియల్-టైమ్ సలహాలు',
    emergencyActions: 'అత్యవసర చర్యలు',
    overview: 'అవలోకనం',
    timeline: 'టైమ్‌లైన్',
    whyWhyNot: 'ఎందుకు & ఎందుకు కాదు',
    dataEvidence: 'డేటా & సాక్ష్యం',
    outcomeLearning: 'ఫలితాలు & అభ్యాసం',
    agentSquadron: '16-ఏజెంట్ల స్క్వాడ్రన్',
    task: 'టాస్క్',
    processing: 'ప్రాసెసింగ్',
    result: 'ఫలితం',
    evidence: 'సాక్ష్యం',
    settings: 'సెట్టింగ్‌లు',
    offlinePack: 'ఆఫ్‌లైన్ ప్యాక్',
    familyLink: 'ఫ్యామిలీ లింక్',
    sos: 'ఎమర్జెన్సీ 1093',
    statusBadge: '16 ఏజెంట్లు సమన్వయం',
    satellite: 'శాటిలైట్',
    streets: 'రోడ్లు/మ్యాప్',
    ocean: 'మహాసముద్రం',
    dark: 'డార్క్'
  },
  ta: {
    home: 'முகப்பு',
    executiveBrain: 'நிர்வாக மூளை',
    digitalTwin: 'டிஜிட்டல் இரட்டை & உருவகப்படுத்துதல்',
    liveMission: 'நேரலை பணி & பாதுகாப்பு',
    missionReplay: 'பயண மறுபார்வை',
    aiScientist: 'ஏஐ விஞ்ஞானி & முகவர்கள்',
    marineAi: 'மரைன் ஏஐ',
    copilotChat: 'மரைன் ஏஐ',
    talkToMarineAi: 'மரைன் ஏஐ-யிடம் பேசுங்கள்',
    askMarineAi: 'மரைன் ஏஐ-யிடம் கேளுங்கள்',
    marineAiVoice: 'மரைன் ஏஐ குரல்',
    planMission: 'பயணத் திட்டம் அமைக்க',
    exploreMarineMap: 'கடல் வரைபடத்தை ஆராய்க',
    weather: 'வானிலை',
    fishingZones: 'மீன்பிடி மண்டலங்கள்',
    seaConditions: 'கடல் நிலை',
    safeToSail: 'பயணம் பாதுகாப்பானதா?',
    safeRoute: 'பாதுகாப்பான பாதை',
    nearbyAreas: 'அருகிலுள்ள கடல் பகுதிகள்',
    liveTelemetry: 'நேரலை படகு டெலிமெட்ரி',
    missionSetup: 'பயண அமைவு',
    missionParameters: 'பயண அளவுருக்கள்',
    generatedPlans: 'உருவாக்கப்பட்ட பயணத் திட்டங்கள்',
    whatIfSimulator: 'வாட்-இஃப் சிமுலேட்டர்',
    simulationMap: 'உருவகப்படுத்துதல் வரைபடம்',
    riskOpportunity: 'ஆபத்து & வாய்ப்பு பகுப்பாய்வு',
    decisionRecommendation: 'முடிவு & பரிந்துரை',
    activeVesselMap: 'செயலில் உள்ள படகு வரைபடம்',
    safetyGuardian: 'பாதுகாப்பு பாதுகாவலர்',
    realTimeAdvisories: 'நேரலை ஆலோசனை ஊட்டம்',
    emergencyActions: 'அவசர நடவடிக்கைகள்',
    overview: 'கண்ணோட்டம்',
    timeline: 'காலவரிசை',
    whyWhyNot: 'ஏன் & ஏன் இல்லை',
    dataEvidence: 'தரவு & சான்றுகள்',
    outcomeLearning: 'முடிவு & கற்றல்',
    agentSquadron: '16-முகவர்கள் அணி',
    task: 'பணி',
    processing: 'செயலாக்கம்',
    result: 'முடிவு',
    evidence: 'சான்று',
    settings: 'அமைப்புகள்',
    offlinePack: 'ஆஃப்லைன் பேக்',
    familyLink: 'குடும்ப பாதுகாப்பு',
    sos: 'அவசரம் 1093',
    statusBadge: '16 முகவர்கள் தயார்',
    satellite: 'செயற்கைக்கோள்',
    streets: 'சாலைகள்',
    ocean: 'கடல்',
    dark: 'இருண்ட'
  },
  ml: {
    home: 'ഹോം',
    executiveBrain: 'എക്സിക്യൂട്ടീവ് ബ്രെയിൻ',
    digitalTwin: 'ഡിജിറ്റൽ ട്വിൻ & സിമുലേഷൻ',
    liveMission: 'തത്സമയ ദൗത്യവും സുരക്ഷയും',
    missionReplay: 'ദൗത്യ പുനരവലോകനം',
    aiScientist: 'എഐ ശാസ്ത്രജ്ഞനും ഏജന്റുകളും',
    marineAi: 'മറൈൻ എഐ',
    copilotChat: 'മറൈൻ എഐ',
    talkToMarineAi: 'മറൈൻ എഐയോട് സംസാരിക്കുക',
    askMarineAi: 'മറൈൻ എഐയോട് ചോദിക്കുക',
    marineAiVoice: 'മറൈൻ എഐ വോയ്സ്',
    planMission: 'ദൗത്യം ആസൂത്രണം ചെയ്യുക',
    exploreMarineMap: 'സമുദ്ര മാപ്പ് പര്യവേക്ഷണം ചെയ്യുക',
    weather: 'കാലാവസ്ഥ',
    fishingZones: 'മത്സ്യബന്ധന മേഖലകൾ',
    seaConditions: 'സമുദ്രാവസ്ഥ',
    safeToSail: 'യാത്ര സുരക്ഷിതമാണോ?',
    safeRoute: 'സുരക്ഷിത പാത',
    nearbyAreas: 'സമീപ തീരദേശ പ്രദേശങ്ങൾ',
    liveTelemetry: 'തത്സമയ ബോട്ട് ടെലിമെട്രി',
    missionSetup: 'ദൗത്യ സജ്ജീകരണം',
    missionParameters: 'ദൗത്യ പാരാമീറ്ററുകൾ',
    generatedPlans: 'രൂപീകരിച്ച ദൗത്യ പ്ലാനുകൾ',
    whatIfSimulator: 'വാട്ട്-ഇഫ് സിമുലേറ്റർ',
    simulationMap: 'സിമുലേഷൻ മാപ്പ്',
    riskOpportunity: 'സാധ്യത & അപകടസാധ്യത അവലോകനം',
    decisionRecommendation: 'തീരുമാനവും ശുപാർശയും',
    activeVesselMap: 'സജീവ ബോട്ട് മാപ്പ്',
    safetyGuardian: 'സുരക്ഷാ ഗാർഡിയൻ',
    realTimeAdvisories: 'തത്സമയ മുന്നറിയിപ്പുകൾ',
    emergencyActions: 'അടിയന്തര നടപടികൾ',
    overview: 'അവലോകനം',
    timeline: 'ടൈംലൈൻ',
    whyWhyNot: 'എന്തുകൊണ്ട് & എന്തുകൊണ്ട് അല്ല',
    dataEvidence: 'ഡാറ്റയും തെളിവുകളും',
    outcomeLearning: 'ഫലവും പഠനങ്ങളും',
    agentSquadron: '16-ഏജന്റ് സ്ക്വാഡ്രൺ',
    task: 'ടാസ്ക്',
    processing: 'പ്രോസസ്സിംഗ്',
    result: 'ഫലം',
    evidence: 'തെളിവ്',
    settings: 'സെറ്റിംഗ്സ്',
    offlinePack: 'ഓഫ്‌ലൈൻ പാക്ക്',
    sos: 'അടിയന്തരം 1093',
    statusBadge: '16 ഏജന്റുകൾ സജ്ജം',
    satellite: 'ഉപഗ്രഹം',
    streets: 'മാപ്പ്',
    ocean: 'സമുദ്രം',
    dark: 'ഡാർക്ക്'
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    executiveBrain: 'ಕಾರ್ಯನಿರ್ವಾಹಕ ಮಿದುಳು',
    digitalTwin: 'ಡಿಜಿಟಲ್ ಟ್ವಿನ್ & ಸಿಮ್ಯುಲೇಶನ್',
    liveMission: 'ಲೈವ್ ಕಾರ್ಯಾಚರಣೆ & ಸುರಕ್ಷತೆ',
    missionReplay: 'ಮಿಷನ್ ರಿಪ್ಲೇ ವಿಮರ್ಶೆ',
    aiScientist: 'ಎಐ ವಿಜ್ಞಾನಿ & ಏಜೆಂಟ್‌ಗಳು',
    marineAi: 'ಮರೈನ್ ಎಐ',
    copilotChat: 'ಮರೈನ್ ಎಐ',
    talkToMarineAi: 'ಮರೈನ್ ಎಐ ಜೊತೆ ಮಾತನಾಡಿ',
    askMarineAi: 'ಮರೈನ್ ಎಐ ಅನ್ನು ಕೇಳಿ',
    marineAiVoice: 'ಮರೈನ್ ಎಐ ಧ್ವನಿ',
    planMission: 'ಮಿಷನ್ ಯೋಜಿಸಿ',
    exploreMarineMap: 'ಸಾಗರ ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ',
    weather: 'ಹವಾಮಾನ',
    fishingZones: 'ಮೀನುಗಾರಿಕೆ ವಲಯಗಳು',
    seaConditions: 'ಸಮುದ್ರ ಪರಿಸ್ಥಿತಿ',
    safeToSail: 'ಸಮುದ್ರಯಾನ ಸುರಕ್ಷಿತವೇ?',
    safeRoute: 'ಸುರಕ್ಷಿತ ಮಾರ್ಗ',
    nearbyAreas: 'ಹತ್ತಿರದ ಕರಾವಳಿ ಪ್ರದೇಶಗಳು',
    liveTelemetry: 'ಲೈವ್ ಬೋಟ್ ಟೆಲಿಮೆಟ್ರಿ',
    missionSetup: 'ಮಿಷನ್ ಸೆಟಪ್',
    missionParameters: 'ಮಿಷನ್ ನಿಯತಾಂಕಗಳು',
    generatedPlans: 'ಉತ್ಪಾದಿತ ಮಿಷನ್ ಯೋಜನೆಗಳು',
    whatIfSimulator: 'ವಾಟ್-ಇಫ್ ಸಿಮ್ಯುಲೇಟರ್',
    simulationMap: 'ಸಿಮ್ಯುಲೇಶನ್ ನಕ್ಷೆ',
    riskOpportunity: 'ಅಪಾಯ & ಅವಕಾಶ ವಿಶ್ಲೇಷಣೆ',
    decisionRecommendation: 'ನಿರ್ಧಾರ & ಶಿಫಾರಸು',
    activeVesselMap: 'ಸಕ್ರಿಯ ಬೋಟ್ ನಕ್ಷೆ',
    safetyGuardian: 'ಸುರಕ್ಷತಾ ಗಾರ್ಡಿಯನ್',
    realTimeAdvisories: 'ರಿಯಲ್-ಟೈಮ್ ಸಲಹೆಗಳು',
    emergencyActions: 'ತುರ್ತು ಕ್ರಮಗಳು',
    overview: 'ಅವಲೋಕನ',
    timeline: 'ಸಮಯರೇಖೆ',
    whyWhyNot: 'ಏಕೆ & ಏಕೆ ಅಲ್ಲ',
    dataEvidence: 'ದತ್ತಾಂಶ & ಪುರಾವೆ',
    outcomeLearning: 'ಫಲಿತಾಂಶ & ಕಲಿಕೆ',
    agentSquadron: '16-ಏಜೆಂಟ್‌ಗಳ ಸ್ಕ್ವಾಡ್ರನ್',
    task: 'ಕಾರ್ಯ',
    processing: 'ಪ್ರಕ್ರಿಯೆ',
    result: 'ಫಲಿತಾಂಶ',
    evidence: 'ಪುರಾವೆ',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    offlinePack: 'ಆಫ್‌ಲೈನ್ ಪ್ಯಾಕ್',
    sos: 'ತುರ್ತು 1093',
    statusBadge: '16 ಏಜೆಂಟ್‌ಗಳು ಸಕ್ರಿಯ',
    satellite: 'ಉಪಗ್ರಹ',
    streets: 'ರಸ್ತೆಗಳು',
    ocean: 'ಸಾಗರ',
    dark: 'ಡಾರ್ಕ್'
  },
  mr: {
    home: 'मुख्यपृष्ठ',
    executiveBrain: 'कार्यकारी मेंदू',
    digitalTwin: 'डिजिटल ट्विन आणि व्हॉट-इफ',
    liveMission: 'थेट मोहीम आणि सुरक्षा',
    missionReplay: 'मोहीम रीप्ले व आढावा',
    aiScientist: 'एआय शास्त्रज्ञ व 16 एजंट',
    marineAi: 'मरीन एआय',
    copilotChat: 'मरीन एआय',
    talkToMarineAi: 'मरीन एआयशी बोला',
    askMarineAi: 'मरीन एआयला विचारा',
    marineAiVoice: 'मरीन एआय आवाज',
    planMission: 'मोहीम आखा',
    exploreMarineMap: 'सागरी नकाशा एक्सप्लोर करा',
    weather: 'हवामान',
    fishingZones: 'मासेमारी क्षेत्र',
    seaConditions: 'समुद्राची स्थिती',
    safeToSail: 'प्रवास सुरक्षित आहे का?',
    safeRoute: 'सुरक्षित मार्ग',
    nearbyAreas: 'जवळपासचे सागरी क्षेत्र',
    liveTelemetry: 'थेट बोट टेलिमेट्री',
    missionSetup: 'मोहीम सेटअप',
    missionParameters: 'मोहीम घटक',
    generatedPlans: 'तयार केलेल्या मोहिमा',
    whatIfSimulator: 'व्हॉट-इफ सिम्युलेटर',
    simulationMap: 'सिम्युलेशन नकाशा',
    riskOpportunity: 'धोका व संधी विश्लेषण',
    decisionRecommendation: 'निर्णय व शिफारस',
    activeVesselMap: 'सक्रिय बोट नकाशा',
    safetyGuardian: 'सुरक्षा रक्षक',
    realTimeAdvisories: 'थेट सूचना फीड',
    emergencyActions: 'तातडीच्या उपाययोजना',
    overview: 'आढावा',
    timeline: 'टाइमलाइन',
    whyWhyNot: 'का आणि का नाही',
    dataEvidence: 'डेटा आणि पुरावा',
    outcomeLearning: 'निष्कर्ष व शिकवण',
    agentSquadron: '16-एजंट पथक',
    task: 'कार्य',
    processing: 'प्रक्रिया',
    result: 'निकाल',
    evidence: 'पुरावा',
    settings: 'सेटिंग्ज',
    offlinePack: 'ऑफलाइन पॅक',
    sos: 'आपत्कालीन 1093',
    statusBadge: '16 एजंट सक्रिय',
    satellite: 'उपग्रह',
    streets: 'नकाशा',
    ocean: 'महासागर',
    dark: 'डार्क'
  },
  gu: {
    home: 'હોમ',
    executiveBrain: 'એક્ઝિક્યુટિવ બ્રેઈન',
    digitalTwin: 'ડિજિટલ ટ્વિન અને સિમ્યુલેશન',
    liveMission: 'લાઈવ મિશન અને સુરક્ષા',
    missionReplay: 'મિશન રીપ્લે ડેબ્રીફ',
    aiScientist: 'એઆઈ વૈજ્ઞાનિક અને એજન્ટો',
    marineAi: 'મરીન એઆઈ',
    copilotChat: 'મરીન એઆઈ',
    talkToMarineAi: 'મરીન એઆઈ સાથે વાત કરો',
    askMarineAi: 'મરીન એઆઈને પૂછો',
    marineAiVoice: 'મરીન એઆઈ અવાજ',
    planMission: 'મિશન પ્લાન કરો',
    exploreMarineMap: 'દરિયાઈ નકશો જુઓ',
    weather: 'હવામાન',
    fishingZones: 'માછીમારી ઝોન',
    seaConditions: 'દરિયાની સ્થિતિ',
    safeToSail: 'મુસાફરી સલામત છે?',
    safeRoute: 'સલામત રૂટ',
    nearbyAreas: 'નજીકના દરિયાઈ વિસ્તારો',
    liveTelemetry: 'લાઈવ બોટ ટેલિમેટ્રી',
    missionSetup: 'મિશન સેટઅપ',
    missionParameters: 'મિશન પરિમાણો',
    generatedPlans: 'તૈયાર કરાયેલ પ્લાન',
    whatIfSimulator: 'વ્હોટ-ઇફ સિમ્યુલેટર',
    simulationMap: 'સિમ્યુલેશન નકશો',
    riskOpportunity: 'જોખમ અને તક વિશ્લેષણ',
    decisionRecommendation: 'નિર્ણય અને ભલામણ',
    activeVesselMap: 'સક્રિય બોટ નકશો',
    safetyGuardian: 'સુરક્ષા ગાર્ડિયન',
    realTimeAdvisories: 'લાઈવ સલાહ ફીડ',
    emergencyActions: 'કટોકટીના પગલાં',
    overview: 'વિહંગાવલોકન',
    timeline: 'સમયરેખા',
    whyWhyNot: 'શા માટે અને શા માટે નહીં',
    dataEvidence: 'ડેટા અને પુરાવા',
    outcomeLearning: 'પરિણામ અને શીખ',
    agentSquadron: '16-એજન્ટ સ્ક્વોડ્રન',
    task: 'કાર્ય',
    processing: 'પ્રોસેસિંગ',
    result: 'પરિણામ',
    evidence: 'પુરાવો',
    settings: 'સેટિંગ્સ',
    offlinePack: 'ઓફલાઈન પેક',
    sos: 'ઇમરજન્સી 1093',
    statusBadge: '16 એજન્ટો સક્રિય',
    satellite: 'સેટેલાઇટ',
    streets: 'નકશો',
    ocean: 'મહાસાગર',
    dark: 'ડાર્ક'
  },
  bn: {
    home: 'হোম',
    executiveBrain: 'এক্সিকিউটিভ ব্রেন',
    digitalTwin: 'ডিজিটাল টুইন ও সিমুলেশন',
    liveMission: 'লাইভ মিশন ও নিরাপত্তা',
    missionReplay: 'মিশন রিপ্লে ও পর্যালোচনা',
    aiScientist: 'এআই বিজ্ঞানী ও ১৬টি এজেন্ট',
    marineAi: 'মেরিন এআই',
    copilotChat: 'মেরিন এআই',
    talkToMarineAi: 'মেরিন এআই-এর সাথে কথা বলুন',
    askMarineAi: 'মেরিন এআই-কে জিজ্ঞাসা করুন',
    marineAiVoice: 'মেরিন এআই ভয়েস',
    planMission: 'মিশন পরিকল্পনা করুন',
    exploreMarineMap: 'সমুদ্র মানচিত্র অন্বেষণ করুন',
    weather: 'আবহাওয়া',
    fishingZones: 'মৎস্য ক্ষেত্র',
    seaConditions: 'সমুদ্রের অবস্থা',
    safeToSail: 'যাত্রা কি নিরাপদ?',
    safeRoute: 'নিরাপদ রুট',
    nearbyAreas: 'নিকটবর্তী উপকূলীয় অঞ্চল',
    liveTelemetry: 'লাইভ বোট টেলিমেট্রি',
    missionSetup: 'মিশন সেটআপ',
    missionParameters: 'মিশন পরামিতি',
    generatedPlans: 'উৎপাদিত মিশন প্ল্যান',
    whatIfSimulator: 'হোয়াট-ইফ সিমুলেটর',
    simulationMap: 'সিমুলেশন মানচিত্র',
    riskOpportunity: 'ঝুঁকি ও সুযোগ বিশ্লেষণ',
    decisionRecommendation: 'সিদ্ধান্ত ও সুপারিশ',
    activeVesselMap: 'সক্রিয় বোট মানচিত্র',
    safetyGuardian: 'সুরক্ষা অভিভাবক',
    realTimeAdvisories: 'লাইভ পরামর্শ ফিড',
    emergencyActions: 'জরুরি পদক্ষেপ',
    overview: 'সংক্ষিপ্ত বিবরণ',
    timeline: 'টাইমলাইন',
    whyWhyNot: 'কেন এবং কেন নয়',
    dataEvidence: 'উপাত্ত ও প্রমাণ',
    outcomeLearning: 'ফলাফল ও শিক্ষা',
    agentSquadron: '১৬-এজেন্ট স্কোয়াড্রন',
    task: 'টাস্ক',
    processing: 'প্রক্রিয়াকরণ',
    result: 'ফলাফল',
    evidence: 'প্রমাণ',
    settings: 'সেটিংস',
    offlinePack: 'অফলাইন প্যাক',
    sos: 'জরুরি ১০৯৩',
    statusBadge: '১৬টি এজেন্ট সক্রিয়',
    satellite: 'স্যাটেলাইট',
    streets: 'মানচিত্র',
    ocean: 'মহাসমুদ্র',
    dark: 'ডার্ক'
  },
  or: {
    home: 'ମୂଳପୃଷ୍ଠା',
    executiveBrain: 'ଏଗଜିକ୍ୟୁଟିଭ ବ୍ରେନ',
    digitalTwin: 'ଡିଜିଟାଲ ଟ୍ୱିନ ଓ ସିମୁଲେସନ',
    liveMission: 'ଲାଇଭ ମିଶନ ଓ ସୁରକ୍ଷା',
    missionReplay: 'ମିଶନ ରିପ୍ଲେ ସମୀକ୍ଷା',
    aiScientist: 'ଏଆଇ ବୈଜ୍ଞାନିକ ଓ ଏଜେଣ୍ଟ',
    marineAi: 'ମେରିନ ଏଆଇ',
    copilotChat: 'ମେରିନ ଏଆଇ',
    talkToMarineAi: 'ମେରିନ ଏଆଇ ସହ କଥା ହୁଅନ୍ତୁ',
    askMarineAi: 'ମେରିନ ଏଆଇକୁ ପଚାରନ୍ତୁ',
    marineAiVoice: 'ମେରିନ ଏଆଇ ଭଏସ୍',
    planMission: 'ମିଶନ ଯୋଜନା କରନ୍ତୁ',
    exploreMarineMap: 'ସାମୁଦ୍ରିକ ମାନଚିତ୍ର ଦେଖନ୍ତୁ',
    weather: 'ପାଣିପାଗ',
    fishingZones: 'ମାଛ ଧରିବା ଅଞ୍ଚଳ',
    seaConditions: 'ସମୁଦ୍ର ସ୍ଥିତି',
    safeToSail: 'ଯାତ୍ରା ସୁରକ୍ଷିତ କି?',
    safeRoute: 'ନିରାପଦ ରୁଟ୍',
    nearbyAreas: 'ନିକଟବର୍ତ୍ତୀ ସାମୁଦ୍ରିକ ଅଞ୍ଚଳ',
    liveTelemetry: 'ଲାଇଭ ବୋଟ୍ ଟେଲିମେଟ୍ରି',
    missionSetup: 'ମିଶନ ସେଟଅପ୍',
    missionParameters: 'ମିଶନ ମାନଦଣ୍ଡ',
    generatedPlans: 'ପ୍ରସ୍ତୁତ ମିଶନ ଯୋଜନା',
    whatIfSimulator: 'ହ୍ୱାଟ୍-ଇଫ୍ ସିମୁଲେଟର',
    simulationMap: 'ସିମୁଲେସନ ମାନଚିତ୍ର',
    riskOpportunity: 'ବିପଦ ଓ ସୁଯୋଗ ବିଶ୍ଳେଷଣ',
    decisionRecommendation: 'ନିଷ୍ପତ୍ତି ଓ ପରାମର୍ଶ',
    activeVesselMap: 'ସକ୍ରିୟ ବୋଟ୍ ମାନଚିତ୍ର',
    safetyGuardian: 'ସୁରକ୍ଷା ଅଭିଭାବକ',
    realTimeAdvisories: 'ଲାଇଭ୍ ପରାମର୍ଶ ଫିଡ୍',
    emergencyActions: 'ଜରୁରୀକାଳୀନ ପଦକ୍ଷେପ',
    overview: 'ସମୀକ୍ଷା',
    timeline: 'ସମୟସୂଚୀ',
    whyWhyNot: 'କାହିଁକି ଏବଂ କାହିଁକି ନୁହେଁ',
    dataEvidence: 'ତଥ୍ୟ ଓ ପ୍ରମାଣ',
    outcomeLearning: 'ଫଳାଫଳ ଓ ଶିକ୍ଷା',
    agentSquadron: '୧୬-ଏଜେଣ୍ଟ ସ୍କ୍ୱାଡ୍ରନ୍',
    task: 'କାର୍ଯ୍ୟ',
    processing: 'ପ୍ରକ୍ରିୟାକରଣ',
    result: 'ଫଳାଫଳ',
    evidence: 'ପ୍ରମାଣ',
    settings: 'ସେଟିଙ୍ଗ୍ସ',
    offlinePack: 'ଅଫଲାଇନ ପ୍ୟାକ',
    sos: 'ଜରୁରୀକାଳୀନ ୧୦୯୩',
    statusBadge: '୧୬ଟି ଏଜେଣ୍ଟ ପ୍ରସ୍ତୁତ',
    satellite: 'ସାଟେଲାଇଟ୍',
    streets: 'ମାନଚିତ୍ର',
    ocean: 'ମହାସାଗର',
    dark: 'ଡାର୍କ'
  },
  kok: {
    home: 'घर',
    executiveBrain: 'कार्यकारी मेंदू',
    digitalTwin: 'डिजिटल ट्विन सिमुलेशन',
    liveMission: 'थेट मोहीम आनी सुरक्षा',
    missionReplay: 'मोहीम रीप्ले',
    aiScientist: 'एआय शास्त्रज्ञ आनी एजंट',
    marineAi: 'मरीन एआय',
    copilotChat: 'मरीन एआय',
    talkToMarineAi: 'मरीन एआय कडेन उलय',
    askMarineAi: 'मरीन एआय कडेन विचार',
    marineAiVoice: 'मरीन एआय आवाज',
    planMission: 'मोहीम आखा',
    exploreMarineMap: 'दर्याचो नकासो पळयात',
    weather: 'हवामान',
    fishingZones: 'नुस्तेमारी क्षेत्र',
    seaConditions: 'दर्याची स्थिती',
    safeToSail: 'प्रवास सुरक्षित आसा?',
    safeRoute: 'सुरक्षित मार्ग',
    nearbyAreas: 'लागसारचे दर्या वाठार',
    liveTelemetry: 'थेट बोटीची टेलिमेट्री',
    missionSetup: 'मोहीम मांडणी',
    missionParameters: 'मोहीम घटक',
    generatedPlans: 'तयार केल्ली मोहीम',
    whatIfSimulator: 'व्हॉट-इफ सिम्युलेटर',
    simulationMap: 'सिम्युलेशन नकासो',
    riskOpportunity: 'धोको आनी संद विश्लेषण',
    decisionRecommendation: 'निर्णय आनी शिफारस',
    activeVesselMap: 'सक्रिय बोट नकासो',
    safetyGuardian: 'सुरक्षा रक्षक',
    realTimeAdvisories: 'थेट शिफारसी',
    emergencyActions: 'तातडीचे उपाय',
    overview: 'आढावो',
    timeline: 'वेळारख',
    whyWhyNot: 'कित्याक आनी कित्याक न्हय',
    dataEvidence: 'डेटा आनी पुरावे',
    outcomeLearning: 'निकाल आनी शिकप',
    agentSquadron: '16-एजंट पंगड',
    task: 'काम',
    processing: 'प्रक्रिया',
    result: 'निकाल',
    evidence: 'पुरावो',
    settings: 'सेटिंग्स',
    offlinePack: 'ऑफलाइन पॅक',
    sos: 'संकट 1093',
    statusBadge: '16 एजंट सज्ज',
    satellite: 'उपग्रह',
    streets: 'नकासो',
    ocean: 'महासागर',
    dark: 'काळोख'
  },
  pa: {
    home: 'ਘਰ',
    executiveBrain: 'ਐਗਜ਼ੀਕਿਊਟਿਵ ਬ੍ਰੇਨ',
    digitalTwin: 'ਡਿਜੀਟਲ ਟਵਿਨ ਸਿਮੂਲੇਸ਼ਨ',
    liveMission: 'ਲਾਈਵ ਮਿਸ਼ਨ ਅਤੇ ਸੁਰੱਖਿਆ',
    missionReplay: 'ਮਿਸ਼ਨ ਰੀਪਲੇਅ ਸਮੀਖਿਆ',
    aiScientist: 'ਏਆਈ ਵਿਗਿਆਨੀ ਅਤੇ ਏਜੰਟ',
    marineAi: 'ਮਰੀਨ ਏਆਈ',
    copilotChat: 'ਮਰੀਨ ਏਆਈ',
    talkToMarineAi: 'ਮਰੀਨ ਏਆਈ ਨਾਲ ਗੱਲ ਕਰੋ',
    askMarineAi: 'ਮਰੀਨ ਏਆਈ ਨੂੰ ਪੁੱਛੋ',
    marineAiVoice: 'ਮਰੀਨ ਏਆਈ ਆਵਾਜ਼',
    planMission: 'ਮਿਸ਼ਨ ਯੋਜਨਾ ਬਣਾਓ',
    exploreMarineMap: 'ਸਮੁੰਦਰੀ ਨਕਸ਼ਾ ਦੇਖੋ',
    weather: 'ਮੌਸਮ',
    fishingZones: 'ਮੱਛੀ ਫੜਨ ਦੇ ਖੇਤਰ',
    seaConditions: 'ਸਮੁੰਦਰ ਦੀ ਸਥਿਤੀ',
    safeToSail: 'ਕੀ ਸਫ਼ਰ ਸੁਰੱਖਿਅਤ ਹੈ?',
    safeRoute: 'ਸੁਰੱਖਿਅਤ ਰਸਤਾ',
    nearbyAreas: 'ਨੇੜਲੇ ਸਮੁੰਦਰੀ ਖੇਤਰ',
    liveTelemetry: 'ਲਾਈਵ ਕਿਸ਼ਤੀ ਟੈਲੀਮੈਟਰੀ',
    missionSetup: 'ਮਿਸ਼ਨ ਸੈੱਟਅੱਪ',
    missionParameters: 'ਮਿਸ਼ਨ ਮਾਪਦੰਡ',
    generatedPlans: 'ਤਿਆਰ ਕੀਤੇ ਮਿਸ਼ਨ ਪਲਾਨ',
    whatIfSimulator: 'ਵ੍ਹਟ-ਇਫ ਸਿਮੂਲੇਟਰ',
    simulationMap: 'ਸਿਮੂਲੇਸ਼ਨ ਨਕਸ਼ਾ',
    riskOpportunity: 'ਜੋਖਮ ਅਤੇ ਮੌਕਾ ਵਿਸ਼ਲੇਸ਼ਣ',
    decisionRecommendation: 'ਫੈਸਲਾ ਅਤੇ ਸਿਫਾਰਸ਼',
    activeVesselMap: 'ਐਕਟਿਵ ਕਿਸ਼ਤੀ ਨਕਸ਼ਾ',
    safetyGuardian: 'ਸੁਰੱਖਿਆ ਗਾਰਡੀਅਨ',
    realTimeAdvisories: 'ਰੀਅਲ-ਟਾਈਮ ਸਲਾਹ ਫੀਡ',
    emergencyActions: 'ਐਮਰਜੈਂਸੀ ਕਾਰਵਾਈ',
    overview: 'ਸੰਖੇਪ ਜਾਣਕਾਰੀ',
    timeline: 'ਟਾਈਮਲਾਈਨ',
    whyWhyNot: 'ਕਿਉਂ ਅਤੇ ਕਿਉਂ ਨਹੀਂ',
    dataEvidence: 'ਡੇਟਾ ਅਤੇ ਸਬੂਤ',
    outcomeLearning: 'ਨਤੀਜਾ ਅਤੇ ਸਿੱਖਿਆ',
    agentSquadron: '16-ਏਜੰਟ ਸਕੁਐਡਰਨ',
    task: 'ਕੰਮ',
    processing: 'ਪ੍ਰੋਸੈਸਿੰਗ',
    result: 'ਨਤੀਜਾ',
    evidence: 'ਸਬੂਤ',
    settings: 'ਸੈਟਿੰਗਾਂ',
    offlinePack: 'ਆਫਲਾਈਨ ਪੈਕ',
    sos: 'ਐਮਰਜੈਂਸੀ 1093',
    statusBadge: '16 ਏਜੰਟ ਤਿਆਰ',
    satellite: 'ਸੈਟੇਲਾਈਟ',
    streets: 'ਨਕਸ਼ਾ',
    ocean: 'ਸਮੁੰਦਰ',
    dark: 'ਡਾਰਕ'
  },
  as: {
    home: 'ঘৰ',
    executiveBrain: 'কাৰ্যবাহী মস্তিষ্ক',
    digitalTwin: 'ডিজিটেল টুইন আৰু চিমুলেচন',
    liveMission: 'লাইভ মিছন আৰু সুৰক্ষা',
    missionReplay: 'মিছন ৰিপ্লে সমীক্ষা',
    aiScientist: 'এআই বিজ্ঞানী আৰু এজেণ্ট',
    marineAi: 'মেৰিন এআই',
    copilotChat: 'মেৰিন এআই',
    talkToMarineAi: 'মেৰিন এআইৰ সৈতে কথা পাতক',
    askMarineAi: 'মেৰিন এআইক সোধক',
    marineAiVoice: 'মেৰিন এআই কণ্ঠস্বৰ',
    planMission: 'মিছন পৰিকল্পনা কৰক',
    exploreMarineMap: 'সামুদ্ৰিক মেপ চাওক',
    weather: 'বতৰ',
    fishingZones: 'মাছ ধৰা এলেকা',
    seaConditions: 'সাগৰৰ অৱস্থা',
    safeToSail: 'যাত্ৰা সুৰক্ষিতনে?',
    safeRoute: 'নিৰাপদ পথ',
    nearbyAreas: 'ওচৰৰ সামুদ্ৰিক অঞ্চল',
    liveTelemetry: 'লাইভ নাও টেলিমেট্ৰি',
    missionSetup: 'মিছন প্ৰস্তুতি',
    missionParameters: 'মিছনৰ মাপকাঠি',
    generatedPlans: 'প্ৰস্তুত মিছন পৰিকল্পনা',
    whatIfSimulator: 'হোৱাট-ইফ চিমুলেটৰ',
    simulationMap: 'চিমুলেচন মেপ',
    riskOpportunity: 'বিপদ আৰু সুযোগ বিশ্লেষণ',
    decisionRecommendation: 'সিদ্ধান্ত আৰু পৰামৰ্শ',
    activeVesselMap: 'সক্ৰিয় নাও মেপ',
    safetyGuardian: 'সুৰক্ষা গাৰ্ডিয়ান',
    realTimeAdvisories: 'লাইভ পৰামৰ্শ ফীড',
    emergencyActions: 'জৰুৰী পদক্ষেপ',
    overview: 'অৱলোকন',
    timeline: 'সময়ৰেখা',
    whyWhyNot: 'কিয় আৰু কিয় নহয়',
    dataEvidence: 'তথ্য আৰু প্ৰমাণ',
    outcomeLearning: 'ফলাফল আৰু শিক্ষা',
    agentSquadron: '১৬টা এজেণ্টৰ দল',
    task: 'কাৰ্য্য',
    processing: 'প্ৰক্ৰিয়াকৰণ',
    result: 'ফলাফল',
    evidence: 'প্ৰমাণ',
    settings: 'ছেটিংছ',
    offlinePack: 'অফলাইন পেক',
    sos: 'জৰুৰী ১০৯৩',
    statusBadge: '১৬টা এজেণ্ট সক্ৰিয়',
    satellite: 'উপগ্ৰহ',
    streets: 'মেপ',
    ocean: 'মহাসাগৰ',
    dark: 'ডাৰ্ক'
  }
};

/**
 * Returns translated UI string dictionary for the specified language
 */
export function getAppTranslation(langCode = 'en') {
  return NAV_TRANSLATIONS[langCode] || NAV_TRANSLATIONS.en;
}
