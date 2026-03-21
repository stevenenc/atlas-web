import type {
  AtlasThemeModeTokens,
  HazardTone,
  MapColorTokens,
  ThemeMode,
} from "./types";

const hazardPalette = {
  earthquake: {
    label: "Earthquake",
    accent: "#F97316",
    glow: {
      dark: "rgba(249, 115, 22, 0.18)",
      light: "rgba(249, 115, 22, 0.12)",
    },
    markerGlowClass: "shadow-[0_0_22px_rgba(249,115,22,0.28)]",
    ringClass: "border-[#F97316]/38",
    pulseClass: "bg-[#F97316]/18",
  },
  wildfire: {
    label: "Wildfire",
    accent: "#EF4444",
    glow: {
      dark: "rgba(239, 68, 68, 0.18)",
      light: "rgba(239, 68, 68, 0.12)",
    },
    markerGlowClass: "shadow-[0_0_24px_rgba(239,68,68,0.3)]",
    ringClass: "border-[#EF4444]/40",
    pulseClass: "bg-[#EF4444]/18",
  },
  air_quality: {
    label: "Air Quality",
    accent: "#D8B11E",
    glow: {
      dark: "rgba(216, 177, 30, 0.18)",
      light: "rgba(216, 177, 30, 0.12)",
    },
    markerGlowClass: "shadow-[0_0_22px_rgba(216,177,30,0.24)]",
    ringClass: "border-[#D8B11E]/36",
    pulseClass: "bg-[#D8B11E]/16",
  },
} as const satisfies Record<
  HazardTone,
  {
    label: string;
    accent: string;
    glow: Record<ThemeMode, string>;
    markerGlowClass: string;
    ringClass: string;
    pulseClass: string;
  }
>;

