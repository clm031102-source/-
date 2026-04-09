interface Props {
  label: string;
  value: string;
  highlight?: boolean;
}

export function ResultMetric({ label, value, highlight }: Props) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950/60'}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 font-semibold ${highlight ? 'text-xl text-blue-300' : 'text-lg text-slate-100'}`}>{value}</p>
    </div>
  );
}
