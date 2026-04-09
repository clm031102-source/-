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
      <Card><h2 className="text-2xl font-semibold gold-text">策略录入</h2></Card>
      <Card className="space-y-2">
        <Input placeholder="策略名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Textarea placeholder="开仓前检查清单" value={form.setupChecklist} onChange={(e) => setForm({ ...form, setupChecklist: e.target.value })} />
        <Textarea placeholder="入场规则" value={form.entryRules} onChange={(e) => setForm({ ...form, entryRules: e.target.value })} />
        <Textarea placeholder="出场规则" value={form.exitRules} onChange={(e) => setForm({ ...form, exitRules: e.target.value })} />
        <Textarea placeholder="风控规则" value={form.riskRules} onChange={(e) => setForm({ ...form, riskRules: e.target.value })} />
        <Textarea placeholder="备注" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <Button variant="primary" onClick={() => { if (!form.name) return; addStrategy(form); setForm({ name: '', setupChecklist: '', entryRules: '', exitRules: '', riskRules: '', notes: '' }); }}>新增策略</Button>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {strategies.map((s) => <Card key={s.id}><h3 className="text-lg font-semibold gold-text">{s.name}</h3><p className="text-sm muted">检查清单：{s.setupChecklist}</p><p className="text-sm muted">入场规则：{s.entryRules}</p><p className="text-sm muted">出场规则：{s.exitRules}</p><p className="text-sm muted">风控规则：{s.riskRules}</p></Card>)}
      </div>
    </div>
  );
}
