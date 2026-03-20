"use client";

import { useMemo, useState } from "react";

import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";
import { isIncidentActiveAtTime } from "@/features/atlascope/lib/incident-timeline";
import { resolveMapAdapter } from "@/features/atlascope/map/core/adapter";
import { atlascopeMapConfig } from "@/features/atlascope/map/core/config";
import type {
  MapGeofenceData,
  MapMarkerData,
} from "@/features/atlascope/map/core/types";
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
  const mapTheme = getMapTheme(theme);
  const [viewport, setViewport] = useState(() => atlascopeMapConfig.defaultViewport);
  const markers: MapMarkerData[] = useMemo(
    () =>
      incidents.map((incident) => ({
        id: incident.id,
        title: incident.locationName,
        layerType: incident.type,
        coordinates: incident.coordinates,
        severity: incident.severity,
        ageMinutes: extractAgeMinutes(incident.timestamp),
        isActive: isIncidentActiveAtTime(incident, selectedTimeMs),
      })),
    [incidents, selectedTimeMs],
  );
  const editingGeofence = geofences.find((geofence) => geofence.id === editingGeofenceId) ?? null;
  const focusedGeofence = geofences.find((geofence) => geofence.id === focusedGeofenceId) ?? null;
  const visibleGeofences: MapGeofenceData[] = useMemo(
    () =>
      geofences
        .filter((geofence) => geofence.isEnabled || geofence.id === editingGeofenceId)
        .map((geofence) => ({
          id: String(geofence.id),
          title: geofence.name,
          coordinates: geofence.coordinates,
        })),
    [editingGeofenceId, geofences],
  );
  const geofenceLayers = useMemo(
    () =>
      isDrawingGeofence && drawingCoordinates.length >= 3
        ? [
            ...visibleGeofences,
            {
              id: "draft-geofence",
              title: "Draft geofence",
              coordinates: drawingCoordinates,
            },
          ]
        : visibleGeofences,
    [drawingCoordinates, isDrawingGeofence, visibleGeofences],
  );

  return (
    <div
      className="relative h-screen w-full overflow-hidden atlas-transition-theme"
      style={{ backgroundColor: mapTheme.overlays.containerSurface }}
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
          className="absolute inset-0"
          style={{ backgroundImage: mapTheme.overlays.topGradient }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: mapTheme.overlays.vignette }}
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
