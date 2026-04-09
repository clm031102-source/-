import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'rounded-xl border border-slate-600/80 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700/80 disabled:opacity-40',
        className,
      )}
      {...props}
    />
  );
}
