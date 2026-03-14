export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{label}</p>
      <p className="display-title mt-3 text-3xl">{value}</p>
      {hint ? <p className="mt-2 text-sm text-[#5d5d5d]">{hint}</p> : null}
    </div>
  );
}
