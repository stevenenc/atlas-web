import type { ThemeMode } from "@/features/atlascope/config/theme";
import type { MapStyleDefinition } from "@/features/atlascope/map/map-provider";

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
  isActive: boolean;
};

export type MapGeofenceData = {
  id: string;
  title: string;
  coordinates: MapCoordinates[];
};

export type MapStyleConfig = string | MapStyleDefinition;

export type MapContainerProps = {
  markers: MapMarkerData[];
  geofences: MapGeofenceData[];
  focusedGeofenceCoordinates: MapCoordinates[] | null;
  focusedGeofenceNonce: number;
  drawingCoordinates: MapCoordinates[];
  isDrawingGeofence: boolean;
  editingCoordinates: MapCoordinates[];
  isEditingGeofence: boolean;
  isInteractionLocked?: boolean;
  activeLayers: HazardLayerVisibility;
  selectedMarkerId: string | null;
  viewport: MapViewportState;
  theme: ThemeMode;
  onViewportChange: (viewport: MapViewportState) => void;
  onMarkerClick: (marker: MapMarkerData) => void;
  onMapClick: (coordinates: MapCoordinates) => void;
  onDrawingCoordinateUpdate: (index: number, coordinates: MapCoordinates) => void;
  onDrawingCoordinateRemove: (index: number) => void;
  onEditingCoordinateAdd: (coordinates: MapCoordinates) => void;
  onEditingCoordinateUpdate: (index: number, coordinates: MapCoordinates) => void;
  onEditingCoordinateRemove: (index: number) => void;
};
