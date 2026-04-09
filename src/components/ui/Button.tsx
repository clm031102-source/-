import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'border-[#9b8360] bg-[#1f2733] text-[#e6d8bf] hover:bg-[#283244]',
  secondary: 'border-[var(--line)] bg-[var(--bg-elevated)] text-[var(--text)] hover:bg-[#1a2432]',
  danger: 'border-[#7a3c3c] bg-[#2b1a1a] text-[#f2c6c6] hover:bg-[#3a2020]',
  ghost: 'border-transparent bg-transparent text-[var(--text-soft)] hover:border-[var(--line)] hover:bg-[var(--bg-elevated)]',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant }

export function Button({ className, variant = 'secondary', ...props }: Props) {
  return <button className={cn('rounded-xl border px-3 py-2 text-sm transition', variants[variant], className)} {...props} />;
}
