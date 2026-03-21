import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import { atlascopeMapConfig } from "../core/config";
import type { MapLayerDefinition } from "../core/provider";
import { DEFAULT_MAP_DETAIL_CONTEXT, type MapDetailContext } from "../core/types";
import {
  createFadedOpacityStops,
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

type LanduseLayerConfig = {
  baseId: string;
  sourceLayer: "park" | "landcover" | "landuse";
  colorKey: keyof ReturnType<typeof getMapTheme>["colors"]["landuse"];
  minZoomKey:
    | "parkMinZoom"
    | "woodMinZoom"
    | "residentialMinZoom"
    | "civicMinZoom"
    | "wetlandMinZoom";
  opacityKey:
    | "parkOpacity"
    | "woodOpacity"
    | "residentialOpacity"
    | "civicOpacity"
    | "wetlandOpacity";
  filter?: MapLayerDefinition["filter"];
};

const landuseLayerConfigs: LanduseLayerConfig[] = [
  {
    baseId: "atlascope-landuse-park",
    sourceLayer: "park",
    colorKey: "park",
    minZoomKey: "parkMinZoom",
    opacityKey: "parkOpacity",
    filter: ["match", ["geometry-type"], ["Polygon", "MultiPolygon"], true, false],
  },
  {
    baseId: "atlascope-landcover-wood",
    sourceLayer: "landcover",
    colorKey: "wood",
    minZoomKey: "woodMinZoom",
    opacityKey: "woodOpacity",
    filter: ["==", ["get", "class"], "wood"],
  },
  {
    baseId: "atlascope-landcover-grass",
    sourceLayer: "landcover",
    colorKey: "grass",
    minZoomKey: "woodMinZoom",
    opacityKey: "woodOpacity",
    filter: ["==", ["get", "class"], "grass"],
  },
  {
    baseId: "atlascope-landuse-residential",
    sourceLayer: "landuse",
    colorKey: "residential",
    minZoomKey: "residentialMinZoom",
    opacityKey: "residentialOpacity",
    filter: ["==", ["get", "class"], "residential"],
  },
  {
    baseId: "atlascope-landuse-civic",
    sourceLayer: "landuse",
    colorKey: "civic",
    minZoomKey: "civicMinZoom",
    opacityKey: "civicOpacity",
    filter: [
      "match",
      ["get", "class"],
      ["cemetery", "hospital", "school", "pitch", "track"],
      true,
      false,
    ],
  },
  {
    baseId: "atlascope-landcover-wetland",
    sourceLayer: "landcover",
    colorKey: "wetland",
    minZoomKey: "wetlandMinZoom",
    opacityKey: "wetlandOpacity",
    filter: ["==", ["get", "class"], "wetland"],
  },
];

export function createLanduseLayerDefinitions(
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
): MapLayerDefinition[] {
  const { colors, zoom } = getMapTheme(theme);

  return buildSpatialProfileLayers((profile) =>
    landuseLayerConfigs.map((config) => {
      const profileZoom = zoom.detailProfiles[profile].landuse;
      const originalMinZoom = profileZoom[config.minZoomKey];
      const fillOpacityMultiplier = resolveDetailProfileValue(
        profile,
        colors.detailContext.focused.fillOpacityMultiplier,
        colors.detailContext.ambient.fillOpacityMultiplier,
      );
      const zoomRange = resolveLayerZoomRange(originalMinZoom);

      return {
        id: createDetailLayerId(config.baseId, profile),
        type: "fill",
        source: vectorSourceId,
        "source-layer": config.sourceLayer,
        ...zoomRange,
        // MapLibre's `within` expression does not classify polygon features in
        // v5.20.x, so landuse uses polygon intersection via `distance == 0`.
        filter: createDetailProfileFilter(
          config.filter,
          detailContext,
          profile,
          "intersects",
        ),
        layout: {
          visibility: getDetailProfileVisibility(detailContext, profile),
        },
        paint: {
          "fill-antialias": true,
          "fill-color": colors.landuse[config.colorKey],
          "fill-opacity": getZoomInterpolatedNumber(createFadedOpacityStops(profileZoom[config.opacityKey], {
            multiplier: fillOpacityMultiplier,
            minZoom: originalMinZoom,
          })),
        },
      };
    }),
  );
}
