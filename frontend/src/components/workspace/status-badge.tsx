import { cn } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  PENDING: "border-[#d2b48c]/40 bg-[#f5ecde] text-[#8f6532]",
  IN_PROGRESS: "border-[#c8a97e]/40 bg-[#f8f2e8] text-[#7c5b34]",
  READY_FOR_REVIEW: "border-[#7aa6a1]/30 bg-[#edf7f6] text-[#355a56]",
  CHANGES_REQUESTED: "border-[#d68e6d]/35 bg-[#fff0e8] text-[#98593b]",
  COMPLETED: "border-[#7aa67f]/30 bg-[#eef8ef] text-[#3c6b41]",
  Paid: "border-[#7aa67f]/30 bg-[#eef8ef] text-[#3c6b41]",
  Scheduled: "border-[#c8a97e]/40 bg-[#f8f2e8] text-[#7c5b34]",
  Due: "border-[#d68e6d]/35 bg-[#fff0e8] text-[#98593b]",
  Draft: "border-black/10 bg-white/70 text-[#444444]",
  Overdue: "border-[#d06868]/35 bg-[#fff0f0] text-[#963f3f]",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em]",
        statusClasses[status] || "border-black/10 bg-white/70 text-[#444444]",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
