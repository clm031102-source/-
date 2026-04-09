import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { useCalculatorStore } from '@/store/calculatorStore';
import { calculatePlan, calcStopPriceByPercent, calcStopPercentByPrice, formatNum, validateInputs } from '@/utils/calculator';
import { QuickPresetButtons } from '@/components/calculator/QuickPresetButtons';
import { ResultMetric } from '@/components/calculator/ResultMetric';
import { useToast } from '@/hooks/useToast';

export function FastRiskCalculator() {
  const { push } = useToast();
  const {
    settings,
    advanced,
    inputs,
    setDirection,
    setStopMode,
    updateInput,
    updateAdvanced,
    applyRiskPreset,
    applyLeveragePreset,
    resetAll,
  } = useCalculatorStore();

  const derivedStopPrice = useMemo(() => {
    if (!inputs.entryPrice || !inputs.stopLossPercent) return null;
    return calcStopPriceByPercent(inputs.entryPrice, Number(inputs.stopLossPercent), settings.direction);
  }, [inputs.entryPrice, inputs.stopLossPercent, settings.direction]);

  const derivedStopPercent = useMemo(() => {
    if (!inputs.entryPrice || !inputs.stopLossPrice) return null;
    return calcStopPercentByPrice(Number(inputs.entryPrice), Number(inputs.stopLossPrice)) * 100;
  }, [inputs.entryPrice, inputs.stopLossPrice]);

  const errors = validateInputs({
    direction: settings.direction,
    entryPrice: inputs.entryPrice,
    stopLossPrice: settings.stopMode === 'price' ? inputs.stopLossPrice : derivedStopPrice ?? '',
    stopLossPercent: settings.stopMode === 'percent' ? inputs.stopLossPercent : derivedStopPercent ?? '',
    riskAmount: inputs.riskAmount,
    leverage: inputs.leverage,
    mode: settings.stopMode,
  });

  const result = useMemo(() => {
    if (errors.length > 0 || !inputs.entryPrice) return null;
    const stopLossPrice = settings.stopMode === 'price' ? Number(inputs.stopLossPrice) : Number(derivedStopPrice);
    if (!stopLossPrice) return null;

    return calculatePlan({
      direction: settings.direction,
      entryPrice: Number(inputs.entryPrice),
      stopLossPrice,
      riskAmount: Number(inputs.riskAmount),
      leverage: Number(inputs.leverage),
      feeEnabled: advanced.feeEnabled,
      feePercent: Number(advanced.feePercent),
      slippageEnabled: advanced.slippageEnabled,
      slippagePercent: Number(advanced.slippagePercent),
      customR: Number(advanced.customR),
    });
  }, [advanced.customR, advanced.feeEnabled, advanced.feePercent, advanced.slippageEnabled, advanced.slippagePercent, derivedStopPrice, errors.length, inputs.entryPrice, inputs.leverage, inputs.riskAmount, inputs.stopLossPrice, settings.direction, settings.stopMode]);

  const copyPlan = async () => {
    if (!result || !inputs.entryPrice) return;
    const stopPrice = settings.stopMode === 'price' ? Number(inputs.stopLossPrice) : Number(derivedStopPrice);
    const oneR = result.targets.find((t) => t.r === 1)?.price;
    const oneHalfR = result.targets.find((t) => t.r === 1.5)?.price;
    const twoR = result.targets.find((t) => t.r === 2)?.price;
    const text = `${settings.direction === 'long' ? '做多' : '做空'}，入场 ${formatNum(Number(inputs.entryPrice), 6)}，止损 ${formatNum(stopPrice, 6)}，${formatNum(inputs.leverage, 2)}x，固定风险 ${formatNum(inputs.riskAmount, 2)}U，建议保证金 ${formatNum(advanced.feeEnabled || advanced.slippageEnabled ? result.adjustedMarginRequired : result.marginRequired, 2)}U，建议仓位 ${formatNum(advanced.feeEnabled || advanced.slippageEnabled ? result.adjustedPositionValue : result.positionValue, 2)}U，1R ${formatNum(oneR ?? 0, 6)}，1.5R ${formatNum(oneHalfR ?? 0, 6)}，2R ${formatNum(twoR ?? 0, 6)}。`;
    await navigator.clipboard.writeText(text);
    push('交易计划已复制');
  };

  return (
    <div className="mx-auto max-w-5xl p-4 text-slate-100 sm:p-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">极速固定风险开仓器</h1>
          <p className="mt-1 text-sm text-slate-400">固定单笔风险，秒速反推仓位与保证金</p>
        </div>
        <Button variant="outline" onClick={() => updateAdvanced('showAdvanced', !advanced.showAdvanced)}>
          {advanced.showAdvanced ? '收起高级模式' : '高级模式'}
        </Button>
      </header>

      <Card className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-300">输入区</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs text-slate-400">方向</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" active={settings.direction === 'long'} onClick={() => setDirection('long')}>做多</Button>
                <Button variant="outline" active={settings.direction === 'short'} onClick={() => setDirection('short')}>做空</Button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-slate-400">入场价</p>
              <Input autoFocus type="number" step="0.0001" placeholder="例如 84250" value={inputs.entryPrice} onChange={(e) => updateInput('entryPrice', e.target.value ? Number(e.target.value) : '')} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs text-slate-400">止损输入模式</p>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <Button variant="outline" active={settings.stopMode === 'price'} onClick={() => setStopMode('price')}>按价格输入</Button>
                <Button variant="outline" active={settings.stopMode === 'percent'} onClick={() => setStopMode('percent')}>按百分比输入</Button>
              </div>
              {settings.stopMode === 'price' ? (
                <Input type="number" step="0.0001" placeholder="止损价" value={inputs.stopLossPrice} onChange={(e) => updateInput('stopLossPrice', e.target.value ? Number(e.target.value) : '')} />
              ) : (
                <Input type="number" step="0.001" placeholder="止损百分比 %" value={inputs.stopLossPercent} onChange={(e) => updateInput('stopLossPercent', e.target.value ? Number(e.target.value) : '')} />
              )}
              <p className="mt-1 text-xs text-slate-500">
                {settings.stopMode === 'price'
                  ? `自动换算止损比例：${derivedStopPercent ? formatNum(derivedStopPercent, 3) : '--'}%`
                  : `自动反推止损价：${derivedStopPrice ? formatNum(derivedStopPrice, 6) : '--'}`}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs text-slate-400">单笔固定亏损额（U）</p>
                <QuickPresetButtons values={[1, 2, 3, 5]} current={inputs.riskAmount} onPick={applyRiskPreset} suffix="U" />
                <Input className="mt-2" type="number" step="0.1" placeholder="自定义风险" value={inputs.riskAmount} onChange={(e) => updateInput('riskAmount', e.target.value ? Number(e.target.value) : 0)} />
              </div>
              <div>
                <p className="mb-2 text-xs text-slate-400">杠杆</p>
                <QuickPresetButtons values={[5, 10, 20, 25, 50]} current={inputs.leverage} onPick={applyLeveragePreset} suffix="x" />
                <Input className="mt-2" type="number" step="1" placeholder="自定义杠杆" value={inputs.leverage} onChange={(e) => updateInput('leverage', e.target.value ? Number(e.target.value) : 0)} />
              </div>
            </div>
          </div>
        </section>

        {advanced.showAdvanced && (
          <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <h2 className="text-sm font-semibold text-slate-300">高级模式</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-800 p-3">
                <p className="mb-2 text-sm">风险修正</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span>手续费修正</span><Switch checked={advanced.feeEnabled} onChange={(v) => updateAdvanced('feeEnabled', v)} /></div>
                  {advanced.feeEnabled && <Input type="number" step="0.001" value={advanced.feePercent} onChange={(e) => updateAdvanced('feePercent', Number(e.target.value))} />}
                  <div className="flex items-center justify-between"><span>滑点修正</span><Switch checked={advanced.slippageEnabled} onChange={(v) => updateAdvanced('slippageEnabled', v)} /></div>
                  {advanced.slippageEnabled && <Input type="number" step="0.001" value={advanced.slippagePercent} onChange={(e) => updateAdvanced('slippagePercent', Number(e.target.value))} />}
                </div>
              </div>
              <div className="rounded-lg border border-slate-800 p-3">
                <p className="mb-2 text-sm">账户校验 / 高级目标位</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span>可用余额校验</span><Switch checked={advanced.balanceCheckEnabled} onChange={(v) => updateAdvanced('balanceCheckEnabled', v)} /></div>
                  {advanced.balanceCheckEnabled && (
                    <Input type="number" step="0.01" placeholder="可用余额" value={advanced.availableBalance} onChange={(e) => updateAdvanced('availableBalance', e.target.value ? Number(e.target.value) : '')} />
                  )}
                  <Input type="number" step="0.1" placeholder="自定义 R 值" value={advanced.customR} onChange={(e) => updateAdvanced('customR', Number(e.target.value || 0))} />
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-300">结果区（实时）</h2>
          {errors.length > 0 || !result ? (
            <div className="rounded-lg border border-dashed border-slate-700 p-6 text-sm text-slate-400">请先输入有效参数：{errors[0] ?? '入场价与止损'}</div>
          ) : (
            <>
              {(advanced.feeEnabled || advanced.slippageEnabled) && (
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-sm text-amber-200">已启用风险修正（手续费 / 滑点已计入）</p>
              )}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <ResultMetric label="止损距离" value={formatNum(result.stopDistance, 6)} />
                <ResultMetric label="止损百分比" value={`${formatNum(result.stopLossPercent * 100, 3)}%`} />
                <ResultMetric label="可开数量" value={formatNum(result.quantity, 6)} />
                <ResultMetric label="建议仓位价值" value={`${formatNum(result.positionValue, 2)} U`} />
                <ResultMetric label="建议保证金" value={`${formatNum(result.marginRequired, 2)} U`} highlight />
                <ResultMetric label="到止损预计亏损" value={`${formatNum(result.estimatedLoss, 2)} U`} highlight />
              </div>

              {(advanced.feeEnabled || advanced.slippageEnabled) && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <ResultMetric label="修正后总风险比例" value={`${formatNum(result.effectiveRiskPercent * 100, 3)}%`} />
                  <ResultMetric label="修正后建议仓位" value={`${formatNum(result.adjustedPositionValue, 2)} U`} />
                  <ResultMetric label="修正后保证金" value={`${formatNum(result.adjustedMarginRequired, 2)} U`} highlight />
                  <ResultMetric label="修正后预计亏损" value={`${formatNum(result.adjustedEstimatedLoss, 2)} U`} highlight />
                </div>
              )}

              {advanced.balanceCheckEnabled && advanced.availableBalance !== '' && (
                <p className={`rounded-lg p-2 text-sm ${Number(advanced.availableBalance) < result.marginRequired ? 'bg-red-600/15 text-red-300' : 'bg-emerald-600/15 text-emerald-300'}`}>
                  {Number(advanced.availableBalance) < result.marginRequired
                    ? '所需保证金超过当前可用余额，当前风险设置下无法开出该仓位。'
                    : '保证金在可用余额范围内。'}
                </p>
              )}

              {result.warnings.map((warn) => (
                <p key={warn} className="text-xs text-amber-300">{warn}</p>
              ))}
            </>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-300">快捷目标位</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(result?.targets ?? []).map((t) => (
              <div key={t.r} className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-center">
                <p className="text-xs text-slate-400">{t.r}R</p>
                <p className="text-sm font-semibold">{formatNum(t.price, 6)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          <Button variant="accent" onClick={copyPlan} disabled={!result}>一键复制结果</Button>
          <Button variant="danger" onClick={resetAll}>一键重置</Button>
        </section>
      </Card>
    </div>
  );
}
