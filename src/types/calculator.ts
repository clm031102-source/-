export type Direction = 'long' | 'short';
export type StopMode = 'price' | 'percent';

export interface AdvancedSettings {
  showAdvanced: boolean;
  feeEnabled: boolean;
  feePercent: number;
  slippageEnabled: boolean;
  slippagePercent: number;
  balanceCheckEnabled: boolean;
  availableBalance: number | '';
  customR: number;
}

export interface CalculatorSettings {
  direction: Direction;
  stopMode: StopMode;
  defaultRiskAmount: number;
  defaultLeverage: number;
}

export interface CalculatorInputs {
  entryPrice: number | '';
  stopLossPrice: number | '';
  stopLossPercent: number | '';
  riskAmount: number;
  leverage: number;
}

export interface CalculationResult {
  stopDistance: number;
  stopLossPercent: number;
  positionValue: number;
  marginRequired: number;
  quantity: number;
  estimatedLoss: number;
  effectiveRiskPercent: number;
  adjustedPositionValue: number;
  adjustedMarginRequired: number;
  adjustedEstimatedLoss: number;
  warnings: string[];
  targets: { r: number; price: number }[];
}
