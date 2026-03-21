import type { ThemeMode } from "@/features/atlascope/config/theme";

import type { MapStyleDefinition } from "./provider";

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

export type MapDetailContextMode = "overview" | "geofence-focus";

export const DETAIL_CONTEXT_TRANSITION_MS = 220;

export type MapDetailContext = {
  mode: MapDetailContextMode;
  focusFeatureId: string | null;
  focusFeatureIds: string[];
  focusGeometry: MapCoordinates[] | null;
  version: number;
};

export const DEFAULT_MAP_DETAIL_CONTEXT: MapDetailContext = {
  mode: "overview",
  focusFeatureId: null,
  focusFeatureIds: [],
  focusGeometry: null,
  version: 0,
};

export type MapContainerProps = {
  markers: MapMarkerData[];
  geofences: MapGeofenceData[];
  detailContext: MapDetailContext;
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
  onDrawingCoordinateAddAt: (index: number, coordinates: MapCoordinates) => void;
  onDrawingCoordinateUpdate: (index: number, coordinates: MapCoordinates) => void;
  onDrawingCoordinateRemove: (index: number) => void;
  onEditingCoordinateAdd: (coordinates: MapCoordinates) => void;
  onEditingCoordinateAddAt: (index: number, coordinates: MapCoordinates) => void;
  onEditingCoordinateUpdate: (index: number, coordinates: MapCoordinates) => void;
  onEditingCoordinateRemove: (index: number) => void;
};
