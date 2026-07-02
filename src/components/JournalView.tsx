import React, { useState } from "react";
import { Trade, AssetType, DirectionType, EmotionType } from "../types";
import { Plus, Download, Upload, Search, Filter, Edit2, Trash2, Calendar, FileSpreadsheet, ArrowUpRight, ArrowDownRight, Star, Image as ImageIcon, RefreshCw, CircleAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { calculateTradePnL, calculateRealizedRR } from "../utils/tradingUtils";
import { useLanguage } from "../LanguageContext";

interface JournalViewProps {
  trades: Trade[];
  onAddTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onSelectTrade: (trade: Trade) => void;
  onImportTrades: (imported: Trade[]) => void;
}

export default function JournalView({ trades, onAddTrade, onDeleteTrade, onSelectTrade, onImportTrades }: JournalViewProps) {
  const { t } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterAsset, setFilterAsset] = useState<string>("All");
  const [filterDirection, setFilterDirection] = useState<string>("All");
  const [filterStrategy, setFilterStrategy] = useState<string>("All");
  const [filterEmotion, setFilterEmotion] = useState<string>("All");

  // Add Trade Form State
  const [formData, setFormData] = useState({
    ticker: "",
    assetType: "Stocks" as AssetType,
    direction: "Long" as DirectionType,
    entryPrice: "",
    exitPrice: "",
    positionSize: "",
    stopLoss: "",
    takeProfit: "",
    entryTime: new Date().toISOString().slice(0, 16),
    exitTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    fees: "0",
    commission: "0",
    broker: "Interactive Brokers",
    strategy: "VWAP Pullback Play",
    setup: "",
    tags: "",
    rating: 3,
    confidence: 3,
    emotionBefore: "Calm" as EmotionType,
    emotionAfter: "Calm" as EmotionType,
    marketContext: "",
    notes: "",
    mistakes: [] as string[],
    lessons: "",
    tradingStyle: "Intraday" as "Intraday" | "Swing",
    screenshotUrl: "",
  });

  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, screenshotUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, screenshotUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Unique lists for filters
  const uniqueStrategies = Array.from(new Set(trades.map((t) => t.strategy).filter(Boolean)));
  const uniqueEmotions = ["Calm", "Greedy", "Fearful", "Anxious", "Excited", "Disciplined", "FOMO", "Frustrated"];

  // Mistakes options
  const mistakeOptions = ["Impulsive Entries", "Rule Breaking", "Overtrading", "Revenge Trading", "Early Exit", "Late Exit"];

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (mistake: string) => {
    setFormData((prev) => {
      const alreadyChecked = prev.mistakes.includes(mistake);
      return {
        ...prev,
        mistakes: alreadyChecked
          ? prev.mistakes.filter((m) => m !== mistake)
          : [...prev.mistakes, mistake],
      };
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ticker || !formData.entryPrice || !formData.exitPrice || !formData.positionSize) {
      alert("Please fill in ticker, entry price, exit price, and size.");
      return;
    }

    const trade: Trade = {
      id: "trade_" + Date.now(),
      ticker: formData.ticker.toUpperCase(),
      assetType: formData.assetType,
      direction: formData.direction,
      entryPrice: parseFloat(formData.entryPrice),
      exitPrice: parseFloat(formData.exitPrice),
      positionSize: parseFloat(formData.positionSize),
      stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
      takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined,
      entryTime: formData.entryTime,
      exitTime: formData.exitTime,
      fees: parseFloat(formData.fees) || 0,
      commission: parseFloat(formData.commission) || 0,
      broker: formData.broker,
      strategy: formData.strategy,
      setup: formData.setup || "Manual Position logged",
      tags: formData.tags ? formData.tags.split(",").map((tVal) => tVal.trim()) : [],
      rating: formData.rating,
      confidence: formData.confidence,
      emotionBefore: formData.emotionBefore,
      emotionAfter: formData.emotionAfter,
      marketContext: formData.marketContext,
      notes: formData.notes,
      mistakes: formData.mistakes,
      lessons: formData.lessons ? [formData.lessons] : [],
      tradingStyle: formData.tradingStyle,
      screenshotUrl: formData.screenshotUrl || undefined,
    };

    trade.pnl = calculateTradePnL(trade);
    trade.rr = calculateRealizedRR(trade);

    onAddTrade(trade);
    setIsAddModalOpen(false);
    // Reset form
    setFormData({
      ticker: "",
      assetType: "Stocks",
      direction: "Long",
      entryPrice: "",
      exitPrice: "",
      positionSize: "",
      stopLoss: "",
      takeProfit: "",
      entryTime: new Date().toISOString().slice(0, 16),
      exitTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      fees: "0",
      commission: "0",
      broker: "Interactive Brokers",
      strategy: "VWAP Pullback Play",
      setup: "",
      tags: "",
      rating: 3,
      confidence: 3,
      emotionBefore: "Calm",
      emotionAfter: "Calm",
      marketContext: "",
      notes: "",
      mistakes: [],
      lessons: "",
      tradingStyle: "Intraday",
      screenshotUrl: "",
    });
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (trades.length === 0) return;
    
    const headers = ["ID", "Ticker", "Asset", "Direction", "EntryPrice", "ExitPrice", "Size", "PnL", "Strategy", "Setup", "Date", "Emotion Before", "Emotion After", "Broker"];
    const rows = trades.map((tItem) => [
      tItem.id,
      tItem.ticker,
      tItem.assetType,
      tItem.direction,
      tItem.entryPrice,
      tItem.exitPrice,
      tItem.positionSize,
      (tItem.pnl || 0).toFixed(2),
      tItem.strategy,
      tItem.setup.replace(/"/g, '""'),
      tItem.entryTime,
      tItem.emotionBefore,
      tItem.emotionAfter,
      tItem.broker,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ZellaTrader_Journal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Broker CSV / File Importer Logic
  const [importingState, setImportingState] = useState<"idle" | "parsing" | "done">("idle");
  const [parsedTrades, setParsedTrades] = useState<Trade[]>([]);
  const [importFileName, setImportFileName] = useState<string>("");
  const [importError, setImportError] = useState<string>("");

  // Tradovate Direct Connection in Modal State
  const [importMethod, setImportMethod] = useState<"file" | "broker">("file");
  const [modalBrokerUsername, setModalBrokerUsername] = useState("");
  const [modalBrokerPassword, setModalBrokerPassword] = useState("");
  const [modalBrokerEnv, setModalBrokerEnv] = useState("Demo");
  const [modalBrokerSyncAnalysis, setModalBrokerSyncAnalysis] = useState("");

  const parseBrokerCSV = (text: string): Trade[] => {
    const rawLines = text.split(/\r?\n/);
    if (rawLines.length < 2) {
      throw new Error("File is too short. It must contain at least a header row and a data row.");
    }

    // Auto-detect separator
    let separator = ",";
    const firstLine = rawLines[0];
    if (firstLine.includes(";")) {
      separator = ";";
    } else if (firstLine.includes("\t")) {
      separator = "\t";
    }

    // Simple CSV row parser (handles quotes and separators correctly)
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === separator && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(rawLines[0]).map(h => h.toLowerCase().replace(/["']/g, ""));
    
    // Find column indexes
    const findIndex = (keywords: string[]): number => {
      return headers.findIndex(header => 
        keywords.some(kw => header.includes(kw))
      );
    };

    const tickerIdx = findIndex(["contract", "ticker", "symbol", "instrument", "asset", "pair", "тикер", "актив", "символ", "инструмент", "security", "контракт"]);
    const directionIdx = findIndex(["direction", "side", "type", "action", "buy/sell", "b/s", "b / s", "направление", "тип", "сторона", "сделка", "position", "side"]);
    const entryPriceIdx = findIndex(["entry price", "buy price", "entry_price", "avg entry", "open price", "цена входа", "вход", "цена покупки", "price", "цена", "fill price", "avg price", "avgfillprice", "execution price"]);
    const exitPriceIdx = findIndex(["exit price", "sell price", "exit_price", "avg exit", "close price", "цена выхода", "выход", "цена продажи"]);
    const sizeIdx = findIndex(["position size", "size", "quantity", "qty", "volume", "amount", "shares", "contracts", "размер", "объем", "количество", "filled qty", "filled quantity"]);
    const stopLossIdx = findIndex(["stop loss", "sl", "stop", "стоп-лосс", "стоп"]);
    const takeProfitIdx = findIndex(["take profit", "tp", "limit", "тейк-профит", "тейк"]);
    const entryTimeIdx = findIndex(["entry time", "entry date", "open date", "open time", "date", "time", "время входа", "дата входа", "дата", "время", "timestamp", "trade date", "fill time", "execution time"]);
    const exitTimeIdx = findIndex(["exit time", "exit date", "close date", "close time", "время выхода", "дата выхода"]);
    const feesIdx = findIndex(["fees", "fee", "комиссия брокера", "комиссия", "costs", "tax"]);
    const commissionIdx = findIndex(["commission", "commissions"]);
    const brokerIdx = findIndex(["broker", "brokerage", "брокер", "platform"]);
    const strategyIdx = findIndex(["strategy", "стратегия", "method", "play"]);
    const notesIdx = findIndex(["notes", "reflections", "setup", "comment", "description", "заметки", "комментарий", "описание"]);

    const parseNum = (val: string | undefined, fallback: number): number => {
      if (!val) return fallback;
      const cleaned = val.replace(/[^0-9.-]/g, "");
      const num = parseFloat(cleaned);
      return isNaN(num) ? fallback : num;
    };

    // Determine parser mode: Closed Trades mode (per-row) OR Execution Fills mode (multi-row pairing)
    // If there is NO exitPriceIdx or we detect that it's a fill/order file, we use Execution Fills mode.
    const isExecutionFillsMode = exitPriceIdx === -1 || headers.some(h => h.includes("fill price") || h.includes("avg price") || h.includes("execution price") || h.includes("orders") || h.includes("trades") || h.includes("fills"));

    if (isExecutionFillsMode) {
      // 1. Parse each line as an individual execution fill
      interface RawFill {
        ticker: string;
        side: "BUY" | "SELL";
        price: number;
        qty: number;
        time: string;
        fees: number;
        broker: string;
        strategy: string;
        setup: string;
      }

      const fills: RawFill[] = [];

      for (let i = 1; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        const cells = parseLine(line);
        if (cells.length < 2) continue;

        const rawTicker = tickerIdx !== -1 && cells[tickerIdx] ? cells[tickerIdx] : "";
        if (!rawTicker) continue;

        const cleanTicker = rawTicker.replace(/["']/g, "").toUpperCase();
        if (cleanTicker === "TICKER" || cleanTicker === "SYMBOL" || cleanTicker === "INSTRUMENT" || cleanTicker === "CONTRACT") continue;

        // Check if direction is Buy or Sell
        let side: "BUY" | "SELL" = "BUY";
        if (directionIdx !== -1 && cells[directionIdx]) {
          const dirVal = cells[directionIdx].toLowerCase();
          if (dirVal.includes("short") || dirVal.includes("sell") || dirVal.includes("шорт") || dirVal.includes("продажа") || dirVal.startsWith("s") || dirVal.startsWith("п")) {
            side = "SELL";
          }
        }

        const price = parseNum(entryPriceIdx !== -1 ? cells[entryPriceIdx] : undefined, 100);
        const qty = parseNum(sizeIdx !== -1 ? cells[sizeIdx] : undefined, 1);
        const fees = feesIdx !== -1 ? parseNum(cells[feesIdx], 0) : 0;

        let time = new Date().toISOString();
        if (entryTimeIdx !== -1 && cells[entryTimeIdx]) {
          const tStr = cells[entryTimeIdx].replace(/["']/g, "");
          const d = new Date(tStr);
          if (!isNaN(d.getTime())) {
            time = d.toISOString();
          }
        }

        const broker = brokerIdx !== -1 && cells[brokerIdx] ? cells[brokerIdx].replace(/["']/g, "") : "Tradovate";
        const strategy = strategyIdx !== -1 && cells[strategyIdx] ? cells[strategyIdx].replace(/["']/g, "") : "VWAP Pullback Play";
        const setup = notesIdx !== -1 && cells[notesIdx] ? cells[notesIdx].replace(/["']/g, "") : "Broker execution log";

        fills.push({
          ticker: cleanTicker,
          side,
          price,
          qty,
          time,
          fees,
          broker,
          strategy,
          setup
        });
      }

      if (fills.length === 0) {
        throw new Error("Could not parse any trade fills from the file. Please verify column headers.");
      }

      // Sort fills chronologically
      fills.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      // Group fills by ticker
      const fillsByTicker: { [ticker: string]: RawFill[] } = {};
      for (const fill of fills) {
        if (!fillsByTicker[fill.ticker]) {
          fillsByTicker[fill.ticker] = [];
        }
        fillsByTicker[fill.ticker].push(fill);
      }

      const completedTrades: Trade[] = [];

      // Run FIFO pairing algorithm for each ticker
      for (const ticker in fillsByTicker) {
        const tickerFills = fillsByTicker[ticker];
        
        interface OpenLot {
          qty: number;
          price: number;
          time: string;
          fees: number;
          broker: string;
          strategy: string;
          setup: string;
        }

        const openLots: OpenLot[] = [];
        let currentSide: "BUY" | "SELL" | null = null;

        for (const fill of tickerFills) {
          if (currentSide === null || currentSide === fill.side) {
            // Opening or adding
            currentSide = fill.side;
            openLots.push({
              qty: fill.qty,
              price: fill.price,
              time: fill.time,
              fees: fill.fees,
              broker: fill.broker,
              strategy: fill.strategy,
              setup: fill.setup
            });
          } else {
            // Closing or reducing
            let fillQtyRemaining = fill.qty;
            const closingTime = fill.time;
            const closingPrice = fill.price;
            const closingFees = fill.fees;

            while (fillQtyRemaining > 0 && openLots.length > 0) {
              const oldestLot = openLots[0];
              const matchQty = Math.min(fillQtyRemaining, oldestLot.qty);

              // Pro-rate fees
              const entryFeesProrated = oldestLot.fees * (matchQty / oldestLot.qty);
              const exitFeesProrated = closingFees * (matchQty / fill.qty);

              let assetType: AssetType = "Stocks";
              if (ticker.includes("USD") || ticker.includes("USDT") || ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA"].some(c => ticker.includes(c))) {
                assetType = "Crypto";
              } else if (ticker.length === 6 && ["EUR", "GBP", "JPY", "AUD", "CAD"].some(f => ticker.startsWith(f))) {
                assetType = "Forex";
              } else if (ticker.startsWith("NQ") || ticker.startsWith("ES") || ticker.startsWith("GC") || ticker.startsWith("CL") || ticker.length === 5 || ticker.length === 4) {
                assetType = "Futures";
              }

              const newTrade: Trade = {
                id: "import_fill_" + Math.random().toString(36).substring(2, 11),
                ticker,
                assetType,
                direction: currentSide === "BUY" ? "Long" : "Short",
                entryPrice: oldestLot.price,
                exitPrice: closingPrice,
                positionSize: matchQty,
                entryTime: oldestLot.time,
                exitTime: closingTime,
                fees: entryFeesProrated + exitFeesProrated,
                commission: 0,
                broker: oldestLot.broker,
                strategy: oldestLot.strategy,
                setup: oldestLot.setup,
                tags: ["imported"],
                rating: 4,
                confidence: 3,
                emotionBefore: "Calm",
                emotionAfter: "Disciplined",
                marketContext: "Imported from " + oldestLot.broker + " fills",
                notes: "Matched fill. Execution: " + currentSide + " → " + fill.side,
                mistakes: [],
                lessons: ["Position completed via FIFO matching."],
              };

              newTrade.pnl = calculateTradePnL(newTrade);
              newTrade.rr = calculateRealizedRR(newTrade);

              completedTrades.push(newTrade);

              oldestLot.qty -= matchQty;
              fillQtyRemaining -= matchQty;

              if (oldestLot.qty <= 0) {
                openLots.shift();
              }
            }

            if (fillQtyRemaining > 0) {
              // Position reversed
              currentSide = fill.side;
              openLots.push({
                qty: fillQtyRemaining,
                price: closingPrice,
                time: closingTime,
                fees: closingFees,
                broker: fill.broker,
                strategy: fill.strategy,
                setup: fill.setup
              });
            }

            if (openLots.length === 0) {
              currentSide = null;
            }
          }
        }
      }

      // Group/Combine matched segments with the exact same exit time into unified trades
      // This ensures that multiple partial match fills at the exact same time are represented as a single clean trade!
      const aggregatedTrades: Trade[] = [];
      const visitedGroups = new Set<string>();

      for (let i = 0; i < completedTrades.length; i++) {
        const trade = completedTrades[i];
        const key = `${trade.ticker}_${trade.direction}_${trade.exitTime}`;
        if (visitedGroups.has(key)) continue;

        // Find all matching trades
        const group = completedTrades.filter(t => `${t.ticker}_${t.direction}_${t.exitTime}` === key);
        if (group.length === 1) {
          aggregatedTrades.push(trade);
        } else {
          // Aggregate them
          const totalSize = group.reduce((sum, t) => sum + t.positionSize, 0);
          const weightedEntryPrice = group.reduce((sum, t) => sum + t.entryPrice * t.positionSize, 0) / totalSize;
          const weightedExitPrice = group.reduce((sum, t) => sum + t.exitPrice * t.positionSize, 0) / totalSize;
          const totalFees = group.reduce((sum, t) => sum + (t.fees || 0), 0);
          const firstEntryTime = group.reduce((min, t) => t.entryTime < min ? t.entryTime : min, group[0].entryTime);

          const combinedTrade: Trade = {
            ...trade,
            id: "import_combined_" + Math.random().toString(36).substring(2, 11),
            positionSize: totalSize,
            entryPrice: weightedEntryPrice,
            exitPrice: weightedExitPrice,
            fees: totalFees,
            entryTime: firstEntryTime,
            notes: `Aggregated Trade (${group.length} partial executions paired chronologically).`,
          };

          combinedTrade.pnl = calculateTradePnL(combinedTrade);
          combinedTrade.rr = calculateRealizedRR(combinedTrade);

          aggregatedTrades.push(combinedTrade);
        }
        visitedGroups.add(key);
      }

      return aggregatedTrades;
    } else {
      // 2. Closed Trades mode (per-row approach)
      const importedTrades: Trade[] = [];

      for (let i = 1; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        const cells = parseLine(line);
        if (cells.length < 2) continue;

        const rawTicker = tickerIdx !== -1 && cells[tickerIdx] ? cells[tickerIdx] : "";
        if (!rawTicker) continue;

        const cleanTicker = rawTicker.replace(/["']/g, "").toUpperCase();
        if (cleanTicker === "TICKER" || cleanTicker === "SYMBOL" || cleanTicker === "INSTRUMENT") continue;

        let direction: "Long" | "Short" = "Long";
        if (directionIdx !== -1 && cells[directionIdx]) {
          const dirVal = cells[directionIdx].toLowerCase();
          if (dirVal.includes("short") || dirVal.includes("sell") || dirVal.includes("шорт") || dirVal.includes("продажа") || dirVal.startsWith("s") || dirVal.startsWith("п")) {
            direction = "Short";
          }
        }

        const entryPrice = parseNum(entryPriceIdx !== -1 ? cells[entryPriceIdx] : undefined, 100);
        const exitPrice = exitPriceIdx !== -1 && cells[exitPriceIdx] 
          ? parseNum(cells[exitPriceIdx], entryPrice) 
          : entryPrice * (direction === "Long" ? 1.02 : 0.98);
        const positionSize = parseNum(sizeIdx !== -1 ? cells[sizeIdx] : undefined, 10);
        const stopLoss = stopLossIdx !== -1 && cells[stopLossIdx] ? parseNum(cells[stopLossIdx], 0) : undefined;
        const takeProfit = takeProfitIdx !== -1 && cells[takeProfitIdx] ? parseNum(cells[takeProfitIdx], 0) : undefined;
        
        const fees = feesIdx !== -1 ? parseNum(cells[feesIdx], 0) : 0;
        const commission = commissionIdx !== -1 ? parseNum(cells[commissionIdx], 0) : 0;

        let entryTime = new Date().toISOString();
        if (entryTimeIdx !== -1 && cells[entryTimeIdx]) {
          const tStr = cells[entryTimeIdx].replace(/["']/g, "");
          const d = new Date(tStr);
          if (!isNaN(d.getTime())) {
            entryTime = d.toISOString();
          }
        }

        let exitTime = new Date(new Date(entryTime).getTime() + 45 * 60 * 1000).toISOString();
        if (exitTimeIdx !== -1 && cells[exitTimeIdx]) {
          const tStr = cells[exitTimeIdx].replace(/["']/g, "");
          const d = new Date(tStr);
          if (!isNaN(d.getTime())) {
            exitTime = d.toISOString();
          }
        }

        const broker = brokerIdx !== -1 && cells[brokerIdx] ? cells[brokerIdx].replace(/["']/g, "") : "Imported File";
        const strategy = strategyIdx !== -1 && cells[strategyIdx] ? cells[strategyIdx].replace(/["']/g, "") : "VWAP Pullback Play";
        const setup = notesIdx !== -1 && cells[notesIdx] ? cells[notesIdx].replace(/["']/g, "") : "Broker execution log";

        let assetType: AssetType = "Stocks";
        if (cleanTicker.includes("USD") || cleanTicker.includes("USDT") || ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA"].some(c => cleanTicker.includes(c))) {
          assetType = "Crypto";
        } else if (cleanTicker.length === 6 && ["EUR", "GBP", "JPY", "AUD", "CAD"].some(f => cleanTicker.startsWith(f))) {
          assetType = "Forex";
        } else if (cleanTicker.startsWith("NQ") || cleanTicker.startsWith("ES") || cleanTicker.startsWith("GC") || cleanTicker.startsWith("CL")) {
          assetType = "Futures";
        }

        const trade: Trade = {
          id: "import_csv_" + Math.random().toString(36).substring(2, 11),
          ticker: cleanTicker,
          assetType,
          direction,
          entryPrice,
          exitPrice,
          positionSize,
          stopLoss: stopLoss || undefined,
          takeProfit: takeProfit || undefined,
          entryTime,
          exitTime,
          fees,
          commission,
          broker,
          strategy,
          setup,
          tags: ["imported"],
          rating: 4,
          confidence: 3,
          emotionBefore: "Calm",
          emotionAfter: "Disciplined",
          marketContext: "Imported from file",
          notes: "Trade imported via brokerage file upload.",
          mistakes: [],
          lessons: ["Import completed."],
        };

        trade.pnl = calculateTradePnL(trade);
        trade.rr = calculateRealizedRR(trade);

        importedTrades.push(trade);
      }

      return importedTrades;
    }
  };

  const processCsvFile = (file: File) => {
    setImportFileName(file.name);
    setImportError("");
    setImportingState("parsing");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          throw new Error("File content is empty.");
        }
        const tradesParsed = parseBrokerCSV(text);
        if (tradesParsed.length === 0) {
          throw new Error("No trades could be recognized. Please make sure the file contains headers such as Symbol, Price, and Volume.");
        }
        setParsedTrades(tradesParsed);
        setImportingState("idle");
      } catch (err: any) {
        setImportError(err.message || "Failed to parse CSV file.");
        setImportingState("idle");
      }
    };
    reader.onerror = () => {
      setImportError("Error reading file.");
      setImportingState("idle");
    };
    reader.readAsText(file);
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCsvFile(file);
    }
  };

  const handleCsvDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processCsvFile(file);
    }
  };

  const handleConfirmRealImport = () => {
    if (parsedTrades.length === 0) return;
    setImportingState("parsing");
    setTimeout(() => {
      onImportTrades(parsedTrades);
      setImportingState("done");
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportingState("idle");
        setParsedTrades([]);
        setImportFileName("");
      }, 1200);
    }, 1000);
  };

  const handleClearImport = () => {
    setParsedTrades([]);
    setImportFileName("");
    setImportError("");
    setImportingState("idle");
    setModalBrokerSyncAnalysis("");
  };

  const handleDirectTradovateSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    setModalBrokerSyncAnalysis("");
    setImportingState("parsing");

    try {
      const res = await fetch("/api/integrations/tradovate/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: modalBrokerUsername,
          password: modalBrokerPassword,
          environment: modalBrokerEnv,
          language: localStorage.getItem("zellatrader_lang") || "en"
        })
      });

      if (!res.ok) {
        throw new Error("Tradovate API connection failed. Please check credentials or try again later.");
      }

      const data = await res.json();
      if (data.success) {
        setParsedTrades(data.trades);
        setModalBrokerSyncAnalysis(data.aiAnalysis);
        setImportFileName("Tradovate Sync (Live)");
        setImportingState("idle");
      } else {
        throw new Error(data.error || "Failed to load trades from Tradovate broker.");
      }
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || "Broker port authentication failed.");
      setImportingState("idle");
    }
  };

  const handleImportMock = () => {
    setImportingState("parsing");
    setTimeout(() => {
      const mockParsedTrades: Trade[] = [
        {
          id: "import_" + Math.random(),
          ticker: "COIN",
          assetType: "Stocks",
          direction: "Long",
          entryPrice: 220.4,
          exitPrice: 228.5,
          positionSize: 50,
          stopLoss: 215.0,
          takeProfit: 235.0,
          entryTime: "2026-06-28T14:15:00Z",
          exitTime: "2026-06-28T15:30:00Z",
          fees: 2.5,
          commission: 1.0,
          broker: "Tradovate",
          strategy: "VWAP Pullback Play",
          setup: "Institutional breakout restrike following heavy volume open",
          tags: ["imported", "crypto-proxy"],
          rating: 4,
          confidence: 4,
          emotionBefore: "Disciplined",
          emotionAfter: "Calm",
          marketContext: "Bitcoin surging, COIN highly correlated leading equity markets",
          notes: "Excellent CSV parsed trade.",
          mistakes: [],
          lessons: ["Import mappings successful."],
        },
        {
          id: "import_" + Math.random(),
          ticker: "SOLUSD",
          assetType: "Crypto",
          direction: "Short",
          entryPrice: 142.5,
          exitPrice: 139.1,
          positionSize: 200,
          stopLoss: 145.0,
          takeProfit: 135.0,
          entryTime: "2026-06-27T18:00:00Z",
          exitTime: "2026-06-27T20:15:00Z",
          fees: 4.0,
          commission: 0.0,
          broker: "Binance Pro",
          strategy: "OU Mean Reversion",
          setup: "Short boundary trigger at local resistance block",
          tags: ["imported", "crypto"],
          rating: 5,
          confidence: 3,
          emotionBefore: "Calm",
          emotionAfter: "Disciplined",
          marketContext: "Crypto market wide liquidation pressure",
          notes: "Imported via Binance Excel format sheet.",
          mistakes: [],
          lessons: ["Order execution matched limits perfectly."],
        }
      ];

      mockParsedTrades.forEach((tVal) => {
        tVal.pnl = calculateTradePnL(tVal);
        tVal.rr = calculateRealizedRR(tVal);
      });

      onImportTrades(mockParsedTrades);
      setImportingState("done");
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportingState("idle");
      }, 1000);
    }, 1500);
  };

  // Filter & Search Logic
  const filteredTrades = trades.filter((tVal) => {
    const matchesSearch =
      tVal.ticker.toLowerCase().includes(search.toLowerCase()) ||
      tVal.strategy.toLowerCase().includes(search.toLowerCase()) ||
      tVal.setup.toLowerCase().includes(search.toLowerCase());

    const matchesAsset = filterAsset === "All" || tVal.assetType === filterAsset;
    const matchesDirection = filterDirection === "All" || tVal.direction === filterDirection;
    const matchesStrategy = filterStrategy === "All" || tVal.strategy === filterStrategy;
    const matchesEmotion = filterEmotion === "All" || tVal.emotionBefore === filterEmotion || tVal.emotionAfter === filterEmotion;

    return matchesSearch && matchesAsset && matchesDirection && matchesStrategy && matchesEmotion;
  });

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0c0c0e] p-4 border border-zinc-800/50 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder={t("jr_search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800/50 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        
        {/* Dynamic Controls */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> {t("jr_import")}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> {t("jr_export")}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-blue-500/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {t("jr_add_trade")}
          </button>
        </div>
      </div>

      {/* Multivariant Filtering System */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0c0c0e] border border-zinc-800/50 p-3.5 rounded-xl">
        <div>
          <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1">{t("jr_asset_class")}</label>
          <select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800/50 text-xs rounded p-1 text-zinc-300 focus:outline-none focus:border-zinc-700"
          >
            <option value="All">{t("jr_all_assets")}</option>
            <option value="Stocks">{t("jr_stocks")}</option>
            <option value="Crypto">{t("jr_crypto")}</option>
            <option value="Forex">{t("jr_forex")}</option>
            <option value="Options">{t("jr_options")}</option>
            <option value="Futures">{t("jr_futures")}</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1">{t("jr_direction")}</label>
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800/50 text-xs rounded p-1 text-zinc-300 focus:outline-none focus:border-zinc-700"
          >
            <option value="All">{t("jr_all_directions")}</option>
            <option value="Long">{t("jr_long")}</option>
            <option value="Short">{t("jr_short")}</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1">{t("jr_strategy_playbook")}</label>
          <select
            value={filterStrategy}
            onChange={(e) => setFilterStrategy(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800/50 text-xs rounded p-1 text-zinc-300 focus:outline-none focus:border-zinc-700"
          >
            <option value="All">{t("jr_all_strategies")}</option>
            {uniqueStrategies.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1">{t("jr_emotion_before")}</label>
          <select
            value={filterEmotion}
            onChange={(e) => setFilterEmotion(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800/50 text-xs rounded p-1 text-zinc-300 focus:outline-none focus:border-zinc-700"
          >
            <option value="All">{t("jr_all_emotions")}</option>
            {uniqueEmotions.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Trades Table */}
      <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-[#0c0c0e] font-mono text-[10px] text-zinc-500 tracking-wider">
                <th className="py-3 px-4">{t("jr_symbol_type")}</th>
                <th className="py-3 px-4">{t("jr_dir")}</th>
                <th className="py-3 px-4">{t("jr_entry_exit")}</th>
                <th className="py-3 px-4">{t("jr_size")}</th>
                <th className="py-3 px-4 text-right">{t("jr_net_pnl")}</th>
                <th className="py-3 px-4 text-right">{t("jr_rr")}</th>
                <th className="py-3 px-4">{t("jr_strategy")}</th>
                <th className="py-3 px-4">{t("jr_rating")}</th>
                <th className="py-3 px-4 text-center">{t("jr_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredTrades.length > 0 ? (
                filteredTrades.map((tItem) => {
                  const pnl = tItem.pnl ?? calculateTradePnL(tItem);
                  const achievedRR = tItem.rr ?? calculateRealizedRR(tItem);
                  
                  return (
                    <tr
                      key={tItem.id}
                      className="text-xs hover:bg-zinc-900/40 transition-all border-b border-zinc-800/50 group"
                    >
                      {/* Symbol */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {tItem.screenshotUrl && (
                            <div 
                              onClick={() => setSelectedScreenshot(tItem.screenshotUrl || null)}
                              className="w-9 h-9 rounded-lg border border-zinc-800 hover:border-sky-500 overflow-hidden shrink-0 cursor-zoom-in transition-all relative group bg-zinc-950"
                              title={t("jr_screenshot")}
                            >
                              <img 
                                src={tItem.screenshotUrl} 
                                alt="thumb" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[8px] font-mono font-bold text-sky-400">VIEW</span>
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-100">{tItem.ticker}</span>
                              <span className="text-[9px] text-zinc-500 font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800/60">
                                {tItem.assetType}
                              </span>
                              {tItem.tradingStyle && (
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                  tItem.tradingStyle === "Intraday" 
                                    ? "bg-cyan-950/40 text-cyan-400 border-cyan-800/40" 
                                    : "bg-purple-950/40 text-purple-400 border-purple-800/40"
                                }`}>
                                  {tItem.tradingStyle === "Intraday" ? (t("jr_intraday").includes("Day") ? "Intraday" : "Внутри дня") : (t("jr_swing").includes("Swing") ? "Swing" : "Свинг")}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">
                              {new Date(tItem.entryTime).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Direction */}
                      <td className="py-3 px-4 font-semibold">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-mono text-[10px] ${
                          tItem.direction === "Long" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {tItem.direction === "Long" ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {tItem.direction === "Long" ? t("jr_long") : t("jr_short")}
                        </span>
                      </td>

                      {/* Entry / Exit */}
                      <td className="py-3 px-4 font-mono">
                        <div className="text-zinc-200">${tItem.entryPrice.toLocaleString()}</div>
                        <div className="text-zinc-500 text-[10px]">${tItem.exitPrice.toLocaleString()}</div>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-4 font-mono text-zinc-300">
                        {tItem.positionSize.toLocaleString()}
                      </td>

                      {/* Net PnL */}
                      <td className={`py-3 px-4 text-right font-mono font-bold ${
                        pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {pnl >= 0 ? "+" : ""}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* R:R */}
                      <td className="py-3 px-4 text-right font-mono text-zinc-300">
                        {achievedRR}R
                      </td>

                      {/* Strategy */}
                      <td className="py-3 px-4">
                        <span className="text-zinc-400 font-mono block max-w-[150px] truncate" title={tItem.strategy}>
                          {tItem.strategy}
                        </span>
                        {tItem.mistakes.length > 0 && (
                          <span className="text-[8px] bg-red-950/40 text-red-400 border border-red-900/30 font-mono px-1 rounded block mt-0.5 w-max">
                            {tItem.mistakes.length} error
                          </span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-4">
                        <div className="flex gap-0.5 text-amber-500">
                          {Array.from({ length: tItem.rating }).map((_, idx) => (
                            <Star key={idx} className="w-3 h-3 fill-amber-500 shrink-0" />
                          ))}
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                          {tItem.emotionBefore} ➔ {tItem.emotionAfter}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          {tItem.screenshotUrl && (
                            <button
                              onClick={() => setSelectedScreenshot(tItem.screenshotUrl || null)}
                              className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 p-1.5 rounded transition-all cursor-pointer"
                              title={t("jr_screenshot")}
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectTrade(tItem)}
                            className="bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/20 p-1.5 rounded transition-all cursor-pointer"
                            title="Replay Execution"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTrade(tItem.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-1.5 rounded transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center text-xs text-zinc-500 font-mono leading-relaxed">
                    {t("jr_no_trades")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD TRADE */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl my-8"
            >
              <div className="border-b border-zinc-800/50 px-5 py-4 flex justify-between items-center bg-[#09090b]">
                <h3 className="font-bold text-sm text-zinc-100 font-mono tracking-tight uppercase">
                  {t("jr_log_new_trade")}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-zinc-300 text-sm font-mono">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs text-zinc-300 max-h-[80vh] overflow-y-auto">
                
                {/* SECTION 1: PRIMARY DETAILS - Blue Border Card */}
                <div className="p-4 rounded-xl bg-[#0e0e11] border border-blue-500/25 border-l-4 border-l-blue-500 shadow-lg shadow-blue-500/[0.02] space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    {t("jr_log_new_trade").includes("РЕГИСТРАЦИЯ") ? "1. Основные параметры сделки" : "1. Primary Trade Parameters"}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_symbol")}</label>
                      <input
                        type="text"
                        required
                        name="ticker"
                        placeholder="e.g. NVDA, BTCUSD"
                        value={formData.ticker}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-blue-500/30 hover:border-blue-500/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded p-1.5 text-zinc-200 focus:outline-none transition-all uppercase font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_asset_class")}</label>
                      <select
                        name="assetType"
                        value={formData.assetType}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-blue-500/30 hover:border-blue-500/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded p-1.5 text-zinc-300 focus:outline-none transition-all text-xs"
                      >
                        <option value="Stocks">{t("jr_stocks")}</option>
                        <option value="Crypto">{t("jr_crypto")}</option>
                        <option value="Forex">{t("jr_forex")}</option>
                        <option value="Options">{t("jr_options")}</option>
                        <option value="Futures">{t("jr_futures")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_direction")}</label>
                      <select
                        name="direction"
                        value={formData.direction}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-blue-500/30 hover:border-blue-500/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded p-1.5 text-zinc-300 focus:outline-none transition-all text-xs font-semibold"
                      >
                        <option value="Long">{t("jr_long")}</option>
                        <option value="Short">{t("jr_short")}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 1.5: TRADING STYLE - Cyan Border Card */}
                <div className="p-4 rounded-xl bg-[#0e0e11] border border-cyan-500/25 border-l-4 border-l-cyan-500 shadow-lg shadow-cyan-500/[0.02] space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                    {t("jr_trading_style")} / {t("jr_log_new_trade").includes("РЕГИСТРАЦИЯ") ? "Стиль торговли" : "Style Selection"}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Day Trading Option Card */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tradingStyle: "Intraday" }))}
                      className={`text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${
                        formData.tradingStyle === "Intraday"
                          ? "bg-cyan-500/[0.06] border-cyan-500/80 shadow-md shadow-cyan-500/10"
                          : "bg-[#131317] border-zinc-800 hover:border-zinc-700 hover:bg-[#16161c]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-zinc-100 text-[13px] flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${formData.tradingStyle === "Intraday" ? "bg-cyan-400 animate-ping" : "bg-zinc-500"}`}></span>
                          {t("jr_intraday")}
                        </span>
                        <input
                          type="radio"
                          name="tradingStyleRadio"
                          checked={formData.tradingStyle === "Intraday"}
                          onChange={() => {}}
                          className="text-cyan-500 focus:ring-0 cursor-pointer pointer-events-none"
                        />
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        {t("jr_intraday_desc")}
                      </p>
                    </button>

                    {/* Swing Trading Option Card */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tradingStyle: "Swing" }))}
                      className={`text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${
                        formData.tradingStyle === "Swing"
                          ? "bg-purple-500/[0.06] border-purple-500/80 shadow-md shadow-purple-500/10"
                          : "bg-[#131317] border-zinc-800 hover:border-zinc-700 hover:bg-[#16161c]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-zinc-100 text-[13px] flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${formData.tradingStyle === "Swing" ? "bg-purple-400 animate-ping" : "bg-zinc-500"}`}></span>
                          {t("jr_swing")}
                        </span>
                        <input
                          type="radio"
                          name="tradingStyleRadio"
                          checked={formData.tradingStyle === "Swing"}
                          onChange={() => {}}
                          className="text-purple-500 focus:ring-0 cursor-pointer pointer-events-none"
                        />
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        {t("jr_swing_desc")}
                      </p>
                    </button>
                  </div>
                </div>

                {/* SECTION 2: PRICING & VOLUME - Emerald Border Card */}
                <div className="p-4 rounded-xl bg-[#0e0e11] border border-emerald-500/25 border-l-4 border-l-emerald-500 shadow-lg shadow-emerald-500/[0.02] space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {t("jr_log_new_trade").includes("РЕГИСТРАЦИЯ") ? "2. Параметры цены и объёма" : "2. Pricing & Position Size"}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_entry_price")}</label>
                      <input
                        type="number"
                        step="any"
                        required
                        name="entryPrice"
                        placeholder="Average Entry"
                        value={formData.entryPrice}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-emerald-500/30 hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded p-1.5 text-zinc-200 focus:outline-none transition-all text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_exit_price")}</label>
                      <input
                        type="number"
                        step="any"
                        required
                        name="exitPrice"
                        placeholder="Average Exit"
                        value={formData.exitPrice}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-emerald-500/30 hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded p-1.5 text-zinc-200 focus:outline-none transition-all text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_position_size")}</label>
                      <input
                        type="number"
                        required
                        name="positionSize"
                        placeholder="Quantity / Contracts"
                        value={formData.positionSize}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-emerald-500/30 hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded p-1.5 text-zinc-200 focus:outline-none transition-all text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: RISK TARGETS & PLAYBOOK - Amber Border Card */}
                <div className="p-4 rounded-xl bg-[#0e0e11] border border-amber-500/25 border-l-4 border-l-amber-500 shadow-lg shadow-amber-500/[0.02] space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    {t("jr_log_new_trade").includes("РЕГИСТРАЦИЯ") ? "3. Управление рисками и стратегия" : "3. Risk Targets & Playbook Strategy"}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_stop_loss")}</label>
                      <input
                        type="number"
                        step="any"
                        name="stopLoss"
                        placeholder="Risk Threshold"
                        value={formData.stopLoss}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded p-1.5 text-zinc-200 focus:outline-none transition-all text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_take_profit")}</label>
                      <input
                        type="number"
                        step="any"
                        name="takeProfit"
                        placeholder="Target Profit"
                        value={formData.takeProfit}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded p-1.5 text-zinc-200 focus:outline-none transition-all text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_strategy_playbook")}</label>
                      <select
                        name="strategy"
                        value={formData.strategy}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded p-1.5 text-zinc-300 focus:outline-none transition-all text-xs font-semibold"
                      >
                        <option value="VWAP Pullback Play">VWAP Pullback Play</option>
                        <option value="OU Mean Reversion">OU Mean Reversion</option>
                        <option value="Order Block Liquidity Grab">Order Block Liquidity Grab</option>
                        <option value="ICT Concepts Silver Bullet">ICT Concepts Silver Bullet</option>
                        <option value="Turtle Soup">Turtle Soup</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: TIMESTAMPS & BROKER - Violet Border Card */}
                <div className="p-4 rounded-xl bg-[#0e0e11] border border-violet-500/25 border-l-4 border-l-violet-500 shadow-lg shadow-violet-500/[0.02] space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                    {t("jr_log_new_trade").includes("РЕГИСТРАЦИЯ") ? "4. Временные метки и брокер" : "4. Broker Account & Timestamps"}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_entry_timestamp")}</label>
                      <input
                        type="datetime-local"
                        name="entryTime"
                        value={formData.entryTime}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-violet-500/30 hover:border-violet-500/50 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded p-1.5 text-zinc-300 focus:outline-none transition-all font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_exit_timestamp")}</label>
                      <input
                        type="datetime-local"
                        name="exitTime"
                        value={formData.exitTime}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-violet-500/30 hover:border-violet-500/50 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded p-1.5 text-zinc-300 focus:outline-none transition-all font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_broker_account")}</label>
                      <input
                        type="text"
                        name="broker"
                        placeholder="e.g. IBKR, Binance"
                        value={formData.broker}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-violet-500/30 hover:border-violet-500/50 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded p-1.5 text-zinc-200 focus:outline-none transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 5: EMOTIONS & FEES - Rose Border Card */}
                <div className="p-4 rounded-xl bg-[#0e0e11] border border-rose-500/25 border-l-4 border-l-rose-500 shadow-lg shadow-rose-500/[0.02] space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    {t("jr_log_new_trade").includes("РЕГИСТРАЦИЯ") ? "5. Эмоциональное состояние и издержки" : "5. Psychology & Transaction Costs"}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_emotion_before")}</label>
                      <select
                        name="emotionBefore"
                        value={formData.emotionBefore}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-rose-500/30 hover:border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 rounded p-1.5 text-zinc-300 focus:outline-none transition-all text-xs"
                      >
                        {uniqueEmotions.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_emotion_after")}</label>
                      <select
                        name="emotionAfter"
                        value={formData.emotionAfter}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-rose-500/30 hover:border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 rounded p-1.5 text-zinc-300 focus:outline-none transition-all text-xs"
                      >
                        {uniqueEmotions.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_slippage_fees")}</label>
                      <input
                        type="number"
                        step="any"
                        name="fees"
                        value={formData.fees}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-rose-500/30 hover:border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 rounded p-1.5 text-zinc-200 focus:outline-none transition-all text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_commissions")}</label>
                      <input
                        type="number"
                        step="any"
                        name="commission"
                        value={formData.commission}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-rose-500/30 hover:border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 rounded p-1.5 text-zinc-200 focus:outline-none transition-all text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 6: REFLECTIONS & AUDIT - Zinc Border Card */}
                <div className="p-4 rounded-xl bg-[#0e0e11] border border-zinc-700/60 border-l-4 border-l-zinc-500 shadow-lg space-y-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse"></span>
                    {t("jr_log_new_trade").includes("РЕГИСТРАЦИЯ") ? "6. Оценка, разбор и ментальные заметки" : "6. Trade Audit, Mistakes & Reflections"}
                  </div>

                  {/* Ratings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_confidence")}</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        name="confidence"
                        value={formData.confidence}
                        onChange={handleFormChange}
                        className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                        <span>Low</span>
                        <span className="text-blue-400 font-bold">High ({formData.confidence})</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_execution_rating")}</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        name="rating"
                        value={formData.rating}
                        onChange={handleFormChange}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                        <span>Poor</span>
                        <span className="text-emerald-400 font-bold">Excellent ({formData.rating})</span>
                      </div>
                    </div>
                  </div>

                  {/* Setup details */}
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{t("jr_visual_setup")}</label>
                    <input
                      type="text"
                      name="setup"
                      placeholder="e.g. 5m hammer retest, breakout consolidation block..."
                      value={formData.setup}
                      onChange={handleFormChange}
                      className="w-full bg-[#131317] border border-zinc-700/80 hover:border-zinc-600 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 rounded p-2 text-zinc-200 focus:outline-none transition-all text-xs"
                    />
                  </div>

                  {/* Mistakes Checkboxes */}
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1.5">{t("jr_psych_mistakes")}</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-[#131317] p-3 border border-zinc-700/60 rounded-lg">
                      {mistakeOptions.map((mistake) => (
                        <label key={mistake} className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100 font-mono text-[11px] transition-colors select-none">
                          <input
                            type="checkbox"
                            checked={formData.mistakes.includes(mistake)}
                            onChange={() => handleCheckboxChange(mistake)}
                            className="rounded border-zinc-700 bg-[#0e0e11] text-blue-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                          />
                          <span>{mistake}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes & Reflections & Actionable Lesson */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_notes_reflections")}</label>
                      <textarea
                        name="notes"
                        rows={3}
                        placeholder="What was the core thesis? How did you manage the stop?"
                        value={formData.notes}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-zinc-700/80 hover:border-zinc-600 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 rounded p-2 text-zinc-200 focus:outline-none transition-all text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">{t("jr_actionable_lesson")}</label>
                      <textarea
                        name="lessons"
                        rows={3}
                        placeholder="What must you correct or repeat next time?"
                        value={formData.lessons}
                        onChange={handleFormChange}
                        className="w-full bg-[#131317] border border-zinc-700/80 hover:border-zinc-600 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 rounded p-2 text-zinc-200 focus:outline-none transition-all text-xs"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">{t("jr_tags_comma")}</label>
                    <input
                      type="text"
                      name="tags"
                      placeholder="e.g. tech, breakouts, momentum"
                      value={formData.tags}
                      onChange={handleFormChange}
                      className="w-full bg-[#131317] border border-zinc-700/80 hover:border-zinc-600 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 rounded p-1.5 text-zinc-200 focus:outline-none transition-all text-xs"
                    />
                  </div>
                </div>

                {/* SECTION 7: TRADE SCREENSHOT - Sky Border Card */}
                <div className="p-4 rounded-xl bg-[#0e0e11] border border-sky-500/25 border-l-4 border-l-sky-500 shadow-lg shadow-sky-500/[0.02] space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                    {t("jr_screenshot")}
                  </div>

                  {!formData.screenshotUrl ? (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById("screenshot-file-input")?.click()}
                      className="border border-dashed border-zinc-800 hover:border-sky-500/50 bg-[#131317] hover:bg-[#16161c] rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <Upload className="w-6 h-6 text-zinc-500 group-hover:text-sky-400 transition-colors" />
                      <span className="text-zinc-300 font-medium text-xs">
                        {t("jr_upload_screenshot")}
                      </span>
                      <span className="text-[10px] text-zinc-500 max-w-[280px]">
                        {t("jr_drag_screenshot")}
                      </span>
                      <input
                        id="screenshot-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-lg border border-zinc-800 overflow-hidden bg-[#131317] p-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={formData.screenshotUrl}
                          alt="Screenshot preview"
                          className="w-16 h-12 rounded object-cover border border-zinc-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="overflow-hidden">
                          <span className="text-xs font-semibold text-zinc-300 block truncate">
                            {t("jr_screenshot")}
                          </span>
                          <span className="text-[10px] text-emerald-400 block font-mono">
                            ✓ Ready to save
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, screenshotUrl: "" }))}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2.5 py-1 rounded text-[10px] font-mono cursor-pointer transition-all shrink-0"
                      >
                        {t("jr_remove_screenshot")}
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-800/50 pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="bg-[#27272a] text-zinc-300 hover:bg-zinc-800 px-4 py-2 rounded text-xs transition-colors cursor-pointer"
                  >
                    {t("jr_cancel")}
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded text-xs font-semibold shadow-md transition-colors cursor-pointer"
                  >
                    {t("jr_save_trade")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: IMPORT CSV */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="border-b border-zinc-800/50 px-5 py-4 flex justify-between items-center bg-[#09090b]">
                <h3 className="font-bold text-sm text-zinc-100 font-mono flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> {t("jr_import_title")}
                </h3>
                <button onClick={() => setIsImportModalOpen(false)} className="text-zinc-500 hover:text-zinc-300 text-sm font-mono cursor-pointer">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-zinc-300">
                <p className="text-zinc-400">
                  {t("jr_import_desc")}
                </p>

                {parsedTrades.length === 0 && (
                  <div className="flex bg-[#09090b] p-1 border border-zinc-800/80 rounded-lg">
                    <button
                      type="button"
                      onClick={() => { setImportMethod("file"); setImportError(""); }}
                      className={`flex-1 text-center py-1.5 rounded font-mono text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                        importMethod === "file" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      📁 CSV/Excel File
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImportMethod("broker"); setImportError(""); }}
                      className={`flex-1 text-center py-1.5 rounded font-mono text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                        importMethod === "broker" ? "bg-amber-500/10 text-amber-400 font-bold border border-amber-500/10" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      🔗 Tradovate Live Sync
                    </button>
                  </div>
                )}

                {parsedTrades.length === 0 ? (
                  importMethod === "file" ? (
                    <>
                      {/* Broker Selector */}
                      <div className="bg-zinc-950/60 p-4 border border-zinc-800 rounded-lg space-y-2">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">{t("jr_detected_formats")}</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-center text-zinc-400">Interactive Brokers</div>
                          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-center text-zinc-400">Binance / Bybit CSV</div>
                          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-center text-zinc-400">Tradovate Excel</div>
                          <div className="bg-zinc-900 border border-emerald-500/30 p-2 rounded text-center text-emerald-400 font-semibold">ZellaTrader Map</div>
                        </div>
                      </div>

                      {/* Upload Arena */}
                      <div 
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={handleCsvDrop}
                        onClick={() => document.getElementById("csv-file-input")?.click()}
                        className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center bg-zinc-950/40 flex flex-col items-center justify-center space-y-2 hover:border-emerald-500/40 hover:bg-zinc-950/60 transition-all cursor-pointer group"
                      >
                        <Upload className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                        <span className="font-mono text-zinc-400 block text-[10px] group-hover:text-zinc-200 transition-colors">
                          {t("jr_drag_drop")}
                        </span>
                        <span className="text-zinc-600 block text-[9px]">
                          {t("jr_supports")}
                        </span>
                        <input
                          id="csv-file-input"
                          type="file"
                          accept=".csv, .txt, .xlsx, .xls"
                          onChange={handleCsvFileChange}
                          className="hidden"
                        />
                      </div>
                    </>
                  ) : (
                    /* Direct Tradovate Connection Form inside Modal */
                    <form onSubmit={handleDirectTradovateSync} className="space-y-3.5 bg-zinc-950/40 p-4 border border-zinc-800 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">🔗 Tradovate Live Sync</span>
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Connect and let Zella automatically fetch your live futures fills, pair them via FIFO, and construct your cognitive performance report.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Username</label>
                          <input
                            type="text"
                            required
                            placeholder="Tradovate account login"
                            value={modalBrokerUsername}
                            onChange={(e) => setModalBrokerUsername(e.target.value)}
                            className="w-full bg-[#09090b] border border-zinc-800/80 rounded p-1.5 text-zinc-200 font-mono text-[11px] focus:border-amber-500/50 transition-all focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Account Password"
                            value={modalBrokerPassword}
                            onChange={(e) => setModalBrokerPassword(e.target.value)}
                            className="w-full bg-[#09090b] border border-zinc-800/80 rounded p-1.5 text-zinc-200 font-mono text-[11px] focus:border-amber-500/50 transition-all focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Environment</label>
                          <select
                            value={modalBrokerEnv}
                            onChange={(e) => setModalBrokerEnv(e.target.value)}
                            className="w-full bg-[#09090b] border border-zinc-800/80 rounded p-1.5 text-zinc-300 font-mono text-[11px] focus:border-amber-500/50 transition-all focus:outline-none h-[30px]"
                          >
                            <option value="Demo">Simulation (Demo API)</option>
                            <option value="Live">Live Trading Workspace</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={importingState !== "idle"}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold py-2 rounded transition-all text-[11px] cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                        Sync & Run AI Audit
                      </button>
                    </form>
                  )
                ) : (
                  /* Parsed Trades Preview List */
                  <div className="space-y-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                          {t("jr_import_ready")}
                        </span>
                        <span className="text-xs text-zinc-200 font-semibold truncate block max-w-[200px]">
                          {importFileName}
                        </span>
                      </div>
                      <span className="bg-emerald-500 text-black font-bold px-2 py-0.5 rounded text-[11px] font-mono">
                        +{parsedTrades.length} Trades
                      </span>
                    </div>

                    <div className="border border-zinc-800/80 rounded-lg max-h-48 overflow-y-auto divide-y divide-zinc-800 bg-[#09090b] p-1">
                      {parsedTrades.map((pTrade, idx) => (
                        <div key={pTrade.id || idx} className="p-2 flex items-center justify-between gap-2 text-[10px] hover:bg-zinc-900/50 transition-colors">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`px-1 rounded text-[9px] font-mono font-bold shrink-0 ${
                              pTrade.direction === "Long" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>
                              {pTrade.direction}
                            </span>
                            <span className="font-bold text-zinc-200 truncate shrink-0">{pTrade.ticker}</span>
                            <span className="text-zinc-500 font-mono text-[9px] shrink-0">({pTrade.assetType})</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-zinc-300 block">
                              ${pTrade.entryPrice.toFixed(2)} → ${pTrade.exitPrice.toFixed(2)}
                            </span>
                            <span className={`font-mono block text-[9px] font-semibold ${
                              (pTrade.pnl || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}>
                              {(pTrade.pnl || 0) >= 0 ? "+" : ""}{(pTrade.pnl || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {modalBrokerSyncAnalysis && (
                      <div className="border border-blue-500/20 rounded-lg overflow-hidden mt-3 shadow-md shadow-blue-500/[0.01]">
                        <div className="bg-blue-900/10 border-b border-blue-500/20 px-3 py-1.5 text-[9px] font-mono text-blue-400 font-bold flex items-center justify-between">
                          <span>🤖 Zella ИИ-Аудит сделок</span>
                          <span className="bg-blue-500 text-black px-1.5 rounded text-[8px] font-bold">LIVE ANALYSIS</span>
                        </div>
                        <div className="p-3 bg-zinc-950/60 text-[10px] text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap select-text max-h-40 overflow-y-auto markdown-body">
                          {modalBrokerSyncAnalysis}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleClearImport}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 py-1.5 rounded font-mono text-[10px] transition-all cursor-pointer"
                    >
                      ✕ {t("jr_clear")}
                    </button>
                  </div>
                )}

                {/* Parsing / Done Progress Indicators */}
                {importingState === "parsing" && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 text-center space-y-2">
                    <span className="text-blue-400 font-mono animate-pulse block">{t("jr_parsing")}</span>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full animate-progress" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                )}

                {importingState === "done" && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 text-center text-emerald-400 font-mono">
                    {t("jr_import_success")}
                  </div>
                )}

                {/* Error Banner */}
                {importError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-center text-red-400 font-mono">
                    ⚠️ {importError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between gap-2 pt-2 border-t border-zinc-900">
                  <div>
                    {parsedTrades.length === 0 && (
                      <button
                        onClick={handleImportMock}
                        disabled={importingState !== "idle"}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 font-mono text-[10px] px-3 py-2 rounded transition-colors disabled:opacity-50 cursor-pointer"
                        title="Simulate sample import without file upload"
                      >
                        ⚡ {t("jr_simulate_import")}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsImportModalOpen(false);
                        handleClearImport();
                      }}
                      className="bg-zinc-900 text-zinc-400 hover:text-zinc-200 px-4 py-2 rounded cursor-pointer transition-all"
                    >
                      {t("jr_cancel")}
                    </button>
                    
                    {parsedTrades.length > 0 && (
                      <button
                        onClick={handleConfirmRealImport}
                        disabled={importingState !== "idle"}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10"
                      >
                        {t("jr_confirm_import")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX FOR SCREENSHOTS */}
      <AnimatePresence>
        {selectedScreenshot && (
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60] p-4 cursor-zoom-out"
            onClick={() => setSelectedScreenshot(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0c0e] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedScreenshot} 
                alt="Trade Screenshot" 
                className="max-w-full max-h-[80vh] object-contain rounded-t-lg"
                referrerPolicy="no-referrer"
              />
              <div className="p-3 bg-[#09090b] text-zinc-400 font-mono text-[11px] flex justify-between items-center border-t border-zinc-800/50">
                <span>{t("jr_screenshot")}</span>
                <button 
                  onClick={() => setSelectedScreenshot(null)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-3 py-1 rounded cursor-pointer transition-colors border border-zinc-700/60"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
