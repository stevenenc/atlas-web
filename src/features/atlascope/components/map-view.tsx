"use client";

import { useState } from "react";

import { themeClasses } from "@/features/atlascope/config/theme";
import type { ThemeMode } from "@/features/atlascope/config/theme";
import { isIncidentActiveAtTime } from "@/features/atlascope/lib/incident-timeline";
import { resolveMapAdapter } from "@/features/atlascope/map/map-adapter";
import { atlascopeMapConfig } from "@/features/atlascope/map/map-config";
import type { MapGeofenceData, MapMarkerData } from "@/features/atlascope/map/map-types";
import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";
import type { Incident, IncidentType } from "@/features/atlascope/types/atlascope";

type MapViewProps = {
  incidents: Incident[];
  geofences: AtlascopeGeofence[];
  focusedGeofenceId: number | null;
  focusedGeofenceNonce: number;
  drawingCoordinates: MapGeofenceData["coordinates"];
  isDrawingGeofence: boolean;
  editingGeofenceId: number | null;
  isInteractionLocked: boolean;
  activeLayers: Record<IncidentType, boolean>;
  selectedIncidentId: string | null;
  selectedTimeMs: number;
  onSelectIncident: (incident: Incident) => void;
  onMapClick: (coordinates: MapGeofenceData["coordinates"][number]) => void;
  onDrawingCoordinateUpdate: (
    index: number,
    coordinates: MapGeofenceData["coordinates"][number],
  ) => void;
  onDrawingCoordinateRemove: (index: number) => void;
  onEditingCoordinateAdd: (
    coordinates: MapGeofenceData["coordinates"][number],
  ) => void;
  onEditingCoordinateUpdate: (
    index: number,
    coordinates: MapGeofenceData["coordinates"][number],
  ) => void;
  onEditingCoordinateRemove: (index: number) => void;
  theme: ThemeMode;
};

const ActiveMapAdapter = resolveMapAdapter();

export function MapView({
  incidents,
  geofences,
  focusedGeofenceId,
  focusedGeofenceNonce,
  drawingCoordinates,
  isDrawingGeofence,
  editingGeofenceId,
  isInteractionLocked,
  activeLayers,
  selectedIncidentId,
  selectedTimeMs,
  onSelectIncident,
  onMapClick,
  onDrawingCoordinateUpdate,
  onDrawingCoordinateRemove,
  onEditingCoordinateAdd,
  onEditingCoordinateUpdate,
  onEditingCoordinateRemove,
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
    isActive: isIncidentActiveAtTime(incident, selectedTimeMs),
  }));
  const editingGeofence = geofences.find((geofence) => geofence.id === editingGeofenceId) ?? null;
  const focusedGeofence = geofences.find((geofence) => geofence.id === focusedGeofenceId) ?? null;
  const visibleGeofences: MapGeofenceData[] = geofences
    .filter((geofence) => geofence.isEnabled || geofence.id === editingGeofenceId)
    .map((geofence) => ({
      id: String(geofence.id),
      title: geofence.name,
      coordinates: geofence.coordinates,
    }));
  const geofenceLayers = isDrawingGeofence && drawingCoordinates.length >= 3
    ? [
        ...visibleGeofences,
        {
          id: "draft-geofence",
          title: "Draft geofence",
          coordinates: drawingCoordinates,
        },
      ]
    : visibleGeofences;

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
          geofences={geofenceLayers}
          focusedGeofenceCoordinates={focusedGeofence?.coordinates ?? null}
          focusedGeofenceNonce={focusedGeofenceNonce}
          drawingCoordinates={drawingCoordinates}
          isDrawingGeofence={isDrawingGeofence}
          editingCoordinates={editingGeofence?.coordinates ?? []}
          isEditingGeofence={editingGeofence !== null}
          isInteractionLocked={isInteractionLocked}
          activeLayers={activeLayers}
          selectedMarkerId={selectedIncidentId}
          viewport={viewport}
          theme={theme}
          onViewportChange={setViewport}
          onMapClick={onMapClick}
          onDrawingCoordinateUpdate={onDrawingCoordinateUpdate}
          onDrawingCoordinateRemove={onDrawingCoordinateRemove}
          onEditingCoordinateAdd={onEditingCoordinateAdd}
          onEditingCoordinateUpdate={onEditingCoordinateUpdate}
          onEditingCoordinateRemove={onEditingCoordinateRemove}
          onMarkerClick={(marker: MapMarkerData) => {
            if (isDrawingGeofence || editingGeofence !== null) {
              return;
            }

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
