import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import { atlascopeMapConfig } from "../core/config";
import type { MapLayerDefinition } from "../core/provider";
import { DEFAULT_MAP_DETAIL_CONTEXT, type MapDetailContext } from "../core/types";
import {
  extendZoomStopsWithFade,
  getZoomInterpolatedNumber,
  scaleZoomStops,
  softenMinZoom,
} from "../style/style-config";
import {
  DETAIL_CONTEXT_PAINT_TRANSITION,
  buildSpatialProfileLayers,
  createDetailLayerId,
  createDetailProfileFilter,
  getDetailProfileVisibility,
  resolveDetailProfileValue,
} from "./detail-context";

const WATER_LABEL_SOURCE_LAYER = "water_name";

type WaterLabelConfig = {
  baseId: string;
  geometryFilter: MapLayerDefinition["filter"];
  minZoomKey: "pointMinZoom" | "lineMinZoom";
  opacityKey: "pointOpacity" | "lineOpacity";
  layout: MapLayerDefinition["layout"];
};

const waterLabelConfigs: WaterLabelConfig[] = [
  {
    baseId: "atlascope-water-label-point",
    geometryFilter: [
      "all",
      ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false],
      ["any", ["has", "name_en"], ["has", "name"]],
    ],
    minZoomKey: "pointMinZoom",
    opacityKey: "pointOpacity",
    layout: {
      "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
      "text-font": ["Noto Sans Italic"],
      "text-letter-spacing": 0.02,
      "text-size": ["interpolate", ["linear"], ["zoom"], 9, 10.5, 14.5, 12.5],
    },
  },
  {
    baseId: "atlascope-water-label-line",
    geometryFilter: [
      "all",
      ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false],
      ["any", ["has", "name_en"], ["has", "name"]],
    ],
    minZoomKey: "lineMinZoom",
    opacityKey: "lineOpacity",
    layout: {
      "symbol-placement": "line",
      "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
      "text-font": ["Noto Sans Italic"],
      "text-keep-upright": true,
      "text-letter-spacing": 0.03,
      "text-max-angle": 30,
      "text-size": ["interpolate", ["linear"], ["zoom"], 10.8, 10.2, 14.5, 11.6],
    },
  },
];

export function createWaterLabelLayerDefinitions(
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
): MapLayerDefinition[] {
  const { colors, zoom } = getMapTheme(theme);

  return buildSpatialProfileLayers((profile) =>
    waterLabelConfigs.map((config) => {
      const profileZoom = zoom.detailProfiles[profile].waterLabels;
      const originalMinZoom = profileZoom[config.minZoomKey];
      const labelOpacityMultiplier = resolveDetailProfileValue(
        profile,
        colors.detailContext.focused.labelOpacityMultiplier,
        colors.detailContext.ambient.labelOpacityMultiplier,
      );

      return {
        id: createDetailLayerId(config.baseId, profile),
        type: "symbol",
        source: vectorSourceId,
        "source-layer": WATER_LABEL_SOURCE_LAYER,
        minzoom: softenMinZoom(originalMinZoom),
        filter: createDetailProfileFilter(config.geometryFilter, detailContext, profile),
        layout: {
          ...config.layout,
          visibility: getDetailProfileVisibility(detailContext, profile),
        },
        paint: {
          "text-color": colors.waterLabels.text,
          "text-halo-color": colors.waterLabels.halo,
          "text-halo-width": theme === "dark" ? 1.05 : 0.95,
          "text-opacity": getZoomInterpolatedNumber(
            extendZoomStopsWithFade(
              scaleZoomStops(profileZoom[config.opacityKey], labelOpacityMultiplier),
              originalMinZoom,
            ),
          ),
          "text-opacity-transition": DETAIL_CONTEXT_PAINT_TRANSITION,
        },
      };
    }),
  );
}
