import type { ThemeMode } from "@/features/atlascope/config/theme";
import {
  mapColorTokens,
  type MapColorRamp,
  type MapColorTokens,
} from "@/features/atlascope/map/map-color-tokens";
import { mapZoomTokens, type ZoomWidthStops } from "@/features/atlascope/map/map-zoom-tokens";

type InterpolateExpression = readonly unknown[];

export type MapThemeConfig = {
  colors: MapColorTokens;
  zoom: typeof mapZoomTokens;
  overlays: {
    containerSurface: string;
    topGradient: string;
    vignette: string;
  };
};

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

const mapThemeConfig = {
  light: {
    colors: mapColorTokens.light,
    zoom: mapZoomTokens,
    overlays: {
      containerSurface: mapColorTokens.light.overlays.surface,
      topGradient: `radial-gradient(circle at top, ${mapColorTokens.light.overlays.topGlow}, ${mapColorTokens.light.overlays.topGlowFade} 34%), linear-gradient(180deg, ${mapColorTokens.light.overlays.verticalTintStart} 0%, ${mapColorTokens.light.overlays.verticalTintEnd} 100%)`,
      vignette: `radial-gradient(circle at center, transparent 48%, ${mapColorTokens.light.overlays.vignetteMid} 78%, ${mapColorTokens.light.overlays.vignetteEdge} 100%)`,
    },
  },
  dark: {
    colors: mapColorTokens.dark,
    zoom: mapZoomTokens,
    overlays: {
      containerSurface: mapColorTokens.dark.overlays.surface,
      topGradient: `radial-gradient(circle at top, ${mapColorTokens.dark.overlays.topGlow}, ${mapColorTokens.dark.overlays.topGlowFade} 34%), linear-gradient(180deg, ${mapColorTokens.dark.overlays.verticalTintStart} 0%, ${mapColorTokens.dark.overlays.verticalTintEnd} 100%)`,
      vignette: `radial-gradient(circle at center, transparent 50%, ${mapColorTokens.dark.overlays.vignetteMid} 80%, ${mapColorTokens.dark.overlays.vignetteEdge} 100%)`,
    },
  },
} as const satisfies Record<ThemeMode, MapThemeConfig>;

export function getMapThemeConfig(theme: ThemeMode): MapThemeConfig {
  return mapThemeConfig[theme];
}

export function getZoomInterpolatedColor(ramp: MapColorRamp, zoomInAt?: number) {
  return createZoomColorExpression(ramp, zoomInAt);
}

export function getZoomInterpolatedNumber(stops: ZoomWidthStops) {
  return createLinearZoomExpression(stops);
}
