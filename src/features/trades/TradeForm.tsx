import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useTradeStore } from '@/store/tradeStore';
import { EmotionState, Trade } from '@/types/trade';
import { getHoldingMinutes } from '@/utils/date';

const emotions: EmotionState[] = ['冷静', '犹豫', '焦虑', '上头', '报复性交易'];
const markets = ['加密货币', '股票', '期货', '外汇'] as const;

interface Props {
  trade?: Trade;
}

export function TradeForm({ trade }: Props) {
  const navigate = useNavigate();
  const { addTrade, updateTrade, strategies, tags, addTag } = useTradeStore();
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState(() => ({
    title: trade?.title ?? '',
    tradeDate: trade ? dayjs(trade.tradeDate).format('YYYY-MM-DDTHH:mm') : dayjs().format('YYYY-MM-DDTHH:mm'),
    market: trade?.market ?? '加密货币',
    symbol: trade?.symbol ?? '',
    direction: trade?.direction ?? '做多',
    entryTime: trade ? dayjs(trade.entryTime).format('YYYY-MM-DDTHH:mm') : dayjs().format('YYYY-MM-DDTHH:mm'),
    exitTime: trade ? dayjs(trade.exitTime).format('YYYY-MM-DDTHH:mm') : dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
    entryPrice: trade?.entryPrice ?? 0,
    exitPrice: trade?.exitPrice ?? 0,
    positionSize: trade?.positionSize ?? 0,
    leverage: trade?.leverage ?? 1,
    fee: trade?.fee ?? 0,
    pnlAmount: trade?.pnlAmount ?? 0,
    pnlPercent: trade?.pnlPercent ?? 0,
    strategyId: trade?.strategyId ?? strategies[0]?.id ?? '',
    entryReason: trade?.entryReason ?? '',
    exitReason: trade?.exitReason ?? '',
    followsSystem: trade?.followsSystem ?? true,
    signalQuality: trade?.signalQuality ?? 3,
    executionQuality: trade?.executionQuality ?? 3,
    stopLoss: trade?.stopLoss ?? 0,
    takeProfit: trade?.takeProfit ?? 0,
    maxFloatingLoss: trade?.maxFloatingLoss ?? 0,
    maxFloatingProfit: trade?.maxFloatingProfit ?? 0,
    riskRewardRatio: trade?.riskRewardRatio ?? 0,
    emotion: trade?.emotion ?? ('冷静' as EmotionState),
    biggestMistake: trade?.biggestMistake ?? '',
    didWell: trade?.didWell ?? '',
    reviewNotes: trade?.reviewNotes ?? '',
    nextRule: trade?.nextRule ?? '',
    tagIds: trade?.tagIds ?? ([] as string[]),
  }));

  const holdingMinutes = useMemo(() => getHoldingMinutes(form.entryTime, form.exitTime), [form.entryTime, form.exitTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.symbol || !form.strategyId || !form.entryReason || !form.exitReason) {
      setError('请填写完整必填项（标题、品种、策略、入场理由、出场理由）。');
      return;
    }
    const payload = {
      ...form,
      tradeDate: dayjs(form.tradeDate).toISOString(),
      entryTime: dayjs(form.entryTime).toISOString(),
      exitTime: dayjs(form.exitTime).toISOString(),
      holdingMinutes,
      signalQuality: Number(form.signalQuality) as 1 | 2 | 3 | 4 | 5,
      executionQuality: Number(form.executionQuality) as 1 | 2 | 3 | 4 | 5,
    };

    if (trade) updateTrade(trade.id, payload);
    else addTrade(payload);
    navigate('/trades');
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <p className="rounded border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-300">{error}</p>}
      <Card>
        <h3 className="mb-3 text-base font-semibold">基础信息</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="交易标题*" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input type="datetime-local" value={form.tradeDate} onChange={(e) => setForm({ ...form, tradeDate: e.target.value })} />
          <Select value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value as Trade['market'] })}>
            {markets.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          <Input placeholder="交易品种*" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
          <Select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as Trade['direction'] })}>
            <option>做多</option>
            <option>做空</option>
          </Select>
          <Input type="datetime-local" value={form.entryTime} onChange={(e) => setForm({ ...form, entryTime: e.target.value })} />
          <Input type="datetime-local" value={form.exitTime} onChange={(e) => setForm({ ...form, exitTime: e.target.value })} />
          <Input type="number" step="0.0001" placeholder="入场价格" value={form.entryPrice} onChange={(e) => setForm({ ...form, entryPrice: Number(e.target.value) })} />
          <Input type="number" step="0.0001" placeholder="出场价格" value={form.exitPrice} onChange={(e) => setForm({ ...form, exitPrice: Number(e.target.value) })} />
          <Input type="number" step="0.0001" placeholder="仓位大小" value={form.positionSize} onChange={(e) => setForm({ ...form, positionSize: Number(e.target.value) })} />
          <Input type="number" step="0.1" placeholder="杠杆" value={form.leverage} onChange={(e) => setForm({ ...form, leverage: Number(e.target.value) })} />
          <Input type="number" step="0.01" placeholder="手续费" value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} />
          <Input type="number" step="0.01" placeholder="盈亏金额" value={form.pnlAmount} onChange={(e) => setForm({ ...form, pnlAmount: Number(e.target.value) })} />
          <Input type="number" step="0.01" placeholder="盈亏百分比" value={form.pnlPercent} onChange={(e) => setForm({ ...form, pnlPercent: Number(e.target.value) })} />
          <Input readOnly value={`持仓 ${holdingMinutes} 分钟`} />
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold">交易逻辑</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={form.strategyId} onChange={(e) => setForm({ ...form, strategyId: e.target.value })}>
            {strategies.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </Select>
          <Select value={String(form.followsSystem)} onChange={(e) => setForm({ ...form, followsSystem: e.target.value === 'true' })}>
            <option value="true">符合系统</option>
            <option value="false">不符合系统</option>
          </Select>
          <Textarea placeholder="入场理由*" value={form.entryReason} onChange={(e) => setForm({ ...form, entryReason: e.target.value })} />
          <Textarea placeholder="出场理由*" value={form.exitReason} onChange={(e) => setForm({ ...form, exitReason: e.target.value })} />
          <Select value={String(form.signalQuality)} onChange={(e) => setForm({ ...form, signalQuality: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5].map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select value={String(form.executionQuality)} onChange={(e) => setForm({ ...form, executionQuality: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5].map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold">风控 / 心理 / 标签</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {['stopLoss', 'takeProfit', 'maxFloatingLoss', 'maxFloatingProfit', 'riskRewardRatio'].map((key) => (
            <Input
              key={key}
              type="number"
              step="0.01"
              placeholder={key}
              value={String(form[key as keyof typeof form] ?? '')}
              onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
            />
          ))}
          <Select value={form.emotion} onChange={(e) => setForm({ ...form, emotion: e.target.value as EmotionState })}>
            {emotions.map((emotion) => <option key={emotion}>{emotion}</option>)}
          </Select>
          <Textarea placeholder="最大错误" value={form.biggestMistake} onChange={(e) => setForm({ ...form, biggestMistake: e.target.value })} />
          <Textarea placeholder="做得好的地方" value={form.didWell} onChange={(e) => setForm({ ...form, didWell: e.target.value })} />
          <Textarea placeholder="复盘总结" value={form.reviewNotes} onChange={(e) => setForm({ ...form, reviewNotes: e.target.value })} />
          <Textarea placeholder="下次处理原则" value={form.nextRule} onChange={(e) => setForm({ ...form, nextRule: e.target.value })} />
        </div>
        <div className="mt-3 rounded border border-border p-3">
          <p className="mb-2 text-sm text-slate-300">标签（可多选）</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={form.tagIds.includes(tag.id)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...form.tagIds, tag.id]
                      : form.tagIds.filter((id) => id !== tag.id);
                    setForm({ ...form, tagIds: next });
                  }}
                />
                {tag.name}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="新增标签" />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!newTag.trim()) return;
                const id = addTag(newTag);
                setForm({ ...form, tagIds: [...new Set([...form.tagIds, id])] });
                setNewTag('');
              }}
            >
              创建并选中
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button type="submit">{trade ? '保存修改' : '保存交易'}</Button>
        <Button type="button" variant="ghost" onClick={() => navigate('/trades')}>取消</Button>
      </div>
    </form>
  );
}
