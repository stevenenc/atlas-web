"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { type StyleSpecification } from "maplibre-gl";
import Map, {
  Layer,
  NavigationControl,
  Source,
  TerrainControl,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { useState } from "react";

import {
  atlascopeMapConfig,
  getFallbackMapStyle,
  getMapStyle,
} from "../map-config";
import type { MapContainerProps, MapViewportState } from "../map-types";
import {
  createHazardLayers,
  createHazardSourceData,
  createTerrainLayers,
} from "./maplibre-layers";
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
  const terrainLayers = createTerrainLayers(theme);
  const mapStyle = (
    hasStyleError ? getFallbackMapStyle(theme) : getMapStyle(theme)
  ) as StyleSpecification | string;
  const mapInstanceKey = `${theme}-${hasStyleError ? "fallback" : "primary"}`;

  return (
    <div className="h-full w-full">
      <Map
        key={mapInstanceKey}
        {...viewport}
        reuseMaps
        mapLib={maplibregl}
        mapStyle={mapStyle}
        minZoom={atlascopeMapConfig.minZoom}
        maxZoom={atlascopeMapConfig.maxZoom}
        terrain={{
          source: atlascopeMapConfig.terrain.sourceId,
          exaggeration: atlascopeMapConfig.terrain.exaggeration,
        }}
        dragRotate={false}
        touchPitch
        renderWorldCopies={false}
        attributionControl={false}
        onMove={(event) => onViewportChange(toViewportState(event))}
        onError={() => setHasStyleError(true)}
      >
        <Source
          key="terrain-source"
          id={atlascopeMapConfig.terrain.sourceId}
          type="raster-dem"
          url={atlascopeMapConfig.terrain.sourceUrl}
          tileSize={atlascopeMapConfig.terrain.tileSize}
        >
          {terrainLayers.map((layer) => (
            <Layer key={layer.id} {...layer} />
          ))}
        </Source>

        <Source
          key="hazard-source"
          id="atlascope-hazards"
          type="geojson"
          data={hazardSource}
        >
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
          visualizePitch
        />
        <TerrainControl
          source={atlascopeMapConfig.terrain.sourceId}
          exaggeration={atlascopeMapConfig.terrain.exaggeration}
          position="bottom-right"
        />
      </Map>
    </div>
  );
}
