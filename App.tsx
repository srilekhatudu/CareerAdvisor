
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PhoneOff, MessageSquare, ArrowRight, Mic, Send, X, ShieldCheck, 
  Target, Shield, ChevronRight, Briefcase, Globe, Volume2, Pause, Headphones, Loader2,
  GraduationCap, Users, RefreshCw, Replace, CheckCircle2, Lock, Info, Sparkles, Settings
} from 'lucide-react';
import { LiveStatus, Message, AppMode, InteractionType, Language, UserStage } from './types';
import { LiveClient } from './services/liveClient';
import { sendMessageToGemini, initializeGemini } from './services/geminiService';
import AudioVisualizer from './components/AudioVisualizer';
import { DYNAMIC_QUOTES, LANGUAGE_LABELS, SYSTEM_INSTRUCTION, ROLE_SUGGESTION_LOGIC_DISPLAY } from './constants';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('selection');
  const [userStage, setUserStage] = useState<UserStage | null>(null);
  const [selectedLanguage] = useState<Language>('english');
  const [interactionType, setInteractionType] = useState<InteractionType | null>(null);
  const [status, setStatus] = useState<LiveStatus>(LiveStatus.DISCONNECTED);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [volumes, setVolumes] = useState({ input: 0, output: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState<{user: string, model: string}>({user: '', model: ''});
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'instructions' | 'logic'>('instructions');
  const [isEmbedded, setIsEmbedded] = useState(false);

  const liveClientRef = useRef<LiveClient | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const silenceTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const isConnected = status === LiveStatus.CONNECTED;
  const isConnecting = status === LiveStatus.CONNECTING;
  const labels = LANGUAGE_LABELS[selectedLanguage];

  const getStageColor = (stage: UserStage | null) => {
    switch (stage) {
      case 'fresher': return { primary: '#10b981', secondary: '#ecfdf5', text: 'emerald' };
      case 'experienced': return { primary: '#00AEEF', secondary: '#f0f9ff', text: 'sky' };
      case 'gap': return { primary: '#F59E0B', secondary: '#fffbeb', text: 'amber' };
      case 'transition': return { primary: '#8B5CF6', secondary: '#f5f3ff', text: 'violet' };
      default: return { primary: '#00AEEF', secondary: '#f8fafc', text: 'blue' };
    }
  };

  const stageColors = getStageColor(userStage);

  const handleVoiceFallback = useCallback((reason: string) => {
    if (liveClientRef.current) {
      const client = liveClientRef.current;
      liveClientRef.current = null;
      client.disconnect();
    }
    if (silenceTimer.current) {
      clearInterval(silenceTimer.current);
      silenceTimer.current = null;
    }
    setStatus(LiveStatus.DISCONNECTED);
    setInteractionType('text');
    setErrorMsg(reason);
    setVolumes({ input: 0, output: 0 });
    initializeGemini();
  }, []);

  useEffect(() => {
    // Detect if embedded in iframe or has ?embed=true
    const isIframe = window.self !== window.top;
    const urlParams = new URLSearchParams(window.location.search);
    const hasEmbedFlag = urlParams.get('embed') === 'true';
    
    if (isIframe || hasEmbedFlag) {
      setIsEmbedded(true);
    }
  }, []);

  useEffect(() => {
    if (appMode === 'selection') {
      const interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % DYNAMIC_QUOTES.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [appMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, currentTranscription]);

  const Logo = ({ size = "md", theme = "default" }: { size?: "sm" | "md" | "lg", theme?: "default" | "light" }) => {
    const scale = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-14 h-14" : "w-10 h-10";
    const textSizeClass = size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-3xl";
    return (
      <div className="flex items-center gap-3 select-none">
        <div className={`relative ${scale} flex flex-wrap rounded shadow-md overflow-hidden border-2 ${theme === 'light' ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="w-1/2 h-1/2 bg-[#EF4444]"></div>
          <div className="w-1/2 h-1/2 bg-[#FBBF24]"></div>
          <div className="w-1/2 h-1/2 bg-[#00AEEF]"></div>
          <div className="w-1/2 h-1/2 bg-[#22C55E]"></div>
          <div className="absolute inset-0 flex items-center justify-center font-black text-white text-xl leading-none">N</div>
        </div>
        <div className="flex flex-col leading-none text-left">
          <span className={`${textSizeClass} font-black tracking-tighter text-[#00AEEF]`}>ncpl</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Career Advisory</span>
        </div>
      </div>
    );
  };

  const startInteraction = (type: InteractionType) => {
    setInteractionType(type);
    setAppMode('segmentation');
  };

  const selectStage = async (stage: UserStage) => {
    setUserStage(stage);
    setAppMode('chat');
    
    // Command the bot to be brief and ask for location immediately.
    const systemTrigger = `I'm in the "${stage}" stage. Acknowledge this briefly, then ask for my name and current country. Keep it under 15 words.`;

    if (interactionType === 'voice') {
      await connectVoice(systemTrigger);
    } else {
      await initializeGemini();
      setIsProcessingText(true);
      try {
        const response = await sendMessageToGemini(systemTrigger);
        setMessages([{
          id: 'initial',
          role: 'model',
          text: response,
          timestamp: new Date(),
          language: selectedLanguage
        }]);
      } catch (e) {
        setMessages([{
          id: 'initial',
          role: 'model',
          text: `Welcome! I see you're starting as a ${stage}. What is your name and current country?`,
          timestamp: new Date(),
          language: selectedLanguage
        }]);
      } finally {
        setIsProcessingText(false);
      }
    }
  };

  const connectVoice = useCallback(async (initialText: string) => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      const apiKey = data.apiKey;
      if (!apiKey) {
        setErrorMsg("Configuration error.");
        setStatus(LiveStatus.ERROR);
        return;
      }

    setStatus(LiveStatus.CONNECTING);
    setErrorMsg(null);

    const client = new LiveClient(apiKey, {
      onOpen: () => {
        setStatus(LiveStatus.CONNECTED);
        client.sendText(initialText);
      },
      onClose: () => {
        if (liveClientRef.current) {
          handleVoiceFallback("Voice session completed.");
        }
      },
      onVolume: (input, output) => setVolumes({ input, output }),
      onTranscription: (text, role, isFinal) => {
        if (isFinal) {
          if (text.trim()) {
            setMessages(prev => [
              ...prev,
              { id: Date.now().toString() + '-' + role, role, text, timestamp: new Date(), language: selectedLanguage }
            ]);
          }
          setCurrentTranscription(prev => ({ ...prev, [role]: '' }));
        } else {
          setCurrentTranscription(prev => ({ ...prev, [role]: text }));
        }
      },
      onStateChange: (state) => setVoiceState(state),
      onError: (err: any) => {
        handleVoiceFallback(`Connection issue. Switching to text.`);
      }
    });

    liveClientRef.current = client;
    await client.connect();
    } catch (err) {
      setErrorMsg("Failed to fetch configuration.");
      setStatus(LiveStatus.ERROR);
    }
  }, [selectedLanguage, handleVoiceFallback]);

  const disconnect = useCallback(() => {
    if (liveClientRef.current) {
      const client = liveClientRef.current;
      liveClientRef.current = null;
      client.disconnect();
    }
    setAppMode('selection');
    setInteractionType(null);
    setUserStage(null);
    setMessages([]);
    setErrorMsg(null);
    setCurrentTranscription({user: '', model: ''});
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isProcessingText) return;

    const userText = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText, timestamp: new Date(), language: selectedLanguage }]);
    
    setIsProcessingText(true);
    try {
      const response = await sendMessageToGemini(userText);
      setMessages(prev => [...prev, { id: Date.now().toString() + '-ai', role: 'model', text: response, timestamp: new Date(), language: selectedLanguage }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setErrorMsg(error.message || "Error communicating with advisor.");
    } finally {
      setIsProcessingText(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#00AEEF]/10 selection:text-[#00AEEF]">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Settings size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Advisor Configuration</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setSettingsTab('instructions')}
                className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${settingsTab === 'instructions' ? 'border-blue-500 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                System Instructions
              </button>
              <button 
                onClick={() => setSettingsTab('logic')}
                className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${settingsTab === 'logic' ? 'border-blue-500 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Role Suggestion Logic
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              {settingsTab === 'instructions' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <Info size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Global Directives</span>
                  </div>
                  <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed">
                    {SYSTEM_INSTRUCTION}
                  </pre>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 mb-4">
                    <Target size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Decision Framework</span>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100">
                      {ROLE_SUGGESTION_LOGIC_DISPLAY}
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                    <Sparkles className="text-amber-500 shrink-0" size={18} />
                    <p className="text-xs text-amber-800 leading-normal">
                      These rules are strictly enforced by the AI during both voice and text interactions to ensure accurate career mapping.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {appMode === 'selection' && (
        <div className={`min-h-screen selection-gradient overflow-y-auto ${isEmbedded ? 'pb-10' : 'pb-20'}`}>
          {!isEmbedded ? (
            <header className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center animate-fade-in">
              <Logo />
              <div className="flex items-center gap-4 md:gap-6">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="p-3 bg-white/60 hover:bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500 hover:text-[#00AEEF] transition-all glass-card"
                  title="Advisor Settings"
                >
                  <Settings size={20} />
                </button>
                <div className="hidden md:flex items-center gap-6">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/60 px-4 py-2 rounded-full border border-slate-100 shadow-sm glass-card">
                    <Globe size={14} className="text-[#00AEEF]"/> Global Advisory
                  </span>
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00AEEF] to-[#10b981] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-help animate-pulse" title="Active Sessions: Global">
                      <Sparkles size={18} />
                  </div>
                </div>
              </div>
            </header>
          ) : (
            <div className="flex justify-between items-center p-4 border-b border-white/40 bg-white/20 backdrop-blur-md sticky top-0 z-50">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">NCPL Career AI</span>
               <button 
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-slate-500 hover:text-[#00AEEF]"
                >
                  <Settings size={18} />
                </button>
            </div>
          )}

        <section className={`max-w-5xl mx-auto text-center px-6 ${isEmbedded ? 'mt-8' : 'mt-16 md:mt-24'} animate-fade-in`}>
          <h1 className={`${isEmbedded ? 'text-2xl' : 'text-4xl md:text-7xl'} font-extrabold tracking-tight mb-8`}>
            {isEmbedded ? (
              <span className="text-slate-900">Expert <span className="brand-gradient-text">IT Career Guidance</span></span>
            ) : (
              <>
                <span className="brand-gradient-text">Career Guidance</span> <br className="hidden md:block"/> 
                <span className="text-slate-900">for the IT World</span>
              </>
            )}
          </h1>
          
          {!isEmbedded && (
            <div className="h-28 mb-10 flex flex-col items-center justify-center">
              <div key={quoteIndex} className="animate-fade-in space-y-3">
                <p className="text-slate-600 italic text-xl md:text-2xl font-semibold max-w-3xl px-4 mx-auto leading-snug">
                  "{DYNAMIC_QUOTES[quoteIndex].text}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-8 bg-[#00AEEF]/20"></div>
                  <p className="text-[#00AEEF] text-[11px] font-black uppercase tracking-[0.4em]">{DYNAMIC_QUOTES[quoteIndex].author}</p>
                  <div className="h-px w-8 bg-[#00AEEF]/20"></div>
                </div>
              </div>
            </div>
          )}

          <p className={`${isEmbedded ? 'text-sm' : 'text-lg md:text-xl'} text-slate-500 max-w-2xl mx-auto mb-16 leading-relaxed font-medium`}>
            {labels.sub}
          </p>
        </section>

        <section className={`max-w-5xl mx-auto grid grid-cols-1 ${isEmbedded ? 'gap-4' : 'md:grid-cols-2 gap-8'} px-6 animate-fade-in [animation-delay:0.2s]`}>
          <button onClick={() => startInteraction('text')} className={`group bg-white border border-slate-100 rounded-[2.5rem] text-left hover:border-emerald-500 transition-all duration-500 ${isEmbedded ? 'p-6 h-[180px]' : 'p-10 h-[400px]'} relative overflow-hidden glass-card hover-lift`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125 duration-700"></div>
            <div>
              <div className={`${isEmbedded ? 'w-10 h-10 mb-4' : 'w-16 h-16 mb-8'} bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white transition-all shadow-sm`}>
                <MessageSquare size={isEmbedded ? 20 : 32} />
              </div>
              <h3 className={`${isEmbedded ? 'text-xl' : 'text-3xl'} font-black text-slate-900 mb-2 truncate`}>{labels.textTitle}</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4 font-medium line-clamp-2">{labels.textDesc}</p>
            </div>
            <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-2 transition-all">Start Chat <ArrowRight size={14} /></div>
          </button>

          <button onClick={() => startInteraction('voice')} className={`group bg-white border border-slate-100 rounded-[2.5rem] text-left hover:border-blue-500 transition-all duration-500 ${isEmbedded ? 'p-6 h-[180px]' : 'p-10 h-[400px]'} relative overflow-hidden glass-card hover-lift`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125 duration-700"></div>
            <div className={`absolute ${isEmbedded ? 'top-4 right-4' : 'top-8 right-10'} flex flex-col items-end gap-2`}>
              <span className={`px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-full uppercase tracking-widest shadow-lg ${isEmbedded ? 'text-[8px]' : 'text-[10px]'}`}>{labels.recommended}</span>
            </div>
            <div>
              <div className={`${isEmbedded ? 'w-10 h-10 mb-4' : 'w-16 h-16 mb-8'} bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl flex items-center justify-center text-[#00AEEF] group-hover:from-[#00AEEF] group-hover:to-blue-600 group-hover:text-white transition-all shadow-sm`}>
                <Mic size={isEmbedded ? 20 : 32} />
              </div>
              <h3 className={`${isEmbedded ? 'text-xl' : 'text-3xl'} font-black text-slate-900 mb-2 truncate`}>{labels.voiceTitle}</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4 font-medium line-clamp-2">{labels.voiceDesc}</p>
            </div>
            <div className="flex items-center gap-3 text-[#00AEEF] font-black text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-2 transition-all">Start Voice <ArrowRight size={14} /></div>
          </button>
        </section>

        {!isEmbedded && (
          <section className="max-w-4xl mx-auto mt-32 px-6 text-center animate-fade-in [animation-delay:0.3s]">
             <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#00AEEF] to-[#10b981] rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
                  <div className="relative w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white group-hover:scale-105 transition-transform duration-500">
                     <Logo size="sm" theme="light" />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">Your AI Career Advisor</h4>
                  <p className="text-[11px] text-[#00AEEF] font-black uppercase tracking-[0.4em]">Powered by NCPL Expertise</p>
                </div>
             </div>
          </section>
        )}

        {!isEmbedded && (
          <section className="max-w-6xl mx-auto mt-40 px-6 animate-fade-in [animation-delay:0.4s]">
             <h2 className="text-center text-3xl md:text-4xl font-black text-slate-900 mb-20 tracking-tight">Support for Every Step</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: <GraduationCap/>, title: "Freshers", desc: "Foundational roadmaps for starting your journey.", color: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100" },
                  { icon: <Users/>, title: "Experienced", desc: "Strategic transitions into advanced roles.", color: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100" },
                  { icon: <RefreshCw/>, title: "Career Gaps", desc: "Confident plans for returning to the IT workforce.", color: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100" },
                  { icon: <Replace/>, title: "Switchers", desc: "Cross-skilling into tech from any background.", color: "bg-violet-50 text-violet-600 border-violet-100 shadow-violet-100" }
                ].map((item, idx) => (
                  <div key={idx} className={`p-10 rounded-[2.5rem] border shadow-xl shadow-transparent transition-all hover:shadow-inherit duration-300 flex flex-col items-start gap-6 bg-white group hover-lift border-slate-100`}>
                     <div className={`w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center transition-all ${item.color} group-hover:scale-110`}>
                       {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
                     </div>
                     <div className="space-y-2 text-left">
                       <h4 className="text-xl font-black text-slate-900 tracking-tight">{item.title}</h4>
                       <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        )}

        {!isEmbedded && (
          <footer className="max-w-4xl mx-auto mt-48 pt-20 border-t border-slate-100 px-6 pb-20 text-center animate-fade-in [animation-delay:0.6s]">
             <Logo size="md" />
             <p className="text-sm text-slate-500 mt-10 mb-4 font-semibold italic">"Empowering the next generation of IT leaders."</p>
             <div className="flex justify-center gap-10 text-[11px] font-black uppercase tracking-widest text-[#00AEEF] mt-12">
               <a href="https://ncplconsulting.net" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">About NCPL</a>
               <a href="https://ncplconsulting.net/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
               <a href="https://ncplconsulting.net/disclaimer" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">Disclaimer</a>
             </div>
          </footer>
        )}
      </div>
      )}

      {appMode === 'segmentation' && (
        <div className={`min-h-screen flex flex-col items-center justify-center ${isEmbedded ? 'p-4' : 'p-6'} bg-slate-50 selection-gradient`}>
         <div className="max-w-2xl w-full animate-fade-in">
           <button onClick={() => setAppMode('selection')} className={`flex items-center gap-2 text-slate-400 hover:text-[#00AEEF] transition-all text-xs font-black uppercase tracking-[0.2em] ${isEmbedded ? 'mb-6' : 'mb-12'}`}>
             <X size={18}/> Back
           </button>
           <h2 className={`${isEmbedded ? 'text-2xl' : 'text-4xl md:text-5xl'} font-black text-slate-900 mb-4 tracking-tight`}>Your Career Stage</h2>
           <p className="text-slate-500 text-sm mb-8 font-medium">Select your current journey.</p>
           
           <div className={`grid grid-cols-1 ${isEmbedded ? 'gap-3' : 'sm:grid-cols-2 gap-6'}`}>
              {[
                { id: 'fresher', icon: <GraduationCap/>, label: "Fresher / Student", color: "text-emerald-500", bg: "hover:bg-emerald-50/80 hover:border-emerald-200 hover:shadow-emerald-200/20" },
                { id: 'experienced', icon: <Users/>, label: "Experienced", color: "text-blue-500", bg: "hover:bg-blue-50/80 hover:border-blue-200 hover:shadow-blue-200/20" },
                { id: 'gap', icon: <RefreshCw/>, label: "Career Gap", color: "text-amber-500", bg: "hover:bg-amber-50/80 hover:border-amber-200 hover:shadow-amber-200/20" },
                { id: 'transition', icon: <Replace/>, label: "Career Transition", color: "text-violet-500", bg: "hover:bg-violet-50/80 hover:border-violet-200 hover:shadow-violet-200/20" }
              ].map((stage) => (
                <button 
                  key={stage.id} 
                  onClick={() => selectStage(stage.id as UserStage)}
                  className={`${isEmbedded ? 'p-4 rounded-2xl' : 'p-10 rounded-[2.5rem]'} bg-white border border-slate-100 text-left shadow-sm hover:shadow-2xl transition-all flex items-center gap-4 group glass-card ${stage.bg} hover-lift`}
                >
                   <div className={`${isEmbedded ? 'w-10 h-10 rounded-xl' : 'w-16 h-16 rounded-2xl'} bg-white shadow-sm flex items-center justify-center ${stage.color} group-hover:scale-110 transition-transform ring-4 ring-transparent group-hover:ring-current/10`}>
                     {React.cloneElement(stage.icon as React.ReactElement<any>, { size: isEmbedded ? 20 : 32 })}
                   </div>
                   <span className={`font-black text-slate-800 ${isEmbedded ? 'text-sm' : 'text-xl'} tracking-tight`}>{stage.label}</span>
                </button>
              ))}
           </div>
         </div>
      </div>
      )}

      {(appMode === 'chat' || appMode === 'voice') && (
        <div className="flex flex-col h-screen bg-white text-slate-900 overflow-hidden">
      <header className={`bg-white border-b border-slate-100 ${isEmbedded ? 'px-4 py-3' : 'px-6 py-4'} flex items-center justify-between z-20 sticky top-0 shadow-sm glass-card`}>
        <div className="flex items-center gap-4">
          <button onClick={disconnect} className="p-3 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100"><X size={20} /></button>
          {!isEmbedded && <Logo size="sm" />}
          {isEmbedded && <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF]">Advisor</span>}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-[#00AEEF] transition-all border border-transparent hover:border-slate-100"
            title="Advisor Settings"
          >
            <Settings size={20} />
          </button>
          <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-3 transition-all shadow-sm border font-black text-[10px] uppercase tracking-[0.2em] ${
            interactionType === 'voice' 
              ? 'bg-blue-50 text-[#00AEEF] border-blue-100' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            <ShieldCheck size={18} />
            <span className="hidden sm:inline">
              {interactionType === 'voice' ? 'Voice active' : 'Chat active'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {interactionType === 'voice' && (
          <div className={`flex flex-col items-center justify-center p-8 transition-all duration-700 ${isConnected ? 'w-full md:w-[45%] bg-slate-50 border-r border-slate-100' : 'w-full'}`}>
            {isConnected && (
              <div className="mb-8 p-10 bg-white rounded-[4rem] shadow-2xl border border-slate-100 w-full max-w-sm animate-fade-in flex flex-col items-center glass-card relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00AEEF] to-[#10b981]"></div>
                 <div className="relative mb-8">
                    <div className="absolute inset-0 bg-current opacity-10 blur-xl rounded-full scale-150 animate-pulse" style={{ color: stageColors.primary }}></div>
                    <div className="relative w-28 h-28 bg-slate-900 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                        <Logo size="sm" theme="light" />
                    </div>
                 </div>
                 <h3 className="font-black text-slate-900 text-2xl tracking-tight mb-2">Advisor Listening</h3>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Live Audio</p>
                 <div className="flex items-center gap-4 px-6 py-3.5 bg-slate-50 rounded-[2rem] border border-slate-100 w-full justify-center shadow-inner">
                    <div className="relative flex items-center justify-center">
                        <div className={`absolute w-4 h-4 rounded-full animate-ping opacity-20`} style={{ backgroundColor: stageColors.primary }}></div>
                        <div className={`w-3 h-3 rounded-full ${
                          voiceState === 'speaking' ? 'bg-emerald-500' : 
                          voiceState === 'listening' ? 'bg-[#00AEEF]' : 
                          'bg-slate-300'
                        }`}></div>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">{voiceState.toUpperCase()}</span>
                 </div>
              </div>
            )}

            {!isConnected && (
              <div className="flex flex-col items-center gap-8 mb-12">
                <div className="relative">
                   <div className="w-24 h-24 border-[8px] border-slate-100 border-t-[#00AEEF] border-r-[#10b981] rounded-full animate-spin shadow-inner"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Globe size={28} className="text-slate-200" />
                   </div>
                </div>
                <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] animate-pulse">Establishing link...</p>
              </div>
            )}

            <AudioVisualizer inputVolume={volumes.input} outputVolume={volumes.output} isConnected={isConnected} />

            <div className="mt-16 flex flex-col items-center gap-8 w-full">
              {isConnected && (
                <div className="flex flex-col items-center gap-4">
                   <button onClick={() => handleVoiceFallback("Session ended.")} className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-red-500/30 hover:scale-110 active:scale-95 transition-all group relative">
                    <PhoneOff size={36} />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Disconnect</span>
                </div>
              )}
              {isConnecting && <div className="w-14 h-14 border-4 border-slate-200 border-t-[#00AEEF] rounded-full animate-spin"></div>}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {errorMsg && (
            <div className="m-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-between animate-fade-in">
              <span className="font-medium text-sm">{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 rounded-full transition-colors"><X size={16} /></button>
            </div>
          )}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-14 scrollbar-hide space-y-10 bg-slate-50/40">
            {messages.map((msg, i) => {
              const prevMsg = messages[i-1];
              const showTime = !prevMsg || (msg.timestamp.getTime() - prevMsg.timestamp.getTime() > 180000);
              return (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                  {showTime && (
                    <div className="w-full text-center my-10">
                      <span className="px-6 py-2 bg-white shadow-sm border border-slate-100 text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] rounded-full">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <div className={`max-w-[88%] md:max-w-[80%] p-8 rounded-[3rem] text-base leading-relaxed border transition-all shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none border-slate-900 shadow-xl' 
                      : 'bg-white text-slate-800 rounded-tl-none border-slate-100'
                  }`}>
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                    {(msg.text.includes('NCPL') || msg.text.includes('roadmap') || msg.text.includes('Consulting')) && msg.role === 'model' && (
                      <div className="mt-8 p-5 bg-[#00AEEF]/5 rounded-[2rem] border border-[#00AEEF]/10 flex items-start gap-4 group">
                        <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-[#00AEEF] group-hover:text-white transition-all">
                          <Target size={22} className="text-[#00AEEF] group-hover:text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-black text-[#00AEEF] uppercase tracking-widest mb-1">NCPL Program</p>
                          <a href="https://ncplconsulting.net" target="_blank" rel="noopener noreferrer" className="text-base font-bold text-slate-700 hover:text-[#00AEEF] hover:underline flex items-center gap-2 transition-all">
                            Details <ArrowRight size={16} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {currentTranscription.user && (
              <div className="flex flex-col items-end opacity-70 animate-fade-in">
                <div className="p-6 bg-white text-slate-500 rounded-[2rem] rounded-tr-none text-sm italic border border-slate-100 shadow-sm border-dashed">
                  {currentTranscription.user}
                </div>
              </div>
            )}
            
            {currentTranscription.model && (
              <div className="flex flex-col items-start opacity-70 animate-fade-in">
                <div className="p-6 bg-emerald-50 text-emerald-800 rounded-[2rem] rounded-tl-none text-sm italic border border-emerald-100 shadow-sm border-dashed">
                  {currentTranscription.model}
                </div>
              </div>
            )}
            
            {isProcessingText && (
              <div className="flex gap-2.5 p-6 bg-white rounded-[2rem] w-fit ml-4 border border-slate-100 shadow-sm">
                <div className="w-2.5 h-2.5 bg-[#00AEEF] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-[#FBBF24] rounded-full animate-bounce"></div>
              </div>
            )}
          </div>

          <div className="p-10 md:p-14 border-t border-slate-100 bg-white sticky bottom-0 z-20 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.06)]">
            <form onSubmit={handleSendMessage} className="flex items-center gap-6 max-w-4xl mx-auto relative group">
              <div className="relative flex-1">
                <input 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder="Type your message..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] px-12 py-7 pr-24 text-base font-bold text-slate-700 focus:outline-none focus:border-[#00AEEF] focus:bg-white transition-all h-[88px] shadow-inner placeholder:text-slate-300"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-2 h-10 bg-gradient-to-b from-[#00AEEF] to-[#10b981] rounded-full opacity-40"></div>
              </div>
              <button type="submit" disabled={isProcessingText || !inputText.trim()} className="p-7 bg-gradient-to-tr from-[#00AEEF] to-[#10b981] text-white rounded-[2rem] hover:scale-105 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 disabled:opacity-30 flex items-center justify-center">
                <Send size={28} />
              </button>
            </form>
          </div>
        </div>
      </main>
        </div>
      )}
    </div>
  );
};

export default App;
