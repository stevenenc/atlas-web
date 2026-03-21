import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import { DEFAULT_MAP_DETAIL_CONTEXT, type MapDetailContext } from "../core/types";
import { atlascopeMapConfig } from "../core/config";
import type { MapLayerDefinition } from "../core/provider";
import { getZoomInterpolatedNumber, scaleZoomStops } from "../style/style-config";
import {
  createDetailLayerId,
  createDetailProfileFilter,
  detailProfiles,
  getDetailProfileVisibility,
} from "./detail-context";
import { roadClassFilters } from "./roads";

const TRANSPORTATION_LABEL_SOURCE_LAYER = "transportation_name";

type RoadLabelConfig = {
  baseId: string;
  classes: readonly string[];
  colorKey: "majorLabel" | "localLabel";
  textHaloWidth: {
    dark: number;
    light: number;
  };
  textSize: readonly unknown[];
  letterSpacing: number;
  symbolSpacing: number;
  minZoomKey: "majorRoadMinZoom" | "localRoadMinZoom";
  opacityKey: "majorRoadOpacity" | "localRoadOpacity";
};

const roadLabelConfigs: RoadLabelConfig[] = [
  {
    baseId: "atlascope-road-labels-major",
    classes: roadClassFilters.major,
    colorKey: "majorLabel",
    textHaloWidth: {
      dark: 1.15,
      light: 1.1,
    },
    textSize: ["interpolate", ["linear"], ["zoom"], 11, 10.5, 14.5, 12],
    letterSpacing: 0.015,
    symbolSpacing: 360,
    minZoomKey: "majorRoadMinZoom",
    opacityKey: "majorRoadOpacity",
  },
  {
    baseId: "atlascope-road-labels-local",
    classes: [...roadClassFilters.secondary, ...roadClassFilters.tertiary],
    colorKey: "localLabel",
    textHaloWidth: {
      dark: 1.05,
      light: 1,
    },
    textSize: ["interpolate", ["linear"], ["zoom"], 13, 9.5, 14.5, 10.8],
    letterSpacing: 0.01,
    symbolSpacing: 300,
    minZoomKey: "localRoadMinZoom",
    opacityKey: "localRoadOpacity",
  },
];

function createRoadLabelFilter(classes: readonly string[]) {
  return [
    "match",
    ["get", "class"],
    [...classes],
    true,
    false,
  ] as const;
}

export function createRoadLabelLayerDefinitions(
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
): MapLayerDefinition[] {
  const { colors, zoom } = getMapTheme(theme);

  return detailProfiles.flatMap((profile) =>
    roadLabelConfigs.map((config) => {
      const profileZoom = zoom.detailProfiles[profile].roadLabels;
      const baseFilter = createRoadLabelFilter(config.classes);

      return {
        id: createDetailLayerId(config.baseId, profile),
        type: "symbol",
        source: vectorSourceId,
        "source-layer": TRANSPORTATION_LABEL_SOURCE_LAYER,
        minzoom: profileZoom[config.minZoomKey],
        filter: createDetailProfileFilter(baseFilter, detailContext, profile),
        layout: {
          "symbol-placement": "line",
          "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-letter-spacing": config.letterSpacing,
          "text-size": config.textSize,
          "text-max-angle": 40,
          "text-rotation-alignment": "map",
          "symbol-spacing": config.symbolSpacing,
          "text-keep-upright": true,
          visibility: getDetailProfileVisibility(detailContext, profile),
        },
        paint: {
          "text-color": colors.roads[config.colorKey],
          "text-halo-color": colors.roads.halo,
          "text-halo-width": config.textHaloWidth[theme],
          "text-opacity": getZoomInterpolatedNumber(
            scaleZoomStops(
              profileZoom[config.opacityKey],
              colors.detailContext[profile].labelOpacityMultiplier,
            ),
          ),
        },
      };
    }),
  );
}
