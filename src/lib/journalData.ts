import { createJSONStorage } from 'zustand/middleware';
import dayjs from 'dayjs';
import { seedStrategies, seedSummaries, seedTrades } from '@/data/seed';
import { JournalExportPayload, Strategy, Trade, TradeAttachment, WeeklySummary } from '@/types/trade';

export interface JournalSnapshot {
  trades: Trade[];
  summaries: WeeklySummary[];
  strategies: Strategy[];
}

const STORAGE_KEY = 'trade-journal-v5';

export const journalStorage = createJSONStorage(() => localStorage);

export const persistenceConfig = {
  key: STORAGE_KEY,
  mode: 'localStorage' as const,
  note: '当前为浏览器 localStorage 持久化，可无缝迁移到 API Adapter。',
};

const collectAttachments = (trades: Trade[]) => trades.flatMap((trade) => trade.attachments ?? []);
const collectUnique = (values: string[]) => [...new Set(values.map((v) => v.trim()).filter(Boolean))];

export function buildExportPayload(snapshot: JournalSnapshot): JournalExportPayload {
  return {
    version: 1,
    exportedAt: dayjs().toISOString(),
    trades: snapshot.trades,
    summaries: snapshot.summaries,
    strategies: snapshot.strategies,
    attachments: collectAttachments(snapshot.trades),
    tags: collectUnique(snapshot.trades.flatMap((trade) => trade.tags ?? [])),
    setups: collectUnique(snapshot.trades.map((trade) => trade.setup ?? '')),
    mistakes: collectUnique(snapshot.trades.flatMap((trade) => trade.mistakes ?? [])),
  };
}

export function parseImportPayload(raw: string): JournalSnapshot {
  const parsed = JSON.parse(raw) as Partial<JournalExportPayload>;
  if (!Array.isArray(parsed.trades) || !Array.isArray(parsed.summaries) || !Array.isArray(parsed.strategies)) {
    throw new Error('导入文件结构不正确。');
  }
  return {
    trades: parsed.trades as Trade[],
    summaries: parsed.summaries as WeeklySummary[],
    strategies: parsed.strategies as Strategy[],
  };
}

export function getSeedSnapshot(): JournalSnapshot {
  return {
    trades: seedTrades,
    summaries: seedSummaries,
    strategies: seedStrategies,
  };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

export function createAttachment(file: File, dataUrl: string): TradeAttachment {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    type: 'image',
    dataUrl,
    createdAt: dayjs().toISOString(),
  };
}
