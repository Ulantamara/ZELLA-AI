import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Globe, Sparkles, 
  ArrowRight, Video, HelpCircle, Activity, ChevronDown, ChevronUp, Check, 
  MessageSquare, Settings, Star, TrendingUp, BarChart3, Heart, Award, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../LanguageContext";

interface Chapter {
  id: number;
  titleEn: string;
  titleRu: string;
  duration: number; // in seconds
  voiceEn: string;
  voiceRu: string;
}

const TUTORIAL_CHAPTERS: Chapter[] = [
  {
    id: 0,
    titleEn: "1. Journal & Entering Trades",
    titleRu: "1. Журнал и ввод сделок",
    duration: 32,
    voiceEn: "Welcome to your premium Trading Journal. To log a trade, navigate to the Journal tab. Enter the ticker, select Long or Short, specify your entry price, stop-loss, and take-profit targets. Associate the trade with a Playbook strategy and log it securely. It instantly integrates with your performance data.",
    voiceRu: "Добро пожаловать в ваш профессиональный Торговый Журнал. Для ввода сделки перейдите во вкладку «Журнал». Укажите тикер, выберите Long или Short, введите цену входа, стоп-лосс и тейк-профит. Свяжите сделку со стратегией из вашего Плейбука и сохраните ее. Данные мгновенно обновят вашу аналитику."
  },
  {
    id: 1,
    titleEn: "2. Dashboard & Performance Metrics",
    titleRu: "2. Панель управления и метрики",
    duration: 28,
    voiceEn: "On the Dashboard, monitor your high-level metrics. Review your cumulative Net Profit, win rate percentage, profit factor, and average risk-to-reward ratio. Analyze the interactive Equity Curve and the calendar heatmap to immediately spot your emotional discipline days.",
    voiceRu: "На Панели Управления вы можете отслеживать ключевые метрики. Оценивайте чистую прибыль, процент прибыльных сделок, профит-фактор и среднее соотношение риска к прибыли. Анализируйте интерактивную Кривую Капитала и календарь дисциплины для выявления дней тильта."
  },
  {
    id: 2,
    titleEn: "3. Advanced Statistics & Analytics",
    titleRu: "3. Детальная статистика и аналитика",
    duration: 28,
    voiceEn: "The Statistics view provides granular analytics. Review win-loss ratio charts, trade duration clusters, and average returns grouped by asset class or strategy. This mathematical feedback helps you double down on what works and cut unprofitable habits.",
    voiceRu: "Вкладка «Статистика» предоставляет глубокий математический анализ ваших результатов. Изучайте распределение размеров побед и убытков, длительность удержания позиций и прибыльность отдельных активов или стратегий, чтобы исключить неэффективные сетапы."
  },
  {
    id: 3,
    titleEn: "4. Mindset & Psychology Log",
    titleRu: "4. Психология и учет эмоций",
    duration: 28,
    voiceEn: "Trading success is eighty percent psychology. In the Psychology tab, record your emotional state before and after each trade, rate your focus and sleep quality, and let the integrated Gemini AI identify cognitive biases and warnings like FOMO or revenge trading.",
    voiceRu: "Успех в трейдинге на 80% зависит от психологии. Во вкладке «Психология» фиксируйте эмоциональное состояние до и после входа в рынок, оценивайте сон и фокус, а встроенный ИИ Gemini автоматически выявит скрытые паттерны стресса, FOMO или тильта."
  },
  {
    id: 4,
    titleEn: "5. Playbook Rules & Goals",
    titleRu: "5. Правила стратегий и цели",
    duration: 28,
    voiceEn: "Stay disciplined with your Playbook and Weekly Goals. In the Playbook tab, write your precise setup rules, checklists, and win-rate guidelines. In the Goals view, monitor your progress bar towards weekly targets, star compliance, and execution volume.",
    voiceRu: "Соблюдайте жесткую дисциплину с помощью Плейбука и недельных целей. Во вкладке «Плейбук» настраивайте правила входа, чек-листы и условия отмены сделки. В разделе «Цели» отслеживайте прогресс выполнения планов и рейтинг звездной дисциплины."
  },
  {
    id: 5,
    titleEn: "6. Interactive Replay & AI Audits",
    titleRu: "6. Симуляция свечей и ИИ-Аудит",
    duration: 32,
    voiceEn: "Finally, master historical reviews in the Replay simulator. Select any trade to reconstruct it candle-by-candle on the interactive chart. Type your review comments, save detailed screenshots, and request a comprehensive Gemini AI Audit to perfect your execution.",
    voiceRu: "Наконец, проводите детальный разбор в Симуляторе Сделок. Воссоздавайте входы и выходы свеча за свечой на интерактивном графике, пишите подробные комментарии к каждой записи и запрашивайте глубокий ИИ-Аудит Gemini для работы над ошибками."
  }
];

