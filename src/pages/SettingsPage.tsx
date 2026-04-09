import { useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useJournalStore } from '@/store/useJournalStore';
import { buildExportPayload, getSeedSnapshot, parseImportPayload, persistenceConfig, readFileAsText } from '@/lib/journalData';
import { useToast } from '@/hooks/useToast';

export function SettingsPage() {
  const { trades, summaries, strategies, replaceAllData, resetToSeedData, clearAllData } = useJournalStore();
  const { push } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onExport = () => {
    const payload = buildExportPayload({ trades, summaries, strategies });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    push('已导出 JSON 备份。');
  };

  const onImport = async (file?: File) => {
    if (!file) return;
    try {
      const content = await readFileAsText(file);
      const snapshot = parseImportPayload(content);
      replaceAllData(snapshot);
      push('导入完成，已覆盖当前本地数据。');
    } catch (error) {
      push(error instanceof Error ? error.message : '导入失败');
    }
  };

  return (
    <div className="space-y-3">
      <Card>
        <h2 className="text-2xl font-semibold gold-text">数据管理 / 设置</h2>
        <p className="muted">用于备份、导入、清空和恢复示例数据，并预留后续服务端迁移结构。</p>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-semibold">备份与迁移</h3>
        <p className="text-sm muted">当前存储位置：{persistenceConfig.mode}（key: {persistenceConfig.key}）。{persistenceConfig.note}</p>
        <p className="text-sm muted">服务器迁移建议结构：trades / summaries / strategies / attachments / tags / setups / mistakes。</p>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={onExport}>导出 JSON</Button>
          <Button onClick={() => fileRef.current?.click()}>导入 JSON</Button>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept="application/json"
            onChange={(e) => {
              void onImport(e.target.files?.[0]);
              e.currentTarget.value = '';
            }}
          />
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-semibold">本地数据操作</h3>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--line-soft)] bg-[#101010] p-3 text-sm">交易：{trades.length} 笔</div>
          <div className="rounded-xl border border-[var(--line-soft)] bg-[#101010] p-3 text-sm">总结：{summaries.length} 条</div>
          <div className="rounded-xl border border-[var(--line-soft)] bg-[#101010] p-3 text-sm">策略：{strategies.length} 条</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { resetToSeedData(); push('已恢复示例数据。'); }}>恢复示例数据</Button>
          <Button variant="danger" onClick={() => { if (window.confirm('确认清空所有本地数据？')) { clearAllData(); push('已清空本地数据。'); } }}>清空本地数据</Button>
          <Button variant="ghost" onClick={() => { replaceAllData(getSeedSnapshot()); push('已重置为示例快照。'); }}>重置快照</Button>
        </div>
      </Card>
    </div>
  );
}
