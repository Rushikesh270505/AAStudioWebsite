"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Meeting } from "@/lib/platform-types";
import { cn } from "@/lib/utils";

function toDayKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function MeetingCalendar({
  meetings,
  selectedDay,
  onSelectDay,
}: {
  meetings: Meeting[];
  selectedDay?: string;
  onSelectDay?: (dayKey: string) => void;
}) {
  const initialDate = selectedDay ? new Date(selectedDay) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  const meetingMap = useMemo(() => {
    const map = new Map();
    for (const meeting of meetings) {
      const dayKey = toDayKey(meeting.scheduledAt);
      const current = map.get(dayKey) || [];
      current.push(meeting);
      map.set(dayKey, current);
    }
    return map;
  }, [meetings]);

  const days = useMemo(() => {
    const start = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const end = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    const offset = (start.getDay() + 6) % 7;
    const totalCells = Math.ceil((offset + end.getDate()) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(start);
      date.setDate(index - offset + 1);
      const dayKey = toDayKey(date);
      return {
        date,
        dayKey,
        inMonth: date.getMonth() === visibleMonth.getMonth(),
        meetings: meetingMap.get(dayKey) || [],
      };
    });
  }, [meetingMap, visibleMonth]);

  const activeDay = selectedDay || toDayKey(new Date());

  return (
    <div className="glass-panel rounded-[30px] p-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
          className="rounded-full border border-black/8 bg-white/80 p-2 text-[#5d5d5d]"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <p className="eyebrow text-center">Meeting calendar</p>
          <p className="display-title mt-2 text-2xl">{monthLabel(visibleMonth)}</p>
        </div>
        <button
          type="button"
          onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
          className="rounded-full border border-black/8 bg-white/80 p-2 text-[#5d5d5d]"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-[#8f6532]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const hasMeetings = day.meetings.length > 0;
          const active = day.dayKey === activeDay;

          return (
            <button
              key={day.dayKey}
              type="button"
              onClick={() => onSelectDay?.(day.dayKey)}
              className={cn(
                "min-h-[82px] rounded-[20px] border p-3 text-left transition",
                active
                  ? "border-[#c8a97e]/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(231,210,178,0.42))] shadow-[0_16px_28px_rgba(200,169,126,0.12)]"
                  : "border-black/8 bg-white/72 hover:border-[#c8a97e]/35",
                !day.inMonth && "opacity-45",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[#111111]">{day.date.getDate()}</span>
                {hasMeetings ? (
                  <span className="rounded-full bg-[#c8a97e] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                    {day.meetings.length}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 space-y-1">
                {day.meetings.slice(0, 2).map((meeting: Meeting) => (
                  <div key={meeting._id} className="truncate text-xs text-[#5d5d5d]">
                    {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {meeting.title}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
