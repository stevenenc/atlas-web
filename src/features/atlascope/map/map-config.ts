import type { StyleSpecification } from "maplibre-gl";

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
        "background-color": "#262624",
      },
    },
  ],
};

export const DEMO_TILE_STYLE_URL = "https://demotiles.maplibre.org/style.json";

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
    dark: DEMO_TILE_STYLE_URL,
    light: DEMO_TILE_STYLE_URL,
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

export function buildDarkMapStyle(baseStyle: StyleSpecification): StyleSpecification {
  return {
    ...baseStyle,
    layers: (baseStyle.layers ?? []).map((layer) => {
      if (
        layer.type === "fill" &&
        (layer.id === "countries-fill" || layer.id === "crimea-fill")
      ) {
        return {
          ...layer,
          paint: {
            ...layer.paint,
            "fill-color": "#2F302D",
          },
        };
      }

      if (layer.type === "line" && layer.id === "countries-boundary") {
        return {
          ...layer,
          paint: {
            ...layer.paint,
            "line-color": "rgba(168, 197, 224, 0.65)",
            "line-opacity": 0.75,
          },
        };
      }

      if (layer.type === "symbol" && layer.id === "countries-label") {
        return {
          ...layer,
          paint: {
            ...layer.paint,
            "text-color": "rgba(245, 247, 250, 0.94)",
            "text-halo-color": "rgba(47, 48, 45, 0.92)",
            "text-halo-width": 0.8,
          },
        };
      }

      return layer;
    }),
  };
}
