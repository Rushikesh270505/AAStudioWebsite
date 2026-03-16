"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  FileSpreadsheet,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { logoutCurrentUser } from "@/lib/api";
import { clearSession, getStoredToken, getWorkspacePath } from "@/lib/auth";
import type { UserProfile } from "@/lib/platform-types";
import { cn } from "@/lib/utils";
import { PresenceIndicator } from "@/components/workspace/presence-indicator";

type NavItem = {
  href: string;
  label: string;
};

function getNavIcon(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("overview") || normalized.includes("dashboard")) {
    return LayoutDashboard;
  }

  if (normalized.includes("publish")) {
    return FolderKanban;
  }

  if (normalized.includes("available")) {
    return BriefcaseBusiness;
  }

  if (normalized.includes("staff")) {
    return Users;
  }

  if (normalized.includes("workload")) {
    return BriefcaseBusiness;
  }

  if (normalized.includes("meeting")) {
    return CalendarDays;
  }

  if (normalized.includes("inquir")) {
    return ShieldCheck;
  }

  if (normalized.includes("report")) {
    return FileSpreadsheet;
  }

  return LayoutDashboard;
}

export function WorkspaceShell({
  user,
  title,
  description,
  navItems,
  actions,
  children,
}: {
  user: UserProfile;
  title: string;
  description?: string;
  navItems: NavItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const displayName = user.fullName || user.username || user.email;
  const [signingOut, setSigningOut] = useState(false);
  const [signOutMessage, setSignOutMessage] = useState("");

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutMessage("");

    try {
      const token = getStoredToken();

      if (token) {
        await logoutCurrentUser(token);
      }

      clearSession();
      router.push("/auth");
    } catch (error) {
      setSignOutMessage(error instanceof Error ? error.message : "Unable to sign out right now.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2ece4_0%,#eae3da_42%,#f4eee7_100%)]">
      <div className="grid min-h-screen lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-black/8 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.86),rgba(236,228,217,0.96))] p-5 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
          <Link
            href={getWorkspacePath(user.role)}
            className="glass-panel relative overflow-hidden rounded-[30px] p-5 shadow-[0_20px_45px_rgba(36,30,23,0.08)]"
          >
            <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top_left,rgba(26,26,26,0.18),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]" />
            <div className="relative flex items-start gap-4">
              <div className="overflow-hidden rounded-full border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(233,220,201,0.88))] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_32px_rgba(32,26,20,0.08)]">
                <Image
                  src={user.avatarUrl || "/brand/logo.jpeg"}
                  alt={displayName}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{user.role.replace(/_/g, " ")}</p>
                <p className="display-title mt-1 text-[2rem] leading-[1.05] text-[#111111]">{displayName}</p>
                {user.email ? <p className="mt-2 truncate text-sm text-[#6b6258]">{user.email}</p> : null}
              </div>
            </div>
            <div className="relative mt-4 flex items-center justify-between gap-3 rounded-[20px] border border-black/7 bg-white/55 px-4 py-3">
              {user.role === "architect" ? (
                <div className="min-w-0">
                  <PresenceIndicator
                    online={user.isOnline}
                    label={`${displayName} ${user.isOnline ? "online" : "offline"}`}
                  />
                </div>
              ) : (
                <p className="text-sm text-[#6b6258]">Operations workspace</p>
              )}
              <ArrowRight size={16} className="text-[#8f6532]" />
            </div>
          </Link>

          <div className="glass-panel mt-6 rounded-[30px] p-4 shadow-[0_20px_45px_rgba(36,30,23,0.06)]">
            <div className="px-2 pb-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Navigation</p>
            </div>
            <nav className="grid gap-2 lg:flex-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = getNavIcon(item.label);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-[22px] border px-4 py-3 text-sm transition",
                    active
                      ? "border-[#c8a97e]/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,232,214,0.9))] text-[#2c2c2c] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_18px_36px_rgba(27,22,17,0.08)]"
                      : "border-black/6 bg-white/48 text-[#5f564c] hover:border-[#c8a97e]/55 hover:bg-white/78 hover:text-[#2c2c2c]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border transition",
                      active
                        ? "border-[#c8a97e]/55 bg-[#f4e7d2] text-[#6f4a2e]"
                        : "border-black/6 bg-white/72 text-[#7d7368] group-hover:border-[#c8a97e]/45 group-hover:text-[#6f4a2e]",
                    )}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.label}</p>
                  </div>
                  <ArrowRight
                    size={15}
                    className={cn(
                      "transition",
                      active ? "translate-x-0 text-[#6f4a2e]" : "text-[#9b9186] group-hover:translate-x-0.5 group-hover:text-[#6f4a2e]",
                    )}
                  />
                </Link>
              );
            })}
            </nav>
          </div>

          <div className="glass-panel mt-6 rounded-[28px] p-4 lg:mt-auto">
            <button
              type="button"
              className="premium-button-soft w-full px-4 py-3 text-sm"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
            >
              <LogOut size={16} />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
            {signOutMessage ? <p className="mt-3 text-sm leading-6 text-[#8f6532]">{signOutMessage}</p> : null}
          </div>
        </aside>

        <div className="p-4 md:p-6">
          <div className="glass-panel flex flex-col gap-5 rounded-[30px] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Workspace</p>
              <h1 className="display-title mt-4 text-4xl md:text-5xl">{title}</h1>
              {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d5d5d]">{description}</p> : null}
            </div>
            {actions ? <div className="md:max-w-[420px] md:flex-1 md:self-stretch">{actions}</div> : null}
          </div>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
