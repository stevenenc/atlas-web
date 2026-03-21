"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";
import { isIncidentActiveAtTime } from "@/features/atlascope/lib/incident-timeline";
import { resolveMapAdapter } from "@/features/atlascope/map/core/adapter";
import { atlascopeMapConfig } from "@/features/atlascope/map/core/config";
import type {
  MapDetailContext,
  MapGeofenceData,
  MapMarkerData,
} from "@/features/atlascope/map/core/types";
import { DETAIL_CONTEXT_TRANSITION_MS } from "@/features/atlascope/map/core/types";
import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";
import type { Incident, IncidentType } from "@/features/atlascope/types/atlascope";

type MapViewProps = {
  incidents: Incident[];
  geofences: AtlascopeGeofence[];
  focusedGeofenceId: number | null;
  focusedGeofenceNonce: number;
  drawingCoordinates: MapGeofenceData["coordinates"];
  editingCoordinates: MapGeofenceData["coordinates"];
  isDrawingGeofence: boolean;
  editingGeofenceId: number | null;
  isInteractionLocked: boolean;
  activeLayers: Record<IncidentType, boolean>;
  selectedIncidentId: string | null;
  selectedTimeMs: number;
  onSelectIncident: (incident: Incident) => void;
  onMapClick: (coordinates: MapGeofenceData["coordinates"][number]) => void;
  onDrawingCoordinateAddAt: (
    index: number,
    coordinates: MapGeofenceData["coordinates"][number],
  ) => void;
  onDrawingCoordinateUpdate: (
    index: number,
    coordinates: MapGeofenceData["coordinates"][number],
  ) => void;
  onDrawingCoordinateRemove: (index: number) => void;
  onEditingCoordinateAdd: (
    coordinates: MapGeofenceData["coordinates"][number],
  ) => void;
  onEditingCoordinateAddAt: (
    index: number,
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
  editingCoordinates,
  isDrawingGeofence,
  editingGeofenceId,
  isInteractionLocked,
  activeLayers,
  selectedIncidentId,
  selectedTimeMs,
  onSelectIncident,
  onMapClick,
  onDrawingCoordinateAddAt,
  onDrawingCoordinateUpdate,
  onDrawingCoordinateRemove,
  onEditingCoordinateAdd,
  onEditingCoordinateAddAt,
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
  const focusedGeofence = geofences.find((geofence) => geofence.id === focusedGeofenceId) ?? null;
  const [detailContextFocusGeometry, setDetailContextFocusGeometry] = useState<
    MapGeofenceData["coordinates"] | null
  >(() => focusedGeofence?.coordinates ?? null);
  const [detailContextVersion, setDetailContextVersion] = useState(
    () => (focusedGeofence ? focusedGeofenceNonce : 0),
  );
  const detailContextAnimationFrameRef = useRef<number | null>(null);
  const detailContextCleanupTimerRef = useRef<number | null>(null);
  const detailContext = useMemo<MapDetailContext>(
    () => ({
      mode: focusedGeofence ? "geofence-focus" : "overview",
      focusFeatureId: focusedGeofence ? String(focusedGeofence.id) : null,
      focusFeatureIds: focusedGeofence ? [String(focusedGeofence.id)] : [],
      focusGeometry: focusedGeofence?.coordinates ?? detailContextFocusGeometry,
      version: focusedGeofence ? focusedGeofenceNonce : detailContextVersion,
    }),
    [detailContextFocusGeometry, detailContextVersion, focusedGeofence, focusedGeofenceNonce],
  );
  const visibleGeofences: MapGeofenceData[] = useMemo(
    () =>
      geofences
        .filter((geofence) => geofence.isEnabled || geofence.id === editingGeofenceId)
        .map((geofence) => ({
          id: String(geofence.id),
          title: geofence.name,
          coordinates:
            geofence.id === editingGeofenceId ? editingCoordinates : geofence.coordinates,
        })),
    [editingCoordinates, editingGeofenceId, geofences],
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
  useEffect(() => {
    return () => {
      if (detailContextAnimationFrameRef.current) {
        window.cancelAnimationFrame(detailContextAnimationFrameRef.current);
      }

      if (detailContextCleanupTimerRef.current) {
        window.clearTimeout(detailContextCleanupTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (detailContextAnimationFrameRef.current) {
      window.cancelAnimationFrame(detailContextAnimationFrameRef.current);
      detailContextAnimationFrameRef.current = null;
    }

    if (detailContextCleanupTimerRef.current) {
      window.clearTimeout(detailContextCleanupTimerRef.current);
      detailContextCleanupTimerRef.current = null;
    }

    if (focusedGeofence) {
      detailContextAnimationFrameRef.current = window.requestAnimationFrame(() => {
        setDetailContextFocusGeometry(focusedGeofence.coordinates);
        setDetailContextVersion(focusedGeofenceNonce);
        detailContextAnimationFrameRef.current = null;
      });
      return;
    }

    if (!detailContextFocusGeometry) {
      detailContextAnimationFrameRef.current = window.requestAnimationFrame(() => {
        setDetailContextVersion(0);
        detailContextAnimationFrameRef.current = null;
      });
      return;
    }

    detailContextCleanupTimerRef.current = window.setTimeout(() => {
      setDetailContextFocusGeometry(null);
      setDetailContextVersion(0);
      detailContextCleanupTimerRef.current = null;
    }, DETAIL_CONTEXT_TRANSITION_MS);
  }, [detailContextFocusGeometry, focusedGeofence, focusedGeofenceNonce]);

  return (
    <div
      className="relative h-screen w-full overflow-hidden atlas-transition-theme"
      style={{ backgroundColor: mapTheme.overlays.containerSurface }}
    >
      <div className="absolute inset-0">
        <ActiveMapAdapter
          markers={markers}
          geofences={geofenceLayers}
          detailContext={detailContext}
          drawingCoordinates={drawingCoordinates}
          isDrawingGeofence={isDrawingGeofence}
          editingCoordinates={editingCoordinates}
          isEditingGeofence={editingGeofenceId !== null}
          isInteractionLocked={isInteractionLocked}
          activeLayers={activeLayers}
          selectedMarkerId={selectedIncidentId}
          viewport={viewport}
          theme={theme}
          onViewportChange={setViewport}
          onMapClick={onMapClick}
          onDrawingCoordinateAddAt={onDrawingCoordinateAddAt}
          onDrawingCoordinateUpdate={onDrawingCoordinateUpdate}
          onDrawingCoordinateRemove={onDrawingCoordinateRemove}
          onEditingCoordinateAdd={onEditingCoordinateAdd}
          onEditingCoordinateAddAt={onEditingCoordinateAddAt}
          onEditingCoordinateUpdate={onEditingCoordinateUpdate}
          onEditingCoordinateRemove={onEditingCoordinateRemove}
          onMarkerClick={(marker: MapMarkerData) => {
            if (isDrawingGeofence || editingGeofenceId !== null) {
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
