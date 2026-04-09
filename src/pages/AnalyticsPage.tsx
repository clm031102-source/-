import dayjs from 'dayjs';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useMemo, useState } from 'react';
import { useJournalStore } from '@/store/useJournalStore';
import { Trade } from '@/types/trade';

const chartPalette = { gold: '#c8a978', line: '#7f8ca3', green: '#2ea772', red: '#c85b5b', blue: '#6f8bb2' };
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function getStreak(trades: Trade[]) {
  let w = 0; let l = 0; let mw = 0; let ml = 0;
  [...trades].sort((a, b) => dayjs(a.tradeDate).valueOf() - dayjs(b.tradeDate).valueOf()).forEach((t) => {
    if (t.pnl > 0) { w += 1; l = 0; } else if (t.pnl < 0) { l += 1; w = 0; }
    mw = Math.max(mw, w); ml = Math.max(ml, l);
  });
  return { maxWinStreak: mw, maxLossStreak: ml };
}

function byGroup(trades: Trade[], key: (t: Trade) => string) {
  const map = new Map<string, Trade[]>();
  trades.forEach((t) => map.set(key(t), [...(map.get(key(t)) ?? []), t]));
  return [...map.entries()].map(([name, arr]) => {
    const wins = arr.filter((t) => t.pnl > 0);
    const losses = arr.filter((t) => t.pnl < 0);
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
    return {
      name,
      count: arr.length,
      pnl: arr.reduce((s, t) => s + t.pnl, 0),
      winRate: arr.length ? (wins.length / arr.length) * 100 : 0,
      avgWin,
      avgLoss,
      rr: avgLoss ? avgWin / avgLoss : 0,
      avgHolding: arr.length ? arr.reduce((s, t) => s + (t.holdingMinutes ?? 0), 0) / arr.length : 0,
    };
  });
}

