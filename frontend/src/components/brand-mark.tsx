import { cn } from "@/lib/utils";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#111111] shadow-[0_14px_40px_rgba(17,17,17,0.2)]">
        <div className="absolute inset-[1px] rounded-full border border-white/6" />
        <span className="display-title bg-[linear-gradient(135deg,#f8edcf_0%,#c8a97e_45%,#8f6532_100%)] bg-clip-text text-2xl font-semibold tracking-[-0.08em] text-transparent">
          AA
        </span>
      </div>
      {!compact ? (
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.35em] text-[#8f6532]">
            Art and Architecture Studios
          </p>
          <p className="display-title text-lg text-[#111111]">Premium studio platform</p>
        </div>
      ) : null}
    </div>
  );
}
