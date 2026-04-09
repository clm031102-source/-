import { PropsWithChildren } from 'react';
import { cn } from '@/utils/style';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('rounded-xl border border-border bg-panel p-4 shadow-panel', className)}>{children}</div>;
}
