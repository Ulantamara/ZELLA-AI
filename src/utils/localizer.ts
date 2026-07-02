import { Trade, Strategy, PsychologyLog, TradingPlan, AssetType, DirectionType, EmotionType } from "../types";

// Translation dictionaries for static seed items to enable comprehensive Russian localization

const STRATEGY_TRANSLATIONS: Record<string, {
  name: string;
  description: string;
  whenToUse: string;
  whenNotToUse: string;
  checklist: string[];
}> = {
  "strat_1": {
    name: "OU Возврат к среднему",
    description: "Случайный возврат к среднему по каналу Орнштейна-Уленбека при достижении порогов стандартного отклонения (Полосы Боллинджера + экстремумы RSI).",
    whenToUse: "Высокая плотность консолидации, боковые (флэтовые) рынки, фаза абсорбции после публикации отчетов о прибылях.",
    whenNotToUse: "Макро-импульсные ралли, сильные тренды прорыва, всплески при объявлениях процентной ставки ФРС.",
    checklist: [
      "Цена актива касается или выходит за пределы внешней полосы Боллинджера 2.5 сигма.",
      "RSI (14) показывает абсолютную дивергенцию на 5-минутном графике (>75 или <25).",
      "Профиль объема показывает снижение плотности узлов на текущих уровнях.",
      "Размещайте стоп-лосс строго за ближайшим локальным максимумом/минимумом."
    ]
  },
  "strat_2": {
    name: "Откат от VWAP",
    description: "Институциональный ретест линии VWAP во время расширения тренда на высоких объемах в направлении основного движения.",
    whenToUse: "Дни с высоким относительным объемом тренда, консолидация после утреннего прорыва.",
    whenNotToUse: "Низкообъемные праздничные сессии, сливы неликвидных грошовых акций.",
    checklist: [
      "Актив демонстрирует сильный прорыв основного тренда в первые 30 минут сессии.",
      "Цена упорядоченно откатывается к линии VWAP при снижении относительного объема.",
      "1-минутная свеча демонстрирует ключевой разворот (молот или бычье поглощение) при касании VWAP.",
      "Стоп-лосс установлен строго на 0.15% ниже VWAP или скользящего минимума сессии."
    ]
  },
  "strat_3": {
    name: "Сбор ликвидности ордер-блока",
    description: "Определение крупных институциональных пулов ликвидности (снятие стопов) с последующим быстрым отклонением цены для входа по институциональному потоку.",
    whenToUse: "Основные валютные пары Форекс, высоколиквидные фьючерсы на индексы (NQ, ES) на ключевых максимумах/минимумах сессии.",
    whenNotToUse: "Низколиквидные альткоины, неликвидные сессии акций на премаркете.",
    checklist: [
      "Определите чистый визуальный максимум или минимум колебания (Swing High/Low), представляющий стоп-лоссы розничных трейдеров.",
      "Подождите, пока цена снимет этот уровень на 2-10 тиков, а затем быстро закроется обратно внутри диапазона.",
      "Входите немедленно на следующей свече с близким стоп-лоссом прямо на максимуме/минимуме свипа.",
      "Цели по прибыли установлены на противоположной стороне стоимостного канала или следующем крупном ордер-блоке."
    ]
  },
  "strat_4": {
    name: "Серебряная пуля (ICT Concepts Silver Bullet)",
    description: "Классическая стратегия ICT Silver Bullet, извлекающая выгоду из имбалансов (FVG), образующихся в определенные алгоритмические окна высокой ликвидности (например, с 10:00 до 11:00 EST).",
    whenToUse: "Во время определенных институциональных торговых часов (10:00-11:00 по Нью-Йорку или 14:00-15:00 по Нью-Йорку) на основных индексах (NQ, ES) или валютных парах.",
    whenNotToUse: "Низковолатильные банковские праздники, выпуски важных новостей (CPI, FOMC), пока первоначальный импульс полностью не исчерпан.",
    checklist: [
      "Убедитесь, что время сессии строго укладывается в окно 'Серебряной пули' (например, с 10:00 до 11:00 по времени Нью-Йорка).",
      "Ищите снятие стопов или свип недавней ликвидности (Swing High/Low).",
      "Определите импульсное движение (дисплейсмент), которое ломает структуру (слом структуры / MSS).",
      "Подтвердите наличие чистого 1-минутного или 5-минутного имбаланса (FVG), оставленного импульсным движением.",
      "Установите лимитный ордер на границе премиума/дисконта FVG со стоп-лоссом за экстремум импульсной свечи."
    ]
  },
  "strat_5": {
    name: "Суп из черепах (Turtle Soup)",
    description: "Классическая контртрендовая стратегия ложного пробоя Линды Рашке / Лоренса Коннорса, использующая стопы пробойных трейдеров за ключевыми 20-периодными максимумами/минимумами.",
    whenToUse: "Торговые диапазоны, боковые рынки или границы каналов на индексах, сырьевых товарах и высокобета-акциях.",
    whenNotToUse: "Параболические трендовые дни, периоды сильного расширения или сектора рынка с макроэкономическими сдвигами.",
    checklist: [
      "Определите ключевой визуальный 20-периодный максимум или минимум колебания, который держался не менее 3 дней.",
      "Следите за тем, чтобы цена пробила предыдущий максимум/минимум как минимум на несколько тиков, но не более чем на 1% от цены актива.",
      "Подождите, пока пробой не удастся и цена развернется обратно ниже максимума (или выше минимума) старого свинга.",
      "Войдите рыночным ордером на возврате в диапазон со стоп-лоссом за пик сегодняшнего фитиля свечи.",
      "Цель — 10-периодная скользящая средняя или противоположная граница 20-периодного диапазона."
    ]
  }
};