const atlasThemeModes = {
  dark: {
    background: "#12171A",
    foreground: "#F3F6F8",
    colors: {
      shell: "#12171A",
      ink: "#F3F6F8",
      muted: "rgba(243, 246, 248, 0.5)",
      soft: "rgba(243, 246, 248, 0.62)",
      eyebrow: "rgba(243, 246, 248, 0.3)",
      panel: "rgba(11, 16, 19, 0.84)",
      panelBorder: "rgba(255, 255, 255, 0.1)",
      detailPanel: "rgba(12, 17, 20, 0.86)",
      detailPanelBorder: "rgba(255, 255, 255, 0.1)",
      card: "rgba(255, 255, 255, 0.03)",
      cardBorder: "rgba(255, 255, 255, 0.08)",
      cardHover: "rgba(255, 255, 255, 0.05)",
      cardStrong: "#0A0F12",
      cardStrongBorder: "rgba(255, 255, 255, 0.08)",
      input: "#0D1418",
      inputBorder: "rgba(255, 255, 255, 0.12)",
      placeholder: "rgba(243, 246, 248, 0.38)",
      rail: "rgba(11, 16, 19, 0.82)",
      railBorder: "rgba(255, 255, 255, 0.1)",
      railHover: "rgba(255, 255, 255, 0.08)",
      railActive: "rgba(255, 255, 255, 0.12)",
      railActiveBorder: "rgba(255, 255, 255, 0.18)",
      railInk: "rgba(243, 246, 248, 0.78)",
      primary: "#5BD3F5",
      primarySoft: "rgba(91, 211, 245, 0.08)",
      primaryStrong: "#E8EDF0",
      primaryStrongHover: "#FFFFFF",
      primaryStrongInk: "#11191E",
      secondary: "rgba(255, 255, 255, 0.04)",
      secondaryBorder: "rgba(255, 255, 255, 0.1)",
      secondaryHover: "rgba(255, 255, 255, 0.08)",
      secondaryInk: "rgba(243, 246, 248, 0.84)",
      avatar: "#E7ECF0",
      avatarInk: "#152026",
      timeline: "rgba(10, 15, 19, 0.72)",
      timelineBorder: "rgba(255, 255, 255, 0.1)",
      timelineTrack: "rgba(185, 234, 248, 0.24)",
      timelinePlay: "rgba(255, 255, 255, 0.05)",
      timelinePlayBorder: "rgba(255, 255, 255, 0.1)",
      timelinePlayHover: "rgba(255, 255, 255, 0.1)",
      tooltip: "rgba(15, 21, 24, 0.92)",
      tooltipBorder: "rgba(255, 255, 255, 0.1)",
      tooltipInk: "rgba(243, 246, 248, 0.76)",
      markerShell: "rgba(15, 21, 24, 0.86)",
      markerBorder: "rgba(255, 255, 255, 0.16)",
      trash: "rgba(11, 16, 19, 0.82)",
      trashBorder: "rgba(255, 255, 255, 0.12)",
      trashInk: "rgba(243, 246, 248, 0.62)",
      trashActive: "rgba(132, 26, 14, 0.88)",
      trashActiveBorder: "rgba(255, 124, 102, 0.6)",
      trashActiveInk: "#FFD9D2",
      pageCard: "rgba(16, 22, 26, 0.8)",
      pageCardBorder: "rgba(255, 255, 255, 0.1)",
      pageCardHover: "rgba(18, 27, 32, 0.86)",
      disabled: "rgba(243, 246, 248, 0.24)",
    },
    shadows: {
      panel: "0 24px 60px rgba(0, 0, 0, 0.3)",
      compact: "0 22px 54px rgba(0, 0, 0, 0.28)",
      detail: "0 24px 70px rgba(0, 0, 0, 0.32)",
      rail: "0 20px 50px rgba(0, 0, 0, 0.24)",
      railActive: "0 16px 36px rgba(0, 0, 0, 0.28)",
      timeline: "0 18px 48px rgba(0, 0, 0, 0.28)",
      bubble: "0 8px 20px rgba(17, 97, 124, 0.24)",
      tooltip: "0 16px 36px rgba(0, 0, 0, 0.32)",
      marker: "0 0 0 2px rgba(15, 21, 24, 0.28)",
      trash: "0 18px 40px rgba(0, 0, 0, 0.24)",
      trashActive: "0 18px 40px rgba(132, 26, 14, 0.36)",
      pageCard: "0 18px 40px rgba(0, 0, 0, 0.2)",
    },
    callouts: {
      primary:
        "linear-gradient(180deg, rgba(91, 211, 245, 0.22), rgba(91, 211, 245, 0.14))",
      primaryAdd:
        "linear-gradient(180deg, rgba(91, 211, 245, 0.08), rgba(91, 211, 245, 0.03))",
      primaryInset: "rgba(255, 255, 255, 0.06)",
      primaryAddInset: "rgba(255, 255, 255, 0.04)",
    },
  },
  light: {
    background: "#F3F6F8",
    foreground: "#1F2A30",
    colors: {
      shell: "#D9DEE0",
      ink: "#1F2A30",
      muted: "#627078",
      soft: "#5E6C74",
      eyebrow: "#607078",
      panel: "rgba(243, 245, 246, 0.9)",
      panelBorder: "rgba(61, 70, 76, 0.12)",
      detailPanel: "rgba(241, 244, 245, 0.92)",
      detailPanelBorder: "rgba(61, 70, 76, 0.12)",
      card: "rgba(255, 255, 255, 0.44)",
      cardBorder: "rgba(61, 70, 76, 0.1)",
      cardHover: "rgba(255, 255, 255, 0.72)",
      cardStrong: "#E8EDF0",
      cardStrongBorder: "rgba(61, 70, 76, 0.1)",
      input: "rgba(255, 255, 255, 0.85)",
      inputBorder: "rgba(61, 70, 76, 0.12)",
      placeholder: "#7A8790",
      rail: "rgba(243, 245, 246, 0.9)",
      railBorder: "rgba(61, 70, 76, 0.12)",
      railHover: "#FFFFFF",
      railActive: "#FFFFFF",
      railActiveBorder: "rgba(61, 70, 76, 0.18)",
      railInk: "#536068",
      primary: "#1E63D5",
      primarySoft: "rgba(30, 99, 213, 0.08)",
      primaryStrong: "#1A252D",
      primaryStrongHover: "#10181E",
      primaryStrongInk: "#F3F6F8",
      secondary: "rgba(255, 255, 255, 0.55)",
      secondaryBorder: "rgba(61, 70, 76, 0.1)",
      secondaryHover: "#FFFFFF",
      secondaryInk: "#1F2A30",
      avatar: "#1D2830",
      avatarInk: "#F2F5F7",
      timeline: "rgba(244, 247, 248, 0.74)",
      timelineBorder: "rgba(61, 70, 76, 0.12)",
      timelineTrack: "rgba(185, 234, 248, 0.72)",
      timelinePlay: "rgba(255, 255, 255, 0.7)",
      timelinePlayBorder: "rgba(61, 70, 76, 0.1)",
      timelinePlayHover: "#FFFFFF",
      tooltip: "rgba(246, 248, 248, 0.96)",
      tooltipBorder: "rgba(45, 52, 56, 0.12)",
      tooltipInk: "#374045",
      markerShell: "rgba(241, 244, 245, 0.94)",
      markerBorder: "rgba(45, 52, 56, 0.12)",
      trash: "rgba(243, 245, 246, 0.88)",
      trashBorder: "rgba(61, 70, 76, 0.12)",
      trashInk: "#5A6972",
      trashActive: "rgba(160, 34, 12, 0.92)",
      trashActiveBorder: "rgba(212, 74, 52, 0.34)",
      trashActiveInk: "#FFF1ED",
      pageCard: "rgba(255, 255, 255, 0.82)",
      pageCardBorder: "rgba(61, 70, 76, 0.12)",
      pageCardHover: "#FFFFFF",
      disabled: "#7A8790",
    },
    shadows: {
      panel: "0 18px 40px rgba(68, 79, 88, 0.14)",
      compact: "0 18px 38px rgba(68, 79, 88, 0.14)",
      detail: "0 20px 50px rgba(68, 79, 88, 0.16)",
      rail: "0 18px 40px rgba(68, 79, 88, 0.14)",
      railActive: "0 14px 28px rgba(68, 79, 88, 0.18)",
      timeline: "0 18px 42px rgba(68, 79, 88, 0.16)",
      bubble: "0 8px 18px rgba(48, 127, 152, 0.16)",
      tooltip: "0 16px 36px rgba(86, 97, 106, 0.16)",
      marker: "0 0 0 2px rgba(217, 222, 224, 0.62)",
      trash: "0 18px 40px rgba(68, 79, 88, 0.16)",
      trashActive: "0 18px 40px rgba(148, 45, 24, 0.26)",
      pageCard: "0 18px 40px rgba(68, 79, 88, 0.12)",
    },
    callouts: {
      primary:
        "linear-gradient(180deg, rgba(30, 99, 213, 0.16), rgba(30, 99, 213, 0.09))",
      primaryAdd:
        "linear-gradient(180deg, rgba(30, 99, 213, 0.06), rgba(30, 99, 213, 0.025))",
      primaryInset: "rgba(255, 255, 255, 0.45)",
      primaryAddInset: "rgba(255, 255, 255, 0.38)",
    },
  },
} as const satisfies Record<ThemeMode, AtlasThemeModeTokens>;

