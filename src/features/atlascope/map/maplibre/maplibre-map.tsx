"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { type StyleSpecification } from "maplibre-gl";
import Map, {
  Layer,
  type MapLayerMouseEvent,
  type MapRef,
  Source,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  atlascopeMapConfig,
  buildDarkMapStyle,
  buildLightMapStyle,
  DEMO_TILE_STYLE_URL,
  getFallbackMapStyle,
} from "@/features/atlascope/map/map-config";
import type {
  MapContainerProps,
  MapViewportState,
} from "@/features/atlascope/map/map-types";
import {
  createDraftGeofenceLayers,
  createDraftGeofenceLineSourceData,
  createDraftGeofencePointSourceData,
  createGeofenceLayers,
  createGeofenceSourceData,
} from "@/features/atlascope/map/maplibre/maplibre-layers";
import { MapLibreMarkerView } from "@/features/atlascope/map/maplibre/maplibre-marker";

function toViewportState(event: ViewStateChangeEvent): MapViewportState {
  return {
    longitude: event.viewState.longitude,
    latitude: event.viewState.latitude,
    zoom: event.viewState.zoom,
    bearing: event.viewState.bearing,
    pitch: event.viewState.pitch,
  };
}

const NORWAY_TO_AUSTRALIA_BOUNDS = {
  northLatitude: 71.2,
  southLatitude: -43.7,
};

const DRAWING_CURSOR =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'28\' viewBox=\'0 0 28 28\' fill=\'none\'%3E%3Cpath d=\'M18.69 4.2a2.4 2.4 0 0 1 3.4 0l1.7 1.7a2.4 2.4 0 0 1 0 3.4l-11.2 11.2-4.94.72.72-4.94L18.69 4.2Z\' fill=\'%23111A1F\'/%3E%3Cpath d=\'M19.61 5.11a1.1 1.1 0 0 1 1.55 0l1.73 1.73a1.1 1.1 0 0 1 0 1.55L11.92 19.36l-2.86.42.42-2.86L19.61 5.11Z\' fill=\'%235BD3F5\' stroke=\'%23E7FBFF\' stroke-width=\'1.1\'/%3E%3Cpath d=\'M18.65 7.61l2.74 2.74\' stroke=\'%23E7FBFF\' stroke-width=\'1.1\' stroke-linecap=\'round\'/%3E%3C/svg%3E") 4 24, crosshair';

function mercatorY(latitude: number) {
  const latitudeInRadians = (Math.max(Math.min(latitude, 85.05112878), -85.05112878) * Math.PI) / 180;

  return (1 - Math.log(Math.tan(latitudeInRadians) + 1 / Math.cos(latitudeInRadians)) / Math.PI) / 2;
}

function getVerticalBoundsMinZoom(containerHeight: number) {
  if (!Number.isFinite(containerHeight) || containerHeight <= 0) {
    return atlascopeMapConfig.minZoom;
  }

  const verticalSpan =
    mercatorY(NORWAY_TO_AUSTRALIA_BOUNDS.southLatitude) -
    mercatorY(NORWAY_TO_AUSTRALIA_BOUNDS.northLatitude);

  return Math.max(
    atlascopeMapConfig.minZoom,
    Math.log2(containerHeight / (512 * verticalSpan)),
  );
}

