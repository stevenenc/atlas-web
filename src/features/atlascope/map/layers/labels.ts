import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import { atlascopeMapConfig } from "../core/config";
import type { MapLayerDefinition } from "../core/provider";
import { getZoomInterpolatedNumber } from "../style/style-config";
import { roadClassFilters } from "./roads";

const TRANSPORTATION_LABEL_SOURCE_LAYER = "transportation_name";

export function createRoadLabelLayerDefinitions(
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
): MapLayerDefinition[] {
  const { colors, zoom } = getMapTheme(theme);

  return [
    {
      id: "atlascope-road-labels-major",
      type: "symbol",
      source: vectorSourceId,
      "source-layer": TRANSPORTATION_LABEL_SOURCE_LAYER,
      minzoom: zoom.labels.majorRoadMinZoom,
      filter: [
        "match",
        ["get", "class"],
        [...roadClassFilters.major],
        true,
        false,
      ],
      layout: {
        "symbol-placement": "line",
        "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
        "text-font": ["Noto Sans Regular"],
        "text-letter-spacing": 0.015,
        "text-size": ["interpolate", ["linear"], ["zoom"], 11, 10.5, 14.5, 12],
        "text-max-angle": 38,
        "text-rotation-alignment": "map",
        "symbol-spacing": 360,
        "text-keep-upright": true,
        visibility: "visible",
      },
      paint: {
        "text-color": colors.roads.majorLabel,
        "text-halo-color": colors.roads.halo,
        "text-halo-width": theme === "dark" ? 1.15 : 1.1,
        "text-opacity": getZoomInterpolatedNumber(zoom.labels.majorRoadOpacity),
      },
    },
    {
      id: "atlascope-road-labels-local",
      type: "symbol",
      source: vectorSourceId,
      "source-layer": TRANSPORTATION_LABEL_SOURCE_LAYER,
      minzoom: zoom.labels.localRoadMinZoom,
      filter: [
        "match",
        ["get", "class"],
        [...roadClassFilters.secondary, ...roadClassFilters.tertiary],
        true,
        false,
      ],
      layout: {
        "symbol-placement": "line",
        "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
        "text-font": ["Noto Sans Regular"],
        "text-letter-spacing": 0.01,
        "text-size": ["interpolate", ["linear"], ["zoom"], 13, 9.5, 14.5, 10.8],
        "text-max-angle": 40,
        "text-rotation-alignment": "map",
        "symbol-spacing": 300,
        "text-keep-upright": true,
        visibility: "visible",
      },
      paint: {
        "text-color": colors.roads.localLabel,
        "text-halo-color": colors.roads.halo,
        "text-halo-width": theme === "dark" ? 1.05 : 1,
        "text-opacity": getZoomInterpolatedNumber(zoom.labels.localRoadOpacity),
      },
    },
  ];
}
