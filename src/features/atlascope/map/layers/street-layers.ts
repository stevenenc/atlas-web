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
import { createRoadLabelLayerDefinitions } from "./labels";
import { createRoadLayerDefinitions } from "./roads";

export function createStreetLayerDefinitions(
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
): MapLayerDefinition[] {
  return [
    ...createRoadLayerDefinitions(theme, vectorSourceId, detailContext),
    ...createRoadLabelLayerDefinitions(theme, vectorSourceId, detailContext),
  ];
}

export function createStreetLayerStyleUpdates(
  theme: ThemeMode,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
) {
  return createStreetLayerDefinitions(theme, vectorSourceId, detailContext).map((layer) => ({
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

export function addStreetLayers(
  provider: VectorMapProvider,
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
  detailContext: MapDetailContext = DEFAULT_MAP_DETAIL_CONTEXT,
) {
  createStreetLayerDefinitions(theme, vectorSourceId, detailContext).forEach((layer) => {
    provider.addLayer(layer);
  });
}
