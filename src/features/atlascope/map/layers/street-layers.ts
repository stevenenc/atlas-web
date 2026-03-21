import type { ThemeMode } from "@/features/atlascope/config/theme";

import type {
  MapLayerDefinition,
  MapLayerStyleUpdate,
  VectorMapProvider,
} from "../core/provider";
import { atlascopeMapConfig } from "../core/config";
import {
  DEFAULT_MAP_DETAIL_CONTEXT,
  type MapDetailContext,
} from "../core/types";
import { createBoundaryLayerDefinitions } from "./boundaries";
import { createRoadLabelLayerDefinitions } from "./labels";
import { createLanduseLayerDefinitions } from "./landuse";
import { createRoadLayerDefinitions } from "./roads";
import { createWaterLabelLayerDefinitions } from "./water-labels";

export function createDetailLayerDefinitions(
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
): MapLayerDefinition[] {
  return [
    ...createLanduseLayerDefinitions(theme, vectorSourceId, detailContext),
    ...createBoundaryLayerDefinitions(theme, vectorSourceId, detailContext),
    ...createRoadLayerDefinitions(theme, vectorSourceId, detailContext),
    ...createWaterLabelLayerDefinitions(theme, vectorSourceId, detailContext),
    ...createRoadLabelLayerDefinitions(theme, vectorSourceId, detailContext),
  ];
}

export function createDetailLayerStyleUpdates(
  theme: ThemeMode,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
) {
  return createDetailLayerDefinitions(theme, vectorSourceId, detailContext).map((layer) => ({
    id: layer.id,
    definition: layer,
    style: {
      layout: layer.layout,
      paint: layer.paint,
      minzoom: layer.minzoom,
      maxzoom: layer.maxzoom,
      filter: layer.filter,
    } satisfies MapLayerStyleUpdate,
  }));
}

export function addDetailLayers(
  provider: VectorMapProvider,
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
) {
  createDetailLayerDefinitions(theme, vectorSourceId, detailContext).forEach((layer) => {
    provider.addLayer(layer);
  });
}

export const createStreetLayerDefinitions = createDetailLayerDefinitions;
export const createStreetLayerStyleUpdates = createDetailLayerStyleUpdates;
export const addStreetLayers = addDetailLayers;
