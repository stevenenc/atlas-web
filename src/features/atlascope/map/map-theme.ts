import type { ThemeMode } from "@/features/atlascope/config/theme";
import {
  getMapThemeConfig,
  type MapThemeConfig,
} from "@/features/atlascope/map/map-style-config";

export type MapThemeTokens = MapThemeConfig;

export const mapThemeTokens = {
  light: getMapThemeConfig("light"),
  dark: getMapThemeConfig("dark"),
} as const satisfies Record<ThemeMode, MapThemeTokens>;

export function getMapTheme(theme: ThemeMode): MapThemeTokens {
  return mapThemeTokens[theme];
}
