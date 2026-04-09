import dayjs from 'dayjs';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { useTradeAnalytics } from '@/hooks/useTradeAnalytics';
import { useTradeStore } from '@/store/tradeStore';

const groupBy = <T extends string>(arr: T[]) =>
  Object.entries(arr.reduce<Record<string, number>>((acc, v) => ((acc[v] = (acc[v] ?? 0) + 1), acc), {})).map(([name, value]) => ({ name, value }));

export function AnalyticsPage() {
  const { trades, strategies, tags } = useTradeStore();
  const { equityCurve, monthlyBars, strategyStats, weekdayStats } = useTradeAnalytics(trades);

  const directionStats = groupBy(trades.map((t) => t.direction));
  const emotionStats = groupBy(trades.map((t) => t.emotion));
  const systemStats = groupBy(trades.map((t) => (t.followsSystem ? '符合系统' : '不符合系统')));
  const symbolStats = Object.values(trades.reduce<Record<string, { name: string; pnl: number }>>((acc, t) => {
    acc[t.symbol] ??= { name: t.symbol, pnl: 0 }; acc[t.symbol].pnl += t.pnlAmount; return acc;
  }, {}));
  const tagStats = Object.values(trades.reduce<Record<string, { name: string; count: number }>>((acc, t) => {
    t.tagIds.forEach((id) => { const name = tags.find((item) => item.id === id)?.name ?? id; acc[name] ??= { name, count: 0 }; acc[name].count += 1; });
    return acc;
  }, {}));

  const rangeStats = [7, 30, 90].map((days) => {
    const selected = trades.filter((t) => dayjs(t.tradeDate).isAfter(dayjs().subtract(days, 'day')));
    return { name: `${days}天`, pnl: selected.reduce((s, t) => s + t.pnlAmount, 0), count: selected.length };
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><h3 className="mb-2">收益曲线图</h3><div className="h-64"><ResponsiveContainer><LineChart data={equityCurve}><CartesianGrid stroke="#243047"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Line dataKey="value" stroke="#38bdf8"/></LineChart></ResponsiveContainer></div></Card>
      <Card><h3 className="mb-2">月度盈亏柱状图</h3><div className="h-64"><ResponsiveContainer><BarChart data={monthlyBars}><CartesianGrid stroke="#243047"/><XAxis dataKey="month"/><YAxis/><Tooltip/><Bar dataKey="pnl" fill="#818cf8"/></BarChart></ResponsiveContainer></div></Card>
      <Card><h3 className="mb-2">策略表现对比</h3><div className="h-64"><ResponsiveContainer><BarChart data={strategyStats.map((s) => ({ name: strategies.find((k) => k.id === s.name)?.name ?? s.name, pnl: s.pnl }))}><CartesianGrid stroke="#243047"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="pnl" fill="#22c55e"/></BarChart></ResponsiveContainer></div></Card>
      <Card><h3 className="mb-2">胜率对比（策略）</h3><div className="h-64"><ResponsiveContainer><BarChart data={strategyStats.map((s) => ({ name: strategies.find((k) => k.id === s.name)?.name ?? s.name, winRate: Number(s.winRate.toFixed(1)) }))}><CartesianGrid stroke="#243047"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="winRate" fill="#f59e0b"/></BarChart></ResponsiveContainer></div></Card>
      <Card><h3 className="mb-2">按情绪状态统计</h3><div className="h-64"><ResponsiveContainer><BarChart data={emotionStats}><CartesianGrid stroke="#243047"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#ec4899"/></BarChart></ResponsiveContainer></div></Card>
      <Card><h3 className="mb-2">按星期几统计</h3><div className="h-64"><ResponsiveContainer><BarChart data={weekdayStats}><CartesianGrid stroke="#243047"/><XAxis dataKey="day"/><YAxis/><Tooltip/><Bar dataKey="pnl" fill="#06b6d4"/></BarChart></ResponsiveContainer></div></Card>

      <Card className="lg:col-span-2">
        <h3 className="mb-2">其他维度（品种 / 多空 / 系统符合 / 标签 / 时间区间）</h3>
        <div className="grid gap-3 md:grid-cols-5 text-sm">
          <div><p className="mb-1 font-semibold">按品种盈亏</p>{symbolStats.map((i) => <p key={i.name}>{i.name}: {i.pnl.toFixed(2)}</p>)}</div>
          <div><p className="mb-1 font-semibold">按多空方向</p>{directionStats.map((i) => <p key={i.name}>{i.name}: {i.value}</p>)}</div>
          <div><p className="mb-1 font-semibold">按是否符合系统</p>{systemStats.map((i) => <p key={i.name}>{i.name}: {i.value}</p>)}</div>
          <div><p className="mb-1 font-semibold">按标签</p>{tagStats.map((i) => <p key={i.name}>{i.name}: {i.count}</p>)}</div>
          <div><p className="mb-1 font-semibold">按时间区间</p>{rangeStats.map((i) => <p key={i.name}>{i.name}: {i.count}笔 / {i.pnl.toFixed(2)}</p>)}</div>
        </div>
      </Card>
    </div>
  );
}
