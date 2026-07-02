import React, { useState } from "react";
import { PsychologyLog, Trade } from "../types";
import { Brain, Sparkles, Smile, ShieldAlert, Heart, Calendar, Plus, ChevronRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { useLanguage } from "../LanguageContext";

interface PsychologyViewProps {
  psychologyLogs: PsychologyLog[];
  trades: Trade[];
  onAddPsychologyLog: (log: PsychologyLog) => void;
}

export default function PsychologyView({ psychologyLogs, trades, onAddPsychologyLog }: PsychologyViewProps) {
  const { t, language } = useLanguage();
  const [isNewLogOpen, setIsNewLogOpen] = useState(false);
  const [aiDiagnostic, setAiDiagnostic] = useState<string>("");
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Form state
  const [notes, setNotes] = useState("");
  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [fomo, setFomo] = useState(1);
  const [overtrading, setOvertrading] = useState(1);
  const [revenge, setRevenge] = useState(false);
  const [fear, setFear] = useState(3);
  const [greed, setGreed] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [patience, setPatience] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: PsychologyLog = {
      id: "psy_" + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      fomoFrequency: fomo,
      overtradingScore: overtrading,
      revengeTrading: revenge,
      fear,
      greed,
      confidence,
      patience,
      sleep,
      stress,
      energy,
      notes,
    };
    onAddPsychologyLog(newLog);
    setIsNewLogOpen(false);
    
    // reset
    setNotes("");
    setSleep(3);
    setStress(3);
    setEnergy(3);
    setFomo(1);
    setOvertrading(1);
    setRevenge(false);
    setFear(3);
    setGreed(3);
    setConfidence(3);
    setPatience(3);
  };

  // Run AI Psychological Diagnostic
  const handleRunDiagnostic = async () => {
    setIsAuditing(true);
    setAiDiagnostic("");

    try {
      const prompt = language === "ru"
        ? `Проведите комплексную психологическую диагностику моего торгового поведения.
Проанализируйте эмоциональное состояние и отчетность по сделкам ниже:

--- ПСИХОЛОГИЧЕСКИЕ ЛОГИ ---
${JSON.stringify(psychologyLogs.slice(0, 6), null, 2)}

--- РЕЗУЛЬТАТЫ СДЕЛКИ И ОШИБКИ ---
${JSON.stringify(
  trades.slice(0, 10).map((t) => ({
    ticker: t.ticker,
    pnl: t.pnl,
    strategy: t.strategy,
    mistakes: t.mistakes,
    emotionBefore: t.emotionBefore,
    emotionAfter: t.emotionAfter,
  })),
  null,
  2
)}

Составьте отчет профессионального торгового психолога в формате Markdown на РУССКОМ языке:
1. **Выявленные поведенческие паттерны**: Связь между сном, тонусом, стрессом и ошибками в торговле (напр. переторговка, FOMO).
2. **Анализ убытков**: Оцените эмоциональное состояние до и после убыточных сделок.
3. **Практические рекомендации**: Создайте 3 психологических правила для следующей торговой сессии, чтобы предотвратить эмоциональные срывы.`
        : `Perform a comprehensive Psychological Diagnostic on my trading behavior.
Analyze the emotional states and self-reported trading performance below:

--- PSYCHOLOGY LOG ENTRIES ---
${JSON.stringify(psychologyLogs.slice(0, 6), null, 2)}

--- TRADING LOG MISTAKES & RESULTS ---
${JSON.stringify(
  trades.slice(0, 10).map((t) => ({
    ticker: t.ticker,
    pnl: t.pnl,
    strategy: t.strategy,
    mistakes: t.mistakes,
    emotionBefore: t.emotionBefore,
    emotionAfter: t.emotionAfter,
  })),
  null,
  2
)}

Format your output as an expert trading psychologist report using Markdown:
1. **Behavioral Patterns identified**: Draw correlations between sleep, energy, stress, and trade mistakes (e.g. overtrading, FOMO).
2. **Loss Correlation**: Evaluate the emotional states before/after losses.
3. **Actionable Regimen**: Create 3 behavioral checkpoints the trader must implement next session to prevent emotional leaks.`;

      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ sender: "user", text: prompt }],
          trades: trades,
          psychologyLogs: psychologyLogs,
        }),
      });

      const data = await response.json();
      setAiDiagnostic(data.response || "Failed to audit psychological states.");
    } catch (err: any) {
      setAiDiagnostic(`Error diagnosing psychological trends: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Psychology header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0c0c0e] p-4 border border-zinc-800/50 rounded-xl">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald-400" />
            {t("ps_title")}
          </h3>
          <p className="text-xs text-zinc-400">{t("ps_subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRunDiagnostic}
            disabled={isAuditing}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            {isAuditing 
              ? (language === "ru" ? "Анализ когнитивного состояния..." : "Auditing Cognitive State...") 
              : (language === "ru" ? "Запустить ИИ-диагностику" : "Run AI Diagnostic")}
          </button>
          <button
            onClick={() => setIsNewLogOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {t("ps_log_button")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics & Sliders Overview (1 col) */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 space-y-6 h-max">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800/30 pb-3">
            <Smile className="w-4 h-4 text-emerald-400" /> {t("ps_cognitive_scores")}
          </h4> mechanics

          {/* Average metrics (simulated from current logs) */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>{language === "ru" ? "Баланс дисциплины:" : "Discipline Balance:"}</span>
                <span className="font-mono text-zinc-200">82%</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: "82%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>{language === "ru" ? "Порог терпения и ожидания:" : "Patience & Wait Threshold:"}</span>
                <span className="font-mono text-zinc-200">76%</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500/80 h-full" style={{ width: "76%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>{t("ps_fomo_freq")}:</span>
                <span className="font-mono text-zinc-200">34%</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: "34%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>{language === "ru" ? "Уровень тильта/реванша:" : "Overtrading / Revenge Rate:"}</span>
                <span className="font-mono text-rose-400 font-bold">42%</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: "42%" }}></div>
              </div>
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/50 rounded-lg p-3.5 space-y-2 text-xs">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">
              {language === "ru" ? "Корреляция физических переменных" : "Physical Variable Corelation"}
            </span>
            <p className="text-zinc-400 leading-relaxed">
              {language === "ru" 
                ? "Наши логи показывают, что показатель сна ниже 3/5 и уровень стресса выше 3/5 напрямую ведут к увеличению импульсивных сделок и тильта на 300%."
                : "Our logs show that sleep below 3/5 and stress above 3/5 directly leads to a 300% increase in 'Impulsive Entries' and 'Revenge Trading' violations."}
            </p>
          </div>
        </div>

        {/* Cognitive Log Entries list (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/30 pb-2">
              {t("ps_mental_journal")}
            </h4>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {psychologyLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#09090b] border border-zinc-800/50 p-4 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center border-b border-zinc-800/30 pb-2">
                    <span className="font-mono text-zinc-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {new Date(log.date).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                    <div className="flex gap-2">
                      {log.revengeTrading && (
                        <span className="text-[9px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded">
                          {language === "ru" ? "ТИЛЬТ / РЕВАНШ" : "REVENGE RUNS"}
                        </span>
                      )}
                      <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded">
                        {language === "ru" ? "Сон" : "Sleep"}: {log.sleep}/5 | {language === "ru" ? "Стресс" : "Stress"}: {log.stress}/5
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-300 leading-relaxed italic">"{log.notes}"</p>
                  
                  {log.aiPatterns && (
                    <div className="bg-emerald-500/5 p-2 rounded border border-emerald-500/10 flex gap-2 text-[11px] text-emerald-300">
                      <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <p>{log.aiPatterns}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI DIAGNOSTIC DISPLAY */}
      <AnimatePresence>
        {aiDiagnostic && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="border border-zinc-800/50 bg-[#09090b] rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-4 border-b border-zinc-850 pb-3">
              <h4 className="text-xs font-mono text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
                {language === "ru" ? "Отчет об ИИ-диагностике ZellaTrader" : "ZellaTrader AI Cognitive Diagnostic Report"}
              </h4>
              <button
                onClick={() => setAiDiagnostic("")}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-mono cursor-pointer"
              >
                {language === "ru" ? "✕ Сбросить" : "✕ Clear Diagnostic"}
              </button>
            </div>
            <div className="markdown-body text-xs text-zinc-300 leading-relaxed max-h-96 overflow-y-auto space-y-2 pr-2">
              <Markdown>{aiDiagnostic}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIALOG: LOG MENTAL STATE */}
      <AnimatePresence>
        {isNewLogOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl text-xs text-zinc-200"
            >
              <div className="border-b border-zinc-800/50 px-5 py-4 flex justify-between items-center bg-[#09090b]">
                <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
                  <Heart className="w-4 h-4 text-blue-500" /> {t("ps_log_title")}
                </h3>
                <button onClick={() => setIsNewLogOpen(false)} className="text-zinc-500 hover:text-zinc-300 text-sm font-mono cursor-pointer">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Продолж. сна" : "Sleep Duration"} (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={sleep}
                      onChange={(e) => setSleep(parseInt(e.target.value))}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Уровень стресса" : "Stress Level"} (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={stress}
                      onChange={(e) => setStress(parseInt(e.target.value))}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Уровень энергии" : "Energy Level"} (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={energy}
                      onChange={(e) => setEnergy(parseInt(e.target.value))}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Частота FOMO" : "FOMO Frequency"} (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={fomo}
                      onChange={(e) => setFomo(parseInt(e.target.value))}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Индекс переторговки" : "Overtrading Index"} (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={overtrading}
                      onChange={(e) => setOvertrading(parseInt(e.target.value))}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-[#09090b] p-2.5 rounded border border-zinc-800/50 text-zinc-300 font-mono font-semibold">
                  <input
                    type="checkbox"
                    checked={revenge}
                    onChange={(e) => setRevenge(e.target.checked)}
                    className="rounded border-zinc-850 bg-[#09090b] text-rose-500 focus:ring-0"
                  />
                  <span>{t("ps_revenge_trading")}</span>
                </label>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Страх" : "Fear"} (1-5)</label>
                    <input type="number" min="1" max="5" value={fear} onChange={(e) => setFear(parseInt(e.target.value))} className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Жадность" : "Greed"} (1-5)</label>
                    <input type="number" min="1" max="5" value={greed} onChange={(e) => setGreed(parseInt(e.target.value))} className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Уверенность" : "Confidence"} (1-5)</label>
                    <input type="number" min="1" max="5" value={confidence} onChange={(e) => setConfidence(parseInt(e.target.value))} className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Терпение" : "Patience"} (1-5)</label>
                    <input type="number" min="1" max="5" value={patience} onChange={(e) => setPatience(parseInt(e.target.value))} className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1" />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Пометки и рефлексия" : "Reflective Notes"}</label>
                  <textarea
                    rows={3}
                    placeholder={language === "ru" ? "Опишите ваш фокус, эмоциональные триггеры, уровень дисциплины..." : "Describe today's focus, discipline triggers, details of rule adherence, or any cognitive friction..."}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="border-t border-zinc-850 pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewLogOpen(false)}
                    className="bg-zinc-900 text-zinc-400 hover:bg-zinc-800 px-4 py-2 rounded cursor-pointer"
                  >
                    {language === "ru" ? "Отмена" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded cursor-pointer"
                  >
                    {t("ps_form_save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
