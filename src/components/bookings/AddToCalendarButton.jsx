import React, { useMemo } from "react";
import { CalendarPlus, Globe, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

function pad(n) {
  return String(n).padStart(2, "0");
}

// Formats a Date into the compact UTC string Google Calendar expects.
function toGoogleDate(d, allDay) {
  if (allDay) {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
  }
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
    d.getUTCHours()
  )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

// Escapes reserved characters for iCalendar text fields.
function escapeICS(text = "") {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Lets a traveler save a confirmed tour or flight to their OWN personal
 * calendar (Google / Outlook / Apple via .ics). Fully client-side — no
 * connector required.
 *
 * Props:
 *  - title:       event title
 *  - description: event description
 *  - location:    event location
 *  - start:       ISO string or 'YYYY-MM-DD'
 *  - end:         ISO string or 'YYYY-MM-DD' (optional)
 *  - allDay:      boolean (default false)
 */
export default function AddToCalendarButton({
  title,
  description,
  location,
  start,
  end,
  allDay = false,
  className = "",
}) {
  const startDate = useMemo(() => (start ? new Date(start) : null), [start]);
  const endDate = useMemo(() => (end ? new Date(end) : null), [end]);

  const googleUrl = useMemo(() => {
    if (!startDate) return null;
    const params = new URLSearchParams();
    params.set("action", "TEMPLATE");
    params.set("text", title || "");
    const s = toGoogleDate(startDate, allDay);
    const e = endDate ? toGoogleDate(endDate, allDay) : s;
    params.set("dates", `${s}/${e}`);
    if (description) params.set("details", description);
    if (location) params.set("location", location);
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [startDate, endDate, title, description, location, allDay]);

  const outlookUrl = useMemo(() => {
    if (!startDate) return null;
    const params = new URLSearchParams();
    params.set("subject", title || "");
    params.set("startdt", startDate.toISOString());
    params.set("enddt", (endDate || startDate).toISOString());
    if (description) params.set("body", description);
    if (location) params.set("location", location);
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }, [startDate, endDate, title, description, location]);

  const icsContent = useMemo(() => {
    if (!startDate) return null;
    const fmt = (d) =>
      allDay
        ? `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`
        : `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
            d.getUTCDate()
          )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    const fallbackEnd = new Date(
      startDate.getTime() + (allDay ? 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000)
    );
    const endObj = endDate || fallbackEnd;
    const startLine = allDay
      ? `DTSTART;VALUE=DATE:${fmt(startDate)}`
      : `DTSTART:${fmt(startDate)}`;
    const endLine = allDay
      ? `DTEND;VALUE=DATE:${fmt(endObj)}`
      : `DTEND:${fmt(endObj)}`;
    const now = new Date();
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GC Travel & Tours//Booking//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${now.getTime()}-${Math.random().toString(36).slice(2)}@gctravelandtours.com`,
      `DTSTAMP:${fmt(now)}`,
      startLine,
      endLine,
      `SUMMARY:${escapeICS(title)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      `LOCATION:${escapeICS(location)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  }, [startDate, endDate, title, description, location, allDay]);

  const downloadICS = () => {
    if (!icsContent) return;
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "event")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!startDate) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <CalendarPlus className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4" /> Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4" /> Outlook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={downloadICS}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download .ics (Apple / others)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}