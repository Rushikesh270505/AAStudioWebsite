"use client";

import type { ReactNode } from "react";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { UserProfile } from "@/lib/platform-types";

type SessionState = {
  token: string;
  user: UserProfile;
};

export const adminNavItems = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/publish-work", label: "Publish Work" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/workload", label: "Workload" },
  { href: "/admin/meetings", label: "Meetings" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/faq", label: "FAQ" },
];

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: (session: SessionState) => ReactNode;
}) {
  return (
    <ProtectedArea roles={["admin"]}>
      {({ token, user }) => (
        <WorkspaceShell user={user} title={title} description={description} navItems={adminNavItems} actions={actions}>
          {children({ token, user })}
        </WorkspaceShell>
      )}
    </ProtectedArea>
  );
}
