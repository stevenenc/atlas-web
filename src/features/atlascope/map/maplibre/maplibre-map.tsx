"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { type StyleSpecification } from "maplibre-gl";
import Map, {
  Layer,
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
  activeLayers,
  viewport,
  theme,
  onViewportChange,
  onMarkerClick,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [baseMapStyle, setBaseMapStyle] = useState<StyleSpecification | null>(null);
  const [hasMapStyleError, setHasMapStyleError] = useState(false);
  const [verticalBoundsMinZoom, setVerticalBoundsMinZoom] = useState(
    atlascopeMapConfig.minZoom,
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

  return (
    <div ref={containerRef} className="h-full w-full">
      <Map
        {...viewport}
        reuseMaps
        mapLib={maplibregl}
        mapStyle={mapStyle}
        minZoom={verticalBoundsMinZoom}
        maxZoom={atlascopeMapConfig.maxZoom}
        dragRotate={false}
        touchPitch={false}
        renderWorldCopies
        attributionControl={false}
        onMove={(event) => onViewportChange(toViewportState(event))}
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
        {markers.map((marker) => (
          <MapLibreMarkerView
            key={marker.id}
            marker={marker}
            isVisible={activeLayers[marker.layerType]}
            onClick={onMarkerClick}
            theme={theme}
          />
        ))}
      </Map>
    </div>
  );
}
