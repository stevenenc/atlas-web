import type { MapVisibility } from "@/features/atlascope/map/core/provider";
import {
  DETAIL_CONTEXT_TRANSITION_MS,
  type MapDetailContext,
} from "@/features/atlascope/map/core/types";

import type { MapLayerDefinition } from "../core/provider";

export type DetailProfile = "ambient" | "focused";

export const detailProfiles: DetailProfile[] = ["ambient", "focused"];
// This is intentionally reserved for non-zoom style updates such as the detail
// mask and symbol paint changes. It is not used as a fix for vector zoom pop-in.
export const DETAIL_CONTEXT_PAINT_TRANSITION = {
  duration: DETAIL_CONTEXT_TRANSITION_MS,
  delay: 0,
} as const;

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
  void detailContext;

  return profile === "focused" ? "visible" : "none";
}

export function createDetailProfileFilter(
  baseFilter: MapLayerDefinition["filter"],
  detailContext: MapDetailContext,
  profile: DetailProfile,
) {
  void detailContext;

  return profile === "focused" ? baseFilter : combineLayerFilters(baseFilter, NO_MATCH_FILTER);
}

export function hasDetailFocusGeometry(detailContext: MapDetailContext) {
  return Boolean(detailContext.focusGeometry && detailContext.focusGeometry.length >= 3);
}

export function resolveDetailProfileValue(
  detailContext: MapDetailContext,
  profile: DetailProfile,
  focusedValue: number,
  _ambientValue: number,
) {
  void detailContext;
  void profile;
  void _ambientValue;

  // The perceived focus fade is driven by the outside mask. Keeping ambient
  // and focused detail paints identical avoids the one-frame redraw that happens
  // when filters repartition the map during focus changes.
  return focusedValue;
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
