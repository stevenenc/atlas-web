import type { GeoJSON } from "geojson";

export type MapProviderId = "maplibre" | "mapbox";

export type MapVisibility = "visible" | "none";

export type MapSourceDefinition = {
  type: string;
  [key: string]: unknown;
};

export type MapLayerDefinition = {
  id: string;
  type: string;
  source?: string;
  layout?: Record<string, unknown>;
  paint?: Record<string, unknown>;
  minzoom?: number;
  maxzoom?: number;
  filter?: unknown;
  [key: string]: unknown;
};

export type MapStyleDefinition = {
  version: 8;
  glyphs?: string;
  sprite?: string;
  transition?: {
    duration?: number;
    delay?: number;
  };
  sources: Record<string, MapSourceDefinition>;
  layers: MapLayerDefinition[];
};

export type MapLayerStyleUpdate = {
  layout?: Record<string, unknown>;
  paint?: Record<string, unknown>;
  minzoom?: number;
  maxzoom?: number;
  filter?: unknown;
};

export type MapProviderInitializationOptions = {
  style?: string | MapStyleDefinition;
};

export interface MapProvider {
  providerId: MapProviderId;
  initializeMap(
    container: HTMLElement,
    options?: MapProviderInitializationOptions,
  ): void;
  addSource(sourceId: string, source: MapSourceDefinition): void;
  addLayer(layer: MapLayerDefinition, beforeId?: string): void;
  setLayerVisibility(layerId: string, visible: boolean): void;
  updateLayerStyle(layerId: string, style: MapLayerStyleUpdate): void;
  updateStyle(style: string | MapStyleDefinition): void;
  destroy(): void;
}

export interface VectorMapProvider extends MapProvider {
  hasLayer(layerId: string): boolean;
  hasSource(sourceId: string): boolean;
  setGeoJsonSourceData(sourceId: string, data: GeoJSON): void;
}

export const MAP_PROVIDER = "maplibre" satisfies MapProviderId;

export function isImplementedMapProvider(
  provider: MapProviderId,
): provider is typeof MAP_PROVIDER {
  return provider === "maplibre";
}
