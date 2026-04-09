import { useNavigate } from 'react-router-dom';
import { TradeForm } from '@/features/trade/TradeForm';

export function NewTradePage() {
  const nav = useNavigate();
  return (
    <div>
      <h2 className="mb-3 text-2xl font-semibold">新增交易</h2>
      <TradeForm onSubmitSuccess={() => nav('/trades')} />
    </div>
  );
}
