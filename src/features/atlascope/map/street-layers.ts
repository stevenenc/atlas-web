import type { ThemeMode } from "@/features/atlascope/config/theme";
import { atlascopeMapConfig } from "@/features/atlascope/map/map-config";
import { createRoadLabelLayerDefinitions } from "@/features/atlascope/map/map-labels";
import { createRoadLayerDefinitions } from "@/features/atlascope/map/map-roads";
import type {
  MapLayerDefinition,
  VectorMapProvider,
} from "@/features/atlascope/map/map-provider";

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
