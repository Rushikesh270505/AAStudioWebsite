"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getEmptySessionSnapshot, readSessionSnapshot, subscribeToSession } from "@/lib/auth";
import type { Role, UserProfile } from "@/lib/platform-types";

type SessionState = {
  token: string;
  user: UserProfile;
};

export function ProtectedArea({
  roles,
  staffOnly = false,
  children,
}: {
  roles: Role[];
  staffOnly?: boolean;
  children: (session: SessionState) => React.ReactNode;
}) {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, readSessionSnapshot, getEmptySessionSnapshot);
  const hasAccess = Boolean(session.token && session.user && roles.includes(session.user.role));

  useEffect(() => {
    if (!session.token || !session.user) {
      router.replace(staffOnly ? "/staff-login" : "/auth");
      return;
    }

    if (!roles.includes(session.user.role)) {
      router.replace("/auth");
    }
  }, [roles, router, session.token, session.user, staffOnly]);

  if (!hasAccess || !session.user) {
    return (
      <section className="section-pad">
        <div className="container-shell grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="glass-panel h-32 animate-pulse rounded-[28px]" />
          ))}
        </div>
      </section>
    );
  }

  return <>{children({ token: session.token, user: session.user })}</>;
}
