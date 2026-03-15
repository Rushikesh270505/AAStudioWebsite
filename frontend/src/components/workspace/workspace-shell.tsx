"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { useState } from "react";
import { logoutCurrentUser } from "@/lib/api";
import { clearSession, getStoredToken, getWorkspacePath } from "@/lib/auth";
import type { NotificationItem, UserProfile } from "@/lib/platform-types";
import { cn } from "@/lib/utils";
import { PresenceIndicator } from "@/components/workspace/presence-indicator";

type NavItem = {
  href: string;
  label: string;
};

export function WorkspaceShell({
  user,
  title,
  description,
  navItems,
  notifications = [],
  actions,
  children,
}: {
  user: UserProfile;
  title: string;
  description?: string;
  navItems: NavItem[];
  notifications?: NotificationItem[];
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
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-black/8 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),transparent_52%),linear-gradient(180deg,rgba(255,255,255,0.74),rgba(236,228,217,0.92))] p-5 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
          <Link href={getWorkspacePath(user.role)} className="glass-panel flex items-center gap-4 rounded-[28px] p-4">
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="h-14 w-14 rounded-full border border-black/8 object-cover"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{user.role.replace(/_/g, " ")}</p>
              <p className="display-title text-2xl text-[#111111]">{displayName}</p>
              {user.role === "architect" ? (
                <div className="mt-2">
                  <PresenceIndicator
                    online={user.isOnline}
                    label={`${displayName} ${user.isOnline ? "online" : "offline"}`}
                  />
                </div>
              ) : null}
            </div>
          </Link>

          <nav className="mt-6 grid gap-2 lg:flex-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "glass-tab justify-start rounded-[22px] px-4 py-3 text-sm",
                    active ? "glass-tab-active" : "",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="premium-button-soft mt-6 w-full px-4 py-3 text-sm lg:mt-auto"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
          >
            <LogOut size={16} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
          {signOutMessage ? <p className="mt-3 text-sm leading-6 text-[#8f6532]">{signOutMessage}</p> : null}
        </aside>

        <div className="p-4 md:p-6">
          <div className="glass-panel flex flex-col gap-5 rounded-[30px] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Workspace</p>
              <h1 className="display-title mt-4 text-4xl md:text-5xl">{title}</h1>
              {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d5d5d]">{description}</p> : null}
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <div className="flex items-center gap-3">
                <div className="glass-tab px-4 py-2 text-sm text-[#5d5d5d]">
                  <Search size={16} />
                  Search
                </div>
                <div className="glass-tab relative px-4 py-2 text-sm text-[#111111]">
                  <Bell size={16} />
                  {notifications.filter((item) => !item.read).length}
                </div>
              </div>
              {actions}
            </div>
          </div>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
