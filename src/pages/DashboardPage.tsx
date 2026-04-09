import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useJournalStore } from '@/store/useJournalStore';
import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/Button';

export function DashboardPage() {
  const { trades, strategies } = useJournalStore();
  const sorted = [...trades].sort((a, b) => dayjs(a.tradeDate).valueOf() - dayjs(b.tradeDate).valueOf());
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const total = trades.reduce((s, t) => s + t.pnl, 0);
  const rr = (wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0) / (losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 1);
  const bestSymbol = useMemo(() => Object.entries(trades.reduce<Record<string, number>>((acc, t) => ((acc[t.symbol] = (acc[t.symbol] || 0) + t.pnl), acc), {})).sort((a, b) => b[1] - a[1])[0], [trades]);
  const bestStrategy = useMemo(() => Object.entries(trades.reduce<Record<string, number>>((acc, t) => ((acc[t.strategyId] = (acc[t.strategyId] || 0) + t.pnl), acc), {})).sort((a, b) => b[1] - a[1])[0], [trades]);

  let c = 0;
  const equity = sorted.map((t) => ({ date: dayjs(t.tradeDate).format('MM-DD'), value: (c += t.pnl) }));
  const pie = [{ name: '盈利', value: wins.length, color: '#29a66a' }, { name: '亏损', value: losses.length, color: '#d35d5d' }];

  const insight = [
    bestSymbol ? `当前盈利主要来自 ${bestSymbol[0]}。` : '暂无品种数据。',
    `做${trades.filter((t) => t.direction === '做多').reduce((s, t) => s + t.pnl, 0) >= trades.filter((t) => t.direction === '做空').reduce((s, t) => s + t.pnl, 0) ? '多' : '空'}表现更强。`,
    bestStrategy ? `${strategies.find((s) => s.id === bestStrategy[0])?.name ?? bestStrategy[0]} 近阶段最强。` : '暂无策略洞察。',
  ];

  return (
    <div className="space-y-3">
      <Card className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold gold-text">交易仪表盘</h2>
          <p className="muted">当前范围：全部历史交易 · 最后更新 {dayjs().format('YYYY-MM-DD HH:mm')}</p>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        <Card><p className="muted">交易笔数</p><p className="text-3xl font-semibold">{trades.length}</p></Card>
        <Card><p className="muted">总盈亏</p><p className={`text-3xl font-semibold ${total >= 0 ? 'stat-good' : 'stat-bad'}`}>{total.toFixed(2)}</p></Card>
        <Card><p className="muted">胜率</p><p className="text-3xl font-semibold">{trades.length ? ((wins.length / trades.length) * 100).toFixed(1) : 0}%</p></Card>
        <Card><p className="muted">盈亏比</p><p className="text-3xl font-semibold">{rr.toFixed(2)}</p></Card>
        <Card><p className="muted">平均盈利</p><p className="text-xl stat-good">{(wins.reduce((s, t) => s + t.pnl, 0) / (wins.length || 1)).toFixed(2)}</p></Card>
        <Card><p className="muted">平均亏损</p><p className="text-xl stat-bad">{(Math.abs(losses.reduce((s, t) => s + t.pnl, 0)) / (losses.length || 1)).toFixed(2)}</p></Card>
        <Card><p className="muted">最佳品种</p><p className="text-xl">{bestSymbol?.[0] ?? '-'}</p></Card>
        <Card><p className="muted">最佳策略</p><p className="text-xl">{bestStrategy ? strategies.find((s) => s.id === bestStrategy[0])?.name : '-'}</p></Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card className="xl:col-span-2"><h3 className="mb-2 font-semibold">累计收益简图</h3><div className="h-56"><ResponsiveContainer><LineChart data={equity}><CartesianGrid stroke="#2a3443"/><XAxis dataKey="date" stroke="#8f9aab"/><YAxis stroke="#8f9aab"/><Tooltip/><Line dataKey="value" stroke="#c8a978" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-2 font-semibold">盈亏分布摘要</h3><div className="h-56"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" nameKey="name" outerRadius={70}>{pie.map((p) => <Cell key={p.name} fill={p.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div></Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card>
          <h3 className="mb-2 font-semibold">最近记录</h3>
          <div className="space-y-2 text-sm">{[...trades].sort((a, b) => dayjs(b.tradeDate).valueOf() - dayjs(a.tradeDate).valueOf()).slice(0, 5).map((t) => <div key={t.id} className="rounded-lg border border-[var(--line-soft)] p-2"><p>{t.symbol} · {t.direction}</p><p className="muted">{dayjs(t.tradeDate).format('MM-DD HH:mm')}</p><p className={t.pnl >= 0 ? 'stat-good' : 'stat-bad'}>{t.pnl.toFixed(2)}</p></div>)}</div>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">快速洞察</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">{insight.map((i) => <li key={i}>{i}</li>)}</ul>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">快速入口</h3>
          <div className="grid gap-2"><Link to="/new"><Button variant="primary" className="w-full">新增记录</Button></Link><Link to="/analytics"><Button className="w-full">进入统计分析</Button></Link><Link to="/calculator"><Button className="w-full">打开开仓计算器</Button></Link></div>
        </Card>
      </div>
    </div>
  );
}
