import type { MapColorRamp } from "@/features/atlascope/config/theme";

import { mapZoomTokens, type ZoomWidthStops } from "./zoom-tokens";

type InterpolateExpression = readonly unknown[];
type LayerZoomRange = {
  minzoom?: number;
  maxzoom?: number;
};
type FadedZoomStopOptions = {
  multiplier?: number;
  minZoom?: number;
  maxZoom?: number;
  fadeRange?: number;
};

const DEFAULT_FADE_RANGE = 0.85;

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

export function scaleZoomStops(stops: ZoomWidthStops, multiplier: number): ZoomWidthStops {
  return stops.map(([zoom, value]) => [zoom, value * multiplier]) as ZoomWidthStops;
}

export function softenMinZoom(minZoom: number, fadeRange = DEFAULT_FADE_RANGE) {
  return Math.max(0, minZoom - fadeRange);
}

export function softenMaxZoom(maxZoom: number, fadeRange = DEFAULT_FADE_RANGE) {
  return Math.min(24, maxZoom + fadeRange);
}

function sampleZoomStopValue(stops: ZoomWidthStops, zoom: number) {
  if (!stops.length) {
    return 0;
  }

  if (zoom <= stops[0][0]) {
    return stops[0][1];
  }

  for (let index = 1; index < stops.length; index += 1) {
    const previous = stops[index - 1];
    const current = stops[index];

    if (!previous || !current) {
      continue;
    }

    if (zoom <= current[0]) {
      const [previousZoom, previousValue] = previous;
      const [currentZoom, currentValue] = current;

      if (currentZoom === previousZoom) {
        return currentValue;
      }

      const progress = (zoom - previousZoom) / (currentZoom - previousZoom);

      return previousValue + (currentValue - previousValue) * progress;
    }
  }

  return stops[stops.length - 1]?.[1] ?? 0;
}

function sortZoomStops(stops: ZoomWidthStops) {
  return [...stops].sort((left, right) => left[0] - right[0]) as ZoomWidthStops;
}

function dedupeZoomStops(stops: ZoomWidthStops) {
  const dedupedStops = sortZoomStops(stops).reduce<[number, number][]>((dedupedStops, stop) => {
    const previousStop = dedupedStops[dedupedStops.length - 1];

    if (previousStop && previousStop[0] === stop[0]) {
      dedupedStops[dedupedStops.length - 1] = stop;
      return dedupedStops;
    }

    dedupedStops.push(stop);
    return dedupedStops;
  }, []);

  return dedupedStops as ZoomWidthStops;
}

function nudgeStopForward(
  stops: ZoomWidthStops,
  index: number,
  amount: number,
) {
  const targetStop = stops[index];

  if (!targetStop) {
    return stops;
  }

  const previousZoom = stops[index - 1]?.[0] ?? 0;
  const nextZoom = stops[index + 1]?.[0] ?? 24;
  const nudgedZoom = Math.min(nextZoom - 0.05, targetStop[0] + amount);

  if (nudgedZoom <= previousZoom) {
    return stops;
  }

  return stops.map(([zoom, value], stopIndex) =>
    stopIndex === index ? [nudgedZoom, value] : [zoom, value],
  ) as ZoomWidthStops;
}

function nudgeStopBackward(
  stops: ZoomWidthStops,
  index: number,
  amount: number,
) {
  const targetStop = stops[index];

  if (!targetStop) {
    return stops;
  }

  const previousZoom = stops[index - 1]?.[0] ?? 0;
  const nextZoom = stops[index + 1]?.[0] ?? 24;
  const nudgedZoom = Math.max(previousZoom + 0.05, targetStop[0] - amount);

  if (nudgedZoom >= nextZoom) {
    return stops;
  }

  return stops.map(([zoom, value], stopIndex) =>
    stopIndex === index ? [nudgedZoom, value] : [zoom, value],
  ) as ZoomWidthStops;
}

export function extendZoomStopsWithFade(
  stops: ZoomWidthStops,
  minZoom?: number,
  maxZoom?: number,
  fadeRange = DEFAULT_FADE_RANGE,
) {
  let nextStops = [...stops] as ZoomWidthStops;

  if (Number.isFinite(minZoom)) {
    const resolvedMinZoom = minZoom as number;
    const leadingStop = nextStops[0];

    if (leadingStop && leadingStop[0] === resolvedMinZoom && leadingStop[1] === 0) {
      nextStops = [
        [softenMinZoom(resolvedMinZoom, fadeRange), 0],
        ...nextStops,
      ] as ZoomWidthStops;
      nextStops = nudgeStopForward(nextStops, 2, fadeRange);
    } else {
      const minZoomValue = sampleZoomStopValue(nextStops, resolvedMinZoom);

      nextStops = [
        [softenMinZoom(resolvedMinZoom, fadeRange), 0],
        [resolvedMinZoom, minZoomValue],
        ...nextStops.filter(([zoom]) => zoom > resolvedMinZoom),
      ] as ZoomWidthStops;
    }
  }

  if (Number.isFinite(maxZoom)) {
    const resolvedMaxZoom = maxZoom as number;
    const trailingStop = nextStops[nextStops.length - 1];

    if (trailingStop && trailingStop[0] === resolvedMaxZoom && trailingStop[1] === 0) {
      nextStops = nudgeStopBackward(nextStops, nextStops.length - 2, fadeRange);
      nextStops = [
        ...nextStops,
        [softenMaxZoom(resolvedMaxZoom, fadeRange), 0],
      ] as ZoomWidthStops;
    } else {
      const maxZoomValue = sampleZoomStopValue(nextStops, resolvedMaxZoom);

      nextStops = [
        ...nextStops.filter(([zoom]) => zoom < resolvedMaxZoom),
        [resolvedMaxZoom, maxZoomValue],
        [softenMaxZoom(resolvedMaxZoom, fadeRange), 0],
      ] as ZoomWidthStops;
    }
  }

  return dedupeZoomStops(nextStops);
}

export function resolveLayerZoomRange(
  minZoom?: number,
  maxZoom?: number,
  fadeRange = DEFAULT_FADE_RANGE,
): LayerZoomRange {
  return {
    minzoom: Number.isFinite(minZoom) ? softenMinZoom(minZoom as number, fadeRange) : undefined,
    maxzoom: Number.isFinite(maxZoom) ? softenMaxZoom(maxZoom as number, fadeRange) : undefined,
  };
}

export function createFadedOpacityStops(
  stops: ZoomWidthStops,
  {
    multiplier = 1,
    minZoom,
    maxZoom,
    fadeRange = DEFAULT_FADE_RANGE,
  }: FadedZoomStopOptions = {},
) {
  return extendZoomStopsWithFade(
    scaleZoomStops(stops, multiplier),
    minZoom,
    maxZoom,
    fadeRange,
  );
}

export function createFadedWidthStops(
  stops: ZoomWidthStops,
  {
    multiplier = 1,
    minZoom,
    maxZoom,
    fadeRange = DEFAULT_FADE_RANGE,
  }: FadedZoomStopOptions = {},
) {
  return extendZoomStopsWithFade(
    scaleZoomStops(stops, multiplier),
    minZoom,
    maxZoom,
    fadeRange,
  );
}

export function createConstantZoomStops(
  value: number,
  minZoom?: number,
  maxZoom?: number,
) {
  const resolvedMinZoom = minZoom ?? mapZoomTokens.detail.low;
  const resolvedMaxZoom = maxZoom ?? 24;

  return dedupeZoomStops([
    [resolvedMinZoom, value],
    [resolvedMaxZoom, value],
  ] as ZoomWidthStops);
}
