import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/style';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-200',
};

export function Button({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      className={cn(
        'rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
