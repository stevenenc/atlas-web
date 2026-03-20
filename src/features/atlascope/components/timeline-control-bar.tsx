"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { themeClasses, type ThemeMode } from "@/features/atlascope/config/theme";
import { formatTimelineTime } from "@/features/atlascope/lib/incident-timeline";

type TimelineControlBarProps = {
  currentTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  isPlaying: boolean;
  activeIncidentCount: number;
  trackedIncidentCount: number;
  currentDateLabel: string;
  onPlayPause: () => void;
  onTimeChange: (timeMs: number) => void;
  onInteractionChange: (isInteracting: boolean) => void;
};

export function TimelineControlBar({
  currentTimeMs,
  minTimeMs,
  maxTimeMs,
  isPlaying,
  activeIncidentCount,
  trackedIncidentCount,
  currentDateLabel,
  onPlayPause,
  onTimeChange,
  onInteractionChange,
  theme,
}: TimelineControlBarProps & { theme: ThemeMode }) {
  const bubbleWidth = 92;
  const bubbleSidePadding = 12;
  const bubbleArrowInset = 12;
  const thumbSafeInset = bubbleWidth / 2 + bubbleSidePadding;
  const range = Math.max(1, maxTimeMs - minTimeMs);
  const progress = (currentTimeMs - minTimeMs) / range;
  const [isScrubbing, setIsScrubbing] = useState(false);
  const sliderAreaRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackMetrics, setTrackMetrics] = useState({ left: 0, width: 0, containerWidth: 0 });
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
  const updateTimeFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const rawTime = minTimeMs + ratio * range;
    const steppedTime = Math.round(rawTime / 60_000) * 60_000;

    onTimeChange(Math.min(maxTimeMs, Math.max(minTimeMs, steppedTime)));
  }, [maxTimeMs, minTimeMs, onTimeChange, range]);
  const startScrubbingAtClientX = useCallback((clientX: number) => {
    setIsScrubbing(true);
    updateTimeFromClientX(clientX);
    sliderAreaRef.current?.focus();
  }, [updateTimeFromClientX]);

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

  useEffect(() => () => {
    onInteractionChange(false);
  }, [onInteractionChange]);
  const stepTimeline = useCallback((deltaMs: number) => {
    onTimeChange(Math.min(maxTimeMs, Math.max(minTimeMs, currentTimeMs + deltaMs)));
  }, [currentTimeMs, maxTimeMs, minTimeMs, onTimeChange]);

  return (
    <div
      className={themeClasses(theme, {
        dark:
          "pointer-events-auto w-full max-w-[840px] rounded-[28px] border border-white/10 bg-[rgba(10,15,19,0.72)] px-3 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-4",
        light:
          "pointer-events-auto w-full max-w-[840px] rounded-[28px] border border-[#3D464C]/12 bg-[rgba(244,247,248,0.74)] px-3 py-3 shadow-[0_18px_42px_rgba(68,79,88,0.16)] backdrop-blur-xl sm:px-4",
      })}
    >
      <div className="flex flex-col gap-2.5">
        <div
          ref={sliderAreaRef}
          role="slider"
          tabIndex={0}
          aria-label="Playback timeline"
          aria-valuemin={minTimeMs}
          aria-valuemax={maxTimeMs}
          aria-valuenow={currentTimeMs}
          aria-valuetext={formatTimelineTime(currentTimeMs)}
          className="relative -mx-3 -my-2 cursor-pointer px-3 pb-3 pt-12 outline-none sm:-mx-4 sm:px-4"
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
          <div
            style={bubbleStyle}
            className="pointer-events-none absolute left-0 top-0 z-10"
          >
            <div className="flex items-start pt-1">
              <div
                aria-hidden="true"
                className={themeClasses(theme, {
                  dark:
                    "relative flex h-[38px] w-[92px] items-center justify-center rounded-[16px] border border-[#7EDCFA]/35 bg-[#5BD3F5] px-2.5 text-center text-[8px] font-semibold tracking-[0.12em] text-[#08202B] uppercase shadow-[0_8px_20px_rgba(17,97,124,0.24)]",
                  light:
                    "relative flex h-[38px] w-[92px] items-center justify-center rounded-[16px] border border-[#4EBEDC]/28 bg-[#5BD3F5] px-2.5 text-center text-[8px] font-semibold tracking-[0.12em] text-[#08303D] uppercase shadow-[0_8px_18px_rgba(48,127,152,0.16)]",
                })}
              >
                <span className="whitespace-nowrap leading-none">{formatTimelineTime(currentTimeMs)}</span>
                <span
                  style={bubbleArrowStyle}
                  className="absolute top-full size-3 -translate-x-1/2 -translate-y-[70%] rotate-45 border-b border-r border-[#4EBEDC]/28 bg-[#5BD3F5]"
                />
              </div>
            </div>
          </div>

          <div
            ref={trackRef}
            className={themeClasses(theme, {
              dark: "absolute top-[52px] h-1.5 rounded-full bg-[#B9EAF8]/24",
              light: "absolute top-[52px] h-1.5 rounded-full bg-[#B9EAF8]/72",
            })}
            style={{
              left: `${thumbSafeInset}px`,
              right: `${thumbSafeInset}px`,
            }}
          />
          <div
            className="pointer-events-none absolute top-[52px] h-1.5 rounded-full bg-[#5BD3F5]"
            style={{
              left: `${trackMetrics.left}px`,
              width: `${fillWidth}px`,
              maxWidth: `${trackMetrics.width}px`,
            }}
          />
        </div>

        <div className="flex items-end justify-between gap-3">
          <button
            type="button"
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pause timeline playback" : "Start timeline playback"}
            className={themeClasses(theme, {
              dark:
                "flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/84 transition-colors duration-200 hover:bg-white/[0.1] hover:text-white",
              light:
                "flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#3D464C]/10 bg-white/70 text-[#233038] transition-colors duration-200 hover:bg-white hover:text-[#11191E]",
            })}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className="min-w-0 flex-1 text-right">
            <p
              className={themeClasses(theme, {
                dark: "text-[11px] font-semibold tracking-[0.16em] text-white/56 uppercase",
                light: "text-[11px] font-semibold tracking-[0.16em] text-[#53636C] uppercase",
              })}
            >
              {activeIncidentCount} active <span className="mx-1 text-current/60">•</span> {trackedIncidentCount} tracked
            </p>
            <p
              className={themeClasses(theme, {
                dark: "mt-1 text-sm font-medium text-white/82",
                light: "mt-1 text-sm font-medium text-[#223038]",
              })}
            >
              {currentDateLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="ml-0.5 size-4">
      <path d="M6.5 4.8a1 1 0 0 1 1.53-.85l7.04 4.7a1.6 1.6 0 0 1 0 2.7l-7.04 4.7a1 1 0 0 1-1.53-.84V4.8Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-4">
      <path d="M5.75 4.5A1.25 1.25 0 0 1 7 5.75v8.5A1.25 1.25 0 0 1 5.75 15.5h-.5A1.25 1.25 0 0 1 4 14.25v-8.5A1.25 1.25 0 0 1 5.25 4.5h.5Zm9 0A1.25 1.25 0 0 1 16 5.75v8.5a1.25 1.25 0 0 1-1.25 1.25h-.5A1.25 1.25 0 0 1 13 14.25v-8.5a1.25 1.25 0 0 1 1.25-1.25h.5Z" />
    </svg>
  );
}
