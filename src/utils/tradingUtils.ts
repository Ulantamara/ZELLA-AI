import { Trade, Strategy, TradingPlan, PsychologyLog, Goal, AIReviewReport, Candlestick } from "../types";

// Helper to calculate individual trade PnL
export function calculateTradePnL(trade: Trade): number {
  const isLong = trade.direction === "Long";
  const rawPnL = isLong
    ? (trade.exitPrice - trade.entryPrice) * trade.positionSize
    : (trade.entryPrice - trade.exitPrice) * trade.positionSize;
  const netPnL = rawPnL - trade.fees - trade.commission;
  return parseFloat(netPnL.toFixed(2));
}

// Helper to calculate realized RR
export function calculateRealizedRR(trade: Trade): number {
  if (trade.stopLoss && trade.stopLoss !== trade.entryPrice) {
    const risk = Math.abs(trade.entryPrice - trade.stopLoss);
    const reward = Math.abs(trade.exitPrice - trade.entryPrice);
    return parseFloat((reward / risk).toFixed(2));
  }
  // Achieved vs standard
  return parseFloat((Math.abs(trade.exitPrice - trade.entryPrice) / (trade.entryPrice * 0.01)).toFixed(2));
}

// Full performance metrics calculator
export interface TradingMetrics {
  totalPnL: number;
  todayPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  winRate: number;
  profitFactor: number;
  avgWinner: number;
  avgLoser: number;
  expectancy: number;
  avgRR: number;
  avgHoldingTime: string; // in minutes/hours
  bestStrategy: string;
  worstStrategy: string;
  currentDrawdown: number;
  maxDrawdown: number;
  winningStreak: number;
  losingStreak: number;
  totalTrades: number;
  winningTradesCount: number;
  losingTradesCount: number;
}

