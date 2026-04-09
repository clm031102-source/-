import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import dayjs from 'dayjs';
import { sampleStrategies, sampleSummaries, sampleTags, sampleTrades } from '@/data/sampleData';
import { createId } from '@/utils/id';
import { Strategy, Trade, TradeSummary, TradeTag } from '@/types/trade';

interface TradeStore {
  trades: Trade[];
  tags: TradeTag[];
  strategies: Strategy[];
  summaries: TradeSummary[];

  addTrade: (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrade: (id: string, patch: Partial<Trade>) => void;
  removeTrade: (id: string) => void;
  duplicateTrade: (id: string) => void;

  addTag: (name: string) => string;
  addSummary: (summary: Omit<TradeSummary, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSummary: (id: string, patch: Partial<TradeSummary>) => void;
  removeSummary: (id: string) => void;
}

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      trades: sampleTrades,
      tags: sampleTags,
      strategies: sampleStrategies,
      summaries: sampleSummaries,

      addTrade: (trade) => {
        const now = dayjs().toISOString();
        const record: Trade = { ...trade, id: createId(), createdAt: now, updatedAt: now };
        set((state) => ({ trades: [record, ...state.trades] }));
      },
      updateTrade: (id, patch) =>
        set((state) => ({
          trades: state.trades.map((trade) =>
            trade.id === id ? { ...trade, ...patch, updatedAt: dayjs().toISOString() } : trade,
          ),
        })),
      removeTrade: (id) => set((state) => ({ trades: state.trades.filter((t) => t.id !== id) })),
      duplicateTrade: (id) => {
        const source = get().trades.find((trade) => trade.id === id);
        if (!source) return;
        const now = dayjs().toISOString();
        const copy: Trade = {
          ...source,
          id: createId(),
          title: `${source.title} - 复制`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ trades: [copy, ...state.trades] }));
      },
      addTag: (name) => {
        const existing = get().tags.find((item) => item.name === name.trim());
        if (existing) return existing.id;
        const tag: TradeTag = {
          id: createId(),
          name: name.trim(),
          createdAt: dayjs().toISOString(),
        };
        set((state) => ({ tags: [...state.tags, tag] }));
        return tag.id;
      },
      addSummary: (summary) => {
        const now = dayjs().toISOString();
        set((state) => ({
          summaries: [{ ...summary, id: createId(), createdAt: now, updatedAt: now }, ...state.summaries],
        }));
      },
      updateSummary: (id, patch) =>
        set((state) => ({
          summaries: state.summaries.map((summary) =>
            summary.id === id ? { ...summary, ...patch, updatedAt: dayjs().toISOString() } : summary,
          ),
        })),
      removeSummary: (id) =>
        set((state) => ({ summaries: state.summaries.filter((summary) => summary.id !== id) })),
    }),
    {
      name: 'trade-review-storage-v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