const TRADE_TRANSLATIONS: Record<string, {
  strategy: string;
  setup: string;
  marketContext: string;
  notes: string;
  lessons: string[];
  mistakes: string[];
}> = {
  "trade_1": {
    strategy: "Откат от VWAP",
    setup: "Ретест VWAP на 5-минутном графике с сильным бычьим поглощением на объеме.",
    marketContext: "Технологический сектор ведет индекс Nasdaq вверх, полупроводники сильны, общая широта рынка положительная.",
    notes: "Безупречная сделка. Дождался утреннего импульса, проследил за упорядоченной консолидирующей коррекцией прямо к линии VWAP и вошел по подтверждению 5-минутного молота. Объем позиции был точным, и цели были достигнуты копейка в копейку.",
    lessons: ["Терпение окупается. Позволяя цене дойти до ключевого уровня, вы резко снижаете риски."],
    mistakes: []
  },
  "trade_2": {
    strategy: "Сбор ликвидности ордер-блока",
    setup: "Снятие вчерашнего максимума с мгновенным отклонением обратно в диапазон.",
    marketContext: "Биткоин борется с критическим сопротивлением сверху, на альткоинах наблюдается отток капитала.",
    notes: "Определил бай-стопы розничных трейдеров чуть выше 65,100. Цена выросла до 65,180 для снятия стопов и мгновенно упала. Продал на закрытии свечи. Пережил небольшую коррекцию и вышел на первом локальном уровне поддержки.",
    lessons: ["Институциональные свипы обеспечивают одни из самых чистых соотношений R:R на рынке криптовалют."],
    mistakes: []
  },
  "trade_3": {
    strategy: "Откат от VWAP",
    setup: "Агрессивный вход на откате, не дождался закрытия молота.",
    marketContext: "SPY открывается нейтрально, Tesla показывает сильный премаркет-моментум, но слабую корреляцию с индексом.",
    notes: "Поспешил с входом. TSLA быстро росла, я испугался упустить движение (FOMO) и купил на первом микро-откате, не дожидаясь стабилизации цены. Стоп-аут прямо перед тем, как цена развернулась и пошла вверх.",
    lessons: ["Никогда не ловите падающий нож на эмоциях FOMO. Всегда ждите стабилизации движения."],
    mistakes: ["Импульсивные входы", "Преждевременный вход", "Переторговка"]
  },
  "trade_4": {
    strategy: "OU Возврат к среднему",
    setup: "Сигнал стандартного отклонения полос Боллинджера на ключевом горизонтальном сопротивлении.",
    marketContext: "Данные по PMI Еврозоны вышли сильнее ожиданий, застав продавцов доллара врасплох.",
    notes: "Попытался сыграть против сильного восходящего тренда из-за перекупленности по RSI. Нарушил правила, не посмотрев календарь макроэкономических новостей PMI. Усреднял убыточную позицию на свечах вверх. Полный стоп-аут.",
    lessons: ["Не боритесь с активным моментумом на макроновостях. RSI может оставаться перекупленным дольше, чем вы сможете поддерживать маржинальное обеспечение."],
    mistakes: ["Реванш-трейдинг", "Нарушение правил", "Переторговка"]
  },
  "trade_5": {
    strategy: "OU Возврат к среднему",
    setup: "Разворот к среднему с отскоком от дневной поддержки S1.",
    marketContext: "Индекс S&P 500 восстанавливается от внутридневных минимумов, Apple демонстрирует относительную силу по сравнению с полупроводниками.",
    notes: "Безупречный сетап возврата к среднему. Цена вышла за пределы полос при первоначальном встряхивании, коснулась уровня S1 и удержала его. Вошел по структуре. Чистый тейк-профит.",
    lessons: ["Горизонтальная поддержка в сочетании со статистическими экстремумами — это комбинация с высоким процентом побед."],
    mistakes: []
  },
  "trade_6": {
    strategy: "Серебряная пуля (ICT Concepts Silver Bullet)",
    setup: "Снятие ликвидности азиатской сессии в 10:00 EST с последующим импульсным движением и ретестом 5-минутного имбаланса (FVG).",
    marketContext: "EURUSD снижался ранним утром, но коснулся крупного пула ликвидности на дневном графике, начав мощный институциональный разворот во время сессии с 10 до 11 утра.",
    notes: "Исполнено строго по правилам Silver Bullet в 10:00 по Нью-Йорку. Вошел лимитным ордером на премиум-границе 5-минутного FVG. Риск был крошечным по сравнению с потенциалом расширения. Цель — ближайший пул бай-сайд ликвидности.",
    lessons: ["Окно Серебряной пули очень алгоритмично. Лимитные входы на FVG полностью исключают проскальзывание."],
    mistakes: []
  },
  "trade_7": {
    strategy: "Суп из черепах (Turtle Soup)",
    setup: "Ложный пробой выше 20-периодного максимума $68,300. Быстрое отклонение обратно в диапазон.",
    marketContext: "Биткоин находился в многодневном боковом коридоре. Быки попытались пробить границу диапазона, но без поддержки моментума это привело к масштабному сквизу лонгов.",
    notes: "Паттерн 'Суп из черепах' сработал, когда цена пробила недавний свинг-максимум $68,300, дошла до $68,390 и быстро закрылась пинбаром на уровне $68,150. Вошел в шорт. Стоп за максимум сегодняшнего фитиля. Выход около середины торгового канала.",
    lessons: ["Не пытайтесь поймать абсолютный пик; вход на подтверждающей свече возврата в диапазон дает превосходную асимметрию риска к прибыли."],
    mistakes: []
  }
};

