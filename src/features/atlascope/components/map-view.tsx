"use client";

import { useState } from "react";

import { themeClasses } from "@/features/atlascope/config/theme";
import type { ThemeMode } from "@/features/atlascope/config/theme";
import { resolveMapAdapter } from "@/features/atlascope/map/map-adapter";
import { atlascopeMapConfig } from "@/features/atlascope/map/map-config";
import type { MapMarkerData } from "@/features/atlascope/map/map-types";
import type { Incident, IncidentType } from "@/features/atlascope/types/atlascope";

type MapViewProps = {
  incidents: Incident[];
  activeLayers: Record<IncidentType, boolean>;
  selectedIncidentId: string | null;
  onSelectIncident: (incident: Incident) => void;
  theme: ThemeMode;
};

const ActiveMapAdapter = resolveMapAdapter();

export function MapView({
  incidents,
  activeLayers,
  selectedIncidentId,
  onSelectIncident,
  theme,
}: MapViewProps) {
  const [viewport, setViewport] = useState(atlascopeMapConfig.defaultViewport);
  const markers: MapMarkerData[] = incidents.map((incident) => ({
    id: incident.id,
    title: incident.locationName,
    layerType: incident.type,
    coordinates: incident.coordinates,
    severity: incident.severity,
    ageMinutes: extractAgeMinutes(incident.timestamp),
  }));

  return (
    <div
      className={themeClasses(theme, {
        dark: "relative h-screen w-full overflow-hidden bg-[#12171A] transition-colors duration-500 ease-out",
        light: "relative h-screen w-full overflow-hidden bg-[#D9DEE0] transition-colors duration-500 ease-out",
      })}
    >
      <div className="absolute inset-0">
        <ActiveMapAdapter
          markers={markers}
          activeLayers={activeLayers}
          selectedMarkerId={selectedIncidentId}
          viewport={viewport}
          theme={theme}
          onViewportChange={setViewport}
          onMarkerClick={(marker: MapMarkerData) => {
            const incident = incidents.find((item) => item.id === marker.id);

            if (incident) {
              onSelectIncident(incident);
            }
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div
          className={themeClasses(theme, {
            dark:
              "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(111,136,150,0.12),_transparent_28%),linear-gradient(180deg,_rgba(7,10,12,0.08)_0%,_rgba(7,10,12,0.22)_58%,_rgba(7,10,12,0.48)_100%)]",
            light:
              "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.36),_transparent_28%),linear-gradient(180deg,_rgba(221,226,229,0.08)_0%,_rgba(205,212,215,0.16)_52%,_rgba(180,188,193,0.32)_100%)]",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:120px_120px] opacity-35",
            light:
              "absolute inset-0 bg-[linear-gradient(rgba(44,53,59,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(44,53,59,0.055)_1px,transparent_1px)] bg-[size:120px_120px] opacity-32",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute inset-x-0 top-[17%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent",
            light:
              "absolute inset-x-0 top-[17%] h-px bg-gradient-to-r from-transparent via-[#465158]/18 to-transparent",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute bottom-[18%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent",
            light:
              "absolute bottom-[18%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#465158]/16 to-transparent",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute left-[24%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/8 to-transparent",
            light:
              "absolute left-[24%] top-0 h-full w-px bg-gradient-to-b from-transparent via-[#465158]/16 to-transparent",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute right-[20%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/7 to-transparent",
            light:
              "absolute right-[20%] top-0 h-full w-px bg-gradient-to-b from-transparent via-[#465158]/14 to-transparent",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_42%,_rgba(5,8,10,0.14)_72%,_rgba(5,8,10,0.48)_100%)]",
            light:
              "absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_38%,_rgba(128,138,144,0.08)_72%,_rgba(96,106,112,0.2)_100%)]",
          })}
        />
      </div>
    </div>
  );
}

function extractAgeMinutes(timestamp: string) {
  const match = timestamp.match(/(\d+)/);

  if (!match) {
    return 60;
  }

  return Number.parseInt(match[1] ?? "60", 10);
}
