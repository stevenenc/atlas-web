import type { MapCoordinates } from "@/features/atlascope/map/core/types";

export type AtlascopeGeofence = {
  id: string;
  name: string;
  isEnabled: boolean;
  coordinates: MapCoordinates[];
};
