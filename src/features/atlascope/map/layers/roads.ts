import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import { DEFAULT_MAP_DETAIL_CONTEXT, type MapDetailContext } from "../core/types";
import { atlascopeMapConfig } from "../core/config";
import type { MapLayerDefinition } from "../core/provider";
import {
  createFadedOpacityStops,
  createFadedWidthStops,
  getZoomInterpolatedNumber,
  resolveLayerZoomRange,
} from "../style/style-config";
import {
  buildSpatialProfileLayers,
  createDetailLayerId,
  createDetailProfileFilter,
  getDetailProfileVisibility,
  resolveDetailProfileValue,
} from "./detail-context";

const TRANSPORTATION_SOURCE_LAYER = "transportation";

export const roadClassFilters = {
  major: ["motorway", "trunk", "primary"],
  secondary: ["secondary"],
  tertiary: ["tertiary", "minor", "service"],
} as const;

type RoadLayerConfig = {
  baseId: string;
  classKey: keyof typeof roadClassFilters;
  colorKey: "major" | "secondary" | "minor";
  zoomKey: "major" | "secondary" | "minor";
  opacityContrastMultiplier: number;
  widthContrastMultiplier: number;
};

const roadLayerConfigs: RoadLayerConfig[] = [
  {
    baseId: "atlascope-road-major",
    classKey: "major",
    colorKey: "major",
    zoomKey: "major",
    opacityContrastMultiplier: 0.97,
    widthContrastMultiplier: 0.98,
  },
  {
    baseId: "atlascope-road-secondary",
    classKey: "secondary",
    colorKey: "secondary",
    zoomKey: "secondary",
    opacityContrastMultiplier: 1.2,
    widthContrastMultiplier: 1.12,
  },
  {
    baseId: "atlascope-road-tertiary",
    classKey: "tertiary",
    colorKey: "minor",
    zoomKey: "minor",
    opacityContrastMultiplier: 1.28,
    widthContrastMultiplier: 1.16,
  },
];

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
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
): MapLayerDefinition[] {
  const { colors, zoom } = getMapTheme(theme);

  return buildSpatialProfileLayers((profile) =>
    roadLayerConfigs.map((config) => {
      const profileZoom = zoom.detailProfiles[profile].roads;
      const baseFilter = createRoadFilter(roadClassFilters[config.classKey]);
      const minzoomKey = `${config.zoomKey}MinZoom` as const;
      const opacityKey = `${config.zoomKey}Opacity` as const;
      const widthKey = `${config.zoomKey}Width` as const;
      const originalMinZoom = profileZoom[minzoomKey];
      const lineOpacityMultiplier = resolveDetailProfileValue(
        profile,
        colors.detailContext.focused.lineOpacityMultiplier,
        colors.detailContext.ambient.lineOpacityMultiplier,
      ) * config.opacityContrastMultiplier;
      const lineWidthMultiplier = resolveDetailProfileValue(
        profile,
        colors.detailContext.focused.lineWidthMultiplier,
        colors.detailContext.ambient.lineWidthMultiplier,
      ) * config.widthContrastMultiplier;
      const zoomRange = resolveLayerZoomRange(originalMinZoom);

      return {
        id: createDetailLayerId(config.baseId, profile),
        type: "line",
        source: vectorSourceId,
        "source-layer": TRANSPORTATION_SOURCE_LAYER,
        ...zoomRange,
        filter: createDetailProfileFilter(baseFilter, detailContext, profile),
        layout: {
          "line-cap": "round",
          "line-join": "round",
          visibility: getDetailProfileVisibility(detailContext, profile),
        },
        paint: {
          "line-color": colors.roads[config.colorKey],
          "line-opacity": getZoomInterpolatedNumber(createFadedOpacityStops(profileZoom[opacityKey], {
            multiplier: lineOpacityMultiplier,
            minZoom: originalMinZoom,
          })),
          "line-width": getZoomInterpolatedNumber(createFadedWidthStops(profileZoom[widthKey], {
            multiplier: lineWidthMultiplier,
            minZoom: originalMinZoom,
          })),
        },
      };
    }),
  );
}
