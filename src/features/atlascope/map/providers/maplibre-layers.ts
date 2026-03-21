import type { FeatureCollection, LineString, Point, Polygon } from "geojson";
import type { LayerProps } from "react-map-gl/maplibre";

import {
  getHazardTheme,
  getMapTheme,
  type ThemeMode,
} from "@/features/atlascope/config/theme";
import type {
  HazardLayerType,
  MapCoordinates,
  MapGeofenceData,
  MapDetailContext,
  MapMarkerData,
} from "@/features/atlascope/map/core/types";
import {
  closePolygonRing,
  getFocusGeometryOuterRings,
} from "@/features/atlascope/map/lib/geojson";
import {
  DETAIL_CONTEXT_PAINT_TRANSITION,
  hasFocusedDetailContext,
} from "@/features/atlascope/map/layers/detail-context";

type HazardFeatureProperties = {
  id: string;
  layerType: HazardLayerType;
  title: string;
};

type GeofenceFeatureProperties = {
  id: string;
  title: string;
};

type DraftGeofenceSegmentFeatureProperties = {
  segmentIndex: number;
};

type DraftGeofencePreviewStatus = "default" | "closing" | "invalid";

export function createHazardSourceData(
  markers: MapMarkerData[],
): FeatureCollection<Point, HazardFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: markers.map((marker) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [marker.coordinates.longitude, marker.coordinates.latitude],
      },
      properties: {
        id: marker.id,
        layerType: marker.layerType,
        title: marker.title,
      },
    })),
  };
}

export function createHazardLayers(theme: ThemeMode): LayerProps[] {
  return (["earthquake", "wildfire", "air_quality"] as HazardLayerType[]).flatMap(
    (layerType) => {
      const palette = getHazardTheme(layerType);
      const filter: ["==", ["get", "layerType"], HazardLayerType] = [
        "==",
        ["get", "layerType"],
        layerType,
      ];

      return [
        {
          id: `${layerType}-glow`,
          type: "circle",
          filter,
          paint: {
            "circle-radius": 28,
            "circle-color": palette.glow[theme],
            "circle-blur": 0.72,
          },
        },
        {
          id: `${layerType}-core`,
          type: "circle",
          filter,
          paint: {
            "circle-radius": 9,
            "circle-color": palette.accent,
            "circle-stroke-width": 1.5,
            "circle-stroke-color":
              theme === "dark" ? "rgba(255,255,255,0.22)" : "rgba(43,37,28,0.12)",
          },
        },
      ];
    },
  );
}

export function createGeofenceSourceData(
  geofences: MapGeofenceData[],
): FeatureCollection<Polygon, GeofenceFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: geofences.map((geofence) => ({
      type: "Feature",
      id: geofence.id,
      geometry: {
        type: "Polygon",
        coordinates: [closePolygonRing(geofence.coordinates)],
      },
      properties: {
        id: geofence.id,
        title: geofence.title,
      },
    })),
  };
}

export function createDetailContextMaskSourceData(
  focusGeometry: MapDetailContext["focusGeometry"],
): FeatureCollection<Polygon> {
  if (!focusGeometry) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  const focusRings = getFocusGeometryOuterRings(focusGeometry);

  if (!focusRings.length) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-179.9, -85],
              [179.9, -85],
              [179.9, 85],
              [-179.9, 85],
              [-179.9, -85],
            ],
            // The mask is a visual aid layered on top of the real profile
            // partitioning. AtlasScope geofences currently emit simple polygons,
            // so reversing outer rings is sufficient here.
            ...focusRings.map((ring) => [...ring].reverse()),
          ],
        },
        properties: {},
      },
    ],
  };
}

export function createGeofenceLayers(theme: ThemeMode): LayerProps[] {
  const {
    colors: { geofence },
  } = getMapTheme(theme);

  return [
    {
      id: "geofence-fill",
      type: "fill",
      paint: {
        "fill-color": geofence.fill,
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "focused"], false],
          theme === "dark" ? 0.16 : 0.12,
          theme === "dark" ? 0.1 : 0.075,
        ],
      },
    },
    {
      id: "geofence-line",
      type: "line",
      paint: {
        "line-color": [
          "case",
          ["boolean", ["feature-state", "focused"], false],
          geofence.selectedStroke,
          geofence.stroke,
        ],
        "line-width": [
          "case",
          ["boolean", ["feature-state", "focused"], false],
          2.2,
          1.3,
        ],
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "focused"], false],
          theme === "dark" ? 0.9 : 0.82,
          theme === "dark" ? 0.62 : 0.5,
        ],
      },
    },
  ];
}

export function createDetailContextMaskLayer(
  theme: ThemeMode,
  detailContext: MapDetailContext,
): LayerProps {
  const {
    colors: { detailContext: detailContextTheme },
  } = getMapTheme(theme);
  const outsideOpacity = hasFocusedDetailContext(detailContext)
    ? detailContext.mode === "geofence-focus"
      ? detailContextTheme.mask.outsideOpacity
      : 0
    : 0;

  return {
    id: "detail-context-mask",
    type: "fill",
    paint: {
      "fill-color": detailContextTheme.mask.outsideFill,
      "fill-opacity": outsideOpacity,
      "fill-opacity-transition": DETAIL_CONTEXT_PAINT_TRANSITION,
    },
  };
}

