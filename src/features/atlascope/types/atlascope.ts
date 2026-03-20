import type {
  HazardLayerType,
  MapCoordinates,
} from "@/features/atlascope/map/core/types";

export type IncidentType = HazardLayerType;

export type IncidentSeverity = "Critical" | "High" | "Moderate";

export type Incident = {
  id: string;
  type: IncidentType;
  locationName: string;
  severity: IncidentSeverity;
  timestamp: string;
  startTime: string;
  endTime: string;
  coordinates: MapCoordinates;
  whyThisAlert: string;
};
