import type { JSX } from "react";

import { atlascopeMapConfig } from "./map-config";
import { MapLibreMap } from "./maplibre/maplibre-map";
import { isImplementedMapProvider, type MapProviderId } from "./provider";
import type { MapContainerProps } from "./map-types";

type MapAdapterComponent = (props: MapContainerProps) => JSX.Element;
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
