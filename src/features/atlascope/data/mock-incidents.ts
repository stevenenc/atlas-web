import type { Incident } from "@/features/atlascope/types/atlascope";

export const incidents: Incident[] = [
  {
    id: "eq-manila-trench",
    type: "earthquake",
    locationName: "Manila Trench",
    severity: "High",
    timestamp: "12 minutes ago",
    coordinates: {
      longitude: 120.42,
      latitude: 14.09,
    },
    whyThisAlert:
      "Seismic activity exceeded the regional baseline and was detected near a high-population coastal corridor.",
  },
  {
    id: "wf-palawan-range",
    type: "wildfire",
    locationName: "Palawan Range",
    severity: "Critical",
    timestamp: "4 minutes ago",
    coordinates: {
      longitude: 118.54,
      latitude: 9.78,
    },
    whyThisAlert:
      "Heat signatures intensified over the last hour with wind conditions favoring rapid spread toward nearby communities.",
  },
  {
    id: "aq-metro-cebu",
    type: "air_quality",
    locationName: "Metro Cebu",
    severity: "Moderate",
    timestamp: "27 minutes ago",
    coordinates: {
      longitude: 123.89,
      latitude: 10.32,
    },
    whyThisAlert:
      "Particulate concentrations moved above healthy thresholds and are trending upward based on recent forecast conditions.",
  },
  {
    id: "eq-davao-gulf",
    type: "earthquake",
    locationName: "Davao Gulf",
    severity: "Moderate",
    timestamp: "41 minutes ago",
    coordinates: {
      longitude: 125.65,
      latitude: 6.71,
    },
    whyThisAlert:
      "A localized tremor cluster was detected in an active fault zone with moderate exposure to surrounding infrastructure.",
  },
  {
    id: "wf-sierra-madre",
    type: "wildfire",
    locationName: "Sierra Madre",
    severity: "High",
    timestamp: "9 minutes ago",
    coordinates: {
      longitude: 121.52,
      latitude: 16.42,
    },
    whyThisAlert:
      "Dry vegetation and elevated thermal readings indicate an expanding burn area along the ridge line.",
  },
];