const PSYCHOLOGY_TRANSLATIONS: Record<string, {
  notes: string;
  aiPatterns: string;
}> = {
  "psy_1": {
    notes: "Очень спокойный день. Терпеливо ждал входа по NVDA. Без импульсивных сделок, строго соблюдал риск-план. Сон отличный.",
    aiPatterns: "Отличная корреляция между хорошим сном (более 7 часов) и высоким уровнем терпения. FOMO не зафиксировано."
  },
  "psy_2": {
    notes: "Худший день с точки зрения психологии на этой неделе. Проснулся уставшим с головной болью, упустил утренний прорыв по TSLA, затем вошел на эмоциях (FOMO). Из-за разочарования совершил еще 5 сделок. Чистый тильт и реванш-трейдинг.",
    aiPatterns: "Критическое предупреждение: Малая продолжительность сна (<5 часов) напрямую спровоцировала цепочку рискованного поведения: FOMO, нарушение правил и реванш-трейдинг. Избегайте торговли при оценке сна < 3."
  },
  "psy_3": {
    notes: "Реванш-трейдинг на EURUSD принес убытки, но вовремя совершенный отскок от среднего на Apple компенсировал потерю. Тем не менее, остался стресс после выбитого стопа по валюте.",
    aiPatterns: "Проявляются тенденции к тильту после ранних убытков. Желание быстро отыграться приводит к неоправданному завышению объема позиций."
  }
};

