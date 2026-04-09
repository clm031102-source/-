import dayjs from 'dayjs';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useJournalStore } from '@/store/useJournalStore';
import { Trade } from '@/types/trade';

export function TradeDetailPanel({ trade }: { trade: Trade }) {
  const { strategies, updateTrade } = useJournalStore();
  const strategy = strategies.find((s) => s.id === trade.strategyId);
  const attachments = trade.attachments ?? [];
  const [active, setActive] = useState(0);

  const removeAttachment = (id: string) => {
    const next = attachments.filter((item) => item.id !== id);
    updateTrade(trade.id, { ...trade, attachments: next });
    setActive(0);
  };

  return (
    <div className="space-y-3">
      <Card>
        <h4 className="text-xl font-semibold gold-text">{trade.title}</h4>
        <p className="muted">{dayjs(trade.tradeDate).format('YYYY-MM-DD HH:mm')} · {trade.symbol} · {trade.direction}</p>
      </Card>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="space-y-1">
          <h5 className="font-semibold">核心成交信息</h5>
          <p>策略：{strategy?.name ?? '-'} · Setup：{trade.setup || '-'}</p>
          <p>入场/出场：{trade.entryPrice} → {trade.exitPrice}</p>
          <p>数量：{trade.quantity} · 杠杆：{trade.leverage}x · 手续费：{trade.fee}</p>
          <p>止损/止盈：{trade.stopLoss} / {trade.takeProfit}</p>
          <p>持仓时长：{trade.holdingMinutes ?? '-'} 分钟</p>
        </Card>

        <Card className="space-y-1">
          <h5 className="font-semibold">风险与盈亏</h5>
          <p className={trade.pnl >= 0 ? 'stat-good' : 'stat-bad'}>实际盈亏：{trade.pnl.toFixed(2)} ({trade.pnlPercent.toFixed(2)}%)</p>
          <p>预估盈亏：{(trade.estimatedPnl ?? trade.pnl).toFixed(2)}</p>
          <p>R 倍数：{trade.rMultiple ?? '-'} · 风险回报比：{trade.riskRewardRatio ?? '-'}</p>
          <p>MFE / MAE：{trade.mfe ?? '-'} / {trade.mae ?? '-'}</p>
          <p>Running P&L 区域预留：可接实时行情和分时路径（后续服务器版）。</p>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="space-y-1">
          <h5 className="font-semibold">策略执行 / mistakes / tags</h5>
          <p>系统符合度：{trade.followsSystem ? '符合' : '不符合'} · 计划内：{trade.plannedTrade ? '是' : '否'}</p>
          <p>信号/执行评分：{trade.signalQuality ?? '-'} / {trade.executionQuality ?? '-'}</p>
          <p>Mistakes：{(trade.mistakes ?? []).join(' / ') || trade.biggestMistake || '-'}</p>
          <p>标签：{(trade.tags ?? []).join(' / ') || '-'}</p>
          <p>机会等级：{trade.opportunityGrade ?? '-'} · 分类：{trade.systemType ?? '-'} / {trade.planType ?? '-'}</p>
        </Card>

        <Card className="space-y-1">
          <h5 className="font-semibold">情绪与纪律 / notes</h5>
          <p>情绪：{trade.emotion} · 精力：{trade.energy ?? '-'}</p>
          <p>纪律：{trade.overtrading ? '上头' : '稳定'} / {trade.revengeTrading ? '报复交易' : '无报复'} / {trade.forcedAfterLoss ? '连亏强开' : '无强开'}</p>
          <p><span className="muted">入场理由：</span>{trade.entryReason || '-'}</p>
          <p><span className="muted">出场理由：</span>{trade.exitReason || '-'}</p>
          <p><span className="muted">复盘总结：</span>{trade.review || '-'}</p>
          <p><span className="muted">下次如何处理：</span>{trade.nextTimePlan || '-'}</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <h5 className="font-semibold">截图日志</h5>
        {attachments.length ? (
          <>
            <div className="relative overflow-hidden rounded-xl border border-[var(--line-soft)] bg-[#0f0f0f] p-2">
              <img src={attachments[active]?.dataUrl} alt={attachments[active]?.name} className="h-[380px] w-full rounded object-contain" />
            </div>
            <div className="flex flex-wrap gap-2">
              {attachments.map((item, idx) => (
                <button key={item.id} onClick={() => setActive(idx)} className={`rounded border px-2 py-1 text-xs ${idx === active ? 'border-[#8b6e43] bg-[#2b241a]' : 'border-[var(--line-soft)] bg-[#121212]'}`}>
                  {item.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setActive((v) => (v - 1 + attachments.length) % attachments.length)}>上一张</Button>
              <Button onClick={() => setActive((v) => (v + 1) % attachments.length)}>下一张</Button>
              <Button variant="danger" onClick={() => removeAttachment(attachments[active].id)}>删除当前截图</Button>
            </div>
          </>
        ) : <p className="muted">暂无截图。</p>}
      </Card>
    </div>
  );
}
