import type { MapCoordinates } from "@/features/atlascope/map/map-types";

export type AtlascopeGeofence = {
  id: number;
  name: string;
  isEnabled: boolean;
  coordinates: MapCoordinates[];
};
