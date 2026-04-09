export type MarketType = '加密货币' | '股票' | '期货' | '外汇';
export type TradeDirection = '做多' | '做空';
export type EmotionState = '冷静' | '犹豫' | '焦虑' | '上头' | '报复性交易';

export interface TradeTag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Strategy {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Trade {
  id: string;
  title: string;
  tradeDate: string;
  market: MarketType;
  symbol: string;
  direction: TradeDirection;
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  leverage: number;
  fee: number;
  pnlAmount: number;
  pnlPercent: number;
  holdingMinutes: number;

  strategyId: string;
  entryReason: string;
  exitReason: string;
  followsSystem: boolean;
  signalQuality: 1 | 2 | 3 | 4 | 5;
  executionQuality: 1 | 2 | 3 | 4 | 5;

  stopLoss?: number;
  takeProfit?: number;
  maxFloatingLoss?: number;
  maxFloatingProfit?: number;
  riskRewardRatio?: number;

  emotion: EmotionState;
  biggestMistake: string;
  didWell: string;
  reviewNotes: string;
  nextRule: string;

  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type SummaryType = '日总结' | '周总结' | '月总结';

export interface TradeSummary {
  id: string;
  type: SummaryType;
  rangeStart: string;
  rangeEnd: string;
  tradeCount: number;
  totalPnl: number;
  bestPart: string;
  biggestProblem: string;
  nextFocus: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalTrades: number;
  totalPnl: number;
  winRate: number;
  averageRiskReward: number;
  maxWinStreak: number;
  maxLossStreak: number;
}
