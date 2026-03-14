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
                      ? "border-[#c8a97e]/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(200,169,126,0.18))] text-[#111111] shadow-[0_10px_30px_rgba(200,169,126,0.16)]"
                      : "border-transparent text-[#3b3b3b] hover:border-black/8 hover:bg-white/70 hover:text-[#111111]",
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
              className="rounded-full border border-black/8 bg-white/45 px-4 py-2 text-sm text-[#444444] backdrop-blur-md transition-all hover:border-[#c8a97e]/35 hover:bg-white/70 hover:text-[#111111]"
            >
              Client login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[#c8a97e]/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(200,169,126,0.22))] px-5 py-2.5 text-sm font-medium text-[#111111] shadow-[0_12px_32px_rgba(200,169,126,0.18)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#c8a97e]/55 hover:shadow-[0_16px_36px_rgba(200,169,126,0.24)]"
            >
              Dashboard
            </Link>
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white lg:hidden"
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
                      ? "border-[#c8a97e]/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(200,169,126,0.2))] text-[#111111]"
                      : "border-transparent text-[#202020] hover:bg-white",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="rounded-2xl border border-black/8 bg-white/55 px-4 py-3 text-sm text-[#202020]"
            >
              Client login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-[#c8a97e]/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(200,169,126,0.22))] px-4 py-3 text-sm font-medium text-[#111111] shadow-[0_12px_32px_rgba(200,169,126,0.18)]"
            >
              Open dashboard
            </Link>
          </motion.nav>
        ) : null}
      </div>
    </header>
  );
}
