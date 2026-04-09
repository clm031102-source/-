import { TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/style';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-24 w-full rounded-lg border border-border bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-blue-500',
        props.className,
      )}
    />
  );
}
