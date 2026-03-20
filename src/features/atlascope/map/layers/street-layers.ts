import type { ThemeMode } from "@/features/atlascope/config/theme";

import type {
  MapLayerDefinition,
  VectorMapProvider,
} from "../core/provider";
import { atlascopeMapConfig } from "../core/config";
import { createRoadLabelLayerDefinitions } from "./labels";
import { createRoadLayerDefinitions } from "./roads";

export function createStreetLayerDefinitions(
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
): MapLayerDefinition[] {
  return [
    ...createRoadLayerDefinitions(theme, vectorSourceId),
    ...createRoadLabelLayerDefinitions(theme, vectorSourceId),
  ];
}

export function addStreetLayers(
  provider: VectorMapProvider,
  theme: ThemeMode,
  vectorSourceId = atlascopeMapConfig.basemap.vectorSourceId,
) {
  createStreetLayerDefinitions(theme, vectorSourceId).forEach((layer) => {
    provider.addLayer(layer);
  });
}
