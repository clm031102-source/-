import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { TradeForm } from '@/features/trade/TradeForm';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function NewTradePage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<'simple' | 'detailed'>('simple');
  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold gold-text">新增记录</h2>
          <p className="muted">支持简洁录入与详细复盘，切换模式不丢数据。</p>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === 'simple' ? 'primary' : 'secondary'} onClick={() => setMode('simple')}>简洁版</Button>
          <Button variant={mode === 'detailed' ? 'primary' : 'secondary'} onClick={() => setMode('detailed')}>详细版</Button>
        </div>
      </Card>
      <TradeForm mode={mode} onSubmitSuccess={() => nav('/trades')} />
    </div>
  );
}
