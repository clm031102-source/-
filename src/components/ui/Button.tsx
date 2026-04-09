import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/style';

type Variant = 'default' | 'outline' | 'accent' | 'danger' | 'ghost';

const variants: Record<Variant, string> = {
  default: 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500',
  outline: 'bg-transparent hover:bg-slate-800 text-slate-100 border border-slate-600',
  accent: 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500',
  danger: 'bg-red-600/90 hover:bg-red-500 text-white border border-red-500',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 border border-transparent',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  active?: boolean;
}

export function Button({ variant = 'default', active, className, ...props }: Props) {
  return (
    <button
      className={cn(
        'rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        active && 'ring-2 ring-blue-400',
        className,
      )}
      {...props}
    />
  );
}
