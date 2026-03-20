import type { ThemeMode } from "@/features/atlascope/config/theme";
import { getFallbackMapStyle } from "@/features/atlascope/map/map-config";
import { cleanStyle } from "@/features/atlascope/map/clean-style";
import type { MapStyleDefinition } from "@/features/atlascope/map/map-provider";
import { createStreetLayerDefinitions } from "@/features/atlascope/map/street-layers";

const styleCache = new Map<string, Promise<MapStyleDefinition>>();

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
    layers: [
      ...cleanedStyle.layers,
      ...createStreetLayerDefinitions(theme),
    ],
  };
}

export function getOperationalFallbackStyle(theme: ThemeMode) {
  return getFallbackMapStyle(theme);
}
