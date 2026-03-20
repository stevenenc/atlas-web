import type { FeatureCollection, LineString, Point, Polygon } from "geojson";
import type { LayerProps } from "react-map-gl/maplibre";

import {
  getHazardTheme,
  getMapTheme,
  type ThemeMode,
} from "@/features/atlascope/config/theme";
import type {
  HazardLayerType,
  MapGeofenceData,
  MapMarkerData,
} from "@/features/atlascope/map/map-types";

type HazardFeatureProperties = {
  id: string;
  layerType: HazardLayerType;
  title: string;
};

type GeofenceFeatureProperties = {
  id: string;
  title: string;
};

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

function closePolygonRing(coordinates: MapGeofenceData["coordinates"]) {
  if (!coordinates.length) {
    return [];
  }

  const ring = coordinates.map((coordinate) => [
    coordinate.longitude,
    coordinate.latitude,
  ]);
  const first = ring[0];
  const last = ring[ring.length - 1];

  if (!first || !last) {
    return ring;
  }

  if (first[0] === last[0] && first[1] === last[1]) {
    return ring;
  }

  return [...ring, first];
}

export function createGeofenceSourceData(
  geofences: MapGeofenceData[],
): FeatureCollection<Polygon, GeofenceFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: geofences.map((geofence) => ({
      type: "Feature",
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
      },
    },
    {
      id: "geofence-line",
      type: "line",
      paint: {
        "line-color": geofence.stroke,
        "line-width": 1.3,
        "line-opacity": theme === "dark" ? 0.62 : 0.5,
      },
    },
  ];
}

export function createDraftGeofenceLineSourceData(
  coordinates: MapGeofenceData["coordinates"],
  closePath = false,
): FeatureCollection<LineString> {
  const lineCoordinates = coordinates.map((coordinate) => [
    coordinate.longitude,
    coordinate.latitude,
  ]);
  const closedLineCoordinates =
    closePath && lineCoordinates.length >= 3
      ? [...lineCoordinates, lineCoordinates[0] as [number, number]]
      : lineCoordinates;

  return {
    type: "FeatureCollection",
    features: coordinates.length >= 2
      ? [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: closedLineCoordinates,
            },
            properties: {},
          },
        ]
      : [],
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
      id: "draft-geofence-line",
      type: "line",
      paint: {
        "line-color": geofence.draftStroke,
        "line-width": 2.5,
        "line-dasharray": [1.2, 1.1],
        "line-opacity": 0.96,
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
