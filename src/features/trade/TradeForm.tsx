import dayjs from 'dayjs';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { createAttachment, readFileAsDataUrl } from '@/lib/journalData';
import { useJournalStore } from '@/store/useJournalStore';
import { EnergyState, Trade } from '@/types/trade';

interface Props {
  initial?: Trade;
  mode?: 'simple' | 'detailed';
  onSubmitSuccess?: () => void;
}

const draftKey = 'trade-form-draft-v1';

const numOr = (v: string, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function Field({ label, hint, children, required }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="space-y-1">
      <p className="text-sm text-[var(--text)]">{label}{required ? '*' : ''}</p>
      {hint && <p className="text-xs muted">{hint}</p>}
      {children}
    </label>
  );
}

export function TradeForm({ initial, mode = 'detailed', onSubmitSuccess }: Props) {
  const { strategies, addTrade, updateTrade } = useJournalStore();
  const { push } = useToast();

  const [form, setForm] = useState({
    title: '', tradeDate: dayjs().format('YYYY-MM-DDTHH:mm'), symbol: '', direction: '做多' as Trade['direction'], strategyId: strategies[0]?.id ?? '',
    entryPrice: '', exitPrice: '', quantity: '', leverage: '20', fee: '', stopLoss: '', takeProfit: '', actualPnl: '',
    rMultiple: '', riskRewardRatio: '', mfe: '', mae: '', holdingMinutes: '15', plannedPosition: true,
    entryReason: '', exitReason: '', followsSystem: true, signalQuality: '7', executionQuality: '7', plannedTrade: true,
    impulseTrade: false, chasingPrice: false, holdingLoser: false, earlyTakeProfit: false, movedStopLoss: false,
    emotion: '冷静' as Trade['emotion'], energy: '一般' as EnergyState, calm: true, overtrading: false, revengeTrading: false, forcedAfterLoss: false,
    whatWentWell: '', biggestMistake: '', review: '', nextTimePlan: '', tags: '', experienceTags: '', errorTags: '',
    opportunityGrade: 'A' as Trade['opportunityGrade'], systemType: '系统单' as Trade['systemType'], planType: '计划内' as Trade['planType'], screenshotNotes: '',
    setup: '',
    mistakes: '',
    attachments: [] as Trade['attachments'],
  });

  useEffect(() => {
    if (!initial) return;
    setForm({
      title: initial.title,
      tradeDate: dayjs(initial.tradeDate).format('YYYY-MM-DDTHH:mm'),
      symbol: initial.symbol,
      direction: initial.direction,
      strategyId: initial.strategyId,
      entryPrice: String(initial.entryPrice ?? ''),
      exitPrice: String(initial.exitPrice ?? ''),
      quantity: String(initial.quantity ?? ''),
      leverage: String(initial.leverage ?? 20),
      fee: String(initial.fee ?? ''),
      stopLoss: String(initial.stopLoss ?? ''),
      takeProfit: String(initial.takeProfit ?? ''),
      actualPnl: initial.pnl ? String(initial.pnl) : '',
      rMultiple: String(initial.rMultiple ?? ''),
      riskRewardRatio: String(initial.riskRewardRatio ?? ''),
      mfe: String(initial.mfe ?? ''),
      mae: String(initial.mae ?? ''),
      holdingMinutes: String(initial.holdingMinutes ?? 0),
      plannedPosition: initial.plannedPosition ?? true,
      entryReason: initial.entryReason ?? '',
      exitReason: initial.exitReason ?? '',
      followsSystem: initial.followsSystem ?? true,
      signalQuality: String(initial.signalQuality ?? 7),
      executionQuality: String(initial.executionQuality ?? 7),
      plannedTrade: initial.plannedTrade ?? true,
      impulseTrade: initial.impulseTrade ?? false,
      chasingPrice: initial.chasingPrice ?? false,
      holdingLoser: initial.holdingLoser ?? false,
      earlyTakeProfit: initial.earlyTakeProfit ?? false,
      movedStopLoss: initial.movedStopLoss ?? false,
      emotion: initial.emotion,
      energy: initial.energy ?? '一般',
      calm: initial.calm ?? true,
      overtrading: initial.overtrading ?? false,
      revengeTrading: initial.revengeTrading ?? false,
      forcedAfterLoss: initial.forcedAfterLoss ?? false,
      whatWentWell: initial.whatWentWell ?? '',
      biggestMistake: initial.biggestMistake ?? '',
      review: initial.review ?? '',
      nextTimePlan: initial.nextTimePlan ?? '',
      tags: (initial.tags ?? []).join(', '),
      experienceTags: (initial.experienceTags ?? []).join(', '),
      errorTags: (initial.errorTags ?? []).join(', '),
      opportunityGrade: initial.opportunityGrade ?? 'A',
      systemType: initial.systemType ?? '系统单',
      planType: initial.planType ?? '计划内',
      screenshotNotes: initial.screenshotNotes ?? '',
      setup: initial.setup ?? '',
      mistakes: (initial.mistakes ?? []).join(', '),
      attachments: initial.attachments ?? [],
    });
  }, [initial]);

  useEffect(() => {
    if (initial) return;
    const cache = localStorage.getItem(draftKey);
    if (cache) {
      try {
        setForm((prev) => ({ ...prev, ...JSON.parse(cache) }));
      } catch {
        // ignore broken draft payload
      }
    }
  }, [initial]);

  useEffect(() => {
    if (initial) return;
    localStorage.setItem(draftKey, JSON.stringify(form));
  }, [form, initial]);

  const pnl = useMemo(() => {
    const entry = numOr(form.entryPrice, NaN);
    const exit = numOr(form.exitPrice, NaN);
    const qty = numOr(form.quantity, NaN);
    if (!Number.isFinite(entry) || !Number.isFinite(exit) || !Number.isFinite(qty) || qty <= 0) return null;
    const gross = form.direction === '做多' ? (exit - entry) * qty : (entry - exit) * qty;
    return Number((gross - numOr(form.fee, 0)).toFixed(2));
  }, [form.direction, form.entryPrice, form.exitPrice, form.fee, form.quantity]);

  const pnlPercent = useMemo(() => {
    const entry = numOr(form.entryPrice, NaN);
    const exit = numOr(form.exitPrice, NaN);
    if (!Number.isFinite(entry) || !Number.isFinite(exit) || entry <= 0) return null;
    const v = (((exit - entry) / entry) * 100) * (form.direction === '做多' ? 1 : -1);
    return Number(v.toFixed(2));
  }, [form.direction, form.entryPrice, form.exitPrice]);

  const submit = () => {
    if (!form.title.trim() || !form.symbol.trim()) {
      push('请先补全交易标题和品种。');
      return;
    }
    if (!form.strategyId) {
      push('请选择策略。');
      return;
    }

    const payload: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'> = {
      title: form.title.trim(),
      tradeDate: dayjs(form.tradeDate).toISOString(),
      symbol: form.symbol.trim().toUpperCase(),
      direction: form.direction,
      strategyId: form.strategyId,
      setup: form.setup.trim(),
      mistakes: form.mistakes.split(',').map((x) => x.trim()).filter(Boolean),
      entryPrice: numOr(form.entryPrice, 0),
      exitPrice: numOr(form.exitPrice, 0),
      quantity: numOr(form.quantity, 0),
      leverage: numOr(form.leverage, 1),
      fee: numOr(form.fee, 0),
      stopLoss: numOr(form.stopLoss, 0),
      takeProfit: numOr(form.takeProfit, 0),
      estimatedPnl: pnl ?? 0,
      pnl: form.actualPnl === '' ? pnl ?? 0 : numOr(form.actualPnl, 0),
      pnlPercent: pnlPercent ?? 0,
      rMultiple: numOr(form.rMultiple, 0),
      riskRewardRatio: numOr(form.riskRewardRatio, 0),
      mfe: numOr(form.mfe, 0),
      mae: numOr(form.mae, 0),
      holdingMinutes: numOr(form.holdingMinutes, 0),
      plannedPosition: form.plannedPosition,
      followsSystem: form.followsSystem,
      signalQuality: numOr(form.signalQuality, 0),
      executionQuality: numOr(form.executionQuality, 0),
      plannedTrade: form.plannedTrade,
      impulseTrade: form.impulseTrade,
      chasingPrice: form.chasingPrice,
      holdingLoser: form.holdingLoser,
      earlyTakeProfit: form.earlyTakeProfit,
      movedStopLoss: form.movedStopLoss,
      entryReason: form.entryReason.trim(),
      exitReason: form.exitReason.trim(),
      review: form.review.trim(),
      whatWentWell: form.whatWentWell.trim(),
      biggestMistake: form.biggestMistake.trim(),
      nextTimePlan: form.nextTimePlan.trim(),
      emotion: form.emotion,
      energy: form.energy,
      calm: form.calm,
      overtrading: form.overtrading,
      revengeTrading: form.revengeTrading,
      forcedAfterLoss: form.forcedAfterLoss,
      tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean),
      experienceTags: form.experienceTags.split(',').map((x) => x.trim()).filter(Boolean),
      errorTags: form.errorTags.split(',').map((x) => x.trim()).filter(Boolean),
      opportunityGrade: form.opportunityGrade,
      systemType: form.systemType,
      planType: form.planType,
      screenshotNotes: form.screenshotNotes.trim(),
      attachments: form.attachments ?? [],
    };

    if (initial) {
      updateTrade(initial.id, payload);
      push('交易已更新。');
    } else {
      addTrade(payload);
      localStorage.removeItem(draftKey);
      push('交易已保存。');
    }
    onSubmitSuccess?.();
  };

  const setCheck = (key: keyof typeof form, val: boolean) => setForm((prev) => ({ ...prev, [key]: val }));

  const onPickAttachments = async (files: FileList | null) => {
    if (!files?.length) return;
    const picked = Array.from(files).slice(0, 6);
    const next = await Promise.all(
      picked.map(async (file) => {
        const dataUrl = await readFileAsDataUrl(file);
        return createAttachment(file, dataUrl);
      }),
    );
    setForm((prev) => ({ ...prev, attachments: [...(prev.attachments ?? []), ...next] }));
    push(`已添加 ${next.length} 张截图。`);
  };

  const removeAttachment = (attachmentId: string) => {
    setForm((prev) => ({ ...prev, attachments: (prev.attachments ?? []).filter((item) => item?.id !== attachmentId) }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold gold-text">核心成交信息</h3>
            <p className="muted text-sm">最少填写标题、时间、品种、方向、策略和价格。</p>
          </div>
          <div className="flex gap-2">
            <Button className={form.direction === '做多' ? 'border-[#6f9f7f]' : ''} onClick={() => setForm({ ...form, direction: '做多' })}>做多</Button>
            <Button className={form.direction === '做空' ? 'border-[#9f6f6f]' : ''} onClick={() => setForm({ ...form, direction: '做空' })}>做空</Button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="交易标题" hint="示例：BTC 15m 回踩确认" required><Input placeholder="填写本次交易标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="日期时间" hint="用于时间段统计"><Input type="datetime-local" value={form.tradeDate} onChange={(e) => setForm({ ...form, tradeDate: e.target.value })} /></Field>
          <Field label="交易品种" hint="如 BTC / ETH" required><Input placeholder="填写品种代码" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} /></Field>
          <Field label="策略" hint="用于策略表现归因"><Select value={form.strategyId} onChange={(e) => setForm({ ...form, strategyId: e.target.value })}>{strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
          <Field label="入场价"><Input type="number" placeholder="例如 84250" value={form.entryPrice} onChange={(e) => setForm({ ...form, entryPrice: e.target.value })} /></Field>
          <Field label="出场价"><Input type="number" placeholder="例如 84590" value={form.exitPrice} onChange={(e) => setForm({ ...form, exitPrice: e.target.value })} /></Field>
          <Field label="数量"><Input type="number" placeholder="例如 0.7" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
          <Field label="杠杆"><Input type="number" placeholder="例如 20" value={form.leverage} onChange={(e) => setForm({ ...form, leverage: e.target.value })} /></Field>
          <Field label="手续费"><Input type="number" placeholder="例如 4" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></Field>
          <Field label="止损价"><Input type="number" placeholder="例如 84080" value={form.stopLoss} onChange={(e) => setForm({ ...form, stopLoss: e.target.value })} /></Field>
          <Field label="止盈价"><Input type="number" placeholder="例如 84900" value={form.takeProfit} onChange={(e) => setForm({ ...form, takeProfit: e.target.value })} /></Field>
          <Field label="实际盈亏（可选）" hint="留空则使用预估盈亏"><Input type="number" placeholder="例如 232" value={form.actualPnl} onChange={(e) => setForm({ ...form, actualPnl: e.target.value })} /></Field>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">实时盈亏摘要</h3>
        <div className="grid gap-2 md:grid-cols-4">
          <Input readOnly value={`预估盈亏：${pnl === null ? '待输入' : pnl.toFixed(2)}`} className={pnl !== null ? (pnl >= 0 ? 'stat-good' : 'stat-bad') : ''} />
          <Input readOnly value={`盈亏比例：${pnlPercent === null ? '待输入' : `${pnlPercent.toFixed(2)}%`}`} className={pnlPercent !== null ? (pnlPercent >= 0 ? 'stat-good' : 'stat-bad') : ''} />
          <Input readOnly value={`R倍数：${form.rMultiple || '待输入'}`} />
          <Input readOnly value={`风险回报比：${form.riskRewardRatio || '待输入'}`} />
        </div>
      </Card>

      {mode === 'detailed' && (
        <>
          <Card className="space-y-3">
            <h3 className="text-xl font-semibold gold-text">盈亏与风险</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="R倍数"><Input type="number" placeholder="如 1.8" value={form.rMultiple} onChange={(e) => setForm({ ...form, rMultiple: e.target.value })} /></Field>
              <Field label="风险回报比"><Input type="number" placeholder="如 2.1" value={form.riskRewardRatio} onChange={(e) => setForm({ ...form, riskRewardRatio: e.target.value })} /></Field>
              <Field label="持仓时长（分钟)"><Input type="number" placeholder="如 35" value={form.holdingMinutes} onChange={(e) => setForm({ ...form, holdingMinutes: e.target.value })} /></Field>
              <Field label="最大浮盈 MFE"><Input type="number" placeholder="如 3.5" value={form.mfe} onChange={(e) => setForm({ ...form, mfe: e.target.value })} /></Field>
              <Field label="最大浮亏 MAE"><Input type="number" placeholder="如 -1.2" value={form.mae} onChange={(e) => setForm({ ...form, mae: e.target.value })} /></Field>
              <Field label="计划内仓位"><Select value={String(form.plannedPosition)} onChange={(e) => setForm({ ...form, plannedPosition: e.target.value === 'true' })}><option value="true">是</option><option value="false">否</option></Select></Field>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xl font-semibold gold-text">策略与执行</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="是否符合系统"><Select value={String(form.followsSystem)} onChange={(e) => setForm({ ...form, followsSystem: e.target.value === 'true' })}><option value="true">符合系统</option><option value="false">不符合系统</option></Select></Field>
              <Field label="是否计划内交易"><Select value={String(form.plannedTrade)} onChange={(e) => setForm({ ...form, plannedTrade: e.target.value === 'true' })}><option value="true">计划内</option><option value="false">计划外</option></Select></Field>
              <Field label="信号质量评分"><Input type="number" min={1} max={10} placeholder="1-10" value={form.signalQuality} onChange={(e) => setForm({ ...form, signalQuality: e.target.value })} /></Field>
              <Field label="执行质量评分"><Input type="number" min={1} max={10} placeholder="1-10" value={form.executionQuality} onChange={(e) => setForm({ ...form, executionQuality: e.target.value })} /></Field>
              <Field label="Setup" hint="本笔交易使用的模式/形态"><Input placeholder="如：1H 突破回踩" value={form.setup} onChange={(e) => setForm({ ...form, setup: e.target.value })} /></Field>
              <Field label="Mistakes" hint="用逗号分隔多个错误归因"><Input placeholder="如：追单, 入场过早" value={form.mistakes} onChange={(e) => setForm({ ...form, mistakes: e.target.value })} /></Field>
              <Field label="入场理由"><Textarea placeholder="写清触发条件与确认点" value={form.entryReason} onChange={(e) => setForm({ ...form, entryReason: e.target.value })} /></Field>
              <Field label="出场理由"><Textarea placeholder="止盈 / 止损 / 主动离场原因" value={form.exitReason} onChange={(e) => setForm({ ...form, exitReason: e.target.value })} /></Field>
            </div>
            <div className="grid gap-2 md:grid-cols-5">
              <Button variant={form.impulseTrade ? 'primary' : 'secondary'} onClick={() => setCheck('impulseTrade', !form.impulseTrade)}>临时起意</Button>
              <Button variant={form.chasingPrice ? 'primary' : 'secondary'} onClick={() => setCheck('chasingPrice', !form.chasingPrice)}>追单</Button>
              <Button variant={form.holdingLoser ? 'primary' : 'secondary'} onClick={() => setCheck('holdingLoser', !form.holdingLoser)}>扛单</Button>
              <Button variant={form.earlyTakeProfit ? 'primary' : 'secondary'} onClick={() => setCheck('earlyTakeProfit', !form.earlyTakeProfit)}>提前止盈</Button>
              <Button variant={form.movedStopLoss ? 'primary' : 'secondary'} onClick={() => setCheck('movedStopLoss', !form.movedStopLoss)}>移动止损</Button>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xl font-semibold gold-text">情绪与纪律</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="情绪状态"><Select value={form.emotion} onChange={(e) => setForm({ ...form, emotion: e.target.value as Trade['emotion'] })}><option>冷静</option><option>专注</option><option>犹豫</option><option>焦虑</option><option>上头</option><option>报复性交易</option></Select></Field>
              <Field label="精力状态"><Select value={form.energy} onChange={(e) => setForm({ ...form, energy: e.target.value as EnergyState })}><option>充沛</option><option>一般</option><option>疲惫</option></Select></Field>
              <Field label="冷静程度"><Select value={String(form.calm)} onChange={(e) => setForm({ ...form, calm: e.target.value === 'true' })}><option value="true">冷静</option><option value="false">不冷静</option></Select></Field>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <Button variant={form.overtrading ? 'danger' : 'secondary'} onClick={() => setCheck('overtrading', !form.overtrading)}>是否上头</Button>
              <Button variant={form.revengeTrading ? 'danger' : 'secondary'} onClick={() => setCheck('revengeTrading', !form.revengeTrading)}>报复性交易</Button>
              <Button variant={form.forcedAfterLoss ? 'danger' : 'secondary'} onClick={() => setCheck('forcedAfterLoss', !form.forcedAfterLoss)}>连亏后强行开单</Button>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xl font-semibold gold-text">复盘沉淀 + 标签质量</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="本笔做得好的地方"><Textarea placeholder="执行、风控、心态方面做得好的点" value={form.whatWentWell} onChange={(e) => setForm({ ...form, whatWentWell: e.target.value })} /></Field>
              <Field label="最大错误"><Textarea placeholder="本笔最需要修正的错误" value={form.biggestMistake} onChange={(e) => setForm({ ...form, biggestMistake: e.target.value })} /></Field>
              <Field label="复盘总结"><Textarea placeholder="复盘结论，尽量可执行" value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} /></Field>
              <Field label="下次同类机会处理"><Textarea placeholder="给下一次的明确规则" value={form.nextTimePlan} onChange={(e) => setForm({ ...form, nextTimePlan: e.target.value })} /></Field>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="普通标签"><Input placeholder="如：趋势、回踩、突破" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
              <Field label="经验标签"><Input placeholder="如：等待确认、仓位控制" value={form.experienceTags} onChange={(e) => setForm({ ...form, experienceTags: e.target.value })} /></Field>
              <Field label="错误标签"><Input placeholder="如：追高、无计划加仓" value={form.errorTags} onChange={(e) => setForm({ ...form, errorTags: e.target.value })} /></Field>
              <Field label="机会等级"><Select value={form.opportunityGrade} onChange={(e) => setForm({ ...form, opportunityGrade: e.target.value as Trade['opportunityGrade'] })}><option>A+</option><option>A</option><option>B</option><option>C</option></Select></Field>
              <Field label="系统单分类"><Select value={form.systemType} onChange={(e) => setForm({ ...form, systemType: e.target.value as Trade['systemType'] })}><option>系统单</option><option>非系统单</option></Select></Field>
              <Field label="计划分类"><Select value={form.planType} onChange={(e) => setForm({ ...form, planType: e.target.value as Trade['planType'] })}><option>计划内</option><option>计划外</option></Select></Field>
            </div>
            <Field label="截图/附件占位" hint="可记录截图路径或备注">
              <Input placeholder="如：/screenshots/2026-04-09-btc-setup.png" value={form.screenshotNotes} onChange={(e) => setForm({ ...form, screenshotNotes: e.target.value })} />
            </Field>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xl font-semibold gold-text">截图与附件</h3>
            <p className="text-sm muted">支持上传本地截图用于复盘（当前本地版以 dataURL 存储，后续可迁移到服务端附件系统）。</p>
            <input type="file" accept="image/*" multiple onChange={(e) => { void onPickAttachments(e.target.files); e.currentTarget.value = ''; }} />
            {(form.attachments?.length ?? 0) > 0 ? (
              <div className="grid gap-2 md:grid-cols-3">
                {(form.attachments ?? []).map((item) => item ? (
                  <div key={item.id} className="rounded-xl border border-[var(--line-soft)] bg-[#101010] p-2">
                    <img src={item.dataUrl} alt={item.name} className="h-36 w-full rounded object-cover" />
                    <p className="mt-1 truncate text-xs muted">{item.name}</p>
                    <Button className="mt-2 w-full" variant="danger" onClick={() => removeAttachment(item.id)}>删除截图</Button>
                  </div>
                ) : null)}
              </div>
            ) : <p className="muted text-sm">尚未上传截图。</p>}
          </Card>

        </>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={submit}>保存记录</Button>
        {!initial && <Button variant="secondary" onClick={() => { localStorage.setItem(draftKey, JSON.stringify(form)); push('草稿已手动保存。'); }}>保存草稿</Button>}
        {!initial && <Button variant="secondary" onClick={() => { const cache = localStorage.getItem(draftKey); if (!cache) return push('暂无草稿。'); setForm((prev) => ({ ...prev, ...JSON.parse(cache) })); push('草稿已恢复。'); }}>恢复草稿</Button>}
        {!initial && <Button variant="ghost" onClick={() => { localStorage.removeItem(draftKey); setForm((prev) => ({ ...prev, title: '', symbol: '', entryPrice: '', exitPrice: '', quantity: '', fee: '', stopLoss: '', takeProfit: '' })); push('已清空核心字段与草稿。'); }}>清空草稿/核心字段</Button>}
      </div>
    </div>
  );
}
