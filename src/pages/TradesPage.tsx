import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useJournalStore } from '@/store/useJournalStore';
import { TradeDetailPanel } from '@/features/trade/TradeDetailPanel';
import { TradeForm } from '@/features/trade/TradeForm';
import { useToast } from '@/hooks/useToast';

const norm = (v: string) => v.trim().toLocaleLowerCase();

export function TradesPage() {
  const { trades, strategies, removeTrade, duplicateTrade } = useJournalStore();
  const { push } = useToast();
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [strategy, setStrategy] = useState('all');
  const [direction, setDirection] = useState<'all' | '做多' | '做空'>('all');
  const [tag, setTag] = useState('all');
  const [sortBy, setSortBy] = useState<'desc' | 'asc'>('desc');
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({});

  const uniqueTags = useMemo(() => [...new Set(trades.flatMap((t) => t.tags || []))], [trades]);

  const filtered = useMemo(() => {
    const q = norm(keyword);
    return [...trades]
      .filter((t) => (strategy === 'all' ? true : t.strategyId === strategy))
      .filter((t) => (direction === 'all' ? true : t.direction === direction))
      .filter((t) => (tag === 'all' ? true : (t.tags ?? []).includes(tag)))
      .filter((t) => {
        if (!q) return true;
        return norm(t.title).includes(q) || norm(t.symbol).includes(q);
      })
      .sort((a, b) => {
        const diff = dayjs(a.tradeDate).valueOf() - dayjs(b.tradeDate).valueOf();
        return sortBy === 'desc' ? -diff : diff;
      });
  }, [direction, keyword, sortBy, strategy, tag, trades]);

  const selectedTrade = trades.find((t) => t.id === selected) ?? null;
  const editingTrade = trades.find((t) => t.id === editing) ?? null;

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-64 flex-1">
            <p className="mb-1 text-sm muted">搜索（标题/品种，自动忽略大小写与首尾空格）</p>
            <Input placeholder="例如 btc / BTC / Btc" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <div className="w-52">
            <p className="mb-1 text-sm muted">策略筛选</p>
            <Select value={strategy} onChange={(e) => setStrategy(e.target.value)}><option value="all">全部策略</option>{strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          </div>
          <div className="w-40">
            <p className="mb-1 text-sm muted">方向</p>
            <Select value={direction} onChange={(e) => setDirection(e.target.value as 'all' | '做多' | '做空')}><option value="all">全部</option><option value="做多">做多</option><option value="做空">做空</option></Select>
          </div>
          <div className="w-44">
            <p className="mb-1 text-sm muted">标签</p>
            <Select value={tag} onChange={(e) => setTag(e.target.value)}><option value="all">全部标签</option>{uniqueTags.map((x) => <option key={x}>{x}</option>)}</Select>
          </div>
          <div className="w-44">
            <p className="mb-1 text-sm muted">时间排序</p>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'desc' | 'asc')}><option value="desc">最新优先</option><option value="asc">最早优先</option></Select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1220px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line-soft)] muted">
                <th className="w-[110px] py-2 whitespace-nowrap">时间</th>
                <th className="w-[240px]">标题</th>
                <th className="w-[90px] whitespace-nowrap">品种</th>
                <th className="w-[190px] whitespace-nowrap">策略</th>
                <th className="w-[88px] whitespace-nowrap">方向</th>
                <th className="w-[100px] whitespace-nowrap">盈亏</th>
                <th className="w-[340px]">标签</th>
                <th className="w-[290px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="table-row-hover border-b border-[var(--line-soft)]">
                  <td className="py-3 whitespace-nowrap">{dayjs(t.tradeDate).format('MM-DD HH:mm')}</td>
                  <td>{t.title} {dayjs(t.updatedAt).isAfter(dayjs().subtract(2, 'day')) && <span className="ml-2 rounded bg-[#2f2718] px-1.5 py-0.5 text-xs text-[#e6d2af]">最近编辑</span>}</td>
                  <td className="whitespace-nowrap">{t.symbol}</td>
                  <td className="whitespace-nowrap">{strategies.find((s) => s.id === t.strategyId)?.name ?? '-'}</td>
                  <td className="whitespace-nowrap">{t.direction}</td>
                  <td className={`whitespace-nowrap ${t.pnl >= 0 ? 'stat-good' : 'stat-bad'}`}>{t.pnl.toFixed(2)}</td>
                  <td className="muted">
                    {(() => {
                      const tags = t.tags || [];
                      if (!tags.length) return '-';
                      const expanded = expandedTags[t.id];
                      const primaryTags = tags.slice(0, 3);
                      const showTags = expanded ? tags : primaryTags;
                      const hasMore = tags.length > primaryTags.length;
                      return (
                        <div className="flex items-start gap-1">
                          <span className="leading-6">{showTags.join(' / ')}</span>
                          {hasMore && (
                            <button
                              type="button"
                              className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border border-[var(--line-soft)] text-xs text-[var(--text-muted)] transition hover:border-[#5f5648] hover:text-[var(--text-main)]"
                              aria-label={expanded ? '收起标签' : '展开标签'}
                              onClick={() => setExpandedTags((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
                            >
                              {expanded ? '▲' : '▼'}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="space-x-1 py-2">
                    <Button onClick={() => setSelected(t.id)}>详情</Button>
                    <Button onClick={() => setEditing(t.id)}>编辑</Button>
                    <Button onClick={() => { duplicateTrade(t.id); push('已快速复制一笔记录。'); }}>复制</Button>
                    <Button variant="danger" onClick={() => { if (window.confirm('确认删除？')) { removeTrade(t.id); push('记录已删除。'); } }}>删除</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <div className="rounded-xl border border-[var(--line-soft)] bg-[#101010] p-6 text-center">
            <p className="text-lg">暂无匹配记录</p>
            <p className="muted text-sm">可尝试切换筛选，或新增第一笔交易记录。</p>
          </div>
        )}
      </Card>

      <Modal open={Boolean(selectedTrade)} title="交易详情" onClose={() => setSelected(null)}>{selectedTrade && <TradeDetailPanel trade={selectedTrade} />}</Modal>
      <Modal open={Boolean(editingTrade)} title="编辑交易" onClose={() => setEditing(null)}>{editingTrade && <TradeForm initial={editingTrade} mode="detailed" onSubmitSuccess={() => setEditing(null)} />}</Modal>
    </div>
  );
}
