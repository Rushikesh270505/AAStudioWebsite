"use client";

import { cn } from "@/lib/utils";

export function PresenceIndicator({
  online,
  label,
}: {
  online?: boolean;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-[#5d5d5d]">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          online
            ? "bg-[#3fb66e] shadow-[0_0_14px_rgba(63,182,110,0.85)]"
            : "bg-[#d24f4f] shadow-[0_0_14px_rgba(210,79,79,0.55)]",
        )}
      />
      {label || (online ? "Online" : "Offline")}
    </span>
  );
}
