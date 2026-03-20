import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import { atlascopeMapConfig } from "../core/config";
import type { MapLayerDefinition } from "../core/provider";
import { getZoomInterpolatedNumber } from "../style/style-config";

const TRANSPORTATION_SOURCE_LAYER = "transportation";

export const roadClassFilters = {
  major: ["motorway", "trunk", "primary"],
  secondary: ["secondary"],
  tertiary: ["tertiary", "minor", "service"],
} as const;

function createRoadFilter(classes: readonly string[]) {
  return [
    "all",
    ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false],
    ["!=", ["get", "ramp"], 1],
    ["match", ["get", "class"], [...classes], true, false],
  ] as const;
}

export function createRoadLayerDefinitions(
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
): MapLayerDefinition[] {
  const { colors, zoom } = getMapTheme(theme);

  return [
    {
      id: "atlascope-road-major",
      type: "line",
      source: vectorSourceId,
      "source-layer": TRANSPORTATION_SOURCE_LAYER,
      minzoom: zoom.roads.majorMinZoom,
      filter: createRoadFilter(roadClassFilters.major),
      layout: {
        "line-cap": "round",
        "line-join": "round",
        visibility: "visible",
      },
      paint: {
        "line-color": colors.roads.major,
        "line-opacity": getZoomInterpolatedNumber(zoom.roads.majorOpacity),
        "line-width": getZoomInterpolatedNumber(zoom.roads.majorWidth),
      },
    },
    {
      id: "atlascope-road-secondary",
      type: "line",
      source: vectorSourceId,
      "source-layer": TRANSPORTATION_SOURCE_LAYER,
      minzoom: zoom.roads.secondaryMinZoom,
      filter: createRoadFilter(roadClassFilters.secondary),
      layout: {
        "line-cap": "round",
        "line-join": "round",
        visibility: "visible",
      },
      paint: {
        "line-color": colors.roads.secondary,
        "line-opacity": getZoomInterpolatedNumber(zoom.roads.secondaryOpacity),
        "line-width": getZoomInterpolatedNumber(zoom.roads.secondaryWidth),
      },
    },
    {
      id: "atlascope-road-tertiary",
      type: "line",
      source: vectorSourceId,
      "source-layer": TRANSPORTATION_SOURCE_LAYER,
      minzoom: zoom.roads.minorMinZoom,
      filter: createRoadFilter(roadClassFilters.tertiary),
      layout: {
        "line-cap": "round",
        "line-join": "round",
        visibility: "visible",
      },
      paint: {
        "line-color": colors.roads.minor,
        "line-opacity": getZoomInterpolatedNumber(zoom.roads.minorOpacity),
        "line-width": getZoomInterpolatedNumber(zoom.roads.minorWidth),
      },
    },
  ];
}
