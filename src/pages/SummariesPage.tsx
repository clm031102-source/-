import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useJournalStore } from '@/store/useJournalStore';

export function SummariesPage() {
  const { summaries, trades } = useJournalStore();
  const [active, setActive] = useState<string | null>(summaries[0]?.id ?? null);
  const detail = summaries.find((s) => s.id === active);

  const periodStats = useMemo(() => summaries.map((s) => ({ ...s, tradeCount: trades.length, totalPnl: trades.reduce((x, t) => x + t.pnl, 0), best: '纪律执行提升', issue: '冲动单仍存在', next: '继续压缩非系统内开仓' })), [summaries, trades]);

  return (
    <div className="space-y-3">
      <Card>
        <h2 className="text-2xl font-semibold gold-text">总结沉淀</h2>
        <p className="muted">按日 / 周 / 月持续沉淀交易经验与下一阶段改进重点</p>
      </Card>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <h3 className="mb-2 font-semibold">总结时间线</h3>
          {periodStats.length ? periodStats.map((s) => (
            <button key={s.id} className={`mb-2 w-full rounded-xl border px-3 py-2 text-left ${active === s.id ? 'border-[#8a7553] bg-[#1f2733]' : 'border-[var(--line-soft)] bg-[#0c121c]'}`} onClick={() => setActive(s.id)}>
              <p className="text-sm">{s.period}总结 · {s.range}</p>
              <p className="text-xs muted">交易 {s.tradeCount} 笔 · 盈亏 {s.totalPnl.toFixed(2)}</p>
            </button>
          )) : <p className="muted">暂无总结记录，建议先完成第一条周总结。</p>}
        </Card>

        <Card className="xl:col-span-2">
          <h3 className="mb-2 font-semibold">总结详情</h3>
          {detail ? (
            <div className="space-y-2 text-sm">
              <p><span className="muted">周期：</span>{detail.period} · {detail.range}</p>
              <p><span className="muted">本周期交易：</span>{trades.length} 笔</p>
              <p><span className="muted">本周期总盈亏：</span><span className={trades.reduce((x, t) => x + t.pnl, 0) >= 0 ? 'stat-good' : 'stat-bad'}>{trades.reduce((x, t) => x + t.pnl, 0).toFixed(2)}</span></p>
              <p><span className="muted">做得好的地方：</span>纪律执行提升，止损触发更及时。</p>
              <p><span className="muted">最大问题：</span>个别非系统交易仍存在。</p>
              <p><span className="muted">下阶段重点：</span>限制冲动交易，优化仓位管理。</p>
              <Card className="mt-2"><p>{detail.content}</p></Card>
            </div>
          ) : <p className="muted">请选择一条总结查看详情。</p>}
          <div className="mt-3"><Button>新建总结（下一版）</Button></div>
        </Card>
      </div>
    </div>
  );
}
