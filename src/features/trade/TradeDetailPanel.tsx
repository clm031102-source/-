import dayjs from 'dayjs';
import { Card } from '@/components/ui/Card';
import { useJournalStore } from '@/store/useJournalStore';
import { Trade } from '@/types/trade';

export function TradeDetailPanel({ trade }: { trade: Trade }) {
  const { strategies } = useJournalStore();
  const strategy = strategies.find((s) => s.id === trade.strategyId);
  return (
    <div className="space-y-3">
      <Card>
        <h4 className="text-xl font-semibold gold-text">{trade.title}</h4>
        <p className="muted">{dayjs(trade.tradeDate).format('YYYY-MM-DD HH:mm')} · {trade.symbol} · {trade.direction}</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <h5 className="mb-1 font-semibold">价格与仓位</h5>
          <p>入场/出场：{trade.entryPrice} → {trade.exitPrice}</p>
          <p>数量：{trade.quantity}</p>
          <p>杠杆：{trade.leverage}x</p>
          <p>持仓时长：{trade.holdingMinutes ?? '-'} 分钟</p>
          <p className={trade.pnl >= 0 ? 'stat-good' : 'stat-bad'}>盈亏：{trade.pnl} ({trade.pnlPercent}%)</p>
        </Card>
        <Card>
          <h5 className="mb-1 font-semibold">策略与复盘</h5>
          <p>策略：{strategy?.name}</p>
          <p>系统内：{trade.followsSystem ? '是' : '否'}</p>
          <p>情绪：{trade.emotion}</p>
          <p>标签：{trade.tags.join(' / ') || '-'}</p>
          <p className="muted">入场：{trade.entryReason}</p>
          <p className="muted">出场：{trade.exitReason}</p>
        </Card>
      </div>
    </div>
  );
}
