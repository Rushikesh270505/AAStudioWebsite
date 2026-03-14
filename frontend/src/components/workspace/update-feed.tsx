import type { ProjectUpdate } from "@/lib/platform-types";

export function UpdateFeed({
  updates,
  emptyLabel = "No updates yet.",
}: {
  updates: ProjectUpdate[];
  emptyLabel?: string;
}) {
  if (!updates.length) {
    return <div className="glass-panel rounded-[28px] p-5 text-sm text-[#5d5d5d]">{emptyLabel}</div>;
  }

  return (
    <div className="grid gap-4">
      {updates.map((update) => (
        <article key={update._id} className="glass-panel rounded-[28px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={update.author.avatarUrl}
                alt={update.author.fullName}
                className="h-12 w-12 rounded-full border border-black/8 object-cover"
              />
              <div>
                <p className="font-medium text-[#111111]">{update.author.fullName}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">
                  {update.updateType.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            <p className="text-xs text-[#5d5d5d]">{new Date(update.createdAt).toLocaleString()}</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{update.message}</p>
          {update.attachmentUrl ? (
            <a href={update.attachmentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm text-[#8f6532]">
              {update.attachmentName || "Open attachment"}
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
