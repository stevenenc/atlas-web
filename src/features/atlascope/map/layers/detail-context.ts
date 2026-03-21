import type { MapVisibility } from "@/features/atlascope/map/core/provider";
import {
  DETAIL_CONTEXT_TRANSITION_MS,
  type MapDetailContext,
} from "@/features/atlascope/map/core/types";

import type { MapLayerDefinition } from "../core/provider";

export type DetailProfile = "ambient" | "focused";
type DetailProfileSpatialMatch = "intersects" | "within";

const DETAIL_PROFILES: readonly DetailProfile[] = ["ambient", "focused"];
// This is intentionally reserved for non-zoom style updates such as the detail
// mask and symbol paint changes. It is not used as a fix for vector zoom pop-in.
export const DETAIL_CONTEXT_PAINT_TRANSITION = {
  duration: DETAIL_CONTEXT_TRANSITION_MS,
  delay: 0,
} as const;

export function createDetailLayerId(baseId: string, profile: DetailProfile) {
  return `${baseId}-${profile}`;
}

export function buildSpatialProfileLayers<T>(
  buildProfileLayers: (profile: DetailProfile) => T[],
) {
  return DETAIL_PROFILES.flatMap((profile) => buildProfileLayers(profile));
}

export function getDetailProfileVisibility(
  detailContext: MapDetailContext,
  profile: DetailProfile,
): MapVisibility {
  if (profile === "ambient") {
    return "visible";
  }

  return hasFocusedDetailContext(detailContext) ? "visible" : "none";
}

export function createDetailProfileFilter(
  baseFilter: MapLayerDefinition["filter"],
  detailContext: MapDetailContext,
  profile: DetailProfile,
  spatialMatch: DetailProfileSpatialMatch = "within",
) {
  const spatialFilter = createSpatialDetailProfileFilter(
    detailContext,
    profile,
    spatialMatch,
  );

  if (!spatialFilter) {
    return baseFilter;
  }

  return combineLayerFilters(baseFilter, spatialFilter);
}

export function hasFocusedDetailContext(detailContext: MapDetailContext) {
  return detailContext.focusGeometry !== null;
}

function createSpatialDetailProfileFilter(
  detailContext: MapDetailContext,
  profile: DetailProfile,
  spatialMatch: DetailProfileSpatialMatch,
) {
  const focusGeometry = detailContext.focusGeometry;

  if (!focusGeometry) {
    return undefined;
  }

  const partitionFilter =
    spatialMatch === "intersects"
      ? (["<=", ["distance", focusGeometry], 0] as const)
      : (["within", focusGeometry] as const);

  // MapLibre classifies whole vector-tile features here. Crossing lines, line
  // labels, and polygon fills at the focus edge cannot be clipped client-side,
  // so each profile uses feature-level classification.
  return profile === "focused" ? partitionFilter : ["!", partitionFilter];
}

export function resolveDetailProfileValue(
  profile: DetailProfile,
  focusedValue: number,
  ambientValue: number,
) {
  return profile === "focused" ? focusedValue : ambientValue;
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
