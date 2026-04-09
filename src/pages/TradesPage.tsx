import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTradeStore } from '@/store/tradeStore';

export function TradesPage() {
  const { trades, tags, strategies, removeTrade, duplicateTrade } = useTradeStore();
  const [search, setSearch] = useState('');
  const [symbol, setSymbol] = useState('全部');
  const [strategy, setStrategy] = useState('全部');
  const [direction, setDirection] = useState('全部');
  const [pnlStatus, setPnlStatus] = useState('全部');
  const [tagId, setTagId] = useState('全部');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [sortBy, setSortBy] = useState<'tradeDate' | 'pnlAmount'>('tradeDate');

  const filtered = useMemo(() => {
    return trades
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => (symbol === '全部' ? true : t.symbol === symbol))
      .filter((t) => (strategy === '全部' ? true : t.strategyId === strategy))
      .filter((t) => (direction === '全部' ? true : t.direction === direction))
      .filter((t) => (pnlStatus === '全部' ? true : pnlStatus === '盈利' ? t.pnlAmount > 0 : t.pnlAmount <= 0))
      .filter((t) => (tagId === '全部' ? true : t.tagIds.includes(tagId)))
      .filter((t) => (dateStart ? dayjs(t.tradeDate).isAfter(dayjs(dateStart).subtract(1, 'day')) : true))
      .filter((t) => (dateEnd ? dayjs(t.tradeDate).isBefore(dayjs(dateEnd).add(1, 'day')) : true))
      .sort((a, b) => (sortBy === 'tradeDate' ? dayjs(b.tradeDate).valueOf() - dayjs(a.tradeDate).valueOf() : b.pnlAmount - a.pnlAmount));
  }, [dateEnd, dateStart, direction, pnlStatus, search, sortBy, strategy, symbol, tagId, trades]);

  const uniqueSymbols = Array.from(new Set(trades.map((t) => t.symbol)));

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">交易记录列表</h2>
        <Link to="/trade/new"><Button>新增交易</Button></Link>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-4 xl:grid-cols-5">
        <Input placeholder="搜索标题/品种" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}><option>全部</option>{uniqueSymbols.map((s) => <option key={s}>{s}</option>)}</Select>
        <Select value={strategy} onChange={(e) => setStrategy(e.target.value)}><option>全部</option>{strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
        <Select value={direction} onChange={(e) => setDirection(e.target.value)}><option>全部</option><option>做多</option><option>做空</option></Select>
        <Select value={pnlStatus} onChange={(e) => setPnlStatus(e.target.value)}><option>全部</option><option>盈利</option><option>亏损</option></Select>
        <Select value={tagId} onChange={(e) => setTagId(e.target.value)}><option>全部</option>{tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>
        <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
        <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'tradeDate' | 'pnlAmount')}>
          <option value="tradeDate">按时间排序</option>
          <option value="pnlAmount">按盈亏排序</option>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-border text-left">
              {['日期', '标题', '品种', '方向', '策略', '盈亏', '标签', '操作'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((trade) => (
              <tr key={trade.id} className="border-b border-border/60 hover:bg-slate-800/30">
                <td className="px-2 py-2">{dayjs(trade.tradeDate).format('YYYY-MM-DD')}</td>
                <td className="px-2 py-2">{trade.title}</td>
                <td className="px-2 py-2">{trade.symbol}</td>
                <td className="px-2 py-2">{trade.direction}</td>
                <td className="px-2 py-2">{strategies.find((s) => s.id === trade.strategyId)?.name ?? '-'}</td>
                <td className={`px-2 py-2 ${trade.pnlAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trade.pnlAmount.toFixed(2)}</td>
                <td className="px-2 py-2">{trade.tagIds.map((id) => tags.find((t) => t.id === id)?.name).filter(Boolean).join(' / ')}</td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap gap-1">
                    <Link to={`/trade/${trade.id}`}><Button variant="ghost" className="px-2 py-1">详情</Button></Link>
                    <Link to={`/trade/${trade.id}/edit`}><Button variant="ghost" className="px-2 py-1">编辑</Button></Link>
                    <Button variant="secondary" className="px-2 py-1" onClick={() => duplicateTrade(trade.id)}>复制</Button>
                    <Button
                      variant="danger"
                      className="px-2 py-1"
                      onClick={() => {
                        if (!window.confirm('确认删除该交易记录？')) return;
                        removeTrade(trade.id);
                      }}
                    >删除</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="py-10 text-center text-slate-400">暂无符合条件的交易，试试调整筛选条件或新增交易。</p>}
    </Card>
  );
}
