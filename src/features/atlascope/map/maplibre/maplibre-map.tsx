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
  activeLayers,
  viewport,
  theme,
  onViewportChange,
  onMarkerClick,
  onMapClick,
  onDrawingCoordinateUpdate,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);
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
  const draftGeofenceLineSourceData = useMemo(
    () => createDraftGeofenceLineSourceData(drawingCoordinates),
    [drawingCoordinates],
  );
  const draftGeofencePointSourceData = useMemo(
    () => createDraftGeofencePointSourceData(drawingCoordinates),
    [drawingCoordinates],
  );
  const draftGeofenceLayers = useMemo(
    () => createDraftGeofenceLayers(theme),
    [theme],
  );

  useEffect(() => {
    if (!isDrawingGeofence) {
      draggedPointIndexRef.current = null;
      suppressMapClickRef.current = false;
      setMapCursor("default");
      mapRef.current?.getCanvas().style.removeProperty("cursor");
      return;
    }

    setMapCursor(DRAWING_CURSOR);
  }, [isDrawingGeofence]);

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

  function handleMapClick(event: MapLayerMouseEvent) {
    if (!isDrawingGeofence) {
      return;
    }

    if (suppressMapClickRef.current) {
      suppressMapClickRef.current = false;
      return;
    }

    if (getDraftPointIndex(event) !== null) {
      return;
    }

    onMapClick({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    });
  }

  function handleMapMouseMove(event: MapLayerMouseEvent) {
    if (!isDrawingGeofence) {
      return;
    }

    const draggedPointIndex = draggedPointIndexRef.current;

    if (draggedPointIndex !== null) {
      suppressMapClickRef.current = true;
      setMapCursor("grabbing");
      onDrawingCoordinateUpdate(draggedPointIndex, {
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
      });
      return;
    }

    setMapCursor(getDraftPointIndex(event) !== null ? "grab" : DRAWING_CURSOR);
  }

  function handleMapMouseDown(event: MapLayerMouseEvent) {
    if (!isDrawingGeofence) {
      return;
    }

    const pointIndex = getDraftPointIndex(event);

    if (pointIndex === null) {
      return;
    }

    draggedPointIndexRef.current = pointIndex;
    suppressMapClickRef.current = false;
    setMapCursor("grabbing");
    mapRef.current?.dragPan.disable();
  }

  function handleMapMouseUp() {
    if (draggedPointIndexRef.current === null) {
      return;
    }

    draggedPointIndexRef.current = null;
    mapRef.current?.dragPan.enable();
    setMapCursor(DRAWING_CURSOR);
  }

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${isDrawingGeofence ? "atlascope-geofence-drawing" : ""}`}
    >
      <Map
        ref={mapRef}
        {...viewport}
        reuseMaps
        mapLib={maplibregl}
        mapStyle={mapStyle}
        minZoom={verticalBoundsMinZoom}
        maxZoom={atlascopeMapConfig.maxZoom}
        interactiveLayerIds={isDrawingGeofence ? ["draft-geofence-points"] : undefined}
        cursor={mapCursor}
        dragRotate={false}
        touchPitch={false}
        renderWorldCopies
        attributionControl={false}
        doubleClickZoom={!isDrawingGeofence}
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
        {isDrawingGeofence && drawingCoordinates.length >= 2 ? (
          <Source
            id="atlascope-draft-geofence-line"
            type="geojson"
            data={draftGeofenceLineSourceData}
          >
            <Layer {...draftGeofenceLayers[0]} />
          </Source>
        ) : null}
        {isDrawingGeofence && drawingCoordinates.length ? (
          <Source
            id="atlascope-draft-geofence-points"
            type="geojson"
            data={draftGeofencePointSourceData}
          >
            <Layer {...draftGeofenceLayers[1]} />
          </Source>
        ) : null}
        {markers.map((marker) => (
          <MapLibreMarkerView
            key={marker.id}
            marker={marker}
            isVisible={activeLayers[marker.layerType]}
            isInteractive={!isDrawingGeofence}
            onClick={onMarkerClick}
            theme={theme}
          />
        ))}
      </Map>
    </div>
  );
}
