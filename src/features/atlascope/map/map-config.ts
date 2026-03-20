import type { ThemeMode } from "@/features/atlascope/config/theme";

import {
  MAP_PROVIDER,
  type MapStyleDefinition,
  type MapProviderId,
} from "@/features/atlascope/map/map-provider";
import { getMapTheme } from "@/features/atlascope/map/map-theme";
import type { MapStyleConfig, MapViewportState } from "@/features/atlascope/map/map-types";

const darkTheme = getMapTheme("dark").colors;
const lightTheme = getMapTheme("light").colors;

const darkFallbackStyle: MapStyleDefinition = {
  version: 8,
  sources: {},
  layers: [
    {
        id: "atlascope-background",
        type: "background",
        paint: {
          "background-color": darkTheme.land.zoomedOut,
        },
      },
    ],
};

const lightFallbackStyle: MapStyleDefinition = {
  version: 8,
  sources: {},
  layers: [
    {
        id: "atlascope-background",
        type: "background",
        paint: {
          "background-color": lightTheme.land.zoomedOut,
        },
      },
    ],
};

export const OPEN_FREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export const performanceConfig = {
  enablePOI: false,
  enableBuildings: false,
  enableTransit: false,
  enableHeavyLanduse: false,
  enableLowZoomStreetLabels: false,
} as const;

export const atlascopeMapConfig = {
  provider: MAP_PROVIDER as MapProviderId,
  defaultViewport: {
    longitude: 122.4,
    latitude: 12.3,
    zoom: 6.2,
    bearing: 0,
    pitch: 18,
  } satisfies MapViewportState,
  minZoom: 5.1,
  maxZoom: 14.5,
  basemap: {
    styleUrl: OPEN_FREEMAP_STYLE_URL,
    vectorSourceId: "openmaptiles",
    terrainRasterSourceId: "ne2_shaded",
  },
  styleByTheme: {
    dark: OPEN_FREEMAP_STYLE_URL,
    light: OPEN_FREEMAP_STYLE_URL,
  } satisfies Record<ThemeMode, MapStyleConfig>,
  fallbackStyleByTheme: {
    dark: darkFallbackStyle,
    light: lightFallbackStyle,
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
