import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/style';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-border bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-blue-500',
        props.className,
      )}
    />
  );
}
