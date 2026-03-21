export type ZoomWidthStops = readonly [number, number][];

type RoadDetailZoomProfile = {
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

type RoadLabelDetailZoomProfile = {
  majorRoadMinZoom: number;
  localRoadMinZoom: number;
  majorRoadOpacity: ZoomWidthStops;
  localRoadOpacity: ZoomWidthStops;
};

type LanduseDetailZoomProfile = {
  parkMinZoom: number;
  woodMinZoom: number;
  residentialMinZoom: number;
  civicMinZoom: number;
  wetlandMinZoom: number;
  parkOpacity: ZoomWidthStops;
  woodOpacity: ZoomWidthStops;
  residentialOpacity: ZoomWidthStops;
  civicOpacity: ZoomWidthStops;
  wetlandOpacity: ZoomWidthStops;
};

type BoundaryDetailZoomProfile = {
  countryMinZoom: number;
  regionMinZoom: number;
  countryWidth: ZoomWidthStops;
  countryOpacity: ZoomWidthStops;
  regionWidth: ZoomWidthStops;
  regionOpacity: ZoomWidthStops;
};

type WaterLabelDetailZoomProfile = {
  pointMinZoom: number;
  lineMinZoom: number;
  pointOpacity: ZoomWidthStops;
  lineOpacity: ZoomWidthStops;
};

type MapDetailProfile = {
  roads: RoadDetailZoomProfile;
  roadLabels: RoadLabelDetailZoomProfile;
  landuse: LanduseDetailZoomProfile;
  boundaries: BoundaryDetailZoomProfile;
  waterLabels: WaterLabelDetailZoomProfile;
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
  },
  detailProfiles: {
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
      roadLabels: {
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
      landuse: {
        parkMinZoom: 7.2,
        woodMinZoom: 7.8,
        residentialMinZoom: 9.8,
        civicMinZoom: 12.6,
        wetlandMinZoom: 12.4,
        parkOpacity: [
          [7.2, 0],
          [8.4, 0.18],
          [12, 0.28],
          [14.5, 0.38],
        ] as ZoomWidthStops,
        woodOpacity: [
          [7.8, 0],
          [8.8, 0.14],
          [12, 0.24],
          [14.5, 0.32],
        ] as ZoomWidthStops,
        residentialOpacity: [
          [9.8, 0],
          [10.8, 0.08],
          [12.8, 0.16],
          [14.5, 0.22],
        ] as ZoomWidthStops,
        civicOpacity: [
          [12.6, 0],
          [13.2, 0.12],
          [14.5, 0.2],
        ] as ZoomWidthStops,
        wetlandOpacity: [
          [12.4, 0],
          [13, 0.14],
          [14.5, 0.24],
        ] as ZoomWidthStops,
      },
      boundaries: {
        countryMinZoom: 2.5,
        regionMinZoom: 7,
        countryWidth: [
          [2.5, 0.72],
          [6, 0.92],
          [12, 1.34],
        ] as ZoomWidthStops,
        countryOpacity: [
          [2.5, 0],
          [4.2, 0.44],
          [10, 0.58],
          [14.5, 0.66],
        ] as ZoomWidthStops,
        regionWidth: [
          [7, 0.36],
          [9.8, 0.58],
          [12.8, 0.82],
        ] as ZoomWidthStops,
        regionOpacity: [
          [7, 0],
          [8.2, 0.18],
          [10.8, 0.26],
          [14.5, 0.34],
        ] as ZoomWidthStops,
      },
      waterLabels: {
        pointMinZoom: 9.6,
        lineMinZoom: 11.8,
        pointOpacity: [
          [9.6, 0],
          [10.5, 0.38],
          [14.5, 0.54],
        ] as ZoomWidthStops,
        lineOpacity: [
          [11.8, 0],
          [12.8, 0.24],
          [14.5, 0.36],
        ] as ZoomWidthStops,
      },
    } satisfies MapDetailProfile,
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
          [8.2, 0.6],
          [11.2, 1.08],
          [14.5, 1.58],
        ] as ZoomWidthStops,
        secondaryOpacity: [
          [8.2, 0],
          [8.9, 0.48],
          [12, 0.64],
          [14.5, 0.78],
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
      roadLabels: {
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
      landuse: {
        parkMinZoom: 5.8,
        woodMinZoom: 6.2,
        residentialMinZoom: 8.8,
        civicMinZoom: 10.8,
        wetlandMinZoom: 11.6,
        parkOpacity: [
          [5.8, 0],
          [7, 0.24],
          [10.5, 0.38],
          [14.5, 0.5],
        ] as ZoomWidthStops,
        woodOpacity: [
          [6.2, 0],
          [7.4, 0.2],
          [10.8, 0.34],
          [14.5, 0.44],
        ] as ZoomWidthStops,
        residentialOpacity: [
          [8.8, 0],
          [9.8, 0.12],
          [12, 0.24],
          [14.5, 0.32],
        ] as ZoomWidthStops,
        civicOpacity: [
          [10.8, 0],
          [11.6, 0.2],
          [13.2, 0.3],
          [14.5, 0.38],
        ] as ZoomWidthStops,
        wetlandOpacity: [
          [11.6, 0],
          [12.2, 0.18],
          [14.5, 0.3],
        ] as ZoomWidthStops,
      },
      boundaries: {
        countryMinZoom: 2.5,
        regionMinZoom: 5,
        countryWidth: [
          [2.5, 0.75],
          [6, 1],
          [12, 1.5],
        ] as ZoomWidthStops,
        countryOpacity: [
          [2.5, 0],
          [4, 0.54],
          [10, 0.72],
          [14.5, 0.78],
        ] as ZoomWidthStops,
        regionWidth: [
          [5, 0.4],
          [9, 0.72],
          [12, 1.02],
        ] as ZoomWidthStops,
        regionOpacity: [
          [5, 0],
          [7, 0.24],
          [9.5, 0.36],
          [14.5, 0.5],
        ] as ZoomWidthStops,
      },
      waterLabels: {
        pointMinZoom: 8.6,
        lineMinZoom: 10.8,
        pointOpacity: [
          [8.6, 0],
          [9.4, 0.52],
          [14.5, 0.72],
        ] as ZoomWidthStops,
        lineOpacity: [
          [10.8, 0],
          [11.8, 0.42],
          [14.5, 0.62],
        ] as ZoomWidthStops,
      },
    } satisfies MapDetailProfile,
  },
} as const;