export function AnalyticsPage() {
  const { trades, strategies } = useJournalStore();
  const [filters, setFilters] = useState({ strategy: 'all', symbol: 'all', direction: 'all', tag: 'all', emotion: 'all', follows: 'all', from: '', to: '' });

  const uniqueSymbols = [...new Set(trades.map((t) => t.symbol))];
  const uniqueTags = [...new Set(trades.flatMap((t) => t.tags))];

  const filtered = useMemo(() => trades
    .filter((t) => (filters.strategy === 'all' ? true : t.strategyId === filters.strategy))
    .filter((t) => (filters.symbol === 'all' ? true : t.symbol === filters.symbol))
    .filter((t) => (filters.direction === 'all' ? true : t.direction === filters.direction))
    .filter((t) => (filters.tag === 'all' ? true : t.tags.includes(filters.tag)))
    .filter((t) => (filters.emotion === 'all' ? true : t.emotion === filters.emotion))
    .filter((t) => (filters.follows === 'all' ? true : String(t.followsSystem) === filters.follows))
    .filter((t) => (filters.from ? dayjs(t.tradeDate).isAfter(dayjs(filters.from).subtract(1, 'day')) : true))
    .filter((t) => (filters.to ? dayjs(t.tradeDate).isBefore(dayjs(filters.to).add(1, 'day')) : true)), [filters, trades]);

  const overview = useMemo(() => {
    const wins = filtered.filter((t) => t.pnl > 0);
    const losses = filtered.filter((t) => t.pnl < 0);
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
    const rr = avgLoss ? avgWin / avgLoss : 0;
    const profitFactor = losses.length ? wins.reduce((s, t) => s + t.pnl, 0) / Math.abs(losses.reduce((s, t) => s + t.pnl, 0)) : 0;
    return {
      totalTrades: filtered.length,
      totalPnl: filtered.reduce((s, t) => s + t.pnl, 0),
      winRate: filtered.length ? (wins.length / filtered.length) * 100 : 0,
      avgWin,
      avgLoss,
      rr,
      profitFactor,
      ...getStreak(filtered),
    };
  }, [filtered]);

  const equityData = useMemo(() => {
    let cumulative = 0;
    return [...filtered].sort((a, b) => dayjs(a.tradeDate).valueOf() - dayjs(b.tradeDate).valueOf()).map((t, i) => {
      cumulative += t.pnl;
      return { idx: i + 1, date: dayjs(t.tradeDate).format('MM-DD'), cumulative, pnl: t.pnl, title: t.title };
    });
  }, [filtered]);

  const monthly = useMemo(() => {
    const grouped = byGroup(filtered, (t) => dayjs(t.tradeDate).format('YYYY-MM'));
    return grouped.map((g) => ({ month: g.name, pnl: g.pnl, count: g.count, winRate: g.winRate }));
  }, [filtered]);

  const strategyData = useMemo(() => byGroup(filtered, (t) => strategies.find((s) => s.id === t.strategyId)?.name ?? '未知策略'), [filtered, strategies]);
  const symbolData = useMemo(() => byGroup(filtered, (t) => t.symbol), [filtered]);
  const weekdayData = useMemo(() => weekdays.map((d, i) => {
    const arr = filtered.filter((t) => dayjs(t.tradeDate).day() === i);
    return { day: d, count: arr.length, pnl: arr.reduce((s, t) => s + t.pnl, 0), winRate: arr.length ? (arr.filter((t) => t.pnl > 0).length / arr.length) * 100 : 0 };
  }), [filtered]);
  const emotionData = useMemo(() => byGroup(filtered.filter((t) => Boolean(t.emotion)), (t) => t.emotion), [filtered]);
  const directionData = useMemo(() => byGroup(filtered, (t) => t.direction), [filtered]);
  const pnlDistribution = useMemo(() => filtered.map((t, idx) => ({ idx: idx + 1, pnl: t.pnl })), [filtered]);

  const insights = useMemo(() => {
    const list: string[] = [];
    const bestSymbol = [...symbolData].sort((a, b) => b.pnl - a.pnl)[0];
    const weakDay = [...weekdayData].sort((a, b) => a.pnl - b.pnl)[0];
    const longStat = directionData.find((d) => d.name === '做多');
    const shortStat = directionData.find((d) => d.name === '做空');
    if (bestSymbol) list.push(`${bestSymbol.name} 是当前盈利贡献最高的品种。`);
    const weakStrategy = [...strategyData].sort((a, b) => a.pnl - b.pnl)[0];
    if (weakStrategy) list.push(`${weakStrategy.name} 当前总盈亏最低，建议复查入场筛选标准。`);
    const hotEmotion = emotionData.find((e) => e.name === '上头' || e.name === '报复性交易');
    if (hotEmotion && hotEmotion.pnl < 0) list.push(`${hotEmotion.name} 状态下整体为亏损，建议触发强制冷却。`);
    if (weakDay) list.push(`${weakDay.day} 表现偏弱，可降低仓位或减少交易次数。`);
    if (longStat && shortStat) list.push(longStat.pnl > shortStat.pnl ? '当前做多表现优于做空。' : '当前做空表现优于做多。');
    return list.slice(0, 5);
  }, [directionData, emotionData, strategyData, symbolData, weekdayData]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold gold-text">统计分析</h2>
          <p className="muted">从策略、品种、方向、情绪与时间维度洞察交易表现</p>
        </div>
        <p className="text-sm muted">当前范围：{filtered.length} 笔交易</p>
      </Card>

      <Card>
        <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
          <Select value={filters.strategy} onChange={(e) => setFilters({ ...filters, strategy: e.target.value })}><option value="all">全部策略</option>{strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          <Select value={filters.symbol} onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}><option value="all">全部品种</option>{uniqueSymbols.map((s) => <option key={s}>{s}</option>)}</Select>
          <Select value={filters.direction} onChange={(e) => setFilters({ ...filters, direction: e.target.value })}><option value="all">全部方向</option><option>做多</option><option>做空</option></Select>
          <Select value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })}><option value="all">全部标签</option>{uniqueTags.map((t) => <option key={t}>{t}</option>)}</Select>
          <Select value={filters.follows} onChange={(e) => setFilters({ ...filters, follows: e.target.value })}><option value="all">系统符合度</option><option value="true">符合系统</option><option value="false">不符合系统</option></Select>
          <Select value={filters.emotion} onChange={(e) => setFilters({ ...filters, emotion: e.target.value })}><option value="all">全部情绪</option><option>冷静</option><option>犹豫</option><option>焦虑</option><option>上头</option><option>报复性交易</option></Select>
          <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <div className="flex gap-2"><Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /><Button variant="ghost" onClick={() => setFilters({ strategy: 'all', symbol: 'all', direction: 'all', tag: 'all', emotion: 'all', follows: 'all', from: '', to: '' })}>重置</Button></div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {[
          ['总交易', overview.totalTrades],
          ['总盈亏', overview.totalPnl.toFixed(2)],
          ['胜率', `${overview.winRate.toFixed(1)}%`],
          ['平均盈利', overview.avgWin.toFixed(2)],
          ['平均亏损', overview.avgLoss.toFixed(2)],
          ['盈亏比', overview.rr.toFixed(2)],
          ['Profit Factor', overview.profitFactor.toFixed(2)],
          ['最大连赢', overview.maxWinStreak],
          ['最大连亏', overview.maxLossStreak],
        ].map(([k, v]) => <Card key={String(k)}><p className="muted text-xs">{k}</p><p className={`mt-1 text-2xl font-semibold ${k === '总盈亏' ? (overview.totalPnl >= 0 ? 'stat-good' : 'stat-bad') : ''}`}>{v}</p></Card>)}
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">累计收益曲线</h3>
          <div className="h-72"><ResponsiveContainer><ComposedChart data={equityData}><CartesianGrid stroke="#26303e" /><XAxis dataKey="idx" stroke="#7f8ca3" /><YAxis stroke="#7f8ca3" /><Tooltip /><Line type="monotone" dataKey="cumulative" stroke={chartPalette.gold} strokeWidth={2.2} dot={false} /></ComposedChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">月度盈亏柱状图</h3>
          <div className="h-72"><ResponsiveContainer><BarChart data={monthly}><CartesianGrid stroke="#26303e" /><XAxis dataKey="month" stroke="#7f8ca3" /><YAxis stroke="#7f8ca3" /><Tooltip /><Bar dataKey="pnl">{monthly.map((m) => <Cell key={m.month} fill={m.pnl >= 0 ? chartPalette.green : chartPalette.red} />)}</Bar></BarChart></ResponsiveContainer></div>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card><h3 className="mb-2 font-semibold">策略表现对比</h3><div className="h-60"><ResponsiveContainer><BarChart data={strategyData}><CartesianGrid stroke="#26303e" /><XAxis dataKey="name" stroke="#7f8ca3" /><YAxis stroke="#7f8ca3" /><Tooltip /><Bar dataKey="pnl" fill={chartPalette.gold} /></BarChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-2 font-semibold">品种表现对比</h3><div className="h-60"><ResponsiveContainer><BarChart data={symbolData}><CartesianGrid stroke="#26303e" /><XAxis dataKey="name" stroke="#7f8ca3" /><YAxis stroke="#7f8ca3" /><Tooltip /><Bar dataKey="pnl" fill={chartPalette.blue} /></BarChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-2 font-semibold">方向分析</h3>{directionData.map((d) => <p key={d.name} className="mb-1 text-sm">{d.name}：{d.count} 笔 / 胜率 {d.winRate.toFixed(1)}% / <span className={d.pnl >= 0 ? 'stat-good' : 'stat-bad'}>{d.pnl.toFixed(2)}</span></p>)}</Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card><h3 className="mb-2 font-semibold">盈亏分布图</h3><div className="h-60"><ResponsiveContainer><ScatterChart><CartesianGrid stroke="#26303e" /><XAxis dataKey="idx" stroke="#7f8ca3" /><YAxis dataKey="pnl" stroke="#7f8ca3" /><Tooltip /><Scatter data={pnlDistribution} fill={chartPalette.gold} /></ScatterChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-2 font-semibold">星期维度表现</h3><div className="h-60"><ResponsiveContainer><BarChart data={weekdayData}><CartesianGrid stroke="#26303e" /><XAxis dataKey="day" stroke="#7f8ca3" /><YAxis stroke="#7f8ca3" /><Tooltip /><Bar dataKey="pnl" fill={chartPalette.blue} /></BarChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-2 font-semibold">情绪状态影响</h3>{emotionData.length ? <div className="h-60"><ResponsiveContainer><PieChart><Pie data={emotionData} dataKey="count" nameKey="name" outerRadius={80} fill={chartPalette.gold} /><Tooltip /></PieChart></ResponsiveContainer></div> : <p className="muted">暂无情绪数据，已自动降级。</p>}</Card>
      </div>

      <Card>
        <h3 className="mb-2 font-semibold">洞察提示</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">{insights.map((i) => <li key={i}>{i}</li>)}</ul>
      </Card>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">策略明细表</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm"><thead className="muted"><tr><th>策略</th><th>次数</th><th>胜率</th><th>总盈亏</th><th>平均盈利</th><th>平均亏损</th><th>盈亏比</th></tr></thead><tbody>{[...strategyData].sort((a, b) => b.pnl - a.pnl).map((s) => <tr key={s.name} className="border-t border-[var(--line-soft)]"><td>{s.name}</td><td>{s.count}</td><td>{s.winRate.toFixed(1)}%</td><td className={s.pnl >= 0 ? 'stat-good' : 'stat-bad'}>{s.pnl.toFixed(2)}</td><td>{s.avgWin.toFixed(2)}</td><td>{s.avgLoss.toFixed(2)}</td><td>{s.rr.toFixed(2)}</td></tr>)}</tbody></table>
          </div>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">品种明细表</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm"><thead className="muted"><tr><th>品种</th><th>次数</th><th>总盈亏</th><th>胜率</th><th>盈亏比</th><th>平均持仓</th></tr></thead><tbody>{[...symbolData].sort((a, b) => b.pnl - a.pnl).map((s) => <tr key={s.name} className="border-t border-[var(--line-soft)]"><td>{s.name}</td><td>{s.count}</td><td className={s.pnl >= 0 ? 'stat-good' : 'stat-bad'}>{s.pnl.toFixed(2)}</td><td>{s.winRate.toFixed(1)}%</td><td>{s.rr.toFixed(2)}</td><td>{s.avgHolding.toFixed(1)} 分钟</td></tr>)}</tbody></table>
          </div>
        </Card>
      </div>
    </div>
  );
}
