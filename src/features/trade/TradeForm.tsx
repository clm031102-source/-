import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useJournalStore } from '@/store/useJournalStore';
import { Trade } from '@/types/trade';

interface Props { initial?: Trade; onSubmitSuccess?: () => void }

const hints: Record<string, string> = {
  entryPrice: '例：84250，计划入场价。',
  exitPrice: '例：84590，实际出场价。',
  quantity: '例：0.7，下单数量。',
  leverage: '例：20，真实杠杆。',
  fee: '例：4，来回总手续费。',
  stopLoss: '例：84080，失效位。',
  takeProfit: '例：84590，计划止盈位。',
};

export function TradeForm({ initial, onSubmitSuccess }: Props) {
  const { strategies, addTrade, updateTrade } = useJournalStore();
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    tradeDate: initial ? dayjs(initial.tradeDate).format('YYYY-MM-DDTHH:mm') : dayjs().format('YYYY-MM-DDTHH:mm'),
    symbol: initial?.symbol ?? '',
    direction: initial?.direction ?? '做多',
    entryPrice: initial?.entryPrice ?? 0,
    exitPrice: initial?.exitPrice ?? 0,
    quantity: initial?.quantity ?? 0,
    leverage: initial?.leverage ?? 20,
    fee: initial?.fee ?? 0,
    stopLoss: initial?.stopLoss ?? 0,
    takeProfit: initial?.takeProfit ?? 0,
    strategyId: initial?.strategyId ?? strategies[0]?.id ?? '',
    followsSystem: initial?.followsSystem ?? true,
    entryReason: initial?.entryReason ?? '',
    exitReason: initial?.exitReason ?? '',
    tags: initial?.tags.join(',') ?? '',
    emotion: initial?.emotion ?? '冷静',
    review: initial?.review ?? '',
    holdingMinutes: initial?.holdingMinutes ?? 15,
  });

  const pnl = useMemo(() => {
    if (!form.entryPrice || !form.exitPrice || !form.quantity) return 0;
    const gross = form.direction === '做多' ? (form.exitPrice - form.entryPrice) * form.quantity : (form.entryPrice - form.exitPrice) * form.quantity;
    return Number((gross - form.fee).toFixed(2));
  }, [form.direction, form.entryPrice, form.exitPrice, form.fee, form.quantity]);

  const pnlPercent = useMemo(() => {
    if (!form.entryPrice) return 0;
    const p = ((form.exitPrice - form.entryPrice) / form.entryPrice) * 100;
    return Number((form.direction === '做多' ? p : -p).toFixed(2));
  }, [form.direction, form.entryPrice, form.exitPrice]);

  const submit = () => {
    if (!form.title || !form.symbol || !form.strategyId || !form.entryReason || !form.exitReason) return;
    const payload = {
      ...form,
      tradeDate: dayjs(form.tradeDate).toISOString(),
      pnl,
      pnlPercent,
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      emotion: form.emotion as Trade['emotion'],
    };
    if (initial) updateTrade(initial.id, payload);
    else addTrade(payload);
    onSubmitSuccess?.();
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-3 text-xl font-semibold gold-text">基础信息</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="交易标题*" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input type="datetime-local" value={form.tradeDate} onChange={(e) => setForm({ ...form, tradeDate: e.target.value })} />
          <Input placeholder="交易品种*（如 BTC）" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
          <Select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as Trade['direction'] })}><option>做多</option><option>做空</option></Select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          {(['entryPrice', 'exitPrice', 'quantity', 'leverage', 'fee', 'stopLoss', 'takeProfit', 'holdingMinutes'] as const).map((key) => (
            <div key={key}>
              <Input type="number" step="0.0001" value={String(form[key])} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
              <p className="mt-1 text-xs muted">{hints[key] ?? '例：20，分钟。'}</p>
            </div>
          ))}
          <Input readOnly value={`当前预估盈亏：${pnl} (${pnlPercent}%)`} className={pnl >= 0 ? 'stat-good' : 'stat-bad'} />
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-xl font-semibold gold-text">策略与执行</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={form.strategyId} onChange={(e) => setForm({ ...form, strategyId: e.target.value })}>{strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          <Select value={String(form.followsSystem)} onChange={(e) => setForm({ ...form, followsSystem: e.target.value === 'true' })}><option value="true">符合系统</option><option value="false">不符合系统</option></Select>
          <Select value={form.emotion} onChange={(e) => setForm({ ...form, emotion: e.target.value as Trade['emotion'] })}><option>冷静</option><option>犹豫</option><option>焦虑</option><option>上头</option><option>报复性交易</option></Select>
          <Input placeholder="标签（逗号分隔）" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <Textarea placeholder="入场理由*" value={form.entryReason} onChange={(e) => setForm({ ...form, entryReason: e.target.value })} />
          <Textarea placeholder="出场理由*" value={form.exitReason} onChange={(e) => setForm({ ...form, exitReason: e.target.value })} />
          <Textarea className="md:col-span-2" placeholder="复盘" value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} />
        </div>
      </Card>

      <div className="flex gap-2"><Button variant="primary" onClick={submit}>{initial ? '保存修改' : '保存交易'}</Button></div>
    </div>
  );
}
