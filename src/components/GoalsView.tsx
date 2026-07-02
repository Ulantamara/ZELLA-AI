import React, { useState } from "react";
import { Award, Plus, Trash2, CheckCircle, Flame, Percent } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../LanguageContext";

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  type: "profit" | "discipline" | "trades" | "custom";
}

export default function GoalsView() {
  const { t, language } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([
    { id: "g1", title: language === "ru" ? "Еженедельная цель по прибыли" : "Weekly Profit Target", target: 2000, current: 1548, unit: "$", type: "profit" },
    { id: "g2", title: language === "ru" ? "Соответствие рейтингу дисциплины" : "Discipline Rating Compliance", target: 5, current: 4.2, unit: language === "ru" ? " Звезд" : " Stars", type: "discipline" },
    { id: "g3", title: language === "ru" ? "Объем сделок по шаблону" : "Playbook Execution Volume", target: 10, current: 7, unit: language === "ru" ? " Сделок" : " Trades", type: "trades" },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newCurrent, setNewCurrent] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newType, setNewType] = useState<"profit" | "discipline" | "trades" | "custom">("custom");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;

    const g: Goal = {
      id: "goal_" + Date.now(),
      title: newTitle,
      target: parseFloat(newTarget),
      current: parseFloat(newCurrent) || 0,
      unit: newUnit,
      type: newType,
    };

    setGoals([...goals, g]);
    setIsAddOpen(false);

    // reset
    setNewTitle("");
    setNewTarget("");
    setNewCurrent("");
    setNewUnit("");
    setNewType("custom");
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Goals header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0c0c0e] p-4 border border-zinc-800/50 rounded-xl">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            {t("gl_title")}
          </h3>
          <p className="text-xs text-zinc-400">{t("gl_subtitle")}</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow shadow-blue-500/10 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {language === "ru" ? "Создать цель" : "Create Goal Target"}
        </button>
      </div>

      {/* Goals cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((g) => {
          const ratio = Math.min((g.current / g.target) * 100, 100);
          
          let displayTitle = g.title;
          let displayUnit = g.unit;
          
          if (language === "ru") {
            if (g.id === "g1") {
              displayTitle = "Еженедельная цель по прибыли";
              displayUnit = "$";
            } else if (g.id === "g2") {
              displayTitle = "Соответствие рейтингу дисциплины";
              displayUnit = " Звезд";
            } else if (g.id === "g3") {
              displayTitle = "Объем сделок по шаблону";
              displayUnit = " Сделок";
            }
          } else {
            if (g.id === "g1") {
              displayTitle = "Weekly Profit Target";
              displayUnit = "$";
            } else if (g.id === "g2") {
              displayTitle = "Discipline Rating Compliance";
              displayUnit = " Stars";
            } else if (g.id === "g3") {
              displayTitle = "Playbook Execution Volume";
              displayUnit = " Trades";
            }
          }

          return (
            <div
              key={g.id}
              className="bg-[#0c0c0e] border border-zinc-800/50 p-5 rounded-xl space-y-4 relative overflow-hidden group"
            >
              {/* Delete hover trigger */}
              <button
                onClick={() => handleDeleteGoal(g.id)}
                className="absolute top-4 right-4 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                  {g.type} {language === "ru" ? "цель" : "goal"}
                </span>
                <h4 className="text-xs font-bold text-zinc-200">{displayTitle}</h4>
              </div>

              {/* Progress Ring / Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-mono text-zinc-400">
                    {language === "ru" ? "Прогресс" : "Progress"}: {displayUnit === "$" ? "$" : ""}{g.current}{displayUnit !== "$" ? displayUnit : ""} / {displayUnit === "$" ? "$" : ""}{g.target}{displayUnit !== "$" ? displayUnit : ""}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    {ratio.toFixed(0)}%
                  </span>
                </div>

                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/30">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${ratio}%` }}
                  ></div>
                </div>
              </div>

              {ratio >= 100 && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg flex items-center gap-2 text-[10px] text-emerald-400 font-semibold font-mono">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" /> {language === "ru" ? "ЦЕЛЬ ДОСТИГНУТА! ПРОДОЛЖАЙТЕ В ТОМ ЖЕ ДУХЕ." : "TARGET UNLOCKED! KEEP PUSHING."}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD GOAL DIALOG */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl text-xs text-zinc-200"
            >
              <div className="border-b border-zinc-800/50 px-5 py-4 flex justify-between items-center bg-[#09090b]">
                <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" /> {t("gl_form_title")}
                </h3>
                <button onClick={() => setIsAddOpen(false)} className="text-zinc-500 hover:text-zinc-300 text-sm font-mono cursor-pointer">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="p-5 space-y-4">
                <div>
                  <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Название цели *" : "Goal Title *"}</label>
                  <input
                    type="text"
                    required
                    placeholder={language === "ru" ? "например, Цель по месячной прибыли" : "e.g. Month Profit Objective"}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Целевое значение *" : "Target Quantity *"}</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 2000"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Текущий прогресс" : "Current Progress"}</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 200"
                      value={newCurrent}
                      onChange={(e) => setNewCurrent(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Ед. измерения (напр. $, сделок)" : "Metric Unit (e.g. $, Trades)"}</label>
                    <input
                      type="text"
                      placeholder="e.g. $"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{language === "ru" ? "Тип цели" : "Goal Type"}</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-1.5 text-zinc-300"
                    >
                      <option value="profit">{language === "ru" ? "прибыль" : "profit"}</option>
                      <option value="discipline">{language === "ru" ? "дисциплина" : "discipline"}</option>
                      <option value="trades">{language === "ru" ? "сделки" : "trades"}</option>
                      <option value="custom">{language === "ru" ? "другое" : "custom"}</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="bg-zinc-900 text-zinc-400 hover:bg-zinc-800 px-4 py-2 rounded cursor-pointer"
                  >
                    {language === "ru" ? "Отмена" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded cursor-pointer"
                  >
                    {language === "ru" ? "Создать цель" : "Create Target"}
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
