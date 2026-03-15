"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/brand-mark";
import { clearSession, getEmptySessionSnapshot, getWorkspacePath, readSessionSnapshot, subscribeToSession } from "@/lib/auth";
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const session = useSyncExternalStore(subscribeToSession, readSessionSnapshot, getEmptySessionSnapshot);
  const sessionRole = session.role;
  const sessionName = session.user?.fullName || session.user?.name || session.user?.username || "";

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
                    "glass-tab px-4 py-2 text-sm",
                    active ? "glass-tab-active" : "",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/dashboard"
              className="premium-button px-5 py-2.5 text-sm font-medium"
            >
              Dashboard
            </Link>
            {sessionRole ? (
              <>
                <span className="glass-tab px-4 py-2 text-sm">
                  {sessionName || "Signed in"}
                </span>
                <button
                  type="button"
                  className="premium-button-soft px-4 py-2 text-sm"
                  onClick={() => {
                    clearSession();
                    router.push("/auth");
                  }}
                >
                  Sign out
                </button>
                <Link
                  href={getWorkspacePath(sessionRole as "public_user" | "client" | "architect" | "admin")}
                  className="premium-button px-5 py-2.5 text-sm font-medium"
                >
                  Open workspace
                </Link>
              </>
            ) : (
              <Link
                href="/auth"
                className="premium-button px-5 py-2.5 text-sm font-medium"
              >
                Sign Up / Login
              </Link>
            )}
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            className="premium-button-soft inline-flex h-11 w-11 items-center justify-center lg:hidden"
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
                    "glass-tab rounded-2xl px-4 py-3 text-sm",
                    active ? "glass-tab-active" : "",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              className="premium-button rounded-2xl px-4 py-3 text-sm font-medium"
            >
              Dashboard
            </Link>
            {sessionRole ? (
              <>
                <button
                  type="button"
                  className="premium-button-soft rounded-2xl px-4 py-3 text-left text-sm"
                  onClick={() => {
                    clearSession();
                    setIsOpen(false);
                    router.push("/auth");
                  }}
                >
                  Sign out
                </button>
                <Link
                  href={getWorkspacePath(sessionRole as "public_user" | "client" | "architect" | "admin")}
                  className="premium-button rounded-2xl px-4 py-3 text-sm font-medium"
                >
                  Open workspace
                </Link>
              </>
            ) : (
              <Link
                href="/auth"
                className="premium-button rounded-2xl px-4 py-3 text-sm font-medium"
              >
                Sign Up / Login
              </Link>
            )}
          </motion.nav>
        ) : null}
      </div>
    </header>
  );
}
