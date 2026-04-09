import { CalculationResult, Direction } from '@/types/calculator';

const defaultTargets = [1, 1.5, 2, 2.5];

export function calcStopPercentByPrice(entryPrice: number, stopLossPrice: number) {
  return Math.abs(entryPrice - stopLossPrice) / entryPrice;
}

export function calcStopPriceByPercent(entryPrice: number, stopLossPercent: number, direction: Direction) {
  const ratio = stopLossPercent / 100;
  return direction === 'long' ? entryPrice * (1 - ratio) : entryPrice * (1 + ratio);
}

export function validateInputs(params: {
  direction: Direction;
  entryPrice: number | '';
  stopLossPrice: number | '';
  stopLossPercent: number | '';
  riskAmount: number;
  leverage: number;
  mode: 'price' | 'percent';
}) {
  const errors: string[] = [];
  const { direction, entryPrice, stopLossPrice, stopLossPercent, riskAmount, leverage, mode } = params;
  if (!entryPrice || entryPrice <= 0) errors.push('入场价必须大于 0');
  if (!riskAmount || riskAmount <= 0) errors.push('风险金额必须大于 0');
  if (!leverage || leverage <= 0) errors.push('杠杆必须大于 0');

  if (mode === 'price') {
    if (!stopLossPrice || stopLossPrice <= 0) errors.push('止损价必须大于 0');
    if (entryPrice && stopLossPrice) {
      if (direction === 'long' && stopLossPrice >= entryPrice) errors.push('做多时止损价必须低于入场价');
      if (direction === 'short' && stopLossPrice <= entryPrice) errors.push('做空时止损价必须高于入场价');
    }
  } else {
    if (!stopLossPercent || stopLossPercent <= 0) errors.push('止损百分比必须大于 0');
  }

  return errors;
}

export function calculatePlan(params: {
  direction: Direction;
  entryPrice: number;
  stopLossPrice: number;
  riskAmount: number;
  leverage: number;
  feeEnabled: boolean;
  feePercent: number;
  slippageEnabled: boolean;
  slippagePercent: number;
  customR?: number;
}): CalculationResult {
  const stopDistance = Math.abs(params.entryPrice - params.stopLossPrice);
  const stopLossPercent = calcStopPercentByPrice(params.entryPrice, params.stopLossPrice);
  const positionValue = params.riskAmount / stopLossPercent;
  const marginRequired = positionValue / params.leverage;
  const quantity = positionValue / params.entryPrice;
  const estimatedLoss = positionValue * stopLossPercent;

  const fee = params.feeEnabled ? params.feePercent / 100 : 0;
  const slippage = params.slippageEnabled ? params.slippagePercent / 100 : 0;
  const effectiveRiskPercent = stopLossPercent + fee + slippage;
  const adjustedPositionValue = params.riskAmount / effectiveRiskPercent;
  const adjustedMarginRequired = adjustedPositionValue / params.leverage;
  const adjustedEstimatedLoss = adjustedPositionValue * effectiveRiskPercent;

  const targetLevels = [...defaultTargets, ...(params.customR && !defaultTargets.includes(params.customR) ? [params.customR] : [])];
  const targets = targetLevels.sort((a, b) => a - b).map((r) => {
    const diff = stopDistance * r;
    const price = params.direction === 'long' ? params.entryPrice + diff : params.entryPrice - diff;
    return { r, price };
  });

  const warnings: string[] = [];
  if (stopLossPercent > 0.05) warnings.push('当前止损比例超过 5%，请确认是否符合短线策略。');

  return {
    stopDistance,
    stopLossPercent,
    positionValue,
    marginRequired,
    quantity,
    estimatedLoss,
    effectiveRiskPercent,
    adjustedPositionValue,
    adjustedMarginRequired,
    adjustedEstimatedLoss,
    warnings,
    targets,
  };
}

export function formatNum(value: number, digits = 4) {
  if (!Number.isFinite(value)) return '--';
  return value.toLocaleString('zh-CN', { maximumFractionDigits: digits });
}
