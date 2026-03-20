import type { ComponentType } from "react";

import { atlascopeMapConfig } from "@/features/atlascope/map/map-config";
import { MapLibreMap } from "@/features/atlascope/map/providers/maplibre-map";
import {
  isImplementedMapProvider,
  type MapProviderId,
} from "@/features/atlascope/map/map-provider";
import type { MapContainerProps } from "@/features/atlascope/map/map-types";

type MapAdapterComponent = ComponentType<MapContainerProps>;
type ImplementedMapProvider = "maplibre";

const implementedAdapters = {
  maplibre: MapLibreMap,
} satisfies Record<ImplementedMapProvider, MapAdapterComponent>;

export function resolveMapAdapter(
  provider: MapProviderId = atlascopeMapConfig.provider,
) {
  if (!isImplementedMapProvider(provider)) {
    throw new Error(
      `Map provider "${provider}" is not implemented yet. Add a provider adapter in src/features/atlascope/map/.`,
    );
  }

  return implementedAdapters[provider];
}
