"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

import { cx } from "@/features/atlascope/config/theme";
import { formatTimelineTime } from "@/features/atlascope/lib/incident-timeline";

type TimelineControlBarProps = {
  currentTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeChange: (timeMs: number) => void;
  onInteractionChange: (isInteracting: boolean) => void;
};

type TrackMetrics = {
  left: number;
  width: number;
  containerWidth: number;
};

export function TimelineControlBar({
  currentTimeMs,
  minTimeMs,
  maxTimeMs,
  isPlaying,
  onPlayPause,
  onTimeChange,
  onInteractionChange,
}: TimelineControlBarProps) {
  const bubbleWidth = 84;
  const bubbleSidePadding = 8;
  const bubbleArrowInset = 10;
  const thumbSafeInset = bubbleWidth / 2 + bubbleSidePadding;
  const range = Math.max(1, maxTimeMs - minTimeMs);
  const progress = (currentTimeMs - minTimeMs) / range;
  const [isScrubbing, setIsScrubbing] = useState(false);
  const sliderAreaRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackMetrics, setTrackMetrics] = useState<TrackMetrics>({
    left: 0,
    width: 0,
    containerWidth: 0,
  });
  const thumbX =
    trackMetrics.width > 0
      ? trackMetrics.left + trackMetrics.width * progress
      : thumbSafeInset;
  const bubbleLeft = Math.min(
    Math.max(thumbX - bubbleWidth / 2, bubbleSidePadding),
    Math.max(bubbleSidePadding, trackMetrics.containerWidth - bubbleWidth - bubbleSidePadding),
  );
  const bubbleStyle = {
    left: `${bubbleLeft}px`,
  } as const;
  const bubbleArrowX = Math.min(
    Math.max(thumbX - bubbleLeft, bubbleArrowInset),
    bubbleWidth - bubbleArrowInset,
  );
  const bubbleArrowStyle = {
    left: `${bubbleArrowX}px`,
  } as const;
  const fillWidth = Math.max(0, trackMetrics.width * progress);
  const updateTrackMetrics = useCallback(() => {
    const sliderArea = sliderAreaRef.current;
    const track = trackRef.current;

    if (!sliderArea || !track) {
      return;
    }

    const sliderRect = sliderArea.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();

    setTrackMetrics({
      containerWidth: sliderRect.width,
      left: trackRect.left - sliderRect.left,
      width: trackRect.width,
    });
  }, []);
  const updateTimeFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;

      if (!track) {
        return;
      }

      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const rawTime = minTimeMs + ratio * range;
      const steppedTime = Math.round(rawTime / 60_000) * 60_000;

      onTimeChange(Math.min(maxTimeMs, Math.max(minTimeMs, steppedTime)));
    },
    [maxTimeMs, minTimeMs, onTimeChange, range],
  );
  const startScrubbingAtClientX = useCallback(
    (clientX: number) => {
      setIsScrubbing(true);
      updateTimeFromClientX(clientX);
      sliderAreaRef.current?.focus();
    },
    [updateTimeFromClientX],
  );

  useEffect(() => {
    const sliderArea = sliderAreaRef.current;
    const track = trackRef.current;

    if (!sliderArea || !track) {
      return;
    }

    updateTrackMetrics();

    const observer = new ResizeObserver(() => {
      updateTrackMetrics();
    });

    observer.observe(sliderArea);
    observer.observe(track);

    return () => {
      observer.disconnect();
    };
  }, [updateTrackMetrics]);

  useEffect(() => {
    onInteractionChange(isScrubbing);
  }, [isScrubbing, onInteractionChange]);

  useEffect(
    () => () => {
      onInteractionChange(false);
    },
    [onInteractionChange],
  );

  const stepTimeline = useCallback(
    (deltaMs: number) => {
      onTimeChange(Math.min(maxTimeMs, Math.max(minTimeMs, currentTimeMs + deltaMs)));
    },
    [currentTimeMs, maxTimeMs, minTimeMs, onTimeChange],
  );

  return (
    <div className="pointer-events-auto flex w-full max-w-[820px] items-end gap-3 px-2 sm:px-0">
      <PlaybackButton isPlaying={isPlaying} onPlayPause={onPlayPause} />

      <div
        ref={sliderAreaRef}
        role="slider"
        tabIndex={0}
        aria-label="Playback timeline"
        aria-valuemin={minTimeMs}
        aria-valuemax={maxTimeMs}
        aria-valuenow={currentTimeMs}
        aria-valuetext={formatTimelineTime(currentTimeMs)}
        className="relative min-w-0 flex-1 cursor-pointer px-2 pb-2 pt-11 outline-none"
        style={{ touchAction: "none" }}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
          startScrubbingAtClientX(event.clientX);
        }}
        onPointerMove={(event) => {
          if (!isScrubbing) {
            return;
          }

          event.preventDefault();
          updateTimeFromClientX(event.clientX);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }

          setIsScrubbing(false);
        }}
        onPointerCancel={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }

          setIsScrubbing(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            stepTimeline(-60_000);
            return;
          }

          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            stepTimeline(60_000);
            return;
          }

          if (event.key === "Home") {
            event.preventDefault();
            onTimeChange(minTimeMs);
            return;
          }

          if (event.key === "End") {
            event.preventDefault();
            onTimeChange(maxTimeMs);
          }
        }}
      >
        <TimestampBubble
          currentTimeMs={currentTimeMs}
          bubbleStyle={bubbleStyle}
          bubbleArrowStyle={bubbleArrowStyle}
        />

        <TimelineTrack
          trackRef={trackRef}
          thumbSafeInset={thumbSafeInset}
          trackMetrics={trackMetrics}
          fillWidth={fillWidth}
          progress={progress}
        />
      </div>
    </div>
  );
}

