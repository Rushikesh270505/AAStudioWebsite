"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/workspace/admin-shell";
import { MetricCard } from "@/components/workspace/metric-card";
import { fetchContactLeads } from "@/lib/api";
import type { ContactLead } from "@/lib/platform-types";

function InquiryContent({ token }: { token: string }) {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [recentLeads, setRecentLeads] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLeads() {
      try {
        const payload = await fetchContactLeads(token);
        if (!cancelled) {
          setLeads(payload);
          setRecentLeads(
            payload.filter((lead) => {
              const createdAt = new Date(lead.createdAt).getTime();
              return createdAt >= Date.now() - 1000 * 60 * 60 * 24 * 7;
            }).length,
          );
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load website inquiries.");
        }
      }
    }

    void loadLeads();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const leadsWithPhone = leads.filter((lead) => Boolean(lead.phone)).length;
  const leadsWithBudget = leads.filter((lead) => Boolean(lead.budget)).length;

  return (
    <div className="grid gap-6">
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total inquiries" value={leads.length} hint="Website leads captured so far." />
        <MetricCard label="With phone" value={leadsWithPhone} hint="Leads ready for direct follow-up." />
        <MetricCard label="With budget" value={leadsWithBudget} hint="Commercially qualified inquiries." />
        <MetricCard label="Past 7 days" value={recentLeads} hint="New conversations this week." />
      </div>

      <section className="glass-panel rounded-[30px] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Website inquiries</p>
            <h2 className="display-title mt-4 text-3xl">Lead inbox</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#5d5d5d]">
            Every contact submission lands here with the message, contact details, and project context the studio needs to respond fast.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {leads.length ? (
            leads.map((lead) => (
              <article key={lead._id} className="rounded-[26px] border border-black/8 bg-white/72 p-5 shadow-[0_14px_30px_rgba(17,17,17,0.04)]">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[#111111]">{lead.fullName}</p>
                    <p className="mt-2 text-sm text-[#5d5d5d]">{lead.email}</p>
                    {lead.phone ? <p className="mt-1 text-sm text-[#5d5d5d]">{lead.phone}</p> : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {lead.projectType ? (
                      <span className="rounded-full border border-black/8 bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#8f6532]">
                        {lead.projectType}
                      </span>
                    ) : null}
                    {lead.budget ? (
                      <span className="rounded-full border border-black/8 bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#8f6532]">
                        {lead.budget}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-black/8 bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#8f6532]">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#4f4f4f]">{lead.message}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={`mailto:${lead.email}`} className="premium-button-soft px-4 py-2 text-sm">
                    Email lead
                  </a>
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`} className="premium-button-soft px-4 py-2 text-sm">
                      Call lead
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-[#5d5d5d]">No contact leads have been captured yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export function AdminInquiries() {
  return (
    <AdminShell
      title="Website inquiries"
      description="Use this inbox for contact leads only. Keep the website pipeline separate from operations so follow-ups stay fast and visible."
    >
      {({ token }) => <InquiryContent token={token} />}
    </AdminShell>
  );
}
