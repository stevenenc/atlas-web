import type { MapVisibility } from "@/features/atlascope/map/core/provider";
import type { MapDetailContext } from "@/features/atlascope/map/core/types";

import { createPolygonGeometry } from "../lib/geojson";
import type { MapLayerDefinition } from "../core/provider";

export type DetailProfile = "ambient" | "focused";

export const detailProfiles: DetailProfile[] = ["ambient", "focused"];

const NO_MATCH_FILTER = [
  "==",
  ["get", "__atlascope_detail_context__"],
  "__atlascope_no_match__",
] as const;

export function createDetailLayerId(baseId: string, profile: DetailProfile) {
  return `${baseId}-${profile}`;
}

export function getDetailProfileVisibility(
  detailContext: MapDetailContext,
  profile: DetailProfile,
): MapVisibility {
  if (!hasDetailFocusGeometry(detailContext)) {
    return profile === "focused" ? "visible" : "none";
  }

  return "visible";
}

export function createDetailProfileFilter(
  baseFilter: MapLayerDefinition["filter"],
  detailContext: MapDetailContext,
  profile: DetailProfile,
) {
  if (!hasDetailFocusGeometry(detailContext)) {
    return profile === "focused" ? baseFilter : combineLayerFilters(baseFilter, NO_MATCH_FILTER);
  }

  // Focused layers are clipped to the active geofence while ambient layers are
  // explicitly pushed outside it, which avoids double rendering when context mode is active.
  const focusGeometry = createPolygonGeometry(detailContext.focusGeometry!);
  const focusFilter =
    profile === "focused"
      ? (["within", focusGeometry] as const)
      : (["!", ["within", focusGeometry]] as const);

  return combineLayerFilters(baseFilter, focusFilter);
}

export function hasDetailFocusGeometry(detailContext: MapDetailContext) {
  return (
    detailContext.mode === "geofence-focus" &&
    Boolean(detailContext.focusGeometry && detailContext.focusGeometry.length >= 3)
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
