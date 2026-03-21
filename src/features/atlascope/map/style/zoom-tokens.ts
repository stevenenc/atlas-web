export type ZoomStop = readonly [number, number];

export type ZoomWidthStops = readonly [number, number][];

type StreetRoadZoomProfile = {
  majorMinZoom: number;
  secondaryMinZoom: number;
  minorMinZoom: number;
  majorWidth: ZoomWidthStops;
  majorOpacity: ZoomWidthStops;
  secondaryWidth: ZoomWidthStops;
  secondaryOpacity: ZoomWidthStops;
  minorWidth: ZoomWidthStops;
  minorOpacity: ZoomWidthStops;
};

type StreetLabelZoomProfile = {
  majorRoadMinZoom: number;
  localRoadMinZoom: number;
  majorRoadOpacity: ZoomWidthStops;
  localRoadOpacity: ZoomWidthStops;
};

type StreetDetailProfile = {
  roads: StreetRoadZoomProfile;
  labels: StreetLabelZoomProfile;
};

export const mapZoomTokens = {
  detail: {
    low: 0,
    wide: 4,
    regional: 6,
    corridor: 9,
    local: 12,
    street: 14.5,
  },
  boundaries: {
    coastlineBaseWidth: [
      [0, 1.3],
      [6, 1.55],
      [10, 1.8],
      [14.5, 2.15],
    ] as ZoomWidthStops,
    coastlineBaseOpacity: [
      [0, 0.34],
      [6, 0.42],
      [10, 0.48],
      [14.5, 0.54],
    ] as ZoomWidthStops,
    coastlineTopWidth: [
      [0, 1],
      [6, 1.2],
      [10, 1.35],
      [12, 1.7],
      [14.5, 2],
    ] as ZoomWidthStops,
    coastlineTopOpacity: [
      [0, 0.78],
      [6, 0.82],
      [10, 0.86],
      [14.5, 0.9],
    ] as ZoomWidthStops,
    countryWidth: [
      [2.5, 0.75],
      [6, 1],
      [12, 1.5],
    ] as ZoomWidthStops,
    countryOpacity: [
      [0, 0.26],
      [4, 0.54],
      [10, 0.72],
    ] as ZoomWidthStops,
    regionWidth: [
      [5, 0.4],
      [9, 0.72],
      [12, 1.02],
    ] as ZoomWidthStops,
    regionOpacity: [
      [5, 0.12],
      [8, 0.32],
      [12, 0.46],
    ] as ZoomWidthStops,
  },
  labels: {
    regionOpacity: [
      [0, 0.92],
      [6, 0.96],
      [12, 1],
    ] as ZoomWidthStops,
    regionHaloWidth: [
      [0, 1.3],
      [8, 1.1],
      [12, 1],
    ] as ZoomWidthStops,
    stateOpacity: [
      [4, 0.54],
      [7, 0.72],
      [12, 0.88],
    ] as ZoomWidthStops,
    stateHaloWidth: [
      [4, 1.1],
      [8, 0.95],
      [12, 0.85],
    ] as ZoomWidthStops,
    majorRoadMinZoom: 10.8,
    localRoadMinZoom: 12.8,
    majorRoadOpacity: [
      [10.8, 0],
      [11.4, 0.82],
      [14.5, 0.96],
    ] as ZoomWidthStops,
    localRoadOpacity: [
      [12.8, 0],
      [13.4, 0.62],
      [14.5, 0.82],
    ] as ZoomWidthStops,
  },
  roads: {
    majorMinZoom: 5.6,
    secondaryMinZoom: 8.2,
    minorMinZoom: 11.8,
    majorWidth: [
      [5.6, 0.72],
      [8, 1.04],
      [11.5, 1.58],
      [14.5, 2.2],
    ] as ZoomWidthStops,
    majorOpacity: [
      [5.6, 0],
      [6.1, 0.5],
      [10, 0.68],
      [14.5, 0.8],
    ] as ZoomWidthStops,
    secondaryWidth: [
      [8.2, 0.52],
      [11.2, 0.94],
      [14.5, 1.4],
    ] as ZoomWidthStops,
    secondaryOpacity: [
      [8.2, 0],
      [8.9, 0.36],
      [12, 0.52],
      [14.5, 0.64],
    ] as ZoomWidthStops,
    minorWidth: [
      [11.8, 0.34],
      [13.2, 0.68],
      [14.5, 0.98],
    ] as ZoomWidthStops,
    minorOpacity: [
      [11.8, 0],
      [12.4, 0.28],
      [14.5, 0.42],
    ] as ZoomWidthStops,
  },
  streetDetailProfiles: {
    ambient: {
      roads: {
        majorMinZoom: 5.6,
        secondaryMinZoom: 10.8,
        minorMinZoom: 13.2,
        majorWidth: [
          [5.6, 0.72],
          [8, 1.02],
          [11.5, 1.44],
          [14.5, 1.9],
        ] as ZoomWidthStops,
        majorOpacity: [
          [5.6, 0],
          [6.1, 0.44],
          [10, 0.58],
          [14.5, 0.7],
        ] as ZoomWidthStops,
        secondaryWidth: [
          [10.8, 0.46],
          [12.6, 0.76],
          [14.5, 1.08],
        ] as ZoomWidthStops,
        secondaryOpacity: [
          [10.8, 0],
          [11.5, 0.24],
          [13.4, 0.36],
          [14.5, 0.48],
        ] as ZoomWidthStops,
        minorWidth: [
          [13.2, 0.3],
          [14, 0.52],
          [14.5, 0.72],
        ] as ZoomWidthStops,
        minorOpacity: [
          [13.2, 0],
          [13.8, 0.16],
          [14.5, 0.28],
        ] as ZoomWidthStops,
      },
      labels: {
        majorRoadMinZoom: 11.8,
        localRoadMinZoom: 13.9,
        majorRoadOpacity: [
          [11.8, 0],
          [12.5, 0.54],
          [14.5, 0.74],
        ] as ZoomWidthStops,
        localRoadOpacity: [
          [13.9, 0],
          [14.3, 0.28],
          [14.5, 0.42],
        ] as ZoomWidthStops,
      },
    } satisfies StreetDetailProfile,
    focused: {
      roads: {
        majorMinZoom: 5.6,
        secondaryMinZoom: 8.2,
        minorMinZoom: 11.8,
        majorWidth: [
          [5.6, 0.72],
          [8, 1.04],
          [11.5, 1.58],
          [14.5, 2.2],
        ] as ZoomWidthStops,
        majorOpacity: [
          [5.6, 0],
          [6.1, 0.5],
          [10, 0.68],
          [14.5, 0.8],
        ] as ZoomWidthStops,
        secondaryWidth: [
          [8.2, 0.52],
          [11.2, 0.94],
          [14.5, 1.4],
        ] as ZoomWidthStops,
        secondaryOpacity: [
          [8.2, 0],
          [8.9, 0.36],
          [12, 0.52],
          [14.5, 0.64],
        ] as ZoomWidthStops,
        minorWidth: [
          [11.8, 0.34],
          [13.2, 0.68],
          [14.5, 0.98],
        ] as ZoomWidthStops,
        minorOpacity: [
          [11.8, 0],
          [12.4, 0.28],
          [14.5, 0.42],
        ] as ZoomWidthStops,
      },
      labels: {
        majorRoadMinZoom: 10.8,
        localRoadMinZoom: 12.8,
        majorRoadOpacity: [
          [10.8, 0],
          [11.4, 0.82],
          [14.5, 0.96],
        ] as ZoomWidthStops,
        localRoadOpacity: [
          [12.8, 0],
          [13.4, 0.62],
          [14.5, 0.82],
        ] as ZoomWidthStops,
      },
    } satisfies StreetDetailProfile,
  },
} as const;
