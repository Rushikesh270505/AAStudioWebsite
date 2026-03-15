"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { AdminShell } from "@/components/workspace/admin-shell";
import { MeetingCalendar } from "@/components/workspace/meeting-calendar";
import { MetricCard } from "@/components/workspace/metric-card";
import { createMeeting, fetchMeetings, fetchUsers } from "@/lib/api";
import type { Meeting, UserProfile } from "@/lib/platform-types";

type MeetingFormState = {
  subject: string;
  date: string;
  time: string;
  description: string;
  meetLink: string;
};

const initialForm: MeetingFormState = {
  subject: "",
  date: "",
  time: "",
  description: "",
  meetLink: "",
};

function toDayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function AdminMeetingsContent({ token }: { token: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [directory, setDirectory] = useState<UserProfile[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState<MeetingFormState>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [meetingPayload, userPayload] = await Promise.all([fetchMeetings(token), fetchUsers(token)]);
        if (!cancelled) {
          setMeetings(meetingPayload);
          setDirectory(userPayload.filter((user) => ["client", "architect"].includes(user.role) && user.isActive !== false));
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load meeting data.");
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return directory.filter((user) => {
      if (selectedParticipants.some((item) => item.id === user.id)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [user.username, user.email, user.fullName].some((value) => value?.toLowerCase().includes(query));
    });
  }, [directory, search, selectedParticipants]);

  const dayMeetings = meetings.filter((meeting) => toDayKey(meeting.scheduledAt) === selectedDay);
  const architectCount = selectedParticipants.filter((user) => user.role === "architect").length;
  const clientCount = selectedParticipants.filter((user) => user.role === "client").length;

  async function handleCreateMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();

      await createMeeting(token, {
        title: form.subject,
        subject: form.subject,
        scheduledAt,
        description: form.description,
        notes: form.description,
        meetLink: form.meetLink,
        participants: selectedParticipants.map((user) => user.id),
      });

      setMessage("Meeting scheduled successfully. It is now visible in the recipients' meeting sections.");
      setForm(initialForm);
      setSelectedParticipants([]);
      setSearch("");
      const [meetingPayload, userPayload] = await Promise.all([fetchMeetings(token), fetchUsers(token)]);
      setMeetings(meetingPayload);
      setDirectory(userPayload.filter((user) => ["client", "architect"].includes(user.role) && user.isActive !== false));
    } catch (createError) {
      setMessage(createError instanceof Error ? createError.message : "Unable to schedule the meeting.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Scheduled meetings" value={meetings.length} hint="All meetings on the studio calendar." />
        <MetricCard label="Selected architects" value={architectCount} hint="Architects in the current draft." />
        <MetricCard label="Selected clients" value={clientCount} hint="Clients in the current draft." />
        <MetricCard label="Meetings today" value={dayMeetings.length} hint="Meetings on the selected day." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)]">
        <MeetingCalendar meetings={meetings} selectedDay={selectedDay} onSelectDay={setSelectedDay} />

        <section className="glass-panel rounded-[30px] p-6">
          <p className="eyebrow">Create meeting</p>
          <h2 className="display-title mt-4 text-3xl">Schedule and notify</h2>

          <form onSubmit={handleCreateMeeting} className="mt-6 grid gap-3">
            <input
              required
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              placeholder="Subject"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
            />

            <div className="grid gap-3 md:grid-cols-2">
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
              <input
                required
                type="time"
                value={form.time}
                onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
            </div>

            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Description"
              className="rounded-[24px] border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
            />

            <input
              required
              value={form.meetLink}
              onChange={(event) => setForm((current) => ({ ...current, meetLink: event.target.value }))}
              placeholder="Google Meet link"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
            />

            <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8f6532]">Add participants</p>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by username, email, or name"
                className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />

              {selectedParticipants.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedParticipants.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedParticipants((current) => current.filter((item) => item.id !== user.id))}
                      className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-[#f7f1e7] px-3 py-2 text-sm text-[#5d5d5d]"
                    >
                      {user.username || user.fullName}
                      <X size={14} />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 grid max-h-56 gap-2 overflow-auto">
                {filteredUsers.slice(0, 8).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedParticipants((current) => [...current, user])}
                    className="rounded-[20px] border border-black/8 bg-white/80 px-4 py-3 text-left transition hover:border-[#c8a97e]/45"
                  >
                    <p className="font-medium text-[#111111]">{user.username || user.fullName}</p>
                    <p className="mt-1 text-sm text-[#5d5d5d]">{user.email}</p>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="premium-button mt-2 px-4 py-3 text-sm font-medium disabled:opacity-60">
              {submitting ? "Sending..." : "Send meeting"}
            </button>
          </form>

          {message ? <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{message}</p> : null}
        </section>
      </div>

      <section className="glass-panel rounded-[30px] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Selected day</p>
            <h2 className="display-title mt-4 text-3xl">Meetings on {new Date(selectedDay).toLocaleDateString()}</h2>
          </div>
          <div className="rounded-full border border-black/8 bg-white/75 px-4 py-2 text-sm text-[#5d5d5d]">
            {dayMeetings.length} meetings
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {dayMeetings.length ? (
            dayMeetings.map((meeting) => (
              <article key={meeting._id} className="rounded-[24px] border border-black/8 bg-white/72 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[#111111]">{meeting.title}</p>
                    <p className="mt-2 text-sm text-[#5d5d5d]">{new Date(meeting.scheduledAt).toLocaleString()}</p>
                    <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{meeting.description || meeting.notes || "No description added."}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meeting.participants.map((participant) => (
                      <span key={participant.id} className="rounded-full border border-black/8 bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#8f6532]">
                        {participant.username || participant.fullName}
                      </span>
                    ))}
                  </div>
                </div>
                {meeting.meetLink ? (
                  <a href={meeting.meetLink} target="_blank" rel="noreferrer" className="premium-button-soft mt-5 inline-flex px-4 py-2 text-sm">
                    Open Google Meet
                  </a>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-sm text-[#5d5d5d]">No meetings are scheduled on this day.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export function AdminMeetings() {
  return (
    <AdminShell
      title="Meetings"
      description="Only admins can create meetings. Schedule them once here and they appear automatically in the architect and client meeting sections."
    >
      {({ token }) => <AdminMeetingsContent token={token} />}
    </AdminShell>
  );
}
