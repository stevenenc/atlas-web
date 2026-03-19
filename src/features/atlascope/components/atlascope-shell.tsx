"use client";

import { useEffect, useRef, useState } from "react";

import { themeClasses, type ThemeMode } from "@/features/atlascope/config/theme";
import { incidents } from "@/features/atlascope/data/mock-incidents";
import type { Incident, IncidentType } from "@/features/atlascope/types/atlascope";

import { IncidentPanel } from "./incident-panel";
import { LayerPanel } from "./layer-panel";
import { MapView } from "./map-view";

const initialLayers: Record<IncidentType, boolean> = {
  earthquake: true,
  wildfire: true,
  air_quality: true,
};

export function AtlascopeShell() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [activeLayers, setActiveLayers] = useState(initialLayers);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const loadingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  function handleToggleLayer(layer: IncidentType) {
    setActiveLayers((current) => {
      const next = { ...current, [layer]: !current[layer] };

      if (selectedIncident && !next[selectedIncident.type]) {
        setSelectedIncident(null);
        setIsPanelLoading(false);
        if (loadingTimerRef.current) {
          window.clearTimeout(loadingTimerRef.current);
        }
      }

      return next;
    });
  }

  function handleSelectIncident(incident: Incident) {
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
    }

    setIsPanelLoading(true);
    loadingTimerRef.current = window.setTimeout(() => {
      setSelectedIncident(incident);
      setIsPanelLoading(false);
      loadingTimerRef.current = null;
    }, 320);
  }

  function handleClosePanel() {
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    setIsPanelLoading(false);
    setSelectedIncident(null);
  }

  return (
    <main
      className={themeClasses(theme, {
        dark: "relative min-h-screen overflow-hidden bg-[#262624] text-white transition-colors duration-500 ease-out",
        light:
          "relative min-h-screen overflow-hidden bg-[#F5E9CC] text-[#2B251C] transition-colors duration-500 ease-out",
      })}
    >
      <MapView
        incidents={incidents}
        activeLayers={activeLayers}
        selectedIncidentId={selectedIncident?.id ?? null}
        onSelectIncident={handleSelectIncident}
        theme={theme}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-4">
          <div
            className={themeClasses(theme, {
              dark:
                "pointer-events-auto flex w-full max-w-[780px] items-center gap-4 rounded-[32px] border border-white/10 bg-[rgba(63,63,59,0.92)] px-5 py-4 shadow-[0_28px_80px_rgba(0,0,0,0.36)] backdrop-blur-md transition-[background-color,border-color,color,box-shadow] duration-500 ease-out",
              light:
                "pointer-events-auto flex w-full max-w-[780px] items-center gap-4 rounded-[32px] border border-[#8B7A5E]/14 bg-[rgba(255,249,238,0.8)] px-5 py-4 shadow-[0_20px_70px_rgba(120,97,59,0.12)] backdrop-blur-xl transition-[background-color,border-color,color,box-shadow] duration-500 ease-out",
            })}
          >
            <div
              className={themeClasses(theme, {
                dark:
                  "flex size-11 items-center justify-center rounded-full border border-white/12 bg-[rgba(255,255,255,0.05)] text-white/72 transition-[background-color,border-color,color] duration-500 ease-out",
                light:
                  "flex size-11 items-center justify-center rounded-full border border-[#8B7A5E]/14 bg-white/65 text-[#7A6951] transition-[background-color,border-color,color] duration-500 ease-out",
              })}
            >
              <SearchIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={themeClasses(theme, {
                  dark:
                    "text-[11px] tracking-[0.32em] text-white/36 uppercase transition-colors duration-500 ease-out",
                  
                  light:
                    "text-[11px] tracking-[0.32em] text-[#8B7A5E] uppercase transition-colors duration-500 ease-out",
                })}
              >
                AtlaScope
              </p>
              <input
                readOnly
                value="Search hazards, regions, or alerts"
                className={themeClasses(theme, {
                  dark:
                    "mt-1 w-full bg-transparent text-sm text-white/84 outline-none placeholder:text-white/30 transition-colors duration-500 ease-out",
                  light:
                    "mt-1 w-full bg-transparent text-sm text-[#2B251C] outline-none placeholder:text-[#8B7A5E] transition-colors duration-500 ease-out",
                })}
              />
            </div>
          </div>

          <div
            className={themeClasses(theme, {
              dark:
                "pointer-events-auto flex items-center gap-3 rounded-[30px] border border-white/10 bg-[rgba(63,63,59,0.92)] p-2 shadow-[0_28px_80px_rgba(0,0,0,0.36)] backdrop-blur-md transition-[background-color,border-color,color,box-shadow] duration-500 ease-out",
              light:
                "pointer-events-auto flex items-center gap-3 rounded-[30px] border border-[#8B7A5E]/14 bg-[rgba(255,249,238,0.8)] p-2 shadow-[0_20px_70px_rgba(120,97,59,0.12)] backdrop-blur-xl transition-[background-color,border-color,color,box-shadow] duration-500 ease-out",
            })}
          >
            <button
              type="button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              className={themeClasses(theme, {
                dark:
                  "flex h-12 items-center gap-1 rounded-full border border-white/12 bg-[rgba(255,255,255,0.04)] p-1 text-white/76 transition-[background-color,border-color,color,box-shadow] duration-500 ease-out hover:bg-[rgba(255,255,255,0.08)] hover:text-white",
                light:
                  "flex h-12 items-center gap-1 rounded-full border border-[#8B7A5E]/14 bg-white/65 p-1 text-[#7A6951] transition-[background-color,border-color,color,box-shadow] duration-500 ease-out hover:bg-white/90 hover:text-[#2B251C]",
              })}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <span
                className={themeClasses(theme, {
                  dark:
                    "flex size-10 items-center justify-center rounded-full bg-[#F2F2EE] text-[#262624] transition-[background-color,color] duration-500 ease-out",
                  light:
                    "flex size-10 items-center justify-center rounded-full bg-[#2B251C] text-[#FFF7E7] transition-[background-color,color] duration-500 ease-out",
                })}
              >
                {theme === "dark" ? <MoonIcon /> : <SunIcon />}
              </span>
              <span className="pr-3 text-xs font-semibold uppercase tracking-[0.22em]">
                {theme}
              </span>
            </button>
            <button
              type="button"
              className={themeClasses(theme, {
                dark:
                  "flex size-12 items-center justify-center rounded-full border border-white/12 bg-[rgba(255,255,255,0.04)] text-white/70 transition-[background-color,border-color,color,box-shadow] duration-500 ease-out hover:bg-[rgba(255,255,255,0.08)] hover:text-white",
                light:
                  "flex size-12 items-center justify-center rounded-full border border-[#8B7A5E]/14 bg-white/65 text-[#7A6951] transition-[background-color,border-color,color,box-shadow] duration-500 ease-out hover:bg-white/90 hover:text-[#2B251C]",
              })}
              aria-label="Settings"
            >
              <SettingsIcon />
            </button>
            <button
              type="button"
              className={themeClasses(theme, {
                dark:
                  "flex items-center gap-3 rounded-full border border-white/12 bg-[rgba(255,255,255,0.04)] px-4 py-2.5 transition-[background-color,border-color,color,box-shadow] duration-500 ease-out hover:bg-[rgba(255,255,255,0.08)]",
                light:
                  "flex items-center gap-3 rounded-full border border-[#8B7A5E]/14 bg-white/65 px-4 py-2.5 transition-[background-color,border-color,color,box-shadow] duration-500 ease-out hover:bg-white/90",
              })}
            >
              <span
                className={themeClasses(theme, {
                  dark:
                    "flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7DAED2] to-[#5A89AF] text-xs font-semibold text-white transition-[background-image,color] duration-500 ease-out",
                  light:
                    "flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F5C54B] to-[#F97316] text-xs font-semibold text-[#2B251C] transition-[background-image,color] duration-500 ease-out",
                })}
              >
                AS
              </span>
              <span
                className={themeClasses(theme, {
                  dark: "pr-1 text-sm font-medium text-white/82 transition-colors duration-500 ease-out",
                  light: "pr-1 text-sm font-medium text-[#2B251C] transition-colors duration-500 ease-out",
                })}
              >
                Ops Desk
              </span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 top-28 flex items-start">
          <LayerPanel
            activeLayers={activeLayers}
            onToggle={handleToggleLayer}
            theme={theme}
          />
        </div>

        <div className="absolute bottom-6 right-6 top-28 flex items-start justify-end">
          <IncidentPanel
            incident={selectedIncident}
            isLoading={isPanelLoading}
            onClose={handleClosePanel}
            theme={theme}
          />
        </div>
      </div>
    </main>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current">
      <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current">
      <path
        d="M12 3.75v2.5m0 11.5v2.5m8.25-8.25h-2.5M6.25 12H3.75m14.084 5.834-1.768-1.768M7.934 7.934 6.166 6.166m11.668 0-1.768 1.768M7.934 16.066l-1.768 1.768"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.25" strokeWidth="1.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M14.5 3.5a8.5 8.5 0 1 0 6 14.5A9 9 0 0 1 14.5 3.5Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current">
      <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
      <path
        d="M12 2.75v2.5m0 13.5v2.5m9.25-9.25h-2.5M5.25 12h-2.5m15.29-6.29-1.77 1.77M7.48 16.52l-1.77 1.77m12.06 0-1.77-1.77M7.48 7.48 5.71 5.71"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
