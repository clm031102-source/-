export type Direction = '做多' | '做空';
export type Emotion = '冷静' | '专注' | '犹豫' | '焦虑' | '上头' | '报复性交易';
export type EnergyState = '充沛' | '一般' | '疲惫';
export type OpportunityGrade = 'A+' | 'A' | 'B' | 'C';
export type SummaryPeriod = '日' | '周' | '月';

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

export interface TradeAttachment {
  id: string;
  name: string;
  type: 'image';
  dataUrl: string;
  createdAt: string;
}

export interface Trade {
  id: string;
  title: string;
  tradeDate: string;
  symbol: string;
  direction: Direction;
  strategyId: string;
  setup?: string;
  mistakes?: string[];

  entryPrice: number;
  exitPrice: number;
  quantity: number;
  leverage: number;
  fee: number;
  stopLoss: number;
  takeProfit: number;

  estimatedPnl?: number;
  pnl: number;
  pnlPercent: number;
  rMultiple?: number;
  riskRewardRatio?: number;
  mfe?: number;
  mae?: number;
  holdingMinutes?: number;
  plannedPosition?: boolean;

  followsSystem: boolean;
  signalQuality?: number;
  executionQuality?: number;
  plannedTrade?: boolean;
  impulseTrade?: boolean;
  chasingPrice?: boolean;
  holdingLoser?: boolean;
  earlyTakeProfit?: boolean;
  movedStopLoss?: boolean;

  entryReason: string;
  exitReason: string;
  review: string;
  whatWentWell?: string;
  biggestMistake?: string;
  nextTimePlan?: string;

  emotion: Emotion;
  energy?: EnergyState;
  calm?: boolean;
  overtrading?: boolean;
  revengeTrading?: boolean;
  forcedAfterLoss?: boolean;

  tags: string[];
  experienceTags?: string[];
  errorTags?: string[];
  opportunityGrade?: OpportunityGrade;
  systemType?: '系统单' | '非系统单';
  planType?: '计划内' | '计划外';
  screenshotNotes?: string;
  attachments?: TradeAttachment[];

  // legacy compatibility fields
  market?: string;
  entryTime?: string;
  exitTime?: string;
  positionSize?: number;
  pnlAmount?: number;
  maxFloatingLoss?: number;
  maxFloatingProfit?: number;
  didWell?: string;
  reviewNotes?: string;
  nextRule?: string;
  tagIds?: string[];

  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummary {
  id: string;
  period: SummaryPeriod;
  range: string;
  content: string;
  title?: string;
  tradeCount?: number;
  totalPnl?: number;
  goodPoints?: string;
  biggestIssue?: string;
  nextFocus?: string;
  tags?: string[];
  linkedStrategies?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type EmotionState = Emotion;

export interface TradeTag {
  id: string;
  name: string;
  createdAt: string;
}

export type TradeSummary = WeeklySummary;

export interface DashboardStats {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
}

export interface JournalExportPayload {
  version: number;
  exportedAt: string;
  trades: Trade[];
  summaries: WeeklySummary[];
  strategies: Strategy[];
  attachments: TradeAttachment[];
  tags: string[];
  setups: string[];
  mistakes: string[];
}
