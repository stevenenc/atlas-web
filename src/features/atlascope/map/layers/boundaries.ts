import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import { atlascopeMapConfig } from "../core/config";
import type { MapLayerDefinition } from "../core/provider";
import { DEFAULT_MAP_DETAIL_CONTEXT, type MapDetailContext } from "../core/types";
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

const BOUNDARY_SOURCE_LAYER = "boundary";

type BoundaryLayerConfig = {
  baseId: string;
  colorKey: "country" | "region";
  minZoomKey: "countryMinZoom" | "regionMinZoom";
  widthKey: "countryWidth" | "regionWidth";
  opacityKey: "countryOpacity" | "regionOpacity";
  filter: MapLayerDefinition["filter"];
  dasharray?: readonly number[];
};

const boundaryLayerConfigs: BoundaryLayerConfig[] = [
  {
    baseId: "atlascope-boundary-country",
    colorKey: "country",
    minZoomKey: "countryMinZoom",
    widthKey: "countryWidth",
    opacityKey: "countryOpacity",
    filter: [
      "all",
      ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false],
      ["==", ["get", "admin_level"], 2],
      ["!=", ["get", "maritime"], 1],
      ["!=", ["get", "disputed"], 1],
      ["!", ["has", "claimed_by"]],
    ],
  },
  {
    baseId: "atlascope-boundary-region",
    colorKey: "region",
    minZoomKey: "regionMinZoom",
    widthKey: "regionWidth",
    opacityKey: "regionOpacity",
    filter: [
      "all",
      ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false],
      [">=", ["get", "admin_level"], 3],
      ["<=", ["get", "admin_level"], 6],
      ["!=", ["get", "maritime"], 1],
      ["!=", ["get", "disputed"], 1],
      ["!", ["has", "claimed_by"]],
    ],
    dasharray: [2.2, 1.4],
  },
];

export function createBoundaryLayerDefinitions(
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
): MapLayerDefinition[] {
  const { colors, zoom } = getMapTheme(theme);

  return buildSpatialProfileLayers((profile) =>
    boundaryLayerConfigs.map((config) => {
      const profileZoom = zoom.detailProfiles[profile].boundaries;
      const originalMinZoom = profileZoom[config.minZoomKey];
      const boundaryOpacityMultiplier = resolveDetailProfileValue(
        profile,
        colors.detailContext.focused.boundaryOpacityMultiplier,
        colors.detailContext.ambient.boundaryOpacityMultiplier,
      );
      const boundaryWidthMultiplier = resolveDetailProfileValue(
        profile,
        colors.detailContext.focused.boundaryWidthMultiplier,
        colors.detailContext.ambient.boundaryWidthMultiplier,
      );
      const zoomRange = resolveLayerZoomRange(originalMinZoom);

      return {
        id: createDetailLayerId(config.baseId, profile),
        type: "line",
        source: vectorSourceId,
        "source-layer": BOUNDARY_SOURCE_LAYER,
        ...zoomRange,
        filter: createDetailProfileFilter(config.filter, detailContext, profile),
        layout: {
          "line-cap": "round",
          "line-join": "round",
          visibility: getDetailProfileVisibility(detailContext, profile),
        },
        paint: {
          "line-color": colors.boundary[config.colorKey],
          "line-opacity": getZoomInterpolatedNumber(createFadedOpacityStops(profileZoom[config.opacityKey], {
            multiplier: boundaryOpacityMultiplier,
            minZoom: originalMinZoom,
          })),
          "line-width": getZoomInterpolatedNumber(createFadedWidthStops(profileZoom[config.widthKey], {
            multiplier: boundaryWidthMultiplier,
            minZoom: originalMinZoom,
          })),
          ...(config.dasharray ? { "line-dasharray": config.dasharray } : {}),
        },
      };
    }),
  );
}
