import type { ThemeMode } from "@/features/atlascope/config/theme";

import type {
  MapLayerStyleUpdate,
  MapStyleDefinition,
} from "../core/provider";
import { getFallbackMapStyle } from "../core/config";
import { cleanStyle } from "./clean-style";

const styleCache = new Map<string, Promise<MapStyleDefinition>>();
const THEME_STYLE_TRANSITION = {
  duration: 280,
  delay: 0,
} as const;

export async function loadBaseMapStyle(styleUrl: string): Promise<MapStyleDefinition> {
  let cachedStylePromise = styleCache.get(styleUrl);

  if (!cachedStylePromise) {
    cachedStylePromise = fetch(styleUrl).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load style: ${response.status}`);
      }

      return (await response.json()) as MapStyleDefinition;
    });
    styleCache.set(styleUrl, cachedStylePromise);
  }

  return cachedStylePromise;
}

export function buildOperationalMapStyle(
  baseStyle: MapStyleDefinition,
  theme: ThemeMode,
): MapStyleDefinition {
  const cleanedStyle = cleanStyle(baseStyle, theme);

  return {
    ...cleanedStyle,
    transition: THEME_STYLE_TRANSITION,
    layers: cleanedStyle.layers,
  };
}

export function createOperationalThemeLayerUpdates(
  baseStyle: MapStyleDefinition,
  theme: ThemeMode,
) {
  return buildOperationalMapStyle(baseStyle, theme).layers.map((layer) => ({
    id: layer.id,
    definition: layer,
    style: {
      layout: layer.layout,
      paint: layer.paint,
      minzoom: layer.minzoom,
      maxzoom: layer.maxzoom,
      filter: layer.filter,
    } satisfies MapLayerStyleUpdate,
  }));
}

export function getOperationalFallbackStyle(theme: ThemeMode) {
  return getFallbackMapStyle(theme);
}
