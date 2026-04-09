import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'accent';

const variants: Record<Variant, string> = {
  primary: 'border-[#8d6e43] bg-[#2b261d] text-[#f2dfbe] hover:bg-[#393024]',
  secondary: 'border-[var(--line)] bg-[#171717] text-[var(--text)] hover:bg-[#212121]',
  danger: 'border-[#7f3f3f] bg-[#2b1717] text-[#f6cbcb] hover:bg-[#351d1d]',
  ghost: 'border-transparent bg-transparent text-[var(--text-soft)] hover:border-[var(--line)] hover:bg-[#171717] hover:text-[var(--text)]',
  outline: 'border-[var(--line)] bg-transparent text-[var(--text)] hover:bg-[#171717]',
  accent: 'border-[#8b6e43] bg-[#2b261d] text-[#f2dfbe] hover:bg-[#3a3123]',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = 'secondary', ...props }: Props) {
  return <button className={cn('rounded-xl border px-3 py-2 text-sm transition disabled:opacity-50', variants[variant], className)} {...props} />;
}
