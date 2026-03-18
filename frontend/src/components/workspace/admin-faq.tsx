"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/workspace/admin-shell";

type FaqItem = {
  title: string;
  section: string;
  description: string;
  steps: string[];
};

const faqItems: FaqItem[] = [
  {
    section: "Publishing",
    title: "How to post new work",
    description: "Use this when the studio needs to open a new project for internal delivery or architect claiming.",
    steps: [
      "Open Admin > Publish Work.",
      "Enter the project title, location, service type, summary, and delivery status.",
      "Attach the links or file references you want the architect to see in the brief.",
      "Set the project priority and deadline carefully so it appears correctly in available works.",
      "Save the project. If it is unassigned, it becomes visible in the architect available-works section.",
    ],
  },
  {
    section: "Assignments",
    title: "How to assign work to a specific architect",
    description: "Use this when work should go directly to one architect instead of staying publicly claimable.",
    steps: [
      "Open Admin > Publish Work or the existing project editor.",
      "Choose the architect from the assignment field.",
      "Save the project so it moves out of the unclaimed queue.",
      "The architect will see it under My Projects after refresh or next login.",
    ],
  },
  {
    section: "Meetings",
    title: "How to schedule a meeting",
    description: "Create meetings once from the admin panel and let them appear automatically in architect and client workspaces.",
    steps: [
      "Open Admin > Meetings.",
      "Enter subject, date, time, description, and the Google Meet link.",
      "Search for participants by username, name, or email and add as many as needed.",
      "Send the meeting. It will appear in each selected recipient's Meetings section and calendar.",
    ],
  },
  {
    section: "Staff",
    title: "How to create a staff account",
    description: "Use this to onboard a new architect with credentials chosen by the admin.",
    steps: [
      "Open Admin > Staff.",
      "Fill username, email, password, phone, and architect ID.",
      "Submit Create account.",
      "The new architect can sign in immediately with the saved email or username plus password.",
    ],
  },
  {
    section: "Staff",
    title: "Archive vs terminate architect accounts",
    description: "Archive preserves contact history; terminate permanently removes access and account data.",
    steps: [
      "Use Archive when you want to remove portal access but keep contact info for future reactivation.",
      "Archived architects move to the Archived list and can be reactivated by filling the remaining form details.",
      "Use Terminate only when the account should be removed permanently.",
      "Terminate deletes the login path and account-linked architect data so the old credentials cannot be used again.",
    ],
  },
  {
    section: "Workload",
    title: "How to review architect reports",
    description: "Daily reports show the latest status update from each architect and support sign-out enforcement.",
    steps: [
      "Open Admin > Workload.",
      "Review each architect card for the latest submitted report, images, and current online/offline state.",
      "Use the workload view to track who is active, who has review-ready work, and who still needs follow-up.",
    ],
  },
  {
    section: "Client Operations",
    title: "How client meetings and updates flow",
    description: "This explains what clients see after you assign projects or schedule milestones.",
    steps: [
      "Assigned projects appear in the client dashboard automatically.",
      "Meetings created in Admin > Meetings show up in the client Meetings section.",
      "Invoices, files, and project timeline entries remain tied to the assigned project record.",
    ],
  },
  {
    section: "Inquiries",
    title: "How to handle website inquiries",
    description: "Contact form submissions are stored and can be reviewed from the admin workspace.",
    steps: [
      "Open Admin > Inquiries.",
      "Review the lead details, project type, and message submitted through the live website contact form.",
      "Use the saved contact information to follow up externally by email or WhatsApp.",
    ],
  },
  {
    section: "Authentication",
    title: "How email OTP works for signup and forgot password",
    description: "Production email OTP uses the configured SMTP sender in the backend.",
    steps: [
      "Public sign-up sends an email OTP before the account can be created.",
      "Forgot password also sends an OTP to the registered email address.",
      "Make sure SMTP environment variables are configured on Render so the website sends real messages instead of staying in debug mode.",
    ],
  },
];

export function AdminFaq() {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return faqItems;
    }

    return faqItems.filter((item) => {
      const haystack = [item.title, item.section, item.description, ...item.steps].join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <AdminShell
      title="Admin FAQ"
      description="Search the studio process guide whenever you need a quick reminder for publishing, assigning, meetings, staff operations, or delivery flow."
    >
      {() => (
        <div className="grid gap-6">
          <div className="glass-panel rounded-[30px] p-6">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
              <label className="grid gap-2 text-sm text-[#3c3c3c]">
                Search process guide
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search for post work, assign work, schedule meetings..."
                  className="rounded-[22px] border border-black/10 bg-white/88 px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
                />
              </label>
              <div className="glass-panel rounded-[24px] px-5 py-4">
                <p className="eyebrow">Topics</p>
                <p className="mt-3 text-3xl font-medium text-[#2c2c2c]">{faqItems.length}</p>
              </div>
              <div className="glass-panel rounded-[24px] px-5 py-4">
                <p className="eyebrow">Matches</p>
                <p className="mt-3 text-3xl font-medium text-[#2c2c2c]">{filteredItems.length}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredItems.length ? (
              filteredItems.map((item) => (
                <article key={item.title} className="glass-panel rounded-[30px] p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="eyebrow">{item.section}</p>
                    <span className="rounded-full border border-black/8 bg-white/65 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#8f6532]">
                      Guide
                    </span>
                  </div>
                  <h2 className="display-title mt-4 text-3xl">{item.title}</h2>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-[#5d5d5d]">{item.description}</p>
                  <ol className="mt-5 grid gap-3">
                    {item.steps.map((step, index) => (
                      <li
                        key={`${item.title}-${index}`}
                        className="rounded-[22px] border border-black/8 bg-white/60 px-4 py-4 text-sm leading-7 text-[#464646]"
                      >
                        <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#c8a97e]/45 bg-[#fbf6ee] text-[11px] font-medium tracking-[0.18em] text-[#8f6532]">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </article>
              ))
            ) : (
              <div className="glass-panel rounded-[28px] p-6 text-sm text-[#5d5d5d]">
                No matching guide topics were found. Try searching for keywords like publish, assign, meetings, archive, terminate, or OTP.
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
