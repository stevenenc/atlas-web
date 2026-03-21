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
};

const roadLayerConfigs: RoadLayerConfig[] = [
  {
    baseId: "atlascope-road-major",
    classKey: "major",
    colorKey: "major",
    zoomKey: "major",
  },
  {
    baseId: "atlascope-road-secondary",
    classKey: "secondary",
    colorKey: "secondary",
    zoomKey: "secondary",
  },
  {
    baseId: "atlascope-road-tertiary",
    classKey: "tertiary",
    colorKey: "minor",
    zoomKey: "minor",
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

  return detailProfiles.flatMap((profile) =>
    roadLayerConfigs.map((config) => {
      const profileZoom = zoom.detailProfiles[profile].roads;
      const profileTheme = colors.detailContext[profile];
      const baseFilter = createRoadFilter(roadClassFilters[config.classKey]);
      const minzoomKey = `${config.zoomKey}MinZoom` as const;
      const opacityKey = `${config.zoomKey}Opacity` as const;
      const widthKey = `${config.zoomKey}Width` as const;

      return {
        id: createDetailLayerId(config.baseId, profile),
        type: "line",
        source: vectorSourceId,
        "source-layer": TRANSPORTATION_SOURCE_LAYER,
        minzoom: profileZoom[minzoomKey],
        filter: createDetailProfileFilter(baseFilter, detailContext, profile),
        layout: {
          "line-cap": "round",
          "line-join": "round",
          visibility: getDetailProfileVisibility(detailContext, profile),
        },
        paint: {
          "line-color": colors.roads[config.colorKey],
          "line-opacity": getZoomInterpolatedNumber(
            scaleZoomStops(profileZoom[opacityKey], profileTheme.lineOpacityMultiplier),
          ),
          "line-width": getZoomInterpolatedNumber(
            scaleZoomStops(profileZoom[widthKey], profileTheme.lineWidthMultiplier),
          ),
        },
      };
    }),
  );
}
