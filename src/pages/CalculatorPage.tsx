import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJournalStore } from '@/store/useJournalStore';

const toNum = (v: string) => (v === '' ? NaN : Number(v));
const fmt = (n: number, d = 4) => (Number.isFinite(n) ? n.toLocaleString('zh-CN', { maximumFractionDigits: d }) : '--');

function EditablePresetGroup({
  label,
  unit,
  values,
  active,
  onActive,
  onChange,
}: {
  label: string;
  unit: string;
  values: number[];
  active: number;
  onActive: (v: number) => void;
  onChange: (v: number[]) => void;
}) {
  const [extraInput, setExtraInput] = useState('');

  const setValueAt = (index: number, raw: string) => {
    const next = [...values];
    next[index] = raw === '' ? 0 : Number(raw);
    onChange(next);
    if (active === values[index]) onActive(next[index]);
  };

  const removeAt = (index: number) => {
    const next = values.filter((_, i) => i !== index);
    onChange(next.length ? next : [1, 2, 3]);
    if (!next.includes(active)) onActive(next[0] ?? 1);
  };

  return (
    <div>
      <p className="mb-2 text-sm text-slate-300">{label}</p>
      <div className="grid gap-2 sm:grid-cols-4">
        {values.map((value, idx) => (
          <div key={`${idx}-${value}`} className="rounded-xl border border-slate-700 bg-slate-900/60 p-2">
            <button className={`mb-2 w-full rounded-lg px-2 py-1 text-lg ${active === value ? 'bg-blue-600' : 'bg-slate-800'}`} onClick={() => onActive(value)}>
              {value}{unit}
            </button>
            <Input value={String(value)} onChange={(e) => setValueAt(idx, e.target.value)} />
            {idx >= 3 && <button className="mt-1 text-xs text-rose-300" onClick={() => removeAt(idx)}>删除标签</button>}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input value={extraInput} placeholder={`新增第${values.length + 1}个标签数字`} onChange={(e) => setExtraInput(e.target.value)} />
        <Button
          onClick={() => {
            const n = toNum(extraInput);
            if (!Number.isFinite(n) || n <= 0) return;
            const next = [...values, n];
            onChange(next);
            onActive(n);
            setExtraInput('');
          }}
        >
          添加标签
        </Button>
      </div>
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

  const calc = useMemo(() => {
    const entry = toNum(entryPrice);
    if (!Number.isFinite(entry) || entry <= 0) return null;
    let slPercent = 0;
    let slPrice = 0;
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
    const positionValue = riskAmount / slPercent;
    const margin = positionValue / leverage;
    const qty = positionValue / entry;
    const stopLossAmount = positionValue * slPercent;
    const dist = Math.abs(entry - slPrice);
    const targets = [1, 1.5, 2, 2.5].map((r) => ({ r, price: direction === '做多' ? entry + dist * r : entry - dist * r }));
    return { slPercent, slPrice, positionValue, margin, qty, stopLossAmount, dist, targets };
  }, [direction, entryPrice, leverage, riskAmount, stopMode, stopPercent, stopPrice]);

  return (
    <div className="space-y-3">
      <Card>
        <h2 className="text-2xl font-semibold">极速固定风险开仓器</h2>
        <p className="text-slate-400">固定单笔风险，秒速反推仓位与保证金（已集成到复盘系统）</p>
      </Card>
      <Card className="space-y-4">
        <div className="grid gap-2 md:grid-cols-4">
          <Button className={direction === '做多' ? 'bg-emerald-700' : ''} onClick={() => setDirection('做多')}>做多</Button>
          <Button className={direction === '做空' ? 'bg-rose-700' : ''} onClick={() => setDirection('做空')}>做空</Button>
          <Button className={stopMode === 'price' ? 'bg-blue-700' : ''} onClick={() => setStopMode('price')}>按价格止损</Button>
          <Button className={stopMode === 'percent' ? 'bg-blue-700' : ''} onClick={() => setStopMode('percent')}>按百分比止损</Button>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <Input value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="入场价" />
          {stopMode === 'price' ? <Input value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="止损价" /> : <Input value={stopPercent} onChange={(e) => setStopPercent(e.target.value)} placeholder="止损百分比%" />}
          <Input readOnly value={calc ? `止损价 ${fmt(calc.slPrice, 6)} / 止损比例 ${fmt(calc.slPercent * 100, 3)}%` : '等待输入'} />
        </div>

        <EditablePresetGroup label="单笔固定亏损额（U）" unit="U" values={presetConfig.riskPresets} active={riskAmount} onActive={setRiskAmount} onChange={setRiskPresets} />
        <EditablePresetGroup label="杠杆标签（x）" unit="x" values={presetConfig.leveragePresets} active={leverage} onActive={setLeverage} onChange={setLeveragePresets} />

        <div className="grid gap-2 md:grid-cols-3">
          <Input readOnly value={`建议仓位价值：${calc ? fmt(calc.positionValue, 2) : '--'} U`} />
          <Input readOnly value={`建议保证金：${calc ? fmt(calc.margin, 2) : '--'} U`} />
          <Input readOnly value={`可开数量：${calc ? fmt(calc.qty, 6) : '--'}`} />
          <Input readOnly value={`止损距离：${calc ? fmt(calc.dist, 6) : '--'}`} />
          <Input readOnly value={`预计亏损：${calc ? fmt(calc.stopLossAmount, 2) : '--'} U`} />
          <Input readOnly value={calc ? `1R:${fmt(calc.targets[0].price, 6)}  1.5R:${fmt(calc.targets[1].price, 6)}  2R:${fmt(calc.targets[2].price, 6)}` : '目标位等待输入'} />
        </div>
      </Card>
    </div>
  );
}
