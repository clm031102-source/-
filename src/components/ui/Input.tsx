import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-[var(--line)] bg-[#0f0f0f] px-3 text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--gold-soft)]',
        className,
      )}
      {...props}
    />
  );
}
