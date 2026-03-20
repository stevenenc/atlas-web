import type { Incident } from "@/features/atlascope/types/atlascope";

export type TimelineBounds = {
  startMs: number;
  endMs: number;
};

export function getTimelineBounds(incidents: Incident[]): TimelineBounds {
  const sortedTimes = incidents
    .flatMap((incident) => [Date.parse(incident.startTime), Date.parse(incident.endTime)])
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right);

  const startMs = sortedTimes[0] ?? Date.now();
  const endMs = sortedTimes[sortedTimes.length - 1] ?? startMs;

  return {
    startMs,
    endMs,
  };
}

export function isIncidentActiveAtTime(incident: Incident, selectedTimeMs: number) {
  const startMs = Date.parse(incident.startTime);
  const endMs = Date.parse(incident.endTime);

  return selectedTimeMs >= startMs && selectedTimeMs <= endMs;
}

export function clampTimelineTime(value: number, bounds: TimelineBounds) {
  return Math.min(bounds.endMs, Math.max(bounds.startMs, value));
}

export function formatTimelineTime(value: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export function formatTimelineDateTime(value: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export function formatTimelineDate(value: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function getTimelineHourMarks(startMs: number, endMs: number) {
  const marks: number[] = [];
  const startDate = new Date(startMs);
  const firstHourMark = new Date(startDate);

  firstHourMark.setMinutes(0, 0, 0);

  if (firstHourMark.getTime() < startMs) {
    firstHourMark.setHours(firstHourMark.getHours() + 1);
  }

  for (let time = firstHourMark.getTime(); time < endMs; time += 60 * 60 * 1000) {
    marks.push(time);
  }

  return marks;
}
