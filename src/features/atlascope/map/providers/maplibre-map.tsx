"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { type StyleSpecification } from "maplibre-gl";
import Map, {
  Layer,
  type MapLayerMouseEvent,
  type MapLayerTouchEvent,
  type MapRef,
  Source,
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
} from "@/features/atlascope/map/core/types";
import { createDetailLayerStyleUpdates } from "@/features/atlascope/map/layers/street-layers";
import { getFocusGeometryBounds } from "@/features/atlascope/map/lib/geojson";
import {
  canCloseFromPoint,
  isValidNextPoint,
} from "@/features/atlascope/map/lib/geofence-drawing";
import {
  createDetailContextMaskLayer,
  createDetailContextMaskSourceData,
  createDraftGeofenceLayers,
  createDraftGeofenceProjectedLineSourceData,
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
const DRAFT_LINE_DISTANCE_EPSILON = 0.01;
const DRAWING_CLOSE_THRESHOLD_PX = 18;
const DRAWING_POINT_PROXIMITY_THRESHOLD_PX = 14;
const EDGE_PAN_THRESHOLD_PX = 56;
const EDGE_PAN_MAX_SPEED_PX = 18;

type ScreenPoint = {
  x: number;
  y: number;
};

type DraftProjectedSegment = {
  start: MapContainerProps["drawingCoordinates"][number];
  end: MapContainerProps["drawingCoordinates"][number];
  status: "default" | "closing" | "invalid";
};

type EditingPreviewState = {
  hiddenSegmentIndex: number | null;
  projectedSegments: DraftProjectedSegment[];
  status: "default" | "invalid";
};

type MapCursorMode = "idle" | "grab" | "grabbing";

type EdgePanDirection = {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
  speedX: number;
  speedY: number;
};

type EdgePanCompassDirection =
  | "north"
  | "south"
  | "east"
  | "west"
  | "north-east"
  | "north-west"
  | "south-east"
  | "south-west";

const NORWAY_TO_AUSTRALIA_BOUNDS = {
  northLatitude: 71.2,
  southLatitude: -43.7,
};

const DRAWING_CURSOR =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'28\' viewBox=\'0 0 28 28\' fill=\'none\'%3E%3Cpath d=\'M18.69 4.2a2.4 2.4 0 0 1 3.4 0l1.7 1.7a2.4 2.4 0 0 1 0 3.4l-11.2 11.2-4.94.72.72-4.94L18.69 4.2Z\' fill=\'%23111A1F\'/%3E%3Cpath d=\'M19.61 5.11a1.1 1.1 0 0 1 1.55 0l1.73 1.73a1.1 1.1 0 0 1 0 1.55L11.92 19.36l-2.86.42.42-2.86L19.61 5.11Z\' fill=\'%235BD3F5\' stroke=\'%23E7FBFF\' stroke-width=\'1.1\'/%3E%3Cpath d=\'M18.65 7.61l2.74 2.74\' stroke=\'%23E7FBFF\' stroke-width=\'1.1\' stroke-linecap=\'round\'/%3E%3C/svg%3E") 4 24, crosshair';
const EDGE_PAN_CURSOR_ROTATIONS: Record<EdgePanCompassDirection, number> = {
  north: 90,
  south: -90,
  east: 180,
  west: 0,
  "north-east": 135,
  "north-west": 45,
  "south-east": -135,
  "south-west": -45,
};
const EDGE_PAN_CURSOR_COLORS: Record<ThemeMode, string> = {
  light: "#2F3B43",
  dark: "#DCEBF0",
};

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
  theme,
  onMarkerClick,
  onMapClick,
  onDrawingComplete,
  onDrawingCoordinateUpdate,
  onDrawingCoordinateRemove,
  onEditingCoordinateAdd,
  onEditingCoordinateAddAt,
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
  const middlePanPointerIdRef = useRef<number | null>(null);
  const middlePanLastPointRef = useRef<ScreenPoint | null>(null);
  const lastMouseClientPointRef = useRef<ScreenPoint | null>(null);
  const lastMousePointerTypeRef = useRef<string>("mouse");
  const suppressMapClickRef = useRef(false);
  const [baseMapStyle, setBaseMapStyle] = useState<MapStyleDefinition | null>(null);
  const [hasMapStyleError, setHasMapStyleError] = useState(false);
  const [verticalBoundsMinZoom, setVerticalBoundsMinZoom] = useState(
    atlascopeMapConfig.minZoom,
  );
  const [mapCursorMode, setMapCursorMode] = useState<MapCursorMode>("idle");
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);
  const [isTrashTargetActive, setIsTrashTargetActive] = useState(false);
  const [drawingHoverState, setDrawingHoverState] = useState<{
    coordinates: MapContainerProps["drawingCoordinates"][number];
    point: ScreenPoint;
  } | null>(null);
  const [drawingProjectedSegment, setDrawingProjectedSegment] =
    useState<DraftProjectedSegment | null>(null);
  const [editingPreviewState, setEditingPreviewState] = useState<EditingPreviewState | null>(
    null,
  );
  const [edgePanDirection, setEdgePanDirection] = useState<EdgePanDirection | null>(null);
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
    () => createDetailContextMaskLayer(theme, detailContext),
    [detailContext, theme],
  );
  const geofenceLayers = useMemo(() => createGeofenceLayers(theme), [theme]);
  const draftGeofenceLayers = useMemo(
    () => createDraftGeofenceLayers(theme),
    [theme],
  );
  const hasActiveGeofenceEdit = isDrawingGeofence || isEditingGeofence;
  const activeEditingCoordinates = isDrawingGeofence ? drawingCoordinates : editingCoordinates;
  const shouldCloseDraftPath = isEditingGeofence;
  const canCloseDrawingPolygon = useMemo(
    () => canCloseFromPoint(drawingCoordinates),
    [drawingCoordinates],
  );
  const drawingPreviewStatus = drawingProjectedSegment?.status ?? "default";
  const draftGeofenceLineSourceData = useMemo(
    () =>
      createDraftGeofenceLineSourceData(
        activeEditingCoordinates,
        shouldCloseDraftPath,
        isDrawingGeofence
          ? drawingPreviewStatus
          : editingPreviewState?.status === "invalid"
            ? "invalid"
            : "default",
        isDrawingGeofence ? null : editingPreviewState?.hiddenSegmentIndex ?? null,
      ),
    [
      activeEditingCoordinates,
      drawingPreviewStatus,
      editingPreviewState,
      isDrawingGeofence,
      shouldCloseDraftPath,
    ],
  );
  const draftGeofenceProjectedLineSourceData = useMemo(
    () =>
      createDraftGeofenceProjectedLineSourceData(
        isDrawingGeofence
          ? drawingProjectedSegment
            ? [drawingProjectedSegment]
            : []
          : editingPreviewState?.projectedSegments ?? [],
      ),
    [drawingProjectedSegment, editingPreviewState, isDrawingGeofence],
  );
  const [
    draftGeofenceConfirmedLineLayer,
    draftGeofenceProjectedLineLayer,
    draftGeofencePointsHitAreaLayer,
    draftGeofencePointsLayer,
  ] = draftGeofenceLayers;
  const canDeleteDraggedPoint = isDrawingGeofence || activeEditingCoordinates.length > 3;
  const isDragSessionActive = hasActiveGeofenceEdit && isDraggingPoint;
  const isPanGestureEnabled = !hasActiveGeofenceEdit && !isInteractionLocked;
  const isZoomGestureEnabled = !isInteractionLocked;
  const resolvedMapCursor = resolveMapCursor({
    edgePanDirection,
    hasActiveGeofenceEdit,
    isInteractionLocked,
    mode: mapCursorMode,
    theme,
  });
  const clearDraftHoverPreview = useCallback(() => {
    setDrawingHoverState(null);
    setDrawingProjectedSegment(null);
    setEditingPreviewState(null);
  }, []);
  const syncEdgePanDirectionFromClientPoint = useCallback(
    (clientX: number, clientY: number, pointerType: string, buttons: number) => {
      const container = containerRef.current;

      if (
        !container ||
        middlePanPointerIdRef.current !== null ||
        dragPointerIdRef.current !== null ||
        isInteractionLocked ||
        pointerType !== "mouse" ||
        buttons !== 0
      ) {
        setEdgePanDirection(null);
        return;
      }

      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        setEdgePanDirection(null);
        return;
      }

      const leftDistance = x;
      const rightDistance = rect.width - x;
      const topDistance = y;
      const bottomDistance = rect.height - y;
      const horizontalDirection =
        leftDistance <= EDGE_PAN_THRESHOLD_PX
          ? -1
          : rightDistance <= EDGE_PAN_THRESHOLD_PX
            ? 1
            : 0;
      const verticalDirection =
        topDistance <= EDGE_PAN_THRESHOLD_PX
          ? -1
          : bottomDistance <= EDGE_PAN_THRESHOLD_PX
            ? 1
            : 0;

      if (horizontalDirection === 0 && verticalDirection === 0) {
        setEdgePanDirection(null);
        return;
      }

      const horizontalDistance =
        horizontalDirection === -1
          ? leftDistance
          : horizontalDirection === 1
            ? rightDistance
            : EDGE_PAN_THRESHOLD_PX;
      const verticalDistance =
        verticalDirection === -1
          ? topDistance
          : verticalDirection === 1
            ? bottomDistance
            : EDGE_PAN_THRESHOLD_PX;

      setEdgePanDirection({
        x: horizontalDirection,
        y: verticalDirection,
        speedX:
          horizontalDirection === 0
            ? 0
            : getEdgePanSpeed(horizontalDistance, EDGE_PAN_THRESHOLD_PX),
        speedY:
          verticalDirection === 0
            ? 0
            : getEdgePanSpeed(verticalDistance, EDGE_PAN_THRESHOLD_PX),
      });
    },
    [isInteractionLocked],
  );

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
    const focusedGeofenceGeometry = detailContext.focusGeometry;

    if (!focusedGeofenceGeometry) {
      return;
    }

    const mapInstance = mapRef.current?.getMap();
    const container = containerRef.current;

    if (!mapInstance || !container) {
      return;
    }

    const bounds = getFocusGeometryBounds(focusedGeofenceGeometry);

    if (!bounds) {
      return;
    }

    const horizontalPadding = Math.round(container.clientWidth * 0.15);
    const verticalPadding = Math.round(container.clientHeight * 0.15);

    mapInstance.fitBounds(
      [
        [bounds.minLongitude, bounds.minLatitude],
        [bounds.maxLongitude, bounds.maxLatitude],
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
      middlePanPointerIdRef.current = null;
      middlePanLastPointRef.current = null;
      suppressMapClickRef.current = false;
      clearDraftHoverPreview();
      mapRef.current?.getMap().dragPan.enable();
      mapRef.current?.getCanvas().style.removeProperty("cursor");
    }
  }, [clearDraftHoverPreview, hasActiveGeofenceEdit]);

  const resolveDrawingProjectedSegment = useCallback(
    (
      nextHoverState: {
        coordinates: MapContainerProps["drawingCoordinates"][number];
        point: ScreenPoint;
      } | null,
    ): DraftProjectedSegment | null => {
      if (
        !isDrawingGeofence ||
        !drawingCoordinates.length ||
        !nextHoverState ||
        draggedPointIndexRef.current !== null
      ) {
        return null;
      }

      const mapInstance = mapRef.current?.getMap();
      const firstPoint = drawingCoordinates[0];
      const lastPoint = drawingCoordinates[drawingCoordinates.length - 1];

      if (!mapInstance || !firstPoint || !lastPoint) {
        return null;
      }

      const firstPointScreen = mapInstance.project([firstPoint.longitude, firstPoint.latitude]);
      const isNearFirstPoint =
        drawingCoordinates.length >= 3 &&
        getDistanceToPoint(nextHoverState.point, firstPointScreen) <=
          DRAWING_CLOSE_THRESHOLD_PX;

      if (isNearFirstPoint && canCloseDrawingPolygon) {
        return {
          start: lastPoint,
          end: firstPoint,
          status: "closing",
        };
      }

      if (isNearFirstPoint) {
        return null;
      }

      const nearestExistingPoint = drawingCoordinates.find((point) => {
        const pointScreen = mapInstance.project([point.longitude, point.latitude]);

        return (
          getDistanceToPoint(nextHoverState.point, pointScreen) <=
          DRAWING_POINT_PROXIMITY_THRESHOLD_PX
        );
      });

      if (nearestExistingPoint) {
        return null;
      }

      if (!isValidNextPoint(drawingCoordinates, nextHoverState.coordinates)) {
        return {
          start: lastPoint,
          end: nextHoverState.coordinates,
          status: "invalid",
        };
      }

      return {
        start: lastPoint,
        end: nextHoverState.coordinates,
        status: "default",
      };
    },
    [canCloseDrawingPolygon, drawingCoordinates, isDrawingGeofence],
  );

  useEffect(() => {
    setDrawingProjectedSegment(resolveDrawingProjectedSegment(drawingHoverState));
  }, [drawingHoverState, resolveDrawingProjectedSegment]);

  const getNearestDraftLineSegmentIndexFromScreenPoint = useCallback(
    (pointer: ScreenPoint) => {
      if (activeEditingCoordinates.length < 2) {
        return null;
      }

      const segmentCount =
        shouldCloseDraftPath && activeEditingCoordinates.length >= 3
          ? activeEditingCoordinates.length
          : activeEditingCoordinates.length - 1;
      let nearestSegmentIndex: number | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;
      let nearestMidpointDistance = Number.POSITIVE_INFINITY;

      const mapInstance = mapRef.current?.getMap();

      if (!mapInstance) {
        return null;
      }

      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
        const segmentPoints = getDraftSegmentScreenPoints(
          mapInstance,
          activeEditingCoordinates,
          segmentIndex,
          shouldCloseDraftPath,
        );

        if (!segmentPoints) {
          continue;
        }

        const distance = getDistanceToSegment(pointer, segmentPoints.start, segmentPoints.end);
        const midpointDistance = getDistanceToPoint(
          pointer,
          getSegmentMidpoint(segmentPoints.start, segmentPoints.end),
        );

        if (
          distance < nearestDistance - DRAFT_LINE_DISTANCE_EPSILON ||
          (Math.abs(distance - nearestDistance) <= DRAFT_LINE_DISTANCE_EPSILON &&
            midpointDistance < nearestMidpointDistance)
        ) {
          nearestSegmentIndex = segmentIndex;
          nearestDistance = distance;
          nearestMidpointDistance = midpointDistance;
        }
      }

      return nearestSegmentIndex;
    },
    [activeEditingCoordinates, shouldCloseDraftPath],
  );
  const getDraftPointIndexAtScreenPoint = useCallback(
    (clientX: number, clientY: number, pointerType: string) => {
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
    },
    [],
  );
  const getCoordinatesFromClientPoint = useCallback((clientX: number, clientY: number) => {
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
  }, []);

  const resolveEditingPreviewState = useCallback(
    (
      hoverState: {
        coordinates: MapContainerProps["editingCoordinates"][number];
        point: ScreenPoint;
      } | null,
      hoveredPointIndex: number | null,
    ) => {
      if (
        isDrawingGeofence ||
        !hoverState ||
        hoveredPointIndex !== null ||
        activeEditingCoordinates.length < 2
      ) {
        return null;
      }

      const segmentIndex = getNearestDraftLineSegmentIndexFromScreenPoint(hoverState.point);

      if (segmentIndex === null) {
        return null;
      }

      const startPoint = activeEditingCoordinates[segmentIndex];
      const endIndex =
        segmentIndex + 1 < activeEditingCoordinates.length
          ? segmentIndex + 1
          : shouldCloseDraftPath && activeEditingCoordinates.length >= 3
            ? 0
            : null;
      const endPoint = endIndex === null ? null : activeEditingCoordinates[endIndex];

      if (!startPoint || !endPoint) {
        return null;
      }

      const nextCoordinates = [
        ...activeEditingCoordinates.slice(0, segmentIndex + 1),
        hoverState.coordinates,
        ...activeEditingCoordinates.slice(segmentIndex + 1),
      ];
      const isValidInsertion = canCloseFromPoint(nextCoordinates);

      if (!isValidInsertion) {
        return {
          hiddenSegmentIndex: null,
          projectedSegments: [],
          status: "invalid" as const,
        };
      }

      return {
        hiddenSegmentIndex: segmentIndex,
        projectedSegments: [
          {
            start: startPoint,
            end: hoverState.coordinates,
            status: "default" as const,
          },
          {
            start: hoverState.coordinates,
            end: endPoint,
            status: "default" as const,
          },
        ],
        status: "default" as const,
      };
    },
    [
      activeEditingCoordinates,
      getNearestDraftLineSegmentIndexFromScreenPoint,
      isDrawingGeofence,
      shouldCloseDraftPath,
    ],
  );

  const updateHoverPreview = useCallback(
    (
      hoverState: {
        coordinates: MapContainerProps["drawingCoordinates"][number];
        point: ScreenPoint;
      } | null,
      hoveredPointIndex: number | null,
    ) => {
      if (!hasActiveGeofenceEdit || draggedPointIndexRef.current !== null) {
        return;
      }

      const projectedSegment = isDrawingGeofence
        ? resolveDrawingProjectedSegment(hoverState)
        : null;
      const nextEditingPreviewState = isDrawingGeofence
        ? null
        : resolveEditingPreviewState(hoverState, hoveredPointIndex);

      if (isDrawingGeofence) {
        setDrawingHoverState(hoverState);
        setDrawingProjectedSegment(projectedSegment);
        setEditingPreviewState(null);
      } else {
        setEditingPreviewState(nextEditingPreviewState);
      }

      const isCloseCompletionHover =
        hoveredPointIndex === 0 && projectedSegment?.status === "closing";

      setMapCursorMode(
        hoveredPointIndex !== null && !isCloseCompletionHover ? "grab" : "idle",
      );
    },
    [
      hasActiveGeofenceEdit,
      isDrawingGeofence,
      resolveDrawingProjectedSegment,
      resolveEditingPreviewState,
    ],
  );
  const syncDraftHoverPreviewFromClientPoint = useCallback(
    (clientX: number, clientY: number, pointerType: string) => {
      if (!hasActiveGeofenceEdit || draggedPointIndexRef.current !== null) {
        return;
      }

      const coordinates = getCoordinatesFromClientPoint(clientX, clientY);
      const canvas = mapRef.current?.getCanvas();

      if (!coordinates || !canvas) {
        clearDraftHoverPreview();
        return;
      }

      const rect = canvas.getBoundingClientRect();

      updateHoverPreview(
        {
          coordinates,
          point: {
            x: clientX - rect.left,
            y: clientY - rect.top,
          },
        },
        getDraftPointIndexAtScreenPoint(clientX, clientY, pointerType),
      );
    },
    [
      clearDraftHoverPreview,
      getCoordinatesFromClientPoint,
      getDraftPointIndexAtScreenPoint,
      hasActiveGeofenceEdit,
      updateHoverPreview,
    ],
  );
  const restorePointerDrivenPreviewState = useCallback(() => {
    const container = containerRef.current;
    const lastMouseClientPoint = lastMouseClientPointRef.current;

    if (!container || !lastMouseClientPoint || !container.matches(":hover")) {
      return;
    }

    const pointerType = lastMousePointerTypeRef.current;

    syncEdgePanDirectionFromClientPoint(
      lastMouseClientPoint.x,
      lastMouseClientPoint.y,
      pointerType,
      0,
    );
    syncDraftHoverPreviewFromClientPoint(
      lastMouseClientPoint.x,
      lastMouseClientPoint.y,
      pointerType,
    );
  }, [syncDraftHoverPreviewFromClientPoint, syncEdgePanDirectionFromClientPoint]);

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

    const nextCursor = resolvedMapCursor;

    if (nextCursor === "default") {
      canvas.style.removeProperty("cursor");
      return;
    }

    canvas.style.setProperty("cursor", nextCursor);
  }, [resolvedMapCursor]);

  useEffect(() => {
    if (
      !edgePanDirection ||
      isInteractionLocked ||
      middlePanPointerIdRef.current !== null ||
      draggedPointIndexRef.current !== null
    ) {
      return;
    }

    let frameId = 0;

    const tick = () => {
      const mapInstance = mapRef.current?.getMap();

      if (!mapInstance) {
        return;
      }

      mapInstance.panBy(
        [
          edgePanDirection.x * edgePanDirection.speedX,
          edgePanDirection.y * edgePanDirection.speedY,
        ],
        { animate: false },
      );
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [edgePanDirection, isInteractionLocked]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const handlePointerEnter = (event: PointerEvent) => {
      lastMouseClientPointRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      lastMousePointerTypeRef.current = event.pointerType;
      syncEdgePanDirectionFromClientPoint(
        event.clientX,
        event.clientY,
        event.pointerType,
        event.buttons,
      );
      syncDraftHoverPreviewFromClientPoint(
        event.clientX,
        event.clientY,
        event.pointerType,
      );
    };

    const handlePointerMove = (event: PointerEvent) => {
      lastMouseClientPointRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      lastMousePointerTypeRef.current = event.pointerType;
      syncEdgePanDirectionFromClientPoint(
        event.clientX,
        event.clientY,
        event.pointerType,
        event.buttons,
      );
    };

    const clearEdgePanDirection = () => {
      setEdgePanDirection(null);
    };

    container.addEventListener("pointerenter", handlePointerEnter);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", clearEdgePanDirection);

    return () => {
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", clearEdgePanDirection);
    };
  }, [syncDraftHoverPreviewFromClientPoint, syncEdgePanDirectionFromClientPoint]);

  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();

    if (!canvas) {
      return;
    }

    const handleMiddlePanDown = (event: PointerEvent) => {
      if (event.button !== 1 || isInteractionLocked) {
        return;
      }

      event.preventDefault();
      middlePanPointerIdRef.current = event.pointerId;
      middlePanLastPointRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      setEdgePanDirection(null);
      setMapCursorMode("grabbing");
      canvas.setPointerCapture(event.pointerId);
    };

    const handleMiddlePanMove = (event: PointerEvent) => {
      if (middlePanPointerIdRef.current !== event.pointerId) {
        return;
      }

      const lastPoint = middlePanLastPointRef.current;
      const mapInstance = mapRef.current?.getMap();

      if (!lastPoint || !mapInstance) {
        return;
      }

      event.preventDefault();
      middlePanLastPointRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      setMapCursorMode("grabbing");
      mapInstance.panBy(
        [lastPoint.x - event.clientX, lastPoint.y - event.clientY],
        { animate: false },
      );
    };

    const handleMiddlePanFinish = (event: PointerEvent) => {
      if (middlePanPointerIdRef.current !== event.pointerId) {
        return;
      }

      event.preventDefault();

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      middlePanPointerIdRef.current = null;
      middlePanLastPointRef.current = null;
      setMapCursorMode("idle");
    };

    canvas.addEventListener("pointerdown", handleMiddlePanDown);
    canvas.addEventListener("pointermove", handleMiddlePanMove);
    canvas.addEventListener("pointerup", handleMiddlePanFinish);
    canvas.addEventListener("pointercancel", handleMiddlePanFinish);

    return () => {
      canvas.removeEventListener("pointerdown", handleMiddlePanDown);
      canvas.removeEventListener("pointermove", handleMiddlePanMove);
      canvas.removeEventListener("pointerup", handleMiddlePanFinish);
      canvas.removeEventListener("pointercancel", handleMiddlePanFinish);
    };
  }, [isInteractionLocked]);

  function getDraftPointIndex(event: DraftPointEvent) {
    const matchingFeature = event.features?.find(
      (feature) =>
        feature.layer.id === "draft-geofence-points" ||
        feature.layer.id === "draft-geofence-points-hit-area",
    );

    return parseFeatureIndex(matchingFeature?.properties?.index);
  }

  function getDraftLineSegmentIndex(event: DraftPointEvent) {
    const mapInstance = mapRef.current?.getMap();

    if (!mapInstance || activeEditingCoordinates.length < 2) {
      return null;
    }

    const pointer = mapInstance.project([event.lngLat.lng, event.lngLat.lat]);
    return getNearestDraftLineSegmentIndexFromScreenPoint(pointer);
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
    setMapCursorMode("idle");

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
    const handleWindowBlur = () => {
      const canvas = mapRef.current?.getCanvas();
      const dragPointerId = dragPointerIdRef.current;
      const middlePanPointerId = middlePanPointerIdRef.current;

      if (canvas && dragPointerId !== null && canvas.hasPointerCapture(dragPointerId)) {
        canvas.releasePointerCapture(dragPointerId);
      }

      if (
        canvas &&
        middlePanPointerId !== null &&
        canvas.hasPointerCapture(middlePanPointerId)
      ) {
        canvas.releasePointerCapture(middlePanPointerId);
      }

      dragPointerIdRef.current = null;
      middlePanPointerIdRef.current = null;
      middlePanLastPointRef.current = null;
      suppressMapClickRef.current = false;
      setEdgePanDirection(null);
      clearDraftHoverPreview();

      if (draggedPointIndexRef.current !== null) {
        finishPointDrag(false);
      } else {
        setIsDraggingPoint(false);
        setIsTrashTargetActive(false);
        setMapCursorMode("idle");
      }
    };

    const handleWindowFocus = () => {
      window.requestAnimationFrame(() => {
        restorePointerDrivenPreviewState();
      });
    };

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [clearDraftHoverPreview, finishPointDrag, restorePointerDrivenPreviewState]);

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
      if (event.button === 1) {
        return;
      }

      const pointIndex = getDraftPointIndexAtScreenPoint(
        event.clientX,
        event.clientY,
        event.pointerType,
      );

      if (pointIndex === null) {
        return;
      }

      if (isDrawingGeofence && pointIndex === 0 && canCloseDrawingPolygon) {
        setMapCursorMode("idle");
        return;
      }

      event.preventDefault();
      dragPointerIdRef.current = event.pointerId;
      draggedPointIndexRef.current = pointIndex;
      suppressMapClickRef.current = false;
      setIsDraggingPoint(true);
      setEdgePanDirection(null);
      setMapCursorMode("grabbing");
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
      setMapCursorMode("grabbing");

      if (isDrawingGeofence) {
        onDrawingCoordinateUpdate(draggedPointIndex, coordinates);
      } else {
        onEditingCoordinateUpdate(draggedPointIndex, coordinates);
      }
    };

    const handlePointerHover = (event: PointerEvent) => {
      if (dragPointerIdRef.current === event.pointerId) {
        return;
      }

      syncDraftHoverPreviewFromClientPoint(
        event.clientX,
        event.clientY,
        event.pointerType,
      );
    };

    const handlePointerLeave = () => {
      clearDraftHoverPreview();
      setMapCursorMode("idle");
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
    canvas.addEventListener("pointermove", handlePointerHover);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerFinish);
    canvas.addEventListener("pointercancel", handlePointerFinish);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerHover);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerFinish);
      canvas.removeEventListener("pointercancel", handlePointerFinish);
    };
  }, [
    canDeleteDraggedPoint,
    canCloseDrawingPolygon,
    finishPointDrag,
    hasActiveGeofenceEdit,
    isDrawingGeofence,
    onDrawingCoordinateUpdate,
    onEditingCoordinateUpdate,
    clearDraftHoverPreview,
    getCoordinatesFromClientPoint,
    getDraftPointIndexAtScreenPoint,
    syncDraftHoverPreviewFromClientPoint,
  ]);

  function handleMapClick(event: MapLayerMouseEvent) {
    if (!hasActiveGeofenceEdit) {
      return;
    }

    if (suppressMapClickRef.current) {
      suppressMapClickRef.current = false;
      return;
    }

    const coordinates = {
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    };

    if (isDrawingGeofence) {
      if (!drawingCoordinates.length) {
        onMapClick(coordinates);
        return;
      }

      const clickedPointIndex = getDraftPointIndex(event);
      const firstPoint = drawingCoordinates[0];
      const mapInstance = mapRef.current?.getMap();
      const clickedNearFirstPoint =
        firstPoint && mapInstance
          ? getDistanceToPoint(
              {
                x: event.point.x,
                y: event.point.y,
              },
              mapInstance.project([firstPoint.longitude, firstPoint.latitude]),
            ) <= DRAWING_CLOSE_THRESHOLD_PX
          : false;

      if ((clickedPointIndex === 0 || clickedNearFirstPoint) && canCloseDrawingPolygon) {
        onDrawingComplete();
        return;
      }

      if (clickedPointIndex !== null) {
        return;
      }

      if (
        drawingProjectedSegment &&
        firstPoint &&
        isPointAtCoordinates(drawingProjectedSegment.end, firstPoint)
      ) {
        onDrawingComplete();
        return;
      }

      if (drawingProjectedSegment) {
        onMapClick(drawingProjectedSegment.end);
      }

      return;
    }

    if (getDraftPointIndex(event) !== null) {
      return;
    }

    const draftLineSegmentIndex =
      editingPreviewState?.hiddenSegmentIndex ?? getDraftLineSegmentIndex(event);

    if (draftLineSegmentIndex !== null) {
      const insertionIndex = Math.min(
        draftLineSegmentIndex + 1,
        activeEditingCoordinates.length,
      );

      setEditingPreviewState(null);
      onEditingCoordinateAddAt(insertionIndex, coordinates);
      return;
    }

    if (activeEditingCoordinates.length < 2) {
      onEditingCoordinateAdd(coordinates);
    }
  }

  function handleMapPointerMove(event: DraftPointEvent) {
    if (!hasActiveGeofenceEdit) {
      return;
    }

    if (draggedPointIndexRef.current !== null) {
      return;
    }

    updateHoverPreview(
      {
        coordinates: {
          longitude: event.lngLat.lng,
          latitude: event.lngLat.lat,
        },
        point: {
          x: event.point.x,
          y: event.point.y,
        },
      },
      getDraftPointIndex(event),
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${hasActiveGeofenceEdit ? "atlascope-geofence-drawing" : ""}`}
    >
      <Map
        ref={mapRef}
        initialViewState={atlascopeMapConfig.defaultViewport}
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
        cursor={resolvedMapCursor}
        dragRotate={false}
        touchPitch={false}
        dragPan={isPanGestureEnabled}
        scrollZoom={isZoomGestureEnabled}
        doubleClickZoom={isZoomGestureEnabled}
        touchZoomRotate={isZoomGestureEnabled}
        renderWorldCopies
        attributionControl={false}
        onDragStart={() => {
          if (!hasActiveGeofenceEdit) {
            setMapCursorMode("grabbing");
          }
        }}
        onDragEnd={() => {
          if (!hasActiveGeofenceEdit) {
            setMapCursorMode("idle");
          }
        }}
        onClick={handleMapClick}
        onMouseMove={handleMapPointerMove}
        onMouseLeave={() => {
          clearDraftHoverPreview();
          setMapCursorMode("idle");
        }}
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
        <Source
          id="atlascope-detail-context-mask"
          type="geojson"
          data={detailContextMaskSourceData}
        >
          <Layer {...detailContextMaskLayer} />
        </Source>
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
            id="atlascope-draft-geofence-confirmed-line"
            type="geojson"
            data={draftGeofenceLineSourceData}
          >
            <Layer {...draftGeofenceConfirmedLineLayer} />
          </Source>
        ) : null}
        {(isDrawingGeofence
          ? Boolean(drawingProjectedSegment)
          : Boolean(editingPreviewState?.projectedSegments.length)) ? (
          <Source
            id="atlascope-draft-geofence-projected-line"
            type="geojson"
            data={draftGeofenceProjectedLineSourceData}
          >
            <Layer {...draftGeofenceProjectedLineLayer} />
          </Source>
        ) : null}
        {hasActiveGeofenceEdit && activeEditingCoordinates.length ? (
          <Source
            id="atlascope-draft-geofence-points"
            type="geojson"
            data={createDraftGeofencePointSourceData(activeEditingCoordinates)}
          >
            <Layer {...draftGeofencePointsHitAreaLayer} />
            <Layer {...draftGeofencePointsLayer} />
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
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 4.5h6l1 2.5H8l1-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 7h10v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 10v6M12 10v6M14 10v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function parseFeatureIndex(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number.parseInt(value, 10);

    return Number.isNaN(parsedValue) ? null : parsedValue;
  }

  return null;
}

function isPointAtCoordinates(
  first: MapContainerProps["drawingCoordinates"][number],
  second: MapContainerProps["drawingCoordinates"][number],
) {
  return (
    first.longitude === second.longitude &&
    first.latitude === second.latitude
  );
}

function resolveMapCursor({
  edgePanDirection,
  hasActiveGeofenceEdit,
  isInteractionLocked,
  mode,
  theme,
}: {
  edgePanDirection: EdgePanDirection | null;
  hasActiveGeofenceEdit: boolean;
  isInteractionLocked: boolean;
  mode: MapCursorMode;
  theme: ThemeMode;
}) {
  if (mode === "grabbing") {
    return mode;
  }

  if (edgePanDirection) {
    return createEdgePanCursor(
      getEdgePanDirectionName(edgePanDirection),
      EDGE_PAN_CURSOR_COLORS[theme],
    );
  }

  if (mode === "grab") {
    return mode;
  }

  if (!hasActiveGeofenceEdit) {
    return isInteractionLocked ? "default" : "grab";
  }

  return DRAWING_CURSOR;
}

function getDraftSegmentScreenPoints(
  mapInstance: maplibregl.Map,
  coordinates: MapContainerProps["editingCoordinates"],
  segmentIndex: number,
  closePath: boolean,
) {
  const start = coordinates[segmentIndex];
  const endIndex =
    segmentIndex + 1 < coordinates.length
      ? segmentIndex + 1
      : closePath && coordinates.length >= 3
        ? 0
        : null;
  const end = endIndex === null ? null : coordinates[endIndex];

  if (!start || !end) {
    return null;
  }

  return {
    start: mapInstance.project([start.longitude, start.latitude]),
    end: mapInstance.project([end.longitude, end.latitude]),
  };
}

function getSegmentMidpoint(start: ScreenPoint, end: ScreenPoint): ScreenPoint {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}

function getDistanceToPoint(first: ScreenPoint, second: ScreenPoint) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function getDistanceToSegment(point: ScreenPoint, start: ScreenPoint, end: ScreenPoint) {
  const segmentDeltaX = end.x - start.x;
  const segmentDeltaY = end.y - start.y;
  const segmentLengthSquared = segmentDeltaX ** 2 + segmentDeltaY ** 2;

  if (segmentLengthSquared === 0) {
    return getDistanceToPoint(point, start);
  }

  const projection = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * segmentDeltaX + (point.y - start.y) * segmentDeltaY) /
        segmentLengthSquared,
    ),
  );
  const closestPoint = {
    x: start.x + segmentDeltaX * projection,
    y: start.y + segmentDeltaY * projection,
  };

  return getDistanceToPoint(point, closestPoint);
}

function getEdgePanSpeed(distanceToEdge: number, threshold: number) {
  const normalizedDistance = Math.max(0, Math.min(1, 1 - distanceToEdge / threshold));

  return Math.max(4, EDGE_PAN_MAX_SPEED_PX * normalizedDistance);
}

function getEdgePanDirectionName(
  direction: EdgePanDirection,
): EdgePanCompassDirection {
  if (direction.x === 0 && direction.y === -1) {
    return "north";
  }

  if (direction.x === 0 && direction.y === 1) {
    return "south";
  }

  if (direction.x === 1 && direction.y === 0) {
    return "east";
  }

  if (direction.x === -1 && direction.y === 0) {
    return "west";
  }

  if (direction.x === 1 && direction.y === -1) {
    return "north-east";
  }

  if (direction.x === -1 && direction.y === -1) {
    return "north-west";
  }

  if (direction.x === 1 && direction.y === 1) {
    return "south-east";
  }

  return "south-west";
}

function createEdgePanCursor(direction: EdgePanCompassDirection, color: string) {
  const rotation = EDGE_PAN_CURSOR_ROTATIONS[direction];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none">
      <g transform="rotate(${rotation} 12 12)">
        <path
          d="M4.5 12 13.5 3.5V8H19.5V16H13.5v4.5L4.5 12Z"
          fill="${color}"
        />
      </g>
    </svg>
  `.replace(/\s+/g, " ").trim();

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12, default`;
}
