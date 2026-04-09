import { Card } from '@/components/ui/Card';
import { useJournalStore } from '@/store/useJournalStore';

export function SummariesPage() {
  const { summaries } = useJournalStore();
  return (
    <div className="space-y-3">
      <Card>
        <h2 className="text-2xl font-semibold gold-text">总结</h2>
        <p className="muted">保留原有总结模块，并统一视觉风格。</p>
      </Card>
      {summaries.map((s) => (
        <Card key={s.id}>
          <p className="text-sm muted">{s.period}总结 · {s.range}</p>
          <p className="mt-2">{s.content}</p>
        </Card>
      ))}
    </div>
  );
}