export function MapLibreMap({
  markers,
  geofences,
  drawingCoordinates,
  isDrawingGeofence,
  editingCoordinates,
  isEditingGeofence,
  activeLayers,
  viewport,
  theme,
  onViewportChange,
  onMarkerClick,
  onMapClick,
  onDrawingCoordinateUpdate,
  onDrawingCoordinateRemove,
  onEditingCoordinateAdd,
  onEditingCoordinateUpdate,
  onEditingCoordinateRemove,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const trashTargetRef = useRef<HTMLDivElement | null>(null);
  const draggedPointIndexRef = useRef<number | null>(null);
  const suppressMapClickRef = useRef(false);
  const [baseMapStyle, setBaseMapStyle] = useState<StyleSpecification | null>(null);
  const [hasMapStyleError, setHasMapStyleError] = useState(false);
  const [verticalBoundsMinZoom, setVerticalBoundsMinZoom] = useState(
    atlascopeMapConfig.minZoom,
  );
  const [mapCursor, setMapCursor] = useState(
    isDrawingGeofence ? DRAWING_CURSOR : "default",
  );
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);
  const [isTrashTargetActive, setIsTrashTargetActive] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (baseMapStyle || hasMapStyleError) {
      return () => {
        isCancelled = true;
      };
    }

    void fetch(DEMO_TILE_STYLE_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load style: ${response.status}`);
        }

        const style = (await response.json()) as StyleSpecification;

        if (!isCancelled) {
          setBaseMapStyle(style);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setHasMapStyleError(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [baseMapStyle, hasMapStyleError]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateMinZoom = () => {
      setVerticalBoundsMinZoom(
        getVerticalBoundsMinZoom(container.clientHeight),
      );
    };

    updateMinZoom();

    const observer = new ResizeObserver(() => {
      updateMinZoom();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const mapStyle = useMemo(() => {
    if (hasMapStyleError) {
      return getFallbackMapStyle(theme) as StyleSpecification | string;
    }

    if (!baseMapStyle) {
      return getFallbackMapStyle(theme) as StyleSpecification | string;
    }

    return (theme === "dark"
      ? buildDarkMapStyle(baseMapStyle)
      : buildLightMapStyle(baseMapStyle)) as StyleSpecification | string;
  }, [baseMapStyle, hasMapStyleError, theme]);
  const geofenceSourceData = useMemo(
    () => createGeofenceSourceData(geofences),
    [geofences],
  );
  const geofenceLayers = useMemo(() => createGeofenceLayers(theme), [theme]);
  const draftGeofenceLayers = useMemo(
    () => createDraftGeofenceLayers(theme),
    [theme],
  );
  const hasActiveGeofenceEdit = isDrawingGeofence || isEditingGeofence;
  const activeEditingCoordinates = isDrawingGeofence ? drawingCoordinates : editingCoordinates;
  const canDeleteDraggedPoint = isDrawingGeofence || activeEditingCoordinates.length > 3;

  useEffect(() => {
    if (!hasActiveGeofenceEdit) {
      draggedPointIndexRef.current = null;
      suppressMapClickRef.current = false;
      setIsDraggingPoint(false);
      setIsTrashTargetActive(false);
      setMapCursor("default");
      mapRef.current?.getCanvas().style.removeProperty("cursor");
      return;
    }

    setMapCursor(DRAWING_CURSOR);
  }, [hasActiveGeofenceEdit]);

  useEffect(() => {
    mapRef.current?.getCanvas().style.setProperty("cursor", mapCursor);
  }, [mapCursor]);

  function getDraftPointIndex(event: MapLayerMouseEvent) {
    const matchingFeature = event.features?.find(
      (feature) => feature.layer.id === "draft-geofence-points",
    );
    const rawIndex = matchingFeature?.properties?.index;

    if (typeof rawIndex === "number") {
      return rawIndex;
    }

    if (typeof rawIndex === "string") {
      const parsedIndex = Number.parseInt(rawIndex, 10);

      return Number.isNaN(parsedIndex) ? null : parsedIndex;
    }

    return null;
  }

  function isPointerOverTrashTarget(event: MapLayerMouseEvent) {
    const trashTarget = trashTargetRef.current;

    if (!trashTarget) {
      return false;
    }

    const trashRect = trashTarget.getBoundingClientRect();
    const pointerX = event.originalEvent.clientX;
    const pointerY = event.originalEvent.clientY;

    return (
      pointerX >= trashRect.left &&
      pointerX <= trashRect.right &&
      pointerY >= trashRect.top &&
      pointerY <= trashRect.bottom
    );
  }

  function isClientPointOverTrashTarget(clientX: number, clientY: number) {
    const trashTarget = trashTargetRef.current;

    if (!trashTarget) {
      return false;
    }

    const trashRect = trashTarget.getBoundingClientRect();

    return (
      clientX >= trashRect.left &&
      clientX <= trashRect.right &&
      clientY >= trashRect.top &&
      clientY <= trashRect.bottom
    );
  }

  function finishPointDrag(shouldDeletePoint: boolean) {
    const draggedPointIndex = draggedPointIndexRef.current;

    if (draggedPointIndex === null) {
      return;
    }

    draggedPointIndexRef.current = null;
    setIsDraggingPoint(false);
    setIsTrashTargetActive(false);
    mapRef.current?.getMap().dragPan.enable();
    setMapCursor(DRAWING_CURSOR);

    if (!shouldDeletePoint) {
      return;
    }

    if (isDrawingGeofence) {
      onDrawingCoordinateRemove(draggedPointIndex);
      return;
    }

    onEditingCoordinateRemove(draggedPointIndex);
  }

  useEffect(() => {
    if (!isDraggingPoint) {
      return;
    }

    const handlePointerUp = (event: PointerEvent) => {
      finishPointDrag(
        canDeleteDraggedPoint && isClientPointOverTrashTarget(event.clientX, event.clientY),
      );
    };

    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [canDeleteDraggedPoint, isDraggingPoint, isDrawingGeofence]);

  function handleMapClick(event: MapLayerMouseEvent) {
    if (!hasActiveGeofenceEdit) {
      return;
    }

    if (suppressMapClickRef.current) {
      suppressMapClickRef.current = false;
      return;
    }

    if (getDraftPointIndex(event) !== null) {
      return;
    }

    const coordinates = {
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    };

    if (isDrawingGeofence) {
      onMapClick(coordinates);
      return;
    }

    onEditingCoordinateAdd(coordinates);
  }

  function handleMapMouseMove(event: MapLayerMouseEvent) {
    if (!hasActiveGeofenceEdit) {
      return;
    }

    const draggedPointIndex = draggedPointIndexRef.current;

    if (draggedPointIndex !== null) {
      suppressMapClickRef.current = true;
      setIsDraggingPoint(true);
      setIsTrashTargetActive(
        canDeleteDraggedPoint && isPointerOverTrashTarget(event),
      );
      setMapCursor("grabbing");
      const coordinates = {
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
      };

      if (isDrawingGeofence) {
        onDrawingCoordinateUpdate(draggedPointIndex, coordinates);
      } else {
        onEditingCoordinateUpdate(draggedPointIndex, coordinates);
      }
      return;
    }

    setMapCursor(getDraftPointIndex(event) !== null ? "grab" : DRAWING_CURSOR);
  }

  function handleMapMouseDown(event: MapLayerMouseEvent) {
    if (!hasActiveGeofenceEdit) {
      return;
    }

    const pointIndex = getDraftPointIndex(event);

    if (pointIndex === null) {
      return;
    }

    draggedPointIndexRef.current = pointIndex;
    suppressMapClickRef.current = false;
    setIsDraggingPoint(true);
    setMapCursor("grabbing");
    mapRef.current?.getMap().dragPan.disable();
  }

  function handleMapMouseUp(event: MapLayerMouseEvent) {
    if (draggedPointIndexRef.current === null) {
      return;
    }

    finishPointDrag(canDeleteDraggedPoint && isPointerOverTrashTarget(event));
  }

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${hasActiveGeofenceEdit ? "atlascope-geofence-drawing" : ""}`}
    >
      <Map
        ref={mapRef}
        {...viewport}
        reuseMaps
        mapLib={maplibregl}
        mapStyle={mapStyle}
        minZoom={verticalBoundsMinZoom}
        maxZoom={atlascopeMapConfig.maxZoom}
        interactiveLayerIds={hasActiveGeofenceEdit ? ["draft-geofence-points"] : undefined}
        cursor={mapCursor}
        dragRotate={false}
        touchPitch={false}
        renderWorldCopies
        attributionControl={false}
        doubleClickZoom={!hasActiveGeofenceEdit}
        onMove={(event) => onViewportChange(toViewportState(event))}
        onClick={handleMapClick}
        onMouseMove={handleMapMouseMove}
        onMouseDown={handleMapMouseDown}
        onMouseUp={handleMapMouseUp}
        onError={() => {
          setHasMapStyleError(true);
        }}
      >
        {geofences.length ? (
          <Source id="atlascope-geofences" type="geojson" data={geofenceSourceData}>
            {geofenceLayers.map((layer) => (
              <Layer key={layer.id} {...layer} />
            ))}
          </Source>
        ) : null}
        {hasActiveGeofenceEdit && activeEditingCoordinates.length >= 2 ? (
          <Source
            id="atlascope-draft-geofence-line"
            type="geojson"
            data={createDraftGeofenceLineSourceData(
              activeEditingCoordinates,
              isEditingGeofence,
            )}
          >
            <Layer {...draftGeofenceLayers[0]} />
          </Source>
        ) : null}
        {hasActiveGeofenceEdit && activeEditingCoordinates.length ? (
          <Source
            id="atlascope-draft-geofence-points"
            type="geojson"
            data={createDraftGeofencePointSourceData(activeEditingCoordinates)}
          >
            <Layer {...draftGeofenceLayers[1]} />
          </Source>
        ) : null}
        {markers.map((marker) => (
          <MapLibreMarkerView
            key={marker.id}
            marker={marker}
            isVisible={activeLayers[marker.layerType]}
            isInteractive={!hasActiveGeofenceEdit}
            onClick={onMarkerClick}
            theme={theme}
          />
        ))}
      </Map>

      {hasActiveGeofenceEdit ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <div
            ref={trashTargetRef}
            className={`flex size-[72px] items-center justify-center rounded-[28px] border transition-all duration-200 ${
              isTrashTargetActive
                ? theme === "dark"
                  ? "scale-110 border-[#FF7C66]/60 bg-[rgba(132,26,14,0.88)] text-[#FFD9D2] shadow-[0_18px_40px_rgba(132,26,14,0.36)]"
                  : "scale-110 border-[#D44A34]/34 bg-[rgba(160,34,12,0.92)] text-[#FFF1ED] shadow-[0_18px_40px_rgba(148,45,24,0.26)]"
                : theme === "dark"
                  ? "border-white/12 bg-[rgba(11,16,19,0.82)] text-white/62 shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
                  : "border-[#3D464C]/12 bg-[rgba(243,245,246,0.88)] text-[#5A6972] shadow-[0_18px_40px_rgba(68,79,88,0.16)]"
            } ${isDraggingPoint ? "opacity-100" : "opacity-78"}`}
          >
            <TrashTargetIcon />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TrashTargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
      <path
        d="M4.5 7h15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 4.5h6l1 2.5H8l1-2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M7 7h10v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 10v6M12 10v6M14 10v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
