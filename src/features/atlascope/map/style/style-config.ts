import type { MapColorRamp } from "@/features/atlascope/config/theme";

import { mapZoomTokens, type ZoomWidthStops } from "./zoom-tokens";

type InterpolateExpression = readonly unknown[];

function createLinearZoomExpression(stops: ZoomWidthStops): InterpolateExpression {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    ...stops.flatMap(([zoom, value]) => [zoom, value]),
  ];
}

function createZoomColorExpression(ramp: MapColorRamp, zoomInAt = 7.5): InterpolateExpression {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    mapZoomTokens.detail.low,
    ramp.zoomedOut,
    zoomInAt,
    ramp.zoomedIn,
  ];
}

export function getZoomInterpolatedColor(ramp: MapColorRamp, zoomInAt?: number) {
  return createZoomColorExpression(ramp, zoomInAt);
}

export function getZoomInterpolatedNumber(stops: ZoomWidthStops) {
  return createLinearZoomExpression(stops);
}
