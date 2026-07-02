import React, { useState } from "react";
import { Trade, Strategy, PsychologyLog, TradingPlan } from "./types";
import {
  SEED_TRADES,
  SEED_STRATEGIES,
  SEED_PSYCHOLOGY_LOGS,
  SEED_TRADING_PLAN,
} from "./utils/tradingUtils";
import {
  getLocalizedTrades,
  getLocalizedStrategies,
  getLocalizedPsychologyLogs,
  getLocalizedTradingPlan,
} from "./utils/localizer";
import { useLanguage } from "./LanguageContext";

// Views
import DashboardView from "./components/DashboardView";
import JournalView from "./components/JournalView";
import TradeReplayView from "./components/TradeReplayView";
import StatisticsView from "./components/StatisticsView";
import PlaybookView from "./components/PlaybookView";
import TradingPlanView from "./components/TradingPlanView";
import PsychologyView from "./components/PsychologyView";
import AICoachView from "./components/AICoachView";
import ReviewsView from "./components/ReviewsView";
import GoalsView from "./components/GoalsView";
import SettingsView from "./components/SettingsView";

// Icons
import {
  LayoutDashboard,
  BookOpen,
  Activity,
  BarChart2,
  Bookmark,
  ClipboardList,
  Brain,
  Bot,
  FileSpreadsheet,
  Award,
  Settings,
  Sparkles,
  User,
  LogOut,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ActiveTabType =
  | "dashboard"
  | "journal"
  | "replay"
  | "statistics"
  | "playbook"
  | "plan"
  | "psychology"
  | "coach"
  | "reviews"
  | "goals"
  | "settings";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>("dashboard");
  const { t, language, setLanguage } = useLanguage();

  // Core Persistent State
  const [trades, setTrades] = useState<Trade[]>(SEED_TRADES);
  const [strategies, setStrategies] = useState<Strategy[]>(SEED_STRATEGIES);
  const [psychologyLogs, setPsychologyLogs] = useState<PsychologyLog[]>(SEED_PSYCHOLOGY_LOGS);
  const [tradingPlan, setTradingPlan] = useState<TradingPlan>(SEED_TRADING_PLAN);

  const localizedTrades = getLocalizedTrades(trades, language);
  const localizedStrategies = getLocalizedStrategies(strategies, language);
  const localizedPsychologyLogs = getLocalizedPsychologyLogs(psychologyLogs, language);
  const localizedTradingPlan = getLocalizedTradingPlan(tradingPlan, language);

  // Shortcuts
  const handleSelectTradeForReplay = (trade: Trade) => {
    // Force set the active trade at top of trades list so it is immediately selected in the Replay View dropdown
    setTrades((prev) => [trade, ...prev.filter((t) => t.id !== trade.id)]);
    setActiveTab("replay");
  };

  const handleAddTrade = (newTrade: Trade) => {
    setTrades((prev) => [newTrade, ...prev]);
  };

  const handleDeleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const handleImportTrades = (imported: Trade[]) => {
    setTrades((prev) => [...imported, ...prev]);
  };

  const handleAddStrategy = (newStrat: Strategy) => {
    setStrategies((prev) => [newStrat, ...prev]);
  };

  const handleUpdatePlan = (updatedPlan: TradingPlan) => {
    setTradingPlan(updatedPlan);
  };

  const handleAddPsychologyLog = (newLog: PsychologyLog) => {
    setPsychologyLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans antialiased selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#0c0c0e] border-r border-zinc-800/50 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex">
        <div className="p-5 flex flex-col space-y-6 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow shadow-blue-500/20">
              Z
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-white block leading-tight">
                ZELLA<span className="text-blue-500 font-bold">.AI</span>
              </span>
              <span className="text-[9px] text-zinc-500 font-mono tracking-wider block">
                COGNITIVE CORE
              </span>
            </div>
          </div>

          {/* Nav Categories */}
          <nav className="space-y-5">
            {/* Category: Execution Workspace */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 px-2 font-bold block">
                {t("nav_execution_workspace")}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "dashboard"
                      ? "bg-zinc-800/50 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                  {t("nav_dashboard")}
                </button>
                <button
                  onClick={() => setActiveTab("journal")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "journal"
                      ? "bg-zinc-800/50 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-zinc-500" />
                  {t("nav_journal")}
                </button>
                <button
                  onClick={() => setActiveTab("replay")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "replay"
                      ? "bg-zinc-800/50 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                  }`}
                >
                  <Activity className="w-4 h-4 text-zinc-500" />
                  {t("nav_replay")}
                </button>
                <button
                  onClick={() => setActiveTab("statistics")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "statistics"
                      ? "bg-zinc-800/50 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                  }`}
                >
                  <BarChart2 className="w-4 h-4 text-zinc-500" />
                  {t("nav_statistics")}
                </button>
              </div>
            </div>

            {/* Category: Playbooks & Discipline */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 mt-4 px-2 font-bold block">
                {t("nav_playbooks")}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("playbook")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "playbook"
                      ? "bg-zinc-800/50 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-zinc-500" />
                  {t("nav_playbooks_creator")}
                </button>
                <button
                  onClick={() => setActiveTab("plan")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "plan"
                      ? "bg-zinc-800/50 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-zinc-500" />
                  {t("nav_trading_plan")}
                </button>
                <button
                  onClick={() => setActiveTab("psychology")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "psychology"
                      ? "bg-zinc-800/50 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                  }`}
                >
                  <Brain className="w-4 h-4 text-zinc-500" />
                  {t("nav_cognitive_tracker")}
                </button>
                <button
                  onClick={() => setActiveTab("goals")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "goals"
                      ? "bg-zinc-800/50 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                  }`}
                >
                  <Award className="w-4 h-4 text-zinc-500" />
                  {t("nav_auditable_goals")}
                </button>
              </div>
            </div>

            {/* Category: Intelligent AI Engine */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 mt-4 px-2 font-bold block">
                {t("nav_ai_engine")}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("coach")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "coach"
                      ? "bg-zinc-800/50 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                  }`}
                >
                  <Bot className="w-4 h-4 text-zinc-500" />
                  {t("nav_ai_coach")}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "reviews"
                      ? "bg-zinc-800/50 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-zinc-500" />
                  {t("nav_ai_reviews")}
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800/50 bg-[#0c0c0e]">
          <div className="flex gap-2 items-center justify-between mb-3">
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-semibold font-mono w-full ${
                activeTab === "settings" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10"
              }`}
            >
              <Settings className="w-4 h-4" /> {t("nav_integrations")}
            </button>
          </div>

          <div className="flex items-center gap-3 border-t border-zinc-800/50 pt-3">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800/50 flex items-center justify-center font-bold text-xs text-zinc-300">
              TR
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200 block">{t("nav_elite_account")}</span>
              <span className="text-[10px] text-zinc-500 font-mono">ID: ZELLA_4021</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden flex flex-col w-full min-h-screen">
        <header className="bg-[#0c0c0e] border-b border-zinc-800/50 px-4 py-3 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              Z
            </div>
            <span className="font-mono font-black text-xs tracking-tight text-white">
              ZELLA.AI
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Mobile */}
            <div className="flex items-center bg-[#09090b] border border-zinc-800/50 p-0.5 rounded-md text-[9px] font-mono">
              <button
                onClick={() => setLanguage("en")}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  language === "en" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("ru")}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  language === "ru" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500"
                }`}
              >
                RU
              </button>
            </div>

            {/* Quick Tab Selector for Mobile */}
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="dashboard">{t("nav_dashboard")}</option>
              <option value="journal">{t("nav_journal")}</option>
              <option value="replay">{t("nav_replay")}</option>
              <option value="statistics">{t("nav_statistics")}</option>
              <option value="playbook">{t("nav_playbooks_creator")}</option>
              <option value="plan">{t("nav_trading_plan")}</option>
              <option value="psychology">{t("nav_cognitive_tracker")}</option>
              <option value="goals">{t("nav_auditable_goals")}</option>
              <option value="coach">{t("nav_ai_coach")}</option>
              <option value="reviews">{t("nav_ai_reviews")}</option>
              <option value="settings">{t("nav_integrations")}</option>
            </select>
          </div>
        </header>

        {/* MOBILE WORKSPACE CONTAINER */}
        <main className="flex-1 p-4 overflow-y-auto">
          <WorkspaceContent
            activeTab={activeTab}
            trades={localizedTrades}
            strategies={localizedStrategies}
            psychologyLogs={localizedPsychologyLogs}
            tradingPlan={localizedTradingPlan}
            onAddTrade={handleAddTrade}
            onDeleteTrade={handleDeleteTrade}
            onSelectTrade={handleSelectTradeForReplay}
            onImportTrades={handleImportTrades}
            onAddStrategy={handleAddStrategy}
            onUpdatePlan={handleUpdatePlan}
            onAddPsychologyLog={handleAddPsychologyLog}
            onNavigateTab={setActiveTab}
          />
        </main>
      </div>

      {/* 2. MAIN DESKTOP WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto min-h-screen hidden md:flex">
        {/* Top bar indicators */}
        <header className="h-16 bg-[#09090b] border-b border-zinc-800/50 px-8 flex justify-between items-center backdrop-blur shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              {t("workspace_path")}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
              {t(`nav_${activeTab}` as any) || activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher Desktop */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-[10px] font-mono shadow-sm">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                  language === "en" ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("ru")}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                  language === "ru" ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                RU
              </button>
            </div>

            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              {t("nav_cognitive_sync")}
            </span>
          </div>
        </header>

        {/* Dynamic workspace wrapper */}
        <main className="flex-1 p-8">
          <WorkspaceContent
            activeTab={activeTab}
            trades={localizedTrades}
            strategies={localizedStrategies}
            psychologyLogs={localizedPsychologyLogs}
            tradingPlan={localizedTradingPlan}
            onAddTrade={handleAddTrade}
            onDeleteTrade={handleDeleteTrade}
            onSelectTrade={handleSelectTradeForReplay}
            onImportTrades={handleImportTrades}
            onAddStrategy={handleAddStrategy}
            onUpdatePlan={handleUpdatePlan}
            onAddPsychologyLog={handleAddPsychologyLog}
            onNavigateTab={setActiveTab}
          />
        </main>
      </div>
    </div>
  );
}

// Sub-component routing
interface WorkspaceContentProps {
  activeTab: ActiveTabType;
  trades: Trade[];
  strategies: Strategy[];
  psychologyLogs: PsychologyLog[];
  tradingPlan: TradingPlan;
  onAddTrade: (t: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onSelectTrade: (t: Trade) => void;
  onImportTrades: (imported: Trade[]) => void;
  onAddStrategy: (s: Strategy) => void;
  onUpdatePlan: (p: TradingPlan) => void;
  onAddPsychologyLog: (l: PsychologyLog) => void;
  onNavigateTab: (tab: ActiveTabType) => void;
}

function WorkspaceContent({
  activeTab,
  trades,
  strategies,
  psychologyLogs,
  tradingPlan,
  onAddTrade,
  onDeleteTrade,
  onSelectTrade,
  onImportTrades,
  onAddStrategy,
  onUpdatePlan,
  onAddPsychologyLog,
  onNavigateTab,
}: WorkspaceContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className="w-full h-full"
      >
        {activeTab === "dashboard" && (
          <DashboardView
            trades={trades}
            psychologyLogs={psychologyLogs}
            onSelectTrade={onSelectTrade}
            onNavigateToTab={onNavigateTab}
          />
        )}
        {activeTab === "journal" && (
          <JournalView
            trades={trades}
            onAddTrade={onAddTrade}
            onDeleteTrade={onDeleteTrade}
            onSelectTrade={onSelectTrade}
            onImportTrades={onImportTrades}
          />
        )}
        {activeTab === "replay" && <TradeReplayView trades={trades} />}
        {activeTab === "statistics" && <StatisticsView trades={trades} />}
        {activeTab === "playbook" && (
          <PlaybookView
            strategies={strategies}
            trades={trades}
            onAddStrategy={onAddStrategy}
          />
        )}
        {activeTab === "plan" && (
          <TradingPlanView tradingPlan={tradingPlan} onUpdatePlan={onUpdatePlan} />
        )}
        {activeTab === "psychology" && (
          <PsychologyView
            psychologyLogs={psychologyLogs}
            trades={trades}
            onAddPsychologyLog={onAddPsychologyLog}
          />
        )}
        {activeTab === "coach" && (
          <AICoachView
            trades={trades}
            strategies={strategies}
            psychologyLogs={psychologyLogs}
          />
        )}
        {activeTab === "reviews" && (
          <ReviewsView trades={trades} psychologyLogs={psychologyLogs} />
        )}
        {activeTab === "goals" && <GoalsView />}
        {activeTab === "settings" && <SettingsView onImportTrades={onImportTrades} />}
      </motion.div>
    </AnimatePresence>
  );
}
