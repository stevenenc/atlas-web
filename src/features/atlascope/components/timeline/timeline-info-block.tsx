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
    <div className="pointer-events-none absolute left-8 top-8 z-30 max-w-[260px]">
      <div className="flex flex-col">
        <div className="inline-flex items-start gap-[3px]">
          <p
            className="text-[2.65rem] leading-[0.9] font-semibold tracking-[-0.055em] text-atlas-ink [text-shadow:0_1px_10px_rgba(255,255,255,0.18)]"
            style={{ fontFamily: '"Fraunces", var(--font-sans)' }}
          >
            AtlaScope
          </p>

          <span
            className="mt-[0.42rem] text-[13px] leading-none font-semibold text-atlas-ink [text-shadow:0_1px_10px_rgba(255,255,255,0.18)]"
            style={{ fontFamily: '"Fraunces", var(--font-sans)' }}
            aria-label="copyright"
          >
            ©
          </span>
        </div>

        <p
          className="mt-5 text-[1.18rem] leading-[1.1] font-medium tracking-[-0.02em] text-atlas-ink [text-shadow:0_1px_10px_rgba(255,255,255,0.14)]"
          style={{ fontFamily: '"Inter", var(--font-sans)' }}
        >
          {currentDateLabel}
        </p>

        <div
          className="mt-4 flex flex-col gap-[5px] text-[12px] leading-none uppercase tracking-[0.16em] text-atlas-ink/80 [text-shadow:0_1px_8px_rgba(255,255,255,0.1)]"
          style={{ fontFamily: '"IBM Plex Mono", var(--font-mono)' }}
        >
          <p>{trackedIncidentCount} Tracked</p>
          <p>{activeIncidentCount} Active</p>
        </div>
      </div>
    </div>
  );
}