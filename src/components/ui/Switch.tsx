import { cn } from '@/utils/style';

interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
}

export function Switch({ checked, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 rounded-full transition-colors',
        checked ? 'bg-blue-600' : 'bg-slate-700',
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-5 w-5 rounded-full bg-white transition-all',
          checked ? 'left-6' : 'left-1',
        )}
      />
    </button>
  );
}
