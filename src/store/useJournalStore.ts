import dayjs from 'dayjs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seedStrategies, seedSummaries, seedTrades } from '@/data/seed';
import { journalStorage } from '@/lib/journalData';
import { Strategy, Trade, WeeklySummary } from '@/types/trade';

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

interface PresetConfig {
  riskPresets: number[];
  leveragePresets: number[];
}

interface JournalState {
  trades: Trade[];
  strategies: Strategy[];
  summaries: WeeklySummary[];
  selectedStrategyForStats: 'all' | string;
  presetConfig: PresetConfig;
  setSelectedStrategyForStats: (id: 'all' | string) => void;
  setRiskPresets: (values: number[]) => void;
  setLeveragePresets: (values: number[]) => void;

  addTrade: (t: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrade: (id: string, patch: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeTrade: (id: string) => void;
  duplicateTrade: (id: string) => void;

  addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => void;

  addSummary: (summary: Omit<WeeklySummary, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSummary: (id: string, patch: Partial<WeeklySummary>) => void;
  removeSummary: (id: string) => void;

  replaceAllData: (snapshot: { trades: Trade[]; summaries: WeeklySummary[]; strategies: Strategy[] }) => void;
  resetToSeedData: () => void;
  clearAllData: () => void;
}

const defaultPreset: PresetConfig = { riskPresets: [1, 2, 5], leveragePresets: [5, 10, 20] };

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      trades: seedTrades,
      strategies: seedStrategies,
      summaries: seedSummaries,
      selectedStrategyForStats: 'all',
      presetConfig: defaultPreset,
      setSelectedStrategyForStats: (selectedStrategyForStats) => set({ selectedStrategyForStats }),
      setRiskPresets: (riskPresets) => set((state) => ({ presetConfig: { ...state.presetConfig, riskPresets: riskPresets.filter((n) => n > 0) } })),
      setLeveragePresets: (leveragePresets) => set((state) => ({ presetConfig: { ...state.presetConfig, leveragePresets: leveragePresets.filter((n) => n > 0) } })),
      addTrade: (t) => {
        const now = dayjs().toISOString();
        set((state) => ({ trades: [{ ...t, id: id(), createdAt: now, updatedAt: now }, ...state.trades] }));
      },
      updateTrade: (tradeId, patch) => {
        set((state) => ({
          trades: state.trades.map((trade) =>
            trade.id === tradeId ? { ...trade, ...patch, updatedAt: dayjs().toISOString() } : trade,
          ),
        }));
      },
      removeTrade: (tradeId) => set((state) => ({ trades: state.trades.filter((t) => t.id !== tradeId) })),
      duplicateTrade: (tradeId) => {
        const trade = get().trades.find((item) => item.id === tradeId);
        if (!trade) return;
        const now = dayjs().toISOString();
        const copy: Trade = {
          ...trade,
          id: id(),
          title: `${trade.title}（复制）`,
          tradeDate: now,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ trades: [copy, ...state.trades] }));
      },
      addStrategy: (strategy) => {
        const created: Strategy = { ...strategy, id: id(), createdAt: dayjs().toISOString() };
        set((state) => ({ strategies: [created, ...state.strategies] }));
      },
      addSummary: (summary) => {
        const now = dayjs().toISOString();
        const next: WeeklySummary = { ...summary, id: id(), createdAt: now, updatedAt: now };
        set((state) => ({ summaries: [next, ...state.summaries] }));
      },
      updateSummary: (summaryId, patch) => {
        set((state) => ({
          summaries: state.summaries.map((item) =>
            item.id === summaryId ? { ...item, ...patch, updatedAt: dayjs().toISOString() } : item,
          ),
        }));
      },
      removeSummary: (summaryId) => {
        set((state) => ({ summaries: state.summaries.filter((item) => item.id !== summaryId) }));
      },
      replaceAllData: (snapshot) => {
        set({ trades: snapshot.trades, summaries: snapshot.summaries, strategies: snapshot.strategies });
      },
      resetToSeedData: () => {
        set({ trades: seedTrades, summaries: seedSummaries, strategies: seedStrategies, presetConfig: defaultPreset });
      },
      clearAllData: () => {
        set({ trades: [], summaries: [], strategies: [], presetConfig: defaultPreset });
      },
    }),
    {
      name: 'trade-journal-v5',
      storage: journalStorage,
    },
  ),
);
