import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdvancedSettings, CalculatorInputs, CalculatorSettings, Direction, StopMode } from '@/types/calculator';

interface CalculatorState {
  settings: CalculatorSettings;
  advanced: AdvancedSettings;
  inputs: CalculatorInputs;
  setDirection: (direction: Direction) => void;
  setStopMode: (mode: StopMode) => void;
  updateInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  updateAdvanced: <K extends keyof AdvancedSettings>(key: K, value: AdvancedSettings[K]) => void;
  applyRiskPreset: (risk: number) => void;
  applyLeveragePreset: (leverage: number) => void;
  resetAll: () => void;
}

const initialSettings: CalculatorSettings = {
  direction: 'long',
  stopMode: 'price',
  defaultRiskAmount: 2,
  defaultLeverage: 20,
};

const initialAdvanced: AdvancedSettings = {
  showAdvanced: false,
  feeEnabled: false,
  feePercent: 0.04,
  slippageEnabled: false,
  slippagePercent: 0.02,
  balanceCheckEnabled: false,
  availableBalance: '',
  customR: 3,
};

const initialInputs: CalculatorInputs = {
  entryPrice: '',
  stopLossPrice: '',
  stopLossPercent: '',
  riskAmount: 2,
  leverage: 20,
};

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      settings: initialSettings,
      advanced: initialAdvanced,
      inputs: initialInputs,
      setDirection: (direction) => set((state) => ({ settings: { ...state.settings, direction } })),
      setStopMode: (stopMode) => set((state) => ({ settings: { ...state.settings, stopMode } })),
      updateInput: (key, value) => set((state) => ({ inputs: { ...state.inputs, [key]: value } })),
      updateAdvanced: (key, value) => set((state) => ({ advanced: { ...state.advanced, [key]: value } })),
      applyRiskPreset: (risk) =>
        set((state) => ({
          settings: { ...state.settings, defaultRiskAmount: risk },
          inputs: { ...state.inputs, riskAmount: risk },
        })),
      applyLeveragePreset: (leverage) =>
        set((state) => ({
          settings: { ...state.settings, defaultLeverage: leverage },
          inputs: { ...state.inputs, leverage },
        })),
      resetAll: () =>
        set((state) => ({
          settings: { ...state.settings, direction: state.settings.direction, stopMode: state.settings.stopMode },
          inputs: {
            ...initialInputs,
            riskAmount: state.settings.defaultRiskAmount,
            leverage: state.settings.defaultLeverage,
          },
        })),
    }),
    {
      name: 'fast-risk-calculator-settings-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        advanced: state.advanced,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.inputs.riskAmount = state.settings.defaultRiskAmount;
        state.inputs.leverage = state.settings.defaultLeverage;
      },
    },
  ),
);
