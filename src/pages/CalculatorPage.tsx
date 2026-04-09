import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJournalStore } from '@/store/useJournalStore';

const toNum = (v: string) => (v === '' ? NaN : Number(v));
const fmt = (n: number, d = 4) => (Number.isFinite(n) ? n.toLocaleString('zh-CN', { maximumFractionDigits: d }) : '--');

function PresetBar({
  label,
  unit,
  values,
  active,
  setActive,
  onChange,
}: {
  label: string;
  unit: string;
  values: number[];
  active: number;
  setActive: (n: number) => void;
  onChange: (n: number[]) => void;
}) {
  const [custom, setCustom] = useState('');
  const [editing, setEditing] = useState(false);

  const main = [...values, 0, 0, 0].slice(0, 3);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm muted">{label}</p>
        <Button variant="ghost" onClick={() => setEditing((v) => !v)}>{editing ? '完成编辑' : '编辑预设'}</Button>
      </div>

      {!editing ? (
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_220px]">
          {main.map((v, i) => (
            <button key={`${i}-${v}`} className={`rounded-xl border px-4 py-2 text-lg ${active === v ? 'border-[#7f6a48] bg-[#2a2f38] text-[#f0dfc2]' : 'border-[var(--line-soft)] bg-[#12161d]'}`} onClick={() => setActive(v)}>
              {v}{unit}
            </button>
          ))}
          <div className="flex gap-2">
            <Input value={custom} placeholder={`输入自定义${unit}`} onChange={(e) => { setCustom(e.target.value); const n = toNum(e.target.value); if (Number.isFinite(n) && n > 0) setActive(n); }} />
            <Button onClick={() => { const n = toNum(custom); if (!Number.isFinite(n) || n <= 0) return; setActive(n); }}>应用</Button>
          </div>
        </div>
      ) : (
        <Card className="space-y-2">
          {values.map((v, i) => (
            <div key={`${v}-${i}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <Input value={String(v)} onChange={(e) => {
                const n = toNum(e.target.value);
                const next = [...values];
                next[i] = Number.isFinite(n) && n > 0 ? n : 0;
                onChange(next);
                if (active === v) setActive(next[i]);
              }} />
              <Button variant="secondary" onClick={() => setActive(v)}>设为当前</Button>
              <Button variant="danger" onClick={() => {
                const next = values.filter((_, idx) => idx !== i);
                onChange(next.length ? next : [1, 2, 5]);
                if (!next.includes(active)) setActive(next[0] ?? 1);
              }}>删除</Button>
            </div>
          ))}
          <div className="flex gap-2"><Input value={custom} placeholder="新增预设值" onChange={(e) => setCustom(e.target.value)} /><Button onClick={() => { const n = toNum(custom); if (!Number.isFinite(n) || n <= 0) return; onChange([...values, n]); setCustom(''); }}>新增预设</Button></div>
        </Card>
      )}
    </div>
  );
}

export function CalculatorPage() {
  const { presetConfig, setRiskPresets, setLeveragePresets } = useJournalStore();
  const [direction, setDirection] = useState<'做多' | '做空'>('做多');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopMode, setStopMode] = useState<'price' | 'percent'>('price');
  const [stopPrice, setStopPrice] = useState('');
  const [stopPercent, setStopPercent] = useState('');
  const [riskAmount, setRiskAmount] = useState(presetConfig.riskPresets[1] ?? 2);
  const [leverage, setLeverage] = useState(presetConfig.leveragePresets[2] ?? 20);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [feeOn, setFeeOn] = useState(false);
  const [slippageOn, setSlippageOn] = useState(false);
  const [feePercent, setFeePercent] = useState('0.04');
  const [slippagePercent, setSlippagePercent] = useState('0.02');
  const [balanceOn, setBalanceOn] = useState(false);
  const [balance, setBalance] = useState('');
  const [customR, setCustomR] = useState('3');

  const calc = useMemo(() => {
    const entry = toNum(entryPrice); if (!Number.isFinite(entry) || entry <= 0) return null;
    let slPercent = 0; let slPrice = 0;
    if (stopMode === 'price') {
      slPrice = toNum(stopPrice);
      if (!Number.isFinite(slPrice) || slPrice <= 0) return null;
      if ((direction === '做多' && slPrice >= entry) || (direction === '做空' && slPrice <= entry)) return null;
      slPercent = Math.abs(entry - slPrice) / entry;
    } else {
      slPercent = toNum(stopPercent) / 100;
      if (!Number.isFinite(slPercent) || slPercent <= 0) return null;
      slPrice = direction === '做多' ? entry * (1 - slPercent) : entry * (1 + slPercent);
    }

    const basePosition = riskAmount / slPercent;
    const fee = feeOn ? toNum(feePercent) / 100 : 0;
    const slippage = slippageOn ? toNum(slippagePercent) / 100 : 0;
    const effectiveRisk = slPercent + fee + slippage;
    const positionValue = riskAmount / effectiveRisk;
    const margin = positionValue / leverage;
    const qty = positionValue / entry;
    const stopLossAmount = positionValue * effectiveRisk;
    const dist = Math.abs(entry - slPrice);
    const rs = [1, 1.5, 2, toNum(customR)].filter((n, i, arr) => Number.isFinite(n) && n > 0 && arr.indexOf(n) === i);
    const targets = rs.map((r) => ({ r, price: direction === '做多' ? entry + dist * r : entry - dist * r }));

    return { slPercent, slPrice, basePosition, positionValue, margin, qty, stopLossAmount, dist, targets, effectiveRisk };
  }, [customR, direction, entryPrice, feeOn, feePercent, leverage, riskAmount, slippageOn, slippagePercent, stopMode, stopPercent, stopPrice]);

  return (
    <div className="space-y-3">
      <Card className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold gold-text">开仓计算器</h2>
          <p className="muted">固定风险开仓引擎（极速模式 + 高级模式）</p>
        </div>
        <Button onClick={() => setShowAdvanced((v) => !v)}>{showAdvanced ? '收起高级模式' : '高级模式'}</Button>
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-2 md:grid-cols-4">
          <Button className={direction === '做多' ? 'border-[#6f9f7f]' : ''} onClick={() => setDirection('做多')}>做多</Button>
          <Button className={direction === '做空' ? 'border-[#9f6f6f]' : ''} onClick={() => setDirection('做空')}>做空</Button>
          <Button className={stopMode === 'price' ? 'border-[#7f6a48]' : ''} onClick={() => setStopMode('price')}>按价格止损</Button>
          <Button className={stopMode === 'percent' ? 'border-[#7f6a48]' : ''} onClick={() => setStopMode('percent')}>按百分比止损</Button>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <Input value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="入场价" />
          {stopMode === 'price' ? <Input value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="止损价" /> : <Input value={stopPercent} onChange={(e) => setStopPercent(e.target.value)} placeholder="止损百分比%" />}
          <Input readOnly value={calc ? `止损价 ${fmt(calc.slPrice, 6)} / 止损比例 ${fmt(calc.slPercent * 100, 3)}%` : '等待输入'} />
        </div>

        <PresetBar label="固定风险预设" unit="U" values={presetConfig.riskPresets} active={riskAmount} setActive={setRiskAmount} onChange={setRiskPresets} />
        <PresetBar label="杠杆预设" unit="x" values={presetConfig.leveragePresets} active={leverage} setActive={setLeverage} onChange={setLeveragePresets} />

        {showAdvanced && (
          <Card className="space-y-2">
            <h3 className="text-lg font-semibold">高级模式</h3>
            <div className="grid gap-2 md:grid-cols-4">
              <Button variant={feeOn ? 'primary' : 'secondary'} onClick={() => setFeeOn((v) => !v)}>手续费修正</Button>
              <Input value={feePercent} onChange={(e) => setFeePercent(e.target.value)} placeholder="手续费%" />
              <Button variant={slippageOn ? 'primary' : 'secondary'} onClick={() => setSlippageOn((v) => !v)}>滑点修正</Button>
              <Input value={slippagePercent} onChange={(e) => setSlippagePercent(e.target.value)} placeholder="滑点%" />
              <Button variant={balanceOn ? 'primary' : 'secondary'} onClick={() => setBalanceOn((v) => !v)}>余额校验</Button>
              <Input value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="可用余额" />
              <Input value={customR} onChange={(e) => setCustomR(e.target.value)} placeholder="自定义R" />
              <Input readOnly value={calc ? `修正后总风险 ${(calc.effectiveRisk * 100).toFixed(3)}%` : '修正结果'} />
            </div>
          </Card>
        )}

        <div className="grid gap-2 md:grid-cols-3">
          <Input readOnly value={`基础仓位：${calc ? fmt(calc.basePosition, 2) : '--'} U`} />
          <Input readOnly value={`修正后仓位：${calc ? fmt(calc.positionValue, 2) : '--'} U`} />
          <Input readOnly value={`建议保证金：${calc ? fmt(calc.margin, 2) : '--'} U`} className={balanceOn && calc && toNum(balance) < calc.margin ? 'stat-bad' : ''} />
          <Input readOnly value={`可开数量：${calc ? fmt(calc.qty, 6) : '--'}`} />
          <Input readOnly value={`预计亏损：${calc ? fmt(calc.stopLossAmount, 2) : '--'} U`} />
          <Input readOnly value={calc ? calc.targets.map((t) => `${t.r}R:${fmt(t.price, 4)}`).join(' / ') : '目标位'} />
        </div>

        {balanceOn && calc && Number.isFinite(toNum(balance)) && toNum(balance) < calc.margin && <p className="stat-bad text-sm">所需保证金超过可用余额，当前设置下无法开仓。</p>}
      </Card>
    </div>
  );
}
