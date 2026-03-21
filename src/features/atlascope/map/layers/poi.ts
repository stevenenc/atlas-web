import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import { atlascopeMapConfig } from "../core/config";
import type { MapLayerDefinition } from "../core/provider";
import { DEFAULT_MAP_DETAIL_CONTEXT, type MapDetailContext } from "../core/types";
import { getZoomInterpolatedNumber, scaleZoomStops } from "../style/style-config";
import {
  createDetailLayerId,
  createDetailProfileFilter,
  detailProfiles,
  getDetailProfileVisibility,
} from "./detail-context";

const POI_SOURCE_LAYER = "poi";

type PoiLayerConfig = {
  baseId: string;
  colorKey: "emergency" | "civic" | "transport";
  minZoomKey: "emergencyMinZoom" | "civicMinZoom" | "transportMinZoom";
  opacityKey: "emergencyOpacity" | "civicOpacity" | "transportOpacity";
  maxRank: number;
  classes?: readonly string[];
  subclasses?: readonly string[];
  textSize: readonly unknown[];
};

const poiLayerConfigs: PoiLayerConfig[] = [
  {
    baseId: "atlascope-poi-emergency",
    colorKey: "emergency",
    minZoomKey: "emergencyMinZoom",
    opacityKey: "emergencyOpacity",
    maxRank: 10,
    classes: ["hospital"],
    subclasses: ["hospital", "clinic", "fire_station", "police", "emergency", "doctors"],
    textSize: ["interpolate", ["linear"], ["zoom"], 12.5, 10.2, 14.5, 11.6],
  },
  {
    baseId: "atlascope-poi-civic",
    colorKey: "civic",
    minZoomKey: "civicMinZoom",
    opacityKey: "civicOpacity",
    maxRank: 7,
    classes: ["college", "school", "stadium"],
    subclasses: ["college", "school", "university", "town_hall", "government"],
    textSize: ["interpolate", ["linear"], ["zoom"], 13.2, 9.8, 14.5, 11.2],
  },
  {
    baseId: "atlascope-poi-transport",
    colorKey: "transport",
    minZoomKey: "transportMinZoom",
    opacityKey: "transportOpacity",
    maxRank: 8,
    classes: ["airport", "bus", "rail"],
    textSize: ["interpolate", ["linear"], ["zoom"], 12.1, 10, 14.5, 11.4],
  },
];

function createPoiFilter(config: PoiLayerConfig) {
  const categoryFilters: unknown[] = [];

  if (config.classes?.length) {
    categoryFilters.push(["match", ["get", "class"], [...config.classes], true, false]);
  }

  if (config.subclasses?.length) {
    categoryFilters.push([
      "match",
      ["get", "subclass"],
      [...config.subclasses],
      true,
      false,
    ]);
  }

  return [
    "all",
    ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false],
    ["<=", ["coalesce", ["get", "rank"], 99], config.maxRank],
    categoryFilters.length === 1 ? categoryFilters[0] : ["any", ...categoryFilters],
    ["any", ["has", "name_en"], ["has", "name"]],
  ] as const;
}

export function createPoiLayerDefinitions(
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
): MapLayerDefinition[] {
  const { colors, zoom } = getMapTheme(theme);

  return detailProfiles.flatMap((profile) =>
    poiLayerConfigs.map((config) => {
      const profileZoom = zoom.detailProfiles[profile].poi;

      return {
        id: createDetailLayerId(config.baseId, profile),
        type: "symbol",
        source: vectorSourceId,
        "source-layer": POI_SOURCE_LAYER,
        minzoom: profileZoom[config.minZoomKey],
        filter: createDetailProfileFilter(createPoiFilter(config), detailContext, profile),
        layout: {
          "text-anchor": "top",
          "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-max-width": 10,
          "text-offset": [0, 0.7],
          "text-size": config.textSize,
          "text-optional": true,
          visibility: getDetailProfileVisibility(detailContext, profile),
        },
        paint: {
          "text-color": colors.poi[config.colorKey],
          "text-halo-color": colors.poi.halo,
          "text-halo-width": theme === "dark" ? 1.1 : 1,
          "text-opacity": getZoomInterpolatedNumber(
            scaleZoomStops(
              profileZoom[config.opacityKey],
              colors.detailContext[profile].poiOpacityMultiplier,
            ),
          ),
        },
      };
    }),
  );
}
