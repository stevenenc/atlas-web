"use client";

type TimelineInfoBlockProps = {
  currentDateLabel: string;
  trackedIncidentCount: number;
  activeIncidentCount: number;
};

export function TimelineInfoBlock({
  currentDateLabel,
  trackedIncidentCount,
  activeIncidentCount,
}: TimelineInfoBlockProps) {
  return (
    <div className="pointer-events-none absolute left-6 top-6 z-30 max-w-[200px]">
      <div className="inline-flex flex-col gap-1 rounded-[14px] border border-atlas-card-border bg-atlas-panel/50 px-3 py-2 backdrop-blur-md">
        <p className="text-[11px] font-medium tracking-[0.18em] text-atlas-ink/84 uppercase">
          AtlasScope (c)
        </p>
        <p className="text-sm text-atlas-ink">{currentDateLabel}</p>
        <p className="text-[11px] tracking-[0.16em] text-atlas-muted uppercase">
          {trackedIncidentCount} Tracked
        </p>
        <p className="text-[11px] tracking-[0.16em] text-atlas-muted uppercase">
          {activeIncidentCount} Active
        </p>
      </div>
    </div>
  );
}
