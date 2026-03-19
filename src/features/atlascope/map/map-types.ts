import type { ThemeMode } from "@/features/atlascope/config/theme";

export type HazardLayerType = "earthquake" | "wildfire" | "air_quality";

export type MapCoordinates = {
  longitude: number;
  latitude: number;
};

export type MapViewportState = MapCoordinates & {
  zoom: number;
  bearing: number;
  pitch: number;
};

export type HazardLayerVisibility = Record<HazardLayerType, boolean>;

export type MapMarkerData = {
  id: string;
  title: string;
  layerType: HazardLayerType;
  coordinates: MapCoordinates;
  severity: "Critical" | "High" | "Moderate";
  ageMinutes: number;
};

export type MapGeofenceData = {
  id: string;
  title: string;
  coordinates: MapCoordinates[];
};

export type MapStyleDefinition = {
  version: 8;
  sources: Record<string, unknown>;
  layers: Array<Record<string, unknown>>;
};

export type MapStyleConfig = string | MapStyleDefinition;

export type MapContainerProps = {
  markers: MapMarkerData[];
  geofences: MapGeofenceData[];
  drawingCoordinates: MapCoordinates[];
  isDrawingGeofence: boolean;
  activeLayers: HazardLayerVisibility;
  selectedMarkerId: string | null;
  viewport: MapViewportState;
  theme: ThemeMode;
  onViewportChange: (viewport: MapViewportState) => void;
  onMarkerClick: (marker: MapMarkerData) => void;
  onMapClick: (coordinates: MapCoordinates) => void;
  onDrawingCoordinateUpdate: (index: number, coordinates: MapCoordinates) => void;
};
