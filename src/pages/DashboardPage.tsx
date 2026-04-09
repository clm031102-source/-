import { Card } from '@/components/ui/Card';
import { useJournalStore } from '@/store/useJournalStore';

export function DashboardPage() {
  const { trades } = useJournalStore();
  const total = trades.reduce((s, t) => s + t.pnl, 0);
  const winRate = trades.length ? (trades.filter((t) => t.pnl > 0).length / trades.length) * 100 : 0;

  return (
    <div className="space-y-3">
      <Card>
        <h2 className="text-2xl font-semibold gold-text">仪表盘</h2>
        <p className="muted">今日概览与交易状态</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        <Card><p className="muted">交易笔数</p><p className="text-3xl font-semibold">{trades.length}</p></Card>
        <Card><p className="muted">总盈亏</p><p className={`text-3xl font-semibold ${total >= 0 ? 'stat-good' : 'stat-bad'}`}>{total.toFixed(2)}</p></Card>
        <Card><p className="muted">胜率</p><p className="text-3xl font-semibold">{winRate.toFixed(1)}%</p></Card>
      </div>
    </div>
  );
}
