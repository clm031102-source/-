import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400', className)} {...props} />;
}
