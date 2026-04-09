export type Direction = '做多' | '做空';
export type Emotion = '冷静' | '犹豫' | '焦虑' | '上头' | '报复性交易';

export interface Strategy {
  id: string;
  name: string;
  setupChecklist: string;
  entryRules: string;
  exitRules: string;
  riskRules: string;
  notes?: string;
  createdAt: string;
}

export interface Trade {
  id: string;
  title: string;
  tradeDate: string;
  symbol: string;
  direction: Direction;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  leverage: number;
  fee: number;
  pnl: number;
  pnlPercent: number;
  stopLoss: number;
  takeProfit: number;
  strategyId: string;
  followsSystem: boolean;
  entryReason: string;
  exitReason: string;
  tags: string[];
  emotion: Emotion;
  review: string;
  holdingMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummary {
  id: string;
  period: '日' | '周' | '月';
  range: string;
  content: string;
  createdAt: string;
}
