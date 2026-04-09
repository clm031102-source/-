import { SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-xl border border-[var(--line)] bg-[#0f0f0f] px-3 text-[var(--text)] outline-none focus:border-[var(--gold-soft)]',
        className,
      )}
      {...props}
    />
  );
}
