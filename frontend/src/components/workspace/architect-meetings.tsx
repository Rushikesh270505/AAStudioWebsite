"use client";

import { useEffect, useState } from "react";
import { fetchMeetings } from "@/lib/api";
import { architectNavItems } from "@/components/workspace/architect-nav";
import { MeetingCalendar } from "@/components/workspace/meeting-calendar";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { Meeting, UserProfile } from "@/lib/platform-types";

function toDayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function ArchitectMeetingsContent({ token, user }: { token: string; user: UserProfile }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMeetings() {
      try {
        const meetingPayload = await fetchMeetings(token);
        if (!cancelled) {
          setMeetings(meetingPayload);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load meetings.");
        }
      }
    }

    void loadMeetings();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const dayMeetings = meetings.filter((meeting) => toDayKey(meeting.scheduledAt) === selectedDay);

  return (
    <WorkspaceShell
      user={user}
      title="Architect meetings"
      description="Keep your calendar clear, join Google Meet sessions on time, and see every admin-scheduled discussion in one place."
      navItems={[...architectNavItems]}
    >
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.54fr)_minmax(0,0.46fr)]">
        <MeetingCalendar meetings={meetings} selectedDay={selectedDay} onSelectDay={setSelectedDay} />

        <div className="glass-panel rounded-[30px] p-6">
          <p className="eyebrow">Scheduled meetings</p>
          <h2 className="display-title mt-4 text-3xl">On {new Date(selectedDay).toLocaleDateString()}</h2>
          <div className="mt-6 grid gap-4">
            {dayMeetings.length ? (
              dayMeetings.map((meeting) => (
                <article key={meeting._id} className="rounded-[24px] border border-black/8 bg-white/72 p-5">
                  <p className="text-lg font-semibold text-[#111111]">{meeting.title}</p>
                  <p className="mt-2 text-sm text-[#5d5d5d]">{new Date(meeting.scheduledAt).toLocaleString()}</p>
                  <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{meeting.description || meeting.notes || "No description shared yet."}</p>
                  {meeting.meetLink ? (
                    <a href={meeting.meetLink} target="_blank" rel="noreferrer" className="premium-button-soft mt-5 inline-flex px-4 py-2 text-sm">
                      Join Google Meet
                    </a>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-sm text-[#5d5d5d]">No meetings are scheduled on this day.</p>
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

export function ArchitectMeetings() {
  return (
    <ProtectedArea roles={["architect"]}>
      {({ token, user }) => <ArchitectMeetingsContent token={token} user={user} />}
    </ProtectedArea>
  );
}
