import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { useJournalStore } from '@/store/useJournalStore';

export function AnalyticsPage() {
  const { trades, strategies, selectedStrategyForStats, setSelectedStrategyForStats } = useJournalStore();
  const filtered = selectedStrategyForStats === 'all' ? trades : trades.filter((t) => t.strategyId === selectedStrategyForStats);

  const bySymbol = Object.entries(filtered.reduce<Record<string, number>>((acc, t) => ((acc[t.symbol] = (acc[t.symbol] || 0) + t.pnl), acc), {}));
  const byDirection = Object.entries(filtered.reduce<Record<string, number>>((acc, t) => ((acc[t.direction] = (acc[t.direction] || 0) + t.pnl), acc), {}));

  return (
    <div className="space-y-3">
      <Card className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">统计分析</h2>
        <Select className="w-72" value={selectedStrategyForStats} onChange={(e) => setSelectedStrategyForStats(e.target.value)}>
          <option value="all">全部策略合并统计</option>
          {strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">按品种盈亏</h3>
          {bySymbol.map(([symbol, pnl]) => <p key={symbol}>{symbol}: <span className={pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{pnl.toFixed(2)}</span></p>)}
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">按方向盈亏</h3>
          {byDirection.map(([dir, pnl]) => <p key={dir}>{dir}: <span className={pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{pnl.toFixed(2)}</span></p>)}
        </Card>
      </div>
    </div>
  );
}