const TRADING_PLAN_RULES_RU: Record<string, string> = {
  // Banned Trade Types
  "Unscheduled macro economic data releases (fading news directly)": "Внеплановые выпуски макроэкономических данных (торговля непосредственно против новостей)",
  "Penny stocks with market caps below $200M": "Грошовые акции с рыночной капитализацией ниже $200 млн",
  "Options with expiration under 2 days (0DTE) unless hedged": "Опционы со сроком экспирации менее 2 дней (0DTE), если они не хеджированы",
  "Entering positions within 5 minutes of market close": "Открытие позиций менее чем за 5 минут до закрытия рынка",

  // Entry Rules
  "Verify trend alignment on both 15-minute and 5-minute charts.": "Проверьте соответствие тренда как на 15-минутном, так и на 5-минутном графиках.",
  "Must have clear support/resistance structural block or anchor node nearby.": "Рядом должен быть четкий структурный блок поддержки/сопротивления или якорный узел.",
  "Calculated risk to stop-loss must NOT exceed 1.5% of total capital.": "Расчетный риск до стоп-лосса НЕ должен превышать 1.5% от общего капитала.",
  "Check daily news calendar for scheduled FED/PMI events.": "Проверьте календарь ежедневных новостей на наличие запланированных событий ФРС/PMI.",

  // Exit Rules
  "Place Take Profit orders strictly at structural resistance or 2R minimum.": "Размещайте ордера тейк-профит строго на уровнях структурного сопротивления или минимум 2R.",
  "If the thesis is broken (e.g. consolidation turns to heavy breakdown volume), cut the trade immediately—do not wait for stop.": "Если тезис нарушен (например, консолидация переходит в большой объем на пробой вниз), немедленно закройте сделку — не ждите стопа.",
  "Trailing stops are only activated after trade reaches 1.5R of paper gains.": "Скользящие стопы активируются только после того, как сделка достигнет 1.5R бумажной прибыли.",

  // Morning Prep
  "Review overnight economic calendar & scheduled earnings releases": "Проверить экономический календарь на ночь и запланированные отчеты о доходах",
  "Mark daily/weekly support & resistance lines on 5 major watchlist tickers": "Отметить дневные/недельные линии поддержки и сопротивления на 5 основных тикерах в списке наблюдения",
  "Verify risk parameters: Daily Max Loss, Position Sizing rules": "Проверить параметры риска: максимальный дневной убыток, правила выбора размера позиции",
  "Close all irrelevant social media and chat room noise before market open": "Закрыть все ненужные социальные сети и чаты перед открытием рынка",

  // Evening Review
  "Log all executed trades with entries, exits, fees, and screenshots": "Внести в журнал все совершенные сделки с точками входа, выхода, комиссиями и скриншотами",
  "Analyze mistakes: Identify if any entry was based on FOMO or anger": "Проанализировать ошибки: определить, был ли какой-либо вход совершен на эмоциях FOMO или гневе",
  "Write a short summary of today's market context and sector rotations": "Написать краткое резюме сегодняшнего рыночного контекста и ротации секторов"
};

// Main Helper Functions used by Views during Render

export function getLocalizedTrade(trade: Trade, language: string): Trade {
  if (language !== "ru") return trade;
  const translation = TRADE_TRANSLATIONS[trade.id];
  if (!translation) return trade;

  return {
    ...trade,
    strategy: translation.strategy,
    setup: translation.setup,
    marketContext: translation.marketContext,
    notes: translation.notes,
    lessons: translation.lessons,
    mistakes: trade.mistakes.map(m => {
      if (m === "Impulsive Entries") return "Импульсивный вход";
      if (m === "Early Entry") return "Преждевременный вход";
      if (m === "Overtrading") return "Переторговка";
      if (m === "Revenge Trading") return "Реванш-трейдинг";
      if (m === "Rule Breaking") return "Нарушение правил";
      return m;
    })
  };
}

export function getLocalizedTrades(trades: Trade[], language: string): Trade[] {
  return trades.map(t => getLocalizedTrade(t, language));
}

export function getLocalizedStrategy(strategy: Strategy, language: string): Strategy {
  if (language !== "ru") return strategy;
  const translation = STRATEGY_TRANSLATIONS[strategy.id];
  if (!translation) return strategy;

  return {
    ...strategy,
    name: translation.name,
    description: translation.description,
    whenToUse: translation.whenToUse,
    whenNotToUse: translation.whenNotToUse,
    checklist: translation.checklist
  };
}

export function getLocalizedStrategies(strategies: Strategy[], language: string): Strategy[] {
  return strategies.map(s => getLocalizedStrategy(s, language));
}

export function getLocalizedPsychologyLog(log: PsychologyLog, language: string): PsychologyLog {
  if (language !== "ru") return log;
  const translation = PSYCHOLOGY_TRANSLATIONS[log.id];
  if (!translation) return log;

  return {
    ...log,
    notes: translation.notes,
    aiPatterns: translation.aiPatterns
  };
}

export function getLocalizedPsychologyLogs(logs: PsychologyLog[], language: string): PsychologyLog[] {
  return logs.map(l => getLocalizedPsychologyLog(l, language));
}

export function getLocalizedTradingPlan(plan: TradingPlan, language: string): TradingPlan {
  if (language !== "ru") return plan;

  return {
    ...plan,
    bannedTradeTypes: plan.bannedTradeTypes.map(item => TRADING_PLAN_RULES_RU[item] || item),
    entryRules: plan.entryRules.map(item => TRADING_PLAN_RULES_RU[item] || item),
    exitRules: plan.exitRules.map(item => TRADING_PLAN_RULES_RU[item] || item),
    morningPrep: plan.morningPrep.map(item => ({
      ...item,
      label: TRADING_PLAN_RULES_RU[item.label] || item.label
    })),
    eveningReview: plan.eveningReview.map(item => ({
      ...item,
      label: TRADING_PLAN_RULES_RU[item.label] || item.label
    }))
  };
}
