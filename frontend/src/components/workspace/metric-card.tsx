export function MetricCard({
  label,
  value,
  hint,
  active = false,
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const className = `glass-panel rounded-[28px] p-5 text-left transition ${
    onClick ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#c8a97e]/60 active:translate-y-px" : ""
  } ${
    active
      ? "border-[#c8a97e]/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,232,214,0.88))] shadow-[0_18px_36px_rgba(45,45,45,0.10)]"
      : ""
  }`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{label}</p>
        <p className="display-title mt-3 text-3xl">{value}</p>
        {hint ? <p className="mt-2 text-sm text-[#5d5d5d]">{hint}</p> : null}
      </button>
    );
  }

  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{label}</p>
      <p className="display-title mt-3 text-3xl">{value}</p>
      {hint ? <p className="mt-2 text-sm text-[#5d5d5d]">{hint}</p> : null}
    </div>
  );
}
