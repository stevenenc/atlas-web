import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
  Position,
} from "geojson";

import type { MapCoordinates } from "@/features/atlascope/map/core/types";
import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";

export type GeoFenceDto = {
  id: string;
  userId: string;
  name: string;
  geometryJson: string;
  updatedAtUtc: string;
};

type SupportedGeoFencePayload =
  | Polygon
  | MultiPolygon
  | Feature<Polygon | MultiPolygon>
  | FeatureCollection<Polygon | MultiPolygon>;

export function mapGeoFenceDtosToAtlascopeGeofences(
  geofences: GeoFenceDto[],
): AtlascopeGeofence[] {
  return geofences.map(mapGeoFenceDtoToAtlascopeGeofence);
}

export function mapGeoFenceDtoToAtlascopeGeofence(
  geofence: GeoFenceDto,
): AtlascopeGeofence {
  return {
    id: geofence.id,
    name: geofence.name,
    isEnabled: true,
    coordinates: extractPrimaryCoordinates(geofence.geometryJson),
  };
}

function extractPrimaryCoordinates(geometryJson: string) {
  const payload = JSON.parse(geometryJson) as SupportedGeoFencePayload;
  const geometry = unwrapGeometry(payload);

  if (!geometry) {
    throw new Error("The geofence geometry payload did not include a supported geometry.");
  }

  return geometry.type === "Polygon"
    ? toMapCoordinates(geometry.coordinates[0] ?? [])
    : toMapCoordinates(geometry.coordinates[0]?.[0] ?? []);
}

function unwrapGeometry(
  payload: SupportedGeoFencePayload,
): Polygon | MultiPolygon | null {
  if (payload.type === "Feature") {
    return payload.geometry;
  }

  if (payload.type === "FeatureCollection") {
    return payload.features[0]?.geometry ?? null;
  }

  return payload;
}

function toMapCoordinates(positions: Position[]): MapCoordinates[] {
  const normalizedPositions = stripClosingPosition(positions);

  return normalizedPositions
    .map((position) => {
      const [longitude, latitude] = position;

      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return null;
      }

      return {
        longitude,
        latitude,
      };
    })
    .filter((position): position is MapCoordinates => Boolean(position));
}

function stripClosingPosition(positions: Position[]) {
  if (positions.length < 2) {
    return positions;
  }

  const first = positions[0];
  const last = positions[positions.length - 1];

  if (
    first?.[0] === last?.[0] &&
    first?.[1] === last?.[1]
  ) {
    return positions.slice(0, -1);
  }

  return positions;
}
