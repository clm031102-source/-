import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJournalStore } from '@/store/useJournalStore';
import { useToast } from '@/hooks/useToast';

const toNum = (v: string) => (v === '' ? NaN : Number(v));
const fmt = (n: number, d = 4) => (Number.isFinite(n) ? n.toLocaleString('zh-CN', { maximumFractionDigits: d }) : '--');

type CalcResult = {
  slPercent: number;
  slPrice: number;
  basePosition: number;
  positionValue: number;
  margin: number;
  qty: number;
  stopLossAmount: number;
  dist: number;
  targets: { r: number; price: number }[];
  effectiveRisk: number;
};

function compute(params: {
  direction: '做多' | '做空';
  entryPrice: string;
  stopMode: 'price' | 'percent';
  stopPrice: string;
  stopPercent: string;
  riskAmount: number;
  leverage: number;
  feeOn: boolean;
  feePercent: string;
  slippageOn: boolean;
  slippagePercent: string;
  customR: string;
}) {
  const entry = toNum(params.entryPrice);
  if (!Number.isFinite(entry) || entry <= 0) return { result: null, message: '请输入有效入场价。' };
  if (params.riskAmount <= 0 || params.leverage <= 0) return { result: null, message: '风险金额和杠杆必须大于 0。' };

  let slPercent = 0;
  let slPrice = 0;
  if (params.stopMode === 'price') {
    slPrice = toNum(params.stopPrice);
    if (!Number.isFinite(slPrice) || slPrice <= 0) return { result: null, message: '请输入有效止损价。' };
    if ((params.direction === '做多' && slPrice >= entry) || (params.direction === '做空' && slPrice <= entry)) {
      return { result: null, message: `做${params.direction === '做多' ? '多' : '空'}时止损价方向错误。` };
    }
    slPercent = Math.abs(entry - slPrice) / entry;
  } else {
    slPercent = toNum(params.stopPercent) / 100;
    if (!Number.isFinite(slPercent) || slPercent <= 0) return { result: null, message: '请输入有效止损百分比。' };
    slPrice = params.direction === '做多' ? entry * (1 - slPercent) : entry * (1 + slPercent);
  }

  const fee = params.feeOn ? toNum(params.feePercent) / 100 : 0;
  const slippage = params.slippageOn ? toNum(params.slippagePercent) / 100 : 0;
  const effectiveRisk = slPercent + (Number.isFinite(fee) ? fee : 0) + (Number.isFinite(slippage) ? slippage : 0);
  if (effectiveRisk <= 0) return { result: null, message: '有效风险需大于 0。' };

  const basePosition = params.riskAmount / slPercent;
  const positionValue = params.riskAmount / effectiveRisk;
  const margin = positionValue / params.leverage;
  const qty = positionValue / entry;
  const stopLossAmount = positionValue * effectiveRisk;
  const dist = Math.abs(entry - slPrice);
  const rs = [1, 1.5, 2, toNum(params.customR)].filter((n, i, arr) => Number.isFinite(n) && n > 0 && arr.indexOf(n) === i);
  const targets = rs.map((r) => ({ r, price: params.direction === '做多' ? entry + dist * r : entry - dist * r }));

  const result: CalcResult = { slPercent, slPrice, basePosition, positionValue, margin, qty, stopLossAmount, dist, targets, effectiveRisk };
  return { result, message: '' };
}

