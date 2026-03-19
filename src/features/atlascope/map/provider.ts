export type MapProviderId = "maplibre" | "mapbox";

export const MAP_PROVIDER = "maplibre" satisfies MapProviderId;

export function isImplementedMapProvider(
  provider: MapProviderId,
): provider is typeof MAP_PROVIDER {
  return provider === "maplibre";
}
