"use client";

import { Marker as MapLibreMarker } from "react-map-gl/maplibre";

import { themeClasses, type ThemeMode } from "@/features/atlascope/config/theme";
import type { MapMarkerData } from "@/features/atlascope/map/map-types";

const markerStyles = {
  earthquake: {
    core: "bg-[#F97316]",
    glow: "shadow-[0_0_22px_rgba(249,115,22,0.28)]",
    ring: "border-[#F97316]/38",
    pulse: "bg-[#F97316]/18",
    label: "Earthquake",
  },
  wildfire: {
    core: "bg-[#EF4444]",
    glow: "shadow-[0_0_24px_rgba(239,68,68,0.3)]",
    ring: "border-[#EF4444]/40",
    pulse: "bg-[#EF4444]/18",
    label: "Wildfire",
  },
  air_quality: {
    core: "bg-[#D8B11E]",
    glow: "shadow-[0_0_22px_rgba(216,177,30,0.24)]",
    ring: "border-[#D8B11E]/36",
    pulse: "bg-[#D8B11E]/16",
    label: "Air Quality",
  },
} satisfies Record<
  MapMarkerData["layerType"],
  { core: string; glow: string; ring: string; pulse: string; label: string }
>;

type MapLibreMarkerProps = {
  marker: MapMarkerData;
  onClick: (marker: MapMarkerData) => void;
  theme: ThemeMode;
};

export function MapLibreMarkerView({
  marker,
  onClick,
  theme,
}: MapLibreMarkerProps) {
  const style = markerStyles[marker.layerType];

  return (
    <MapLibreMarker
      longitude={marker.coordinates.longitude}
      latitude={marker.coordinates.latitude}
      anchor="center"
    >
      <button
        type="button"
        aria-label={`${style.label} alert at ${marker.title}`}
        onClick={() => onClick(marker)}
        className="group relative z-10 flex items-center justify-center transition-transform duration-200 hover:z-20 focus-visible:z-20 focus-visible:outline-none"
      >
        <span className="relative flex size-20 items-center justify-center atlascope-primary-marker-breathe">
          <span
            className={`atlascope-primary-marker-glow absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full ${style.pulse}`}
          />
          <span
            className={`absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border ${style.ring} opacity-80`}
          />
          <span
            className={`atlascope-primary-marker-ring atlascope-primary-marker-ring-a absolute left-1/2 top-1/2 size-[22px] rounded-full border-2 ${style.ring} opacity-90`}
          />
          <span
            className={`atlascope-primary-marker-ring atlascope-primary-marker-ring-b absolute left-1/2 top-1/2 size-[22px] rounded-full border-2 ${style.ring} opacity-90`}
          />
          <span
            className={themeClasses(theme, {
              dark:
                "relative block rounded-full border border-white/16 bg-[#0F1518]/86 shadow-[0_0_0_2px_rgba(15,21,24,0.28)]",
              light:
                "relative block rounded-full border border-[#2D3438]/12 bg-[rgba(241,244,245,0.94)] shadow-[0_0_0_2px_rgba(217,222,224,0.62)]",
            })}
          >
            <span
              className={`atlascope-primary-marker-core block size-3 rounded-full ${style.core} ${style.glow}`}
            />
          </span>
        </span>
        <span
          className={themeClasses(theme, {
            dark:
              "pointer-events-none absolute left-1/2 top-full mt-3 w-max -translate-x-1/2 rounded-sm border border-white/10 bg-[rgba(15,21,24,0.92)] px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.22em] text-white/76 uppercase opacity-0 shadow-[0_16px_36px_rgba(0,0,0,0.32)] backdrop-blur-md transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
            light:
              "pointer-events-none absolute left-1/2 top-full mt-3 w-max -translate-x-1/2 rounded-sm border border-[#2D3438]/12 bg-[rgba(246,248,248,0.96)] px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.22em] text-[#374045] uppercase opacity-0 shadow-[0_16px_36px_rgba(86,97,106,0.16)] backdrop-blur-md transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
          })}
        >
          {marker.title}
        </span>
      </button>
    </MapLibreMarker>
  );
}
