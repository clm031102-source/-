export type Direction = '做多' | '做空';

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
  entryReason: string;
  exitReason: string;
  tags: string[];
  emotion: '冷静' | '犹豫' | '焦虑' | '上头';
  review: string;
  createdAt: string;
  updatedAt: string;
}
