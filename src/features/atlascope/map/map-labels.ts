import type { ThemeMode } from "@/features/atlascope/config/theme";
import { atlascopeMapConfig } from "@/features/atlascope/map/map-config";
import { getMapTheme } from "@/features/atlascope/map/map-theme";
import { getZoomInterpolatedNumber } from "@/features/atlascope/map/map-style-config";
import { roadClassFilters } from "@/features/atlascope/map/map-roads";
import type { MapLayerDefinition } from "@/features/atlascope/map/map-provider";

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
        "text-size": ["interpolate", ["linear"], ["zoom"], 11, 10.2, 14.5, 11.6],
        "text-max-angle": 38,
        "text-rotation-alignment": "map",
        "symbol-spacing": 360,
        "text-keep-upright": true,
        visibility: "visible",
      },
      paint: {
        "text-color": colors.roads.majorLabel,
        "text-halo-color": colors.roads.halo,
        "text-halo-width": theme === "dark" ? 1.15 : 1.3,
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
        "text-size": ["interpolate", ["linear"], ["zoom"], 13, 9.2, 14.5, 10.4],
        "text-max-angle": 40,
        "text-rotation-alignment": "map",
        "symbol-spacing": 300,
        "text-keep-upright": true,
        visibility: "visible",
      },
      paint: {
        "text-color": colors.roads.localLabel,
        "text-halo-color": colors.roads.halo,
        "text-halo-width": theme === "dark" ? 1.05 : 1.2,
        "text-opacity": getZoomInterpolatedNumber(zoom.labels.localRoadOpacity),
      },
    },
  ];
}
