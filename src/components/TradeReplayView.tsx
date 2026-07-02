import React, { useState, useEffect, useRef } from "react";
import { Trade, Candlestick } from "../types";
import { generateCandlesForTrade } from "../utils/tradingUtils";
import { Play, Pause, SkipForward, SkipBack, RefreshCw, Sparkles, BrainCircuit, Calendar, DollarSign, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { useLanguage } from "../LanguageContext";

interface TradeReplayViewProps {
  trades: Trade[];
}

export default function TradeReplayView({ trades }: TradeReplayViewProps) {
  const { t, language } = useLanguage();
  const [selectedTradeId, setSelectedTradeId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(800);
  const [aiReviewText, setAiReviewText] = useState<string>("");
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);

  const activeTrade = trades.find((t) => t.id === selectedTradeId) || trades[0];

  useEffect(() => {
    if (trades.length > 0 && !selectedTradeId) {
      setSelectedTradeId(trades[0].id);
    }
  }, [trades, selectedTradeId]);

  // Reset step whenever selected trade changes
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setAiReviewText("");
  }, [selectedTradeId]);

  // Handle Playback Interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 19) {
            setIsPlaying(false);
            return 19;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speedMs]);

  if (!activeTrade) {
    return (
      <div className="text-center py-20 text-zinc-500 text-xs font-mono border border-zinc-800 rounded-xl bg-[#0c0c0e]">
        {language === "ru" ? "В журнале нет зарегистрированных сделок для симуляции." : "No trades logged in the journal to replay."}
      </div>
    );
  }

  const candles = generateCandlesForTrade(activeTrade);
  const visibleCandles = candles.slice(0, currentStep + 1);

  // Math for SVG rendering coordinates
  const svgHeight = 250;
  const svgWidth = 600;
  const prices = candles.flatMap((c) => [c.high, c.low]);
  const sl = activeTrade.stopLoss ?? activeTrade.entryPrice * 0.98;
  const tp = activeTrade.takeProfit ?? activeTrade.entryPrice * 1.02;
  prices.push(sl, tp, activeTrade.entryPrice, activeTrade.exitPrice);

  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const getY = (price: number) => {
    // Add 8% padding top and bottom
    const pad = priceRange * 0.08;
    return svgHeight - ((price - (minPrice - pad)) / (priceRange + pad * 2)) * svgHeight;
  };

  const getX = (idx: number) => {
    const spacing = svgWidth / 20;
    return idx * spacing + spacing / 2;
  };

  const handleStepForward = () => {
    if (currentStep < 19) setCurrentStep(currentStep + 1);
  };

  const handleStepBackward = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Call the server-side API to audit the trade with Gemini
  const handleTriggerAIAudit = async () => {
    setIsLoadingReview(true);
    setAiReviewText("");
    try {
      const promptText = language === "ru"
        ? `Проведите глубокий психологический и технический аудит этой сделки:
Тикер: ${activeTrade.ticker}
Направление: ${activeTrade.direction}
Цена входа: ${activeTrade.entryPrice}
Цена выхода: ${activeTrade.exitPrice}
PnL: ${activeTrade.pnl}
Эмоция до входа: ${activeTrade.emotionBefore}
Эмоция после выхода: ${activeTrade.emotionAfter}
Выявленные ошибки: ${activeTrade.mistakes.join(", ")}
Заметки трейдера: ${activeTrade.notes}

Оформите подробный разбор на РУССКОМ языке в формате Markdown с практическими выводами.`
        : undefined;

      const response = await fetch("/api/review/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          trade: activeTrade,
          prompt: promptText
        }),
      });
      const data = await response.json();
      if (data.review) {
        setAiReviewText(data.review);
      } else {
        setAiReviewText(language === "ru" ? "Не удалось получить оценку ИИ." : "Failed to retrieve AI evaluation.");
      }
    } catch (err: any) {
      setAiReviewText(language === "ru" ? `Ошибка аудита сделки: ${err.message}` : `Error auditing trade: ${err.message}`);
    } finally {
      setIsLoadingReview(false);
    }
  };

  // Replay Log commentary based on index
  const getCommentary = () => {
    const entryIdx = 6;
    const exitIdx = 14;
    
    if (currentStep < entryIdx) {
      return {
        phase: language === "ru" ? "Утренний анализ / Подготовка" : "Preparation",
        text: language === "ru"
          ? `Цена консолидируется около ${candles[currentStep]?.close}. Ожидание сигнала на вход согласно вашей стратегии: "${activeTrade.strategy}".`
          : `Price is consolidating near ${candles[currentStep]?.close}. Waiting for entry signal according to your Playbook: "${activeTrade.strategy}".`,
        class: "text-zinc-400",
      };
    } else if (currentStep === entryIdx) {
      return {
        phase: language === "ru" ? "Триггер входа" : "Entry Triggered",
        text: language === "ru"
          ? `✓ Лимитный ордер на покупку исполнен по цене $${activeTrade.entryPrice}. Объем: ${activeTrade.positionSize} ед. SL: $${sl.toLocaleString()}, TP: $${tp.toLocaleString()}. Настроение до входа: "${activeTrade.emotionBefore}".`
          : `✓ BUY LIMIT order filled at $${activeTrade.entryPrice}. Position Size: ${activeTrade.positionSize} units. SL: $${sl.toLocaleString()}, TP: $${tp.toLocaleString()}. Emotion Before: "${activeTrade.emotionBefore}".`,
        class: "text-emerald-400 font-bold bg-emerald-500/5 border-l-2 border-emerald-500 pl-2 py-1",
      };
    } else if (currentStep > entryIdx && currentStep < exitIdx) {
      const pnlNow = (candles[currentStep].close - activeTrade.entryPrice) * activeTrade.positionSize * (activeTrade.direction === "Long" ? 1 : -1);
      const isUp = pnlNow >= 0;
      return {
        phase: language === "ru" ? "Позиция активна" : "Position Active",
        text: language === "ru"
          ? `Сделка в процессе. Текущая цена: $${candles[currentStep].close}. Нереализованный плавающий доход: ${isUp ? "+" : ""}$${pnlNow.toFixed(2)}. Сохраняем дисциплину, даем правилам отработать волатильность.`
          : `Trade active. Current price: $${candles[currentStep].close}. Unrealized floating equity: ${isUp ? "+" : ""}$${pnlNow.toFixed(2)}. Staying disciplined and letting rules handle volatility.`,
        class: isUp ? "text-emerald-300" : "text-amber-400",
      };
    } else if (currentStep === exitIdx) {
      const realizedPnL = activeTrade.pnl || 0;
      return {
        phase: language === "ru" ? "Позиция закрыта" : "Position Closed",
        text: language === "ru"
          ? `✕ ВЫХОД ИЗ СДЕЛКИ по цене $${activeTrade.exitPrice}. Зафиксированный чистый PnL: ${realizedPnL >= 0 ? "+" : ""}$${realizedPnL.toFixed(2)}. Эмоциональное состояние после: "${activeTrade.emotionAfter}".`
          : `✕ EXIT TRIGGERED at $${activeTrade.exitPrice}. Net Realized PnL: ${realizedPnL >= 0 ? "+" : ""}$${realizedPnL.toFixed(2)}. Emotion After: "${activeTrade.emotionAfter}".`,
        class: realizedPnL >= 0 
          ? "text-emerald-400 font-bold bg-emerald-500/10 border-l-2 border-emerald-500 pl-2 py-1"
          : "text-rose-400 font-bold bg-rose-500/10 border-l-2 border-rose-500 pl-2 py-1",
      };
    } else {
      const realizedPnL = activeTrade.pnl || 0;
      return {
        phase: language === "ru" ? "Оценка результатов" : "Post-Trade Assessment",
        text: language === "ru"
          ? `Сделка завершена. Наблюдаем за дальнейшим движением цены для проверки на ранний выход или пересиживание. Итоговый результат: $${realizedPnL}.`
          : `Trade closed. Observing subsequent price action to test for under-holding or late exit errors. Final return: $${activeTrade.pnl}.`,
        class: "text-zinc-400 font-mono",
      };
    }
  };

  const comment = getCommentary();

  return (
    <div className="space-y-6">
      {/* Selector and Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0c0c0e] p-4 border border-zinc-800/50 rounded-xl">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            {t("rp_title")}
          </h3>
          <p className="text-xs text-zinc-400">{t("rp_subtitle")}</p>
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedTradeId}
            onChange={(e) => setSelectedTradeId(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800/50 text-xs rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer"
          >
            {trades.map((t) => (
              <option key={t.id} value={t.id}>
                {t.ticker} ({t.direction === "Long" && language === "ru" ? "ЛОНГ" : t.direction === "Short" && language === "ru" ? "ШОРТ" : t.direction}) - ${t.pnl} [{t.strategy}]
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Replay Chart Panel (2 cols) */}
        <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800/30 pb-3">
              <div className="flex gap-4 items-center">
                <span className="text-base font-bold text-zinc-100">{activeTrade.ticker}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  activeTrade.direction === "Long" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}>
                  {activeTrade.direction === "Long" && language === "ru" ? "Длинная (Long)" : activeTrade.direction === "Short" && language === "ru" ? "Короткая (Short)" : activeTrade.direction} 5M {language === "ru" ? "ГРАФИК" : "CHART"}
                </span>
              </div>
              <div className="text-right text-[10px] font-mono text-zinc-500">
                <span>{language === "ru" ? "Вход" : "Entry"}: {activeTrade.entryTime.slice(11, 16)} | {language === "ru" ? "Выход" : "Exit"}: {activeTrade.exitTime.slice(11, 16)}</span>
              </div>
            </div>
 
            {/* SVG Candlestick Screen */}
            <div className="bg-[#09090b] border border-zinc-800/50 rounded-lg p-2 relative overflow-hidden h-72">
              <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                {/* Grid Lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={svgHeight * ratio}
                    x2={svgWidth}
                    y2={svgHeight * ratio}
                    stroke="#18181b"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}

                {/* Target & Stop Dashed Overlays (Visible post-entry) */}
                {currentStep >= 6 && (
                  <>
                    {/* Take Profit (Green Line) */}
                    <line
                      x1="0"
                      y1={getY(tp)}
                      x2={svgWidth}
                      y2={getY(tp)}
                      stroke="#22c55e"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                    <text x="10" y={getY(tp) - 4} fill="#22c55e" className="text-[9px] font-mono font-bold">
                      {language === "ru" ? "ЦЕЛЬ (TP)" : "TP TARGET"}: ${tp}
                    </text>

                    {/* Entry Price (White Line) */}
                    <line
                      x1="0"
                      y1={getY(activeTrade.entryPrice)}
                      x2={svgWidth}
                      y2={getY(activeTrade.entryPrice)}
                      stroke="#e4e4e7"
                      strokeWidth="1.2"
                    />
                    <text x="10" y={getY(activeTrade.entryPrice) - 4} fill="#e4e4e7" className="text-[9px] font-mono">
                      {language === "ru" ? "ЦЕНА ВХОДА" : "ENTRY LEVEL"}: ${activeTrade.entryPrice}
                    </text>

                    {/* Stop Loss (Red Line) */}
                    <line
                      x1="0"
                      y1={getY(sl)}
                      x2={svgWidth}
                      y2={getY(sl)}
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                    <text x="10" y={getY(sl) - 4} fill="#ef4444" className="text-[9px] font-mono font-bold">
                      {language === "ru" ? "СТОП (SL)" : "SL LIMIT"}: ${sl}
                    </text>
                  </>
                )}

                {/* Candlesticks Drawing */}
                {visibleCandles.map((c, idx) => {
                  const isGreen = c.close >= c.open;
                  const candleColor = isGreen ? "#10b981" : "#ef4444";
                  const candleWidth = (svgWidth / 20) * 0.7;
                  
                  const bodyTop = getY(Math.max(c.open, c.close));
                  const bodyBottom = getY(Math.min(c.open, c.close));
                  const bodyHeight = Math.max(bodyBottom - bodyTop, 2); // Ensure body height is visible

                  const xPos = getX(idx);

                  return (
                    <g key={idx}>
                      {/* Wick */}
                      <line
                        x1={xPos}
                        y1={getY(c.high)}
                        x2={xPos}
                        y2={getY(c.low)}
                        stroke={candleColor}
                        strokeWidth="1.5"
                      />
                      {/* Body */}
                      <rect
                        x={xPos - candleWidth / 2}
                        y={bodyTop}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={candleColor}
                        stroke={candleColor}
                        strokeWidth="1"
                        rx="1"
                      />

                      {/* Entry Indicator marker */}
                      {idx === 6 && (
                        <g>
                          <circle cx={xPos} cy={getY(activeTrade.entryPrice)} r="5" fill="#3b82f6" />
                          <path d={`M ${xPos} ${getY(activeTrade.entryPrice) + 12} L ${xPos} ${getY(activeTrade.entryPrice) + 6}`} stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow)" />
                        </g>
                      )}

                      {/* Exit Indicator marker */}
                      {idx === 14 && (
                        <g>
                          <circle cx={xPos} cy={getY(activeTrade.exitPrice)} r="5" fill="#f43f5e" />
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Progress Slider Overlay */}
              <div className="absolute bottom-2 left-2 bg-black/75 px-3 py-1 rounded border border-zinc-800 text-[10px] font-mono text-zinc-400">
                {language === "ru" ? "Свеча" : "Candle"}: {currentStep + 1} / 20 | {language === "ru" ? "Цена" : "Price"}: ${candles[currentStep]?.close}
              </div>
            </div>
          </div>

          {/* Controls bar */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#09090b] p-3 border border-zinc-800/50 rounded-lg">
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentStep(0)}
                className="p-1.5 bg-[#0c0c0e] hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 cursor-pointer"
                title={language === "ru" ? "Сбросить симуляцию" : "Reset Replay"}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStepBackward}
                disabled={currentStep === 0}
                className="p-1.5 bg-[#0c0c0e] hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 disabled:opacity-50 cursor-pointer"
                title={language === "ru" ? "Предыдущая свеча" : "Previous Candle"}
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                  isPlaying ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? (language === "ru" ? "Пауза" : "Pause") : (language === "ru" ? "Авто-старт" : "Play Replay")}
              </button>
              <button
                onClick={handleStepForward}
                disabled={currentStep === 19}
                className="p-1.5 bg-[#0c0c0e] hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 disabled:opacity-50 cursor-pointer"
                title={language === "ru" ? "Следующая свеча" : "Next Candle"}
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Speed slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{language === "ru" ? "Скорость воспроизведения:" : "Playback Speed:"}</span>
              <input
                type="range"
                min="200"
                max="2000"
                step="200"
                value={2200 - speedMs}
                onChange={(e) => setSpeedMs(2200 - parseInt(e.target.value))}
                className="w-24 accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-zinc-400">{(speedMs / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </div>

        {/* Replay Details Panel */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">{language === "ru" ? "ХОД СДЕЛКИ И ИНСАЙТЫ" : "REPLAY INSIGHTS"}</span>
              <h4 className="text-sm font-semibold text-zinc-200 mt-1">{activeTrade.strategy}</h4>
            </div>

            {/* Step Commentary Log Box */}
            <div className="bg-[#09090b] border border-zinc-800/50 p-3.5 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-blue-400 uppercase font-bold tracking-wider">{comment.phase}</span>
                <span className="text-[9px] font-mono text-zinc-500">{language === "ru" ? "Свеча 5M" : "M5 Step"} {currentStep}</span>
              </div>
              <p className={`text-xs ${comment.class} leading-relaxed`}>{comment.text}</p>
            </div>

            {/* Physical Attributes Checklist */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">{language === "ru" ? "РАЗМЫШЛЕНИЯ ТРЕЙДЕРА" : "TRADER REFLECTIONS"}</span>
              <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/50 space-y-1 text-xs">
                <p className="text-zinc-400"><strong className="text-zinc-300">{language === "ru" ? "Эмоция до входа" : "Emotion Prior"}:</strong> {activeTrade.emotionBefore}</p>
                <p className="text-zinc-400"><strong className="text-zinc-300">{language === "ru" ? "Эмоция после выхода" : "Emotion Post"}:</strong> {activeTrade.emotionAfter}</p>
                {activeTrade.mistakes.length > 0 && (
                  <p className="text-rose-400 font-medium">
                    ⚠️ <strong className="text-zinc-300">{language === "ru" ? "Ошибки" : "Mistakes"}:</strong> {activeTrade.mistakes.join(", ")}
                  </p>
                )}
                {activeTrade.notes && (
                  <p className="text-zinc-500 text-[11px] leading-relaxed mt-2 italic border-t border-zinc-800/30 pt-2">
                    "{activeTrade.notes}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* AI Auditor Action */}
          <div className="border-t border-zinc-800/50 pt-4 mt-4">
            <button
              onClick={handleTriggerAIAudit}
              disabled={isLoadingReview}
              className="w-full flex items-center justify-center gap-1.5 bg-[#09090b] hover:bg-zinc-800 border border-zinc-800 text-zinc-100 py-2 rounded-lg text-xs font-semibold shadow-md disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isLoadingReview ? (language === "ru" ? "ИИ Проводит Аудит..." : "AI Running Audit...") : (language === "ru" ? "Запросить ИИ-Аудит сделки" : "Request AI Setup Audit")}
            </button>
          </div>
        </div>
      </div>

      {/* AI REVIEW RESULTS DRAWER */}
      <AnimatePresence>
        {aiReviewText && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="border border-zinc-800/50 bg-[#09090b] rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800/30 pb-3">
              <h4 className="text-xs font-mono text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-amber-400 animate-pulse" />
                {language === "ru" ? "ИИ-Аудит ZellaTrader - Отчет" : "ZellaTrader AI Audit Output"}
              </h4>
              <button
                onClick={() => setAiReviewText("")}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-mono cursor-pointer"
              >
                {language === "ru" ? "✕ Очистить отчет" : "✕ Clear Audit"}
              </button>
            </div>
            <div className="markdown-body text-xs text-zinc-300 leading-relaxed max-h-96 overflow-y-auto space-y-2 pr-2">
              <Markdown>{aiReviewText}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
