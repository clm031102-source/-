import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useJournalStore } from '@/store/useJournalStore';
import { Trade } from '@/types/trade';

interface Props { initial?: Trade; mode?: 'simple' | 'detailed'; onSubmitSuccess?: () => void }

export function TradeForm({ initial, mode = 'detailed', onSubmitSuccess }: Props) {
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
    const gross = form.direction === '做多' ? (form.exitPrice - form.entryPrice) * form.quantity : (form.entryPrice - form.exitPrice) * form.quantity;
    return Number((gross - form.fee).toFixed(2));
  }, [form]);
  const pnlPercent = useMemo(() => (form.entryPrice ? Number((((form.exitPrice - form.entryPrice) / form.entryPrice) * 100 * (form.direction === '做多' ? 1 : -1)).toFixed(2)) : 0), [form]);

  const payload = {
    ...form,
    tradeDate: dayjs(form.tradeDate).toISOString(),
    pnl,
    pnlPercent,
    tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
    emotion: form.emotion as Trade['emotion'],
  };

  const submit = () => {
    if (!form.title || !form.symbol) return;
    if (initial) updateTrade(initial.id, payload);
    else addTrade(payload);
    onSubmitSuccess?.();
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-semibold gold-text">核心记录</h3>
          <div className="flex gap-2">
            <Button className={form.direction === '做多' ? 'border-[#6f9f7f]' : ''} onClick={() => setForm({ ...form, direction: '做多' })}>做多</Button>
            <Button className={form.direction === '做空' ? 'border-[#9f6f6f]' : ''} onClick={() => setForm({ ...form, direction: '做空' })}>做空</Button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="交易标题*" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input type="datetime-local" value={form.tradeDate} onChange={(e) => setForm({ ...form, tradeDate: e.target.value })} />
          <Input placeholder="品种*" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
          <Select value={form.strategyId} onChange={(e) => setForm({ ...form, strategyId: e.target.value })}>{strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          <Input type="number" placeholder="入场价" value={String(form.entryPrice)} onChange={(e) => setForm({ ...form, entryPrice: Number(e.target.value) })} />
          <Input type="number" placeholder="出场价" value={String(form.exitPrice)} onChange={(e) => setForm({ ...form, exitPrice: Number(e.target.value) })} />
          <Input type="number" placeholder="数量" value={String(form.quantity)} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <Input type="number" placeholder="杠杆" value={String(form.leverage)} onChange={(e) => setForm({ ...form, leverage: Number(e.target.value) })} />
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">实时盈亏摘要</h3>
        <div className="grid gap-2 md:grid-cols-4">
          <Input readOnly value={`预估盈亏：${pnl.toFixed(2)}`} className={pnl >= 0 ? 'stat-good' : 'stat-bad'} />
          <Input readOnly value={`盈亏比例：${pnlPercent.toFixed(2)}%`} className={pnlPercent >= 0 ? 'stat-good' : 'stat-bad'} />
          <Input type="number" placeholder="止损位" value={String(form.stopLoss)} onChange={(e) => setForm({ ...form, stopLoss: Number(e.target.value) })} />
          <Input type="number" placeholder="止盈位" value={String(form.takeProfit)} onChange={(e) => setForm({ ...form, takeProfit: Number(e.target.value) })} />
        </div>
      </Card>

      {mode === 'detailed' && (
        <Card>
          <h3 className="mb-3 text-xl font-semibold gold-text">详细复盘模块</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Select value={String(form.followsSystem)} onChange={(e) => setForm({ ...form, followsSystem: e.target.value === 'true' })}><option value="true">符合系统</option><option value="false">不符合系统</option></Select>
            <Select value={form.emotion} onChange={(e) => setForm({ ...form, emotion: e.target.value as Trade['emotion'] })}><option>冷静</option><option>犹豫</option><option>焦虑</option><option>上头</option><option>报复性交易</option></Select>
            <Input type="number" placeholder="手续费" value={String(form.fee)} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} />
            <Input type="number" placeholder="持仓时长(分钟)" value={String(form.holdingMinutes)} onChange={(e) => setForm({ ...form, holdingMinutes: Number(e.target.value) })} />
            <Textarea placeholder="入场理由" value={form.entryReason} onChange={(e) => setForm({ ...form, entryReason: e.target.value })} />
            <Textarea placeholder="出场理由" value={form.exitReason} onChange={(e) => setForm({ ...form, exitReason: e.target.value })} />
            <Input placeholder="标签（逗号分隔）" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="md:col-span-2" />
            <Textarea className="md:col-span-2" placeholder="复盘总结" value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} />
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="primary" onClick={submit}>保存记录</Button>
        <Button variant="ghost" onClick={() => setForm({ ...form, title: '', symbol: '' })}>清空标题/品种</Button>
      </div>
    </div>
  );
}
