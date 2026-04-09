import dayjs from 'dayjs';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { useTradeAnalytics } from '@/hooks/useTradeAnalytics';
import { useTradeStore } from '@/store/tradeStore';

export function DashboardPage() {
  const { trades, summaries, strategies } = useTradeStore();
  const { stats, equityCurve, strategyStats } = useTradeAnalytics(trades);

  const last7 = trades.filter((t) => dayjs(t.tradeDate).isAfter(dayjs().subtract(7, 'day'))).length;
  const pnlDistribution = [
    { name: '盈利', value: trades.filter((t) => t.pnlAmount > 0).length, color: '#22c55e' },
    { name: '亏损', value: trades.filter((t) => t.pnlAmount < 0).length, color: '#ef4444' },
    { name: '持平', value: trades.filter((t) => t.pnlAmount === 0).length, color: '#64748b' },
  ];
  const latestSummary = summaries[0];

  const statCards = [
    ['总交易笔数', stats.totalTrades],
    ['总盈亏金额', stats.totalPnl.toFixed(2)],
    ['胜率', `${stats.winRate.toFixed(1)}%`],
    ['平均盈亏比', stats.averageRiskReward.toFixed(2)],
    ['最大连胜', stats.maxWinStreak],
    ['最大连亏', stats.maxLossStreak],
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map(([label, value]) => (
          <Card key={String(label)} className="p-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-300">最近30天收益趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurve.slice(-30)}>
                <CartesianGrid stroke="#243047" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#60a5fa" fill="#60a5fa22" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-slate-400">最近7天交易笔数：{last7}</p>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-300">盈亏分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pnlDistribution} dataKey="value" nameKey="name" outerRadius={88}>
                  {pnlDistribution.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">按策略表现概览</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyStats.map((item) => ({ ...item, name: strategies.find((s) => s.id === item.name)?.name ?? item.name }))}>
                <CartesianGrid stroke="#243047" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="pnl" fill="#818cf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-300">最近交易</h3>
          <ul className="space-y-2 text-sm">
            {trades.slice(0, 5).map((trade) => (
              <li key={trade.id} className="rounded border border-border p-2">
                <p className="font-medium">{trade.title}</p>
                <p className="text-xs text-slate-400">{dayjs(trade.tradeDate).format('MM-DD HH:mm')} · {trade.symbol}</p>
                <p className={trade.pnlAmount >= 0 ? 'text-green-400' : 'text-red-400'}>{trade.pnlAmount.toFixed(2)}</p>
              </li>
            ))}
          </ul>
          {latestSummary && (
            <div className="mt-3 rounded border border-border bg-slate-900/50 p-2 text-xs text-slate-300">
              <p className="font-semibold">最近总结（{latestSummary.type}）</p>
              <p>{latestSummary.nextFocus}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
