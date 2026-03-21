import type { FeatureCollection, Position, Polygon } from "geojson";

import type {
  MapCoordinates,
  MapDetailFocusGeometry,
} from "@/features/atlascope/map/core/types";

export function closePolygonRing(coordinates: MapCoordinates[]) {
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

export function createPolygonGeometry(coordinates: MapCoordinates[]): Polygon {
  return {
    type: "Polygon",
    coordinates: [closePolygonRing(coordinates)],
  };
}

export function createFocusGeometry(
  coordinates: MapCoordinates[],
): MapDetailFocusGeometry | null {
  if (coordinates.length < 3) {
    return null;
  }

  return createPolygonGeometry(coordinates);
}

export function getFocusGeometryOuterRings(
  geometry: MapDetailFocusGeometry,
): Position[][] {
  return geometry.type === "Polygon"
    ? geometry.coordinates[0]
      ? [geometry.coordinates[0]]
      : []
    : geometry.coordinates
        .map((polygon) => polygon[0])
        .filter((ring): ring is Position[] => Boolean(ring));
}

export function getFocusGeometryBounds(
  geometry: MapDetailFocusGeometry,
) {
  let minLongitude = Infinity;
  let maxLongitude = -Infinity;
  let minLatitude = Infinity;
  let maxLatitude = -Infinity;

  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

  polygons.forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach(([longitude, latitude]) => {
        minLongitude = Math.min(minLongitude, longitude);
        maxLongitude = Math.max(maxLongitude, longitude);
        minLatitude = Math.min(minLatitude, latitude);
        maxLatitude = Math.max(maxLatitude, latitude);
      });
    });
  });

  if (
    !Number.isFinite(minLongitude) ||
    !Number.isFinite(maxLongitude) ||
    !Number.isFinite(minLatitude) ||
    !Number.isFinite(maxLatitude)
  ) {
    return null;
  }

  return {
    minLongitude,
    maxLongitude,
    minLatitude,
    maxLatitude,
  };
}

export function createPolygonFeatureCollection(
  coordinates: MapCoordinates[],
): FeatureCollection<Polygon> {
  return {
    type: "FeatureCollection",
    features: coordinates.length >= 3
      ? [
          {
            type: "Feature",
            geometry: createPolygonGeometry(coordinates),
            properties: {},
          },
        ]
      : [],
  };
}
