"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { type StyleSpecification } from "maplibre-gl";
import Map, {
  Layer,
  NavigationControl,
  Source,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { useState } from "react";

import {
  atlascopeMapConfig,
  getFallbackMapStyle,
  getMapStyle,
} from "../map-config";
import type { MapContainerProps, MapViewportState } from "../map-types";
import { createHazardLayers, createHazardSourceData } from "./maplibre-layers";
import { MapLibreMarkerView } from "./maplibre-marker";

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
  const [hasStyleError, setHasStyleError] = useState(false);
  const visibleMarkers = markers.filter((marker) => activeLayers[marker.layerType]);
  const hazardSource = createHazardSourceData(visibleMarkers);
  const hazardLayers = createHazardLayers(theme);
  const mapStyle = (
    hasStyleError ? getFallbackMapStyle(theme) : getMapStyle(theme)
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
        onError={() => setHasStyleError(true)}
      >
        <Source id="atlascope-hazards" type="geojson" data={hazardSource}>
          {hazardLayers.map((layer) => (
            <Layer key={layer.id} {...layer} />
          ))}
        </Source>

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
