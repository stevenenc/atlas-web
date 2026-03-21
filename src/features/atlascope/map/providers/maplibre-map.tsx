"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { type StyleSpecification } from "maplibre-gl";
import Map, {
  Layer,
  type MapLayerMouseEvent,
  type MapLayerTouchEvent,
  type MapRef,
  Source,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  atlascopeMapConfig,
  getMapStyle,
} from "@/features/atlascope/map/core/config";
import type { ThemeMode } from "@/features/atlascope/config/theme";
import {
  buildOperationalMapStyle,
  createOperationalThemeLayerUpdates,
  getOperationalFallbackStyle,
  loadBaseMapStyle,
} from "@/features/atlascope/map/style/style";
import type {
  MapStyleDefinition,
  VectorMapProvider,
} from "@/features/atlascope/map/core/provider";
import type {
  MapContainerProps,
  MapViewportState,
} from "@/features/atlascope/map/core/types";
import { createDetailLayerStyleUpdates } from "@/features/atlascope/map/layers/street-layers";
import {
  createDetailContextMaskLayer,
  createDetailContextMaskSourceData,
  createDraftGeofenceLayers,
  createDraftGeofenceLineSourceData,
  createDraftGeofencePointSourceData,
  createGeofenceLayers,
  createGeofenceSourceData,
} from "@/features/atlascope/map/providers/maplibre-layers";
import { MapLibreMarkerView } from "@/features/atlascope/map/providers/maplibre-marker";
import { createMapLibreProvider } from "@/features/atlascope/map/providers/maplibre-provider";

const DRAFT_POINT_LAYER_IDS = [
  "draft-geofence-points-hit-area",
  "draft-geofence-points",
] as const;
const DRAFT_POINT_POINTER_RADIUS = {
  mouse: 14,
  pen: 18,
  touch: 28,
} as const;

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

type DraftPointEvent = MapLayerMouseEvent | MapLayerTouchEvent;

