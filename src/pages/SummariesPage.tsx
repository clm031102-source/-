import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useJournalStore } from '@/store/useJournalStore';
import { useToast } from '@/hooks/useToast';

export function SummariesPage() {
  const { summaries, trades, addSummary, updateSummary, removeSummary } = useJournalStore();
  const { push } = useToast();
  const [activePeriod, setActivePeriod] = useState<'日' | '周' | '月'>('周');
  const [active, setActive] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ period: '周' as '日' | '周' | '月', range: '', title: '', content: '', goodPoints: '', biggestIssue: '', nextFocus: '', tags: '' });

  const filtered = useMemo(() => summaries.filter((s) => s.period === activePeriod), [activePeriod, summaries]);
  const detail = summaries.find((s) => s.id === active);

  useEffect(() => {
    if (!active && filtered[0]?.id) setActive(filtered[0].id);
  }, [active, filtered]);

  const periodTrades = useMemo(() => {
    if (!detail) return trades;
    return trades.filter((t) => t.tradeDate >= `${detail.range.split(' ~ ')[0]}T00:00:00.000Z` && t.tradeDate <= `${detail.range.split(' ~ ')[1]}T23:59:59.000Z`);
  }, [detail, trades]);

  const resetForm = () => setForm({ period: activePeriod, range: '', title: '', content: '', goodPoints: '', biggestIssue: '', nextFocus: '', tags: '' });

  const saveSummary = () => {
    if (!form.range.trim() || !form.content.trim()) return push('请先填写周期范围和总结内容。');
    const payload = {
      period: form.period,
      range: form.range.trim(),
      title: form.title.trim() || `${form.period}总结`,
      content: form.content.trim(),
      tradeCount: periodTrades.length,
      totalPnl: periodTrades.reduce((x, t) => x + t.pnl, 0),
      goodPoints: form.goodPoints.trim(),
      biggestIssue: form.biggestIssue.trim(),
      nextFocus: form.nextFocus.trim(),
      tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean),
    };

    if (editing) {
      updateSummary(editing, payload);
      push('总结已更新。');
    } else {
      addSummary(payload);
      push('总结已新增。');
    }
    resetForm();
    setEditing(null);
  };

  const loadEdit = (id: string) => {
    const s = summaries.find((x) => x.id === id);
    if (!s) return;
    setEditing(id);
    setForm({ period: s.period, range: s.range, title: s.title ?? '', content: s.content, goodPoints: s.goodPoints ?? '', biggestIssue: s.biggestIssue ?? '', nextFocus: s.nextFocus ?? '', tags: (s.tags || []).join(', ') });
  };

  return (
    <div className="space-y-3">
      <Card>
        <h2 className="text-2xl font-semibold gold-text">总结沉淀中心</h2>
        <p className="muted">日 / 周 / 月总结沉淀问题、改进点和下一阶段重点。</p>
      </Card>

      <Card className="space-y-3">
        <div className="flex gap-2">
          {(['日', '周', '月'] as const).map((p) => <Button key={p} variant={activePeriod === p ? 'primary' : 'secondary'} onClick={() => { setActivePeriod(p); setActive(null); }}>{p}总结</Button>)}
        </div>
        <div className="grid gap-3 xl:grid-cols-3">
          <div className="xl:col-span-1 space-y-2">
            <h3 className="font-semibold">总结列表 / 时间线</h3>
            {filtered.length ? filtered.map((s) => (
              <button key={s.id} className={`w-full rounded-xl border px-3 py-2 text-left ${active === s.id ? 'border-[#8a7553] bg-[#201d18]' : 'border-[var(--line-soft)] bg-[#111111]'}`} onClick={() => setActive(s.id)}>
                <p>{s.title || `${s.period}总结`} · {s.range}</p>
                <p className="text-xs muted">交易 {s.tradeCount ?? '-'} 笔 · 盈亏 {(s.totalPnl ?? 0).toFixed(2)}</p>
              </button>
            )) : <div className="rounded-xl border border-[var(--line-soft)] p-4 muted">当前周期暂无总结，点击右侧创建第一条。</div>}
          </div>
          <div className="xl:col-span-2">
            {detail ? (
              <Card className="space-y-2">
                <h3 className="font-semibold">总结详情</h3>
                <p><span className="muted">周期：</span>{detail.period} · {detail.range}</p>
                <p><span className="muted">本周期交易笔数：</span>{detail.tradeCount ?? periodTrades.length}</p>
                <p><span className="muted">本周期总盈亏：</span><span className={(detail.totalPnl ?? 0) >= 0 ? 'stat-good' : 'stat-bad'}>{(detail.totalPnl ?? 0).toFixed(2)}</span></p>
                <p><span className="muted">做得好的地方：</span>{detail.goodPoints || '-'}</p>
                <p><span className="muted">最大问题：</span>{detail.biggestIssue || '-'}</p>
                <p><span className="muted">下阶段重点：</span>{detail.nextFocus || '-'}</p>
                <Card><p>{detail.content}</p></Card>
                <div className="flex gap-2">
                  <Button onClick={() => loadEdit(detail.id)}>编辑</Button>
                  <Button variant="danger" onClick={() => { if (window.confirm('确认删除该总结？')) { removeSummary(detail.id); setActive(null); push('总结已删除。'); } }}>删除</Button>
                </div>
              </Card>
            ) : <div className="rounded-xl border border-[var(--line-soft)] p-6 muted">请选择左侧总结查看详情。</div>}
          </div>
        </div>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold">{editing ? '编辑总结' : '新增总结'}</h3>
        <div className="grid gap-2 md:grid-cols-3">
          <Select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as '日' | '周' | '月' })}><option>日</option><option>周</option><option>月</option></Select>
          <Input placeholder="周期范围，如 2026-04-01 ~ 2026-04-07" value={form.range} onChange={(e) => setForm({ ...form, range: e.target.value })} />
          <Input placeholder="标题（可选）" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <Textarea placeholder="本周期总结内容" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <div className="grid gap-2 md:grid-cols-3">
          <Textarea placeholder="做得好的地方" value={form.goodPoints} onChange={(e) => setForm({ ...form, goodPoints: e.target.value })} />
          <Textarea placeholder="最大问题" value={form.biggestIssue} onChange={(e) => setForm({ ...form, biggestIssue: e.target.value })} />
          <Textarea placeholder="下阶段重点" value={form.nextFocus} onChange={(e) => setForm({ ...form, nextFocus: e.target.value })} />
        </div>
        <Input placeholder="标签（逗号分隔）" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <div className="flex gap-2">
          <Button variant="primary" onClick={saveSummary}>{editing ? '保存更新' : '新增总结'}</Button>
          <Button variant="ghost" onClick={() => { resetForm(); setEditing(null); }}>清空</Button>
        </div>
      </Card>
    </div>
  );
}