type VoiceStyle = "warm_female" | "deep_male" | "calm_soft" | "default";

export default function VideoGuide() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<"en" | "ru">(language === "ru" ? "ru" : "en");
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>("warm_female");
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  
  // Simulated interactive actions state
  const [simFormTicker, setSimFormTicker] = useState("");
  const [simFormPrice, setSimFormPrice] = useState("");
  const [simFormDirection, setSimFormDirection] = useState<"Long" | "Short">("Long");
  const [simFormSubmitted, setSimFormSubmitted] = useState(false);
  const [simCursorPos, setSimCursorPos] = useState({ x: 30, y: 30 });
  const [simMetricsPnL, setSimMetricsPnL] = useState(0);
  const [simMetricsWinRate, setSimMetricsWinRate] = useState(0);
  const [simSelectedDay, setSimSelectedDay] = useState<number | null>(null);
  const [simAiReviewText, setSimAiReviewText] = useState("");

  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const activeChapter = TUTORIAL_CHAPTERS[currentChapterIndex] || TUTORIAL_CHAPTERS[0];

  // Align narration language if general app language changes
  useEffect(() => {
    setSelectedVoiceLang(language === "ru" ? "ru" : "en");
  }, [language]);

  // Audio Synthesis Feedback beep (creates small click or chime sounds)
  const playSynthSound = (frequency: number, duration: number, type: "sine" | "triangle" = "sine") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might fail silently in sandboxed iframes
    }
  };

  // Speak narration
  const speakNarration = (text: string, lang: "en" | "ru") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (!voiceEnabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ru" ? "ru-RU" : "en-US";
    
    // Configure voice pitch and rate according to style for more pleasant experience
    let pitch = 1.0;
    let rate = 1.0;
    
    if (voiceStyle === "warm_female") {
      pitch = lang === "ru" ? 1.20 : 1.15;
      rate = lang === "ru" ? 0.78 : 0.80;
    } else if (voiceStyle === "deep_male") {
      pitch = lang === "ru" ? 0.84 : 0.86;
      rate = lang === "ru" ? 0.80 : 0.82;
    } else if (voiceStyle === "calm_soft") {
      pitch = lang === "ru" ? 1.05 : 1.02;
      rate = lang === "ru" ? 0.72 : 0.74;
    } else {
      pitch = 1.0;
      rate = lang === "ru" ? 0.81 : 0.83;
    }
    
    utterance.pitch = pitch;
    utterance.rate = rate;

    // Filter available voices based on preference
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const filtered = voices.filter(v => 
        lang === "ru" 
          ? v.lang.startsWith("ru") 
          : (v.lang.startsWith("en-US") || v.lang.startsWith("en"))
      );
      
      // Try to find matching voice style from OS available ones
      let matchingVoice = null;
      if (voiceStyle === "warm_female" || voiceStyle === "calm_soft") {
        matchingVoice = filtered.find(v => 
          v.name.toLowerCase().includes("female") || 
          v.name.toLowerCase().includes("zira") || 
          v.name.toLowerCase().includes("hazel") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("milena") ||
          v.name.toLowerCase().includes("google") ||
          v.name.toLowerCase().includes("natural")
        );
      } else if (voiceStyle === "deep_male") {
        matchingVoice = filtered.find(v => 
          v.name.toLowerCase().includes("male") || 
          v.name.toLowerCase().includes("david") || 
          v.name.toLowerCase().includes("yuri") ||
          v.name.toLowerCase().includes("pavel") ||
          v.name.toLowerCase().includes("microsoft")
        );
      }
      
      utterance.voice = matchingVoice || filtered[0] || null;
    }

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop current narration
  const stopNarration = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Control playback loops and state triggers
  useEffect(() => {
    if (isPlaying) {
      // Speak immediately when starting chapter or play is pressed
      const currentText = selectedVoiceLang === "ru" ? activeChapter.voiceRu : activeChapter.voiceEn;
      speakNarration(currentText, selectedVoiceLang);

      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const nextTime = prev + 0.2; // advance by tick
          if (nextTime >= activeChapter.duration) {
            // Wait for speech to finish completely if it's still reading
            if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
              return activeChapter.duration - 0.1;
            }
            // Move to next chapter
            if (currentChapterIndex < TUTORIAL_CHAPTERS.length - 1) {
              playSynthSound(587.33, 0.2, "triangle"); // D5 note chime
              setCurrentChapterIndex((c) => c + 1);
              return 0;
            } else {
              // Loop back to start or pause
              playSynthSound(440, 0.3, "sine");
              setIsPlaying(false);
              stopNarration();
              return 0;
            }
          }
          return nextTime;
        });
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopNarration();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopNarration();
    };
  }, [isPlaying, currentChapterIndex, selectedVoiceLang, voiceEnabled, voiceStyle]);

  // Reset chapter timer on manual chapter jump
  const jumpToChapter = (idx: number) => {
    playSynthSound(440, 0.1, "sine");
    setCurrentChapterIndex(idx);
    setCurrentTime(0);
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      // Re-trigger speech for the new chapter
      const nextText = selectedVoiceLang === "ru" ? TUTORIAL_CHAPTERS[idx].voiceRu : TUTORIAL_CHAPTERS[idx].voiceEn;
      speakNarration(nextText, selectedVoiceLang);
    }
  };

  // Interactive UI Simulation Effects synchronized with current Time and Chapters
  useEffect(() => {
    if (!isPlaying) return;

    // Reset simulator states if changing chapters
    if (currentTime < 0.5) {
      setSimFormTicker("");
      setSimFormPrice("");
      setSimFormSubmitted(false);
      setSimMetricsPnL(0);
      setSimMetricsWinRate(0);
      setSimSelectedDay(null);
      setSimAiReviewText("");
    }

    // ANIMATIONS FOR CHAPTER 0: JOURNAL & ENTRY FORM
    if (currentChapterIndex === 0) {
      // Typing simulator
      if (currentTime > 1.5 && currentTime < 3.5) {
        setSimFormTicker("NVDA");
        setSimCursorPos({ x: 35, y: 40 });
      }
      if (currentTime > 3.5 && currentTime < 5.5) {
        setSimFormDirection("Long");
        setSimCursorPos({ x: 120, y: 40 });
      }
      if (currentTime > 5.5 && currentTime < 7.5) {
        setSimFormPrice("124.50");
        setSimCursorPos({ x: 70, y: 65 });
      }
      if (currentTime > 7.5 && currentTime < 9.5) {
        setSimCursorPos({ x: 140, y: 110 }); // Move to button
      }
      if (currentTime >= 9.5) {
        setSimFormSubmitted(true);
        if (currentTime >= 9.5 && currentTime < 9.8) {
          playSynthSound(880, 0.15, "triangle"); // success beep
        }
      }
    }

    // ANIMATIONS FOR CHAPTER 1: ANALYZING METRICS
    if (currentChapterIndex === 1) {
      // Animate numbers counting up
      const progressRatio = currentTime / activeChapter.duration;
      setSimMetricsPnL(Math.round(progressRatio * 18450));
      setSimMetricsWinRate(Math.round(progressRatio * 67));
      setSimCursorPos({ x: 60 + Math.sin(currentTime) * 45, y: 55 + Math.cos(currentTime) * 25 });
    }

    // ANIMATIONS FOR CHAPTER 2: INTERACTIVE CHARTS
    if (currentChapterIndex === 2) {
      // Simulated clicks on calendar heatmap days
      if (currentTime > 2 && currentTime <= 5) {
        setSimSelectedDay(10);
        setSimCursorPos({ x: 110, y: 65 });
      } else if (currentTime > 5 && currentTime <= 8) {
        setSimSelectedDay(18);
        setSimCursorPos({ x: 180, y: 80 });
      } else if (currentTime > 8) {
        setSimSelectedDay(25);
        setSimCursorPos({ x: 230, y: 50 });
      }
    }

    // ANIMATIONS FOR CHAPTER 3: COMMENTS AND AI REVIEWS
    if (currentChapterIndex === 3) {
      setSimCursorPos({ x: 130 + Math.sin(currentTime) * 15, y: 120 });
      if (currentTime > 2 && currentTime <= 6) {
        setSimAiReviewText(selectedVoiceLang === "ru" ? "ИИ Анализирует..." : "AI Analyzing...");
      } else if (currentTime > 6) {
        setSimAiReviewText(
          selectedVoiceLang === "ru"
            ? "✓ Сделка идеальна! Стратегия соблюдена на 100%. Ошибок нет."
            : "✓ High quality trade! Playbook discipline score: 5/5. Clear entry."
        );
      }
    }
  }, [currentChapterIndex, currentTime, isPlaying, selectedVoiceLang]);

  // Calculate current progress width
  const totalDuration = activeChapter.duration;
  const progressPercent = Math.min((currentTime / totalDuration) * 100, 100);

  return (
    <div className="w-full bg-gradient-to-b from-[#141417] to-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
      {/* Upper bar */}
      <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 animate-pulse">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-zinc-100 flex items-center gap-2">
              {language === "ru" ? "ВИДЕО-ОБЗОР ВСЕХ ФУНКЦИЙ ЖУРНАЛА" : "COMPLETE VIDEO WALKTHROUGH & REVIEW"}
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.1 rounded uppercase font-mono">
                {language === "ru" ? "Приятный ИИ Голос" : "Premium AI Voice"}
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {language === "ru" 
                ? "Полноэкранный гид по вводу сделок, анализу метрик, плейбуку, психологическим логам и симулятору с ИИ-Аудитом"
                : "Full system review covering entries, metric curves, playbook checks, mindset logs, and candle replay with AI audits"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio voice track selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
            <Globe className="w-3 h-3 text-zinc-500" />
            <select
              value={selectedVoiceLang}
              onChange={(e) => {
                const val = e.target.value as "en" | "ru";
                setSelectedVoiceLang(val);
                playSynthSound(523.25, 0.1, "sine"); // C5 beep
              }}
              className="bg-transparent text-[10px] font-mono text-zinc-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ru" className="bg-[#141417]">🇷🇺 РУ Озвучка</option>
              <option value="en" className="bg-[#141417]">🇬🇧 EN Audio</option>
            </select>
          </div>

          {/* Voice Style settings toggle */}
          <button
            onClick={() => {
              playSynthSound(440, 0.1, "sine");
              setShowVoiceSettings(!showVoiceSettings);
            }}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
              showVoiceSettings 
                ? "bg-blue-600/25 border-blue-500 text-blue-400" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
            title={language === "ru" ? "Настройка приятного голоса" : "Voice synthesizer settings"}
          >
            <Settings className="w-3.5 h-3.5 animate-spin-slow" />
            <span className="text-[9px] font-mono font-bold hidden sm:inline">
              {language === "ru" ? "Настройка Голоса" : "Adjust Voice"}
            </span>
          </button>

          <button
            onClick={() => {
              playSynthSound(isOpen ? 392 : 587, 0.1, "triangle");
              setIsOpen(!isOpen);
            }}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Voice Selection Panel */}
      <AnimatePresence>
        {showVoiceSettings && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-zinc-950/90 border-b border-zinc-800 p-4"
          >
            <div className="max-w-xl mx-auto space-y-3 text-left">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-200">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{language === "ru" ? "ВЫБЕРИТЕ ПРИЯТНЫЙ ГОЛОС ДЛЯ ОЗВУЧКИ" : "SELECT A PLEASANT NARRATION VOICE STYLE"}</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                {language === "ru"
                  ? "Ниже представлены оптимизированные аудио-профили с индивидуальными частотами, скоростью и тембром для мягкого профессионального звучания."
                  : "We customized the audio frequencies, playback speed, and pitch parameters for a warmer, smoother experience."}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: "warm_female", nameRu: "🌸 Женский Мягкий", nameEn: "🌸 Soft Female", desc: "Warm & Melodic" },
                  { id: "deep_male", nameRu: "👔 Мужской Глубокий", nameEn: "👔 Deep Male", desc: "Calm & Executive" },
                  { id: "calm_soft", nameRu: "✨ Нежный Четкий", nameEn: "✨ Whispering", desc: "Slow & Detailed" },
                  { id: "default", nameRu: "⚙️ Стандартный", nameEn: "⚙️ Default", desc: "System Voice" }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setVoiceStyle(style.id as VoiceStyle);
                      playSynthSound(style.id === "warm_female" ? 659.25 : 329.63, 0.2, "triangle");
                    }}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      voiceStyle === style.id
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <p className="text-[10px] font-mono font-bold">
                      {language === "ru" ? style.nameRu : style.nameEn}
                    </p>
                    <span className="text-[8px] font-mono text-zinc-500 block mt-0.5">
                      {style.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* VIDEO LAYER: Column Span 8 */}
              <div className="lg:col-span-8 flex flex-col space-y-3">
                <div 
                  className="relative aspect-video w-full rounded-xl bg-black border border-zinc-800 overflow-hidden flex flex-col justify-between group shadow-inner"
                  style={{ minHeight: "310px" }}
                >
                  {/* Dynamic simulator rendering within video screen */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between select-none overflow-hidden">
                    
                    {/* VIDEO WATERMARK */}
                    <div className="flex justify-between items-center z-10">
                      <span className="text-[9px] font-mono font-semibold tracking-wider bg-black/70 backdrop-blur text-zinc-300 px-2.5 py-1 rounded border border-zinc-800/40 uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                        {language === "ru" ? "ИНТЕРАКТИВНОЕ ВИДЕО" : "INTERACTIVE WALKTHROUGH"}
                      </span>
                      <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-zinc-800/40">
                        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`}></span>
                        <span className="text-[8px] font-mono font-bold text-zinc-300">DEMO SCREEN</span>
                      </div>
                    </div>

                    {/* VIRTUAL SCREEN CONTROLLER: REPLICATING TRADING JOURNAL PAGES */}
                    <div className="flex-1 flex items-center justify-center relative mt-1">
                      
                      {/* SIMULATOR FOR CHAPTER 0: JOURNAL & ENTRY FORM */}
                      {currentChapterIndex === 0 && (
                        <div className="w-full max-w-sm bg-zinc-950/95 border border-zinc-800 p-3.5 rounded-lg space-y-2.5 shadow-xl relative text-left">
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Star className="w-3 h-3 text-emerald-400 shrink-0" />
                              {language === "ru" ? "Форма: Новая Сделка" : "Form: Log New Trade"}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-600">INPUT MOCKUP</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] font-mono text-zinc-500 block uppercase mb-0.5">{language === "ru" ? "Тикер" : "Ticker"}</label>
                              <div className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-zinc-200 min-h-[22px] flex items-center">
                                {simFormTicker || <span className="text-zinc-600 animate-pulse">|</span>}
                              </div>
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-zinc-500 block uppercase mb-0.5">{language === "ru" ? "Направление" : "Direction"}</label>
                              <div className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-zinc-200 min-h-[22px] flex items-center">
                                <span className={simFormDirection === "Long" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                  {simFormDirection}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] font-mono text-zinc-500 block uppercase mb-0.5">{language === "ru" ? "Цена входа ($)" : "Entry Price ($)"}</label>
                              <div className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-zinc-200 min-h-[22px] flex items-center">
                                {simFormPrice || <span className="text-zinc-600">--</span>}
                              </div>
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-zinc-500 block uppercase mb-0.5">{language === "ru" ? "Стратегия" : "Strategy"}</label>
                              <div className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[8px] font-mono text-zinc-400 truncate min-h-[22px] flex items-center">
                                {simFormTicker ? (language === "ru" ? "Откат от VWAP" : "VWAP Pullback") : "--"}
                              </div>
                            </div>
                          </div>

                          <button className={`w-full py-1.5 rounded text-[9px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                            simFormSubmitted ? "bg-emerald-600 text-white" : "bg-blue-600 text-white animate-pulse"
                          }`}>
                            {simFormSubmitted ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                {language === "ru" ? "Сделка Добавлена в Журнал!" : "Trade Saved successfully!"}
                              </>
                            ) : (
                              language === "ru" ? "Зарегистрировать Сделку" : "Log Trade"
                            )}
                          </button>

                          {/* Floating user feedback toast inside player */}
                          {simFormSubmitted && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border-2 border-emerald-500 text-emerald-400 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold shadow-2xl flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                              <span>{language === "ru" ? "ПОРТФЕЛЬ СИНХРОНИЗИРОВАН" : "PORTFOLIO SPREAD"}</span>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* SIMULATOR FOR CHAPTER 1: ANALYZING METRICS & DASHBOARD */}
                      {currentChapterIndex === 1 && (
                        <div className="w-full max-w-sm bg-zinc-950/90 border border-zinc-800 p-3.5 rounded-lg space-y-3.5 shadow-xl text-left">
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                            <span className="text-[9px] font-mono text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              {language === "ru" ? "Главные метрики" : "Key Metrics Indicator"}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-600">DASHBOARD</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-left relative overflow-hidden">
                              <span className="text-[7px] font-mono text-zinc-500 uppercase">{language === "ru" ? "Общий PnL" : "Total Profit"}</span>
                              <p className="text-xs font-extrabold text-emerald-400 mt-0.5 font-mono">
                                +${simMetricsPnL.toLocaleString()}
                              </p>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-left relative overflow-hidden">
                              <span className="text-[7px] font-mono text-zinc-500 uppercase">{language === "ru" ? "Процент Побед" : "Win Rate"}</span>
                              <p className="text-xs font-extrabold text-zinc-100 mt-0.5 font-mono">
                                {simMetricsWinRate}%
                              </p>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-left relative overflow-hidden">
                              <span className="text-[7px] font-mono text-zinc-500 uppercase">{language === "ru" ? "Профит-Фактор" : "Profit Factor"}</span>
                              <p className="text-xs font-extrabold text-amber-400 mt-0.5 font-mono">
                                {(currentTime / 4 + 1.2).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Interactive Area Chart Mock */}
                          <div className="h-16 bg-zinc-900 border border-zinc-800 rounded p-1.5 relative flex items-end">
                            <div className="absolute top-1 left-2 text-[7px] font-mono text-zinc-500 uppercase">
                              {language === "ru" ? "Кривая капитала" : "Cumulative Equity Growth"}
                            </div>
                            <svg viewBox="0 0 300 60" className="w-full h-12 overflow-visible">
                              <defs>
                                <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                                  <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                              {/* Glowing path */}
                              <path 
                                d={`M 0 50 Q 50 ${50 - simMetricsWinRate / 3} 100 ${45 - simMetricsWinRate / 2} T 200 ${30 - simMetricsWinRate / 1.5} T 300 5`} 
                                fill="none" 
                                stroke="#10b981" 
                                strokeWidth="2"
                                strokeDasharray="500"
                                strokeDashoffset={500 - (currentTime / activeChapter.duration) * 500}
                              />
                              <path 
                                d={`M 0 50 Q 50 ${50 - simMetricsWinRate / 3} 100 ${45 - simMetricsWinRate / 2} T 200 ${30 - simMetricsWinRate / 1.5} T 300 5 L 300 60 L 0 60 Z`} 
                                fill="url(#simGrad)"
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* SIMULATOR FOR CHAPTER 2: DETAILED STATISTICS */}
                      {currentChapterIndex === 2 && (
                        <div className="w-full max-w-sm bg-zinc-950/90 border border-zinc-800 p-3.5 rounded-lg space-y-3.5 shadow-xl text-left">
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                            <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <BarChart3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              {language === "ru" ? "Статистический анализ" : "Advanced Performance Analytics"}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-600">STATS</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded text-left">
                              <span className="text-[7px] font-mono text-zinc-500 uppercase block mb-1">
                                {language === "ru" ? "Ср. победа vs Ср. убыток" : "Avg Win vs Avg Loss"}
                              </span>
                              <div className="space-y-1.5 mt-1">
                                <div>
                                  <div className="flex justify-between text-[8px] font-mono text-zinc-400">
                                    <span>Win</span>
                                    <span className="text-emerald-400">+$420</span>
                                  </div>
                                  <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded" style={{ width: "84%" }}></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-[8px] font-mono text-zinc-400">
                                    <span>Loss</span>
                                    <span className="text-rose-400">-$150</span>
                                  </div>
                                  <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
                                    <div className="h-full bg-rose-500 rounded" style={{ width: "30%" }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded text-left flex flex-col justify-between">
                              <div>
                                <span className="text-[7px] font-mono text-zinc-500 uppercase block">
                                  {language === "ru" ? "Распределение активов" : "Asset Allocation"}
                                </span>
                                <p className="text-[10px] font-mono text-zinc-300 font-bold mt-1">
                                  {language === "ru" ? "50% Акции / 40% Крипто" : "50% Stocks / 40% Crypto"}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-[8px] font-mono text-zinc-500">FX 10%</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-center bg-zinc-900/60 p-1.5 border border-zinc-800/40 rounded">
                            <span className="text-[8px] font-mono text-zinc-400">
                              {language === "ru" ? "Математическое ожидание сделки: +$190" : "Trading System Expectancy: +$190 per trade"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* SIMULATOR FOR CHAPTER 3: MINDSET & PSYCHOLOGY LOG */}
                      {currentChapterIndex === 3 && (
                        <div className="w-full max-w-sm bg-zinc-950/90 border border-zinc-800 p-3.5 rounded-lg space-y-3 shadow-xl text-left">
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                            <span className="text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              {language === "ru" ? "Учет эмоций и психология" : "Mindset & Psychology Audit"}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-600">PSYCHOLOGY</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                              <span className="text-[7px] font-mono text-zinc-500 block uppercase">{language === "ru" ? "Сон (продолжительность)" : "Sleep duration"}</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] font-mono font-extrabold text-zinc-200">8.2 hrs</span>
                                <span className="text-[8px] text-emerald-400 font-mono">✓ Excellent</span>
                              </div>
                            </div>

                            <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                              <span className="text-[7px] font-mono text-zinc-500 block uppercase">{language === "ru" ? "Оценка Фокуса" : "Focus Rating"}</span>
                              <div className="flex items-center gap-0.5 mt-1 text-amber-400">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <Star className="w-2.5 h-2.5 fill-current" />
                              </div>
                            </div>
                          </div>

                          {/* AI warning warning detected */}
                          <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800 space-y-1">
                            <span className="text-[7px] font-mono text-amber-400 uppercase tracking-wider font-bold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              {language === "ru" ? "ИИ-Выявление тильта Gemini" : "Gemini AI Mindset Insights"}
                            </span>
                            <p className="text-[9px] font-mono text-zinc-300 leading-relaxed">
                              {selectedVoiceLang === "ru" 
                                ? "✓ Выявление аномалий: Высокий уровень сна снизил риск эмоционального тильта на 45%. Дисциплина стабильна."
                                : "✓ Pattern detected: High quality sleep directly suppressed FOMO response by 45%. Discipline scores are optimal."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* SIMULATOR FOR CHAPTER 4: PLAYBOOK RULES & GOALS */}
                      {currentChapterIndex === 4 && (
                        <div className="w-full max-w-sm bg-zinc-950/90 border border-zinc-800 p-3.5 rounded-lg space-y-3 shadow-xl text-left">
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              {language === "ru" ? "Цели и дисциплина плейбука" : "Weekly Playbook & Goals"}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-600">GOALS & RULES</span>
                          </div>

                          <div className="space-y-2">
                            {/* Goals Progress */}
                            <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                              <div className="flex justify-between text-[8px] font-mono text-zinc-400 mb-1">
                                <span>{language === "ru" ? "Недельный план по прибыли ($1,500)" : "Weekly Profit Target ($1,500)"}</span>
                                <span className="font-bold text-zinc-200">82%</span>
                              </div>
                              <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
                                <motion.div 
                                  className="bg-emerald-500 h-full rounded"
                                  animate={{ width: "82%" }}
                                  transition={{ duration: 1.5 }}
                                />
                              </div>
                            </div>

                            {/* Checklist Setup */}
                            <div className="bg-zinc-900 p-2 rounded border border-zinc-800 space-y-1">
                              <span className="text-[7px] font-mono text-zinc-500 block uppercase">{language === "ru" ? "Правила отбора сделок (чек-лист)" : "Playbook execution checklist"}</span>
                              <div className="grid grid-cols-2 gap-1 text-[8px] font-mono text-zinc-400">
                                <div className="flex items-center gap-1 text-emerald-400">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>RSI Divergence</span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-400">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>VWAP Support</span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-400">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Volume Spike</span>
                                </div>
                                <div className="flex items-center gap-1 text-zinc-600">
                                  <span className="w-2.5 h-2.5 flex items-center justify-center">-</span>
                                  <span>Overnight session</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SIMULATOR FOR CHAPTER 5: INTERACTIVE REPLAY & AI AUDITS */}
                      {currentChapterIndex === 5 && (
                        <div className="w-full max-w-sm bg-zinc-950/90 border border-zinc-800 p-3 rounded-lg space-y-2 shadow-xl text-left">
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1">
                            <span className="text-[8px] font-mono text-amber-400 font-bold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              {language === "ru" ? "ИИ-Аудит Gemini" : "Gemini AI Trade Audit"}
                            </span>
                            <span className="text-[7px] font-mono text-zinc-500">M5 REPLAY ENGINE</span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800 text-[8px] font-mono text-zinc-400">
                              <span className="text-zinc-500 uppercase block tracking-wider text-[7px]">{language === "ru" ? "ВАШ КОММЕНТАРИЙ" : "YOUR REACTION NOTE"}</span>
                              {language === "ru" ? "Сделка совершена идеально по правилам отката от VWAP. Риск под контролем." : "Perfect execution of VWAP pullback setup. Kept position sizes small."}
                            </div>
                            
                            <div className="bg-zinc-900 p-2 rounded border border-zinc-800/50 min-h-[50px] flex items-start gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <div className="text-[8px] font-mono text-zinc-200">
                                {simAiReviewText || (
                                  <span className="text-zinc-600 animate-pulse">
                                    {language === "ru" ? "Нажмите «Запросить ИИ-Аудит» для запуска..." : "Waiting for Gemini AI evaluation query..."}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SIMULATED INJECTED CURSOR (MOVES AROUND THE SCREEN) */}
                      {isPlaying && (
                        <motion.div 
                          className="absolute w-4 h-4 text-white z-50 pointer-events-none drop-shadow"
                          animate={{ x: simCursorPos.x, y: simCursorPos.y }}
                          transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
                        >
                          <svg viewBox="0 0 24 24" className="w-full h-full fill-white stroke-black stroke-1">
                            <path d="M4.5 3v15.25l3.75-3.75 3 7.25 2.5-1-3-7.25h5.5L4.5 3z" />
                          </svg>
                        </motion.div>
                      )}

                    </div>

                    {/* LIVE SPEECH SOUNDWAVE VISUALIZATION */}
                    <div className="flex items-center gap-2 justify-between bg-black/75 backdrop-blur-sm px-3 py-2 rounded-lg border border-zinc-800/40">
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="text-[9px] font-mono text-zinc-300 truncate max-w-[200px] md:max-w-[400px]">
                          {selectedVoiceLang === "ru" ? activeChapter.titleRu : activeChapter.titleEn}
                        </span>
                      </div>
                      
                      {/* Animated Wavebar */}
                      <div className="flex items-center gap-0.5 h-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
                          let duration = 0.4 + Math.random() * 0.8;
                          return (
                            <motion.span
                              key={bar}
                              className="w-0.5 bg-blue-500 rounded-full"
                              animate={{ 
                                height: isPlaying && voiceEnabled ? ["2px", "11px", "4px", "13px", "2px"] : "2px" 
                              }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: duration,
                                ease: "easeInOut" 
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM HOVER CONTROLS */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent p-3 opacity-100 flex flex-col space-y-2 border-t border-zinc-900/30">
                    {/* Playhead Timeline Slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-zinc-500">
                        {Math.floor(currentTime)}s
                      </span>
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden relative cursor-pointer">
                        <div 
                          className="absolute h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-500">
                        {Math.floor(totalDuration)}s
                      </span>
                    </div>

                    {/* Player Control Bar */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            playSynthSound(isPlaying ? 293.66 : 523.25, 0.15, "sine");
                            setIsPlaying(!isPlaying);
                          }}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-200 transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>

                        <button
                          onClick={() => {
                            playSynthSound(349.23, 0.1, "sine");
                            setCurrentTime(0);
                            if (isPlaying) {
                              const txt = selectedVoiceLang === "ru" ? activeChapter.voiceRu : activeChapter.voiceEn;
                              speakNarration(txt, selectedVoiceLang);
                            }
                          }}
                          className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                          title={language === "ru" ? "Перезапустить главу" : "Restart current segment"}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Mute voiceover button */}
                        <button
                          onClick={() => {
                            playSynthSound(440, 0.1, "sine");
                            setVoiceEnabled(!voiceEnabled);
                          }}
                          className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                          title={voiceEnabled ? (language === "ru" ? "Выключить озвучку" : "Mute voiceover narration") : (language === "ru" ? "Включить озвучку" : "Unmute voiceover narration")}
                        >
                          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
                        </button>
                      </div>

                      {/* Display current active chapter title */}
                      <span className="text-[10px] font-mono font-bold text-zinc-300">
                        {language === "ru" ? activeChapter.titleRu : activeChapter.titleEn}
                      </span>

                      {/* Speech subtitles translation preview line */}
                      <span className="text-[8px] font-mono text-zinc-500">
                        {currentChapterIndex + 1} / {TUTORIAL_CHAPTERS.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated speech narration subtitles (Karaoke scrolling subtitle card) */}
                <div className="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-lg text-left relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-mono text-zinc-500 uppercase">
                    <Activity className="w-2.5 h-2.5 text-blue-500 animate-pulse" />
                    {language === "ru" ? "Текст Озвучки" : "Speech Transcript"}
                  </div>
                  <p className="text-[9px] font-mono font-medium text-blue-400 tracking-wider uppercase mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    {language === "ru" ? "ТЕКСТ ТЕКУЩЕЙ ГЛАВЫ:" : "SPEECH TRANSMISSION:"}
                  </p>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {selectedVoiceLang === "ru" ? activeChapter.voiceRu : activeChapter.voiceEn}
                  </p>
                </div>
              </div>

              {/* NAVIGATION BAR AND MANUALS: Column Span 4 */}
              <div className="lg:col-span-4 space-y-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block text-left font-bold">
                  {language === "ru" ? "Разделы обзора" : "Walkthrough Chapters"}
                </span>

                <div className="space-y-2">
                  {TUTORIAL_CHAPTERS.map((ch, idx) => {
                    const isCurrent = idx === currentChapterIndex;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => jumpToChapter(idx)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs font-mono cursor-pointer flex justify-between items-center ${
                          isCurrent 
                            ? "bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold" 
                            : "bg-[#09090b]/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p>{language === "ru" ? ch.titleRu : ch.titleEn}</p>
                          <span className="text-[8px] font-mono text-zinc-500 block">
                            {ch.duration}s {language === "ru" ? "длительность" : "duration"}
                          </span>
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isCurrent ? "translate-x-1 text-blue-400" : "text-zinc-600"}`} />
                      </button>
                    );
                  })}
                </div>

                {/* Additional manual hints */}
                <div className="p-3 bg-[#09090b] border border-zinc-800/50 rounded-lg space-y-1.5 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-200">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>{language === "ru" ? "Советы по озвучке" : "Audio Playback Controls"}</span>
                  </div>
                  <ul className="text-[9px] font-mono text-zinc-400 space-y-1 pl-3.5 list-disc leading-relaxed">
                    <li>{language === "ru" ? "Нажмите «Настройка Голоса» для переключения на женский, мужской или нежный голос." : "Click 'Adjust Voice' above to toggle Female, Deep Male, or Whispering soundwaves."}</li>
                    <li>{language === "ru" ? "Все данные в демонстрационных экранах синхронизируются с реальным временем главы." : "All visual animations on screen perfectly sync with the spoken instructions."}</li>
                    <li>{language === "ru" ? "Озвучка работает на русском и английском в зависимости от выбора флага." : "The speech synthesizer adapts to Russian or English globally."}</li>
                  </ul>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
