export type IncidentType = "earthquake" | "wildfire" | "air_quality";

export type IncidentSeverity = "Critical" | "High" | "Moderate";

export type Incident = {
  id: string;
  type: IncidentType;
  locationName: string;
  severity: IncidentSeverity;
  timestamp: string;
  x: number;
  y: number;
  whyThisAlert: string;
};
