import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useJournalStore } from '@/store/useJournalStore';
import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/Button';

const tooltipStyle = {
  contentStyle: { background: '#121212', border: '1px solid #3a3227', borderRadius: 10, color: '#f1ede3' },
  itemStyle: { color: '#f1ede3' },
  labelStyle: { color: '#f1ede3' },
};

export function DashboardPage() {
  const { trades, strategies } = useJournalStore();
  const sorted = [...trades].sort((a, b) => dayjs(a.tradeDate).valueOf() - dayjs(b.tradeDate).valueOf());
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const total = trades.reduce((s, t) => s + t.pnl, 0);
  const last7 = trades.filter((t) => dayjs(t.tradeDate).isAfter(dayjs().subtract(7, 'day')));

  const rr = (wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0) / (losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 1);
  const strategyPnL = useMemo(() => Object.entries(trades.reduce<Record<string, number>>((acc, t) => ((acc[t.strategyId] = (acc[t.strategyId] || 0) + t.pnl), acc), {})).map(([id, pnl]) => ({ name: strategies.find((s) => s.id === id)?.name ?? id, pnl })), [strategies, trades]);
  const anomaly = trades.filter((t) => !t.followsSystem || t.impulseTrade || t.revengeTrading).slice(0, 3);

  let c = 0;
  const equity = sorted.map((t) => ({ date: dayjs(t.tradeDate).format('MM-DD'), value: (c += t.pnl) }));

  const insight = [
    last7.length ? `最近 7 天共交易 ${last7.length} 笔，累计盈亏 ${last7.reduce((s, t) => s + t.pnl, 0).toFixed(2)}。` : '最近 7 天暂无交易。',
    `系统符合度 ${(trades.length ? (trades.filter((t) => t.followsSystem).length / trades.length) * 100 : 0).toFixed(1)}%。`,
    rr >= 1 ? '当前盈亏比健康，可继续保持执行稳定。' : '盈亏比偏低，建议提升入场质量。',
  ];

  return (
    <div className="space-y-3">
      <Card>
        <h2 className="text-2xl font-semibold gold-text">交易仪表盘</h2>
        <p className="muted">最近收益概况、近期表现、异常提醒与快捷入口</p>
      </Card>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Card><p className="muted">总交易</p><p className="text-3xl font-semibold">{trades.length}</p></Card>
        <Card><p className="muted">总盈亏</p><p className={`text-3xl font-semibold ${total >= 0 ? 'stat-good' : 'stat-bad'}`}>{total.toFixed(2)}</p></Card>
        <Card><p className="muted">胜率</p><p className="text-3xl font-semibold">{trades.length ? ((wins.length / trades.length) * 100).toFixed(1) : 0}%</p></Card>
        <Card><p className="muted">盈亏比</p><p className="text-3xl font-semibold">{rr.toFixed(2)}</p></Card>
        <Card><p className="muted">近7天交易</p><p className="text-3xl font-semibold">{last7.length}</p></Card>
        <Card><p className="muted">近7天盈亏</p><p className={`text-3xl font-semibold ${last7.reduce((s, t) => s + t.pnl, 0) >= 0 ? 'stat-good' : 'stat-bad'}`}>{last7.reduce((s, t) => s + t.pnl, 0).toFixed(2)}</p></Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card className="xl:col-span-2"><h3 className="mb-2 font-semibold">近期表现卡片：累计收益</h3><div className="h-56"><ResponsiveContainer><LineChart data={equity}><CartesianGrid /><XAxis dataKey="date" stroke="#9b9587" /><YAxis stroke="#9b9587" /><Tooltip {...tooltipStyle} /><Line dataKey="value" stroke="#c6a46f" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></Card>
        <Card><h3 className="mb-2 font-semibold">策略摘要</h3><div className="h-56"><ResponsiveContainer><BarChart data={strategyPnL}><CartesianGrid /><XAxis dataKey="name" stroke="#9b9587" /><YAxis stroke="#9b9587" /><Tooltip {...tooltipStyle} /><Bar dataKey="pnl" fill="#c6a46f" /></BarChart></ResponsiveContainer></div></Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card>
          <h3 className="mb-2 font-semibold">最近交易</h3>
          <div className="space-y-2 text-sm">{[...trades].sort((a, b) => dayjs(b.tradeDate).valueOf() - dayjs(a.tradeDate).valueOf()).slice(0, 6).map((t) => <div key={t.id} className="rounded-lg border border-[var(--line-soft)] p-2"><p>{t.symbol} · {t.direction} · {t.title}</p><p className="muted">{dayjs(t.tradeDate).format('MM-DD HH:mm')}</p><p className={t.pnl >= 0 ? 'stat-good' : 'stat-bad'}>{t.pnl.toFixed(2)}</p></div>)}</div>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">异常提醒</h3>
          {anomaly.length ? anomaly.map((t) => <p key={t.id} className="mb-1 text-sm">{t.symbol} {dayjs(t.tradeDate).format('MM-DD')}：{!t.followsSystem ? '非系统单' : '冲动风险'}。</p>) : <p className="muted text-sm">近期暂无明显异常交易。</p>}
          <h3 className="mb-2 mt-3 font-semibold">简短洞察</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">{insight.map((i) => <li key={i}>{i}</li>)}</ul>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">快捷入口</h3>
          <div className="grid gap-2">
            <Link to="/new"><Button variant="primary" className="w-full">新增记录</Button></Link>
            <Link to="/trades"><Button className="w-full">查看交易记录</Button></Link>
            <Link to="/analytics"><Button className="w-full">进入统计分析</Button></Link>
            <Link to="/summaries"><Button className="w-full">写总结</Button></Link>
            <Link to="/calculator"><Button className="w-full">打开开仓计算器</Button></Link>
            <Link to="/settings"><Button className="w-full">数据管理</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
