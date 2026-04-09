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
        <h4 className="text-xl font-semibold">{trade.title}</h4>
        <p className="text-slate-400">{dayjs(trade.tradeDate).format('YYYY-MM-DD HH:mm')} · {trade.symbol} · {trade.direction}</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <h5 className="mb-1 font-semibold text-cyan-200">价格与仓位</h5>
          <p>入场/出场：{trade.entryPrice} → {trade.exitPrice}</p>
          <p>数量：{trade.quantity}</p>
          <p>杠杆：{trade.leverage}x</p>
          <p>手续费：{trade.fee}</p>
          <p className={trade.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}>盈亏：{trade.pnl} ({trade.pnlPercent}%)</p>
        </Card>
        <Card>
          <h5 className="mb-1 font-semibold text-cyan-200">策略与复盘</h5>
          <p>策略：{strategy?.name}</p>
          <p>入场：{trade.entryReason}</p>
          <p>出场：{trade.exitReason}</p>
          <p>情绪：{trade.emotion}</p>
          <p>复盘：{trade.review || '-'}</p>
          <p>标签：{trade.tags.join(' / ') || '-'}</p>
        </Card>
      </div>
    </div>
  );
}
