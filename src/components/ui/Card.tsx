import { PropsWithChildren } from 'react';
import { cn } from '@/utils/style';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl', className)}>{children}</div>;
}
