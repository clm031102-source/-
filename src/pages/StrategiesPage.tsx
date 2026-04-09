import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useJournalStore } from '@/store/useJournalStore';

export function StrategiesPage() {
  const { strategies, addStrategy } = useJournalStore();
  const [form, setForm] = useState({ name: '', setupChecklist: '', entryRules: '', exitRules: '', riskRules: '', notes: '' });
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">策略录入</h2>
      <Card className="space-y-2">
        <Input placeholder="策略名称（如 趋势突破）" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Textarea placeholder="开仓前检查清单" value={form.setupChecklist} onChange={(e) => setForm({ ...form, setupChecklist: e.target.value })} />
        <Textarea placeholder="入场规则" value={form.entryRules} onChange={(e) => setForm({ ...form, entryRules: e.target.value })} />
        <Textarea placeholder="出场规则" value={form.exitRules} onChange={(e) => setForm({ ...form, exitRules: e.target.value })} />
        <Textarea placeholder="风控规则" value={form.riskRules} onChange={(e) => setForm({ ...form, riskRules: e.target.value })} />
        <Textarea placeholder="补充备注（可选）" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <Button onClick={() => { if (!form.name) return; addStrategy(form); setForm({ name: '', setupChecklist: '', entryRules: '', exitRules: '', riskRules: '', notes: '' }); }}>新增策略</Button>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {strategies.map((s) => (
          <Card key={s.id}>
            <h3 className="text-xl font-semibold text-cyan-200">{s.name}</h3>
            <p className="mt-1 text-sm text-slate-300">检查清单：{s.setupChecklist}</p>
            <p className="text-sm text-slate-300">入场规则：{s.entryRules}</p>
            <p className="text-sm text-slate-300">出场规则：{s.exitRules}</p>
            <p className="text-sm text-slate-300">风控规则：{s.riskRules}</p>
            {s.notes && <p className="text-sm text-slate-300">备注：{s.notes}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
