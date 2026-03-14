"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/viewer", label: "3D Viewer" },
  { href: "/walkthrough", label: "Walkthrough" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="container-shell glass-panel rounded-[28px] border border-white/45 px-5 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" aria-label="Art and Architecture Studios home">
            <BrandMark compact className="shrink-0" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-all duration-300 backdrop-blur-md",
                    active
                      ? "border-[#c8a97e]/38 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(200,169,126,0.18))] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_10px_30px_rgba(200,169,126,0.16)]"
                      : "border-[#c8a97e]/12 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(248,243,236,0.68))] text-[#3b3b3b] shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_8px_20px_rgba(17,17,17,0.04)] hover:border-[#c8a97e]/24 hover:text-[#111111] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_12px_24px_rgba(200,169,126,0.1)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-full border border-[#c8a97e]/18 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,241,234,0.84))] px-4 py-2 text-sm text-[#444444] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_24px_rgba(17,17,17,0.05)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#c8a97e]/34 hover:text-[#111111] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_30px_rgba(200,169,126,0.12)]"
            >
              Client login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[#c8a97e]/42 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,234,220,0.92)_58%,rgba(200,169,126,0.3))] px-5 py-2.5 text-sm font-medium text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_12px_32px_rgba(200,169,126,0.18)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#c8a97e]/58 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_rgba(200,169,126,0.24)]"
            >
              Dashboard
            </Link>
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#c8a97e]/18 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,241,234,0.86))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_24px_rgba(17,17,17,0.05)] lg:hidden"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {isOpen ? (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 grid gap-2 border-t border-black/10 pt-4 lg:hidden"
          >
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm transition-all",
                    active
                      ? "border-[#c8a97e]/38 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(200,169,126,0.18))] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_10px_24px_rgba(200,169,126,0.12)]"
                      : "border-[#c8a97e]/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,243,236,0.72))] text-[#202020] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_18px_rgba(17,17,17,0.04)] hover:border-[#c8a97e]/24",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="rounded-2xl border border-[#c8a97e]/14 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,241,234,0.82))] px-4 py-3 text-sm text-[#202020] shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_10px_22px_rgba(17,17,17,0.05)]"
            >
              Client login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-[#c8a97e]/42 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,234,220,0.92)_58%,rgba(200,169,126,0.3))] px-4 py-3 text-sm font-medium text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_12px_32px_rgba(200,169,126,0.18)]"
            >
              Open dashboard
            </Link>
          </motion.nav>
        ) : null}
      </div>
    </header>
  );
}
