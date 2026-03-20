"use client";

import { Marker as MapLibreMarker } from "react-map-gl/maplibre";

import { atlasUi, getHazardTheme, cx } from "@/features/atlascope/config/theme";
import type { MapMarkerData } from "@/features/atlascope/map/core/types";

type MapLibreMarkerProps = {
  marker: MapMarkerData;
  isVisible: boolean;
  isInteractive: boolean;
  onClick: (marker: MapMarkerData) => void;
};

export function MapLibreMarkerView({
  marker,
  isVisible,
  isInteractive,
  onClick,
}: MapLibreMarkerProps) {
  const style = getHazardTheme(marker.layerType);
  const inactiveRingClass =
    "absolute left-1/2 top-1/2 size-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2";
  const activeRingClass =
    "absolute left-1/2 top-1/2 size-[22px] rounded-full border-2 atlascope-primary-marker-ring";
  const glowBaseClass =
    "absolute left-1/2 top-1/2 size-10 rounded-full";
  const activeGlowClass = `${glowBaseClass} atlascope-primary-marker-glow`;
  const inactiveGlowClass = `${glowBaseClass} -translate-x-1/2 -translate-y-1/2 opacity-45 blur-[10px]`;

  return (
    <MapLibreMarker
      longitude={marker.coordinates.longitude}
      latitude={marker.coordinates.latitude}
      anchor="center"
    >
      <button
        type="button"
        disabled={!isVisible || !isInteractive || !marker.isActive}
        aria-label={`${style.label} alert at ${marker.title}`}
        onClick={() => onClick(marker)}
        className={`group relative z-10 flex items-center justify-center transition-[opacity,transform,filter] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-20 focus-visible:z-20 focus-visible:outline-none ${
          isVisible
            ? isInteractive
              ? marker.isActive
                ? "opacity-100 blur-0 scale-100"
                : "pointer-events-none opacity-45 blur-0 scale-[0.92] saturate-50"
              : marker.isActive
                ? "pointer-events-none opacity-100 blur-0 scale-100"
                : "pointer-events-none opacity-45 blur-0 scale-[0.92] saturate-50"
            : "pointer-events-none opacity-0 blur-[1px] scale-75"
        }`}
      >
        <span
          className={`relative flex size-20 items-center justify-center ${
            marker.isActive ? "atlascope-primary-marker-breathe" : ""
          }`}
        >
          <span
            className={`${marker.isActive ? activeGlowClass : inactiveGlowClass} ${style.pulseClass}`}
            style={
              marker.isActive
                ? {
                    transform: "translate(-50%, -50%)",
                  }
                : undefined
            }
          />
          <span
            className={`absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border ${style.ringClass} opacity-80`}
          />
          <span
            className={`${marker.isActive ? activeRingClass : inactiveRingClass} ${style.ringClass} opacity-90 ${
              marker.isActive ? "atlascope-primary-marker-ring-a" : ""
            }`}
          />
          <span
            className={`${marker.isActive ? activeRingClass : inactiveRingClass} ${style.ringClass} opacity-90 ${
              marker.isActive ? "atlascope-primary-marker-ring-b" : ""
            }`}
          />
          <span className="relative block rounded-full border border-atlas-marker-border bg-atlas-marker-shell shadow-atlas-marker">
            <span
              className={`block size-3 rounded-full ${style.markerGlowClass} ${
                marker.isActive ? "atlascope-primary-marker-core" : "opacity-70"
              }`}
              style={{ backgroundColor: style.accent }}
            />
          </span>
        </span>
        <span
          className={cx(
            "pointer-events-none absolute left-1/2 top-full mt-3 w-max -translate-x-1/2 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.22em] uppercase opacity-0 atlas-transition-quick group-hover:opacity-100 group-focus-visible:opacity-100",
            atlasUi.surfaces.tooltip,
          )}
        >
          {marker.title}
        </span>
      </button>
    </MapLibreMarker>
  );
}
