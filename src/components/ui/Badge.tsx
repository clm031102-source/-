import { PropsWithChildren } from 'react';

export function Badge({ children }: PropsWithChildren) {
  return <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{children}</span>;
}