function PresetBar({ label, unit, values, active, setActive, onChange }: {
  label: string;
  unit: string;
  values: number[];
  active: number;
  setActive: (n: number) => void;
  onChange: (n: number[]) => void;
}) {
  const [custom, setCustom] = useState('');
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm muted">{label}</p>
        <Button variant="ghost" onClick={() => setEditing((v) => !v)}>{editing ? '完成编辑' : '编辑预设'}</Button>
      </div>

      {!editing ? (
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_220px]">
          {[...values, 0, 0, 0].slice(0, 3).map((v, i) => (
            <button key={`${i}-${v}`} className={`rounded-xl border px-4 py-2 text-lg ${active === v ? 'border-[#8b6e43] bg-[#2c261d] text-[#efd9b3]' : 'border-[var(--line-soft)] bg-[#131313]'}`} onClick={() => setActive(v)}>
              {v}{unit}
            </button>
          ))}
          <div className="flex gap-2">
            <Input value={custom} placeholder={`输入自定义${unit}`} onChange={(e) => setCustom(e.target.value)} />
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
                onChange(next.filter((x) => x > 0));
                if (active === v) setActive(next[i] || 1);
              }} />
              <Button variant="secondary" onClick={() => setActive(v)}>设为当前</Button>
              <Button variant="danger" onClick={() => {
                const next = values.filter((_, idx) => idx !== i);
                onChange(next.length ? next : unit === 'U' ? [1, 2, 5] : [5, 10, 20]);
                if (!next.includes(active)) setActive(next[0] ?? (unit === 'U' ? 2 : 10));
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
  const { push } = useToast();

  const [direction, setDirection] = useState<'做多' | '做空'>('做多');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopMode, setStopMode] = useState<'price' | 'percent'>('price');
  const [stopPrice, setStopPrice] = useState('');
  const [stopPercent, setStopPercent] = useState('');
  const [riskAmount, setRiskAmount] = useState(presetConfig.riskPresets[1] ?? 2);
  const [leverage, setLeverage] = useState(presetConfig.leveragePresets[1] ?? 10);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [feeOn, setFeeOn] = useState(false);
  const [slippageOn, setSlippageOn] = useState(false);
  const [feePercent, setFeePercent] = useState('0.04');
  const [slippagePercent, setSlippagePercent] = useState('0.02');
  const [balanceOn, setBalanceOn] = useState(false);
  const [balance, setBalance] = useState('');
  const [customR, setCustomR] = useState('3');

  const [calc, setCalc] = useState<CalcResult | null>(null);
  const [status, setStatus] = useState('请填写入场价、止损和风险参数。');

  const params = useMemo(() => ({ direction, entryPrice, stopMode, stopPrice, stopPercent, riskAmount, leverage, feeOn, feePercent, slippageOn, slippagePercent, customR }), [customR, direction, entryPrice, feeOn, feePercent, leverage, riskAmount, slippageOn, slippagePercent, stopMode, stopPercent, stopPrice]);

  const runCalc = useCallback((silent = true) => {
    const { result, message } = compute(params);
    setCalc(result);
    setStatus(result ? '计算完成，可继续调整参数。' : message);
    if (!silent && !result) push(message);
  }, [params, push]);

  useEffect(() => { runCalc(true); }, [runCalc]);

  return (
    <div className="space-y-3" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runCalc(false); } }}>
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

        <div className="grid gap-2 md:grid-cols-4">
          <Input value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="入场价" />
          {stopMode === 'price' ? <Input value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="止损价" /> : <Input value={stopPercent} onChange={(e) => setStopPercent(e.target.value)} placeholder="止损百分比%" />}
          <Input value={String(riskAmount)} onChange={(e) => setRiskAmount(Math.max(0, toNum(e.target.value) || 0))} placeholder="单笔风险U" />
          <Input value={String(leverage)} onChange={(e) => setLeverage(Math.max(1, toNum(e.target.value) || 1))} placeholder="杠杆" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => runCalc(false)}>计算</Button>
          <p className={`text-sm ${calc ? 'muted' : 'stat-bad'}`}>{status}</p>
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
              <Input readOnly value={calc ? `修正后总风险 ${(calc.effectiveRisk * 100).toFixed(3)}%` : '等待计算'} />
            </div>
          </Card>
        )}

        <div className="grid gap-2 md:grid-cols-3">
          <Input readOnly value={`止损距离：${calc ? fmt(calc.dist, 6) : '--'}`} />
          <Input readOnly value={`止损百分比：${calc ? fmt(calc.slPercent * 100, 3) : '--'}%`} />
          <Input readOnly value={`止损价：${calc ? fmt(calc.slPrice, 6) : '--'}`} />
          <Input readOnly value={`基础仓位：${calc ? fmt(calc.basePosition, 2) : '--'} U`} />
          <Input readOnly value={`修正后仓位：${calc ? fmt(calc.positionValue, 2) : '--'} U`} />
          <Input readOnly value={`建议保证金：${calc ? fmt(calc.margin, 2) : '--'} U`} className={balanceOn && calc && toNum(balance) < calc.margin ? 'stat-bad' : ''} />
          <Input readOnly value={`可开数量：${calc ? fmt(calc.qty, 6) : '--'}`} />
          <Input readOnly value={`预计亏损：${calc ? fmt(calc.stopLossAmount, 2) : '--'} U`} />
          <Input readOnly value={calc ? calc.targets.map((t) => `${t.r}R:${fmt(t.price, 4)}`).join(' / ') : '目标位（1R / 1.5R / 2R / 自定义R）'} />
        </div>

        {balanceOn && calc && Number.isFinite(toNum(balance)) && toNum(balance) < calc.margin && <p className="stat-bad text-sm">所需保证金超过可用余额，当前设置下无法开仓。</p>}
      </Card>
    </div>
  );
}
