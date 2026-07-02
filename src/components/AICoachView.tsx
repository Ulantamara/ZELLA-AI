import React, { useState, useRef, useEffect } from "react";
import { Trade, Strategy, PsychologyLog } from "../types";
import { MessageSquare, Sparkles, Send, BrainCircuit, ShieldAlert, Award, Bot, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../LanguageContext";

interface AICoachViewProps {
  trades: Trade[];
  strategies: Strategy[];
  psychologyLogs: PsychologyLog[];
}

interface Message {
  id: string;
  sender: "user" | "coach";
  text: string;
  time: string;
}

export default function AICoachView({ trades, strategies, psychologyLogs }: AICoachViewProps) {
  const { t, language } = useLanguage();
  
  // Localized initial welcome message based on language state
  const getWelcomeText = () => {
    return language === "ru"
      ? "Добро пожаловать в рабочую станцию ИИ ZellaTrader. Я ваш наставник по глубокому риск-анализу. Спросите меня об ошибках исполнения, оцените соответствие сделок шаблонам правил или спланируйте размер позиции."
      : "Welcome to ZellaTrader AI Workspace. I am your deep quantitative coach. Ask me to audit your execution mistakes, grade your compliance to playbook rules, or plan your next risk size allocation.";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "coach",
      text: getWelcomeText(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [coachRole, setCoachRole] = useState<"auditor" | "strategist" | "risk">("auditor");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Update welcome message if language switches before any user input is sent
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === "init") {
      setMessages([
        {
          id: "init",
          sender: "coach",
          text: getWelcomeText(),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    }
  }, [language]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isSending) return;

    const userMsg: Message = {
      id: "msg_" + Date.now(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
      // Build role directives
      let roleContext = "";
      if (coachRole === "auditor") {
        roleContext = "Act as a ruthless Discipline Auditor. Review trade rules, call out emotional flaws, and mandate compliance.";
      } else if (coachRole === "strategist") {
        roleContext = "Act as a quantitative Statistical Strategist. Focus on win-rates, expectancy, edge-ratios, and mathematical optimization.";
      } else {
        roleContext = "Act as a high-frequency Risk Assessor. Audit leverage, sizing, stop-loss adherence, and correlation risk profiles.";
      }

      const payloadPrompt = `[Role context: ${roleContext}]
User question/prompt: ${textToSend}`;

      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ sender: "user", text: payloadPrompt }],
          trades,
          strategies,
          psychologyLogs,
        }),
      });

      const data = await response.json();
      const botMsg: Message = {
        id: "msg_bot_" + Date.now(),
        sender: "coach",
        text: data.response || (language === "ru" ? "Ответ не получен. Пожалуйста, проверьте соединение." : "No response received. Please check backend connection."),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: "msg_err_" + Date.now(),
        sender: "coach",
        text: language === "ru" 
          ? `Не удалось связаться с ядром ИИ: ${err.message}. Пожалуйста, настройте GEMINI_API_KEY.`
          : `Unable to access AI core: ${err.message}. Please configure GEMINI_API_KEY.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const sampleQuestions = [
    { 
      label: language === "ru" ? "Проверить эмоциональные ошибки" : "Audit my emotional mistakes", 
      prompt: "Summarize the cognitive biases or psychological mistakes in my last 10 trade logs." 
    },
    { 
      label: language === "ru" ? "У какой стратегии лучший перевес?" : "Which strategy has the best edge?", 
      prompt: "Analyze my playbook strategies and identify which setup is exhibiting the strongest expectancy." 
    },
    { 
      label: language === "ru" ? "Проверить лимиты риска" : "Review my risk guidelines", 
      prompt: "Look at my daily loss limits and trade size. Give me an optimization plan based on historical volatility." 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Chat header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0c0c0e] p-4 border border-zinc-800/50 rounded-xl">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
            {t("ac_title")}
          </h3>
          <p className="text-xs text-zinc-400">{t("ac_subtitle")}</p>
        </div>

        {/* Coach Role Selector */}
        <div className="flex bg-[#09090b] border border-zinc-800/50 p-1 rounded-lg">
          <button
            onClick={() => setCoachRole("auditor")}
            className={`px-3 py-1 text-[10px] font-mono rounded font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
              coachRole === "auditor" ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ShieldAlert className="w-3 h-3" /> {language === "ru" ? "Аудитор" : "Auditor"}
          </button>
          <button
            onClick={() => setCoachRole("strategist")}
            className={`px-3 py-1 text-[10px] font-mono rounded font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
              coachRole === "strategist" ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <BrainCircuit className="w-3 h-3" /> {language === "ru" ? "Стратег" : "Strategist"}
          </button>
          <button
            onClick={() => setCoachRole("risk")}
            className={`px-3 py-1 text-[10px] font-mono rounded font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
              coachRole === "risk" ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Award className="w-3 h-3" /> {language === "ru" ? "Риск-менеджер" : "Risk Assessor"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Starter Questions (1 Col) */}
        <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl p-5 space-y-4 h-max">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-800/30 pb-2">
            {language === "ru" ? "Предложенные аудиты" : "Suggested Audits"}
          </h4>
          <div className="space-y-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.prompt)}
                className="w-full text-left p-3 rounded-lg bg-[#09090b] hover:bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 transition-all text-xs text-zinc-300 leading-relaxed block cursor-pointer"
              >
                <span className="font-semibold text-blue-400 block mb-1">{language === "ru" ? "Шаблон" : "Preset"} #{idx + 1}</span>
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Chat Workspace (3 Cols) */}
        <div className="lg:col-span-3 bg-[#0c0c0e] border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col h-[520px]">
          {/* Chat Window header */}
          <div className="bg-[#09090b] border-b border-zinc-800/50 p-3 px-5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-zinc-300">
                {coachRole === "auditor" && (language === "ru" ? "ДИСЦИПЛИНАРНЫЙ АУДИТОР - АКТИВЕН" : "DISCIPLINE AUDITOR - ACTIVE")}
                {coachRole === "strategist" && (language === "ru" ? "КОЛИЧЕСТВЕННЫЙ СТРАТЕГ - АКТИВЕН" : "QUANTITATIVE STRATEGIST - ACTIVE")}
                {coachRole === "risk" && (language === "ru" ? "КОНТРОЛЬ РИСКОВ - АКТИВЕН" : "RISK COMPLIANCE ADVISOR - ACTIVE")}
              </span>
            </div>
            <button
              onClick={() => setMessages([
                {
                  id: "init",
                  sender: "coach",
                  text: language === "ru" ? "Контекст чата очищен. Готов к следующему вопросу." : "Chat context cleared. Ready for next prompt.",
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                }
              ])}
              className="text-zinc-500 hover:text-zinc-300 font-mono text-[10px] flex items-center gap-1 bg-[#09090b] p-1 px-2 rounded border border-zinc-800/50 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> {language === "ru" ? "Очистить чат" : "Clear Chat"}
            </button>
          </div>

          {/* Messages block */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => {
              const isCoach = m.sender === "coach";
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${
                    isCoach ? "self-start" : "self-end ml-auto flex-row-reverse"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                    isCoach ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  }`}>
                    {isCoach ? "🤖" : (language === "ru" ? "Я" : "Me")}
                  </div>

                  <div className="space-y-1">
                    <div className={`p-3.5 rounded-xl border leading-relaxed text-xs ${
                      isCoach
                        ? "bg-[#09090b] border-zinc-800/50 text-zinc-300"
                        : "bg-blue-950/20 border-blue-500/20 text-zinc-100"
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 block text-right">
                      {m.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-3 max-w-[80%] self-start">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  🤖
                </div>
                <div className="bg-[#09090b] border border-zinc-800/50 p-3.5 rounded-xl text-xs text-zinc-500 font-mono animate-pulse">
                  {language === "ru" ? "Анализирую торговые показатели и формулирую рекомендации..." : "Analyzing trading metrics and formulating strategy directives..."}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input text form */}
          <div className="p-4 bg-[#09090b] border-t border-zinc-800/50 flex gap-2">
            <input
              type="text"
              placeholder={t("ac_chat_placeholder")}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              className="bg-[#09090b] border border-zinc-800/50 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 px-4 py-2.5 flex-1"
            />
            <button
              onClick={() => handleSend()}
              disabled={isSending}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
