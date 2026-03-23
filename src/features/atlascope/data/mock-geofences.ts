import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";

export const mockGeofences: AtlascopeGeofence[] = [
  {
    id: "demo-manila",
    name: "Metro Manila",
    isEnabled: true,
    coordinates: [
      { longitude: 120.82, latitude: 14.33 },
      { longitude: 121.24, latitude: 14.33 },
      { longitude: 121.24, latitude: 14.78 },
      { longitude: 120.82, latitude: 14.78 },
    ],
  },
  {
    id: "demo-tokyo-bay",
    name: "Tokyo Bay",
    isEnabled: false,
    coordinates: [
      { longitude: 139.56, latitude: 35.34 },
      { longitude: 140.08, latitude: 35.34 },
      { longitude: 140.08, latitude: 35.78 },
      { longitude: 139.56, latitude: 35.78 },
    ],
  },
  {
    id: "demo-san-andreas",
    name: "San Andreas Zone",
    isEnabled: false,
    coordinates: [
      { longitude: -122.66, latitude: 36.55 },
      { longitude: -121.58, latitude: 36.55 },
      { longitude: -121.58, latitude: 37.39 },
      { longitude: -122.66, latitude: 37.39 },
    ],
  },
];
