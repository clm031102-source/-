import dayjs from 'dayjs';
import { Strategy, Trade, WeeklySummary } from '@/types/trade';

const now = dayjs();

export const seedStrategies: Strategy[] = [
  {
    id: 'st-1',
    name: '趋势突破',
    setupChecklist: '大级别趋势同向、关键位放量突破',
    entryRules: '突破后回踩确认不破，挂单入场',
    exitRules: '到达 1.5R 先减仓，2R 保护止盈',
    riskRules: '单笔最多亏损 1R，不逆势加仓',
    notes: '优先交易流动性高品种',
    createdAt: now.toISOString(),
  },
  {
    id: 'st-2',
    name: '回调低吸',
    setupChecklist: '趋势结构完整，回调到均线支撑',
    entryRules: '出现反转K线 + 成交量回升',
    exitRules: '反弹到前高附近逐步止盈',
    riskRules: '跌破结构低点即离场',
    createdAt: now.toISOString(),
  },
  {
    id: 'st-3',
    name: '反转捕捉',
    setupChecklist: '极端情绪 + 背离信号',
    entryRules: '确认止跌止涨后二次入场',
    exitRules: '到关键均线逐步离场',
    riskRules: '不加仓，固定止损',
    createdAt: now.toISOString(),
  },
];

export const seedTrades: Trade[] = [
  {
    id: 't-1', title: 'BTC 1m 突破跟进', tradeDate: now.subtract(1, 'day').hour(10).minute(0).toISOString(), symbol: 'BTC', direction: '做多',
    entryPrice: 84250, exitPrice: 84590, quantity: 0.7, leverage: 20, fee: 4, pnl: 232, pnlPercent: 1.9, stopLoss: 84080, takeProfit: 84590,
    strategyId: 'st-1', followsSystem: true, entryReason: '突破区间后回踩不破，动量增强。', exitReason: '触达 2R 目标位。',
    tags: ['计划内', 'A+机会'], emotion: '冷静', review: '执行到位，止盈节奏良好。', holdingMinutes: 28, createdAt: now.toISOString(), updatedAt: now.toISOString(),
  },
  {
    id: 't-2', title: 'ETH 回调低吸失败', tradeDate: now.subtract(2, 'day').hour(14).minute(20).toISOString(), symbol: 'ETH', direction: '做多',
    entryPrice: 3020, exitPrice: 2990, quantity: 5, leverage: 10, fee: 3, pnl: -156, pnlPercent: -1.2, stopLoss: 2988, takeProfit: 3078,
    strategyId: 'st-2', followsSystem: true, entryReason: '回调到支撑位，尝试低吸。', exitReason: '跌破结构低点，执行止损。',
    tags: ['计划内'], emotion: '犹豫', review: '入场略早，确认不足。', holdingMinutes: 17, createdAt: now.toISOString(), updatedAt: now.toISOString(),
  },
  {
    id: 't-3', title: 'SOL 反转试单', tradeDate: now.subtract(6, 'day').hour(9).minute(5).toISOString(), symbol: 'SOL', direction: '做空',
    entryPrice: 182.2, exitPrice: 176.3, quantity: 80, leverage: 15, fee: 5, pnl: 467, pnlPercent: 3.2, stopLoss: 184, takeProfit: 176,
    strategyId: 'st-3', followsSystem: false, entryReason: '情绪过热后首根衰竭K。', exitReason: '接近日内支撑，主动止盈。',
    tags: ['冲动交易'], emotion: '上头', review: '收益不错但并非系统内。', holdingMinutes: 34, createdAt: now.toISOString(), updatedAt: now.toISOString(),
  },
];

export const seedSummaries: WeeklySummary[] = [
  { id: 'su-1', period: '周', range: '2026-04-01 ~ 2026-04-07', content: '计划内交易占比提升，冲动交易仍需压缩。', createdAt: now.toISOString() },
];
