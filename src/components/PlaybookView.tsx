import React, { useState } from "react";
import { Strategy, Trade } from "../types";
import { Plus, BookOpen, CheckSquare, Sparkles, AlertTriangle, Play, HelpCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { useLanguage } from "../LanguageContext";

interface PlaybookViewProps {
  strategies: Strategy[];
  trades: Trade[];
  onAddStrategy: (strat: Strategy) => void;
}

export default function PlaybookView({ strategies, trades, onAddStrategy }: PlaybookViewProps) {
  const { t, language } = useLanguage();
  const [isNewStratOpen, setIsNewStratOpen] = useState(false);
  const [activeStrategyId, setActiveStrategyId] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Form states for new strategy
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newWhenToUse, setNewWhenToUse] = useState("");
  const [newWhenNotToUse, setNewWhenNotToUse] = useState("");
  const [newTargetRR, setNewTargetRR] = useState("2.0");
  const [newChecklist, setNewChecklist] = useState("");

  const currentStrategy = strategies.find(s => s.id === activeStrategyId) || strategies[0];

  React.useEffect(() => {
    if (strategies.length > 0 && !activeStrategyId) {
      setActiveStrategyId(strategies[0].id);
    }
  }, [strategies, activeStrategyId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newStrat: Strategy = {
      id: "strat_" + Date.now(),
      name: newName,
      description: newDesc,
      whenToUse: newWhenToUse,
      whenNotToUse: newWhenNotToUse,
      targetRR: parseFloat(newTargetRR) || 2.0,
      checklist: newChecklist ? newChecklist.split("\n").map(l => l.trim()).filter(Boolean) : [],
      examples: [],
    };

    onAddStrategy(newStrat);
    setIsNewStratOpen(false);
    setActiveStrategyId(newStrat.id);

    // reset fields
    setNewName("");
    setNewDesc("");
    setNewWhenToUse("");
    setNewWhenNotToUse("");
    setNewTargetRR("2.0");
    setNewChecklist("");
  };

  // Calculate Specific Strategy Performance from Journal
  const getStrategyStats = (stratName: string) => {
    const stratTrades = trades.filter(t => t.strategy === stratName);
    const count = stratTrades.length;
    if (count === 0) {
      return { count: 0, winRate: 0, profitFactor: 0, avgRR: 0, netPnL: 0 };
    }

    const wins = stratTrades.filter(t => (t.pnl || 0) > 0);
    const losses = stratTrades.filter(t => (t.pnl || 0) < 0);
    const winPnL = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const lossPnL = losses.reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    const winRate = (wins.length / count) * 100;
    const profitFactor = Math.abs(lossPnL) > 0 ? winPnL / Math.abs(lossPnL) : winPnL > 0 ? 99.9 : 0;
    const rrs = stratTrades.map(t => t.rr || 0).filter(v => v > 0);
    const avgRR = rrs.length > 0 ? rrs.reduce((a, b) => a + b, 0) / rrs.length : 0;
    const netPnL = stratTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    return {
      count,
      winRate: parseFloat(winRate.toFixed(1)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      avgRR: parseFloat(avgRR.toFixed(2)),
      netPnL: parseFloat(netPnL.toFixed(2)),
    };
  };

  const currentStats = currentStrategy ? getStrategyStats(currentStrategy.name) : null;

  // Ask Gemini Coach to audit this strategy based on trading history
  const handleAuditStrategy = async () => {
    if (!currentStrategy) return;
    setIsAnalyzing(true);
    setAiAnalysis("");

    try {
      const prompt = language === "ru" 
        ? `Проведите комплексный аудит торговой стратегии на основе истории:
- Название стратегии: ${currentStrategy.name}
- Описание концепции: ${currentStrategy.description}
- Использование: ${currentStrategy.whenToUse}
- Избегать: ${currentStrategy.whenNotToUse}
- Чек-лист правил: ${currentStrategy.checklist.join(" | ")}

Моя история торгов содержит ${trades.filter(t => t.strategy === currentStrategy.name).length} сделок по этой стратегии.
Показатели эффективности:
- Процент побед: ${currentStats?.winRate}%
- Профит-фактор: ${currentStats?.profitFactor}
- Ср. риск-награда: ${currentStats?.avgRR}R
- Общий чистый доход: $${currentStats?.netPnL}

Предоставьте структурированный аудит в формате Markdown из 3 абзацев на РУССКОМ языке, анализируя:
1. **Соответствие торгового шаблона (Playbook Alignment)**: Обеспечивает ли чек-лист стратегии реальное преимущество на рынке?
2. **Эффективность исполнения (Execution Efficiency)**: Соответствуют ли друг другу достигнутый R:R и процент побед?
3. **Рекомендации по оптимизации (Optimized Directives)**: Дайте 2 конкретные рекомендации для улучшения результатов в текущих условиях.`
        : `Perform a comprehensive Strategy Playbook Audit on my trading strategy:
- Strategy Name: ${currentStrategy.name}
- Concept Description: ${currentStrategy.description}
- Use cases: ${currentStrategy.whenToUse}
- Avoid cases: ${currentStrategy.whenNotToUse}
- Rules checklists: ${currentStrategy.checklist.join(" | ")}

My trade history contains ${trades.filter(t => t.strategy === currentStrategy.name).length} logs using this playbook strategy.
Calculated performance metrics:
- Win Rate: ${currentStats?.winRate}%
- Profit Factor: ${currentStats?.profitFactor}
- Avg Risk Reward: ${currentStats?.avgRR}R
- Cumulative Net return: $${currentStats?.netPnL}

Provide a 3-paragraph structural critique in Markdown analyzing:
1. **Playbook Alignment**: Does the strategy checklist successfully target clean structural edges?
2. **Execution Efficiency**: Is the achieved R:R and Win Rate aligned, or is the trader cutting profits short or under-holding?
3. **Optimized Directives**: Give 2 specific adjustments to improve efficiency under the current market context.`;

      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ sender: "user", text: prompt }],
          trades: trades,
          strategies: [currentStrategy],
        }),
      });

      const data = await response.json();
      setAiAnalysis(data.response || "No response received.");
    } catch (err: any) {
      setAiAnalysis(`Error performing playbook analysis: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Playbook header and action */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0c0c0e] p-4 border border-zinc-800/50 rounded-xl">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            {t("pl_title")}
          </h3>
          <p className="text-xs text-zinc-400">{t("pl_subtitle")}</p>
        </div>
        <button
          onClick={() => setIsNewStratOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow shadow-blue-500/10 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t("pl_add_strategy")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side Sidebar - Playbook List (1 Col) */}
        <div className="space-y-2 lg:col-span-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            {language === "ru" ? "Мои Стратегии" : "My Playbooks"}
          </span>
          <div className="space-y-1.5">
            {strategies.map((strat) => {
              const active = strat.id === activeStrategyId;
              const stats = getStrategyStats(strat.name);
              return (
                <button
                  key={strat.id}
                  onClick={() => {
                    setActiveStrategyId(strat.id);
                    setAiAnalysis("");
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    active
                      ? "bg-blue-950/20 border-blue-500/40 shadow-lg text-zinc-100"
                      : "bg-[#0c0c0e] border-zinc-800/50 hover:bg-zinc-900/60 text-zinc-400"
                  }`}
                >
                  <span className="font-bold text-xs block truncate mb-1">{strat.name}</span>
                  <div className="flex justify-between items-center w-full mt-2 border-t border-zinc-850 pt-1.5 text-[10px] font-mono">
                    <span className="text-zinc-500">{stats.count} {language === "ru" ? "Сделок" : "Trades"}</span>
                    <span className={stats.netPnL >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {stats.netPnL >= 0 ? "+" : ""}${stats.netPnL}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side - Strategy Details and AI audit (3 Cols) */}
        {currentStrategy ? (
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 space-y-6">
              {/* Header details */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-zinc-850 pb-4 gap-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">{currentStrategy.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xl">{currentStrategy.description}</p>
                </div>
                {/* Stats quick overview */}
                {currentStats && (
                  <div className="bg-[#09090b] border border-zinc-800/50 rounded-lg p-3 grid grid-cols-3 gap-4 text-center text-xs min-w-[240px]">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase">{language === "ru" ? "Винрейт" : "Win Rate"}</span>
                      <span className="text-sm font-bold text-zinc-200 mt-1 block">{currentStats.winRate}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase">{language === "ru" ? "Профит фактор" : "Profit Factor"}</span>
                      <span className="text-sm font-bold text-zinc-200 mt-1 block">{currentStats.profitFactor}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase">{language === "ru" ? "Ср. R:R" : "Avg R:R"}</span>
                      <span className="text-sm font-bold text-zinc-200 mt-1 block">{currentStats.avgRR}R</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Guidelines / Criteria checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-emerald-400" /> {t("pl_when_to_use")}
                    </h4>
                    <p className="text-xs text-zinc-300 bg-[#09090b] p-3 rounded-lg border border-zinc-800/50 leading-relaxed mt-2">
                      {currentStrategy.whenToUse}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {t("pl_when_not_to_use")}
                    </h4>
                    <p className="text-xs text-zinc-300 bg-[#09090b] p-3 rounded-lg border border-zinc-800/50 leading-relaxed mt-2">
                      {currentStrategy.whenNotToUse}
                    </p>
                  </div>
                </div>

                {/* Checklist Rules */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-400" /> {t("pl_strict_checklist")}
                  </h4>
                  <div className="bg-[#09090b] border border-zinc-800/50 rounded-lg p-3 space-y-2">
                    {currentStrategy.checklist.length > 0 ? (
                      currentStrategy.checklist.map((item, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start text-xs text-zinc-300">
                          <span className="w-4 h-4 rounded-full bg-[#09090b] border border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-500 text-xs py-4 text-center font-mono">
                        {language === "ru" ? "Правила входа не заданы." : "No specific entry checklist items defined."}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Strategy Audit Section */}
              <div className="border-t border-zinc-850 pt-5 flex justify-between items-center">
                <div className="text-xs text-zinc-400 font-mono">
                  {t("pl_target_rr")}: <strong className="text-zinc-200">{currentStrategy.targetRR}R</strong>
                </div>
                <button
                  onClick={handleAuditStrategy}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  {isAnalyzing 
                    ? (language === "ru" ? "ИИ Анализирует..." : "AI Auditing Performance...") 
                    : (language === "ru" ? "Запросить ИИ-аудит" : "Request AI Playbook Audit")}
                </button>
              </div>
            </div>

            {/* AI analysis result drawer */}
            <AnimatePresence>
              {aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="border border-zinc-800/50 bg-[#09090b] rounded-xl p-5"
                >
                  <div className="flex justify-between items-center mb-3 border-b border-zinc-850 pb-2">
                    <h4 className="text-xs font-mono text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      {language === "ru" ? "ZellaTrader Аудит шаблона: " : "ZellaTrader Playbook Audit: "} {currentStrategy.name}
                    </h4>
                    <button
                      onClick={() => setAiAnalysis("")}
                      className="text-zinc-500 hover:text-zinc-300 text-xs font-mono cursor-pointer"
                    >
                      {language === "ru" ? "✕ Очистить" : "✕ Clear Audit"}
                    </button>
                  </div>
                  <div className="markdown-body text-xs text-zinc-300 leading-relaxed max-h-96 overflow-y-auto space-y-2 pr-2">
                    <Markdown>{aiAnalysis}</Markdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="lg:col-span-3 text-center py-20 text-zinc-500 font-mono text-xs bg-[#0c0c0e] border border-zinc-800/50 rounded-xl">
            {language === "ru" ? "Выберите или создайте стратегию в шаблоне для просмотра параметров." : "Select or create a playbook strategy to view parameters."}
          </div>
        )}
      </div>

      {/* CREATE NEW PLAYBOOK DIALOG MODAL */}
      <AnimatePresence>
        {isNewStratOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl text-xs text-zinc-200"
            >
              <div className="border-b border-zinc-800/50 px-5 py-4 flex justify-between items-center bg-[#09090b]">
                <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" /> {t("pl_form_title")}
                </h3>
                <button onClick={() => setIsNewStratOpen(false)} className="text-zinc-500 hover:text-zinc-300 text-sm font-mono cursor-pointer">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-zinc-400 font-mono mb-1">{t("pl_form_name")} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VWAP Trend Pullback, 0DTE Iron Condor"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono mb-1">{t("pl_form_desc")}</label>
                  <textarea
                    rows={2}
                    placeholder={language === "ru" ? "Опишите математическую или техническую теорию..." : "Describe the mathematical or price-action theory behind the playbook..."}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Условия применения" : "When to Deploy"}</label>
                    <input
                      type="text"
                      placeholder="e.g. Low volume consolidation retests, etc."
                      value={newWhenToUse}
                      onChange={(e) => setNewWhenToUse(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Условия исключения" : "When NOT to Deploy"}</label>
                    <input
                      type="text"
                      placeholder="e.g. macro releases, extreme trends, etc."
                      value={newWhenNotToUse}
                      onChange={(e) => setNewWhenNotToUse(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Целевое соотношение Риск/Награда (напр. 2.5)" : "Target Risk-Reward Ratio (e.g. 2.5)"}</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 2.5"
                    value={newTargetRR}
                    onChange={(e) => setNewTargetRR(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono mb-1">{t("pl_form_checklist")}</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Rule 1: Multi-frame divergence confirmed&#10;Rule 2: Volatility profile shrinkage completed"
                    value={newChecklist}
                    onChange={(e) => setNewChecklist(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="border-t border-zinc-850 pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewStratOpen(false)}
                    className="bg-zinc-900 text-zinc-400 px-4 py-2 rounded cursor-pointer"
                  >
                    {language === "ru" ? "Отмена" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded shadow transition-colors cursor-pointer"
                  >
                    {t("pl_form_create")}
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
