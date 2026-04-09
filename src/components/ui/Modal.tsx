import { PropsWithChildren } from 'react';
import { Button } from './Button';

interface Props { open: boolean; title: string; onClose: () => void }

export function Modal({ open, title, onClose, children }: PropsWithChildren<Props>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]">
      <div className="surface max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--line-soft)] pb-2">
          <h3 className="text-lg font-semibold gold-text">{title}</h3>
          <Button onClick={onClose} variant="secondary">关闭</Button>
        </div>
        {children}
      </div>
    </div>
  );
}