function PlaybackButton({
  isPlaying,
  onPlayPause,
}: {
  isPlaying: boolean;
  onPlayPause: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPlayPause}
      aria-label={isPlaying ? "Pause timeline playback" : "Start timeline playback"}
      className={cx(
        "flex size-9 shrink-0 items-center justify-center rounded-full border border-atlas-card-border bg-atlas-panel/64 text-atlas-ink backdrop-blur-md transition-colors hover:bg-atlas-panel/78",
      )}
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}

function TimelineTrack({
  trackRef,
  thumbSafeInset,
  trackMetrics,
  fillWidth,
  progress,
}: {
  trackRef: RefObject<HTMLDivElement | null>;
  thumbSafeInset: number;
  trackMetrics: TrackMetrics;
  fillWidth: number;
  progress: number;
}) {
  return (
    <>
      <div
        ref={trackRef}
        className="absolute top-[48px] h-px rounded-full bg-atlas-ink/22"
        style={{
          left: `${thumbSafeInset}px`,
          right: `${thumbSafeInset}px`,
        }}
      />
      <div
        className="pointer-events-none absolute top-[48px] h-px rounded-full bg-atlas-primary"
        style={{
          left: `${trackMetrics.left}px`,
          width: `${fillWidth}px`,
          maxWidth: `${trackMetrics.width}px`,
        }}
      />
      <div
        className="pointer-events-none absolute top-[48px] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-atlas-primary bg-atlas-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--atlas-color-panel)_72%,transparent)]"
        style={{
          left: `${trackMetrics.left + trackMetrics.width * progress}px`,
        }}
      />
    </>
  );
}

function TimestampBubble({
  currentTimeMs,
  bubbleStyle,
  bubbleArrowStyle,
}: {
  currentTimeMs: number;
  bubbleStyle: Readonly<{ left: string }>;
  bubbleArrowStyle: Readonly<{ left: string }>;
}) {
  return (
    <div
      style={bubbleStyle}
      className="pointer-events-none absolute left-0 top-0 z-10"
    >
      <div className="relative flex h-7 w-[84px] items-center justify-center rounded-full border border-atlas-card-border bg-atlas-panel/78 px-2 text-center text-[10px] font-medium tracking-[0.08em] text-atlas-ink backdrop-blur-md">
        <span className="whitespace-nowrap leading-none">{formatTimelineTime(currentTimeMs)}</span>
        <span
          style={bubbleArrowStyle}
          className="absolute top-full size-2 -translate-x-1/2 -translate-y-[55%] rotate-45 border-b border-r border-atlas-card-border bg-atlas-panel/78"
        />
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <div className="ml-0.5 h-0 w-0 border-b-[5px] border-l-[8px] border-t-[5px] border-b-transparent border-l-current border-t-transparent" />
  );
}

function PauseIcon() {
  return (
    <div className="flex items-center gap-[3px]">
      <span className="h-3 w-px rounded-full bg-current" />
      <span className="h-3 w-px rounded-full bg-current" />
    </div>
  );
}
