import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { TradeForm } from '@/features/trade/TradeForm';

export function NewTradePage() {
  const nav = useNavigate();
  return (
    <div className="space-y-3">
      <Card><h2 className="text-2xl font-semibold gold-text">新增交易</h2><p className="muted">按真实交易过程录入，支持策略化复盘。</p></Card>
      <TradeForm onSubmitSuccess={() => nav('/trades')} />
    </div>
  );
}
