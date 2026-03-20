import { atlasTheme } from "@/features/atlascope/config/theme-tokens";
import type { MapColorTokens, ThemeMode } from "@/features/atlascope/config/theme-types";
import { mapZoomTokens } from "@/features/atlascope/map/map-zoom-tokens";

type MapThemeTokens = {
  colors: MapColorTokens;
  zoom: typeof mapZoomTokens;
  overlays: {
    containerSurface: string;
    topGradient: string;
    vignette: string;
  };
};

function createMapOverlays(theme: ThemeMode) {
  const { overlays } = atlasTheme.map[theme];

  return {
    containerSurface: overlays.surface,
    topGradient: `radial-gradient(circle at top, ${overlays.topGlow}, ${overlays.topGlowFade} 34%), linear-gradient(180deg, ${overlays.verticalTintStart} 0%, ${overlays.verticalTintEnd} 100%)`,
    vignette: `radial-gradient(circle at center, transparent ${theme === "dark" ? "50%" : "48%"}, ${overlays.vignetteMid} ${theme === "dark" ? "80%" : "78%"}, ${overlays.vignetteEdge} 100%)`,
  };
}

export function getMapTheme(theme: ThemeMode): MapThemeTokens {
  return {
    colors: atlasTheme.map[theme],
    zoom: mapZoomTokens,
    overlays: createMapOverlays(theme),
  };
}
