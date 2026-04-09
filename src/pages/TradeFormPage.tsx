import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { TradeForm } from '@/features/trades/TradeForm';
import { useTradeStore } from '@/store/tradeStore';

export function TradeFormPage() {
  const { id } = useParams();
  const { trades } = useTradeStore();
  const trade = id ? trades.find((t) => t.id === id) : undefined;

  return (
    <div className="space-y-3">
      <Card>
        <h2 className="text-lg font-semibold">{trade ? '编辑交易' : '新增交易'}</h2>
      </Card>
      <TradeForm trade={trade} />
    </div>
  );
}
