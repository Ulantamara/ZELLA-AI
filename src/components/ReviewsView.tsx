import React, { useState } from "react";
import { Trade, PsychologyLog } from "../types";
import { Sparkles, Calendar, BookOpen, Clock, AlertCircle, FileText, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { useLanguage } from "../LanguageContext";

interface ReviewsViewProps {
  trades: Trade[];
  psychologyLogs: PsychologyLog[];
}

export default function ReviewsView({ trades, psychologyLogs }: ReviewsViewProps) {
  const { t, language } = useLanguage();
  const [reportText, setReportText] = useState<string>("");
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateReport = async (type: "daily" | "weekly" | "monthly") => {
    setIsGenerating(true);
    setReportType(type);
    setReportText("");

    try {
      const prompt = language === "ru"
        ? `Сгенерируйте точный количественный и качественный ИИ-отчет об эффективности торговли за следующий период: ${type.toUpperCase()}.
Проанализируйте показатели сессии, соблюдение торговых правил, индикаторы эмоциональной стабильности и исполнение шаблонов ниже:

--- СОВЕРШЕННЫЕ СДЕЛКИ ---
${JSON.stringify(
  trades.slice(0, 15).map((t) => ({
    ticker: t.ticker,
    pnl: t.pnl,
    direction: t.direction,
    strategy: t.strategy,
    mistakes: t.mistakes,
    rating: t.rating,
  })),
  null,
  2
)}

--- ЭМОЦИОНАЛЬНЫЕ ОТЧЕТЫ ЗА ПЕРИОД ---
${JSON.stringify(psychologyLogs.slice(0, 6), null, 2)}

Оформите отчет в виде красивой разметки Markdown на РУССКОМ языке:
- **Краткое резюме периода**: Оценка дисциплины трейдера (A-F), общая чистая прибыль, винрейт и преобладающая стратегия.
- **Аудит соблюдения правил и исполнения**: Обратите особое внимание на допущенные ошибки (напр. импульсивные сделки FOMO, переторговка, реванш-трейдинг) и эмоциональное состояние до/после сделок.
- **Инструкции на следующий цикл**: Сформулируйте 2 четких практических совета (математических или психологических) для немедленного внедрения.`
        : `Generate a rigorous quantitative and qualitative AI Performance Report for the following timeframe: ${type.toUpperCase()}.
Analyze all session metrics, trade rules compliance, emotional stability indicators, and playbook execution below:

--- TRADES COMPLETED ---
${JSON.stringify(
  trades.slice(0, 15).map((t) => ({
    ticker: t.ticker,
    pnl: t.pnl,
    direction: t.direction,
    strategy: t.strategy,
    mistakes: t.mistakes,
    rating: t.rating,
  })),
  null,
  2
)}

--- EMOTIONAL LOGS DURING TIMEFRAME ---
${JSON.stringify(psychologyLogs.slice(0, 6), null, 2)}

Structure your report using beautiful Markdown:
- **Timeframe Executive Summary**: High-level trading grade (A-F), total net returns, win rate, and dominant strategy playbook.
- **Compliance & Execution Audit**: Focus heavily on listed mistakes (e.g., Impulsive Entries, Overtrading, Revenge trading) and emotion ratings before/after.
- **Directives for the Next Cycle**: State 2 clear, concrete mathematical or psychological directives the trader must adopt immediately.`;

      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ sender: "user", text: prompt }],
          trades,
          psychologyLogs,
        }),
      });

      const data = await response.json();
      setReportText(data.response || "No report returned. Please configure GEMINI_API_KEY.");
    } catch (err: any) {
      setReportText(`Error compiling performance audit report: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0c0c0e] p-4 border border-zinc-800/50 rounded-xl">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            {t("rv_title")}
          </h3>
          <p className="text-xs text-zinc-400">{t("rv_subtitle")}</p>
        </div>
      </div>

      {/* Grid of Report generators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily card */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 p-5 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg w-max">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-zinc-100 font-mono uppercase tracking-wider">{t("rv_card_daily")}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("rv_card_daily_desc")}
            </p>
          </div>
          <button
            onClick={() => handleGenerateReport("daily")}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-1.5 bg-[#09090b] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 py-1.5 rounded-lg text-xs font-semibold shadow transition-colors disabled:opacity-55 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {t("rv_generate_btn")}
          </button>
        </div>

        {/* Weekly card */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 p-5 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-max">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-zinc-100 font-mono uppercase tracking-wider">{t("rv_card_weekly")}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("rv_card_weekly_desc")}
            </p>
          </div>
          <button
            onClick={() => handleGenerateReport("weekly")}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-1.5 bg-[#09090b] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 py-1.5 rounded-lg text-xs font-semibold shadow transition-colors disabled:opacity-55 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {t("rv_generate_btn")}
          </button>
        </div>

        {/* Monthly card */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 p-5 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg w-max">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-zinc-100 font-mono uppercase tracking-wider">{t("rv_card_monthly")}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("rv_card_monthly_desc")}
            </p>
          </div>
          <button
            onClick={() => handleGenerateReport("monthly")}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-1.5 bg-[#09090b] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 py-1.5 rounded-lg text-xs font-semibold shadow transition-colors disabled:opacity-55 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {t("rv_generate_btn")}
          </button>
        </div>
      </div>

      {/* REPORT DISPLAY AREA */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#0c0c0e] border border-zinc-800/50 p-8 rounded-xl text-center space-y-3"
          >
            <div className="w-8 h-8 border-4 border-t-emerald-500 border-zinc-800 rounded-full animate-spin mx-auto"></div>
            <span className="text-xs font-mono text-zinc-400 animate-pulse block">
              {language === "ru" 
                ? "ИИ ZellaTrader анализирует сделки, отслеживает соблюдение торгового плана и составляет отчет..."
                : "ZellaTrader AI is analyzing transactions, tracking playbook compliance, and writing performance summaries..."}
            </span>
          </motion.div>
        )}

        {reportText && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-zinc-800/50 bg-[#09090b] rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800/30 pb-3">
              <h4 className="text-xs font-mono text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {language === "ru" ? "ИИ-Отчет сессии: " : "AI Generated Review: "} {reportType === "daily" ? (language === "ru" ? "Дневной" : "Daily") : reportType === "weekly" ? (language === "ru" ? "Недельный" : "Weekly") : (language === "ru" ? "Месячный" : "Monthly")}
              </h4>
              <button
                onClick={() => setReportText("")}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-mono cursor-pointer"
              >
                {language === "ru" ? "✕ Очистить" : "✕ Clear Report"}
              </button>
            </div>
            <div className="markdown-body text-xs text-zinc-300 leading-relaxed max-h-[500px] overflow-y-auto space-y-2 pr-2">
              <Markdown>{reportText}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
