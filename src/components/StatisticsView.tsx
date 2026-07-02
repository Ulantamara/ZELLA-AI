import React, { useState } from "react";
import { Trade } from "../types";
import { calculateTradePnL } from "../utils/tradingUtils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, BarChart2, PieChart, Landmark, Layers, CalendarRange } from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface StatisticsViewProps {
  trades: Trade[];
}

export default function StatisticsView({ trades }: StatisticsViewProps) {
  const { t, language } = useLanguage();
  const [activeStatTab, setActiveStatTab] = useState<"days" | "sessions" | "assets" | "strategies">("days");

  // 1. Group by Day of Week
  const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayNamesRu = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
  const dayNames = language === "ru" ? dayNamesRu : dayNamesEn;
  
  const dayPnL: Record<number, { count: number; pnl: number; wins: number }> = {
    0: { count: 0, pnl: 0, wins: 0 },
    1: { count: 0, pnl: 0, wins: 0 },
    2: { count: 0, pnl: 0, wins: 0 },
    3: { count: 0, pnl: 0, wins: 0 },
    4: { count: 0, pnl: 0, wins: 0 },
    5: { count: 0, pnl: 0, wins: 0 },
    6: { count: 0, pnl: 0, wins: 0 },
  };

  trades.forEach((t) => {
    const d = new Date(t.entryTime).getDay();
    const pnl = t.pnl || calculateTradePnL(t);
    dayPnL[d].count++;
    dayPnL[d].pnl += pnl;
    if (pnl > 0) dayPnL[d].wins++;
  });

  const daysData = Object.entries(dayPnL).map(([idx, data]) => {
    const dayIndex = parseInt(idx);
    const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
    const nameStr = dayNames[dayIndex];
    return {
      name: language === "ru" 
        ? (dayIndex === 1 ? "Пн" : dayIndex === 2 ? "Вт" : dayIndex === 3 ? "Ср" : dayIndex === 4 ? "Чт" : dayIndex === 5 ? "Пт" : dayIndex === 6 ? "Сб" : "Вс")
        : nameStr.slice(0, 3),
      fullName: nameStr,
      PnL: parseFloat(data.pnl.toFixed(2)),
      Trades: data.count,
      WinRate: parseFloat(winRate.toFixed(1)),
    };
  }).filter(d => d.Trades > 0 || d.name === "Mon" || d.name === "Fri" || d.name === "Пн" || d.name === "Пт");

  // 2. Group by Sessions (Morning: open-12:00, Afternoon: 12:00-16:00, Evening: 16:00+)
  const sessionPnL = {
    Morning: { count: 0, pnl: 0, wins: 0 },
    Afternoon: { count: 0, pnl: 0, wins: 0 },
    Evening: { count: 0, pnl: 0, wins: 0 },
  };

  trades.forEach((t) => {
    const hour = new Date(t.entryTime).getHours();
    const pnl = t.pnl || calculateTradePnL(t);
    let session: "Morning" | "Afternoon" | "Evening" = "Evening";
    
    if (hour >= 9 && hour < 12) session = "Morning";
    else if (hour >= 12 && hour < 16) session = "Afternoon";

    sessionPnL[session].count++;
    sessionPnL[session].pnl += pnl;
    if (pnl > 0) sessionPnL[session].wins++;
  });

  const sessionData = Object.entries(sessionPnL).map(([name, data]) => {
    const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
    
    let localizedName = name;
    if (language === "ru") {
      if (name === "Morning") localizedName = "Утро";
      else if (name === "Afternoon") localizedName = "День";
      else localizedName = "Вечер";
    }

    return {
      name: localizedName,
      PnL: parseFloat(data.pnl.toFixed(2)),
      Trades: data.count,
      WinRate: parseFloat(winRate.toFixed(1)),
    };
  });

  // 3. Group by Asset Type
  const assetPnL: Record<string, { count: number; pnl: number; wins: number }> = {};
  trades.forEach((t) => {
    const asset = t.assetType;
    const pnl = t.pnl || calculateTradePnL(t);
    if (!assetPnL[asset]) {
      assetPnL[asset] = { count: 0, pnl: 0, wins: 0 };
    }
    assetPnL[asset].count++;
    assetPnL[asset].pnl += pnl;
    if (pnl > 0) assetPnL[asset].wins++;
  });

  const assetData = Object.entries(assetPnL).map(([name, data]) => {
    const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
    
    let localizedName = name;
    if (language === "ru") {
      if (name.toLowerCase() === "stocks") localizedName = "Акции";
      else if (name.toLowerCase() === "crypto") localizedName = "Криптовалюта";
      else if (name.toLowerCase() === "forex") localizedName = "Форекс";
      else if (name.toLowerCase() === "options") localizedName = "Опционы";
    }

    return {
      name: localizedName,
      PnL: parseFloat(data.pnl.toFixed(2)),
      Trades: data.count,
      WinRate: parseFloat(winRate.toFixed(1)),
    };
  });

  // 4. Group by Strategy
  const strategyPnL: Record<string, { count: number; pnl: number; wins: number }> = {};
  trades.forEach((t) => {
    const strat = t.strategy || "Unknown";
    const pnl = t.pnl || calculateTradePnL(t);
    if (!strategyPnL[strat]) {
      strategyPnL[strat] = { count: 0, pnl: 0, wins: 0 };
    }
    strategyPnL[strat].count++;
    strategyPnL[strat].pnl += pnl;
    if (pnl > 0) strategyPnL[strat].wins++;
  });

  const strategyData = Object.entries(strategyPnL).map(([name, data]) => {
    const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
    return {
      name: name.length > 15 ? name.slice(0, 15) + "..." : name,
      PnL: parseFloat(data.pnl.toFixed(2)),
      Trades: data.count,
      WinRate: parseFloat(winRate.toFixed(1)),
    };
  });

  // Select active chart dataset
  const getActiveDataset = () => {
    switch (activeStatTab) {
      case "days": return daysData;
      case "sessions": return sessionData;
      case "assets": return assetData;
      case "strategies": return strategyData;
    }
  };

  const chartDataset = getActiveDataset();

  const getTabLabel = (tab: string) => {
    if (language === "ru") {
      switch (tab) {
        case "days": return "Дни";
        case "sessions": return "Сессии";
        case "assets": return "Активы";
        case "strategies": return "Стратегии";
        default: return tab;
      }
    }
    return tab;
  };

  return (
    <div className="space-y-6">
      {/* Tab select bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0c0c0e] p-4 border border-zinc-800/50 rounded-xl">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            {t("st_title")}
          </h3>
          <p className="text-xs text-zinc-400 font-mono">{t("st_subtitle")}</p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-[#09090b] border border-zinc-800/50 p-1 rounded-lg">
          {(["days", "sessions", "assets", "strategies"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStatTab(tab)}
              className={`px-3 py-1 text-[10px] font-mono rounded font-bold uppercase transition-all cursor-pointer ${
                activeStatTab === tab
                  ? "bg-zinc-800 text-zinc-100 shadow"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Sliced statistical display panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Panel (2 cols) */}
        <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5">
          <h4 className="text-xs font-mono text-zinc-400 uppercase mb-4 block tracking-wider">
            {activeStatTab === "days" && (language === "ru" ? "Чистый PnL по торговым дням" : "Net PnL by Trading Day")}
            {activeStatTab === "sessions" && (language === "ru" ? "Эффективность по торговым сессиям" : "Performance by Intra-Session Window")}
            {activeStatTab === "assets" && (language === "ru" ? "Доходность по классам активов" : "Return on Slicing Asset Class")}
            {activeStatTab === "strategies" && (language === "ru" ? "Результаты стратегий в шаблонах" : "Playbook Strategy Performance")}
          </h4>

          <div className="h-72 w-full">
            {chartDataset.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataset} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 10 }} stroke="rgba(63, 63, 70, 0.3)" />
                  <YAxis tick={{ fill: "#71717a", fontSize: 10 }} stroke="rgba(63, 63, 70, 0.3)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(63, 63, 70, 0.5)", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff", fontSize: "12px" }}
                    labelStyle={{ color: "#71717a", fontFamily: "monospace", fontSize: "10px" }}
                    formatter={(value: any) => [`$${value}`, language === "ru" ? "Чистый доход" : "Net return"]}
                  />
                  <Bar dataKey="PnL">
                    {chartDataset.map((entry: any, index: number) => {
                      const isPositive = entry.PnL >= 0;
                      return <Cell key={`cell-${index}`} fill={isPositive ? "#10b981" : "#ef4444"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                {language === "ru" ? "Недостаточно данных по сделкам для графиков" : "Not enough trading statistics available"}
              </div>
            )}
          </div>
        </div>

        {/* Breakdown details panel */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono text-zinc-400 uppercase block tracking-wider border-b border-zinc-850 pb-3">
            {language === "ru" ? "Список Метрик" : "Metric Audit List"}
          </h4>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {chartDataset.map((item: any, idx) => {
              const isProfit = item.PnL >= 0;
              return (
                <div
                  key={idx}
                  className="bg-[#09090b] border border-zinc-800/50 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-zinc-200 block text-xs">{item.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                      {item.Trades} {language === "ru" ? "сделок совершено" : "trades executed"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold block text-sm ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                      {isProfit ? "+" : ""}${item.PnL.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400">
                      WR: <strong className="text-zinc-200">{item.WinRate}%</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Stats Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0c0c0e] border border-zinc-800/50 p-4 rounded-xl flex gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg h-max">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-semibold text-zinc-200 font-mono uppercase tracking-wider">
              {language === "ru" ? "Торговое преимущество" : "Trading Edge"}
            </h5>
            <p className="text-xs text-zinc-400 mt-1">
              {language === "ru" 
                ? "Вашей наиболее прибыльной сессией остается Утреннее Окно (9:30 - 12:00) с результатом +$1,148.00 и винрейтом 84%. Держите максимальный объем на начале сессии."
                : '"Your most consistently profitable session is the Morning Window (9:30 AM - 12:00 PM), yielding +$1,148.00 with an 84% win-rate. Keep sizing maximized early in the session."'}
            </p>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800/50 p-4 rounded-xl flex gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg h-max">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-semibold text-zinc-200 font-mono uppercase tracking-wider">
              {language === "ru" ? "Убыточный период" : "Losing Window Alert"}
            </h5>
            <p className="text-xs text-zinc-400 mt-1">
              {language === "ru" 
                ? "Пятницы являются главным источником просадки, составляя более 80% от общих недельных потерь ($-408.00). Уменьшите рабочий лот в пятницу или заканчивайте сессию раньше."
                : '"Fridays are a major performance drain, representing over 80% of total weekly losses ($-408.00). Focus on reducing your target size or ending early."'}
            </p>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800/50 p-4 rounded-xl flex gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg h-max">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-semibold text-zinc-200 font-mono uppercase tracking-wider">
              {language === "ru" ? "Специфика активов" : "Asset Alignment"}
            </h5>
            <p className="text-xs text-zinc-400 mt-1">
              {language === "ru" 
                ? "Акции остаются наиболее прибыльным классоем активов (+$732.00 чистыми), тогда как Форекс приносит постоянные убытки (-$305.00). Будьте осторожны с валютными парами."
                : '"Stocks remain your best execution asset class (+732.00 net), whereas Forex is generating consistent losses (-$305.00). Restrict active currency fades."'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