const severityTokens = {
  Critical: {
    dark: {
      border: "rgba(239, 68, 68, 0.26)",
      background: "rgba(239, 68, 68, 0.12)",
      text: "#FFB1B1",
    },
    light: {
      border: "rgba(220, 38, 38, 0.16)",
      background: "rgba(220, 38, 38, 0.08)",
      text: "#991B1B",
    },
    accent: hazardPalette.wildfire.accent,
  },
  High: {
    dark: {
      border: "rgba(249, 115, 22, 0.26)",
      background: "rgba(249, 115, 22, 0.12)",
      text: "#FDBA74",
    },
    light: {
      border: "rgba(234, 88, 12, 0.16)",
      background: "rgba(234, 88, 12, 0.08)",
      text: "#9A3412",
    },
    accent: hazardPalette.earthquake.accent,
  },
  Moderate: {
    dark: {
      border: "rgba(216, 177, 30, 0.24)",
      background: "rgba(216, 177, 30, 0.1)",
      text: "#F4DA79",
    },
    light: {
      border: "rgba(161, 98, 7, 0.14)",
      background: "rgba(202, 138, 4, 0.08)",
      text: "#854D0E",
    },
    accent: hazardPalette.air_quality.accent,
  },
} as const;

export const atlasTheme = {
  typography: {
    fontFamily: {
      sans: '"Space Grotesk", "Avenir Next", "Segoe UI", sans-serif',
      mono: '"SFMono-Regular", "SF Mono", "Consolas", monospace',
    },
    tracking: {
      display: "-0.02em",
      eyebrow: "0.24em",
      detailEyebrow: "0.22em",
      wideEyebrow: "0.34em",
      control: "0.14em",
      bubble: "0.12em",
    },
  },
  spacing: {
    pageInset: "2rem",
    panelOffset: "25rem",
  },
  radius: {
    panel: "1.5rem",
    compact: "1.75rem",
    card: "1rem",
    field: "0.75rem",
    detail: "0.125rem",
  },
  shadows: {
    dark: atlasThemeModes.dark.shadows,
    light: atlasThemeModes.light.shadows,
  },
  breakpoints: {
    panelOffset: "64rem",
  },
  transitions: {
    themeDuration: "500ms",
    standardDuration: "300ms",
    quickDuration: "200ms",
    enterDuration: "220ms",
    exitDuration: "180ms",
    standardEasing: "ease-out",
    emphasisEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    exitEasing: "ease-in",
  },
  hazards: hazardPalette,
  severity: severityTokens,
  modes: atlasThemeModes,
  map: {
    light: {
      land: {
        zoomedOut: "#DFD8CD",
        zoomedIn: "#E7E0D6",
      },
      water: {
        zoomedOut: "#C2D6E6",
        zoomedIn: "#CBDEEC",
      },
      outline: {
        coastlineBase: "#657C8D",
        coastlineTop: "#7D93A5",
      },
      boundary: {
        country: "#A8B7C2",
        region: "#BCC8D0",
      },
      labels: {
        major: "#2E404B",
        secondary: "#455A66",
        halo: "rgba(250, 250, 248, 0.9)",
      },
      roads: {
        major: "#5F788C",
        secondary: "#7F97A6",
        minor: "#A8B9C3",
        majorLabel: "#2C3F4B",
        localLabel: "#3E5360",
        halo: "rgba(250, 250, 248, 0.92)",
      },
      landuse: {
        park: "rgba(166, 191, 146, 0.56)",
        wood: "rgba(145, 183, 128, 0.42)",
        grass: "rgba(182, 204, 160, 0.34)",
        residential: "rgba(205, 198, 188, 0.28)",
        civic: "rgba(217, 211, 170, 0.3)",
        sand: "rgba(233, 223, 177, 0.34)",
        wetland: "rgba(151, 184, 170, 0.38)",
      },
      poi: {
        emergency: "#8C4E2A",
        civic: "#556A43",
        transport: "#355E84",
        halo: "rgba(250, 250, 248, 0.94)",
      },
      waterLabels: {
        text: "#38576C",
        halo: "rgba(248, 250, 252, 0.92)",
      },
      geofence: {
        fill: "rgba(29, 99, 213, 0.055)",
        stroke: "#1E63D5",
        selectedStroke: "#1354BF",
        draftStroke: "#1354BF",
        draftHandleFill: "#F8FBFF",
      },
      detailContext: {
        ambient: {
          lineOpacityMultiplier: 0.82,
          lineWidthMultiplier: 0.94,
          labelOpacityMultiplier: 0.78,
          fillOpacityMultiplier: 0.78,
          boundaryOpacityMultiplier: 0.76,
          poiOpacityMultiplier: 0.72,
        },
        focused: {
          lineOpacityMultiplier: 1,
          lineWidthMultiplier: 1,
          labelOpacityMultiplier: 1,
          fillOpacityMultiplier: 1,
          boundaryOpacityMultiplier: 1,
          boundaryWidthMultiplier: 1.08,
          poiOpacityMultiplier: 1,
        },
        mask: {
          outsideFill: "#EEF4F8",
          outsideOpacity: 0.38,
        },
      },
      overlays: {
        surface: "#D4DBDF",
        topGlow: "rgba(255, 255, 255, 0.015)",
        topGlowFade: "rgba(255, 255, 255, 0)",
        verticalTintStart: "rgba(231, 236, 239, 0)",
        verticalTintEnd: "rgba(177, 188, 196, 0.038)",
        vignetteMid: "rgba(93, 104, 111, 0.012)",
        vignetteEdge: "rgba(93, 104, 111, 0.028)",
      },
    },
    dark: {
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
      landuse: {
        park: "rgba(54, 86, 63, 0.58)",
        wood: "rgba(42, 71, 55, 0.44)",
        grass: "rgba(46, 72, 59, 0.34)",
        residential: "rgba(41, 56, 68, 0.28)",
        civic: "rgba(66, 72, 47, 0.32)",
        sand: "rgba(88, 77, 51, 0.28)",
        wetland: "rgba(33, 66, 74, 0.4)",
      },
      poi: {
        emergency: "#E7B08B",
        civic: "#B8D296",
        transport: "#89C1E8",
        halo: "rgba(5, 10, 16, 0.84)",
      },
      waterLabels: {
        text: "#7FA3BA",
        halo: "rgba(5, 10, 16, 0.84)",
      },
      geofence: {
        fill: "rgba(91, 211, 245, 0.075)",
        stroke: "#5BD3F5",
        selectedStroke: "#8AE5FF",
        draftStroke: "#8AE5FF",
        draftHandleFill: "#D9F8FF",
      },
      detailContext: {
        ambient: {
          lineOpacityMultiplier: 0.8,
          lineWidthMultiplier: 0.94,
          labelOpacityMultiplier: 0.76,
          fillOpacityMultiplier: 0.8,
          boundaryOpacityMultiplier: 0.74,
          poiOpacityMultiplier: 0.7,
        },
        focused: {
          lineOpacityMultiplier: 1,
          lineWidthMultiplier: 1.04,
          labelOpacityMultiplier: 1,
          fillOpacityMultiplier: 1,
          boundaryOpacityMultiplier: 1,
          boundaryWidthMultiplier: 1.1,
          poiOpacityMultiplier: 1,
        },
        mask: {
          outsideFill: "#040A10",
          outsideOpacity: 0.34,
        },
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
    },
  } satisfies Record<ThemeMode, MapColorTokens>,
} as const;

export const mapColorTokens = atlasTheme.map;

export const layerRows = (Object.entries(hazardPalette) as Array<
  [HazardTone, (typeof hazardPalette)[HazardTone]]
>).map(([id, config]) => ({
  id,
  label: config.label,
  color: config.accent,
}));

export const severityToneClasses = {
  Critical: "atlas-severity-critical",
  High: "atlas-severity-high",
  Moderate: "atlas-severity-moderate",
} as const;

export function getHazardTheme(hazard: HazardTone) {
  return atlasTheme.hazards[hazard];
}
