import { getMapTheme, type ThemeMode } from "@/features/atlascope/config/theme";

import {
  createConstantZoomStops,
  createFadedOpacityStops,
  createFadedWidthStops,
  getZoomInterpolatedColor,
  getZoomInterpolatedNumber,
  resolveLayerZoomRange,
} from "./style-config";
import type {
  MapLayerDefinition,
  MapSourceDefinition,
  MapStyleDefinition,
} from "../core/provider";
import { atlascopeMapConfig } from "../core/config";

const operationalLayerOrder = [
  "natural_earth",
  "water",
  "atlascope-coastline-outline-base",
  "atlascope-coastline-outline-top",
  "label_state",
  "label_country_3",
  "label_country_2",
  "label_country_1",
] as const;

const retainedLayerIds = new Set<string>(operationalLayerOrder);

export function cleanStyle(
  baseStyle: MapStyleDefinition,
  theme: ThemeMode,
): MapStyleDefinition {
  const mapTheme = getMapTheme(theme);
  const { colors, zoom } = mapTheme;
  const vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId;
  const rasterSourceId = atlascopeMapConfig.basemap.terrainRasterSourceId;
  const retainedLayers = (baseStyle.layers ?? [])
    .filter((layer) => retainedLayerIds.has(layer.id))
    .map((layer) => restyleBaseLayer(layer, theme));
  const allowedSources = new Set([vectorSourceId, rasterSourceId]);

  return {
    version: 8,
    glyphs: baseStyle.glyphs,
    sprite: baseStyle.sprite,
    sources: pickSources(baseStyle.sources, allowedSources),
    layers: [
      {
        id: "atlascope-background",
        type: "background",
        paint: {
          "background-color": getZoomInterpolatedColor(colors.land, zoom.detail.regional),
        },
      },
      ...createCoastlineOutlineLayers(vectorSourceId, theme),
      ...sortLayers(retainedLayers),
    ],
  };
}

function pickSources(
  sources: Record<string, MapSourceDefinition>,
  sourceIds: Set<string>,
) {
  return Object.fromEntries(
    Object.entries(sources).filter(([sourceId]) => sourceIds.has(sourceId)),
  );
}

function sortLayers(layers: MapLayerDefinition[]) {
  const layerOrder = new Map<string, number>(
    operationalLayerOrder.map((layerId, index) => [layerId, index]),
  );

  return [...layers].sort((left, right) => {
    const leftOrder = layerOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = layerOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER;

    return leftOrder - rightOrder;
  });
}

function restyleBaseLayer(layer: MapLayerDefinition, theme: ThemeMode): MapLayerDefinition {
  const { colors, zoom } = getMapTheme(theme);
  const zoomRange = resolveLayerZoomRange(
    layer.minzoom as number | undefined,
    layer.maxzoom as number | undefined,
  );

  switch (layer.id) {
    case "natural_earth":
      return {
        ...layer,
        ...zoomRange,
        paint: {
          ...layer.paint,
          "raster-opacity":
            theme === "dark"
              ? ["interpolate", ["linear"], ["zoom"], 0, 0.04, 6, 0.02]
              : ["interpolate", ["linear"], ["zoom"], 0, 0.018, 6, 0.008],
        },
      };
    case "water":
      const baseWaterOpacity = Number.isFinite(layer.paint?.["fill-opacity"])
        ? (layer.paint?.["fill-opacity"] as number)
        : 1;

      return {
        ...layer,
        ...zoomRange,
        paint: {
          ...layer.paint,
          "fill-color": getZoomInterpolatedColor(colors.water, zoom.detail.regional),
          "fill-opacity": getZoomInterpolatedNumber(createFadedOpacityStops(
            createConstantZoomStops(
              baseWaterOpacity,
              layer.minzoom as number | undefined,
              layer.maxzoom as number | undefined,
            ),
            {
              minZoom: layer.minzoom as number | undefined,
              maxZoom: layer.maxzoom as number | undefined,
            },
          )),
        },
      };
    default:
      const isStateLabel = layer.id === "label_state";

      return {
        ...layer,
        ...zoomRange,
        layout: {
          ...layer.layout,
          "text-font": ["Noto Sans Regular"],
        },
        paint: {
          ...layer.paint,
          "text-color": isStateLabel ? colors.labels.secondary : colors.labels.major,
          "text-halo-color": colors.labels.halo,
          "text-halo-width": isStateLabel
            ? getZoomInterpolatedNumber(zoom.labels.stateHaloWidth)
            : getZoomInterpolatedNumber(zoom.labels.regionHaloWidth),
          "text-opacity": getZoomInterpolatedNumber(
            createFadedOpacityStops(
              isStateLabel ? zoom.labels.stateOpacity : zoom.labels.regionOpacity,
              {
                minZoom: layer.minzoom as number | undefined,
                maxZoom: layer.maxzoom as number | undefined,
              },
            ),
          ),
          "icon-opacity": 0,
        },
      };
  }
}

function createCoastlineOutlineLayers(
  vectorSourceId: string,
  theme: ThemeMode,
): MapLayerDefinition[] {
  const { colors, zoom } = getMapTheme(theme);

  const sharedLayer = {
    type: "line",
    source: vectorSourceId,
    "source-layer": "water",
    filter: ["!=", ["get", "brunnel"], "tunnel"],
    layout: {
      "line-cap": "round",
      "line-join": "round",
      visibility: "visible",
    },
  } satisfies Partial<MapLayerDefinition>;

  return [
    {
      ...sharedLayer,
      id: "atlascope-coastline-outline-base",
      paint: {
        "line-color": colors.outline.coastlineBase,
        "line-opacity": getZoomInterpolatedNumber(
          createFadedOpacityStops(zoom.boundaries.coastlineBaseOpacity),
        ),
        "line-width": getZoomInterpolatedNumber(
          createFadedWidthStops(zoom.boundaries.coastlineBaseWidth),
        ),
        "line-blur": theme === "dark" ? 0.42 : 0.2,
      },
    },
    {
      ...sharedLayer,
      id: "atlascope-coastline-outline-top",
      paint: {
        "line-color": colors.outline.coastlineTop,
        "line-opacity": getZoomInterpolatedNumber(
          createFadedOpacityStops(zoom.boundaries.coastlineTopOpacity),
        ),
        "line-width": getZoomInterpolatedNumber(
          createFadedWidthStops(zoom.boundaries.coastlineTopWidth),
        ),
        "line-blur": theme === "dark" ? 0.16 : 0.08,
      },
    },
  ];
}
