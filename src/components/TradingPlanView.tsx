import React, { useState, useEffect } from "react";
import { TradingPlan } from "../types";
import { ClipboardList, ShieldAlert, CheckCircle, Sliders, Play, Plus, Trash2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../LanguageContext";

interface TradingPlanViewProps {
  tradingPlan: TradingPlan;
  onUpdatePlan: (plan: TradingPlan) => void;
}

export default function TradingPlanView({ tradingPlan, onUpdatePlan }: TradingPlanViewProps) {
  const { t, language } = useLanguage();
  const [dailyLossLimit, setDailyLossLimit] = useState(tradingPlan.dailyLossLimit);
  const [maxDailyTrades, setMaxDailyTrades] = useState(tradingPlan.maxDailyTrades);

  // Lists edit state
  const [newBannedType, setNewBannedType] = useState("");
  const [newEntryRule, setNewEntryRule] = useState("");
  const [newExitRule, setNewExitRule] = useState("");

  const handleUpdateLimit = () => {
    onUpdatePlan({
      ...tradingPlan,
      dailyLossLimit,
      maxDailyTrades,
    });
  };

  const handleToggleMorning = (idx: number) => {
    const updatedMorning = [...tradingPlan.morningPrep];
    updatedMorning[idx].checked = !updatedMorning[idx].checked;
    onUpdatePlan({
      ...tradingPlan,
      morningPrep: updatedMorning,
    });
  };

  const handleToggleEvening = (idx: number) => {
    const updatedEvening = [...tradingPlan.eveningReview];
    updatedEvening[idx].checked = !updatedEvening[idx].checked;
    onUpdatePlan({
      ...tradingPlan,
      eveningReview: updatedEvening,
    });
  };

  const handleAddBanned = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannedType) return;
    onUpdatePlan({
      ...tradingPlan,
      bannedTradeTypes: [...tradingPlan.bannedTradeTypes, newBannedType],
    });
    setNewBannedType("");
  };

  const handleAddEntryRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryRule) return;
    onUpdatePlan({
      ...tradingPlan,
      entryRules: [...tradingPlan.entryRules, newEntryRule],
    });
    setNewEntryRule("");
  };

  const handleAddExitRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExitRule) return;
    onUpdatePlan({
      ...tradingPlan,
      exitRules: [...tradingPlan.exitRules, newExitRule],
    });
    setNewExitRule("");
  };

  const handleRemoveBanned = (idx: number) => {
    onUpdatePlan({
      ...tradingPlan,
      bannedTradeTypes: tradingPlan.bannedTradeTypes.filter((_, i) => i !== idx),
    });
  };

  const handleRemoveEntry = (idx: number) => {
    onUpdatePlan({
      ...tradingPlan,
      entryRules: tradingPlan.entryRules.filter((_, i) => i !== idx),
    });
  };

  const handleRemoveExit = (idx: number) => {
    onUpdatePlan({
      ...tradingPlan,
      exitRules: tradingPlan.exitRules.filter((_, i) => i !== idx),
    });
  };

  // Compliance calculations
  const morningCompleted = tradingPlan.morningPrep.filter(i => i.checked).length;
  const morningTotal = tradingPlan.morningPrep.length;
  const eveningCompleted = tradingPlan.eveningReview.filter(i => i.checked).length;
  const eveningTotal = tradingPlan.eveningReview.length;

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0c0c0e] p-4 border border-zinc-800/50 rounded-xl">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            {t("tp_title")}
          </h3>
          <p className="text-xs text-zinc-400">{t("tp_subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Risk Parameters Panel (1 Col) */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 space-y-6 h-max">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800/30 pb-3">
            <Sliders className="w-4 h-4 text-blue-500" />
            {language === "ru" ? "Параметры Управления Риском" : "Risk Management Parameters"}
          </h4>

          {/* Daily loss limit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400">{t("tp_daily_loss")}:</span>
              <span className="text-sm font-bold text-rose-400 font-mono">${dailyLossLimit.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={dailyLossLimit}
              onChange={(e) => setDailyLossLimit(parseInt(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>

          {/* Max daily trades */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400">{t("tp_max_trades")}:</span>
              <span className="text-sm font-bold text-zinc-100 font-mono">{maxDailyTrades} {language === "ru" ? "сделок" : "positions"}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={maxDailyTrades}
              onChange={(e) => setMaxDailyTrades(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <button
            onClick={handleUpdateLimit}
            className="w-full bg-[#09090b] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold py-2 rounded text-xs transition-colors cursor-pointer"
          >
            {language === "ru" ? "Применить параметры" : "Apply Parameters"}
          </button>

          <div className="bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> {language === "ru" ? "Протокол Лимита Потерь" : "Max Loss Protocol"}
            </span>
            <p className="text-[11px] text-rose-300/80 leading-relaxed">
              {language === "ru" 
                ? `Если плавающий убыток превысит $${dailyLossLimit}, немедленно закройте все активные контракты и закройте терминалы. Без исключений.`
                : `If paper loss exceeds $${dailyLossLimit}, immediately close all active contracts and close the execution platforms. No exceptions.`
              }
            </p>
          </div>
        </div>

        {/* Entries & Exits Builder (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 space-y-5">
            <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/30 pb-2">
              {language === "ru" ? "Основные Рекомендации Входа и Выхода" : "Core Entry & Exit Guidelines"}
            </h4>

            {/* Entry Rules list */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">{t("tp_entry_rules")}</span>
              <div className="space-y-1.5">
                {tradingPlan.entryRules.map((rule, idx) => (
                  <div key={idx} className="bg-[#09090b] p-2.5 rounded-lg border border-zinc-800/50 flex justify-between items-center text-xs text-zinc-300">
                    <p className="leading-relaxed pr-2">{rule}</p>
                    <button onClick={() => handleRemoveEntry(idx)} className="text-zinc-600 hover:text-rose-400 cursor-pointer">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddEntryRule} className="flex gap-2">
                <input
                  type="text"
                  placeholder={language === "ru" ? "Создать новое правило..." : "Create entry rule..."}
                  value={newEntryRule}
                  onChange={(e) => setNewEntryRule(e.target.value)}
                  className="bg-[#09090b] border border-zinc-800/50 text-xs rounded p-1 px-2.5 flex-1 text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
                <button type="submit" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1 rounded text-xs cursor-pointer">
                  {language === "ru" ? "Добавить" : "Add"}
                </button>
              </form>
            </div>

            {/* Exit Rules list */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">{t("tp_exit_rules")}</span>
              <div className="space-y-1.5">
                {tradingPlan.exitRules.map((rule, idx) => (
                  <div key={idx} className="bg-[#09090b] p-2.5 rounded-lg border border-zinc-800/50 flex justify-between items-center text-xs text-zinc-300">
                    <p className="leading-relaxed pr-2">{rule}</p>
                    <button onClick={() => handleRemoveExit(idx)} className="text-zinc-600 hover:text-rose-400 cursor-pointer">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddExitRule} className="flex gap-2">
                <input
                  type="text"
                  placeholder={language === "ru" ? "Создать новое правило..." : "Create exit rule..."}
                  value={newExitRule}
                  onChange={(e) => setNewExitRule(e.target.value)}
                  className="bg-[#09090b] border border-zinc-800/50 text-xs rounded p-1 px-2.5 flex-1 text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
                <button type="submit" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1 rounded text-xs cursor-pointer">
                  {language === "ru" ? "Добавить" : "Add"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Checklist */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5">
          <div className="flex justify-between items-center mb-3 border-b border-zinc-800/30 pb-2">
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> {t("tp_morning_prep")}
            </h4>
            <span className="text-[10px] font-mono text-zinc-500">
              {language === "ru" ? "Выполнено" : "Completed"}: {morningCompleted} / {morningTotal}
            </span>
          </div>

          <div className="space-y-2">
            {tradingPlan.morningPrep.map((item, idx) => (
              <label
                key={idx}
                className="flex items-start gap-3 p-2.5 rounded-lg border border-zinc-800/50 bg-zinc-950/40 hover:bg-zinc-900/30 cursor-pointer transition-colors text-xs text-zinc-300"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggleMorning(idx)}
                  className="rounded border-zinc-800 bg-[#09090b] text-emerald-500 focus:ring-0 shrink-0 mt-0.5"
                />
                <span className={item.checked ? "line-through text-zinc-500" : ""}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Evening Checklist */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5">
          <div className="flex justify-between items-center mb-3 border-b border-zinc-800/30 pb-2">
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-indigo-400" /> {t("tp_evening_review")}
            </h4>
            <span className="text-[10px] font-mono text-zinc-500">
              {language === "ru" ? "Выполнено" : "Completed"}: {eveningCompleted} / {eveningTotal}
            </span>
          </div>

          <div className="space-y-2">
            {tradingPlan.eveningReview.map((item, idx) => (
              <label
                key={idx}
                className="flex items-start gap-3 p-2.5 rounded-lg border border-zinc-800/50 bg-zinc-950/40 hover:bg-zinc-900/30 cursor-pointer transition-colors text-xs text-zinc-300"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggleEvening(idx)}
                  className="rounded border-zinc-800 bg-[#09090b] text-indigo-500 focus:ring-0 shrink-0 mt-0.5"
                />
                <span className={item.checked ? "line-through text-zinc-500" : ""}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Banned trade types section */}
      <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5">
        <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-3 border-b border-zinc-800/30 pb-2">
          <ShieldAlert className="w-4 h-4" /> {t("tp_banned_triggers")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {tradingPlan.bannedTradeTypes.map((banned, idx) => (
            <div key={idx} className="bg-rose-500/5 p-3 rounded-lg border border-rose-500/10 flex justify-between items-start text-xs text-rose-300">
              <p className="leading-relaxed flex gap-2">
                <span className="text-rose-500 font-bold">⛔</span>
                {banned}
              </p>
              <button onClick={() => handleRemoveBanned(idx)} className="text-rose-700 hover:text-rose-400 shrink-0 ml-2 cursor-pointer">
                ✕
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddBanned} className="flex gap-2">
          <input
            type="text"
            placeholder={language === "ru" ? "Запретить стиль торговли или сетап..." : "Add restricted trade type or setup..."}
            value={newBannedType}
            onChange={(e) => setNewBannedType(e.target.value)}
            className="bg-[#09090b] border border-zinc-800/50 text-xs rounded p-1.5 px-3 flex-1 text-zinc-200 focus:outline-none focus:border-zinc-700"
          />
          <button type="submit" className="bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/40 text-rose-400 px-4 rounded text-xs font-semibold cursor-pointer">
            {language === "ru" ? "Добавить ограничения" : "Add Restricted Guidelines"}
          </button>
        </form>
      </div>
    </div>
  );
}
