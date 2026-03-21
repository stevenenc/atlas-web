export type ThemeMode = "dark" | "light";

export type HazardTone = "earthquake" | "wildfire" | "air_quality";

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
  detailContext: {
    outsideMask: string;
  };
  overlays: MapOverlayTokens;
};

export type AtlasThemeModeTokens = {
  background: string;
  foreground: string;
  colors: {
    shell: string;
    ink: string;
    muted: string;
    soft: string;
    eyebrow: string;
    panel: string;
    panelBorder: string;
    detailPanel: string;
    detailPanelBorder: string;
    card: string;
    cardBorder: string;
    cardHover: string;
    cardStrong: string;
    cardStrongBorder: string;
    input: string;
    inputBorder: string;
    placeholder: string;
    rail: string;
    railBorder: string;
    railHover: string;
    railActive: string;
    railActiveBorder: string;
    railInk: string;
    primary: string;
    primarySoft: string;
    primaryStrong: string;
    primaryStrongHover: string;
    primaryStrongInk: string;
    secondary: string;
    secondaryBorder: string;
    secondaryHover: string;
    secondaryInk: string;
    avatar: string;
    avatarInk: string;
    timeline: string;
    timelineBorder: string;
    timelineTrack: string;
    timelinePlay: string;
    timelinePlayBorder: string;
    timelinePlayHover: string;
    tooltip: string;
    tooltipBorder: string;
    tooltipInk: string;
    markerShell: string;
    markerBorder: string;
    trash: string;
    trashBorder: string;
    trashInk: string;
    trashActive: string;
    trashActiveBorder: string;
    trashActiveInk: string;
    pageCard: string;
    pageCardBorder: string;
    pageCardHover: string;
    disabled: string;
  };
  shadows: {
    panel: string;
    compact: string;
    detail: string;
    rail: string;
    railActive: string;
    timeline: string;
    bubble: string;
    tooltip: string;
    marker: string;
    trash: string;
    trashActive: string;
    pageCard: string;
  };
  callouts: {
    primary: string;
    primaryAdd: string;
    primaryInset: string;
    primaryAddInset: string;
  };
};