function mercatorY(latitude: number) {
  const latitudeInRadians =
    (Math.max(Math.min(latitude, 85.05112878), -85.05112878) * Math.PI) / 180;

  return (
    (1 - Math.log(Math.tan(latitudeInRadians) + 1 / Math.cos(latitudeInRadians)) / Math.PI) /
    2
  );
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

function getPointerClientPosition(event: DraftPointEvent) {
  const originalEvent = event.originalEvent;

  if ("clientX" in originalEvent && "clientY" in originalEvent) {
    return {
      clientX: originalEvent.clientX,
      clientY: originalEvent.clientY,
    };
  }

  const touch = originalEvent.touches[0] ?? originalEvent.changedTouches[0];

  if (!touch) {
    return null;
  }

  return {
    clientX: touch.clientX,
    clientY: touch.clientY,
  };
}

export const MapLibreMap = memo(function MapLibreMap({
  markers,
  geofences,
  detailContext,
  drawingCoordinates,
  isDrawingGeofence,
  editingCoordinates,
  isEditingGeofence,
  isInteractionLocked = false,
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
  const mapProviderRef = useRef<VectorMapProvider | null>(null);
  const [initialMapStyle] = useState<StyleSpecification | string>(
    () => getOperationalFallbackStyle(theme) as StyleSpecification,
  );
  const trashTargetRef = useRef<HTMLDivElement | null>(null);
  const draggedPointIndexRef = useRef<number | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const suppressMapClickRef = useRef(false);
  const [baseMapStyle, setBaseMapStyle] = useState<MapStyleDefinition | null>(null);
  const [hasMapStyleError, setHasMapStyleError] = useState(false);
  const [verticalBoundsMinZoom, setVerticalBoundsMinZoom] = useState(
    atlascopeMapConfig.minZoom,
  );
  const [mapCursor, setMapCursor] = useState(
    isDrawingGeofence ? DRAWING_CURSOR : "default",
  );
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);
  const [isTrashTargetActive, setIsTrashTargetActive] = useState(false);
  const styleUrl = getMapStyle(theme);
  const hasAppliedOperationalStyleRef = useRef(false);
  const lastAppliedThemeRef = useRef<ThemeMode | null>(null);
  const appliedFocusFeatureIdsRef = useRef<string[]>([]);

  useEffect(() => {
    let isCancelled = false;

    void loadBaseMapStyle(String(styleUrl))
      .then((style) => {
        if (!isCancelled) {
          setBaseMapStyle(style);
          setHasMapStyleError(false);
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
  }, [styleUrl]);

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

  const mapStyle = useMemo<StyleSpecification | string>(() => {
    if (hasMapStyleError || !baseMapStyle) {
      return getOperationalFallbackStyle(theme) as StyleSpecification;
    }

    return buildOperationalMapStyle(baseMapStyle, theme) as StyleSpecification;
  }, [baseMapStyle, hasMapStyleError, theme]);
  const markCurrentThemeAsApplied = useCallback((isOperationalStyleApplied: boolean) => {
    hasAppliedOperationalStyleRef.current = isOperationalStyleApplied;
    lastAppliedThemeRef.current = theme;
  }, [theme]);

  const applyMapThemeStyle = useCallback(() => {
    const mapInstance = mapRef.current?.getMap();
    const container = containerRef.current;

    if (!mapInstance || !container) {
      return;
    }

    if (!mapProviderRef.current) {
      mapProviderRef.current = createMapLibreProvider(mapInstance);
      mapProviderRef.current.initializeMap(container, {
        style: mapStyle as string | MapStyleDefinition,
      });
      markCurrentThemeAsApplied(Boolean(baseMapStyle && !hasMapStyleError));
      return;
    }

    if (hasMapStyleError || !baseMapStyle) {
      mapProviderRef.current.updateStyle(getOperationalFallbackStyle(theme));
      markCurrentThemeAsApplied(false);
      return;
    }

    if (!hasAppliedOperationalStyleRef.current) {
      mapProviderRef.current.updateStyle(mapStyle as string | MapStyleDefinition);
      markCurrentThemeAsApplied(true);
      return;
    }

    if (lastAppliedThemeRef.current === theme) {
      return;
    }

    createOperationalThemeLayerUpdates(baseMapStyle, theme).forEach(
      ({ id, definition, style }) => {
        if (mapProviderRef.current?.hasLayer(id)) {
          mapProviderRef.current.updateLayerStyle(id, style);
          return;
        }

        mapProviderRef.current?.addLayer(definition);
      },
    );

    lastAppliedThemeRef.current = theme;
  }, [baseMapStyle, hasMapStyleError, mapStyle, markCurrentThemeAsApplied, theme]);
  const geofenceSourceData = useMemo(
    () => createGeofenceSourceData(geofences),
    [geofences],
  );
  const detailContextMaskSourceData = useMemo(
    () => createDetailContextMaskSourceData(detailContext.focusGeometry),
    [detailContext.focusGeometry],
  );
  const detailContextMaskLayer = useMemo(
    () => createDetailContextMaskLayer(theme),
    [theme],
  );
  const geofenceLayers = useMemo(() => createGeofenceLayers(theme), [theme]);
  const draftGeofenceLayers = useMemo(
    () => createDraftGeofenceLayers(theme),
    [theme],
  );
  const hasActiveGeofenceEdit = isDrawingGeofence || isEditingGeofence;
  const activeEditingCoordinates = isDrawingGeofence ? drawingCoordinates : editingCoordinates;
  const canDeleteDraggedPoint = isDrawingGeofence || activeEditingCoordinates.length > 3;
  const isDragSessionActive = hasActiveGeofenceEdit && isDraggingPoint;
  const isPanGestureEnabled = !hasActiveGeofenceEdit && !isInteractionLocked;
  const isZoomGestureEnabled = !isInteractionLocked;

  useEffect(() => {
    applyMapThemeStyle();
  }, [applyMapThemeStyle]);

  const applyDetailContextStyle = useCallback(() => {
    const mapInstance = mapRef.current?.getMap();

    if (
      !mapProviderRef.current ||
      !mapInstance ||
      hasMapStyleError ||
      !baseMapStyle ||
      !mapInstance.getSource(atlascopeMapConfig.basemap.vectorSourceId)
    ) {
      return;
    }

    createDetailLayerStyleUpdates(theme, detailContext).forEach(({ id, definition, style }) => {
      if (mapProviderRef.current?.hasLayer(id)) {
        mapProviderRef.current.updateLayerStyle(id, style);
        return;
      }

      mapProviderRef.current?.addLayer(definition);
    });
  }, [baseMapStyle, detailContext, hasMapStyleError, theme]);

  const applyFocusedGeofenceState = useCallback(() => {
    const mapInstance = mapRef.current?.getMap();

    if (
      !mapProviderRef.current ||
      !mapInstance ||
      !mapInstance.getSource("atlascope-geofences")
    ) {
      appliedFocusFeatureIdsRef.current = [];
      return;
    }

    const previousIds = new Set(appliedFocusFeatureIdsRef.current);
    const nextFocusIds =
      detailContext.focusFeatureIds.length > 0
        ? detailContext.focusFeatureIds
        : detailContext.focusFeatureId
          ? [detailContext.focusFeatureId]
          : [];
    const nextIds = new Set(nextFocusIds);

    previousIds.forEach((featureId) => {
      if (!nextIds.has(featureId)) {
        mapProviderRef.current?.removeFeatureState({
          source: "atlascope-geofences",
          id: featureId,
        });
      }
    });

    nextIds.forEach((featureId) => {
      mapProviderRef.current?.setFeatureState(
        {
          source: "atlascope-geofences",
          id: featureId,
        },
        {
          focused: true,
        },
      );
    });

    appliedFocusFeatureIdsRef.current = [...nextIds];
  }, [detailContext.focusFeatureId, detailContext.focusFeatureIds]);

  useEffect(() => {
    return () => {
      mapProviderRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    applyDetailContextStyle();
  }, [applyDetailContextStyle]);

  useEffect(() => {
    applyFocusedGeofenceState();
  }, [applyFocusedGeofenceState, geofences.length]);

  useEffect(() => {
    const focusedGeofenceCoordinates = detailContext.focusGeometry;

    if (!focusedGeofenceCoordinates?.length) {
      return;
    }

    const mapInstance = mapRef.current?.getMap();
    const container = containerRef.current;

    if (!mapInstance || !container) {
      return;
    }

    let minLongitude = focusedGeofenceCoordinates[0]?.longitude ?? 0;
    let maxLongitude = minLongitude;
    let minLatitude = focusedGeofenceCoordinates[0]?.latitude ?? 0;
    let maxLatitude = minLatitude;

    focusedGeofenceCoordinates.forEach((point) => {
      minLongitude = Math.min(minLongitude, point.longitude);
      maxLongitude = Math.max(maxLongitude, point.longitude);
      minLatitude = Math.min(minLatitude, point.latitude);
      maxLatitude = Math.max(maxLatitude, point.latitude);
    });

    const horizontalPadding = Math.round(container.clientWidth * 0.15);
    const verticalPadding = Math.round(container.clientHeight * 0.15);

    mapInstance.fitBounds(
      [
        [minLongitude, minLatitude],
        [maxLongitude, maxLatitude],
      ],
      {
        duration: 900,
        maxZoom: atlascopeMapConfig.maxZoom,
        padding: {
          top: verticalPadding,
          right: horizontalPadding,
          bottom: verticalPadding,
          left: horizontalPadding,
        },
      },
    );
  }, [detailContext.focusGeometry, detailContext.version]);

  useEffect(() => {
    if (!hasActiveGeofenceEdit) {
      draggedPointIndexRef.current = null;
      suppressMapClickRef.current = false;
      mapRef.current?.getMap().dragPan.enable();
      mapRef.current?.getCanvas().style.removeProperty("cursor");
    }
  }, [hasActiveGeofenceEdit]);

  useEffect(() => {
    const mapInstance = mapRef.current?.getMap();

    if (!mapInstance || hasActiveGeofenceEdit) {
      return;
    }

    if (isInteractionLocked) {
      mapInstance.dragPan.disable();
      return;
    }

    mapInstance.dragPan.enable();
  }, [hasActiveGeofenceEdit, isInteractionLocked]);

  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();

    if (!canvas) {
      return;
    }

    const nextCursor = hasActiveGeofenceEdit ? mapCursor : "default";

    if (nextCursor === "default") {
      canvas.style.removeProperty("cursor");
      return;
    }

    canvas.style.setProperty("cursor", nextCursor);
  }, [hasActiveGeofenceEdit, mapCursor]);

  function getDraftPointIndex(event: DraftPointEvent) {
    const matchingFeature = event.features?.find(
      (feature) =>
        feature.layer.id === "draft-geofence-points" ||
        feature.layer.id === "draft-geofence-points-hit-area",
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

  function getDraftPointIndexAtScreenPoint(
    clientX: number,
    clientY: number,
    pointerType: string,
  ) {
    const mapInstance = mapRef.current?.getMap();
    const canvas = mapRef.current?.getCanvas();

    if (!mapInstance || !canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return null;
    }

    const hitRadius =
      pointerType === "touch"
        ? DRAFT_POINT_POINTER_RADIUS.touch
        : pointerType === "pen"
          ? DRAFT_POINT_POINTER_RADIUS.pen
          : DRAFT_POINT_POINTER_RADIUS.mouse;
    const activeLayerIds = DRAFT_POINT_LAYER_IDS.filter((layerId) =>
      mapInstance.getLayer(layerId),
    );

    if (!activeLayerIds.length) {
      return null;
    }

    let features;

    try {
      features = mapInstance.queryRenderedFeatures(
        [
          [x - hitRadius, y - hitRadius],
          [x + hitRadius, y + hitRadius],
        ],
        {
          layers: activeLayerIds,
        },
      );
    } catch {
      return null;
    }

    const matchingFeature = features.find((feature) => {
      const layerId = feature.layer.id;

      return layerId === "draft-geofence-points" || layerId === "draft-geofence-points-hit-area";
    });
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

  function getCoordinatesFromClientPoint(clientX: number, clientY: number) {
    const mapInstance = mapRef.current?.getMap();
    const canvas = mapRef.current?.getCanvas();

    if (!mapInstance || !canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const lngLat = mapInstance.unproject([x, y]);

    return {
      longitude: lngLat.lng,
      latitude: lngLat.lat,
    };
  }

  function isPointerOverTrashTarget(event: DraftPointEvent) {
    const trashTarget = trashTargetRef.current;

    if (!trashTarget) {
      return false;
    }

    const pointerPosition = getPointerClientPosition(event);

    if (!pointerPosition) {
      return false;
    }

    const trashRect = trashTarget.getBoundingClientRect();
    const { clientX: pointerX, clientY: pointerY } = pointerPosition;

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

  const finishPointDrag = useCallback((shouldDeletePoint: boolean) => {
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
  }, [
    isDrawingGeofence,
    onDrawingCoordinateRemove,
    onEditingCoordinateRemove,
  ]);

  useEffect(() => {
    if (!isDragSessionActive) {
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
  }, [canDeleteDraggedPoint, finishPointDrag, isDragSessionActive]);

  useEffect(() => {
    if (!hasActiveGeofenceEdit) {
      dragPointerIdRef.current = null;
      return;
    }

    const canvas = mapRef.current?.getCanvas();

    if (!canvas) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const pointIndex = getDraftPointIndexAtScreenPoint(
        event.clientX,
        event.clientY,
        event.pointerType,
      );

      if (pointIndex === null) {
        return;
      }

      event.preventDefault();
      dragPointerIdRef.current = event.pointerId;
      draggedPointIndexRef.current = pointIndex;
      suppressMapClickRef.current = false;
      setIsDraggingPoint(true);
      setMapCursor("grabbing");
      canvas.setPointerCapture(event.pointerId);
      mapRef.current?.getMap().dragPan.disable();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (dragPointerIdRef.current !== event.pointerId) {
        return;
      }

      const draggedPointIndex = draggedPointIndexRef.current;

      if (draggedPointIndex === null) {
        return;
      }

      const coordinates = getCoordinatesFromClientPoint(event.clientX, event.clientY);

      if (!coordinates) {
        return;
      }

      event.preventDefault();
      suppressMapClickRef.current = true;
      setIsDraggingPoint(true);
      setIsTrashTargetActive(
        canDeleteDraggedPoint && isClientPointOverTrashTarget(event.clientX, event.clientY),
      );
      setMapCursor("grabbing");

      if (isDrawingGeofence) {
        onDrawingCoordinateUpdate(draggedPointIndex, coordinates);
      } else {
        onEditingCoordinateUpdate(draggedPointIndex, coordinates);
      }
    };

    const handlePointerFinish = (event: PointerEvent) => {
      if (dragPointerIdRef.current !== event.pointerId) {
        return;
      }

      event.preventDefault();

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      dragPointerIdRef.current = null;
      finishPointDrag(
        canDeleteDraggedPoint && isClientPointOverTrashTarget(event.clientX, event.clientY),
      );
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerFinish);
    canvas.addEventListener("pointercancel", handlePointerFinish);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerFinish);
      canvas.removeEventListener("pointercancel", handlePointerFinish);
    };
  }, [
    canDeleteDraggedPoint,
    finishPointDrag,
    hasActiveGeofenceEdit,
    isDrawingGeofence,
    onDrawingCoordinateUpdate,
    onEditingCoordinateUpdate,
  ]);

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

  function handleMapPointerMove(event: DraftPointEvent) {
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
        mapStyle={initialMapStyle}
        projection="globe"
        minZoom={verticalBoundsMinZoom}
        maxZoom={atlascopeMapConfig.maxZoom}
        interactiveLayerIds={
          hasActiveGeofenceEdit
            ? ["draft-geofence-points-hit-area", "draft-geofence-points"]
            : undefined
        }
        cursor={mapCursor}
        dragRotate={false}
        touchPitch={false}
        dragPan={isPanGestureEnabled}
        scrollZoom={isZoomGestureEnabled}
        doubleClickZoom={isZoomGestureEnabled}
        touchZoomRotate={isZoomGestureEnabled}
        renderWorldCopies
        attributionControl={false}
        onMove={(event) => onViewportChange(toViewportState(event))}
        onClick={handleMapClick}
        onMouseMove={handleMapPointerMove}
        onLoad={() => {
          applyMapThemeStyle();
          applyDetailContextStyle();
          applyFocusedGeofenceState();
        }}
        onStyleData={() => {
          applyDetailContextStyle();
          applyFocusedGeofenceState();
        }}
        onError={() => {
          if (!baseMapStyle) {
            setHasMapStyleError(true);
          }
        }}
      >
        {detailContext.mode === "geofence-focus" ? (
          <Source
            id="atlascope-detail-context-mask"
            type="geojson"
            data={detailContextMaskSourceData}
          >
            <Layer {...detailContextMaskLayer} />
          </Source>
        ) : null}
        {geofences.length ? (
          <Source
            id="atlascope-geofences"
            type="geojson"
            data={geofenceSourceData}
            promoteId="id"
          >
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
            <Layer {...draftGeofenceLayers[2]} />
          </Source>
        ) : null}
        {markers.map((marker) => (
          <MapLibreMarkerView
            key={marker.id}
            marker={marker}
            isVisible={activeLayers[marker.layerType]}
            isInteractive={!hasActiveGeofenceEdit}
            onClick={onMarkerClick}
          />
        ))}
      </Map>

      {hasActiveGeofenceEdit ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center">
          <div
            ref={trashTargetRef}
            className={`flex size-[72px] items-center justify-center rounded-atlas-compact border atlas-transition-quick ${
              isTrashTargetActive
                ? "scale-110 border-atlas-trash-active-border bg-atlas-trash-active text-atlas-trash-active-ink shadow-atlas-trash-active"
                : "border-atlas-trash-border bg-atlas-trash text-atlas-trash-ink shadow-atlas-trash"
            } ${isDraggingPoint ? "opacity-100" : "opacity-78"}`}
          >
            <TrashTargetIcon />
          </div>
        </div>
      ) : null}
    </div>
  );
});

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
