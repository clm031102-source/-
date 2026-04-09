import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJournalStore } from '@/store/useJournalStore';

const toNum = (v: string) => (v === '' ? NaN : Number(v));
const fmt = (n: number, d = 4) => (Number.isFinite(n) ? n.toLocaleString('zh-CN', { maximumFractionDigits: d }) : '--');

function EditablePresetGroup({ label, unit, values, active, onActive, onChange }: { label: string; unit: string; values: number[]; active: number; onActive: (v: number) => void; onChange: (v: number[]) => void }) {
  const [extraInput, setExtraInput] = useState('');
  const setValueAt = (index: number, raw: string) => {
    const next = [...values];
    next[index] = raw === '' ? 0 : Number(raw);
    onChange(next);
    if (active === values[index]) onActive(next[index]);
  };
  return (
    <div>
      <p className="mb-2 text-sm muted">{label}</p>
      <div className="grid gap-2 sm:grid-cols-4">{values.map((value, idx) => <div key={`${idx}-${value}`} className="rounded-xl border border-[var(--line-soft)] bg-[#0c121c] p-2"><button className={`mb-2 w-full rounded-lg px-2 py-1 text-lg ${active === value ? 'bg-[#2b3545] border border-[#8a7553]' : 'bg-[#151d2a]'}`} onClick={() => onActive(value)}>{value}{unit}</button><Input value={String(value)} onChange={(e) => setValueAt(idx, e.target.value)} />{idx >= 3 && <button className="mt-1 text-xs stat-bad" onClick={() => onChange(values.filter((_, i) => i !== idx))}>删除标签</button>}</div>)}</div>
      <div className="mt-2 flex gap-2"><Input value={extraInput} placeholder={`新增第${values.length + 1}个标签`} onChange={(e) => setExtraInput(e.target.value)} /><Button onClick={() => { const n = toNum(extraInput); if (!Number.isFinite(n) || n <= 0) return; onChange([...values, n]); onActive(n); setExtraInput(''); }}>添加</Button></div>
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
  const [riskAmount, setRiskAmount] = useState(presetConfig.riskPresets[1] ?? presetConfig.riskPresets[0] ?? 2);
  const [leverage, setLeverage] = useState(presetConfig.leveragePresets[2] ?? presetConfig.leveragePresets[0] ?? 20);
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
    if (stopMode === 'price') { slPrice = toNum(stopPrice); if (!Number.isFinite(slPrice) || slPrice <= 0) return null; if ((direction === '做多' && slPrice >= entry) || (direction === '做空' && slPrice <= entry)) return null; slPercent = Math.abs(entry - slPrice) / entry; }
    else { slPercent = toNum(stopPercent) / 100; if (!Number.isFinite(slPercent) || slPercent <= 0) return null; slPrice = direction === '做多' ? entry * (1 - slPercent) : entry * (1 + slPercent); }

    const basePosition = riskAmount / slPercent;
    const fee = feeOn ? toNum(feePercent) / 100 : 0;
    const slippage = slippageOn ? toNum(slippagePercent) / 100 : 0;
    const effectiveRisk = slPercent + fee + slippage;
    const positionValue = riskAmount / effectiveRisk;
    const margin = positionValue / leverage;
    const qty = positionValue / entry;
    const stopLossAmount = positionValue * effectiveRisk;
    const dist = Math.abs(entry - slPrice);
    const rs = [1, 1.5, 2, 2.5, toNum(customR)].filter((n, i, arr) => Number.isFinite(n) && n > 0 && arr.indexOf(n) === i);
    const targets = rs.map((r) => ({ r, price: direction === '做多' ? entry + dist * r : entry - dist * r }));
    return { slPercent, slPrice, basePosition, positionValue, margin, qty, stopLossAmount, dist, targets, effectiveRisk };
  }, [customR, direction, entryPrice, feeOn, feePercent, leverage, riskAmount, slippageOn, slippagePercent, stopMode, stopPercent, stopPrice]);

  return (
    <div className="space-y-3">
      <Card className="flex items-center justify-between"><div><h2 className="text-2xl font-semibold gold-text">开仓计算器</h2><p className="muted">极速开仓 + 高级风控修正</p></div><Button onClick={() => setShowAdvanced((v) => !v)}>{showAdvanced ? '收起高级模式' : '高级模式'}</Button></Card>
      <Card className="space-y-4">
        <div className="grid gap-2 md:grid-cols-4"><Button className={direction === '做多' ? 'border-[#6f9f7f]' : ''} onClick={() => setDirection('做多')}>做多</Button><Button className={direction === '做空' ? 'border-[#9f6f6f]' : ''} onClick={() => setDirection('做空')}>做空</Button><Button className={stopMode === 'price' ? 'border-[#8a7553]' : ''} onClick={() => setStopMode('price')}>按价格止损</Button><Button className={stopMode === 'percent' ? 'border-[#8a7553]' : ''} onClick={() => setStopMode('percent')}>按百分比止损</Button></div>
        <div className="grid gap-2 md:grid-cols-3"><Input value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="入场价" />{stopMode === 'price' ? <Input value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="止损价" /> : <Input value={stopPercent} onChange={(e) => setStopPercent(e.target.value)} placeholder="止损百分比%" />}<Input readOnly value={calc ? `止损价 ${fmt(calc.slPrice, 6)} / 止损比例 ${fmt(calc.slPercent * 100, 3)}%` : '等待输入'} /></div>
        <EditablePresetGroup label="固定风险标签" unit="U" values={presetConfig.riskPresets} active={riskAmount} onActive={setRiskAmount} onChange={setRiskPresets} />
        <EditablePresetGroup label="杠杆标签" unit="x" values={presetConfig.leveragePresets} active={leverage} onActive={setLeverage} onChange={setLeveragePresets} />

        {showAdvanced && <Card><h3 className="mb-2 text-lg font-semibold">高级模式（折叠）</h3><div className="grid gap-2 md:grid-cols-4"><Button variant={feeOn ? 'primary' : 'secondary'} onClick={() => setFeeOn((v) => !v)}>手续费修正</Button><Input value={feePercent} onChange={(e) => setFeePercent(e.target.value)} placeholder="手续费%" /><Button variant={slippageOn ? 'primary' : 'secondary'} onClick={() => setSlippageOn((v) => !v)}>滑点修正</Button><Input value={slippagePercent} onChange={(e) => setSlippagePercent(e.target.value)} placeholder="滑点%" /><Button variant={balanceOn ? 'primary' : 'secondary'} onClick={() => setBalanceOn((v) => !v)}>余额校验</Button><Input value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="可用余额" /><Input value={customR} onChange={(e) => setCustomR(e.target.value)} placeholder="自定义R" /><Input readOnly value={calc ? `修正后总风险 ${(calc.effectiveRisk * 100).toFixed(3)}%` : '修正结果'} /></div></Card>}

        <div className="grid gap-2 md:grid-cols-3"><Input readOnly value={`基础仓位：${calc ? fmt(calc.basePosition, 2) : '--'} U`} /><Input readOnly value={`修正后仓位：${calc ? fmt(calc.positionValue, 2) : '--'} U`} /><Input readOnly value={`建议保证金：${calc ? fmt(calc.margin, 2) : '--'} U`} className={balanceOn && calc && toNum(balance) < calc.margin ? 'stat-bad' : ''} /><Input readOnly value={`可开数量：${calc ? fmt(calc.qty, 6) : '--'}`} /><Input readOnly value={`预计亏损：${calc ? fmt(calc.stopLossAmount, 2) : '--'} U`} /><Input readOnly value={calc ? calc.targets.map((t) => `${t.r}R:${fmt(t.price, 4)}`).join(' / ') : '目标位'} /></div>
        {balanceOn && calc && Number.isFinite(toNum(balance)) && toNum(balance) < calc.margin && <p className="stat-bad text-sm">所需保证金超过可用余额，当前风险设置下无法开出该仓位。</p>}
      </Card>
    </div>
  );
}
