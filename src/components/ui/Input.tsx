import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-xl border border-[var(--line)] bg-[#0c121c] px-3 py-2 text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--gold-soft)]', className)} {...props} />;
}
