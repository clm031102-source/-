import dayjs from 'dayjs';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { seedStrategies, seedTrades } from '@/data/seed';
import { Strategy, Trade } from '@/types/trade';

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

interface PresetConfig {
  riskPresets: number[];
  leveragePresets: number[];
}

interface JournalState {
  trades: Trade[];
  strategies: Strategy[];
  selectedStrategyForStats: 'all' | string;
  presetConfig: PresetConfig;
  setSelectedStrategyForStats: (id: 'all' | string) => void;
  setRiskPresets: (values: number[]) => void;
  setLeveragePresets: (values: number[]) => void;
  addTrade: (t: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrade: (id: string, patch: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeTrade: (id: string) => void;
  addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      trades: seedTrades,
      strategies: seedStrategies,
      selectedStrategyForStats: 'all',
      presetConfig: {
        riskPresets: [1, 2, 3],
        leveragePresets: [5, 10, 20],
      },
      setSelectedStrategyForStats: (selectedStrategyForStats) => set({ selectedStrategyForStats }),
      setRiskPresets: (riskPresets) => set((state) => ({ presetConfig: { ...state.presetConfig, riskPresets } })),
      setLeveragePresets: (leveragePresets) => set((state) => ({ presetConfig: { ...state.presetConfig, leveragePresets } })),
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
      addStrategy: (strategy) => {
        const created: Strategy = { ...strategy, id: id(), createdAt: dayjs().toISOString() };
        set((state) => ({ strategies: [created, ...state.strategies] }));
      },
    }),
    {
      name: 'trade-journal-v3',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
