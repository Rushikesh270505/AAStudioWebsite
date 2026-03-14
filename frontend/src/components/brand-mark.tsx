import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-black/8 bg-white shadow-[0_14px_40px_rgba(17,17,17,0.12)]">
        <Image
          src="/brand/logo.jpeg"
          alt="Art and Architecture Studios logo"
          fill
          sizes="48px"
          className="object-cover"
          priority
        />
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
