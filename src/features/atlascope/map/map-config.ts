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
        "background-color": "#171C20",
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
        "background-color": "#D8DDE0",
      },
    },
  ],
};

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

type MapPalette = {
  background: string;
  land: string;
  water: string;
  border: string;
  coastline: string;
  road: string;
  label: string;
  halo: string;
};

const graticulePattern =
  /(graticule|equator|tropic|arctic circle|antarctic circle|latitude|longitude)/i;

const darkPalette: MapPalette = {
  background: "#171C20",
  land: "#20282D",
  water: "#10161A",
  border: "rgba(118, 153, 176, 0.34)",
  coastline: "rgba(144, 178, 201, 0.42)",
  road: "rgba(156, 173, 184, 0.08)",
  label: "rgba(222, 230, 235, 0.4)",
  halo: "rgba(23, 28, 32, 0.94)",
};

const lightPalette: MapPalette = {
  background: "#D6DDE2",
  land: "#E8DFCF",
  water: "#98B2C2",
  border: "rgba(72, 78, 82, 0.34)",
  coastline: "rgba(45, 55, 62, 0.4)",
  road: "rgba(89, 99, 105, 0.1)",
  label: "rgba(35, 42, 48, 0.66)",
  halo: "rgba(243, 246, 247, 0.98)",
};

export function buildDarkMapStyle(baseStyle: StyleSpecification): StyleSpecification {
  return buildOperationalMapStyle(baseStyle, darkPalette);
}

export function buildLightMapStyle(baseStyle: StyleSpecification): StyleSpecification {
  return buildOperationalMapStyle(baseStyle, lightPalette);
}

function buildOperationalMapStyle(
  baseStyle: StyleSpecification,
  palette: MapPalette,
): StyleSpecification {
  return {
    ...baseStyle,
    layers: [
      {
        id: "atlascope-background",
        type: "background",
        paint: {
          "background-color": palette.background,
        },
      },
      ...(baseStyle.layers ?? [])
        .filter((layer) => !graticulePattern.test(JSON.stringify(layer)))
        .map((layer) => {
        const layerId = layer.id.toLowerCase();

        if (layer.type === "background") {
          return {
            ...layer,
            paint: {
              ...layer.paint,
              "background-color": palette.background,
            },
          };
        }

        if (layer.type === "fill") {
          const isWater =
            layerId.includes("ocean") || layerId.includes("water") || layerId.includes("sea");
          const isLand =
            layerId.includes("land") ||
            layerId.includes("country") ||
            layerId.includes("admin") ||
            layerId.includes("state");

          return {
            ...layer,
            paint: {
              ...layer.paint,
              "fill-color": isWater ? palette.water : isLand ? palette.land : palette.land,
              "fill-opacity": isWater ? 1 : 0.96,
            },
          };
        }

        if (layer.type === "line") {
          const isCoastline =
            layerId.includes("coast") ||
            layerId.includes("shore") ||
            layerId.includes("waterway") ||
            layerId.includes("ocean") ||
            layerId.includes("sea");
          const isRoad =
            layerId.includes("road") ||
            layerId.includes("street") ||
            layerId.includes("path") ||
            layerId.includes("rail");

          return {
            ...layer,
            paint: {
              ...layer.paint,
              "line-color": isRoad
                ? palette.road
                : isCoastline
                  ? palette.coastline
                  : palette.border,
              "line-opacity": isRoad ? 0.28 : isCoastline ? 1 : 0.86,
              "line-width": isRoad ? 0.6 : isCoastline ? 1.25 : 1.08,
            },
          };
        }

        if (layer.type === "symbol") {
          return {
            ...layer,
            layout: {
              ...layer.layout,
              "text-size":
                layerId.includes("country") || layerId.includes("state") ? 10 : 9,
            },
            paint: {
              ...layer.paint,
              "text-color": palette.label,
              "text-halo-color": palette.halo,
              "text-halo-width": 0.6,
              "text-opacity": 0.72,
              "icon-opacity": 0.18,
            },
          };
        }

        return layer;
      }),
    ],
  };
}
