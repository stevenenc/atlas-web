import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import {
  MAP_PROVIDER,
  type MapStyleDefinition,
  type MapProviderId,
} from "./provider";
import type { MapStyleConfig, MapViewportState } from "./types";

const darkTheme = getMapTheme("dark").colors;
const lightTheme = getMapTheme("light").colors;

function createFallbackStyle(backgroundColor: string): MapStyleDefinition {
  return {
    version: 8,
    transition: {
      duration: 280,
      delay: 0,
    },
    sources: {},
    layers: [
      {
        id: "atlascope-background",
        type: "background",
        paint: {
          "background-color": backgroundColor,
        },
      },
    ],
  };
}

const darkFallbackStyle = createFallbackStyle(darkTheme.land.zoomedOut);
const lightFallbackStyle = createFallbackStyle(lightTheme.land.zoomedOut);

export const DEFAULT_BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
export const ATLASCOPE_BASEMAP_STYLE_URL =
  process.env.NEXT_PUBLIC_ATLAS_BASEMAP_STYLE_URL ?? DEFAULT_BASEMAP_STYLE_URL;

export const atlascopeMapConfig = {
  provider: MAP_PROVIDER as MapProviderId,
  defaultViewport: {
    longitude: 122.4,
    latitude: 12.3,
    zoom: 6.2,
    bearing: 0,
    pitch: 0,
  } satisfies MapViewportState,
  minZoom: 5.1,
  maxZoom: 14.5,
  basemap: {
    styleUrl: ATLASCOPE_BASEMAP_STYLE_URL,
    vectorSourceId: "openmaptiles",
    terrainRasterSourceId: "ne2_shaded",
  },
  styleByTheme: {
    dark: ATLASCOPE_BASEMAP_STYLE_URL,
    light: ATLASCOPE_BASEMAP_STYLE_URL,
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
