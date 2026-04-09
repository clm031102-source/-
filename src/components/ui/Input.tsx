import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/style';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-blue-400 transition focus:ring-2',
        props.className,
      )}
    />
  );
}
