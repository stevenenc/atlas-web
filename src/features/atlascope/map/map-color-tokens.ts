import type { ThemeMode } from "@/features/atlascope/config/theme";

export type MapColorRamp = {
  zoomedOut: string;
  zoomedIn: string;
};

export type MapOverlayTokens = {
  surface: string;
  topGlow: string;
  topGlowFade: string;
  verticalTintStart: string;
  verticalTintEnd: string;
  vignetteMid: string;
  vignetteEdge: string;
};

export type MapColorTokens = {
  land: MapColorRamp;
  water: MapColorRamp;
  outline: {
    coastlineBase: string;
    coastlineTop: string;
  };
  boundary: {
    country: string;
    region: string;
  };
  labels: {
    major: string;
    secondary: string;
    halo: string;
  };
  roads: {
    major: string;
    secondary: string;
    minor: string;
    majorLabel: string;
    localLabel: string;
    halo: string;
  };
  geofence: {
    fill: string;
    stroke: string;
    selectedStroke: string;
    draftStroke: string;
    draftHandleFill: string;
  };
  overlays: MapOverlayTokens;
};

export const lightThemeMapTokens = {
  land: {
    zoomedOut: "#E8E1D4",
    zoomedIn: "#EEE8DD",
  },
  water: {
    zoomedOut: "#D3E0EA",
    zoomedIn: "#D9E5EF",
  },
  outline: {
    coastlineBase: "#7F93A2",
    coastlineTop: "#94A9BA",
  },
  boundary: {
    country: "#B7C3CD",
    region: "#C7D1D8",
  },
  labels: {
    major: "#667784",
    secondary: "#80909C",
    halo: "rgba(248, 249, 250, 0.88)",
  },
  roads: {
    major: "#91A8BA",
    secondary: "#B1C0CB",
    minor: "#CBD6DD",
    majorLabel: "#667784",
    localLabel: "#80909C",
    halo: "rgba(248, 249, 250, 0.88)",
  },
  geofence: {
    fill: "rgba(29, 99, 213, 0.055)",
    stroke: "#1E63D5",
    selectedStroke: "#1354BF",
    draftStroke: "#1354BF",
    draftHandleFill: "#F8FBFF",
  },
  overlays: {
    surface: "#D9E0E4",
    topGlow: "rgba(255, 255, 255, 0.05)",
    topGlowFade: "rgba(255, 255, 255, 0)",
    verticalTintStart: "rgba(231, 236, 239, 0.02)",
    verticalTintEnd: "rgba(177, 188, 196, 0.065)",
    vignetteMid: "rgba(93, 104, 111, 0.018)",
    vignetteEdge: "rgba(93, 104, 111, 0.05)",
  },
} as const satisfies MapColorTokens;

export const darkThemeMapTokens = {
  land: {
    zoomedOut: "#13202B",
    zoomedIn: "#0F1B26",
  },
  water: {
    zoomedOut: "#0A1721",
    zoomedIn: "#08131C",
  },
  outline: {
    coastlineBase: "#2B4658",
    coastlineTop: "#3F5F75",
  },
  boundary: {
    country: "#355064",
    region: "#2A4253",
  },
  labels: {
    major: "#9AB0BE",
    secondary: "#728896",
    halo: "rgba(5, 10, 16, 0.82)",
  },
  roads: {
    major: "#527089",
    secondary: "#3F5B71",
    minor: "#2D4353",
    majorLabel: "#9AB0BE",
    localLabel: "#728896",
    halo: "rgba(5, 10, 16, 0.82)",
  },
  geofence: {
    fill: "rgba(91, 211, 245, 0.075)",
    stroke: "#5BD3F5",
    selectedStroke: "#8AE5FF",
    draftStroke: "#8AE5FF",
    draftHandleFill: "#D9F8FF",
  },
  overlays: {
    surface: "#121920",
    topGlow: "rgba(124, 148, 163, 0.03)",
    topGlowFade: "rgba(124, 148, 163, 0)",
    verticalTintStart: "rgba(6, 10, 14, 0.015)",
    verticalTintEnd: "rgba(6, 10, 14, 0.065)",
    vignetteMid: "rgba(5, 8, 10, 0.022)",
    vignetteEdge: "rgba(5, 8, 10, 0.065)",
  },
} as const satisfies MapColorTokens;

export const mapColorTokens = {
  light: lightThemeMapTokens,
  dark: darkThemeMapTokens,
} as const satisfies Record<ThemeMode, MapColorTokens>;
