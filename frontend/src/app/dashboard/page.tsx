"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { DashboardShowcase } from "@/components/dashboard/dashboard-showcase";
import { getEmptySessionSnapshot, getWorkspacePath, readSessionSnapshot, subscribeToSession } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, readSessionSnapshot, getEmptySessionSnapshot);

  useEffect(() => {
    if (session.role) {
      router.replace(getWorkspacePath(session.role));
    }
  }, [router, session.role]);

  if (session.role) {
    return (
      <section className="section-pad">
        <div className="container-shell glass-panel rounded-[32px] p-8 text-sm text-[#5d5d5d]">Opening workspace...</div>
      </section>
    );
  }

  return <DashboardShowcase />;
}
