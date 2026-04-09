import dayjs from 'dayjs';
import { useMemo } from 'react';
import { DashboardStats, Trade } from '@/types/trade';

const safeDivide = (a: number, b: number) => (b ? a / b : 0);

export function useTradeAnalytics(trades: Trade[]) {
  return useMemo(() => {
    const sorted = [...trades].sort((a, b) => dayjs(a.tradeDate).valueOf() - dayjs(b.tradeDate).valueOf());
    const wins = sorted.filter((t) => t.pnlAmount > 0);
    const losses = sorted.filter((t) => t.pnlAmount < 0);

    let winStreak = 0;
    let lossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    sorted.forEach((trade) => {
      if (trade.pnlAmount > 0) {
        winStreak += 1;
        lossStreak = 0;
      } else if (trade.pnlAmount < 0) {
        lossStreak += 1;
        winStreak = 0;
      }
      maxWinStreak = Math.max(maxWinStreak, winStreak);
      maxLossStreak = Math.max(maxLossStreak, lossStreak);
    });

    const stats: DashboardStats = {
      totalTrades: sorted.length,
      totalPnl: sorted.reduce((sum, t) => sum + t.pnlAmount, 0),
      winRate: safeDivide(wins.length, sorted.length) * 100,
      averageRiskReward: safeDivide(
        sorted.reduce((sum, t) => sum + (t.riskRewardRatio ?? 0), 0),
        sorted.filter((t) => t.riskRewardRatio).length,
      ),
      maxWinStreak,
      maxLossStreak,
    };

    const equityCurve = sorted.reduce<{ date: string; value: number }[]>((acc, trade) => {
      const prev = acc[acc.length - 1]?.value ?? 0;
      acc.push({ date: dayjs(trade.tradeDate).format('MM-DD'), value: prev + trade.pnlAmount });
      return acc;
    }, []);

    const strategyStats = Object.values(
      sorted.reduce<Record<string, { name: string; count: number; pnl: number; winRate: number; wins: number }>>(
        (acc, t) => {
          if (!acc[t.strategyId]) acc[t.strategyId] = { name: t.strategyId, count: 0, pnl: 0, winRate: 0, wins: 0 };
          acc[t.strategyId].count += 1;
          acc[t.strategyId].pnl += t.pnlAmount;
          if (t.pnlAmount > 0) acc[t.strategyId].wins += 1;
          acc[t.strategyId].winRate = (acc[t.strategyId].wins / acc[t.strategyId].count) * 100;
          return acc;
        },
        {},
      ),
    );

    const monthlyBars = Object.values(
      sorted.reduce<Record<string, { month: string; pnl: number }>>((acc, t) => {
        const month = dayjs(t.tradeDate).format('YYYY-MM');
        if (!acc[month]) acc[month] = { month, pnl: 0 };
        acc[month].pnl += t.pnlAmount;
        return acc;
      }, {}),
    );

    const weekdayStats = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((d, i) => {
      const dayTrades = sorted.filter((t) => dayjs(t.tradeDate).day() === i);
      return {
        day: d,
        pnl: dayTrades.reduce((sum, t) => sum + t.pnlAmount, 0),
        count: dayTrades.length,
      };
    });

    return { stats, equityCurve, strategyStats, monthlyBars, weekdayStats };
  }, [trades]);
}
