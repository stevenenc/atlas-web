import type { FeatureCollection, Polygon } from "geojson";

import type { MapCoordinates } from "@/features/atlascope/map/core/types";

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
