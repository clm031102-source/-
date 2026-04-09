import dayjs from 'dayjs';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTradeStore } from '@/store/tradeStore';

export function TradeDetailPage() {
  const { id } = useParams();
  const { trades, tags, strategies } = useTradeStore();
  const trade = trades.find((item) => item.id === id);

  if (!trade) return <Card>交易记录不存在。</Card>;

  const sameStrategy = trades.filter((t) => t.strategyId === trade.strategyId);
  const avgSamePnl = sameStrategy.reduce((sum, t) => sum + t.pnlAmount, 0) / sameStrategy.length;

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{trade.title}</h2>
          <p className="text-sm text-slate-400">{dayjs(trade.tradeDate).format('YYYY-MM-DD HH:mm')} · {trade.symbol}</p>
        </div>
        <Link to={`/trade/${trade.id}/edit`}><Button>编辑</Button></Link>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">基础信息</h3>
          <p>市场：{trade.market}</p><p>方向：{trade.direction}</p><p>入场/出场：{trade.entryPrice} → {trade.exitPrice}</p>
          <p>仓位：{trade.positionSize} | 杠杆：{trade.leverage}x</p><p>手续费：{trade.fee}</p>
          <p>持仓时长：{trade.holdingMinutes} 分钟</p>
          <p className={trade.pnlAmount >= 0 ? 'text-green-400' : 'text-red-400'}>盈亏：{trade.pnlAmount} ({trade.pnlPercent}%)</p>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">策略与执行</h3>
          <p>策略：{strategies.find((s) => s.id === trade.strategyId)?.name}</p>
          <p>是否符合系统：{trade.followsSystem ? '是' : '否'}</p>
          <p>信号评分：{trade.signalQuality}/5</p><p>执行评分：{trade.executionQuality}/5</p>
          <p>入场理由：{trade.entryReason}</p><p>出场理由：{trade.exitReason}</p>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">风控信息</h3>
          <p>止损：{trade.stopLoss ?? '-'}</p><p>止盈：{trade.takeProfit ?? '-'}</p>
          <p>最大浮亏：{trade.maxFloatingLoss ?? '-'}</p><p>最大浮盈：{trade.maxFloatingProfit ?? '-'}</p>
          <p>风险回报比：{trade.riskRewardRatio ?? '-'}</p>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">心理与复盘</h3>
          <p>情绪状态：{trade.emotion}</p>
          <p>最大错误：{trade.biggestMistake}</p>
          <p>做得好的地方：{trade.didWell}</p>
          <p>复盘总结：{trade.reviewNotes}</p>
          <p>下次原则：{trade.nextRule}</p>
        </Card>
      </div>
      <Card>
        <h3 className="mb-2 font-semibold">标签与同类策略对比</h3>
        <div className="mb-2 flex flex-wrap gap-1">
          {trade.tagIds.map((tagId) => <Badge key={tagId}>{tags.find((item) => item.id === tagId)?.name}</Badge>)}
        </div>
        <p className="text-sm text-slate-300">同策略交易 {sameStrategy.length} 笔，平均盈亏 {avgSamePnl.toFixed(2)}。</p>
      </Card>
    </div>
  );
}
