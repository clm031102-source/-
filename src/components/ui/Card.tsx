import { PropsWithChildren } from 'react';
import { cn } from '@/utils/cn';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('surface rounded-2xl p-4', className)}>{children}</div>;
}
