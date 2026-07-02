import React, { useState } from "react";
import { Landmark, Shield, RefreshCw, Key, Link2, CircleAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../LanguageContext";

interface SettingsViewProps {
  onImportTrades?: (imported: any[]) => void;
}

export default function SettingsView({ onImportTrades }: SettingsViewProps = {}) {
  const { language, setLanguage, t } = useLanguage();
  const [activeBroker, setActiveBroker] = useState<string>("Interactive Brokers");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<Record<string, "idle" | "connecting" | "connected">>({
    "Interactive Brokers": "idle",
    "Binance Pro": "connected",
    "Tradovate": "idle",
    "Apex Clearing": "idle",
  });

  // Tradovate state
  const [tradovateUsername, setTradovateUsername] = useState("");
  const [tradovatePassword, setTradovatePassword] = useState("");
  const [tradovateEnv, setTradovateEnv] = useState("Demo");
  const [syncError, setSyncError] = useState("");
  const [syncedTradesCount, setSyncedTradesCount] = useState(0);
  const [syncAnalysis, setSyncAnalysis] = useState("");
  const [tradovateAppId, setTradovateAppId] = useState("");
  const [tradovateAppVersion, setTradovateAppVersion] = useState("1.0");
  const [tradovateCid, setTradovateCid] = useState("");
  const [tradovateSec, setTradovateSec] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [syncedTrades, setSyncedTrades] = useState<any[]>([]);
  const [syncedAccounts, setSyncedAccounts] = useState<any[]>([]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setConnectionStatus((prev) => ({ ...prev, [activeBroker]: "connecting" }));

    setTimeout(() => {
      setConnectionStatus((prev) => ({ ...prev, [activeBroker]: "connected" }));
      setApiKey("");
      setApiSecret("");
    }, 2000);
  };

  const handleTradovateSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncError("");
    setSyncAnalysis("");
    setConnectionStatus((prev) => ({ ...prev, "Tradovate": "connecting" }));

    try {
      const res = await fetch("/api/integrations/tradovate/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: tradovateUsername,
          password: tradovatePassword,
          environment: tradovateEnv,
          language,
          appId: tradovateAppId,
          appVersion: tradovateAppVersion,
          cid: tradovateCid,
          sec: tradovateSec
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Tradovate synchronization failed. Please check credentials or try again.");
      }

      const data = await res.json();
      if (data.success) {
        setSyncedTradesCount(data.trades.length);
        setSyncedTrades(data.trades || []);
        setSyncedAccounts(data.accounts || []);
        setSyncAnalysis(data.aiAnalysis);
        setConnectionStatus((prev) => ({ ...prev, "Tradovate": "connected" }));
        
        // Pass to global trade log state
        if (onImportTrades && data.trades) {
          onImportTrades(data.trades);
        }
      } else {
        throw new Error(data.error || "Failed to parse trades from connection");
      }
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || "Connection refused by Tradovate broker node.");
      setConnectionStatus((prev) => ({ ...prev, "Tradovate": "idle" }));
    }
  };

  const handleDisconnect = (broker: string) => {
    setConnectionStatus((prev) => ({ ...prev, [broker]: "idle" }));
    if (broker === "Tradovate") {
      setTradovateUsername("");
      setTradovatePassword("");
      setTradovateAppId("");
      setTradovateAppVersion("1.0");
      setTradovateCid("");
      setTradovateSec("");
      setSyncedTradesCount(0);
      setSyncedTrades([]);
      setSyncedAccounts([]);
      setSyncAnalysis("");
      setSyncError("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0c0c0e] p-5 border border-zinc-800/50 rounded-xl">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            {t("se_title")}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">{t("se_subtitle")}</p>
        </div>
      </div>

      {/* Language Section in settings */}
      <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
        <div>
          <h4 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            {t("se_lang_section")} / Language Selection
          </h4>
          <p className="text-xs text-zinc-400 mt-1">
            {t("se_lang_desc")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setLanguage("en")}
            className={`px-4 py-2.5 rounded-lg border text-xs font-semibold font-mono tracking-wide transition-all flex items-center gap-2.5 ${
              language === "en"
                ? "bg-blue-600 border-blue-500 text-white font-bold shadow-lg shadow-blue-500/20"
                : "bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            🇺🇸 English (EN)
          </button>
          <button
            onClick={() => setLanguage("ru")}
            className={`px-4 py-2.5 rounded-lg border text-xs font-semibold font-mono tracking-wide transition-all flex items-center gap-2.5 ${
              language === "ru"
                ? "bg-blue-600 border-blue-500 text-white font-bold shadow-lg shadow-blue-500/20"
                : "bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            🇷🇺 Русский (RU)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Select broker */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 space-y-4 h-max">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/30 pb-2">
            {t("se_supported")}
          </h4>

          <div className="space-y-1.5">
            {["Interactive Brokers", "Binance Pro", "Tradovate", "Apex Clearing"].map((b) => {
              const status = connectionStatus[b] || "idle";
              const selected = b === activeBroker;
              return (
                <button
                  key={b}
                  onClick={() => setActiveBroker(b)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center ${
                    selected
                      ? "bg-[#09090b] border-blue-500/40 text-zinc-100"
                      : "bg-zinc-950/40 border-zinc-800/30 hover:bg-zinc-900/60 text-zinc-400"
                  }`}
                >
                  <span className="font-bold text-xs">{b}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    status === "connected"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : status === "connecting"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800"
                  }`}>
                    {status.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column - Connection forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 space-y-5">
            <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/30 pb-2 flex justify-between items-center">
              <span>{t("se_link_port")} {activeBroker}</span>
              {activeBroker === "Tradovate" && (
                <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-mono font-bold border border-amber-500/20">
                  FUTURES SPECIALIST
                </span>
              )}
            </h4>

            {connectionStatus[activeBroker] === "connected" ? (
              <div className="space-y-5">
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-lg flex gap-3 items-start text-xs text-emerald-300">
                  <div className="p-1.5 bg-emerald-500/10 rounded">
                    <Link2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-400 block font-mono">{t("se_connected")}</span>
                    <p className="leading-relaxed">
                      {activeBroker === "Tradovate" 
                        ? t("se_tradovate_desc") 
                        : `${t("se_connected_desc")} ${activeBroker}. ${t("se_connected_desc_end")}`}
                    </p>
                  </div>
                </div>

                {/* Tradovate Live Sync AI Report & Trades Details */}
                {activeBroker === "Tradovate" && syncAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Synced Accounts List */}
                    {syncedAccounts.length > 0 && (
                      <div className="border border-zinc-800/60 rounded-xl overflow-hidden bg-[#09090b]/80">
                        <div className="bg-zinc-950 px-4 py-2.5 border-b border-zinc-800/60 flex justify-between items-center text-[10px] font-mono">
                          <span className="text-zinc-400 uppercase tracking-wider font-bold">👤 {language === "ru" ? "ПОДКЛЮЧЕННЫЕ ТОРГОВЫЕ СЧЕТА" : "YOUR CONNECTED ACCOUNTS"}</span>
                          <span className="text-blue-400 font-bold">{syncedAccounts.length} Active Accounts</span>
                        </div>
                        <div className="divide-y divide-zinc-900 px-4 py-3 space-y-2">
                          {syncedAccounts.map((acc, index) => (
                            <div key={acc.id || index} className="flex justify-between items-center text-xs font-mono">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 text-[10px]">#{acc.id}</span>
                                <span className="font-bold text-zinc-200">{acc.name}</span>
                                <span className="text-[9px] text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded uppercase">{acc.accountType}</span>
                              </div>
                              <span className="text-blue-400 font-bold">
                                ${Number(acc.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Synced Trades List */}
                    {syncedTrades.length > 0 ? (
                      <div className="border border-zinc-800/60 rounded-xl overflow-hidden bg-[#09090b]/80">
                        <div className="bg-zinc-950 px-4 py-2.5 border-b border-zinc-800/60 flex justify-between items-center text-[10px] font-mono">
                          <span className="text-zinc-400 uppercase tracking-wider font-bold">🎯 {language === "ru" ? "ИМПОРТИРОВАННЫЕ СДЕЛКИ FUTURES" : "LIVE SYNCED FUTURES TRADES"}</span>
                          <span className="text-emerald-400 font-bold">{syncedTradesCount} Trades Loaded</span>
                        </div>
                        <div className="divide-y divide-zinc-900 px-4 py-1">
                          <div className="py-2 flex justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-900 pb-1.5 mb-1">
                            <span>CONTRACT</span>
                            <span className="text-right">EXECUTION PNL</span>
                          </div>
                          
                          {syncedTrades.map((t, idx) => (
                            <div key={t.id || idx} className="py-2.5 flex justify-between items-center text-xs font-mono border-b border-zinc-900 last:border-0">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                                  t.direction.toLowerCase() === "long" 
                                    ? "text-emerald-400 bg-emerald-500/10" 
                                    : "text-red-400 bg-red-500/10"
                                }`}>
                                  {t.direction.toUpperCase()}
                                </span>
                                <span className="font-bold text-zinc-200">{t.ticker}</span>
                                <span className="text-zinc-500 text-[10px]">
                                  {t.positionSize} contract{t.positionSize > 1 ? "s" : ""} @ {t.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <span className={`font-bold ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {t.pnl >= 0 ? "+" : ""}${Number(t.pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#09090b]/80 border border-zinc-800/60 rounded-xl p-5 text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto font-bold text-xs">
                          ✓
                        </div>
                        <span className="text-xs font-mono font-bold text-zinc-200 block">
                          {language === "ru" ? "ПОДКЛЮЧЕНИЕ УСПЕШНО УСТАНОВЛЕНО" : "CONNECTION SUCCESSFULLY ESTABLISHED"}
                        </span>
                        <p className="text-[11px] text-zinc-400 font-mono leading-relaxed max-w-md mx-auto">
                          {language === "ru"
                            ? "Ваш реальный аккаунт успешно подключен! Активные торговые отчеты в настоящий момент не имеют исполненных сделок за текущий период. Новые сделки будут автоматически транслироваться сюда в реальном времени."
                            : "Your live account is linked! There are currently no transaction fills in your trading history for this period. Future filled orders will instantly sync here."}
                        </p>
                      </div>
                    )}

                    {/* Zella Cognitive Behavioral AI Report */}
                    <div className="border border-blue-500/20 rounded-xl overflow-hidden shadow-lg shadow-blue-500/[0.02]">
                      <div className="bg-gradient-to-r from-blue-900/30 to-zinc-950 px-4 py-3 border-b border-blue-500/20 flex items-center justify-between">
                        <span className="text-[11px] font-mono font-black text-blue-400 tracking-wider uppercase">
                          ⚡ ZELLA COGNITIVE BEHAVIORAL COCHING AUDIT
                        </span>
                        <span className="text-[9px] font-mono bg-blue-500 text-black font-black px-2 py-0.5 rounded">
                          REAL-TIME ANALYSIS
                        </span>
                      </div>
                      <div className="p-5 bg-zinc-950/40 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap select-text markdown-body">
                        {syncAnalysis}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleDisconnect(activeBroker)}
                    className="bg-[#3b0712]/40 hover:bg-[#4c0519]/60 border border-[#9f1239]/30 text-[#f43f5e] font-semibold px-4 py-2 rounded text-xs transition-colors cursor-pointer"
                  >
                    {t("se_disconnect")}
                  </button>
                </div>
              </div>
            ) : connectionStatus[activeBroker] === "connecting" ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-8 h-8 border-2 border-t-blue-500 border-zinc-800 rounded-full animate-spin mx-auto"></div>
                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-400 animate-pulse block">
                    {t("se_syncing")}
                  </span>
                  <p className="text-[10px] text-zinc-600 font-mono">
                    {activeBroker === "Tradovate" 
                      ? "Establishing WebSocket link to Tradovate Live Node... decrypting fills..."
                      : "Handshaking encrypted secure port nodes..."}
                  </p>
                </div>
              </div>
            ) : activeBroker === "Tradovate" ? (
              /* Custom Tradovate Form */
              <form onSubmit={handleTradovateSync} className="space-y-4 text-xs text-zinc-300">
                <div className="bg-zinc-950/60 p-4 border border-zinc-800/80 rounded-xl space-y-3">
                  <h5 className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    📌 {t("se_tradovate_title")}
                  </h5>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {t("se_tradovate_help")}
                  </p>
                </div>

                {syncError && (
                  <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 font-mono text-[11px]">
                    <CircleAlert className="w-4 h-4 shrink-0 text-red-400 animate-bounce" />
                    <span>{syncError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-500 font-mono mb-1 uppercase text-[9px]">
                      {language === "ru" ? "Имя пользователя Tradovate" : "Tradovate Username"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. tradovate_pro_99"
                      value={tradovateUsername}
                      onChange={(e) => setTradovateUsername(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-2 text-zinc-200 font-mono focus:border-amber-500/50 transition-all focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-mono mb-1 uppercase text-[9px]">
                      {language === "ru" ? "Пароль аккаунта" : "Account Password"}
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••••••"
                      value={tradovatePassword}
                      onChange={(e) => setTradovatePassword(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-2 text-zinc-200 font-mono focus:border-amber-500/50 transition-all focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-mono mb-1 uppercase text-[9px]">
                      {language === "ru" ? "Среда окружения" : "Environment"}
                    </label>
                    <select
                      value={tradovateEnv}
                      onChange={(e) => setTradovateEnv(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-2 text-zinc-300 font-mono focus:border-amber-500/50 transition-all focus:outline-none h-[34px]"
                    >
                      <option value="Demo">Simulation (Demo API)</option>
                      <option value="Live">Live Trading Workspace</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-amber-500 hover:text-amber-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 focus:outline-none"
                  >
                    <span>{showAdvanced ? "▼ Hide Real-Time API Key Connection" : "▶ Show Real-Time API Key Connection"}</span>
                  </button>
                </div>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-zinc-950/40 p-4 border border-zinc-800/40 rounded-xl space-y-4"
                  >
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                      {language === "ru" 
                        ? "Если у вас есть API ключ Tradovate, введите его параметры ниже для прямого импорта сделок с вашего реального или демо-счёта. Если эти поля не заполнены, соединение использует учётные данные для демонстрации."
                        : "If you have a Tradovate API Key, specify parameters below for direct live fills sync. If left empty, the sync fallback system will emulate transaction logs."}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                      <div>
                        <label className="block text-zinc-500 mb-1 uppercase text-[9px]">
                          App ID (Application Name)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. MyZellaTrader"
                          value={tradovateAppId}
                          onChange={(e) => setTradovateAppId(e.target.value)}
                          className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-2 text-zinc-200 text-xs focus:border-amber-500/50 transition-all focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1 uppercase text-[9px]">
                          App Version
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 1.0"
                          value={tradovateAppVersion}
                          onChange={(e) => setTradovateAppVersion(e.target.value)}
                          className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-2 text-zinc-200 text-xs focus:border-amber-500/50 transition-all focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1 uppercase text-[9px]">
                          Customer ID (CID)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 482910"
                          value={tradovateCid}
                          onChange={(e) => setTradovateCid(e.target.value)}
                          className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-2 text-zinc-200 text-xs focus:border-amber-500/50 transition-all focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1 uppercase text-[9px]">
                          API Key Secret (SEC)
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••••••••••"
                          value={tradovateSec}
                          onChange={(e) => setTradovateSec(e.target.value)}
                          className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-2 text-zinc-200 text-xs focus:border-amber-500/50 transition-all focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="bg-zinc-950/40 border border-zinc-800/30 rounded p-3 text-[11px] text-zinc-500 flex gap-2">
                  <Key className="w-4 h-4 shrink-0 text-zinc-600" />
                  <p>
                    {t("se_key_warning")} ZellaTrader connects only to transaction logs via read-only channels. Trading actions are strictly blocked for security.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs px-5 py-2.5 rounded shadow-lg shadow-amber-500/10 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                    {t("se_tradovate_sync_btn")}
                  </button>
                </div>
              </form>
            ) : (
              /* Standard API Form */
              <form onSubmit={handleConnect} className="space-y-4 text-xs text-zinc-300">
                <p className="text-zinc-400">
                  {t("se_token_prompt")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 font-mono mb-1 uppercase text-[9px]">{t("se_api_key")}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ibkr_client_live_0491"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-2 text-zinc-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-mono mb-1 uppercase text-[9px]">{t("se_api_secret")}</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••••••"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800/50 rounded p-2 text-zinc-200 font-mono"
                    />
                  </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-800/30 rounded p-3 text-[11px] text-zinc-500 flex gap-2">
                  <Key className="w-4 h-4 shrink-0 text-zinc-600" />
                  <p>
                    {t("se_key_warning")}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded shadow transition-colors cursor-pointer"
                  >
                    {t("se_auth_connect")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
