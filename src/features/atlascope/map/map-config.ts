import type { ThemeMode } from "@/features/atlascope/config/theme";

import { MAP_PROVIDER, type MapProviderId } from "./provider";
import type {
  MapStyleConfig,
  MapStyleDefinition,
  MapViewportState,
} from "./map-types";

const darkMapStyle: MapStyleDefinition = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "atlascope-background",
      type: "background",
      paint: {
        "background-color": "#2B2928",
      },
    },
  ],
};

const lightMapStyle: MapStyleDefinition = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "atlascope-background",
      type: "background",
      paint: {
        "background-color": "#F5E9CC",
      },
    },
  ],
};

export const atlascopeMapConfig = {
  provider: MAP_PROVIDER as MapProviderId,
  defaultViewport: {
    longitude: 122.4,
    latitude: 12.3,
    zoom: 5.6,
    bearing: 0,
    pitch: 36,
  } satisfies MapViewportState,
  minZoom: 3.6,
  maxZoom: 16.5,
  styleByTheme: {
    dark: "https://tiles.openfreemap.org/styles/liberty",
    light: "https://tiles.openfreemap.org/styles/liberty",
  } satisfies Record<ThemeMode, MapStyleConfig>,
  fallbackStyleByTheme: {
    dark: darkMapStyle,
    light: lightMapStyle,
  } satisfies Record<ThemeMode, MapStyleDefinition>,
  terrain: {
    sourceId: "atlascope-terrain",
    sourceUrl: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
    tileSize: 256,
    exaggeration: 1.2,
  },
  tokens: {
    maplibre: "",
    mapbox: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "",
  } satisfies Record<MapProviderId, string>,
};

export function getMapStyle(theme: ThemeMode) {
  return atlascopeMapConfig.styleByTheme[theme];
}

export function getFallbackMapStyle(theme: ThemeMode) {
  return atlascopeMapConfig.fallbackStyleByTheme[theme];
}
