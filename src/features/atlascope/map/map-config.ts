import type { ThemeMode } from "@/features/atlascope/config/theme";

import {
  MAP_PROVIDER,
  type MapProviderId,
} from "@/features/atlascope/map/provider";
import type {
  MapStyleConfig,
  MapStyleDefinition,
  MapViewportState,
} from "@/features/atlascope/map/map-types";

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
    zoom: 4.8,
    bearing: 0,
    pitch: 18,
  } satisfies MapViewportState,
  minZoom: 3.6,
  maxZoom: 10.5,
  styleByTheme: {
    dark: "https://demotiles.maplibre.org/style.json",
    light: "https://demotiles.maplibre.org/style.json",
  } satisfies Record<ThemeMode, MapStyleConfig>,
  fallbackStyleByTheme: {
    dark: darkMapStyle,
    light: lightMapStyle,
  } satisfies Record<ThemeMode, MapStyleDefinition>,
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
