import React, { useState } from "react";
import { Trade, PsychologyLog } from "../types";
import { calculateMetrics } from "../utils/tradingUtils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent, Award, ShieldAlert, Zap, Calendar, ListFilter } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../LanguageContext";
import VideoGuide from "./VideoGuide";

interface DashboardViewProps {
  trades: Trade[];
  psychologyLogs: PsychologyLog[];
  onSelectTrade: (trade: Trade) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({ trades, psychologyLogs, onSelectTrade, onNavigateToTab }: DashboardViewProps) {
  const { t, language } = useLanguage();
  const metrics = calculateMetrics(trades);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // 1. Prepare Equity Curve Data
  const sortedTrades = [...trades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
  let cumPnL = 0;
  const equityData = sortedTrades.map((t, idx) => {
    cumPnL += t.pnl || 0;
    return {
      index: idx + 1,
      trade: `${t.ticker} (${t.direction})`,
      pnl: parseFloat((t.pnl || 0).toFixed(2)),
      equity: parseFloat(cumPnL.toFixed(2)),
      date: new Date(t.entryTime).toLocaleDateString([], { month: "short", day: "numeric" }),
    };
  });

  // Add initial zero point if empty
  const chartData = equityData.length > 0 ? [{ index: 0, trade: "Start", pnl: 0, equity: 0, date: "" }, ...equityData] : [];

  // 2. Prepare Distribution Data
  const bins = [
    { name: "<-$500", count: 0, fill: "#f43f5e" },
    { name: "-$500 to -$100", count: 0, fill: "#fda4af" },
    { name: "-$100 to $0", count: 0, fill: "#fecdd3" },
    { name: "$0 to $100", count: 0, fill: "#a7f3d0" },
    { name: "$100 to $500", count: 0, fill: "#6ee7b7" },
    { name: ">$500", count: 0, fill: "#10b981" },
  ];

  trades.forEach((t) => {
    const pnl = t.pnl || 0;
    if (pnl < -500) bins[0].count++;
    else if (pnl >= -500 && pnl < -100) bins[1].count++;
    else if (pnl >= -100 && pnl < 0) bins[2].count++;
    else if (pnl >= 0 && pnl <= 100) bins[3].count++;
    else if (pnl > 100 && pnl <= 500) bins[4].count++;
    else if (pnl > 500) bins[5].count++;
  });

  // 3. Calendar Grid (June 2026 - aligned with seed timestamp)
  const daysInJune = 30;
  const calendarDays = Array.from({ length: daysInJune }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-06-${dayNum < 10 ? `0${dayNum}` : dayNum}`;
    
    // Find trades completed on this day
    const dayTrades = trades.filter((t) => t.entryTime.startsWith(dateStr));
    const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const dayPsych = psychologyLogs.find((p) => p.date === dateStr);

    return {
      day: dayNum,
      date: dateStr,
      pnl: dayPnL,
      trades: dayTrades,
      mood: dayPsych ? dayPsych.notes : null,
      revenge: dayPsych ? dayPsych.revengeTrading : false,
    };
  });

  const selectedDateTrades = selectedCalendarDate 
    ? calendarDays.find(d => d.date === selectedCalendarDate)?.trades || []
    : [];

  return (
    <div className="space-y-6">
      <VideoGuide />
      {/* 1. Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total PnL */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-4 relative overflow-hidden group hover:border-[#3b82f6]/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-400 uppercase font-mono tracking-wider">{t("db_total_pnl")}</span>
            <div className={`p-1.5 rounded-lg ${metrics.totalPnL >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${metrics.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {metrics.totalPnL >= 0 ? "+" : ""}${metrics.totalPnL.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex gap-2 text-[10px] font-mono text-zinc-500">
            <span>{t("db_win_pnl")}: +${trades.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(0)}</span>
          </div>
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#22c55e]/20 to-transparent"></div>
        </div>

        {/* Win Rate */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-4 relative overflow-hidden group hover:border-[#3b82f6]/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-400 uppercase font-mono tracking-wider">{t("db_win_rate")}</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-100 tracking-tight">{metrics.winRate}%</span>
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-mono text-zinc-500">
            <span>{metrics.winningTradesCount} W / {metrics.losingTradesCount} L</span>
            <span>{t("db_total")}: {metrics.totalTrades}</span>
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-4 relative overflow-hidden group hover:border-[#3b82f6]/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-400 uppercase font-mono tracking-wider">{t("db_profit_factor")}</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-100 tracking-tight">{metrics.profitFactor}</span>
          </div>
          <div className="mt-1 flex gap-1 text-[10px] font-mono text-zinc-500">
            <span className={metrics.profitFactor >= 1.5 ? "text-emerald-500" : "text-amber-500"}>
              {metrics.profitFactor >= 2.0 ? t("db_elite_edge") : metrics.profitFactor >= 1.2 ? t("db_moderate_edge") : t("db_negative_edge")}
            </span>
          </div>
        </div>

        {/* Today's PnL */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-4 relative overflow-hidden group hover:border-[#3b82f6]/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-400 uppercase font-mono tracking-wider">{t("db_today_pnl")}</span>
            <div className={`p-1.5 rounded-lg ${metrics.todayPnL >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold tracking-tight ${metrics.todayPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {metrics.todayPnL >= 0 ? "+" : ""}${metrics.todayPnL.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-mono text-zinc-500">
            <span>{t("db_weekly")}: {metrics.weeklyPnL >= 0 ? "+" : ""}${metrics.weeklyPnL}</span>
            <span>{t("db_monthly")}: {metrics.monthlyPnL >= 0 ? "+" : ""}${metrics.monthlyPnL}</span>
          </div>
        </div>
      </div>

      {/* 2. Secondary Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-lg p-3 text-center">
          <p className="text-[10px] font-mono text-zinc-500 uppercase">{t("db_avg_winner")}</p>
          <p className="text-sm font-bold text-emerald-400 mt-1">+${metrics.avgWinner.toFixed(0)}</p>
        </div>
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-lg p-3 text-center">
          <p className="text-[10px] font-mono text-zinc-500 uppercase">{t("db_avg_loser")}</p>
          <p className="text-sm font-bold text-rose-400 mt-1">-${Math.abs(metrics.avgLoser).toFixed(0)}</p>
        </div>
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-lg p-3 text-center">
          <p className="text-[10px] font-mono text-zinc-500 uppercase">{t("db_avg_rr")}</p>
          <p className="text-sm font-bold text-zinc-200 mt-1">{metrics.avgRR}R</p>
        </div>
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-lg p-3 text-center">
          <p className="text-[10px] font-mono text-zinc-500 uppercase">{t("db_expectancy")}</p>
          <p className={`text-sm font-bold mt-1 ${metrics.expectancy >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {metrics.expectancy >= 0 ? "+" : ""}${metrics.expectancy.toFixed(0)}
          </p>
        </div>
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-lg p-3 text-center">
          <p className="text-[10px] font-mono text-zinc-500 uppercase">{t("db_max_dd")}</p>
          <p className="text-sm font-bold text-rose-400 mt-1">-${metrics.maxDrawdown.toFixed(0)}</p>
        </div>
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-lg p-3 text-center">
          <p className="text-[10px] font-mono text-zinc-500 uppercase">{t("db_streak")}</p>
          <p className="text-sm font-bold text-indigo-400 mt-1">{metrics.winningStreak}W / {metrics.losingStreak}L</p>
        </div>
      </div>

      {/* 3. Equity Curve & Strategy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve (2 cols wide on large screens) */}
        <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 font-mono">{t("db_equity_curve")}</h3>
              <p className="text-xs text-zinc-400">{t("db_equity_desc")}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                {t("db_sharpe")}: 2.14
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} stroke="#27272a" />
                  <YAxis tick={{ fill: "#71717a", fontSize: 10 }} stroke="#27272a" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "rgba(63, 63, 70, 0.5)", borderRadius: "8px" }}
                    labelStyle={{ color: "#a1a1aa", fontFamily: "monospace", fontSize: "11px" }}
                    itemStyle={{ color: "#10b981", fontSize: "12px" }}
                    formatter={(value: any, name: any, props: any) => {
                      if (props.payload.trade && props.payload.trade !== "Start") {
                        return [`$${value}`, language === "ru" ? `Капитал (${props.payload.trade})` : `Equity (${props.payload.trade})`];
                      }
                      return [`$${value}`, language === "ru" ? "Капитал" : "Equity"];
                    }}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                {language === "ru" ? "Добавьте сделки, чтобы построить Кривую Капитала" : "Log trades to populate the Equity Curve"}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Distribution / Highlights */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 font-mono mb-1">{t("db_pnl_dist")}</h3>
            <p className="text-xs text-zinc-400 mb-4">{t("db_pnl_dist_desc")}</p>
            
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bins} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 8 }} stroke="rgba(63, 63, 70, 0.5)" />
                  <YAxis tick={{ fill: "#71717a", fontSize: 10 }} stroke="rgba(63, 63, 70, 0.5)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "rgba(63, 63, 70, 0.5)", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff", fontSize: "12px" }}
                  />
                  <ReferenceLine y={0} stroke="#27272a" />
                  <Bar dataKey="count" fill="#3b82f6">
                    {bins.map((entry, index) => (
                      <rect key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border-t border-zinc-800/50 pt-4 mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-900/40 p-2 rounded border border-zinc-800/30">
              <span className="text-zinc-500 font-mono text-[10px] block uppercase">{t("db_best_strat")}</span>
              <span className="text-emerald-400 font-semibold block truncate mt-1">{metrics.bestStrategy}</span>
            </div>
            <div className="bg-zinc-900/40 p-2 rounded border border-zinc-800/30">
              <span className="text-zinc-500 font-mono text-[10px] block uppercase">{t("db_worst_strat")}</span>
              <span className="text-rose-400 font-semibold block truncate mt-1">{metrics.worstStrategy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Calendar Heatmap Grid */}
      <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              {t("db_calendar")}
            </h3>
            <p className="text-xs text-zinc-400">{t("db_calendar_desc")}</p>
          </div>
          {/* Heatmap Legend */}
          <div className="flex gap-2 items-center text-[10px] font-mono text-zinc-400 bg-[#09090b] border border-zinc-800/50 px-3 py-1 rounded-lg">
            <span>{t("db_legend_loss")}</span>
            <div className="w-3 py-1 bg-rose-500 rounded-sm"></div>
            <div className="w-3 py-1 bg-rose-500/40 rounded-sm"></div>
            <div className="w-3 py-1 bg-zinc-800 rounded-sm"></div>
            <div className="w-3 py-1 bg-emerald-500/40 rounded-sm"></div>
            <div className="w-3 py-1 bg-emerald-500 rounded-sm"></div>
            <span>{t("db_legend_gain")}</span>
          </div>
        </div>

        {/* June 2026 Heatmap (Starts on Monday June 1) */}
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday Labels */}
          {(language === "ru" ? ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"] : ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]).map((day) => (
            <div key={day} className="text-center font-mono text-[9px] text-zinc-500 py-1 font-semibold">
              {day}
            </div>
          ))}

          {/* Heatmap grid squares */}
          {calendarDays.map((day) => {
            const hasTrades = day.trades.length > 0;
            const pnl = day.pnl;
            
            let colorClass = "bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-800/40";
            if (hasTrades) {
              if (pnl > 500) colorClass = "bg-emerald-600 border-emerald-500 text-emerald-50 shadow-sm shadow-emerald-500/10 cursor-pointer";
              else if (pnl > 0) colorClass = "bg-emerald-500/30 border-emerald-500/40 text-emerald-300 cursor-pointer";
              else if (pnl < -500) colorClass = "bg-rose-600 border-rose-500 text-rose-50 shadow-sm shadow-rose-500/10 cursor-pointer";
              else colorClass = "bg-rose-500/30 border-rose-500/40 text-rose-300 cursor-pointer";
            }

            const isSelected = selectedCalendarDate === day.date;

            return (
              <motion.div
                key={day.day}
                whileHover={{ scale: hasTrades ? 1.04 : 1 }}
                onClick={() => hasTrades && setSelectedCalendarDate(isSelected ? null : day.date)}
                className={`aspect-square md:p-2 rounded-lg border flex flex-col justify-between transition-all p-1 ${colorClass} ${
                  isSelected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-black scale-[1.02]" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-mono font-bold ${hasTrades ? "" : "text-zinc-600"}`}>
                    {day.day}
                  </span>
                  {day.revenge && <span className="w-1.5 h-1.5 rounded-full bg-red-400 block" title={language === "ru" ? "Зафиксирован тильт-трейдинг" : "Revenge Trading Logged"}></span>}
                </div>
                {hasTrades && (
                  <span className="text-[10px] font-mono font-extrabold block text-right">
                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Selected Day Audit Drawer */}
        {selectedCalendarDate && selectedDateTrades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-zinc-800/50 bg-[#09090b] rounded-xl p-4 mt-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-mono text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-emerald-400" />
                {t("db_intraday_audit")}: {new Date(selectedCalendarDate).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
              </h4>
              <button
                onClick={() => setSelectedCalendarDate(null)}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-mono"
              >
                {t("db_close")}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedDateTrades.map((tItem) => (
                <div
                  key={tItem.id}
                  onClick={() => onSelectTrade(tItem)}
                  className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/60 hover:border-blue-500/40 cursor-pointer flex justify-between items-center group transition-all"
                >
                  <div className="truncate">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-zinc-100">{tItem.ticker}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        tItem.direction === "Long" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {tItem.direction === "Long" ? t("jr_long") : t("jr_short")}
                      </span>
                      <span className="text-zinc-500 text-[10px] truncate max-w-[120px]">{tItem.strategy}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate italic">"{tItem.setup}"</p>
                  </div>
                  <div className="text-right pl-2">
                    <span className={`font-mono font-bold text-sm block ${
                      (tItem.pnl || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {(tItem.pnl || 0) >= 0 ? "+" : ""}${tItem.pnl?.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">{t("db_view_replay")}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 5. Helpful Coaching Pro-Tip */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex gap-3 items-start">
        <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-blue-100 uppercase tracking-wider font-mono">{t("db_insight_title")}</h4>
          <p className="text-xs text-blue-200/80 mt-1">
            {t("db_insight_text")}
          </p>
          <button 
            onClick={() => onNavigateToTab("coach")}
            className="text-[10px] text-blue-400 font-mono mt-2 underline block hover:text-blue-300"
          >
            {t("db_launch_consultation")}
          </button>
        </div>
      </div>
    </div>
  );
}
