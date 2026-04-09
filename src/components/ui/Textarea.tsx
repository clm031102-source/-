import { TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-24 w-full rounded-xl border border-[var(--line)] bg-[#0c121c] px-3 py-2 text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--gold-soft)]', className)} {...props} />;
}
