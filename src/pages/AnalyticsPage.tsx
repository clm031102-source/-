import dayjs from 'dayjs';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useMemo, useState } from 'react';
import { useJournalStore } from '@/store/useJournalStore';
import { Trade } from '@/types/trade';

const chartPalette = { gold: '#c6a46f', green: '#38b27b', red: '#d56767' };
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const tooltipStyle = {
  contentStyle: { background: '#121212', border: '1px solid #3a3227', borderRadius: 10, color: '#f1ede3' },
  itemStyle: { color: '#f1ede3' },
  labelStyle: { color: '#f1ede3' },
};

function byGroup(trades: Trade[], key: (t: Trade) => string) {
  const map = new Map<string, Trade[]>();
  trades.forEach((t) => map.set(key(t), [...(map.get(key(t)) ?? []), t]));
  return [...map.entries()].map(([name, arr]) => ({
    name,
    count: arr.length,
    pnl: arr.reduce((s, t) => s + t.pnl, 0),
    winRate: arr.length ? (arr.filter((x) => x.pnl > 0).length / arr.length) * 100 : 0,
  }));
}

export function AnalyticsPage() {
  const { trades, strategies } = useJournalStore();
  const [filters, setFilters] = useState({ strategy: 'all', symbol: 'all', setup: 'all', mistake: 'all', direction: 'all', tag: 'all', emotion: 'all', follows: 'all', from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);

  const uniqueSymbols = [...new Set(trades.map((t) => t.symbol))];
  const uniqueTags = [...new Set(trades.flatMap((t) => t.tags || []))];
  const uniqueSetups = [...new Set(trades.map((t) => t.setup).filter(Boolean) as string[])];
  const uniqueMistakes = [...new Set(trades.flatMap((t) => t.mistakes ?? []))];

  const filtered = useMemo(() => trades
    .filter((t) => (filters.strategy === 'all' ? true : t.strategyId === filters.strategy))
    .filter((t) => (filters.symbol === 'all' ? true : t.symbol === filters.symbol))
    .filter((t) => (filters.setup === 'all' ? true : t.setup === filters.setup))
    .filter((t) => (filters.mistake === 'all' ? true : (t.mistakes ?? []).includes(filters.mistake)))
    .filter((t) => (filters.direction === 'all' ? true : t.direction === filters.direction))
    .filter((t) => (filters.tag === 'all' ? true : (t.tags || []).includes(filters.tag)))
    .filter((t) => (filters.emotion === 'all' ? true : t.emotion === filters.emotion))
    .filter((t) => (filters.follows === 'all' ? true : String(t.followsSystem) === filters.follows))
    .filter((t) => (filters.from ? dayjs(t.tradeDate).isAfter(dayjs(filters.from).subtract(1, 'day')) : true))
    .filter((t) => (filters.to ? dayjs(t.tradeDate).isBefore(dayjs(filters.to).add(1, 'day')) : true)), [filters, trades]);

  const overview = useMemo(() => {
    const wins = filtered.filter((t) => t.pnl > 0);
    const losses = filtered.filter((t) => t.pnl < 0);
    const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const avgWinner = wins.length ? grossWin / wins.length : 0;
    const avgLoser = losses.length ? grossLoss / losses.length : 0;
    const expectancy = filtered.length ? (grossWin - grossLoss) / filtered.length : 0;
    return {
      totalTrades: filtered.length,
      totalPnl: filtered.reduce((s, t) => s + t.pnl, 0),
      winRate: filtered.length ? (wins.length / filtered.length) * 100 : 0,
      avgWinner,
      avgLoser,
      expectancy,
      profitFactor: grossLoss ? grossWin / grossLoss : 0,
    };
  }, [filtered]);

  const equityData = useMemo(() => {
    let c = 0;
    return [...filtered].sort((a, b) => dayjs(a.tradeDate).valueOf() - dayjs(b.tradeDate).valueOf()).map((t, i) => ({ idx: i + 1, cumulative: (c += t.pnl) }));
  }, [filtered]);
  const monthly = useMemo(() => byGroup(filtered, (t) => dayjs(t.tradeDate).format('YYYY-MM')).map((g) => ({ month: g.name, pnl: g.pnl })), [filtered]);
  const strategyData = useMemo(() => byGroup(filtered, (t) => strategies.find((s) => s.id === t.strategyId)?.name ?? '未知策略'), [filtered, strategies]);
  const symbolData = useMemo(() => byGroup(filtered, (t) => t.symbol), [filtered]);
  const setupData = useMemo(() => byGroup(filtered, (t) => t.setup || '未填写setup'), [filtered]);
  const mistakeData = useMemo(() => byGroup(filtered.flatMap((t) => (t.mistakes ?? []).map((m) => ({ ...t, _mistake: m } as Trade & { _mistake: string }))), (t) => (t as Trade & { _mistake: string })._mistake || '未归因'), [filtered]);
  const directionData = useMemo(() => byGroup(filtered, (t) => t.direction), [filtered]);
  const emotionData = useMemo(() => byGroup(filtered.filter((t) => Boolean(t.emotion)), (t) => t.emotion), [filtered]);
  const weekdayData = useMemo(() => weekdays.map((day, i) => {
    const arr = filtered.filter((t) => dayjs(t.tradeDate).day() === i);
    return { day, pnl: arr.reduce((s, t) => s + t.pnl, 0) };
  }), [filtered]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold gold-text">统计分析</h2>
          <p className="muted">按品种、策略、setup、mistake、方向、情绪与时间拆解盈亏来源</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm muted">当前数据范围：{filtered.length} 笔</p>
          <Button variant="primary" onClick={() => setShowFilters((v) => !v)}>{showFilters ? '收起筛选' : '筛选'}</Button>
        </div>
      </Card>

      {showFilters && (
        <Card>
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-10">
            <Select value={filters.symbol} onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}><option value="all">全部品种</option>{uniqueSymbols.map((s) => <option key={s}>{s}</option>)}</Select>
            <Select value={filters.strategy} onChange={(e) => setFilters({ ...filters, strategy: e.target.value })}><option value="all">全部策略</option>{strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
            <Select value={filters.setup} onChange={(e) => setFilters({ ...filters, setup: e.target.value })}><option value="all">全部setup</option>{uniqueSetups.map((s) => <option key={s}>{s}</option>)}</Select>
            <Select value={filters.mistake} onChange={(e) => setFilters({ ...filters, mistake: e.target.value })}><option value="all">全部mistake</option>{uniqueMistakes.map((s) => <option key={s}>{s}</option>)}</Select>
            <Select value={filters.direction} onChange={(e) => setFilters({ ...filters, direction: e.target.value })}><option value="all">全部方向</option><option>做多</option><option>做空</option></Select>
            <Select value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })}><option value="all">全部标签</option>{uniqueTags.map((t) => <option key={t}>{t}</option>)}</Select>
            <Select value={filters.follows} onChange={(e) => setFilters({ ...filters, follows: e.target.value })}><option value="all">系统符合度</option><option value="true">符合系统</option><option value="false">不符合系统</option></Select>
            <Select value={filters.emotion} onChange={(e) => setFilters({ ...filters, emotion: e.target.value })}><option value="all">全部情绪</option><option>冷静</option><option>专注</option><option>犹豫</option><option>焦虑</option><option>上头</option><option>报复性交易</option></Select>
            <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            <div className="flex gap-2"><Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /><Button variant="ghost" onClick={() => setFilters({ strategy: 'all', symbol: 'all', setup: 'all', mistake: 'all', direction: 'all', tag: 'all', emotion: 'all', follows: 'all', from: '', to: '' })}>重置</Button></div>
          </div>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        <Card><p className="muted text-xs">总交易</p><p className="mt-1 text-2xl font-semibold">{overview.totalTrades}</p></Card>
        <Card><p className="muted text-xs">总盈亏</p><p className={`mt-1 text-2xl font-semibold ${overview.totalPnl >= 0 ? 'stat-good' : 'stat-bad'}`}>{overview.totalPnl.toFixed(2)}</p></Card>
        <Card><p className="muted text-xs">胜率</p><p className="mt-1 text-2xl font-semibold">{overview.winRate.toFixed(1)}%</p></Card>
        <Card><p className="muted text-xs">Expectancy</p><p className="mt-1 text-2xl font-semibold">{overview.expectancy.toFixed(2)}</p></Card>
        <Card><p className="muted text-xs">Avg Winner</p><p className="mt-1 text-2xl font-semibold stat-good">{overview.avgWinner.toFixed(2)}</p></Card>
        <Card><p className="muted text-xs">Avg Loser</p><p className="mt-1 text-2xl font-semibold stat-bad">{overview.avgLoser.toFixed(2)}</p></Card>
        <Card><p className="muted text-xs">Profit Factor</p><p className="mt-1 text-2xl font-semibold">{overview.profitFactor.toFixed(2)}</p></Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card><h3 className="mb-2 font-semibold">收益曲线</h3><div className="h-72"><ResponsiveContainer><ComposedChart data={equityData}><CartesianGrid /><XAxis dataKey="idx" stroke="#9b9587" /><YAxis stroke="#9b9587" /><Tooltip {...tooltipStyle} /><Line type="monotone" dataKey="cumulative" stroke={chartPalette.gold} strokeWidth={2.2} dot={false} /></ComposedChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-2 font-semibold">月度盈亏柱状图</h3><div className="h-72"><ResponsiveContainer><BarChart data={monthly}><CartesianGrid /><XAxis dataKey="month" stroke="#9b9587" /><YAxis stroke="#9b9587" /><Tooltip {...tooltipStyle} /><Bar dataKey="pnl" barSize={26} radius={[6, 6, 0, 0]}>{monthly.map((m) => <Cell key={m.month} fill={m.pnl >= 0 ? chartPalette.green : chartPalette.red} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card><h3 className="mb-2 font-semibold">品种表现</h3><div className="h-56"><ResponsiveContainer><BarChart data={symbolData}><CartesianGrid /><XAxis dataKey="name" stroke="#9b9587" /><YAxis stroke="#9b9587" /><Tooltip {...tooltipStyle} /><Bar dataKey="pnl" fill={chartPalette.gold} /></BarChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-2 font-semibold">策略 / setup 表现</h3><div className="h-56"><ResponsiveContainer><BarChart data={setupData}><CartesianGrid /><XAxis dataKey="name" stroke="#9b9587" /><YAxis stroke="#9b9587" /><Tooltip {...tooltipStyle} /><Bar dataKey="pnl" fill={chartPalette.green} /></BarChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-2 font-semibold">mistake 表现</h3><div className="h-56"><ResponsiveContainer><BarChart data={mistakeData}><CartesianGrid /><XAxis dataKey="name" stroke="#9b9587" /><YAxis stroke="#9b9587" /><Tooltip {...tooltipStyle} /><Bar dataKey="pnl" fill={chartPalette.red} /></BarChart></ResponsiveContainer></div></Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card><h3 className="mb-2 font-semibold">多空分析</h3>{directionData.map((d) => <p key={d.name}>{d.name}：{d.count} 笔，胜率 {d.winRate.toFixed(1)}%，盈亏 <span className={d.pnl >= 0 ? 'stat-good' : 'stat-bad'}>{d.pnl.toFixed(2)}</span></p>)}</Card>
        <Card><h3 className="mb-2 font-semibold">情绪分析</h3><div className="h-56"><ResponsiveContainer><BarChart data={emotionData}><CartesianGrid /><XAxis dataKey="name" stroke="#9b9587" /><YAxis stroke="#9b9587" /><Tooltip {...tooltipStyle} /><Bar dataKey="pnl" fill={chartPalette.gold} /></BarChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-2 font-semibold">星期维度</h3><div className="h-56"><ResponsiveContainer><BarChart data={weekdayData}><CartesianGrid /><XAxis dataKey="day" stroke="#9b9587" /><YAxis stroke="#9b9587" /><Tooltip {...tooltipStyle} /><Bar dataKey="pnl">{weekdayData.map((m) => <Cell key={m.day} fill={m.pnl >= 0 ? chartPalette.green : chartPalette.red} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card><h3 className="mb-2 font-semibold">策略表现明细</h3><div className="overflow-auto"><table className="w-full text-sm"><thead className="muted"><tr><th>策略</th><th>次数</th><th>胜率</th><th>总盈亏</th></tr></thead><tbody>{strategyData.map((item) => <tr key={item.name} className="border-t border-[var(--line-soft)]"><td>{item.name}</td><td>{item.count}</td><td>{item.winRate.toFixed(1)}%</td><td className={item.pnl >= 0 ? 'stat-good' : 'stat-bad'}>{item.pnl.toFixed(2)}</td></tr>)}</tbody></table></div></Card>
        <Card><h3 className="mb-2 font-semibold">品种表现明细</h3><div className="overflow-auto"><table className="w-full text-sm"><thead className="muted"><tr><th>品种</th><th>次数</th><th>胜率</th><th>总盈亏</th></tr></thead><tbody>{symbolData.map((item) => <tr key={item.name} className="border-t border-[var(--line-soft)]"><td>{item.name}</td><td>{item.count}</td><td>{item.winRate.toFixed(1)}%</td><td className={item.pnl >= 0 ? 'stat-good' : 'stat-bad'}>{item.pnl.toFixed(2)}</td></tr>)}</tbody></table></div></Card>
      </div>
    </div>
  );
}
