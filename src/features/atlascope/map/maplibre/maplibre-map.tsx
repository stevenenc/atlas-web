"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { type StyleSpecification } from "maplibre-gl";
import Map, { type ViewStateChangeEvent } from "react-map-gl/maplibre";
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

function getHorizontalWorldMinZoom(containerWidth: number) {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) {
    return atlascopeMapConfig.minZoom;
  }

  return Math.max(
    atlascopeMapConfig.minZoom,
    Math.log2(containerWidth / 512),
  );
}

export function MapLibreMap({
  markers,
  activeLayers,
  viewport,
  theme,
  onViewportChange,
  onMarkerClick,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [baseMapStyle, setBaseMapStyle] = useState<StyleSpecification | null>(null);
  const [hasMapStyleError, setHasMapStyleError] = useState(false);
  const [horizontalWorldMinZoom, setHorizontalWorldMinZoom] = useState(
    atlascopeMapConfig.minZoom,
  );
  const visibleMarkers = markers.filter((marker) => activeLayers[marker.layerType]);

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
      setHorizontalWorldMinZoom(
        getHorizontalWorldMinZoom(container.clientWidth),
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
      return DEMO_TILE_STYLE_URL as StyleSpecification | string;
    }

    return (theme === "dark"
      ? buildDarkMapStyle(baseMapStyle)
      : buildLightMapStyle(baseMapStyle)) as StyleSpecification | string;
  }, [baseMapStyle, hasMapStyleError, theme]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Map
        {...viewport}
        reuseMaps
        mapLib={maplibregl}
        mapStyle={mapStyle}
        minZoom={horizontalWorldMinZoom}
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
        {visibleMarkers.map((marker) => (
          <MapLibreMarkerView
            key={marker.id}
            marker={marker}
            onClick={onMarkerClick}
            theme={theme}
          />
        ))}
      </Map>
    </div>
  );
}
