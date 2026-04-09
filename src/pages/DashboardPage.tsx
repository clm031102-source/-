import { Card } from '@/components/ui/Card';
import { useJournalStore } from '@/store/useJournalStore';

export function DashboardPage() {
  const { trades, strategies, selectedStrategyForStats } = useJournalStore();
  const filtered = selectedStrategyForStats === 'all' ? trades : trades.filter((t) => t.strategyId === selectedStrategyForStats);
  const total = filtered.reduce((s, t) => s + t.pnl, 0);
  const winRate = filtered.length ? (filtered.filter((t) => t.pnl > 0).length / filtered.length) * 100 : 0;

  return (
    <div className="space-y-3">
      <Card className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">仪表盘</h2>
          <p className="text-slate-400">当前统计：{selectedStrategyForStats === 'all' ? '全部策略合并' : strategies.find((s) => s.id === selectedStrategyForStats)?.name}</p>
        </div>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        <Card><p className="text-slate-400">交易笔数</p><p className="text-3xl font-semibold">{filtered.length}</p></Card>
        <Card><p className="text-slate-400">总盈亏</p><p className={`text-3xl font-semibold ${total >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{total.toFixed(2)}</p></Card>
        <Card><p className="text-slate-400">胜率</p><p className="text-3xl font-semibold">{winRate.toFixed(1)}%</p></Card>
      </div>
    </div>
  );
}
