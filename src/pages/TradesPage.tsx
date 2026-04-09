import dayjs from 'dayjs';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useJournalStore } from '@/store/useJournalStore';
import { TradeDetailPanel } from '@/features/trade/TradeDetailPanel';
import { TradeForm } from '@/features/trade/TradeForm';

export function TradesPage() {
  const { trades, strategies, removeTrade } = useJournalStore();
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [strategy, setStrategy] = useState('all');

  const filtered = trades.filter((t) => (strategy === 'all' ? true : t.strategyId === strategy)).filter((t) => t.title.includes(keyword) || t.symbol.includes(keyword));
  const selectedTrade = trades.find((t) => t.id === selected) ?? null;
  const editingTrade = trades.find((t) => t.id === editing) ?? null;

  return (
    <Card>
      <div className="mb-3 flex flex-wrap gap-2">
        <Input className="w-60" placeholder="搜索标题/品种" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <Select className="w-60" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
          <option value="all">全部策略</option>
          {strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>

      <table className="w-full text-left text-sm">
        <thead><tr className="border-b border-slate-700 text-slate-400"><th>时间</th><th>标题</th><th>策略</th><th>盈亏</th><th>操作</th></tr></thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id} className="border-b border-slate-800/80">
              <td className="py-2">{dayjs(t.tradeDate).format('MM-DD HH:mm')}</td>
              <td>{t.title}</td>
              <td>{strategies.find((s) => s.id === t.strategyId)?.name}</td>
              <td className={t.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{t.pnl.toFixed(2)}</td>
              <td className="space-x-1 py-2">
                <Button onClick={() => setSelected(t.id)}>详情</Button>
                <Button onClick={() => setEditing(t.id)}>编辑</Button>
                <Button onClick={() => { if (window.confirm('确认删除？')) removeTrade(t.id); }}>删除</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={Boolean(selectedTrade)} title="交易详情" onClose={() => setSelected(null)}>
        {selectedTrade && <TradeDetailPanel trade={selectedTrade} />}
      </Modal>
      <Modal open={Boolean(editingTrade)} title="编辑交易" onClose={() => setEditing(null)}>
        {editingTrade && <TradeForm initial={editingTrade} onSubmitSuccess={() => setEditing(null)} />}
      </Modal>
    </Card>
  );
}
