import type {
  MapDetailContext,
} from "@/features/atlascope/map/core/types";

import { createPolygonGeometry } from "../lib/geojson";
import type { MapLayerDefinition } from "../core/provider";

export type StreetDetailProfile = "ambient" | "focused";
export type StreetDetailScope = "global" | "context";

const NO_MATCH_FILTER = ["==", 1, 0] as const;

export function createStreetLayerId(
  baseId: string,
  profile: StreetDetailProfile,
  scope: StreetDetailScope,
) {
  return `${baseId}-${profile}-${scope}`;
}

export function getStreetLayerVisibility(
  detailContext: MapDetailContext,
  profile: StreetDetailProfile,
  scope: StreetDetailScope,
) {
  if (detailContext.mode === "focused-geofence") {
    if (scope === "context") {
      return profile === "focused" ? "visible" : "none";
    }

    return profile === "ambient" ? "visible" : "none";
  }

  if (scope === "context") {
    return "none";
  }

  return profile === "focused" ? "visible" : "none";
}

export function createScopedLayerFilter(
  baseFilter: MapLayerDefinition["filter"],
  detailContext: MapDetailContext,
  scope: StreetDetailScope,
) {
  if (scope === "global") {
    return baseFilter;
  }

  if (
    detailContext.mode !== "focused-geofence" ||
    !detailContext.focusGeometry ||
    detailContext.focusGeometry.length < 3
  ) {
    return combineLayerFilters(baseFilter, NO_MATCH_FILTER);
  }

  return combineLayerFilters(
    baseFilter,
    ["within", createPolygonGeometry(detailContext.focusGeometry)],
  );
}

function combineLayerFilters(...filters: Array<MapLayerDefinition["filter"] | undefined>) {
  const validFilters = filters.filter((filter) => filter !== undefined);

  if (!validFilters.length) {
    return undefined;
  }

  if (validFilters.length === 1) {
    return validFilters[0];
  }

  return ["all", ...validFilters];
}
