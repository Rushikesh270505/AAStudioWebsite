import { cn } from "@/lib/utils";

const priorityClasses: Record<string, string> = {
  LOW: "bg-white/70 text-[#6c6c6c]",
  MEDIUM: "bg-[#f8f2e8] text-[#8f6532]",
  HIGH: "bg-[#fff0e8] text-[#9a6545]",
  CRITICAL: "bg-[#111111] text-white",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em]",
        priorityClasses[priority] || "bg-white/70 text-[#444444]",
        className,
      )}
    >
      {priority}
    </span>
  );
}
