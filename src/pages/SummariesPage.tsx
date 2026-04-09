import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useTradeStore } from '@/store/tradeStore';
import { SummaryType } from '@/types/trade';

export function SummariesPage() {
  const { summaries, trades, addSummary, updateSummary, removeSummary } = useTradeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyForm = {
    type: '日总结' as SummaryType,
    rangeStart: dayjs().startOf('day').format('YYYY-MM-DD'),
    rangeEnd: dayjs().endOf('day').format('YYYY-MM-DD'),
    tradeCount: 0,
    totalPnl: 0,
    bestPart: '',
    biggestProblem: '',
    nextFocus: '',
  };
  const [form, setForm] = useState(emptyForm);

  const calculated = useMemo(() => {
    const selected = trades.filter((t) => dayjs(t.tradeDate).isAfter(dayjs(form.rangeStart).subtract(1, 'day')) && dayjs(t.tradeDate).isBefore(dayjs(form.rangeEnd).add(1, 'day')));
    return {
      tradeCount: selected.length,
      totalPnl: selected.reduce((sum, t) => sum + t.pnlAmount, 0),
    };
  }, [form.rangeEnd, form.rangeStart, trades]);

  const submit = () => {
    const payload = { ...form, ...calculated, rangeStart: dayjs(form.rangeStart).toISOString(), rangeEnd: dayjs(form.rangeEnd).toISOString() };
    if (!payload.bestPart || !payload.biggestProblem || !payload.nextFocus) return;
    if (editingId) {
      updateSummary(editingId, payload);
      setEditingId(null);
    } else addSummary(payload);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">日 / 周 / 月总结</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SummaryType })}><option>日总结</option><option>周总结</option><option>月总结</option></Select>
          <Input type="date" value={form.rangeStart} onChange={(e) => setForm({ ...form, rangeStart: e.target.value })} />
          <Input type="date" value={form.rangeEnd} onChange={(e) => setForm({ ...form, rangeEnd: e.target.value })} />
          <Input readOnly value={`交易 ${calculated.tradeCount} 笔 / 盈亏 ${calculated.totalPnl.toFixed(2)}`} />
        </div>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <Textarea placeholder="本周期做得最好的地方" value={form.bestPart} onChange={(e) => setForm({ ...form, bestPart: e.target.value })} />
          <Textarea placeholder="本周期最大问题" value={form.biggestProblem} onChange={(e) => setForm({ ...form, biggestProblem: e.target.value })} />
          <Textarea placeholder="下阶段改进重点" value={form.nextFocus} onChange={(e) => setForm({ ...form, nextFocus: e.target.value })} />
        </div>
        <div className="mt-3"><Button onClick={submit}>{editingId ? '更新总结' : '保存总结'}</Button></div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">历史总结</h3>
        <div className="space-y-2">
          {summaries.map((item) => (
            <div key={item.id} className="rounded border border-border p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-medium">{item.type} | {dayjs(item.rangeStart).format('YYYY-MM-DD')} ~ {dayjs(item.rangeEnd).format('YYYY-MM-DD')}</p>
                <p className={item.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}>盈亏 {item.totalPnl.toFixed(2)}</p>
              </div>
              <p className="text-sm text-slate-300">最好：{item.bestPart}</p>
              <p className="text-sm text-slate-300">问题：{item.biggestProblem}</p>
              <p className="text-sm text-slate-300">改进：{item.nextFocus}</p>
              <div className="mt-2 flex gap-2">
                <Button variant="secondary" onClick={() => {
                  setEditingId(item.id);
                  setForm({
                    type: item.type,
                    rangeStart: dayjs(item.rangeStart).format('YYYY-MM-DD'),
                    rangeEnd: dayjs(item.rangeEnd).format('YYYY-MM-DD'),
                    tradeCount: item.tradeCount,
                    totalPnl: item.totalPnl,
                    bestPart: item.bestPart,
                    biggestProblem: item.biggestProblem,
                    nextFocus: item.nextFocus,
                  });
                }}>编辑</Button>
                <Button variant="danger" onClick={() => { if (window.confirm('确认删除该总结？')) removeSummary(item.id); }}>删除</Button>
              </div>
            </div>
          ))}
        </div>
        {summaries.length === 0 && <p className="py-8 text-center text-slate-400">还没有总结，建议先写第一条日总结。</p>}
      </Card>
    </div>
  );
}
