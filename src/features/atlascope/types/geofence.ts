import type { MapCoordinates } from "@/features/atlascope/map/core/types";

export type AtlascopeGeofence = {
  id: number;
  name: string;
  isEnabled: boolean;
  coordinates: MapCoordinates[];
};
