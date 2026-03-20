import type { ComponentType } from "react";

import { MapLibreMap } from "../providers/maplibre-map";
import { atlascopeMapConfig } from "./config";
import {
  isImplementedMapProvider,
  type MapProviderId,
} from "./provider";
import type { MapContainerProps } from "./types";

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
      `Map provider "${provider}" is not implemented yet. Add a provider adapter in src/features/atlascope/map/providers/.`,
    );
  }

  return implementedAdapters[provider];
}