export function calculateMetrics(trades: Trade[]): TradingMetrics {
  const sortedTrades = [...trades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
  
  let totalPnL = 0;
  let todayPnL = 0;
  let weeklyPnL = 0;
  let monthlyPnL = 0;
  
  let wins = 0;
  let losses = 0;
  let totalWinPnL = 0;
  let totalLossPnL = 0;
  
  const strategyPnL: Record<string, number> = {};
  
  // Drawdown & Streaks
  let peakPnL = 0;
  let runningPnL = 0;
  let maxDrawdown = 0;
  let currentDrawdown = 0;
  
  let currentWinStreak = 0;
  let maxWinStreak = 0;
  let currentLossStreak = 0;
  let maxLossStreak = 0;

  const mockToday = new Date("2026-06-29");
  const startOfWeek = new Date("2026-06-28"); // Sunday
  const startOfMonth = new Date("2026-06-01");

  for (const trade of sortedTrades) {
    const pnl = trade.pnl ?? calculateTradePnL(trade);
    runningPnL += pnl;
    totalPnL += pnl;

    // Streaks
    if (pnl > 0) {
      wins++;
      totalWinPnL += pnl;
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
    } else if (pnl < 0) {
      losses++;
      totalLossPnL += pnl;
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    }

    // Drawdown
    if (runningPnL > peakPnL) {
      peakPnL = runningPnL;
    }
    const dd = peakPnL - runningPnL;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
    }
    currentDrawdown = peakPnL - runningPnL;

    // Timeframe filters
    const tradeDate = new Date(trade.entryTime);
    const isSameDay = tradeDate.toDateString() === mockToday.toDateString();
    const isSameWeek = tradeDate >= startOfWeek;
    const isSameMonth = tradeDate >= startOfMonth;

    if (isSameDay) todayPnL += pnl;
    if (isSameWeek) weeklyPnL += pnl;
    if (isSameMonth) monthlyPnL += pnl;

    // Strategy group
    if (trade.strategy) {
      strategyPnL[trade.strategy] = (strategyPnL[trade.strategy] || 0) + pnl;
    }
  }

  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
  const profitFactor = Math.abs(totalLossPnL) > 0 ? totalWinPnL / Math.abs(totalLossPnL) : totalWinPnL > 0 ? 99.9 : 0;
  
  const avgWinner = wins > 0 ? totalWinPnL / wins : 0;
  const avgLoser = losses > 0 ? totalLossPnL / losses : 0;
  
  // Expectancy = (WinRate * AvgWinner) + (LossRate * AvgLoser)
  const expectancy = (winRate / 100) * avgWinner + ((100 - winRate) / 100) * avgLoser;

  // Best / Worst Strategy
  let bestStrategy = "None";
  let bestStrategyPnL = -Infinity;
  let worstStrategy = "None";
  let worstStrategyPnL = Infinity;

  Object.entries(strategyPnL).forEach(([strat, pnl]) => {
    if (pnl > bestStrategyPnL) {
      bestStrategyPnL = pnl;
      bestStrategy = strat;
    }
    if (pnl < worstStrategyPnL) {
      worstStrategyPnL = pnl;
      worstStrategy = strat;
    }
  });

  // Risk reward achieved avg
  const rrs = trades.map(t => t.rr ?? calculateRealizedRR(t)).filter(v => !isNaN(v) && isFinite(v));
  const avgRR = rrs.length > 0 ? rrs.reduce((a, b) => a + b, 0) / rrs.length : 0;

  return {
    totalPnL: parseFloat(totalPnL.toFixed(2)),
    todayPnL: parseFloat(todayPnL.toFixed(2)),
    weeklyPnL: parseFloat(weeklyPnL.toFixed(2)),
    monthlyPnL: parseFloat(monthlyPnL.toFixed(2)),
    winRate: parseFloat(winRate.toFixed(1)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    avgWinner: parseFloat(avgWinner.toFixed(2)),
    avgLoser: parseFloat(avgLoser.toFixed(2)),
    expectancy: parseFloat(expectancy.toFixed(2)),
    avgRR: parseFloat(avgRR.toFixed(2)),
    avgHoldingTime: "1h 24m",
    bestStrategy: bestStrategy === "None" ? "N/A" : bestStrategy,
    worstStrategy: worstStrategy === "None" ? "N/A" : worstStrategy,
    currentDrawdown: parseFloat(currentDrawdown.toFixed(2)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    winningStreak: maxWinStreak,
    losingStreak: maxLossStreak,
    totalTrades: trades.length,
    winningTradesCount: wins,
    losingTradesCount: losses,
  };
}

// Generate Candle Price action for a trade to support Replay Engine
export function generateCandlesForTrade(trade: Trade): Candlestick[] {
  const candlesCount = 20;
  const result: Candlestick[] = [];
  
  const startPrice = trade.entryPrice * (trade.direction === "Long" ? 0.992 : 1.008);
  const targetPrice = trade.exitPrice;
  const slPrice = trade.stopLoss ?? (trade.entryPrice * (trade.direction === "Long" ? 0.98 : 1.02));
  
  let currentPrice = startPrice;
  
  // Seed pseudorandom numbers based on trade id to keep it stable
  let seed = 0;
  for (let i = 0; i < trade.id.length; i++) {
    seed += trade.id.charCodeAt(i);
  }
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const entryIndex = 6;
  const exitIndex = 14;

  for (let i = 0; i < candlesCount; i++) {
    const isEntry = i === entryIndex;
    const isExit = i === exitIndex;
    
    let open = currentPrice;
    let close = currentPrice;
    let high = currentPrice;
    let low = currentPrice;

    // Determine trend based on index and direction
    if (i < entryIndex) {
      // Pre-entry consolidation with a slight drag
      const drift = (trade.entryPrice - startPrice) / entryIndex;
      close = open + drift + (random() - 0.5) * (open * 0.003);
    } else if (i === entryIndex) {
      // Entry candle: sharp volume and move in direction
      const diff = trade.entryPrice - open;
      close = trade.entryPrice;
    } else if (i > entryIndex && i < exitIndex) {
      // Progressing towards target
      const steps = exitIndex - entryIndex;
      const stepSize = (targetPrice - trade.entryPrice) / steps;
      // Add realistic volatility: random pullback or thrust
      const volatility = (random() - 0.45) * (open * 0.005);
      close = open + stepSize + volatility;
    } else if (i === exitIndex) {
      // Exit candle: touches target
      close = targetPrice;
    } else {
      // Post-exit consolidation/reversal
      const drag = (random() - 0.55) * (open * 0.006);
      close = open + drag;
    }

    // Ensure it doesn't cross Stop Loss prematurely except in a loss trade
    const achievedPnL = calculateTradePnL(trade);
    const isLossTrade = achievedPnL < 0;

    if (!isLossTrade && trade.direction === "Long") {
      if (close < slPrice) close = slPrice + (trade.entryPrice * 0.001);
    }
    if (!isLossTrade && trade.direction === "Short") {
      if (close > slPrice) close = slPrice - (trade.entryPrice * 0.001);
    }

    // High and Low calculations
    const bodyHigh = Math.max(open, close);
    const bodyLow = Math.min(open, close);
    high = bodyHigh + random() * (trade.entryPrice * 0.004);
    low = bodyLow - random() * (trade.entryPrice * 0.004);

    // Hard limits on SL/TP for visuals
    if (i === exitIndex) {
      if (trade.direction === "Long") {
        high = Math.max(high, targetPrice);
      } else {
        low = Math.min(low, targetPrice);
      }
    }

    currentPrice = close;

    // Time simulation (minutes/hours)
    const entryDate = new Date(trade.entryTime);
    const candleTime = new Date(entryDate.getTime() + (i - entryIndex) * 5 * 60 * 1000);
    const timeString = candleTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    result.push({
      time: timeString,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(1000 + random() * 15000),
    });
  }

  return result;
}

// ---------------------------------------------------------------------------------
// PREMIUM SEED DATASET
// ---------------------------------------------------------------------------------

export const SEED_STRATEGIES: Strategy[] = [
  {
    id: "strat_1",
    name: "OU Mean Reversion",
    description: "Ornstein-Uhlenbeck stochastic channel mean reversion at standard deviation thresholds (Bollinger Bands + RSI extremes).",
    whenToUse: "High-density consolidation, sideways markets, post-earnings release absorption phase.",
    whenNotToUse: "Macro momentum rallies, strong breakout trends, FOMC rate announcement spikes.",
    targetRR: 2.5,
    checklist: [
      "Asset price touches or exceeds the outer 2.5 Sigma Bollinger Band.",
      "RSI (14) prints absolute divergence on the 5-minute chart (>75 or <25).",
      "Volume Profile shows decreasing node density at current levels.",
      "Place Stop Loss strictly behind the nearest swing high/low.",
    ],
    examples: ["Reversion on AAPL", "Mean reversion consolidation on ETHUSD"],
  },
  {
    id: "strat_2",
    name: "VWAP Pullback Play",
    description: "Institutional VWAP retest during high-volume trend expansions, targeting the primary trend direction.",
    whenToUse: "High relative volume trending days, post-morning breakout consolidation.",
    whenNotToUse: "Low-volume holiday sessions, micro-cap penny stock washouts.",
    targetRR: 3.0,
    checklist: [
      "Asset demonstrates strong primary trend breakout in the first 30 mins of the session.",
      "Price pulls back orderly on shrinking relative volume to the VWAP line.",
      "1-minute candle demonstrates key reversal (hammer or bullish engulfing) touching VWAP.",
      "Stop Loss set strictly 0.15% below VWAP or trailing session low.",
    ],
    examples: ["TSLA VWAP Bounce", "NVDA breakout continuation"],
  },
  {
    id: "strat_3",
    name: "Order Block Liquidity Grab",
    description: "Identifying major institutional liquidity pools (stops sweeps) followed by rapid price rejection to ride the institutional flow.",
    whenToUse: "Forex majors, high liquidity Index futures (NQ, ES) at key session highs/lows.",
    whenNotToUse: "Thinly traded altcoins, pre-market illiquid equity sessions.",
    targetRR: 4.0,
    checklist: [
      "Identify a clean visual Swing High or Swing Low representing retail stop-losses.",
      "Wait for price to sweep that level by 2-10 ticks, then quickly close back inside the range.",
      "Enter immediately on the subsequent candle with a tight Stop Loss right at the high/low of the sweep.",
      "Profit targets set at the opposing side of the value channel or next major Order Block.",
    ],
    examples: ["NQ Stop Sweep", "EURUSD London Open grab"],
  },
  {
    id: "strat_4",
    name: "ICT Concepts Silver Bullet",
    description: "Classic ICT Silver Bullet strategy capitalizing on fair value gaps (FVG) formed during specific algorithmic high-liquidity time windows (e.g., 10:00 AM - 11:00 AM EST).",
    whenToUse: "During the specific institutional trading hours (10:00-11:00 AM New York time or 2:00-3:00 PM New York time) on major indices (NQ, ES) or FX pairs.",
    whenNotToUse: "Low-volatility bank holidays, during high-impact news releases (CPI, FOMC minutes) until the initial spike has fully cleared.",
    targetRR: 3.5,
    checklist: [
      "Check if the session time is strictly within the Silver Bullet window (e.g., 10:00 AM - 11:00 AM EST).",
      "Look for a stop run or sweep of recent liquidity (Swing High/Low).",
      "Identify a displacement move that breaks structure (Market Structure Shift / MSS).",
      "Verify a clean 1-minute or 5-minute Fair Value Gap (FVG) left behind by the displacement.",
      "Set a limit order at the premium/discount boundary of the FVG, with Stop Loss below/above the displacement candle swing."
    ],
    examples: ["NQ Silver Bullet FVG entry", "EURUSD London Session sweep"],
  },
  {
    id: "strat_5",
    name: "Turtle Soup",
    description: "The classical Linda Raschke / Laurence Connors counter-trend fakeout strategy, exploiting premature breakout traders' stops beyond key 20-period swing highs/lows.",
    whenToUse: "Trading ranges, sideways markets, or channel boundaries on indices, commodities, and high-beta equities.",
    whenNotToUse: "Parabolic trend days, strong expansion periods, or market sectors with macro regime shifts.",
    targetRR: 4.0,
    checklist: [
      "Identify a key visual 20-period swing high or low that has stood for at least 3 days.",
      "Watch for price to breach the previous swing high/low by at least several ticks, but no more than 1% of the asset's price.",
      "Wait for the breakout to fail and reverse, moving back below the high (or above the low) of the old swing.",
      "Enter a market order on the fail-back with a stop loss placed at the peak of today's extreme wick.",
      "Target the 10-period moving average or the opposite side of the 20-period value boundary."
    ],
    examples: ["TSLA Turtle Soup Sell at Range High", "GC (Gold) swing failure bounce"],
  }
];

export const SEED_TRADES: Trade[] = [
  {
    id: "trade_1",
    ticker: "NVDA",
    assetType: "Stocks",
    direction: "Long",
    entryPrice: 125.5,
    exitPrice: 129.8,
    positionSize: 200,
    stopLoss: 124.0,
    takeProfit: 130.0,
    entryTime: "2026-06-25T10:15:00Z",
    exitTime: "2026-06-25T11:45:00Z",
    fees: 4.5,
    commission: 1.5,
    broker: "Interactive Brokers",
    strategy: "VWAP Pullback Play",
    setup: "Retest of VWAP on 5m chart with heavy bullish volume engulfing.",
    tags: ["breakout", "tech", "heavy-volume"],
    screenshotUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    rating: 5,
    confidence: 4,
    emotionBefore: "Disciplined",
    emotionAfter: "Calm",
    marketContext: "Tech leading Nasdaq index upward, semis strong, market breadth highly positive.",
    notes: "Impeccable trade. Waited for the morning pop, watched the orderly consolidation right down to the VWAP line, and triggered on the 5-minute hammer confirmation. Position size was exact and targets were hit on the dot.",
    mistakes: [],
    lessons: ["Patience pays off. Letting the trade come to the key level reduces risk dramatically."],
  },
  {
    id: "trade_2",
    ticker: "BTCUSD",
    assetType: "Crypto",
    direction: "Short",
    entryPrice: 65200.0,
    exitPrice: 63950.0,
    positionSize: 0.5,
    stopLoss: 65800.0,
    takeProfit: 63500.0,
    entryTime: "2026-06-26T14:30:00Z",
    exitTime: "2026-06-26T16:10:00Z",
    fees: 15.0,
    commission: 0.0,
    broker: "Binance Pro",
    strategy: "Order Block Liquidity Grab",
    setup: "Sweep of yesterday's high with immediate rejection back into range.",
    tags: ["crypto", "liquidity-sweep", "swing"],
    rating: 4,
    confidence: 5,
    emotionBefore: "Calm",
    emotionAfter: "Calm",
    marketContext: "Bitcoin struggling at critical overhead resistance, altcoins showing capital outflow.",
    notes: "Identified the retail buy-stops sitting right above 65,100. Price popped to 65,180 to trigger stops and instantly flushed back. Shorted the candle close. Held through minor heat and exited at first support node.",
    mistakes: [],
    lessons: ["Institutional sweeps provide some of the cleanest R:R setups in crypto markets."],
  },
  {
    id: "trade_3",
    ticker: "TSLA",
    assetType: "Stocks",
    direction: "Long",
    entryPrice: 184.2,
    exitPrice: 181.5,
    positionSize: 150,
    stopLoss: 181.5,
    takeProfit: 190.0,
    entryTime: "2026-06-26T09:40:00Z",
    exitTime: "2026-06-26T10:10:00Z",
    fees: 3.5,
    commission: 1.0,
    broker: "Interactive Brokers",
    strategy: "VWAP Pullback Play",
    setup: "Aggressive entry on pullback, did not wait for hammer close.",
    tags: ["tech", "fomo-entry"],
    rating: 2,
    confidence: 2,
    emotionBefore: "FOMO",
    emotionAfter: "Frustrated",
    marketContext: "Spy opening flat, Tesla showing heavy premarket momentum but weak index correlation.",
    notes: "Rushed this entry. TSLA was moving up rapidly, I feared missing the move and bought the first micro-pullback without waiting for the candle to close near the support line. Stopped out right before price bounced back.",
    mistakes: ["Impulsive Entries", "Early Entry", "Overtrading"],
    lessons: ["Never buy a falling knife just because of FOMO. Always wait for price action to stabilize."],
  },
  {
    id: "trade_4",
    ticker: "EURUSD",
    assetType: "Forex",
    direction: "Short",
    entryPrice: 1.0825,
    exitPrice: 1.0855,
    positionSize: 100000,
    stopLoss: 1.0855,
    takeProfit: 1.0760,
    entryTime: "2026-06-29T08:00:00Z",
    exitTime: "2026-06-29T11:00:00Z",
    fees: 0.0,
    commission: 5.0,
    broker: "OANDA",
    strategy: "OU Mean Reversion",
    setup: "Bollinger band standard deviation trigger at key horizontal resistance.",
    tags: ["forex", "range-play"],
    rating: 1,
    confidence: 3,
    emotionBefore: "Anxious",
    emotionAfter: "Frustrated",
    marketContext: "Eurozone PMI data came in stronger than expected, catching USD sellers by surprise.",
    notes: "Attempted to fade a strong uptrend because of RSI overbought state. Violated rules by failing to see the macro PMI release schedule. Kept averaging up inside the candle, multiplying risk. Stopped out fully.",
    mistakes: ["Revenge Trading", "Rule Breaking", "Overtrading"],
    lessons: ["Do not fight active momentum on macro events. RSI can stay overbought longer than you can stay solvent."],
  },
  {
    id: "trade_5",
    ticker: "AAPL",
    assetType: "Stocks",
    direction: "Long",
    entryPrice: 210.5,
    exitPrice: 214.2,
    positionSize: 100,
    stopLoss: 208.5,
    takeProfit: 215.0,
    entryTime: "2026-06-29T09:50:00Z",
    exitTime: "2026-06-29T11:15:00Z",
    fees: 2.0,
    commission: 1.0,
    broker: "Interactive Brokers",
    strategy: "OU Mean Reversion",
    setup: "Mean reversion bounce off daily support S1.",
    tags: ["stocks", "blue-chip"],
    rating: 5,
    confidence: 4,
    emotionBefore: "Calm",
    emotionAfter: "Disciplined",
    marketContext: "S&P 500 recovering from intraday lows, Apple showing relative strength vs peer semiconductors.",
    notes: "Flawless mean reversion setup. Price pushed outside the bands on the initial shakeout, touched S1 support and held beautifully. Entered on structure. Clean take profit execution.",
    mistakes: [],
    lessons: ["Horizontal support paired with statistical extremes is a high-win-rate combination."],
  },
  {
    id: "trade_6",
    ticker: "EURUSD",
    assetType: "Forex",
    direction: "Long",
    entryPrice: 1.0720,
    exitPrice: 1.0768,
    positionSize: 150000,
    stopLoss: 1.0704,
    takeProfit: 1.0770,
    entryTime: "2026-06-27T10:05:00Z",
    exitTime: "2026-06-27T10:45:00Z",
    fees: 0.0,
    commission: 7.5,
    broker: "OANDA",
    strategy: "ICT Concepts Silver Bullet",
    setup: "10:00 AM EST liquidity sweep of Asian Session Low followed by displacement and 5-minute Fair Value Gap (FVG) retest.",
    tags: ["silver-bullet", "ict", "fvg", "liquidity-sweep"],
    rating: 5,
    confidence: 5,
    emotionBefore: "Disciplined",
    emotionAfter: "Calm",
    marketContext: "EURUSD down-trending early morning, but hit a major daily liquidity pool, initiating a sharp institutional reversal during the 10-11 AM AM session.",
    notes: "Executed exactly per the 10:00 AM New York Silver Bullet rules. Entered limit order at the premium edge of the 5-minute displacement FVG. Risk was tiny compared to the potential expansion. Target was the nearest buy-side liquidity pool.",
    mistakes: [],
    lessons: ["Silver bullet window is highly algorithmic. Limit entries at the FVG avoid slippage completely."],
  },
  {
    id: "trade_7",
    ticker: "BTCUSD",
    assetType: "Crypto",
    direction: "Short",
    entryPrice: 68400.0,
    exitPrice: 66200.0,
    positionSize: 0.3,
    stopLoss: 68950.0,
    takeProfit: 65500.0,
    entryTime: "2026-06-28T16:20:00Z",
    exitTime: "2026-06-28T18:40:00Z",
    fees: 12.0,
    commission: 0.0,
    broker: "Binance Pro",
    strategy: "Turtle Soup",
    setup: "Failed breakout above the 20-period swing high of $68,300. Swift rejection back inside the range.",
    tags: ["turtle-soup", "fakeout", "counter-trend", "range-play"],
    rating: 4,
    confidence: 3,
    emotionBefore: "Calm",
    emotionAfter: "Disciplined",
    marketContext: "Bitcoin was in a multi-day sideways trading range. Bulls attempted to push price through the range boundary, but lacking momentum support, it triggered a massive long squeeze.",
    notes: "Turtle Soup pattern triggered as price pierced the recent swing high of $68,300, reached $68,390, and promptly printed a bearish pinbar closing at $68,150. Entered short on that close. Placed protective stop at $68,420 (today's high). Exit executed near the mid-range value block.",
    mistakes: [],
    lessons: ["Do not try to catch the absolute peak; entering on the fail-back candle confirmation yields highly asymmetric risk reward."],
  }
];

// Append computed fields to SEED_TRADES
SEED_TRADES.forEach(t => {
  t.pnl = calculateTradePnL(t);
  t.rr = calculateRealizedRR(t);
});

export const SEED_PSYCHOLOGY_LOGS: PsychologyLog[] = [
  {
    id: "psy_1",
    date: "2026-06-25",
    fomoFrequency: 1,
    overtradingScore: 2,
    revengeTrading: false,
    fear: 2,
    greed: 1,
    confidence: 4,
    patience: 5,
    sleep: 4,
    stress: 2,
    energy: 4,
    notes: "Extremely calm day. Waited patiently for NVDA to set up. No impulse entries, obeyed risk guidelines perfectly. Sleep was excellent.",
    aiPatterns: "Excellent correlation between 7+ hours of sleep and high patience score. Discovered zero FOMO instances."
  },
  {
    id: "psy_2",
    date: "2026-06-26",
    fomoFrequency: 4,
    overtradingScore: 4,
    revengeTrading: true,
    fear: 4,
    greed: 4,
    confidence: 2,
    patience: 1,
    sleep: 2,
    stress: 5,
    energy: 2,
    notes: "Worst trading psychology day of the week. Woke up tired with a headache, missed the early breakout in TSLA, then FOMOed into it. Traded 5 times out of frustration. Pure revenge trading.",
    aiPatterns: "Critical alert: Short sleep duration (<5 hours) directly triggered a chain of high-risk behaviors: FOMO entries, Rule Breaking, and Revenge Trading. Avoid trading on days with sleep rating < 3."
  },
  {
    id: "psy_3",
    date: "2026-06-29",
    fomoFrequency: 2,
    overtradingScore: 3,
    revengeTrading: false,
    fear: 3,
    greed: 2,
    confidence: 3,
    patience: 3,
    sleep: 4,
    stress: 3,
    energy: 4,
    notes: " EURUSD revenge fade hurt, but caught Apple mean reversion to offset the loss. Still felt some stress after the EUR stop out.",
    aiPatterns: "Revenge trading tendencies are showing up following early losses. The urge to recover losses quickly leads to oversized position risks."
  }
];

export const SEED_GOALS: Goal[] = [
  {
    id: "goal_1",
    title: "Daily Profit Cap / Stop",
    target: 500,
    current: 367,
    type: "Daily",
    unit: "$",
    category: "PnL",
    completed: false,
  },
  {
    id: "goal_2",
    title: "Weekly Win Rate",
    target: 60.0,
    current: 60.0,
    type: "Weekly",
    unit: "%",
    category: "WinRate",
    completed: true,
  },
  {
    id: "goal_3",
    title: "Discipline Score Target",
    target: 90,
    current: 82,
    type: "Monthly",
    unit: "Score",
    category: "Discipline",
    completed: false,
  },
  {
    id: "goal_4",
    title: "Max Weekly Losses limit",
    target: 2,
    current: 2,
    type: "Weekly",
    unit: "Trades",
    category: "Trades",
    completed: false,
  }
];

export const SEED_TRADING_PLAN: TradingPlan = {
  dailyLossLimit: 1000,
  maxDailyTrades: 4,
  bannedTradeTypes: [
    "Unscheduled macro economic data releases (fading news directly)",
    "Penny stocks with market caps below $200M",
    "Options with expiration under 2 days (0DTE) unless hedged",
    "Entering positions within 5 minutes of market close",
  ],
  entryRules: [
    "Verify trend alignment on both 15-minute and 5-minute charts.",
    "Must have clear support/resistance structural block or anchor node nearby.",
    "Calculated risk to stop-loss must NOT exceed 1.5% of total capital.",
    "Check daily news calendar for scheduled FED/PMI events.",
  ],
  exitRules: [
    "Place Take Profit orders strictly at structural resistance or 2R minimum.",
    "If the thesis is broken (e.g. consolidation turns to heavy breakdown volume), cut the trade immediately—do not wait for stop.",
    "Trailing stops are only activated after trade reaches 1.5R of paper gains.",
  ],
  morningPrep: [
    { label: "Review overnight economic calendar & scheduled earnings releases", checked: true },
    { label: "Mark daily/weekly support & resistance lines on 5 major watchlist tickers", checked: true },
    { label: "Verify risk parameters: Daily Max Loss, Position Sizing rules", checked: true },
    { label: "Close all irrelevant social media and chat room noise before market open", checked: false },
  ],
  eveningReview: [
    { label: "Log all executed trades with entries, exits, fees, and screenshots", checked: true },
    { label: "Analyze mistakes: Identify if any entry was based on FOMO or anger", checked: true },
    { label: "Write a short summary of today's market context and sector rotations", checked: false },
  ]
};
export const SEED_REVIEWS: AIReviewReport[] = [
  {
    id: "rev_1",
    type: "Session",
    date: "2026-06-29",
    title: "Daily Session Review - June 29",
    pnl: 109.0,
    tradesCount: 2,
    winRate: 50,
    score: 75,
    bullets: [
      "EURUSD trade was a critical rule violation (revenge trade & fading news).",
      "AAPL trade was a high-fidelity mean reversion setup executed with extreme discipline.",
      "Identified clear stress-induced over-sizing patterns after the early FX loss.",
      "Recommendation: Establish a strict 15-minute cool-down lock on the broker platform after any stopped trade."
    ],
    content: "## Trading Session Performance Assessment\nToday's net PnL stands at **+$109.00** with a win rate of **50%** across 2 trades. While positive in dollar value, the day was marked by high psychological turbulence and serious rule violations.\n\n### Core Trade Analysis\n- **EURUSD Short (Loss - $305.00)**: A text-book mistake. You traded into high PMIs on a macro release, violating rule 1 of trading plans. Additionally, you showed signs of revenge trading by averaging down as the position went red.\n- **AAPL Long (Profit + $367.00)**: An excellent mean reversion trade. You caught the bounce off S1 support, maintained correct sizing, and exited perfectly at targets.\n\n### Key Recommendations for Tomorrow\n1. **Broker Cool-down**: Implement a mandatory 15-minute lockout after any stop-out to prevent immediate revenge trading.\n2. **News Protocol**: Always have your Forex Calendar open. Never enter a position within 30 minutes of red-folder news releases."
  },
  {
    id: "rev_2",
    type: "Weekly",
    date: "2026-06-28",
    title: "Weekly Performance Audit - Week 26",
    pnl: 593.0,
    tradesCount: 3,
    winRate: 66.6,
    score: 85,
    bullets: [
      "Total Net PnL of +$593.00, driven by excellent execution on NVDA and BTC USD.",
      "Impulsive TSLA entry resulted in a $408.00 loss due to late FOMO chase.",
      "Sleep quality heavily correlated with discipline (best day on Thursday, worst on Friday).",
      "Next week's major goal: Zero impulsive entries. Only trade when the 15-minute chart has stabilized."
    ],
    content: "## Weekly performance audit\nAn overall profitable week printing **+$593.00** across 3 major trades, demonstrating strong edge when executing the **VWAP Pullback Play** and **Order Block sweeps**.\n\n### Strategy Performance breakdown\n- **VWAP Pullback Play**: Generated **+$860.00** in net gains across NVDA and TSLA setups (excluding stopped chasers).\n- **Order Block sweeps**: Generated **+$610.00** in net gains on BTCUSD.\n\n### Psychological Diagnostic\nYour core vulnerability is **FOMO on high-momentum tickers** right after market open. When you miss the initial break, you chase, leading to terrible R:R ratios and immediate stops. Friday's TSLA loss is the prime exemplar of this pitfall.\n\n### Strategic Directive\nFor next week, you are strictly prohibited from entering a stock in the first 15 minutes of open unless it is an pre-planned gap-and-go setup."
  }
];
