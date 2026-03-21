import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import { DEFAULT_MAP_DETAIL_CONTEXT, type MapDetailContext } from "../core/types";
import { atlascopeMapConfig } from "../core/config";
import type { MapLayerDefinition } from "../core/provider";
import { getZoomInterpolatedNumber } from "../style/style-config";
import {
  createScopedLayerFilter,
  createStreetLayerId,
  getStreetLayerVisibility,
  type StreetDetailProfile,
  type StreetDetailScope,
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

const streetLayerScopes: StreetDetailScope[] = ["global", "context"];
const streetLayerProfiles: StreetDetailProfile[] = ["ambient", "focused"];

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

  return streetLayerProfiles.flatMap((profile) =>
    streetLayerScopes.flatMap((scope) =>
      roadLayerConfigs.map((config) => {
        const profileZoom = zoom.streetDetailProfiles[profile].roads;
        const baseFilter = createRoadFilter(roadClassFilters[config.classKey]);
        const isVisible = getStreetLayerVisibility(detailContext, profile, scope);
        const minzoomKey = `${config.zoomKey}MinZoom` as const;
        const opacityKey = `${config.zoomKey}Opacity` as const;
        const widthKey = `${config.zoomKey}Width` as const;

        return {
          id: createStreetLayerId(config.baseId, profile, scope),
          type: "line",
          source: vectorSourceId,
          "source-layer": TRANSPORTATION_SOURCE_LAYER,
          minzoom: profileZoom[minzoomKey],
          filter: createScopedLayerFilter(baseFilter, detailContext, scope),
          layout: {
            "line-cap": "round",
            "line-join": "round",
            visibility: isVisible,
          },
          paint: {
            "line-color": colors.roads[config.colorKey],
            "line-opacity": getZoomInterpolatedNumber(profileZoom[opacityKey]),
            "line-width": getZoomInterpolatedNumber(profileZoom[widthKey]),
          },
        };
      }),
    ),
  );
}
