"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { type StyleSpecification } from "maplibre-gl";
import Map, { NavigationControl, type ViewStateChangeEvent } from "react-map-gl/maplibre";
import { useEffect, useState } from "react";

import {
  atlascopeMapConfig,
  buildDarkMapStyle,
  DEMO_TILE_STYLE_URL,
  getFallbackMapStyle,
  getMapStyle,
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

export function MapLibreMap({
  markers,
  activeLayers,
  selectedMarkerId,
  viewport,
  theme,
  onViewportChange,
  onMarkerClick,
}: MapContainerProps) {
  const [darkThemeMapStyle, setDarkThemeMapStyle] = useState<StyleSpecification | null>(
    null,
  );
  const [hasDarkThemeStyleError, setHasDarkThemeStyleError] = useState(false);
  const visibleMarkers = markers.filter((marker) => activeLayers[marker.layerType]);

  useEffect(() => {
    let isCancelled = false;

    if (theme !== "dark" || darkThemeMapStyle || hasDarkThemeStyleError) {
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
          setDarkThemeMapStyle(buildDarkMapStyle(style));
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setHasDarkThemeStyleError(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [darkThemeMapStyle, hasDarkThemeStyleError, theme]);

  const mapStyle = (
    theme === "dark"
      ? hasDarkThemeStyleError
        ? getFallbackMapStyle(theme)
        : darkThemeMapStyle ?? DEMO_TILE_STYLE_URL
      : getMapStyle(theme)
  ) as StyleSpecification | string;

  return (
    <div className="h-full w-full">
      <Map
        {...viewport}
        reuseMaps
        mapLib={maplibregl}
        mapStyle={mapStyle}
        minZoom={atlascopeMapConfig.minZoom}
        maxZoom={atlascopeMapConfig.maxZoom}
        dragRotate={false}
        touchPitch={false}
        renderWorldCopies={false}
        attributionControl={false}
        onMove={(event) => onViewportChange(toViewportState(event))}
        onError={() => {
          if (theme === "dark") {
            setHasDarkThemeStyleError(true);
          }
        }}
      >
        {visibleMarkers.map((marker) => (
          <MapLibreMarkerView
            key={marker.id}
            marker={marker}
            isSelected={selectedMarkerId === marker.id}
            onClick={onMarkerClick}
            theme={theme}
          />
        ))}

        <NavigationControl
          position="bottom-right"
          showCompass={false}
          visualizePitch={false}
        />
      </Map>
    </div>
  );
}
