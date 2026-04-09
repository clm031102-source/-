import { Button } from '@/components/ui/Button';

interface Props {
  values: number[];
  current: number;
  onPick: (value: number) => void;
  suffix: string;
}

export function QuickPresetButtons({ values, current, onPick, suffix }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {values.map((value) => (
        <Button key={value} variant="outline" active={value === current} onClick={() => onPick(value)} className="py-2.5">
          {value}{suffix}
        </Button>
      ))}
    </div>
  );
}
