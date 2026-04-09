import { SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('w-full rounded-xl border border-[var(--line)] bg-[#0c121c] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--gold-soft)]', className)} {...props} />;
}
