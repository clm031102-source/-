import { PropsWithChildren } from 'react';
import { cn } from '@/utils/cn';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('rounded-2xl border border-slate-800 bg-[#0c1730]/90 p-4 shadow-[0_8px_40px_rgba(2,8,23,0.45)]', className)}>{children}</div>;
}
