import { dashboardFiles, dashboardInvoices, dashboardMessages, dashboardOverview, studioProjects } from "@/lib/site-data";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const activeProject = studioProjects[1];

  return (
    <>
      <section className="section-pad">
        <div className="container-shell">
          <span className="eyebrow">Client dashboard</span>
          <h1 className="display-title mt-5 text-5xl text-balance md:text-7xl">Private project tracking for clients</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#5d5d5d] md:text-lg">
            A secure dashboard surface for reviewing files, project status, communication, 3D assets, walkthrough media, and invoices.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {dashboardOverview.map((item) => (
              <div key={item.label} className="glass-panel rounded-[28px] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{item.label}</p>
                <p className="display-title mt-3 text-2xl">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad pt-0">
        <div className="container-shell grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
          <div className="grid gap-6">
            <div className="glass-panel rounded-[32px] p-6">
              <p className="eyebrow">Overview</p>
              <h2 className="display-title mt-4 text-4xl">{activeProject.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{activeProject.summary}</p>
              <div className="mt-6 grid gap-3">
                {activeProject.timeline.map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-black/8 bg-white/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#1d1d1d]">{item.title}</p>
                      <span className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{item.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#5d5d5d]">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[32px] p-6">
              <p className="eyebrow">Invoices</p>
              <div className="mt-5 grid gap-3">
                {dashboardInvoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-[24px] border border-black/8 bg-white/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="display-title text-2xl">{invoice.id}</p>
                      <span className="rounded-full bg-[#111111] px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">
                        {invoice.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[#5d5d5d]">
                      {invoice.amount} • {invoice.dueDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="glass-panel rounded-[32px] p-6">
              <p className="eyebrow">Project files</p>
              <div className="mt-5 overflow-hidden rounded-[24px] border border-black/8">
                <table className="min-w-full bg-white/55 text-left text-sm">
                  <thead className="bg-black/[0.03] text-[#5d5d5d]">
                    <tr>
                      <th className="px-4 py-3 font-medium">File</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Size</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardFiles.map((file) => (
                      <tr key={file.name} className="border-t border-black/6">
                        <td className="px-4 py-4 text-[#212121]">{file.name}</td>
                        <td className="px-4 py-4 text-[#5d5d5d]">{file.type}</td>
                        <td className="px-4 py-4 text-[#5d5d5d]">{file.size}</td>
                        <td className="px-4 py-4 text-[#5d5d5d]">{file.updatedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass-panel rounded-[32px] p-6">
                <p className="eyebrow">Messages</p>
                <div className="mt-5 grid gap-3">
                  {dashboardMessages.map((message) => (
                    <div key={message.preview} className="rounded-[24px] border border-black/8 bg-white/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-[#212121]">{message.from}</p>
                        <span className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{message.time}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">{message.preview}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[32px] p-6">
                <p className="eyebrow">Timeline</p>
                <div className="mt-5 grid gap-3">
                  {activeProject.timeline.map((item) => (
                    <div key={item.title} className="rounded-[24px] border border-black/8 bg-white/60 p-4">
                      <p className="font-medium text-[#212121]">{item.title}</p>
                      <p className="mt-2 text-sm text-[#8f6532]">{item.date}</p>
                      <p className="mt-2 text-sm leading-7 text-[#5d5d5d]">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
