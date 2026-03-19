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

const legend = [
  { label: "Earthquake", color: "bg-[#F97316]" },
  { label: "Wildfire", color: "bg-[#EF4444]" },
  { label: "Air Quality", color: "bg-[#EAB308]" },
];

const ActiveMapAdapter = resolveMapAdapter();

export function MapView({
  incidents,
  activeLayers,
  selectedIncidentId,
  onSelectIncident,
  theme,
}: MapViewProps) {
  const [viewport, setViewport] = useState(atlascopeMapConfig.defaultViewport);
  const visibleIncidents = incidents.filter((incident) => activeLayers[incident.type]);
  const markers: MapMarkerData[] = incidents.map((incident) => ({
    id: incident.id,
    title: incident.locationName,
    layerType: incident.type,
    coordinates: incident.coordinates,
  }));

  return (
    <div
      className={themeClasses(theme, {
        dark: "relative h-screen w-full overflow-hidden bg-[#2B2928]",
        light: "relative h-screen w-full overflow-hidden bg-[#F5E9CC]",
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
            dark: "absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.05),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(91,135,162,0.12),_transparent_24%),linear-gradient(180deg,_rgba(18,20,22,0.08)_0%,_rgba(18,20,22,0.18)_100%)]",
            light:
              "absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(226,189,104,0.12),_transparent_22%),linear-gradient(180deg,_rgba(255,248,236,0.06)_0%,_rgba(242,227,194,0.12)_100%)]",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:96px_96px] opacity-15",
            light:
              "absolute inset-0 bg-[linear-gradient(rgba(51,45,35,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(51,45,35,0.06)_1px,transparent_1px)] bg-[size:96px_96px] opacity-24",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(43,41,40,0.08)_48%,_rgba(28,27,26,0.28)_100%)]",
            light:
              "absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(245,233,204,0)_38%,_rgba(178,145,78,0.08)_100%)]",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark: "absolute inset-[8%] rounded-[42px] border border-[#87AEC4]/16 bg-[#7AA6C0]/3 shadow-[0_0_0_1px_rgba(122,166,192,0.08)]",
            light:
              "absolute inset-[9%] rounded-[42px] border border-[#8B7A5E]/10 bg-white/8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute inset-x-0 top-[14%] h-px bg-gradient-to-r from-transparent via-white/8 to-transparent",
            light:
              "absolute inset-x-0 top-[14%] h-px bg-gradient-to-r from-transparent via-[#6F624D]/16 to-transparent",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute left-[22%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/6 to-transparent",
            light:
              "absolute left-[22%] top-0 h-full w-px bg-gradient-to-b from-transparent via-[#6F624D]/14 to-transparent",
          })}
        />
        <div
          className={themeClasses(theme, {
            dark:
              "absolute right-[18%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/5 to-transparent",
            light:
              "absolute right-[18%] top-0 h-full w-px bg-gradient-to-b from-transparent via-[#6F624D]/12 to-transparent",
          })}
        />
      </div>

      <div
        className={themeClasses(theme, {
          dark:
            "absolute left-8 top-28 rounded-full border border-white/10 bg-[rgba(51,48,46,0.72)] px-4 py-2 text-[11px] tracking-[0.34em] text-white/58 uppercase backdrop-blur-md",
          light:
            "absolute left-8 top-28 rounded-full border border-[#8B7A5E]/14 bg-[rgba(255,249,238,0.82)] px-4 py-2 text-[11px] tracking-[0.34em] text-[#5E503B] uppercase backdrop-blur-md",
        })}
      >
        Regional Hazard View
      </div>

      <div
        className={themeClasses(theme, {
          dark:
            "absolute bottom-8 left-8 flex gap-2 rounded-full border border-white/10 bg-[rgba(51,48,46,0.72)] px-4 py-3 backdrop-blur-md",
          light:
            "absolute bottom-8 left-8 flex gap-2 rounded-full border border-[#8B7A5E]/14 bg-[rgba(255,249,238,0.82)] px-4 py-3 backdrop-blur-md",
        })}
      >
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${item.color}`} />
            <span
              className={themeClasses(theme, {
                dark: "text-xs text-white/58",
                
                light: "text-xs text-[#5E503B]",
              })}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div
        className={themeClasses(theme, {
          dark:
            "absolute bottom-8 right-8 rounded-[24px] border border-white/10 bg-[rgba(51,48,46,0.72)] px-4 py-3 text-right backdrop-blur-md",
          light:
            "absolute bottom-8 right-8 rounded-[24px] border border-[#8B7A5E]/14 bg-[rgba(255,249,238,0.82)] px-4 py-3 text-right backdrop-blur-md",
        })}
      >
        <p
          className={themeClasses(theme, {
            dark: "text-[10px] tracking-[0.28em] text-white/42 uppercase",
            
            light: "text-[10px] tracking-[0.28em] text-[#8B7A5E] uppercase",
          })}
        >
          Monitoring Window
        </p>
        <p
          className={themeClasses(theme, {
            dark: "mt-1 text-sm font-medium text-white/82",
            light: "mt-1 text-sm font-medium text-[#2B251C]",
          })}
      >
        {visibleIncidents.length} active mock incidents
        </p>
      </div>
    </div>
  );
}
