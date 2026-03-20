"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { themeClasses, type ThemeMode } from "@/features/atlascope/config/theme";
import {
  formatTimelineDateTime,
  formatTimelineTime,
} from "@/features/atlascope/lib/incident-timeline";

type TimelineControlBarProps = {
  currentTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  isPlaying: boolean;
  activeIncidentCount: number;
  onPlayPause: () => void;
  onTimeChange: (timeMs: number) => void;
};

export function TimelineControlBar({
  currentTimeMs,
  minTimeMs,
  maxTimeMs,
  isPlaying,
  activeIncidentCount,
  onPlayPause,
  onTimeChange,
  theme,
}: TimelineControlBarProps & { theme: ThemeMode }) {
  const bubbleWidth = 92;
  const trackInset = bubbleWidth / 2;
  const formattedTime = formatTimelineDateTime(currentTimeMs);
  const range = Math.max(1, maxTimeMs - minTimeMs);
  const progress = (currentTimeMs - minTimeMs) / range;
  const progressValue = String(Math.round(currentTimeMs));
  const [isScrubbing, setIsScrubbing] = useState(false);
  const sliderAreaRef = useRef<HTMLDivElement | null>(null);
  const [sliderAreaWidth, setSliderAreaWidth] = useState(0);
  const bubbleCenterX =
    sliderAreaWidth > 0
      ? bubbleWidth / 2 + (sliderAreaWidth - bubbleWidth) * progress
      : bubbleWidth / 2;
  const thumbOffsetStyle = {
    left: `${bubbleCenterX}px`,
  } as const;
  const updateTimeFromClientX = useCallback((clientX: number) => {
    const sliderArea = sliderAreaRef.current;

    if (!sliderArea) {
      return;
    }

    const rect = sliderArea.getBoundingClientRect();
    const nextProgress = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const rawTime = minTimeMs + nextProgress * range;
    const steppedTime = Math.round(rawTime / 60_000) * 60_000;

    onTimeChange(Math.min(maxTimeMs, Math.max(minTimeMs, steppedTime)));
  }, [maxTimeMs, minTimeMs, onTimeChange, range]);

  useEffect(() => {
    const sliderArea = sliderAreaRef.current;

    if (!sliderArea) {
      return;
    }

    const updateWidth = () => {
      setSliderAreaWidth(sliderArea.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(sliderArea);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isScrubbing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      updateTimeFromClientX(event.clientX);
    };
    const handlePointerUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isScrubbing, updateTimeFromClientX]);

  return (
    <div
      className={themeClasses(theme, {
        dark:
          "pointer-events-auto w-full max-w-[680px] rounded-[28px] border border-white/10 bg-[rgba(10,15,19,0.72)] px-3 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        light:
          "pointer-events-auto w-full max-w-[680px] rounded-[28px] border border-[#3D464C]/12 bg-[rgba(244,247,248,0.74)] px-3 py-3 shadow-[0_18px_42px_rgba(68,79,88,0.16)] backdrop-blur-xl",
      })}
    >
      <div className="flex items-center gap-2 sm:gap-3">
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

        <div className="min-w-0 shrink-0 sm:w-[150px]">
          <p
            className={themeClasses(theme, {
              dark: "text-[10px] font-semibold tracking-[0.22em] text-white/34 uppercase",
              light: "text-[10px] font-semibold tracking-[0.22em] text-[#66757D] uppercase",
            })}
          >
            Playback Time
          </p>
          <p
            className={themeClasses(theme, {
              dark: "mt-1 truncate text-sm font-semibold text-white/88",
              light: "mt-1 truncate text-sm font-semibold text-[#203039]",
            })}
          >
            {formattedTime}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div
            ref={sliderAreaRef}
            className="relative pb-3 pt-10"
            onPointerDown={(event) => {
              setIsScrubbing(true);
              updateTimeFromClientX(event.clientX);
            }}
          >
            <div
              style={thumbOffsetStyle}
              className="absolute top-0 z-10 -translate-x-1/2"
            >
              <button
                type="button"
                aria-label={`Drag timeline marker at ${formatTimelineTime(currentTimeMs)}`}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  setIsScrubbing(true);
                  updateTimeFromClientX(event.clientX);
                }}
                className={themeClasses(theme, {
                  dark:
                    "relative flex h-[38px] w-[92px] cursor-grab items-center justify-center rounded-[16px] border border-[#7EDCFA]/35 bg-[#5BD3F5] px-2.5 text-center text-[8px] font-semibold tracking-[0.12em] text-[#08202B] uppercase shadow-[0_8px_20px_rgba(17,97,124,0.24)] active:cursor-grabbing",
                  light:
                    "relative flex h-[38px] w-[92px] cursor-grab items-center justify-center rounded-[16px] border border-[#4EBEDC]/28 bg-[#5BD3F5] px-2.5 text-center text-[8px] font-semibold tracking-[0.12em] text-[#08303D] uppercase shadow-[0_8px_18px_rgba(48,127,152,0.16)] active:cursor-grabbing",
                })}
              >
                <span className="whitespace-nowrap leading-none">{formatTimelineTime(currentTimeMs)}</span>
                <span className="absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-[70%] rotate-45 border-b border-r border-[#4EBEDC]/28 bg-[#5BD3F5]" />
              </button>
            </div>

            <div
              className={themeClasses(theme, {
                dark: "absolute top-[50px] h-1 rounded-full bg-[#B9EAF8]/42",
                light: "absolute top-[50px] h-1 rounded-full bg-[#B9EAF8]/80",
              })}
              style={{
                left: `${trackInset}px`,
                right: `${trackInset}px`,
              }}
            />

            <input
              type="range"
              min={minTimeMs}
              max={maxTimeMs}
              step={60_000}
              value={progressValue}
              aria-label="Playback timeline"
              className="atlascope-timeline-slider absolute top-[42px]"
              style={{
                left: `${trackInset}px`,
                right: `${trackInset}px`,
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onChange={(event) => {
                onTimeChange(Number(event.currentTarget.value));
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-semibold tracking-[0.16em] uppercase">
            <span
              className={themeClasses(theme, {
                dark: "text-white/34",
                light: "text-[#6D7B83]",
              })}
            >
              {formatTimelineTime(minTimeMs)}
            </span>
            <span
              className={themeClasses(theme, {
                dark: "text-white/52",
                light: "text-[#53636C]",
              })}
            >
              {activeIncidentCount} active
            </span>
            <span
              className={themeClasses(theme, {
                dark: "text-white/34",
                light: "text-[#6D7B83]",
              })}
            >
              {formatTimelineTime(maxTimeMs)}
            </span>
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