export function createDraftGeofenceLineSourceData(
  coordinates: MapGeofenceData["coordinates"],
  closePath = false,
  status: DraftGeofencePreviewStatus = "default",
  hiddenSegmentIndex: number | null = null,
): FeatureCollection<LineString, { status: DraftGeofencePreviewStatus }> {
  if (coordinates.length < 2) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  const features = coordinates.slice(0, -1).flatMap((coordinate, segmentIndex) => {
    if (segmentIndex === hiddenSegmentIndex) {
      return [];
    }

    const nextCoordinate = coordinates[segmentIndex + 1];

    if (!nextCoordinate) {
      return [];
    }

    return [
      {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [coordinate.longitude, coordinate.latitude],
            [nextCoordinate.longitude, nextCoordinate.latitude],
          ],
        },
        properties: {
          status,
        },
      },
    ];
  });

  if (
    closePath &&
    coordinates.length >= 3 &&
    hiddenSegmentIndex !== coordinates.length - 1
  ) {
    const lastPoint = coordinates[coordinates.length - 1];
    const firstPoint = coordinates[0];

    if (lastPoint && firstPoint) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [lastPoint.longitude, lastPoint.latitude],
            [firstPoint.longitude, firstPoint.latitude],
          ],
        },
        properties: {
          status,
        },
      });
    }
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

export function createDraftGeofenceProjectedLineSourceData(
  segments: Array<{
    start: MapCoordinates;
    end: MapCoordinates;
    status: DraftGeofencePreviewStatus;
  }>,
): FeatureCollection<LineString, { status: DraftGeofencePreviewStatus }> {
  if (!segments.length) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  return {
    type: "FeatureCollection",
    features: segments.map((segment) => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [segment.start.longitude, segment.start.latitude],
          [segment.end.longitude, segment.end.latitude],
        ],
      },
      properties: {
        status: segment.status,
      },
    })),
  };
}

export function createDraftGeofenceLineHitAreaSourceData(
  coordinates: MapGeofenceData["coordinates"],
  closePath = false,
): FeatureCollection<LineString, DraftGeofenceSegmentFeatureProperties> {
  if (coordinates.length < 2) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  const features = coordinates.slice(0, -1).map((coordinate, segmentIndex) => ({
    type: "Feature" as const,
    geometry: {
      type: "LineString" as const,
      coordinates: [
        [coordinate.longitude, coordinate.latitude],
        [
          coordinates[segmentIndex + 1]?.longitude ?? coordinate.longitude,
          coordinates[segmentIndex + 1]?.latitude ?? coordinate.latitude,
        ],
      ],
    },
    properties: {
      segmentIndex,
    },
  }));

  if (closePath && coordinates.length >= 3) {
    const lastPoint = coordinates[coordinates.length - 1];
    const firstPoint = coordinates[0];

    if (lastPoint && firstPoint) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [lastPoint.longitude, lastPoint.latitude],
            [firstPoint.longitude, firstPoint.latitude],
          ],
        },
        properties: {
          segmentIndex: coordinates.length - 1,
        },
      });
    }
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

export function createDraftGeofencePointSourceData(
  coordinates: MapGeofenceData["coordinates"],
): FeatureCollection<Point, { index: number }> {
  return {
    type: "FeatureCollection",
    features: coordinates.map((coordinate, index) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [coordinate.longitude, coordinate.latitude],
      },
      properties: {
        index,
      },
    })),
  };
}

export function createDraftGeofenceLayers(theme: ThemeMode): LayerProps[] {
  const {
    colors: { geofence },
  } = getMapTheme(theme);

  return [
    {
      id: "draft-geofence-line-hit-area",
      type: "line",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-width": 18,
        "line-color": "rgba(0, 0, 0, 0)",
      },
    },
    {
      id: "draft-geofence-confirmed-line",
      type: "line",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": [
          "match",
          ["get", "status"],
          "closing",
          geofence.draftValidStroke,
          "invalid",
          geofence.draftInvalidStroke,
          geofence.draftStroke,
        ],
        "line-width": 2.5,
        "line-opacity": 0.96,
      },
    },
    {
      id: "draft-geofence-projected-line",
      type: "line",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": [
          "match",
          ["get", "status"],
          "closing",
          geofence.draftValidStroke,
          "invalid",
          geofence.draftInvalidStroke,
          geofence.draftStroke,
        ],
        "line-width": 3.1,
        "line-dasharray": [
          "match",
          ["get", "status"],
          "closing",
          ["literal", [1, 0]],
          ["literal", [0.9, 1.8]],
        ],
        "line-opacity": 0.98,
      },
    },
    {
      id: "draft-geofence-points-hit-area",
      type: "circle",
      paint: {
        "circle-radius": 18,
        "circle-color": "rgba(0, 0, 0, 0)",
        "circle-stroke-width": 0,
      },
    },
    {
      id: "draft-geofence-points",
      type: "circle",
      paint: {
        "circle-radius": 5.5,
        "circle-color": geofence.draftHandleFill,
        "circle-stroke-color": geofence.selectedStroke,
        "circle-stroke-width": 2,
      },
    },
  ];
}
